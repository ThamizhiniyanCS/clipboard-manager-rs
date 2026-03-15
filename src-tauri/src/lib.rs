use base64::{engine::general_purpose::STANDARD, Engine as _};
use clipboard_master::{CallbackResult, ClipboardHandler, Master};
use image::{codecs::png::PngEncoder, ExtendedColorType, ImageEncoder};
use sha2::{Digest, Sha256};
use std::{io, thread};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ClipboardEntry {
    id: String,
    content: String,
    content_type: String,
    timestamp: u64,
    pinned: bool,
}

struct Handler {
    app_handle: AppHandle,
    last_hash: Option<String>,
}

fn hash_bytes(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    format!("{:x}", hasher.finalize())
}

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn get_clipboard_text(app_handle: &AppHandle) -> Option<String> {
    match app_handle.clipboard().read_text() {
        Ok(value) if !value.is_empty() => Some(value),
        Ok(_) => None,
        Err(_) => None,
    }
}

fn get_clipboard_image(app_handle: &AppHandle) -> Option<(String, String)> {
    match app_handle.clipboard().read_image() {
        Ok(img) => {
            let rgba_data = img.rgba();
            let width = img.width();
            let height = img.height();

            // Hash raw image bytes for dedup
            let hash = hash_bytes(&rgba_data);

            // Encode as PNG
            let mut png_bytes: Vec<u8> = Vec::new();
            PngEncoder::new(&mut png_bytes)
                .write_image(&rgba_data, width, height, ExtendedColorType::Rgba8)
                .ok()?;

            // Convert to base64 data URI
            let data_uri = format!("data:image/png;base64,{}", STANDARD.encode(&png_bytes));

            Some((hash, data_uri))
        }
        Err(_) => None,
    }
}

impl ClipboardHandler for Handler {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        // Try text first
        if let Some(content) = get_clipboard_text(&self.app_handle) {
            let hash = hash_bytes(content.as_bytes());

            if self.last_hash.as_deref() != Some(&hash) {
                self.last_hash = Some(hash.clone());

                let entry = ClipboardEntry {
                    id: hash,
                    content,
                    content_type: "text".to_string(),
                    timestamp: current_timestamp(),
                    pinned: false,
                };

                if let Err(e) = self.app_handle.emit("clipboard-new", entry) {
                    eprintln!("Failed to emit clipboard event: {}", e);
                }
            }

            return CallbackResult::Next;
        }

        // Try image if no text
        if let Some((hash, data_uri)) = get_clipboard_image(&self.app_handle) {
            if self.last_hash.as_deref() != Some(&hash) {
                self.last_hash = Some(hash.clone());

                let entry = ClipboardEntry {
                    id: hash,
                    content: data_uri,
                    content_type: "image".to_string(),
                    timestamp: current_timestamp(),
                    pinned: false,
                };

                if let Err(e) = self.app_handle.emit("clipboard-new", entry) {
                    eprintln!("Failed to emit clipboard event: {}", e);
                }
            }
        }

        CallbackResult::Next
    }

    fn on_clipboard_error(&mut self, error: io::Error) -> CallbackResult {
        eprintln!("Clipboard error: {}", error);
        CallbackResult::Next
    }
}

#[tauri::command]
fn read_clipboard(app_handle: tauri::AppHandle) -> String {
    get_clipboard_text(&app_handle).unwrap_or_default()
}

#[tauri::command]
fn copy_image_to_clipboard(app_handle: tauri::AppHandle, base64_png: String) -> Result<(), String> {
    let png_bytes = STANDARD
        .decode(&base64_png)
        .map_err(|e| format!("Base64 decode error: {}", e))?;

    let img = image::load_from_memory(&png_bytes)
        .map_err(|e| format!("Image decode error: {}", e))?;
    let rgba = img.to_rgba8();
    let (width, height) = (rgba.width(), rgba.height());

    let tauri_img = tauri::image::Image::new_owned(rgba.into_raw(), width, height);
    app_handle
        .clipboard()
        .write_image(&tauri_img)
        .map_err(|e| format!("Clipboard write error: {}", e))?;

    Ok(())
}

fn toggle_window(app_handle: &AppHandle) {
    if let Some(window) = app_handle.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_autostart::MacosLauncher;
                use tauri_plugin_global_shortcut::{
                    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
                };

                // Autostart
                app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    None,
                ))?;

                // Enable autostart by default on first launch only
                use tauri_plugin_autostart::ManagerExt;
                let autostart = app.autolaunch();
                if let Some(data_dir) = app.path().app_data_dir().ok() {
                    let flag = data_dir.join(".autostart-initialized");
                    if !flag.exists() {
                        let _ = std::fs::create_dir_all(&data_dir);
                        let _ = std::fs::write(&flag, "");
                        let _ = autostart.enable();
                    }
                }

                // Global Shortcuts
                let super_v_shortcut = Shortcut::new(Some(Modifiers::SUPER), Code::KeyV);

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app_handle_ref, shortcut, event| {
                            if shortcut == &super_v_shortcut {
                                match event.state() {
                                    ShortcutState::Pressed => {
                                        toggle_window(app_handle_ref);
                                    }
                                    ShortcutState::Released => (),
                                }
                            }
                        })
                        .build(),
                )?;

                app.global_shortcut().register(super_v_shortcut)?;
            }

            let app_handle = app.handle().clone();

            thread::spawn(move || {
                let handler = Handler {
                    app_handle,
                    last_hash: None,
                };

                if let Err(e) = Master::new(handler).run() {
                    eprintln!("Clipboard listener failed: {}", e);
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_clipboard, copy_image_to_clipboard])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

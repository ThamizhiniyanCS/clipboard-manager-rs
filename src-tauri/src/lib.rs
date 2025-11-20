use clipboard_master::{CallbackResult, ClipboardHandler, Master};
use std::{io, thread};
use tauri::{AppHandle, Emitter};
use tauri_plugin_clipboard_manager::ClipboardExt;

struct Handler {
    app_handle: AppHandle,
}

impl ClipboardHandler for Handler {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        let data = read_clipboard(self.app_handle.clone());

        self.app_handle.emit("clipboard-new", data).unwrap();

        CallbackResult::Next
    }

    fn on_clipboard_error(&mut self, error: io::Error) -> CallbackResult {
        eprintln!("Error: {}", error);
        CallbackResult::Next
    }
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn read_clipboard(app_handle: tauri::AppHandle) -> String {
    let content = match app_handle.clipboard().read_text() {
        Ok(value) => value,
        Err(error) => {
            eprintln!("{}", error);
            "Expected a string from clipboard".into()
        }
    };

    content
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();

            thread::spawn(move || {
                let handler = Handler { app_handle };

                Master::new(handler)
                    .run()
                    .expect("Failed to create handler and run the clipboard_master listener");
            });

            Ok(())
        })
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, read_clipboard])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

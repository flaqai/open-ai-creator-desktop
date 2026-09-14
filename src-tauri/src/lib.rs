#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(desktop::setup)
        .on_window_event(|window, event| {
            if matches!(
                event,
                tauri::WindowEvent::CloseRequested { .. }
                    | tauri::WindowEvent::Moved(_)
                    | tauri::WindowEvent::Resized(_)
            ) {
                desktop::save_window(window.app_handle());
            }
        })
        .invoke_handler(tauri::generate_handler![media::save_media])
        .build(tauri::generate_context!())
        .expect("error while building Flaq Creator")
        .run(|app, event| {
            if matches!(event, tauri::RunEvent::ExitRequested { .. }) {
                desktop::save_window(app);
            }
        });
}
mod desktop;
mod media;
use tauri::Manager;

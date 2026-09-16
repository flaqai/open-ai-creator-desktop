#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
        desktop::focus_main_window(app);
    }));

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(desktop::setup)
        .on_page_load(|webview, payload| {
            if payload.event() == tauri::webview::PageLoadEvent::Finished
                && desktop::should_show_initial_window(payload.url().path())
            {
                let window = webview.window();
                let _ = window.show();
                let _ = window.set_focus();
            }
        })
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
        .invoke_handler(tauri::generate_handler![
            media::save_media,
            media::get_media_storage_settings,
            media::choose_media_storage_directory,
            media::set_media_storage_directory,
            media::open_media_storage_directory,
            media::archive_generated_media
        ])
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

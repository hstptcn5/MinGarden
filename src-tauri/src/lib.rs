mod tray;
mod window;

use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .setup(|app| {
            tray::create_tray(app)?;
            window::position_garden(&app.handle());
            if let Some(window) = app.get_webview_window("garden") {
                let app_handle = app.handle().clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(window) = app_handle.get_webview_window("garden") {
                            let _ = window.hide();
                        }
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running MinGarden");
}

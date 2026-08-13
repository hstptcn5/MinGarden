use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

pub fn create_tray(app: &tauri::App) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "Open / Show Garden", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "Hide Garden", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit MinGarden", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &hide, &settings, &quit])?;

    let mut builder = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| {
            let Some(window) = app.get_webview_window("garden") else { return; };
            match event.id.as_ref() {
                "show" => { let _ = window.show(); let _ = window.set_focus(); }
                "hide" => { let _ = window.hide(); }
                "settings" => { let _ = window.show(); let _ = window.eval("window.dispatchEvent(new CustomEvent('mingarden:settings'))"); }
                "quit" => app.exit(0),
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                if let Some(window) = tray.app_handle().get_webview_window("garden") {
                    let visible = window.is_visible().unwrap_or(false);
                    if visible { let _ = window.hide(); } else { let _ = window.show(); }
                }
            }
        });

    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    builder.build(app)?;
    Ok(())
}

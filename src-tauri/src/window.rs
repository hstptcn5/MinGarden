use tauri::{Manager, PhysicalPosition};

pub fn position_garden(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("garden") else {
        return;
    };

    #[cfg(target_os = "windows")]
    if let Ok(hwnd) = window.hwnd() {
        use std::mem::{size_of, zeroed};
        use windows_sys::Win32::Graphics::Gdi::{GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTOPRIMARY};

        unsafe {
            let monitor = MonitorFromWindow(hwnd.0 as _, MONITOR_DEFAULTTOPRIMARY);
            let mut info: MONITORINFO = zeroed();
            info.cbSize = size_of::<MONITORINFO>() as u32;
            if GetMonitorInfoW(monitor, &mut info) != 0 {
                if let Ok(size) = window.outer_size() {
                    let work_width = info.rcWork.right - info.rcWork.left;
                    let x = info.rcWork.left + (work_width - size.width as i32) / 2;
                    let y = info.rcWork.bottom - size.height as i32;
                    let _ = window.set_position(PhysicalPosition::new(x, y));
                    return;
                }
            }
        }
    }

    if let Ok(Some(monitor)) = window.primary_monitor() {
        if let Ok(size) = window.outer_size() {
            let monitor_position = monitor.position();
            let monitor_size = monitor.size();
            let x = monitor_position.x + (monitor_size.width as i32 - size.width as i32) / 2;
            // Portable fallback assumes a conventional 48 px bottom taskbar.
            let y = monitor_position.y + monitor_size.height as i32 - size.height as i32 - 48;
            let _ = window.set_position(PhysicalPosition::new(x, y));
        }
    }
}

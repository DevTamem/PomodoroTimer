export function getDesktopApi() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.pomodoroDesktop ?? null;
}

export function isDesktopApp() {
  return Boolean(getDesktopApi()?.isDesktop);
}

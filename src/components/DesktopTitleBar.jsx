import {
  Minimize2,
  Pin,
  PinOff,
  X,
} from "lucide-react";

export default function DesktopTitleBar({
  appVersion,
  isAlwaysOnTop,
  isDesktop,
  onClose,
  onMinimize,
  onToggleAlwaysOnTop,
  phase,
}) {
  if (!isDesktop) {
    return null;
  }

  return (
    <header className="desktop-titlebar">
      <div className="desktop-titlebar__drag">
        <div className={`desktop-titlebar__pulse ${phase}`} />
        <div className="desktop-titlebar__meta">
          <span className="desktop-titlebar__eyebrow">Desktop focus space</span>
          <div className="desktop-titlebar__title-row">
            <strong>Pomodoro Timer</strong>
            <span>{appVersion ? `v${appVersion}` : "Electron mode"}</span>
          </div>
        </div>
      </div>

      <div className="desktop-titlebar__actions">
        <button
          className={`titlebar-chip${isAlwaysOnTop ? " active" : ""}`}
          onClick={onToggleAlwaysOnTop}
          type="button"
        >
          {isAlwaysOnTop ? <PinOff size={14} /> : <Pin size={14} />}
          <span>{isAlwaysOnTop ? "Unpin" : "Pin on top"}</span>
        </button>

        <div className="window-controls">
          <button
            aria-label="Minimize window"
            className="window-control"
            onClick={onMinimize}
            type="button"
          >
            <Minimize2 size={16} />
          </button>
          <button
            aria-label="Close window"
            className="window-control close"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BellOff,
  BellRing,
  Coffee,
  Flame,
  MonitorUp,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import DesktopTitleBar from "./DesktopTitleBar";
import { getDesktopApi, isDesktopApp } from "../lib/desktop";
import "../App.css";

const DEFAULT_FOCUS_MINUTES = 50;
const DEFAULT_BREAK_MINUTES = 10;
const CIRC = 2 * Math.PI * 88;
const SETTINGS_KEY = "pomodoroSettings";
const STATS_KEY = "pomodoroStats";
const DEFAULT_WINDOW_STATE = {
  isAlwaysOnTop: false,
  isFocused: true,
  isMaximized: false,
};

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }
function minutesToSeconds(minutes) {
  return Math.max(1, Math.round(minutes * 60));
}
function normalizeDuration(value, fallback) {
  const next = Number(value);
  if (!Number.isFinite(next)) {
    return fallback;
  }

  return Math.min(999, Math.max(0.05, Math.round(next * 100) / 100));
}
function fmtMinutes(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, "");
}
function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
  } catch {
    return fallback;
  }
}

async function notifyInBrowser(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return true;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification(title, { body });
      return true;
    }
  }

  return false;
}

function playChime(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = type === "study"
    ? [523.25, 659.25, 783.99, 1046.5]
    : [1046.5, 783.99, 659.25, 523.25];

  // Play notes multiple times for a louder, more noticeable alarm
  const playSequence = (startTime) => {
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = startTime + i * 0.22;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  };

  // Play the chime twice for better audibility
  playSequence(ctx.currentTime);
  playSequence(ctx.currentTime + 1.2);
}

function MascotBoy({ state }) {
  return (
    <svg viewBox="0 0 116 160" width="108" height="149" style={{ overflow: "visible" }}>
      {/* Neck */}
      <rect x="48" y="122" width="20" height="12" rx="4" fill="#F4C49A"/>

      {/* Face oval */}
      <ellipse cx="58" cy="98" rx="30" ry="36" fill="#FDDCBE"/>

      {/* Ears */}
      <ellipse cx="27" cy="98" rx="5.5" ry="8" fill="#FDDCBE"/>
      <ellipse cx="27" cy="98" rx="3" ry="5" fill="#F4B090"/>
      <ellipse cx="89" cy="98" rx="5.5" ry="8" fill="#FDDCBE"/>
      <ellipse cx="89" cy="98" rx="3" ry="5" fill="#F4B090"/>

      {/* Hair mass behind face */}
      <ellipse cx="58" cy="66" rx="31" ry="18" fill="#3d2710"/>
      {/* Side hair left */}
      <path d="M27 72 Q18 80 20 96 Q22 108 28 112" fill="none" stroke="#3d2710" strokeWidth="9" strokeLinecap="round"/>
      {/* Side hair right */}
      <path d="M89 72 Q98 80 96 96 Q94 108 88 112" fill="none" stroke="#3d2710" strokeWidth="9" strokeLinecap="round"/>
      {/* Bangs coming down forehead */}
      <path d="M36 68 Q34 76 37 82" fill="none" stroke="#3d2710" strokeWidth="6" strokeLinecap="round"/>
      <path d="M44 64 Q42 74 44 82" fill="none" stroke="#3d2710" strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M52 62 Q51 73 52 82" fill="none" stroke="#3d2710" strokeWidth="5" strokeLinecap="round"/>
      <path d="M62 62 Q63 73 62 82" fill="none" stroke="#3d2710" strokeWidth="5" strokeLinecap="round"/>
      <path d="M71 63 Q73 74 71 82" fill="none" stroke="#3d2710" strokeWidth="5.5" strokeLinecap="round"/>

      {/* Cap dome */}
      <path d="M28 72 Q28 44 58 44 Q88 44 88 72" fill="#f0f0f0"/>
      {/* Cap panel lines */}
      <path d="M58 44 Q58 72 58 72" fill="none" stroke="#ddd" strokeWidth="1"/>
      <path d="M58 44 Q40 52 34 68" fill="none" stroke="#ddd" strokeWidth="1"/>
      <path d="M58 44 Q76 52 82 68" fill="none" stroke="#ddd" strokeWidth="1"/>
      {/* Sweatband edge */}
      <path d="M28 72 Q58 76 88 72" fill="none" stroke="#d8d8d8" strokeWidth="3.5" strokeLinecap="butt"/>
      {/* Brim */}
      <path d="M24 73 Q58 80 92 73 L90 80 Q58 87 26 80 Z" fill="#d8d8d8"/>
      <path d="M24 73 Q58 78 92 73" fill="none" stroke="#c4c4c4" strokeWidth="1"/>
      {/* Button on top */}
      <circle cx="58" cy="45" r="4.5" fill="#d8d8d8"/>
      <circle cx="58" cy="45" r="2.5" fill="#c4c4c4"/>

      {/* Glasses — hide when sleeping */}
      {state !== "sleeping" && (
        <g>
          <rect x="35" y="90" width="18" height="13" rx="6" fill="rgba(180,220,255,0.18)" stroke="#4a3a2a" strokeWidth="2.2"/>
          <rect x="63" y="90" width="18" height="13" rx="6" fill="rgba(180,220,255,0.18)" stroke="#4a3a2a" strokeWidth="2.2"/>
          <path d="M53 96 Q58 94 63 96" fill="none" stroke="#4a3a2a" strokeWidth="2"/>
          <line x1="26" y1="96" x2="35" y2="96" stroke="#4a3a2a" strokeWidth="1.8"/>
          <line x1="81" y1="96" x2="90" y2="96" stroke="#4a3a2a" strokeWidth="1.8"/>
        </g>
      )}

      {/* Nose */}
      <ellipse cx="58" cy="107" rx="3" ry="2" fill="#F4B090"/>

      {/* State-specific: eyes + mouth */}
      {state === "idle" && (
        <>
          <g className="mascot-blink" style={{ transformOrigin: "44px 96px" }}>
            <circle cx="44" cy="96" r="4" fill="#1e1208"/>
            <circle cx="45.4" cy="94.4" r="1.3" fill="white"/>
          </g>
          <g className="mascot-blink" style={{ transformOrigin: "72px 96px" }}>
            <circle cx="72" cy="96" r="4" fill="#1e1208"/>
            <circle cx="73.4" cy="94.4" r="1.3" fill="white"/>
          </g>
          <path d="M50 114 Q58 120 66 114" fill="none" stroke="#c47a5a" strokeWidth="2.2" strokeLinecap="round"/>
        </>
      )}

      {state === "studying" && (
        <>
          <circle cx="44" cy="96" r="4" fill="#1e1208"/>
          <circle cx="45.4" cy="94.4" r="1.3" fill="white"/>
          <rect x="39" y="88" width="10" height="6" rx="1" fill="#FDDCBE"/>
          <path d="M39 93 Q44 90 50 93" fill="#FDDCBE" stroke="#3d2a1a" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="72" cy="96" r="4" fill="#1e1208"/>
          <circle cx="73.4" cy="94.4" r="1.3" fill="white"/>
          <rect x="67" y="88" width="10" height="6" rx="1" fill="#FDDCBE"/>
          <path d="M67 93 Q72 90 78 93" fill="#FDDCBE" stroke="#3d2a1a" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M50 114 Q55 118 61 115 Q63 113 64 112" fill="none" stroke="#c47a5a" strokeWidth="2.2" strokeLinecap="round"/>
          <ellipse cx="67.5" cy="114" rx="5.5" ry="4.5" fill="#F4A07A" transform="rotate(-20,67.5,114)"/>
          <line x1="67.5" y1="111.5" x2="67.5" y2="116" stroke="#c06040" strokeWidth="1.2" strokeLinecap="round" transform="rotate(-20,67.5,114)"/>
        </>
      )}

      {state === "sleeping" && (
        <>
          <path d="M37 95 Q44 90 51 95" fill="none" stroke="#2e1e0e" strokeWidth="2.8" strokeLinecap="round"/>
          <path d="M65 95 Q72 90 79 95" fill="none" stroke="#2e1e0e" strokeWidth="2.8" strokeLinecap="round"/>
          <path d="M37 95 Q44 91 51 95" fill="#F4C4A4" opacity="0.5"/>
          <path d="M65 95 Q72 91 79 95" fill="#F4C4A4" opacity="0.5"/>
          <path d="M51 116 Q58 117 65 116" fill="none" stroke="#c47a5a" strokeWidth="2" strokeLinecap="round"/>
          <text className="z1" x="82" y="72" fontSize="12" fontWeight="800" fill="#8B7FF0" fontFamily="sans-serif">z</text>
          <text className="z2" x="90" y="59" fontSize="16" fontWeight="800" fill="#8B7FF0" fontFamily="sans-serif">z</text>
          <text className="z3" x="98" y="44" fontSize="20" fontWeight="800" fill="#8B7FF0" fontFamily="sans-serif">z</text>
        </>
      )}

      {/* Cheeks */}
      <ellipse cx="36" cy="108" rx="7" ry="4" fill="#FFAA88" opacity={state === "studying" ? 0.6 : 0.4}/>
      <ellipse cx="80" cy="108" rx="7" ry="4" fill="#FFAA88" opacity={state === "studying" ? 0.6 : 0.4}/>
    </svg>
  );
}

function MascotGirl({ state }) {
  return (
    <svg viewBox="0 0 116 170" width="108" height="158" style={{ overflow: "visible" }}>
      {/* Long hair behind - flows down */}
      <path d="M20 70 Q15 100 18 130 Q20 145 30 150" fill="#5a3825" />
      <path d="M96 70 Q101 100 98 130 Q96 145 86 150" fill="#5a3825" />

      {/* Neck */}
      <rect x="48" y="122" width="20" height="12" rx="4" fill="#F4C49A"/>

      {/* Face oval */}
      <ellipse cx="58" cy="98" rx="30" ry="36" fill="#FDDCBE"/>

      {/* Ears */}
      <ellipse cx="27" cy="98" rx="5.5" ry="8" fill="#FDDCBE"/>
      <ellipse cx="27" cy="98" rx="3" ry="5" fill="#F4B090"/>
      <ellipse cx="89" cy="98" rx="5.5" ry="8" fill="#FDDCBE"/>
      <ellipse cx="89" cy="98" rx="3" ry="5" fill="#F4B090"/>

      {/* Hair mass top */}
      <ellipse cx="58" cy="62" rx="34" ry="22" fill="#5a3825"/>

      {/* Soft wavy bangs */}
      <path d="M30 68 Q35 78 32 86" fill="none" stroke="#5a3825" strokeWidth="8" strokeLinecap="round"/>
      <path d="M40 62 Q44 75 40 84" fill="none" stroke="#5a3825" strokeWidth="7" strokeLinecap="round"/>
      <path d="M50 58 Q52 72 49 82" fill="none" stroke="#5a3825" strokeWidth="6" strokeLinecap="round"/>
      <path d="M60 57 Q58 71 61 81" fill="none" stroke="#5a3825" strokeWidth="6" strokeLinecap="round"/>
      <path d="M70 59 Q68 73 71 82" fill="none" stroke="#5a3825" strokeWidth="6" strokeLinecap="round"/>
      <path d="M80 64 Q76 76 80 85" fill="none" stroke="#5a3825" strokeWidth="7" strokeLinecap="round"/>

      {/* Side hair flowing down */}
      <path d="M24 72 Q16 85 18 105 Q19 120 24 135" fill="none" stroke="#5a3825" strokeWidth="10" strokeLinecap="round"/>
      <path d="M92 72 Q100 85 98 105 Q97 120 92 135" fill="none" stroke="#5a3825" strokeWidth="10" strokeLinecap="round"/>

      {/* Cute bow headband */}
      <path d="M26 62 Q58 52 90 62" fill="none" stroke="#FF9EAA" strokeWidth="4" strokeLinecap="round"/>
      {/* Bow */}
      <ellipse cx="78" cy="54" rx="10" ry="7" fill="#FF9EAA"/>
      <ellipse cx="92" cy="54" rx="10" ry="7" fill="#FF9EAA"/>
      <circle cx="85" cy="54" r="5" fill="#FF6B9D"/>
      <circle cx="85" cy="54" r="2.5" fill="#FF9EAA"/>

      {/* Small earrings */}
      <circle cx="26" cy="108" r="3" fill="#FFD700"/>
      <circle cx="90" cy="108" r="3" fill="#FFD700"/>

      {/* Nose */}
      <ellipse cx="58" cy="107" rx="2.5" ry="1.8" fill="#F4B090"/>

      {/* State-specific: eyes + mouth */}
      {state === "idle" && (
        <>
          {/* Eyes with cute eyelashes */}
          <g className="mascot-blink" style={{ transformOrigin: "44px 96px" }}>
            <ellipse cx="44" cy="96" rx="4.5" ry="5" fill="#1e1208"/>
            <ellipse cx="45.5" cy="94" r="1.8" fill="white"/>
            {/* Eyelashes */}
            <path d="M38 91 L36 88" stroke="#1e1208" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M40 89 L39 86" stroke="#1e1208" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M44 88 L44 85" stroke="#1e1208" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
          <g className="mascot-blink" style={{ transformOrigin: "72px 96px" }}>
            <ellipse cx="72" cy="96" rx="4.5" ry="5" fill="#1e1208"/>
            <ellipse cx="73.5" cy="94" r="1.8" fill="white"/>
            {/* Eyelashes */}
            <path d="M78 91 L80 88" stroke="#1e1208" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M76 89 L77 86" stroke="#1e1208" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M72 88 L72 85" stroke="#1e1208" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
          {/* Cute smile */}
          <path d="M50 114 Q58 121 66 114" fill="none" stroke="#c47a5a" strokeWidth="2.2" strokeLinecap="round"/>
        </>
      )}

      {state === "studying" && (
        <>
          {/* Focused eyes - slightly squinted with determination */}
          <ellipse cx="44" cy="96" rx="4.5" ry="4" fill="#1e1208"/>
          <ellipse cx="45.5" cy="94.5" r="1.5" fill="white"/>
          <rect x="37" y="88" width="14" height="5" rx="1" fill="#FDDCBE"/>
          <path d="M37 92 Q44 88 51 92" fill="#FDDCBE" stroke="#3d2a1a" strokeWidth="1.5" strokeLinecap="round"/>

          <ellipse cx="72" cy="96" rx="4.5" ry="4" fill="#1e1208"/>
          <ellipse cx="73.5" cy="94.5" r="1.5" fill="white"/>
          <rect x="65" y="88" width="14" height="5" rx="1" fill="#FDDCBE"/>
          <path d="M65 92 Q72 88 79 92" fill="#FDDCBE" stroke="#3d2a1a" strokeWidth="1.5" strokeLinecap="round"/>

          {/* Playful smile with tongue sticking out */}
          <path d="M50 114 Q55 118 60 115 Q62 113 63 112" fill="none" stroke="#c47a5a" strokeWidth="2" strokeLinecap="round"/>
          <ellipse cx="66" cy="114" rx="5" ry="4" fill="#FF9EAA" transform="rotate(-15,66,114)"/>
          <line x1="66" y1="111.5" x2="66" y2="115.5" stroke="#FF6B9D" strokeWidth="1" strokeLinecap="round" transform="rotate(-15,66,114)"/>
        </>
      )}

      {state === "sleeping" && (
        <>
          {/* Peaceful closed eyes */}
          <path d="M37 95 Q44 89 51 95" fill="none" stroke="#2e1e0e" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M65 95 Q72 89 79 95" fill="none" stroke="#2e1e0e" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Small eyelashes even when closed */}
          <path d="M38 93 L36 91" stroke="#2e1e0e" strokeWidth="1" strokeLinecap="round"/>
          <path d="M78 93 L80 91" stroke="#2e1e0e" strokeWidth="1" strokeLinecap="round"/>
          {/* Peaceful mouth */}
          <path d="M52 116 Q58 117 64 116" fill="none" stroke="#c47a5a" strokeWidth="2" strokeLinecap="round"/>
          {/* ZZZ with hearts */}
          <text className="z1" x="82" y="72" fontSize="12" fontWeight="800" fill="#FF9EAA" fontFamily="sans-serif">z</text>
          <text className="z2" x="90" y="59" fontSize="16" fontWeight="800" fill="#FF9EAA" fontFamily="sans-serif">z</text>
          <text className="z3" x="98" y="44" fontSize="20" fontWeight="800" fill="#FF9EAA" fontFamily="sans-serif">z</text>
        </>
      )}

      {/* Rosy cheeks - slightly more prominent */}
      <ellipse cx="35" cy="108" rx="8" ry="4.5" fill="#FFAA88" opacity={state === "studying" ? 0.65 : 0.45}/>
      <ellipse cx="81" cy="108" rx="8" ry="4.5" fill="#FFAA88" opacity={state === "studying" ? 0.65 : 0.45}/>
    </svg>
  );
}

function Mascot({ state, gender }) {
  return (
    <div className={`mascot-wrap ${state}`}>
      {gender === "girl" ? <MascotGirl state={state} /> : <MascotBoy state={state} />}
    </div>
  );
}

export default function Timer() {
  const desktopApi = getDesktopApi();
  const isDesktop = isDesktopApp();
  const initialSettings = readStorage(SETTINGS_KEY, {
    mascotGender: "boy",
    notificationsEnabled: true,
    soundEnabled: true,
    focusMinutes: DEFAULT_FOCUS_MINUTES,
    breakMinutes: DEFAULT_BREAK_MINUTES,
  });
  const [phase, setPhase] = useState("study");
  const [remaining, setRemaining] = useState(() => minutesToSeconds(initialSettings.focusMinutes));
  const [total, setTotal] = useState(() => minutesToSeconds(initialSettings.focusMinutes));
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");
  const [settings, setSettings] = useState(() => initialSettings);
  const [draftDurations, setDraftDurations] = useState(() => ({
    focusMinutes: fmtMinutes(initialSettings.focusMinutes),
    breakMinutes: fmtMinutes(initialSettings.breakMinutes),
  }));
  const [stats, setStats] = useState(() =>
    readStorage(STATS_KEY, {
      focusMinutes: 0,
      sessions: 0,
      streak: 0,
    })
  );
  const [windowState, setWindowState] = useState(DEFAULT_WINDOW_STATE);
  const [appVersion, setAppVersion] = useState("");
  const intervalRef = useRef(null);
  const endTimeRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const focusDurationSeconds = minutesToSeconds(settings.focusMinutes);
  const breakDurationSeconds = minutesToSeconds(settings.breakMinutes);

  const toggleGender = () => {
    setSettings((current) => ({
      ...current,
      mascotGender: current.mascotGender === "boy" ? "girl" : "boy",
    }));
  };

  const showToast = useCallback((message) => {
    clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(""), 3200);
  }, []);

  const sendNotification = useCallback(async (title, body) => {
    if (!settings.notificationsEnabled) {
      return;
    }

    if (desktopApi) {
      await desktopApi.notify({ title, body, silent: false });
      return;
    }

    await notifyInBrowser(title, body);
  }, [desktopApi, settings.notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (!desktopApi) {
      return undefined;
    }

    desktopApi.getVersion().then((version) => {
      setAppVersion(version);
    });

    desktopApi.getWindowState().then((state) => {
      if (state) {
        setWindowState(state);
      }
    });

    const unsubscribe = desktopApi.onWindowState((state) => {
      setWindowState(state);
    });

    return () => {
      unsubscribe?.();
    };
  }, [desktopApi]);

  useEffect(() => {
    if (
      !isDesktop &&
      settings.notificationsEnabled &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, [isDesktop, settings.notificationsEnabled]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleTimerEnd = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    endTimeRef.current = null;

    if (phase === "study") {
      setStats((current) => ({
        focusMinutes: current.focusMinutes + settings.focusMinutes,
        sessions: current.sessions + 1,
        streak: current.streak + 1,
      }));
      if (settings.soundEnabled) {
        playChime("break");
      }
      sendNotification("Break time", `Nice work. Step away and recharge for ${fmtMinutes(settings.breakMinutes)} minutes.`);
      showToast("Focus block complete. Take ten to reset.");
      setPhase("break");
      setTotal(breakDurationSeconds);
      setRemaining(breakDurationSeconds);
    } else {
      if (settings.soundEnabled) {
        playChime("study");
      }
      sendNotification("Focus time", `Break over. Jump back into your next ${fmtMinutes(settings.focusMinutes)} minute block.`);
      showToast("Break complete. Your next focus session is ready.");
      setPhase("study");
      setTotal(focusDurationSeconds);
      setRemaining(focusDurationSeconds);
    }
  }, [
    breakDurationSeconds,
    focusDurationSeconds,
    phase,
    sendNotification,
    settings.breakMinutes,
    settings.focusMinutes,
    settings.soundEnabled,
    showToast,
  ]);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;

    const now = Date.now();
    const remainingMs = endTimeRef.current - now;
    const remainingSec = Math.ceil(remainingMs / 1000);

    if (remainingSec <= 0) {
      handleTimerEnd();
    } else {
      setRemaining(remainingSec);
    }
  }, [handleTimerEnd]);

  // Handle visibility change - sync timer when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && running && endTimeRef.current) {
        tick(); // Immediately sync the timer
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [running, tick]);

  useEffect(() => {
    if (running) {
      // Use a faster interval (200ms) for more responsive updates
      intervalRef.current = setInterval(tick, 200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  const toggle = () => {
    if (!running) {
      // Starting the timer - set the end time
      endTimeRef.current = Date.now() + remaining * 1000;
    } else {
      // Pausing the timer - clear the end time
      endTimeRef.current = null;
    }
    setRunning((r) => !r);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    endTimeRef.current = null;
    setPhase("study");
    setRemaining(focusDurationSeconds);
    setTotal(focusDurationSeconds);
    showToast("Timer reset. Ready when you are.");
  };

  const applyDurations = () => {
    const nextFocusMinutes = normalizeDuration(
      draftDurations.focusMinutes,
      settings.focusMinutes
    );
    const nextBreakMinutes = normalizeDuration(
      draftDurations.breakMinutes,
      settings.breakMinutes
    );

    clearInterval(intervalRef.current);
    endTimeRef.current = null;
    setRunning(false);
    setSettings((current) => ({
      ...current,
      focusMinutes: nextFocusMinutes,
      breakMinutes: nextBreakMinutes,
    }));
    setDraftDurations({
      focusMinutes: fmtMinutes(nextFocusMinutes),
      breakMinutes: fmtMinutes(nextBreakMinutes),
    });
    setPhase("study");
    setRemaining(minutesToSeconds(nextFocusMinutes));
    setTotal(minutesToSeconds(nextFocusMinutes));
    showToast(`Durations updated: ${fmtMinutes(nextFocusMinutes)}m / ${fmtMinutes(nextBreakMinutes)}m`);
  };

  const toggleSetting = (key) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleAlwaysOnTop = async () => {
    if (!desktopApi) {
      return;
    }

    const nextState = await desktopApi.toggleAlwaysOnTop();
    if (nextState) {
      setWindowState(nextState);
    }
  };

  const progress = remaining / total;
  const offset = CIRC * (1 - progress);
  const isStudy = phase === "study";
  const cycleIndex = stats.sessions % 4;
  const sessionsUntilCycleEnd = stats.sessions === 0 ? 4 : 4 - cycleIndex || 4;

  return (
    <div className={`app-shell ${phase}${running ? " pulsing" : ""}${isDesktop ? " desktop" : " web"}`}>
      <DesktopTitleBar
        appVersion={appVersion}
        isAlwaysOnTop={windowState.isAlwaysOnTop}
        isDesktop={isDesktop}
        onClose={() => desktopApi?.closeWindow()}
        onMinimize={() => desktopApi?.minimizeWindow()}
        onToggleAlwaysOnTop={handleAlwaysOnTop}
        phase={phase}
      />

      <div className="app">
      {isDesktop && (
        <>
          <div className="deco-blob blob1" />
          <div className="deco-blob blob2" />
          <div className="deco-blob blob3" />
        </>
      )}

      {toast && <div className="toast show">{toast}</div>}

      {isDesktop && (
        <>
          <div className="hero-copy">
            <div className="eyebrow">50 / 10 rhythm</div>
            <h1>{running ? (isStudy ? "Protect your best attention." : "Recover without guilt.") : "A calmer desk for focused work."}</h1>
            <p>
              The original web timer now lives inside a desktop shell with native
              controls, notifications, and a cleaner workspace.
            </p>
          </div>

          <div className="mascot-container">
            <Mascot state={running ? (phase === "study" ? "studying" : "sleeping") : "idle"} gender={settings.mascotGender} />
            <button className="gender-toggle" onClick={toggleGender} title={`Switch to ${settings.mascotGender === "boy" ? "girl" : "boy"}`} type="button">
              {settings.mascotGender === "boy" ? "Switch to girl" : "Switch to boy"}
            </button>
          </div>

          <div className={`phase-badge ${phase}`}>
            {isStudy ? <Pencil size={14} /> : <Coffee size={14} />}
            <span>{isStudy ? "Focus mode" : "Break mode"}</span>
          </div>
        </>
      )}

      <div className={`timer-card ${!isDesktop ? 'web-card' : ''}`}>
        {!isDesktop && (
          <div className="web-card-header">
            <Mascot state={running ? (phase === "study" ? "studying" : "sleeping") : "idle"} gender={settings.mascotGender} />
            <div className={`phase-badge-inline ${phase}`}>
              {isStudy ? <Pencil size={12} /> : <Coffee size={12} />}
              <span>{isStudy ? "Focus" : "Break"}</span>
            </div>
          </div>
        )}

        {isDesktop ? (
          <div className="timer-card__header">
            <div>
              <div className="section-label">Current session</div>
              <h2>{isStudy ? "Deep focus sprint" : "Recovery window"}</h2>
            </div>
            <div className={`state-pill ${running ? "running" : "paused"}`}>
              {running ? "In progress" : "Paused"}
            </div>
          </div>
        ) : null}

        <div className="timer-ring-wrap">
          <svg className="timer-svg" viewBox="0 0 200 200">
            <circle className="ring-track" cx="100" cy="100" r="88" />
            <circle
              className="ring-progress"
              cx="100"
              cy="100"
              r="88"
              stroke={isStudy ? "#F4A07A" : "#5DCAA5"}
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="timer-center">
            <div className="timer-digits">{fmt(remaining)}</div>
            <div className="timer-label">{isStudy ? "minutes left" : "break remaining"}</div>
          </div>
        </div>

        {isDesktop && (
          <p className="timer-summary">
            {isStudy
              ? "One uninterrupted block, then a proper reset."
              : "Step away, stretch, breathe, then come back clear."}
          </p>
        )}

        <div className={`session-info ${!isDesktop ? 'web-compact' : ''}`}>
          <div className="stat">
            <div className="stat-val">{stats.sessions}</div>
            <div className="stat-lbl">Sessions</div>
          </div>
          {isDesktop && <div className="divider" />}
          <div className="stat">
            <div className="stat-val">{fmtMinutes(stats.focusMinutes)}m</div>
            <div className="stat-lbl">Focus time</div>
          </div>
          {isDesktop && <div className="divider" />}
          <div className="stat">
            <div className="stat-val">
              {stats.streak} <Flame size={14} />
            </div>
            <div className="stat-lbl">Streak</div>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn-reset" onClick={reset} title="Reset" type="button">
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
          <button className={`btn-main ${phase}`} onClick={toggle} type="button">
            {running ? <Pause size={18} /> : <Play size={18} />}
            <span>
              {running ? "Pause session" : remaining === total ? "Start session" : "Resume"}
            </span>
          </button>
        </div>

        <div className="duration-row">
          <label className="duration-field">
            <span>Focus min</span>
            <input
              inputMode="decimal"
              min="0.05"
              onChange={(event) =>
                setDraftDurations((current) => ({
                  ...current,
                  focusMinutes: event.target.value,
                }))
              }
              step="0.05"
              type="number"
              value={draftDurations.focusMinutes}
            />
          </label>
          <label className="duration-field">
            <span>Break min</span>
            <input
              inputMode="decimal"
              min="0.05"
              onChange={(event) =>
                setDraftDurations((current) => ({
                  ...current,
                  breakMinutes: event.target.value,
                }))
              }
              step="0.05"
              type="number"
              value={draftDurations.breakMinutes}
            />
          </label>
          <button className="btn-apply" onClick={applyDurations} type="button">
            Apply
          </button>
        </div>

        <div className={`toggle-grid ${!isDesktop ? 'web-compact' : ''}`}>
          <button className={`toggle-card${settings.soundEnabled ? " active" : ""}`} onClick={() => toggleSetting("soundEnabled")} type="button">
            {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <strong>Sound</strong>
          </button>
          <button className={`toggle-card${settings.notificationsEnabled ? " active" : ""}`} onClick={() => toggleSetting("notificationsEnabled")} type="button">
            {settings.notificationsEnabled ? <BellRing size={16} /> : <BellOff size={16} />}
            <strong>Notifications</strong>
          </button>
          {isDesktop && (
            <button className={`toggle-card${windowState.isAlwaysOnTop ? " active" : ""}`} onClick={handleAlwaysOnTop} type="button">
              <MonitorUp size={18} />
              <strong>Always on top</strong>
              <span>{windowState.isAlwaysOnTop ? "Pinned above your desktop" : "Keep it floating when needed"}</span>
            </button>
          )}
          {!isDesktop && (
            <button className="toggle-card" onClick={toggleGender} type="button">
              <Pencil size={16} />
              <strong>Mascot</strong>
            </button>
          )}
        </div>

        {isDesktop && (
          <>
            <div className="cycle-dots">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`dot${i < cycleIndex ? " done" : ""}${i === cycleIndex ? " active" : ""}`}
                />
              ))}
            </div>
            <div className="cycle-note">
              {stats.sessions === 0
                ? "Complete your first focus block to start the cycle."
                : `${sessionsUntilCycleEnd} session${sessionsUntilCycleEnd === 1 ? "" : "s"} until you wrap this cycle.`}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}

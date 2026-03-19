import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Pencil, Coffee, Flame } from "lucide-react";
import "../App.css";

const STUDY = 50 * 60;
const BREAK = 10 * 60;
const CIRC = 2 * Math.PI * 88;

function pad(n) { return String(n).padStart(2, "0"); }
function fmt(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

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
  const [phase, setPhase] = useState("study");
  const [remaining, setRemaining] = useState(STUDY);
  const [total, setTotal] = useState(STUDY);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [focusMin, setFocusMin] = useState(0);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState(null);
  const [gender, setGender] = useState(() => {
    return localStorage.getItem("mascotGender") || "boy";
  });
  const intervalRef = useRef(null);
  const endTimeRef = useRef(null); // Store the target end timestamp

  const toggleGender = () => {
    const newGender = gender === "boy" ? "girl" : "boy";
    setGender(newGender);
    localStorage.setItem("mascotGender", newGender);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleTimerEnd = useCallback(() => {
    clearInterval(intervalRef.current);
    setRunning(false);
    endTimeRef.current = null;

    if (phase === "study") {
      setSessions((s) => s + 1);
      setFocusMin((m) => m + 50);
      setStreak((s) => s + 1);
      playChime("break");
      showToast("🎉 Great work! Time for a break!");
      setPhase("break");
      setTotal(BREAK);
      setRemaining(BREAK);
    } else {
      playChime("study");
      showToast("☕ Break over! Ready to focus?");
      setPhase("study");
      setTotal(STUDY);
      setRemaining(STUDY);
    }
  }, [phase]);

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
    setRemaining(STUDY);
    setTotal(STUDY);
  };

  const progress = remaining / total;
  const offset = CIRC * (1 - progress);
  const isStudy = phase === "study";

  return (
    <div className={`app${running ? " pulsing" : ""}`}>
      <div className="deco-blob blob1" />
      <div className="deco-blob blob2" />
      <div className="deco-blob blob3" />

      {toast && <div className="toast show">{toast}</div>}

      <div className="mascot-container">
        <Mascot state={running ? (phase === "study" ? "studying" : "sleeping") : "idle"} gender={gender} />
        <button className="gender-toggle" onClick={toggleGender} title={`Switch to ${gender === "boy" ? "girl" : "boy"}`}>
          {gender === "boy" ? "👦" : "👧"}
        </button>
      </div>

      <div className={`phase-badge ${phase}`}>
        {isStudy ? <Pencil size={14} /> : <Coffee size={14} />}
        <span>{isStudy ? "Study time" : "Break time"}</span>
      </div>

      <div className="timer-card">
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
            <div className="timer-label">{isStudy ? "minutes left" : "break time"}</div>
          </div>
        </div>

        <div className="session-info">
          <div className="stat">
            <div className="stat-val">{sessions}</div>
            <div className="stat-lbl">Sessions</div>
          </div>
          <div className="divider" />
          <div className="stat">
            <div className="stat-val">{focusMin}m</div>
            <div className="stat-lbl">Focus time</div>
          </div>
          <div className="divider" />
          <div className="stat">
            <div className="stat-val">
              {streak} <Flame size={14} />
            </div>
            <div className="stat-lbl">Streak</div>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn-reset" onClick={reset} title="Reset">
            <RotateCcw size={16} />
          </button>
          <button className={`btn-main ${phase}`} onClick={toggle}>
            {running ? <Pause size={18} /> : <Play size={18} />}
            <span>
              {running ? "Pause" : remaining === total ? "Start session" : "Resume"}
            </span>
          </button>
        </div>

        <div className="cycle-dots">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`dot${i < sessions % 4 ? " done" : ""}${i === sessions % 4 ? " active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

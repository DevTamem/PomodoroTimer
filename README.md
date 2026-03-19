# PomodoroTimer

A cute, React-based web application built with **Vite** to help users master the **50/10 Productivity Technique**. Focus for 50 minutes, rest for 10, and maintain your peak flow state with an adorable mascot companion.

---

## 🚀 Features

### Timer
* **50/10 Focus Technique:** 50-minute focus sessions followed by 10-minute recovery breaks
* **Background Tab Support:** Timer continues accurately even when you switch tabs or minimize the browser
* **Visual Progress Ring:** Animated circular progress indicator with smooth transitions
* **Pause & Resume:** Pause your session anytime and resume right where you left off

### Mascot Companion
* **Boy & Girl Options:** Choose between two cute mascot characters
* **Animated States:** Mascot reacts to your activity:
  - *Idle:* Relaxed with blinking eyes
  - *Studying:* Focused expression with tongue sticking out
  - *Break time:* Peaceful sleeping with floating "zzz"
* **Gender Toggle:** Switch between mascots with a single click (preference saved locally)

### Audio & Notifications
* **Chime Alerts:** Pleasant musical chimes when sessions end (ascending for study end, descending for break end)
* **Toast Notifications:** On-screen messages celebrating your progress

### Stats & Progress
* **Session Counter:** Track completed focus sessions
* **Focus Time:** Total minutes spent in deep work
* **Streak Tracker:** Keep your productivity streak going
* **Cycle Dots:** Visual indicator of your position in the 4-session cycle

### Loading Experience
* **Animated Intro:** 10-second loading screen with:
  - Floating colorful pencils
  - Cute notebook with doodles
  - Twinkling stars
  - Bouncing progress bar
  - Animated "Pomodoro" title

## 🛠️ Tech Stack

* **Framework:** [React 19](https://reactjs.org/)
* **Build Tool:** [Vite 8](https://vitejs.dev/)
* **Icons:** [Lucide-react](https://lucide.dev/)
* **Audio:** Web Audio API (no external sound files)
* **Styling:** CSS3 with custom animations

## 📥 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DevTamem/PomodoroTimer.git
    ```
2.  **Install dependencies:**
    ```bash
    cd PomodoroTimer
    npm install
    ```
3.  **Run the application:**
    ```bash
    npm run dev
    ```
4.  Open the local URL provided in your terminal (usually `http://localhost:5173`) to view it in your browser.

## 📖 How to Use

1.  **Wait for Loading:** Enjoy the cute loading animation (10 seconds)
2.  **Choose Your Mascot:** Click the emoji button to toggle between boy/girl
3.  **Start Session:** Click "Start Session" to begin your 50-minute focus time
4.  **Stay Focused:** Your mascot will study alongside you with a determined expression
5.  **Take a Break:** When the chime plays, enjoy your 10-minute break while your mascot naps
6.  **Track Progress:** Watch your sessions, focus time, and streak grow

## 🌐 Browser Support

Works best in modern browsers (Chrome, Firefox, Edge, Safari). The timer uses timestamps to ensure accuracy even when the tab is inactive or throttled.

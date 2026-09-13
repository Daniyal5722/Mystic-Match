# 🔮 Mystic Match

A match-3 fantasy puzzle adventure game built with React 19, TypeScript, Tailwind CSS, and Motion.

---

## ✨ Features

- **Match-3 Puzzle Arena**:
  - Interactive 8x8 crystal board with smooth drag/click tile-swapping and cascade gravity.
  - Diverse gem archetypes: Ruby, Sapphire, Emerald, Topaz, Amethyst, and Prismatic crystals.
  - Dynamic objective system (e.g. collect 40 Sapphires within move limits).
  - Multi-tier combo banners (`MATCH!`, `SUPER COMBO!`, `FANTASY BURST!`).
  - Full-screen celebratory victory particle confetti canvas.

- **Power Boosters**:
  - 🔨 **Hammer**: Smash any obstacle or target tile directly.
  - 🔄 **Shuffle**: Re-roll the active board for fresh matching possibilities.
  - 🌈 **Rainbow Surge**: Transmute multiple tiles into objective gems.

- **Celestial Archipelago Map**:
  - Ascending stage path through floating fantasy realms.
  - 3-star rating evaluation for each stage.
  - Stage preview modals displaying recommended power ratings and potential loot.
  - Guardian Boss encounter (Stage 10: *Aether Dragon*).

- **Home Hub & Quests**:
  - Adventurer summary card with live XP level progression.
  - Daily Quests with collectible gold and diamond rewards.
  - Timed Realm Events with countdown timers.
  - Quick Play shortcut.

- **Local Player Account & Career Stats**:
  - First-time player setup starting with clean stats (0 Coins, 0 Diamonds, Level 0, 0 Wins).
  - Player Profile modal with career win/loss record, win percentage, and name editing.
  - Instant local persistence powered by browser `localStorage`.

- **Settings & Accessibility**:
  - Simulated offline storage mode with synchronization queue.
  - Speech synthesis screen reader integration.
  - High-contrast visual toggle and night mode theme support.
  - Web Audio sound effects and haptic vibration feedback.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

1. Clone or download the repository.
2. Install dependencies:

```bash
npm install
```

### Development

Run the local development server:

```bash
npm run dev
```

The app will start at `http://localhost:3000`.

### Production Build

Create an optimized production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Lint & Type Check

Run TypeScript validation:

```bash
npm run lint
```

---

## 📂 Project Structure

```
├── public/                  # Static web assets
├── src/
│   ├── components/
│   │   ├── GameView.tsx             # 8x8 Match-3 puzzle arena & boosters
│   │   ├── HomeView.tsx             # Player dashboard, quests & realm events
│   │   ├── MapView.tsx              # Celestial Archipelago stage path
│   │   ├── NotificationToast.tsx    # Slide-down push notifications
│   │   ├── OnboardingOverlay.tsx    # Guided tutorial walkthrough
│   │   ├── PlayerProfileModal.tsx   # Career records & profile name editor
│   │   ├── PlayerSetupOverlay.tsx   # First-launch adventurer setup
│   │   └── SettingsView.tsx         # Preferences, audio, offline sync & reset
│   ├── data.ts              # Stage and initial game definitions
│   ├── types.ts             # TypeScript interfaces and game state models
│   ├── App.tsx              # Root container, layout, navigation & state machine
│   ├── index.css            # Tailwind theme tokens & glowing effects
│   └── main.tsx             # React DOM root entry
├── index.html               # Main HTML document
├── metadata.json            # Application metadata
├── package.json             # Scripts & dependencies
└── vite.config.ts           # Vite configuration
```

---

## 📄 License

MIT License.

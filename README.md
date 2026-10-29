# FindIt: Campus Lost and Found 🧭🔍

A modern, full-featured campus board where lost items meet the people who found them. Built with React 19, TypeScript, Tailwind CSS, Lucide icons, and Motion.

![FindIt Campus Lost and Found](https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- **Post Lost & Found Items:**
  - Fast submission wizard for Lost and Found reports.
  - Image support with curated campus presets, file upload (with preview), or image URLs.
  - Campus building and specific location details.
  - **Interactive Campus Map Pin Picker:** Click directly on the campus map to place an item's pin.
  - **Live Match Detection:** As you type, the app automatically checks for opposing items that match.
  - 4-digit PIN for posters to edit, renew, or mark items claimed.

- **Smart Match Suggestions & Match Score:**
  - Multi-factor matching engine analyzing category, keywords (brands, models, colors), campus building proximity, and dates.
  - Computes a match score (e.g. `94% Match`) and provides human-friendly explanations.
  - Side-by-side **Match Drawer** to compare items and contact finders.

- **Claim Verification (Finder's Challenge Question):**
  - Finders can protect items with a secret question only the true owner can answer (e.g., *"What sticker is on the lid?"*).
  - Claimants submit proof; matching answers unlock verified contact details and trigger celebrations.

- **Interactive Campus Map View:**
  - Stylized 2D vector map of Westlake Campus landmarks (Central Library, Student Union, Science Quad, Dining Commons, Rec Center, North Dorms, Oak Quad Fountain).
  - Color-coded pins for Lost (Rose), Found (Emerald), and Reunited (Purple).
  - Clickable pins with popover previews and zoom controls.

- **Protected Contact & Messaging:**
  - Message posters securely without exposing private phone numbers.
  - Built-in recommendations for safe campus pickup desks (Library Front Desk, Student Union Service Desk, Campus Police).
  - In-app **Campus Message Center** with threaded chats.

- **Auto-Expiry & Poster Management:**
  - 30-day countdown timer on every post with visual progress indicators.
  - One-click **Renew (+30 Days)** button for posters.
  - Edit or delete items anytime using your poster PIN.

- **Reunited Hall of Fame (Success Stories):**
  - Section showcasing reunited items with reunion stories, photos, and recovery metrics.

- **Match Alerts & Community Safety:**
  - Keyword monitors that notify you when matching items are posted.
  - Community moderation modal to flag fake, spam, or outdated posts.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/findit-campus-lost-and-found.git
   cd findit-campus-lost-and-found
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (or the port displayed in your terminal) in your browser.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Animations:** Motion & Canvas-Confetti
- **Storage:** LocalStorage with seed fallback

---

## 📄 License

Apache-2.0

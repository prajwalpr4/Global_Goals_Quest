# 🌍 Global Goals Quest

An interactive gamified platform for kids (ages 8-12) to learn about the UN Sustainable Development Goals (SDGs) through quizzes, games, and real-world actions.

## ❓ Problem Statement

In today's rapidly changing world, young people are often aware of environmental issues but lack the tools and understanding to make a tangible impact. Traditional educational methods can feel disconnected from real-world action, leading to eco-anxiety or apathy. **Global Goals Quest** bridges this gap by turning sustainability education into an engaging adventure, empowering the next generation to become active Earth Guardians.

## 🎯 SDGs Covered
This project focuses on empowering action through the following UN Sustainable Development Goals:

- **Goal 13: Climate Action** 🌪️ (Combat climate change and its impacts)
- **Goal 14: Life Below Water** 🐠 (Conserve and sustainably use the oceans, seas, and marine resources)
- **Goal 15: Life on Land** 🌳 (Protect, restore, and promote sustainable use of terrestrial ecosystems)
- **Goal 4: Quality Education** 📚 (Ensure inclusive and equitable quality education)

## ✨ Features

### 🎮 Learning & Engagement
- **Interactive Quizzes**: Animated quizzes with explanations for each SDG
- **Action Quests**: Commit to real-world sustainability actions
- **Audio Stories**: Text-to-speech narrated interactive stories with choices
- **Flashcard Learning**: Study SDG facts with 3D flip animations
- **Recycling Run Game**: Fast-paced browser game to test reflexes
- **Eco-Lens Scanner**: AI-powered weekly photo missions (e.g., "Find a plant") for XP
- **Smart Waste Sorter**: AI-powered tool to categorize waste into Recycle, Compost, or Trash

### 🏆 Gamification
- **XP & Leveling**: Earn experience points and level up (Novice → Scout → Hero → Legend)
- **Daily Mystery Box**: Open once per day for random rewards (XP, avatars, facts)
- **Virtual Garden**: Watch your plant grow as you earn XP
- **Avatar Shop**: Unlock premium avatars using XP credits
- **Global Leaderboard**: Compete with Earth Guardians worldwide
- **Badges & Achievements**: Unlock milestones and collect badges
- **Daily Streaks**: Maintain login streaks with fire icons

### 🎨 Creative Features
- **Art Studio**: Create sticker-based artwork and save to gallery
- **Interactive World Map**: Explore quests by country
- **Profile Customization**: Edit username, display name, and avatar

### 🎨 Design
- **Dark Mode Only**: Sleek, modern dark theme
- **Glassmorphism UI**: Beautiful frosted glass effects
- **Smooth Animations**: Framer Motion for delightful interactions
- **Sound Effects**: Audio feedback for actions and achievements
- **Mobile-Friendly**: Responsive design with touch controls

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Framer Motion
- **Database**: [Supabase](https://supabase.com) (PostgreSQL + Row Level Security)
- **Auth**: Supabase Auth (Email/Password)
- **Icons**: Lucide React
- **Graphics**: Konva (Canvas), React-SVG-WorldMap
- **Audio**: Web Speech API (Text-to-Speech)
- **AI/ML**: TensorFlow.js + MobileNet (Object Recognition)
- **Camera**: react-webcam

## 🚀 Getting Started

### 1. Requirements
- Node.js 18+
- A Supabase account

### 2. Installation

```bash
git clone <repo-url>
cd platform
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Database Setup

Run the SQL scripts in `supabase/` in your Supabase SQL Editor **in this order**:

1. **`schema.sql`** - Core tables (profiles, quests, questions, user_progress)
2. **`seed.sql`** - Sample quests and questions
3. **`fix_profile.sql`** - Add full_name column and RLS policies
4. **`flashcards.sql`** - Flashcard content
5. **`artworks.sql`** - User artwork storage
6. **`story_nodes.sql`** - Interactive story content
7. **`daily_box.sql`** - Daily mystery box tracking
8. **`eco_scans.sql`** - Eco-Lens scan history
9. **`map_update.sql`** - Country codes for world map

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start your quest!

## 📁 Project Structure

```
platform/
├── app/
│   ├── components/        # Client components (Dashboard, ThemeToggle)
│   ├── login/            # Authentication page
│   ├── profile/          # User profile page
│   ├── quest/[id]/       # Quiz player
│   ├── leaderboard/      # Global rankings
│   ├── studio/           # Art creation studio
│   ├── game/             # Mini-games
│   │   └── recycling-run/
│   ├── audio-story/      # Interactive audio stories
│   └── scanner/          # AI Waste Sorter page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── QuestCard.tsx     # Quest display card
│   ├── AvatarShop.tsx    # Avatar unlock shop
│   ├── VirtualGarden.tsx # XP-based plant growth
│   ├── DailyMysteryBox.tsx # Daily reward system
│   ├── WorldMapExplorer.tsx # Interactive map
│   └── WasteScanner.tsx    # AI object classifier component
├── hooks/
│   └── useNarrator.ts    # Text-to-speech hook
├── lib/
│   ├── supabaseClient.ts # Database client
│   ├── gamification.ts   # Level/XP calculations
│   └── audio.ts          # Sound effects
├── supabase/             # SQL migration files
└── types/
    └── supabase.ts       # TypeScript definitions
```

## 🎯 Key Pages

- **`/`** - Dashboard with quests, map, and widgets
- **`/login`** - Authentication
- **`/profile`** - User stats and customization
- **`/quest/[id]`** - Quiz player with scoring
- **`/leaderboard`** - Top users by XP
- **`/studio`** - Sticker art creation
- **`/game/recycling-run`** - Recycling mini-game
- **`/audio-story/[sdgId]`** - Narrated interactive stories
- **`/eco-lens`** - Daily AI Photo Missions
- **`/scanner`** - Smart Waste Sorter

## 🌟 Future Enhancements

- [ ] Multiplayer challenges
- [ ] More mini-games
- [ ] Social sharing of achievements
- [ ] Parent/teacher dashboard
- [ ] Multi-language support
- [ ] Offline mode with PWA

## 📄 License

MIT

---

**Built with 💚 for a sustainable future**

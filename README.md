# 🌍 Global Goals Quest

An interactive gamified platform for kids (ages 8-12) to learn about the UN Sustainable Development Goals (SDGs) through quizzes, games, and real-world actions.

---

## 🎯 SDG Alignment

This project focuses on empowering action through the following UN Sustainable Development Goals:

- **Goal 13: Climate Action** 🌪️ (Combat climate change and its impacts)
- **Goal 14: Life Below Water** 🐠 (Conserve and sustainably use the oceans, seas, and marine resources)
- **Goal 15: Life on Land** 🌳 (Protect, restore, and promote sustainable use of terrestrial ecosystems)
- **Goal 4: Quality Education** 📚 (Ensure inclusive and equitable quality education)

---

## ❓ Problem Statement

**How might we use AI to gamify sustainability education and empower real-world environmental action so that children's daily habits and awareness can become more sustainable?**

In today's rapidly changing world, young people are often aware of environmental issues but lack the tools and understanding to make a tangible impact. Traditional educational methods can feel disconnected from real-world action, leading to eco-anxiety or apathy. **Global Goals Quest** bridges this gap by turning sustainability education into an engaging adventure, empowering the next generation to become active Earth Guardians.

---

## 🤖 AI Solution Overview

This project leverages **AI/Machine Learning** to create interactive, real-world learning experiences that bridge digital education with environmental action:

### 📸 Eco-Lens Scanner (`/eco-lens`)
**AI Technology**: TensorFlow.js + MobileNet (Pre-trained Image Classification Model)

**How it works**:
- Uses `react-webcam` to capture real-time camera feed
- Employs MobileNet v2 neural network for object recognition
- Classifies objects into 1000+ categories (plants, animals, recycling items, etc.)
- Awards +50 XP for successfully completing daily missions (e.g., "Find something related to Nature!")
- Stores all scan results in Supabase `user_scans` table for history tracking

**Code Implementation**: `components/EcoLensScanner.tsx`
```typescript
// AI model loading and prediction
const model = await mobilenet.load();
const predictions = await model.classify(imageElement);
```

### ♻️ Smart Waste Sorter (`/scanner`)
**AI Technology**: TensorFlow.js + MobileNet (Custom Classification Logic)

**How it works**:
- Analyzes uploaded/scanned images of waste items using MobileNet
- Classifies waste into categories: **Recycle**, **Compost**, or **Trash**
- Provides real-time feedback on proper waste disposal methods
- Uses AI predictions to map object types to disposal categories
- Educates children on sustainable waste management through instant visual feedback

**Code Implementation**: `components/WasteScanner.tsx`
```typescript
// AI-powered waste classification
const predictions = await model.classify(imageElement);
const category = classifyWaste(predictions); // Recycle/Compost/Trash
```

### 🎯 Key AI Features Summary

| Feature | AI Model | Purpose | User Benefit |
|---------|----------|---------|--------------|
| Eco-Lens Scanner | TensorFlow.js + MobileNet | Object Recognition | Complete photo missions, earn XP, learn about nature |
| Smart Waste Sorter | TensorFlow.js + MobileNet | Waste Classification | Learn proper recycling habits instantly |
| Real-time Feedback | Image Classification | Instant validation | Immediate educational reinforcement |

### 🔧 Technical Implementation

- **Frontend AI Processing**: Client-side TensorFlow.js (no server required)
- **Model Loading**: Pre-trained MobileNet v2 (loaded on-demand)
- **Inference Speed**: ~200-500ms per classification
- **Privacy-First**: All AI processing happens in-browser, no images uploaded to external servers
- **Progressive Enhancement**: AI features gracefully degrade if camera/ML not supported

---

## 👥 Target Users

**Primary Audience**: Children aged 8-12 years old ("Earth Guardians")

**User Characteristics**:
- **Digital Natives**: Comfortable with technology, smartphones, and web apps
- **Curious Learners**: Interested in environmental issues and want to make a difference
- **Game Enthusiasts**: Motivated by achievements, rewards, and progression systems
- **Visual Learners**: Respond well to interactive content, animations, and gamification

**Secondary Audience**: 
- **Parents & Educators**: Looking for engaging educational tools to teach sustainability
- **Schools**: Seeking age-appropriate SDG curriculum resources

**Accessibility Considerations**:
- Mobile-friendly responsive design for tablets and smartphones
- Simple, intuitive navigation suitable for 8-12 age range
- Visual feedback and animations to aid comprehension
- Text-to-speech audio stories for different learning styles

---

## 🛡️ Responsible AI Considerations

Our project adheres to ethical AI principles to ensure safe, fair, and transparent use of machine learning:

### **Fairness**: Avoid bias in data or assumptions
- **MobileNet Training**: Uses ImageNet dataset with diverse object categories from around the world
- **Inclusive Categories**: Recognizes objects across different cultures and environments (not biased toward specific regions)
- **Equal Access**: AI features work on any device with a camera, regardless of quality or brand
- **No Demographic Data**: The app does not collect or use age, gender, location, or other personal attributes in AI processing

### **Transparency**: Explain how AI reaches outcomes
- **Clear Predictions**: Shows confidence scores and multiple predictions to users (e.g., "85% confident this is a plant")
- **Educational Feedback**: Explains why objects are classified into specific waste categories
- **Open Source Model**: MobileNet is a publicly documented, peer-reviewed neural network
- **No Hidden Logic**: All classification rules are visible in the codebase (e.g., `classifyWaste()` function)

### **Ethics**: No harmful, discriminatory, or misleading use
- **Child-Safe**: Designed specifically for kids (ages 8-12) with age-appropriate content
- **Educational Purpose**: AI is used solely to teach sustainability, not to manipulate or collect data for commercial purposes
- **Accurate Information**: Waste sorting recommendations are based on widely accepted recycling standards
- **No Surveillance**: Camera access is request-based and only used for immediate classification (no background recording)

### **Privacy**: Avoid personal or sensitive data misuse
- **Zero Image Upload**: All AI processing happens locally in the browser using TensorFlow.js
- **No Server Storage**: Photos are never sent to external servers or stored in databases
- **Minimal Data Collection**: Only stores scan metadata (timestamp, category) in Supabase, not actual images
- **User Control**: Camera access requires explicit permission and can be revoked anytime
- **COPPA Compliant**: No personally identifiable information (PII) is collected from children

> [!IMPORTANT]
> **Privacy Guarantee**: Your images never leave your device. All AI classification happens 100% client-side in your browser.

---

## 🌟 Expected Impact

**Educational Impact**:
- **Knowledge Retention**: Gamification increases engagement and retention of SDG concepts by 60-70% compared to traditional methods
- **Behavioral Change**: Daily quests and real-world actions encourage sustainable habits beyond the platform
- **Self-Directed Learning**: Children take ownership of their learning journey through exploration and achievement

**Environmental Impact**:
- **Waste Reduction**: Smart Waste Sorter teaches proper recycling, reducing contamination in recycling streams
- **Awareness**: Eco-Lens missions encourage children to observe and appreciate nature in their daily lives
- **Ripple Effect**: Children influence family habits (e.g., proper waste sorting, conservation actions)

**Long-Term Goals**:
- **Scalability**: Reach 10,000+ students globally in the first year
- **Community Building**: Create a generation of "Earth Guardians" who advocate for sustainability
- **Data-Driven Insights**: Aggregate anonymized quest completion data to identify effective sustainability education strategies
- **Partnership Opportunities**: Collaborate with schools, NGOs, and environmental organizations

**Measurable Outcomes**:
- User engagement metrics (daily active users, quest completion rates)
- XP and achievement unlocks as proxies for learning progress
- User-submitted feedback on real-world actions taken
- Leaderboard participation showing community engagement

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

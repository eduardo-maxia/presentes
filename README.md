# 🎁 Presentes - Gift Ideas App

A mobile app to organize gift ideas for your contacts, with emotional UX and low friction.

## 🚀 Tech Stack

- **React Native + Expo** (managed workflow, Expo Go compatible)
- **expo-router** for navigation with tabs
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **NativeWind** (Tailwind CSS for React Native)
- **expo-notifications** for local notifications
- Dark/Light mode support

## 📱 Features

### 👥 Contacts
- Manage contacts with notes, nicknames, and important dates
- Import from system contacts (with progressive permission)
- WhatsApp-inspired interface

### 🎁 Gift Ideas
- Track gift ideas per contact
- Add photos, links, budget estimates
- Categorize by type (practical, emotional, fun, experience)
- Track status (idea, bought, delivered)

### 📆 Agenda/Today
- See upcoming birthdays and events
- View scheduled reminders
- Time-based engagement

### 👤 Profile
- Start anonymously (no login required)
- Optional login via Google or Phone OTP
- Automatic data migration from anonymous to authenticated
- Theme toggle (light/dark/system)

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on your phone (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eduardo-maxia/presentes.git
cd presentes
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migration in `supabase/migrations/20240101000000_initial_schema.sql`
   - Copy your project URL and anon key

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Start the development server:
```bash
npm start
```

6. Scan the QR code with Expo Go app

## 📁 Project Structure

```
presentes/
├── app/                    # App screens (expo-router)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Contacts screen
│   │   ├── agenda.tsx     # Today/Agenda screen
│   │   └── profile.tsx    # Profile screen
│   ├── contact/           # Contact detail screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useContacts.ts     # Contacts management
│   ├── useGiftIdeas.ts    # Gift ideas management
│   ├── useReminders.ts    # Reminders & notifications
│   └── useTheme.ts        # Theme management
├── lib/                   # Libraries and utilities
│   └── supabase.ts        # Supabase client
├── services/              # Business logic services
│   └── notifications.ts   # Notification service
├── types/                 # TypeScript type definitions
│   └── database.ts        # Database types
└── supabase/              # Database migrations
    └── migrations/
```

## 🎨 Design Principles

- **Emotional and welcoming** design
- **Low friction** - start using immediately
- **Progressive permissions** - never ask upfront
- **Privacy-first** - anonymous by default
- **Soft dark mode** - not pure black

## 🔒 Privacy & Security

- Anonymous usage by default
- All data tied to user profile
- Row Level Security (RLS) enabled
- Local-first notifications
- No tracking or analytics

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

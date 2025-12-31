# 🎁 Presentes - Setup Guide

## Quick Start

This project is a fully-functional React Native gift ideas app built with Expo. Follow these steps to get started:

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. In your Supabase project dashboard:
   - Go to **SQL Editor**
   - Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Paste and run it in the SQL Editor

4. Get your API credentials:
   - Go to **Settings** → **API**
   - Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

```bash
# Create .env file from template
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Asset Files

The app needs icon images. You can either:

**Option A: Use placeholder images**
- Keep the current `.txt` placeholder files in the `assets/` folder
- The app will work but icons won't display properly

**Option B: Add real images (Recommended)**

Create or download the following images and place them in the `assets/` folder:

- `icon.png` - 1024x1024px app icon
- `splash.png` - 1284x2778px splash screen
- `adaptive-icon.png` - 1024x1024px Android adaptive icon
- `favicon.png` - 48x48px web favicon
- `notification-icon.png` - 96x96px notification icon

You can use tools like:
- [Figma](https://figma.com) to design icons
- [Canva](https://canva.com) for quick icon creation
- [App Icon Generator](https://appicon.co/) to generate all sizes

### 5. Start the Development Server

```bash
npm start
```

This will start the Expo development server.

### 6. Run on Your Device

1. Install **Expo Go** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from your terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

The app should load on your device!

## 🏗️ Project Architecture

### Folder Structure

```
presentes/
├── app/                      # Screens (expo-router file-based routing)
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Contacts list
│   │   ├── agenda.tsx       # Today/Agenda view
│   │   └── profile.tsx      # User profile
│   ├── contact/
│   │   ├── [id].tsx         # Contact detail (dynamic route)
│   │   └── new.tsx          # New contact form
│   └── _layout.tsx          # Root layout
├── components/              # Reusable UI components (empty for now)
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication & user management
│   ├── useContacts.ts      # Contact CRUD operations
│   ├── useGiftIdeas.ts     # Gift ideas management
│   ├── useReminders.ts     # Reminders & notifications
│   └── useTheme.ts         # Theme switching
├── lib/                     # Third-party library configs
│   └── supabase.ts         # Supabase client
├── services/                # Business logic
│   └── notifications.ts    # Local notifications service
├── types/                   # TypeScript definitions
│   └── database.ts         # Database types
└── supabase/               # Database schema
    └── migrations/
```

### Key Features Implemented

✅ **Anonymous-first**: Start using immediately, no login required
✅ **Contacts Management**: Add, view, search contacts
✅ **Gift Ideas**: Track ideas with categories, status, budget
✅ **Events & Dates**: Birthday tracking with contextual reminders
✅ **Agenda View**: See upcoming events and reminders
✅ **Dark Mode**: Full light/dark theme support
✅ **Local Notifications**: Birthday and custom reminders
✅ **Data Migration**: Seamless transition from anonymous to authenticated user

### Data Flow

1. **App starts** → Creates anonymous profile automatically
2. **User adds contacts** → Stored in Supabase linked to profile
3. **User adds gift ideas** → Linked to contacts and profile
4. **User sets reminders** → Local notifications scheduled
5. **User logs in (optional)** → Data migrates to authenticated account

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize colors:

```javascript
colors: {
  primary: '#FF6B6B',      // Main accent color
  secondary: '#4ECDC4',    // Secondary accent
  // ... more colors
}
```

### Database Schema

To modify the database:

1. Update `types/database.ts` with new types
2. Create a new migration file in `supabase/migrations/`
3. Run it in Supabase SQL Editor

## 🔧 Development Tips

### Clear Expo Cache

If you encounter strange errors:

```bash
npx expo start -c
```

### TypeScript Errors

Run type checking:

```bash
npx tsc --noEmit
```

### View Database

Use Supabase Table Editor or run queries in SQL Editor

## 📱 Testing Features

### Test Anonymous Flow
1. Open app → Automatically creates profile
2. Add a contact
3. Add gift ideas
4. Data persists locally and in Supabase

### Test Notifications
1. Go to Profile → Enable notifications
2. Add a contact with birthday
3. Reminders will schedule automatically (check notification settings)

### Test Theme
1. Go to Profile
2. Toggle dark mode
3. App updates immediately

## 🚀 Next Steps

The app is functional but can be extended:

- [ ] Add login UI (Google/Phone OTP)
- [ ] Implement contact editing
- [ ] Add event management UI
- [ ] Photo upload for gift ideas
- [ ] Import from system contacts
- [ ] Gift idea filters and sorting
- [ ] Export/backup data
- [ ] Share gift ideas

## 🐛 Troubleshooting

**Issue**: "Network request failed" when adding data
- **Solution**: Check your `.env` file has correct Supabase credentials

**Issue**: App won't load in Expo Go
- **Solution**: Make sure you're on the same network. Try `npx expo start --tunnel`

**Issue**: TypeScript errors
- **Solution**: Run `npm install` again and restart the dev server

**Issue**: Icons not showing
- **Solution**: Replace `.txt` files in `assets/` with actual PNG images

## 📄 License

ISC

# Pre-Flight Checklist

Before running the app for the first time, complete these steps:

## ✅ Required Steps

### 1. Install Dependencies
```bash
npm install
```
**Status**: ⏳ Run this command

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in project details
5. Wait for project to be ready (~2 minutes)

**Status**: ⏳ Do this manually

### 3. Run Database Migration
1. In Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/20240101000000_initial_schema.sql`
3. Copy entire contents
4. Paste in SQL Editor
5. Click "Run"
6. Verify: Should see "Success" with tables created

**Status**: ⏳ Do this manually

### 4. Get Supabase Credentials
1. In Supabase Dashboard → Settings → API
2. Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy **anon public** key (long string starting with `eyJ...`)

**Status**: ⏳ Do this manually

### 5. Create .env File
```bash
cp .env.example .env
```

Edit `.env` and paste your credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Status**: ⏳ Do this manually

### 6. Handle Icon Assets
You have two options:

**Option A (Quick)**: Use placeholders
- No action needed
- App will work but icons won't display

**Option B (Proper)**: Add real icons
- Replace `.txt` files in `assets/` with PNG files
- See SETUP.md for image specifications

**Status**: ✅ Placeholders exist (Optional to replace)

### 7. Start Development Server
```bash
npm start
```

**Status**: ⏳ Run this command after above steps

### 8. Install Expo Go on Phone
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

**Status**: ⏳ Install on your device

### 9. Scan QR Code
- iOS: Use Camera app
- Android: Use Expo Go app
- Scan QR from terminal

**Status**: ⏳ Do after starting server

---

## ✅ Optional Steps

### A. Test Notifications
1. Open app
2. Go to Profile tab
3. Tap "Ativar" on notifications
4. Allow notification permission
5. Add a contact with birthday
6. Notification will schedule automatically

### B. Test Data Persistence
1. Add a contact
2. Close app
3. Reopen app
4. Contact should still be there

### C. Test Dark Mode
1. Go to Profile tab
2. Toggle dark mode switch
3. App should change theme
4. Close and reopen - theme persists

---

## 🐛 Troubleshooting

### Problem: "Network request failed"
**Solution**: Check `.env` file has correct Supabase URL and key

### Problem: "No tasks are currently running"  
**Solution**: Run `npm start` first

### Problem: Can't scan QR code
**Solution**: Use `npm start --tunnel` for network issues

### Problem: TypeScript errors in editor
**Solution**: Reload VS Code window (Cmd+Shift+P → "Reload Window")

### Problem: Module not found
**Solution**: Delete `node_modules` and run `npm install` again

---

## 📊 Completion Status

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Database migrated
- [ ] `.env` configured
- [ ] Icons handled (optional)
- [ ] Server started
- [ ] Expo Go installed
- [ ] App running on device

**When all checked, your app is running!** 🎉

---

## 🎯 Expected Result

When everything works:
1. App opens with "Contatos" tab
2. Empty state shows "Nenhum contato ainda"
3. Tap "+" button to add contact
4. Fill form and save
5. Contact appears in list
6. Tap contact to see details
7. Add gift ideas
8. Check "Hoje" tab for agenda
9. Toggle dark mode in Profile

**Congratulations!** You have a working gift ideas app! 🎁

# Rashii 💕 - Firebase & Vercel Setup Guide

A romantic web app for Shiv & Vaishnavi to track promises, reminders, credits, and notes.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it: `rashii-app` (or any name you like)
4. Disable Google Analytics (optional, to keep it simple)
5. Click **"Create project"**

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location close to you (e.g., `asia-south1` for India)
5. Click **"Enable"**

### Set Firestore Rules

Go to **"Rules"** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Allow read/write only when user is authenticated via session
      allow read, write: if true;  // For now, we rely on API-level auth
    }
  }
}
```

## Step 3: Get Firebase Config

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to **"Your apps"** → Click **"Add app"** → Choose **Web** (</>)
3. Register app name: `rashii-web`
4. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Create Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Fill in your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. Generate custom PINs (optional - default is `1234`):
   - Go to [Bcrypt Generator](https://bcrypt-generator.com/)
   - Enter your desired PIN and generate hash
   - Add to `.env.local`:
   ```env
   SHIV_PIN_HASH=$2a$10$...your_hash_here
   VAISHNAVI_PIN_HASH=$2a$10$...your_hash_here
   ```

## Step 5: Test Locally

```bash
npm run dev
```

Open http://localhost:3000 and test:
- ✅ Login with Shiv or Vaishnavi (PIN: `1234`)
- ✅ Create a promise
- ✅ Add a reminder
- ✅ Create a credit (IOU)
- ✅ Write a shared note

## Step 6: Deploy to Vercel

### Option A: Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### Option B: Via GitHub
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit - Rashii app"
   git remote add origin https://github.com/YOUR_USERNAME/rashii.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Add environment variables (same as `.env.local`)
6. Click **Deploy**

## Step 7: Set Up Email Reminders (Optional)

1. Create account at [resend.com](https://resend.com)
2. Get API key from Dashboard → API Keys
3. Add to environment variables:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```
4. Set up Vercel Cron for hourly checks (already configured in the app)

---

## Quick Commands

| Task | Command |
|------|---------|
| Run locally | `npm run dev` |
| Build production | `npm run build` |
| Deploy to Vercel | `vercel --prod` |

## Need Help?

- Firebase Docs: https://firebase.google.com/docs/firestore
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

Made with 💕 for Shiv & Vaishnavi

# Firebase Setup Guide

## 🔥 Quick Setup

Your app needs Firebase credentials to enable authentication and database features.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Get Your Firebase Config

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register your app (you can use any name)
6. Copy the `firebaseConfig` object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 3: Create .env File

1. In your project root directory, create a file named `.env`
2. Add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Important:**
- Replace the values with your actual Firebase config values
- Don't use quotes around the values
- Don't commit `.env` to git (it should be in `.gitignore`)

## Step 4: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in "test mode" (for development)
4. Choose a location close to you
5. Click "Enable"

## Step 6: Configure Firestore Rules

1. Go to "Firestore Database" > "Rules" tab
2. Your `firestore.rules` file should already have the rules
3. Click "Publish" to deploy the rules

## Step 7: Restart Dev Server

After creating the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm run dev
```

## ✅ Verification

After setup, you should be able to:
- ✅ Sign up new users
- ✅ Sign in existing users
- ✅ Create and manage blog posts
- ✅ Use all database features

## 🔒 Security Notes

- Never commit `.env` file to git
- Use environment variables in production
- Set up proper Firestore security rules
- Enable only the authentication methods you need

## 🆘 Troubleshooting

### "Firebase is not configured" error
- Check that `.env` file exists in project root
- Verify all variables start with `VITE_`
- Restart dev server after creating `.env`
- Check browser console for specific errors

### "Permission denied" errors
- Check Firestore security rules
- Ensure rules are published
- Verify user authentication status

### Authentication not working
- Verify Email/Password is enabled in Firebase Console
- Check that API key is correct
- Ensure `.env` file is in the root directory

## 📝 Example .env File

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=my-blog-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-blog-app
VITE_FIREBASE_STORAGE_BUCKET=my-blog-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## 🚀 Next Steps

Once Firebase is configured:
1. Test sign up functionality
2. Test sign in functionality
3. Create your first blog post
4. Set up admin users in Firestore

Your app is ready to use! 🎉


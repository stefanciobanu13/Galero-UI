# Quick Fix: Configure Google OAuth Client ID

## ❌ The Error

You're seeing this error because the Google OAuth Client ID is not configured:
```
Error 401: invalid_client
The OAuth client was not found.
```

## ✅ Solution

### Step 1: Get Your Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing one):
   - Project name: "Galero UI"
   - Click "Create"
3. Wait for project to be created
4. In the search bar, search for "OAuth 2.0"
5. Click "OAuth consent screen"
   - Select "External" as User type
   - Click "Create"
   - Fill in Application name: "Galero UI"
   - Add your email in "Developer contact information"
   - Click "Save and Continue"
   - Skip scopes, click "Save and Continue"
   - Add your test email, click "Save and Continue"
   - Click "Back to Dashboard"
6. Click "Credentials" in left menu
7. Click "+ Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Galero UI Web Client"
   - Authorized JavaScript origins: Add `http://localhost:3000`
   - Click "Create"
8. Copy the "Client ID" (looks like: `123456789-abcdefgh.apps.googleusercontent.com`)

### Step 2: Configure Your Frontend

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# .env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

Replace `your_client_id_here.apps.googleusercontent.com` with your actual Client ID from Step 1.

### Step 3: Restart Your Development Server

```bash
# Press Ctrl+C to stop current server
npm run dev
```

### Step 4: Test

1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. You should see the Google authentication popup (no more error!)

---

## 🚀 For Testing Without Google OAuth

If you don't want to set up Google OAuth yet, use the demo buttons:

1. Click **"Demo: Login as User"** - logs in without Google
2. Click **"Demo: Login as Admin"** - logs in as admin without Google

This lets you test the player selection and linking features without Google setup.

---

## 📝 Notes

- The `.env` file is ignored by git (already in `.gitignore`)
- Never commit real credentials to version control
- For production, use your production domain instead of `localhost:3000`

---

## ❓ Still Having Issues?

If you still see the error after following these steps:

1. **Check Client ID is correct**:
   - Make sure you copied the entire Client ID
   - It should end with `.apps.googleusercontent.com`

2. **Verify authorized origins**:
   - Go to Google Cloud Console → Credentials
   - Click your OAuth 2.0 client ID
   - Make sure `http://localhost:3000` is in Authorized JavaScript origins
   - If not, add it

3. **Clear browser cache**:
   - Clear all site data for localhost:3000
   - Close and reopen browser
   - Try again

4. **Check environment variable is loaded**:
   - The dev server must be restarted for `.env` changes to take effect
   - Try: `npm run dev` again

5. **Verify Google API is accessible**:
   - Check that https://accounts.google.com is not blocked in your network

---

Happy coding! 🎉

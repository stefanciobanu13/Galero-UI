# Step-by-Step: Fix Google OAuth Error 401

## The Problem

You're clicking "Sign in with Google" but getting:
```
Error 401: invalid_client
The OAuth client was not found.
```

This means Google doesn't recognize your application. We need to register it.

---

## Solution: Get a Google OAuth Client ID

### 🔵 Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account (use your email if you have one)

### 🔵 Step 2: Create or Select a Project

1. Click the **Project selector** (top left dropdown)
2. Click **"NEW PROJECT"**
3. Enter Project name: **"Galero"**
4. Click **"CREATE"**
5. Wait for the project to be created (about 1 minute)
6. Select the newly created project

### 🔵 Step 3: Enable Google+ API

1. In the left sidebar, search for **"Google+ API"**
2. Click **"Google+ API"**
3. Click **"ENABLE"**

### 🔵 Step 4: Create OAuth Consent Screen

1. In left sidebar, click **"OAuth consent screen"**
2. Select **"External"** (for testing)
3. Click **"CREATE"**
4. Fill in the form:
   - **App name**: "Galero UI"
   - **User support email**: (your email)
   - **Developer contact**: (your email)
5. Click **"SAVE AND CONTINUE"**
6. Skip scopes, click **"SAVE AND CONTINUE"**
7. Add your test email as tester
8. Click **"SAVE AND CONTINUE"**
9. Click **"BACK TO DASHBOARD"**

### 🔵 Step 5: Create OAuth 2.0 Client ID

1. In left sidebar, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (top button)
3. Select **"OAuth client ID"**
4. Choose **"Web application"**
5. Fill in:
   - **Name**: "Galero UI Client"
6. Under **"Authorized JavaScript origins"**, click **"+ ADD URI"**
7. Enter: **`http://localhost:3000`**
8. Click **"CREATE"**

### 🔵 Step 6: Copy Your Client ID

1. A popup will show your credentials
2. Copy the **"Client ID"** (long string like: `123456789-abcdef.apps.googleusercontent.com`)
3. Click **"CLOSE"** or copy from the credentials page

---

## Now Configure Your Frontend

### 📝 Step 1: Create `.env` File

In your project root (`d:\Repositories\Galero-UI\`), create a file named `.env`:

```
VITE_GOOGLE_CLIENT_ID=paste_your_client_id_here
```

Replace `paste_your_client_id_here` with your actual Client ID from Step 6 above.

**Example:**
```
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 🔄 Step 2: Restart the Dev Server

In your terminal:
```bash
# Press Ctrl+C to stop the current server
# Then run:
npm run dev
```

### ✅ Step 3: Test It

1. Go to http://localhost:3000/login
2. Click **"Sign in with Google"**
3. You should now see the Google login dialog (no error!)

---

## ✨ If You Want to Skip Google Setup

For testing purposes, you can use the demo buttons without setting up Google OAuth:

1. Click **"Demo: Login as User"**
2. This skips Google authentication
3. You can test all features including player selection and linking

---

## 🔗 Helpful Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In Setup Guide](https://developers.google.com/identity/sign-in/web/sign-in)

---

## ❌ Still Getting Error?

### Check 1: Client ID Format
- Should look like: `123456789-abcdefgh.apps.googleusercontent.com`
- If it doesn't, you may have copied the wrong field

### Check 2: Authorized Origins
1. Go to Google Cloud Console → Credentials
2. Click your OAuth 2.0 Client ID
3. Verify `http://localhost:3000` is listed under "Authorized JavaScript origins"
4. If not, click "Edit" and add it

### Check 3: Dev Server Restart
- The `.env` file is only read when the server starts
- Stop and start the dev server again:
  ```bash
  npm run dev
  ```

### Check 4: Environment Variable
- Press F12 in browser (Developer Tools)
- Go to Console tab
- Type: `import.meta.env.VITE_GOOGLE_CLIENT_ID`
- It should show your Client ID, not "YOUR_GOOGLE_CLIENT_ID"
- If it shows placeholder, restart dev server

---

## 📱 Demo Without Google

While setting up Google OAuth, test the UI using demo buttons:

```
📍 Login Page
├── "Sign in with Google" (requires Google setup)
├── "Demo: Login as User" ✅ Works now
└── "Demo: Login as Admin" ✅ Works now
```

Demo buttons skip Google OAuth entirely and let you test:
- Player selection modal
- Player assignment
- Profile page
- Unlinking players

---

## ✅ Success!

Once you complete these steps and restart the dev server, clicking "Sign in with Google" should work perfectly!

You'll then:
1. Authenticate with Google
2. See player selection modal (if no player assigned)
3. Select and confirm a player
4. Get redirected to home page

Enjoy! 🎉

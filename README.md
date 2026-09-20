# 💰 Expense Tracker

A simple mobile-friendly web app for tracking daily expenses. Built for one
person to use on their phone. Data is stored in **Firebase (Firestore)** and the
app is hosted for free on **GitHub Pages**.

**Features**
- Add expenses: amount, category, payment method, date, note
- Today's total + this month's total
- This-month breakdown by category
- Recent expenses list (swipe-free delete)
- 4-digit PIN lock + anonymous Firebase sign-in
- Works offline-ish and installs to the home screen (add to home screen)

---

## What you'll set up (about 15 minutes, one time)

1. A **Firebase** project (free) — this stores the data.
2. A **GitHub** repository with **Pages** turned on — this hosts the app.

You do **not** need to install anything or write code. Follow the steps below.

---

## Part 1 — Create the Firebase project

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. Click **Add project**. Give it a name (e.g. `mom-expenses`). You can turn
   **off** Google Analytics. Click **Create project**.
3. When it's ready, click **Continue**.

### 1a. Add a Web app

1. On the project home, click the **web icon** `</>` ("Add app").
2. Give it a nickname (e.g. `web`). **Do NOT** check "Firebase Hosting".
   Click **Register app**.
3. You'll see a `firebaseConfig` block with values like `apiKey`, `projectId`,
   etc. **Keep this tab open** — you'll copy these in Part 3.

### 1b. Turn on Anonymous sign-in

1. Left sidebar → **Build → Authentication** → **Get started**.
2. Open the **Sign-in method** tab.
3. Click **Anonymous**, toggle it **Enable**, and **Save**.

### 1c. Create the database

1. Left sidebar → **Build → Firestore Database** → **Create database**.
2. Choose a location near you (e.g. `asia-south1` for India) → **Next**.
3. Start in **production mode** → **Create**.

### 1d. Set the security rules

1. In Firestore Database, open the **Rules** tab.
2. Delete everything and paste the contents of **`firestore.rules`** (in this
   repo). **Publish**.

> These rules make sure each person can only read/write their own data.

---

## Part 2 — Put the code on GitHub

1. Create a free account at <https://github.com> if you don't have one.
2. Create a **new repository** (e.g. `expense-tracker`). Public is fine — the
   Firebase config is not a secret (the security rules protect the data).
3. Upload these files to the repo (drag-and-drop on GitHub works):
   `index.html`, `styles.css`, `app.js`, `firebase-config.js`, `firestore.rules`,
   `README.md`.

*(If you prefer the command line, see "Git commands" at the bottom.)*

---

## Part 3 — Paste your Firebase config

1. Open **`firebase-config.js`**.
2. Replace every `PASTE_...` value with the matching value from the
   `firebaseConfig` block you saw in step **1a**.
3. Save / commit the change.

Example of what it should look like when done:

```js
export const firebaseConfig = {
  apiKey: "AIzaSyD...realkey...",
  authDomain: "mom-expenses.firebaseapp.com",
  projectId: "mom-expenses",
  storageBucket: "mom-expenses.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};
```

---

## Part 4 — Turn on GitHub Pages

1. In your repo → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait ~1 minute. The page will show a URL like
   `https://YOUR-USERNAME.github.io/expense-tracker/`.

### 4a. Allow that URL in Firebase

1. Back in Firebase → **Authentication → Settings → Authorized domains**.
2. Click **Add domain** and add `YOUR-USERNAME.github.io`.

---

## Part 5 — Give it to your mother

1. Open the GitHub Pages URL on her phone.
2. In the browser menu choose **Add to Home Screen** — it now behaves like an app.
3. First open: she picks a **4-digit PIN**. After that, the PIN unlocks the app.

Done! 🎉

---

## Important notes

- **The data lives on this one device/browser.** Because sign-in is anonymous,
  the expenses are tied to the browser on her phone. If she clears the browser's
  site data, switches phones, or uses a different browser, that instance starts
  empty. For a single daily-use phone this is fine. If you later want the data to
  follow her across devices, switch to email/password login (ask and I'll adjust).
- **The PIN** is a convenience lock on her phone, not bank-grade security. The
  real protection for the data is the Firestore rules + anonymous auth.
- **Free limits:** Firebase's free (Spark) plan is far more than enough for one
  person's daily expenses.
- **Changing categories, currency, etc.:** edit the settings block at the top of
  `app.js` (`CURRENCY`, `LOCALE`, `CATEGORIES`, `METHODS`).

---

## Git commands (optional, instead of drag-and-drop)

```bash
git init
git add .
git commit -m "Expense tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/expense-tracker.git
git push -u origin main
```

## Running it on your own computer first (optional test)

Because the app uses JavaScript modules, open it through a tiny local server
(not by double-clicking the file):

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. You'll also need to add `localhost` to
Firebase **Authorized domains** to test sign-in locally.

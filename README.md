# 💰 Expense Tracker

A simple, mobile-first web app for tracking daily expenses. Built for one person
to use on their phone. Data is stored in **Firebase (Firestore)** and the app is
hosted for free on **GitHub Pages**.

## ✅ It's live

- **App URL:** https://p23joushitaj-art.github.io/expense-tracker/
- **GitHub repo:** https://github.com/p23joushitaj-art/expense-tracker
- **Firebase project:** `mom-expenses-bd99a` (owned by the personal Google account
  used during setup)

Setup is already done: Firestore database created (region `asia-south1`),
security rules deployed, Anonymous sign-in enabled, and the whole add → save →
delete flow was tested end-to-end against the live database.

## 📱 Put it on Mom's phone

1. Open **https://p23joushitaj-art.github.io/expense-tracker/** in her phone's browser.
2. Browser menu → **Add to Home Screen**. It now opens like a normal app.
3. First open: she picks a **4-digit PIN**. After that, the PIN unlocks the app.
4. Tap the **+** button to add an expense (amount, category, payment method,
   date, note). Totals and the category breakdown update automatically.

## Features

- Add expenses: amount, category, payment method, date, note
- Today's total + this month's total
- This-month breakdown by category
- Recent expenses list with delete
- 4-digit PIN lock over anonymous Firebase sign-in

## Good to know

- **The data is tied to the browser on her phone.** Sign-in is anonymous, so the
  expenses live with that one browser. If she clears the browser's site data,
  switches phones, or uses a different browser, that instance starts empty. For a
  single daily-use phone this is fine. (To make data follow her across devices,
  switch to email/password login — ask and it can be changed.)
- **The PIN** is a convenience lock on her phone, not bank-grade security. The
  real protection for the data is the Firestore rules + anonymous auth.
- **The Firebase config in `firebase-config.js` is safe to be public** — the data
  is protected by the security rules in `firestore.rules`, not by hiding the config.
- **Cost:** comfortably within Firebase's free (Spark) plan for one person.

## Customising

Edit the settings block at the top of `app.js`:

- `CURRENCY` / `LOCALE` — currency symbol and number formatting (default `₹`, `en-IN`)
- `CATEGORIES` — the category list and their emojis
- `METHODS` — payment methods (Cash / UPI / Card)

## Making changes and redeploying

The site auto-deploys from the `main` branch. To publish a change:

```bash
cd ~/expense-tracker
# edit files...
git add -A
git commit -m "describe your change"
git push
```

GitHub Pages rebuilds in about a minute. **Tip:** after changing `app.js`, bump the
version number in `index.html` (`app.js?v=2` → `app.js?v=3`) so phones fetch the
new version instead of a cached copy.

To change the Firestore security rules, edit `firestore.rules`, then:

```bash
npx firebase-tools deploy --only firestore:rules --project mom-expenses-bd99a
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | App markup |
| `styles.css` | Styling (mobile-first, light + dark) |
| `app.js` | App logic + Firebase calls |
| `firebase-config.js` | Firebase project keys (safe to be public) |
| `firestore.rules` | Database security rules (deployed to Firebase) |
| `firebase.json`, `.firebaserc` | Firebase CLI config |

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
3. **First time only:** create the account — tap **Create an account**, enter an
   email + a password (at least 6 characters), and tap **Create account**. Use the
   *same* email + password on any other device to see the same expenses.
4. She then sets a **4-digit PIN** for quick daily unlocking on that device.
5. Tap the **+** button to add an entry. Use the **Expense / Income** toggle at
   the top to record either. The balance sheet and remaining balance update
   automatically. Use the ‹ › arrows to look back at previous months.

**Tip on the running balance:** it carries forward automatically — each month
starts from the previous month's remaining balance, so "Remaining balance"
always reflects real money left, not just this month's activity. For the very
first month, add an income entry for whatever money she already has on hand (or
an "Other" income = her starting balance) so the running total begins correctly.

**Everyday use:** she just opens the app and enters her PIN — she stays signed in.
The email + password is only needed the first time on each new device.

**Forgot the password?** On the sign-in screen, type the email and tap
**Forgot password?** — Firebase emails a reset link.

## Features

- Track **both income and expenses** — tap **+**, then choose Expense or Income
  - Expense: amount, category, payment method, date, note
  - Income: amount, source (Salary, Business, Interest, …), date, note
- **Monthly balance sheet:** Opening balance (carried from the previous month)
  ＋ Income − Expenses (broken down by category/source) = **Remaining balance**
- **Running balance** headline — how much money is left, as of today
- **Month navigator** (‹ ›) to view any past month's balance sheet
- Transactions list for the month, with delete
- **Email + password login** — same account syncs across all her devices
- Password reset by email
- 4-digit PIN lock for quick daily unlocking on each device

## Good to know

- **Cross-device sync:** because she signs in with email + password, the same
  account shows the same expenses on any phone, tablet, or computer. Sign in once
  per device; the session then stays active.
- **The PIN** is a quick per-device lock on top of the login, not bank-grade
  security. The real protection for the data is the Firestore rules + login.
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

// ---------------------------------------------------------------------------
// Expense Tracker — app logic
// ---------------------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, query, orderBy,
  onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// ---- Settings you can tweak -------------------------------------------------
const CURRENCY = "₹";                 // change to "$", "€", etc.
const LOCALE = "en-IN";               // number formatting locale
const CATEGORIES = [
  { name: "Food",      emoji: "🍽️" },
  { name: "Groceries", emoji: "🛒" },
  { name: "Travel",    emoji: "🚕" },
  { name: "Bills",     emoji: "🧾" },
  { name: "Health",    emoji: "💊" },
  { name: "Shopping",  emoji: "🛍️" },
  { name: "Other",     emoji: "📦" },
];
const METHODS = ["Cash", "UPI", "Card"];
// Set to true only if you re-enable new sign-ups in Firebase. When false, the
// login screen offers Sign in only (no "Create an account"), matching the
// project's disabled-signup setting.
const ALLOW_SIGNUP = false;
// ---------------------------------------------------------------------------

// ---- Elements ----
const $ = (id) => document.getElementById(id);
const loadingEl = $("loading");
const authScreen = $("authScreen");
const pinScreen = $("pinScreen");
const appEl = $("app");

let auth = null;
let db, uid = null;
let expenses = [];       // cached list
let unsubscribe = null;

// =============================== FIREBASE ===================================
function initFirebase() {
  if (firebaseConfig.apiKey.startsWith("PASTE_")) {
    loadingEl.innerHTML =
      '<div class="pin-box"><div class="logo">⚙️</div>' +
      '<h1>Setup needed</h1>' +
      '<p class="muted">Open <b>firebase-config.js</b> and paste your Firebase ' +
      'project config. See README.md for the steps.</p></div>';
    return;
  }
  const appFb = initializeApp(firebaseConfig);
  auth = getAuth(appFb);
  db = getFirestore(appFb);

  // Keep the user signed in on this device across app opens/reloads.
  setPersistence(auth, browserLocalPersistence).catch((e) => console.warn(e));

  onAuthStateChanged(auth, (user) => {
    if (user) {
      uid = user.uid;
      subscribeExpenses();
      loadingEl.classList.add("hidden");
      authScreen.classList.add("hidden");
      showPinGate();
    } else {
      // Not signed in on this device — show the login screen.
      uid = null;
      if (unsubscribe) { unsubscribe(); unsubscribe = null; }
      loadingEl.classList.add("hidden");
      pinScreen.classList.add("hidden");
      appEl.classList.add("hidden");
      showAuthScreen();
    }
  });
}

function subscribeExpenses() {
  if (unsubscribe) unsubscribe();
  // Order by creation time only (newest entered first). A single-field
  // orderBy needs no composite index. Daily/monthly totals and the category
  // breakdown are computed in-app from each expense's `date`, so query order
  // doesn't affect them.
  const q = query(
    collection(db, "users", uid, "expenses"),
    orderBy("createdAt", "desc")
  );
  unsubscribe = onSnapshot(q, (snap) => {
    expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  }, (err) => showError(err));
}

async function addExpense(data) {
  await addDoc(collection(db, "users", uid, "expenses"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

async function removeExpense(id) {
  await deleteDoc(doc(db, "users", uid, "expenses", id));
}

function showError(e) {
  console.error(e);
  loadingEl.classList.remove("hidden");
  loadingEl.innerHTML =
    '<div class="pin-box"><div class="logo">⚠️</div><h1>Something went wrong</h1>' +
    '<p class="muted">' + (e && e.message ? e.message : e) + '</p></div>';
}

// ============================ EMAIL/PASSWORD AUTH ===========================
let authMode = "signin"; // "signin" | "signup"

function showAuthScreen() {
  if (!ALLOW_SIGNUP) {
    authMode = "signin";
    document.querySelector(".auth-toggle").classList.add("hidden");
  }
  applyAuthMode();
  $("authError").classList.add("hidden");
  authScreen.classList.remove("hidden");
}

function applyAuthMode() {
  const signup = authMode === "signup";
  $("authTitle").textContent = signup ? "Create account" : "Sign in";
  $("authSub").textContent = signup
    ? "Create an account to sync across your devices"
    : "Sign in to see your expenses on any device";
  $("authSubmit").textContent = signup ? "Create account" : "Sign in";
  $("password").setAttribute("autocomplete", signup ? "new-password" : "current-password");
  $("toggleText").textContent = signup ? "Already have an account?" : "New here?";
  $("toggleMode").textContent = signup ? "Sign in" : "Create an account";
  $("forgotBtn").classList.toggle("hidden", signup);
}

function friendlyAuthError(code, message) {
  const map = {
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/missing-password": "Please enter your password.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/email-already-in-use": "That email already has an account — try signing in instead.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/wrong-password": "Wrong email or password.",
    "auth/user-not-found": "No account with that email — create one below.",
    "auth/too-many-requests": "Too many attempts. Please wait a minute and try again.",
    "auth/network-request-failed": "No internet connection. Check your network and try again.",
    "auth/admin-restricted-operation": "New sign-ups are turned off for this app.",
  };
  return map[code] || message || "Something went wrong. Please try again.";
}

$("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("email").value.trim();
  const password = $("password").value;
  const errEl = $("authError");
  errEl.classList.add("hidden");
  const btn = $("authSubmit");
  btn.disabled = true;
  const label = btn.textContent;
  btn.textContent = "Please wait…";
  try {
    if (authMode === "signup") {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    // onAuthStateChanged takes over from here.
  } catch (err) {
    errEl.textContent = friendlyAuthError(err.code, err.message);
    errEl.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});

$("toggleMode").addEventListener("click", () => {
  authMode = authMode === "signin" ? "signup" : "signin";
  applyAuthMode();
  $("authError").classList.add("hidden");
});

$("forgotBtn").addEventListener("click", async () => {
  const email = $("email").value.trim();
  const errEl = $("authError");
  if (!email) {
    errEl.textContent = "Type your email above first, then tap “Forgot password?”.";
    errEl.classList.remove("hidden");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    errEl.style.color = "var(--primary)";
    errEl.textContent = "Password reset email sent. Check your inbox.";
    errEl.classList.remove("hidden");
  } catch (err) {
    errEl.style.color = "";
    errEl.textContent = friendlyAuthError(err.code, err.message);
    errEl.classList.remove("hidden");
  }
});

async function doSignOut() {
  try { await signOut(auth); } catch (e) { console.warn(e); }
}
$("signOutBtn").addEventListener("click", () => {
  if (confirm("Sign out of this account on this device?")) doSignOut();
});

// ================================ PIN GATE ==================================
const PIN_KEY = "expense_pin";
let pinBuffer = "";

function showPinGate() {
  loadingEl.classList.add("hidden");
  const hasPin = !!localStorage.getItem(PIN_KEY);
  $("pinTitle").textContent = hasPin ? "Enter PIN" : "Create a PIN";
  $("pinHint").textContent = hasPin
    ? "Enter your 4-digit PIN"
    : "Pick a 4-digit PIN you'll remember";
  pinBuffer = "";
  updatePinDots();
  pinScreen.classList.remove("hidden");
}

function updatePinDots() {
  const dots = $("pinDots").children;
  for (let i = 0; i < 4; i++) {
    dots[i].classList.toggle("filled", i < pinBuffer.length);
  }
}

function handlePinKey(key) {
  $("pinError").classList.add("hidden");
  if (key === "back") { pinBuffer = pinBuffer.slice(0, -1); updatePinDots(); return; }
  if (key === "clear") { pinBuffer = ""; updatePinDots(); return; }
  if (pinBuffer.length >= 4) return;
  pinBuffer += key;
  updatePinDots();
  if (pinBuffer.length === 4) setTimeout(submitPin, 120);
}

function submitPin() {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) {
    // Creating a new PIN
    localStorage.setItem(PIN_KEY, pinBuffer);
    enterApp();
  } else if (pinBuffer === stored) {
    enterApp();
  } else {
    $("pinError").classList.remove("hidden");
    pinBuffer = "";
    updatePinDots();
  }
}

function enterApp() {
  pinScreen.classList.add("hidden");
  appEl.classList.remove("hidden");
  render();
}

$("pinDots") && document.querySelector(".keypad").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) handlePinKey(btn.dataset.key);
});

$("lockBtn").addEventListener("click", () => {
  appEl.classList.add("hidden");
  showPinGate();
});

// ================================ RENDER ====================================
const fmt = (n) =>
  CURRENCY + Number(n || 0).toLocaleString(LOCALE, {
    minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2,
    maximumFractionDigits: 2,
  });

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function catEmoji(name) {
  const c = CATEGORIES.find((c) => c.name === name);
  return c ? c.emoji : "📦";
}

function render() {
  if (appEl.classList.contains("hidden")) return;

  const today = todayStr();
  const monthPrefix = today.slice(0, 7); // YYYY-MM

  let todayTotal = 0, monthTotal = 0;
  const byCat = {};

  for (const e of expenses) {
    const amt = Number(e.amount) || 0;
    if (e.date === today) todayTotal += amt;
    if (e.date && e.date.startsWith(monthPrefix)) {
      monthTotal += amt;
      byCat[e.category] = (byCat[e.category] || 0) + amt;
    }
  }

  $("todayTotal").textContent = fmt(todayTotal);
  $("monthTotal").textContent = fmt(monthTotal);
  $("todayLabel").textContent = new Date().toLocaleDateString(LOCALE, {
    weekday: "long", day: "numeric", month: "long",
  });

  // Breakdown
  const bd = $("breakdown");
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  if (!cats.length) {
    bd.innerHTML = '<p class="muted small">No expenses yet this month.</p>';
  } else {
    const max = cats[0][1];
    bd.innerHTML = cats.map(([name, amt]) => `
      <div class="bd-row">
        <div class="bd-top">
          <span>${catEmoji(name)} ${name}</span>
          <span>${fmt(amt)}</span>
        </div>
        <div class="bd-bar"><div class="bd-fill" style="width:${Math.max(6, (amt / max) * 100)}%"></div></div>
      </div>`).join("");
  }

  // Recent list (latest 40)
  const list = $("list");
  if (!expenses.length) {
    list.innerHTML = '<li class="muted small empty">No expenses yet. Tap + to add one.</li>';
    return;
  }
  list.innerHTML = expenses.slice(0, 40).map((e) => {
    const dateLabel = new Date(e.date + "T00:00:00").toLocaleDateString(LOCALE, {
      day: "numeric", month: "short",
    });
    const sub = [dateLabel, e.method, e.note].filter(Boolean).join(" · ");
    return `
      <li class="item">
        <div class="item-emoji">${catEmoji(e.category)}</div>
        <div class="item-main">
          <div class="item-cat">${escapeHtml(e.category)}</div>
          <div class="item-sub">${escapeHtml(sub)}</div>
        </div>
        <div class="item-amount">${fmt(e.amount)}</div>
        <button class="item-del" data-id="${e.id}" title="Delete">🗑️</button>
      </li>`;
  }).join("");
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Delete (event delegation)
$("list").addEventListener("click", (e) => {
  const btn = e.target.closest(".item-del");
  if (!btn) return;
  if (confirm("Delete this expense?")) removeExpense(btn.dataset.id);
});

// ============================== ADD SHEET ===================================
let selectedCategory = CATEGORIES[0].name;
let selectedMethod = METHODS[0];

function buildChips() {
  $("categoryChips").innerHTML = CATEGORIES.map((c) =>
    `<button type="button" class="chip" data-cat="${c.name}">${c.emoji} ${c.name}</button>`
  ).join("");
  $("methodChips").innerHTML = METHODS.map((m) =>
    `<button type="button" class="chip" data-method="${m}">${m}</button>`
  ).join("");
  refreshChipState();

  $("categoryChips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    selectedCategory = b.dataset.cat; refreshChipState();
  });
  $("methodChips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    selectedMethod = b.dataset.method; refreshChipState();
  });
}

function refreshChipState() {
  document.querySelectorAll("#categoryChips .chip").forEach((c) =>
    c.classList.toggle("active", c.dataset.cat === selectedCategory));
  document.querySelectorAll("#methodChips .chip").forEach((c) =>
    c.classList.toggle("active", c.dataset.method === selectedMethod));
}

function openSheet() {
  $("date").value = todayStr();
  $("amount").value = "";
  $("note").value = "";
  selectedCategory = CATEGORIES[0].name;
  selectedMethod = METHODS[0];
  refreshChipState();
  $("sheet").classList.remove("hidden");
  setTimeout(() => $("amount").focus(), 100);
}
function closeSheet() { $("sheet").classList.add("hidden"); }

$("fab").addEventListener("click", openSheet);
$("cancelBtn").addEventListener("click", closeSheet);
$("sheet").addEventListener("click", (e) => { if (e.target === $("sheet")) closeSheet(); });

$("expenseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat($("amount").value);
  if (!(amount > 0)) { alert("Please enter an amount."); return; }
  const data = {
    amount,
    category: selectedCategory,
    method: selectedMethod,
    date: $("date").value || todayStr(),
    note: $("note").value.trim(),
  };
  const saveBtn = e.submitter;
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Saving…"; }
  try {
    await addExpense(data);
    closeSheet();
  } catch (err) {
    alert("Could not save: " + err.message);
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save"; }
  }
});

// ================================ START =====================================
buildChips();
initFirebase();

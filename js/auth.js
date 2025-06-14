// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Paste your Firebase config here:
const firebaseConfig = {
    apiKey: "AIzaSyDRxjPtMA7QXxwaBKx8LT0vw4EK8EeGIns",
    authDomain: "quantjuice.firebaseapp.com",
    projectId: "quantjuice",
    storageBucket: "quantjuice.firebasestorage.app",
    messagingSenderId: "753106567693",
    appId: "1:753106567693:web:cfb3d2b7d3ef23d86ecb44",
    measurementId: "G-1TGRTKVG9G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility: show alert and optionally focus input
function showAlert(message) {
  alert(message);
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Map Firebase error codes to user-friendly messages
function getFriendlyErrorMessage(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please use a different email or log in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return error.message;
  }
}

// Signup + store default role = 'free'
window.signup = async function() {
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (!email || !password) {
    showAlert("Please enter both email and password.");
    return;
  }
  if (!emailRegex.test(email)) {
    showAlert("Please enter a valid email address.");
    return;
  }
  if (password.length < 6) {
    showAlert("Password must be at least 6 characters.");
    return;
  }

  const signupBtn = document.getElementById("signupBtn");
  signupBtn.disabled = true;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      role: "free"
    });

    showAlert("Account created successfully!");
    updateUIForUser(user);
    // Close the signup modal
    const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
    signupModal.hide();
  } catch (error) {
    showAlert("Error: " + getFriendlyErrorMessage(error));
  } finally {
    signupBtn.disabled = false;
  }
}

// Login
window.login = async function() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showAlert("Please enter both email and password.");
    return;
  }
  if (!emailRegex.test(email)) {
    showAlert("Please enter a valid email address.");
    return;
  }

  const loginBtn = document.getElementById("loginBtn");
  loginBtn.disabled = true;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showAlert("Logged in successfully!");
    updateUIForUser(userCredential.user);
    // Close the login modal
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
  } catch (error) {
    showAlert("Error: " + getFriendlyErrorMessage(error));
  } finally {
    loginBtn.disabled = false;
  }
}

// Logout
window.logout = async function() {
  try {
    await signOut(auth others);
    showAlert("Logged out!");
    updateUIForGuest();
  } catch (error) {
    showAlert("Error: " + getFriendlyErrorMessage(error));
  }
}

// Auto-check login status + load role
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) {
      const role = docSnap.data().role;
      console.log("Logged in user role:", role);
      handleUserRole(role);
      updateUIForUser(user);
    } else {
      // User document missing, fallback
      handleUserRole("free");
      updateUIForUser(user);
    }
  } else {
    handleUserRole("guest");
    updateUIForGuest();
  }
});

// Handle access UI elements
function handleUserRole(role) {
  const proTools = document.querySelectorAll('.pro-only');
  const freeTools = document.querySelectorAll('.free-only');
  const guestNotice = document.querySelectorAll('.guest-only');

  // Log for debugging
  console.log(`Handling role: ${role}, proTools: ${proTools.length}, freeTools: ${freeTools.length}, guestNotice: ${guestNotice.length}`);

  if (role === "pro") {
    proTools.forEach(e => e.style.display = "block");
    freeTools.forEach(e => e.style.display = "block");
    guestNotice.forEach(e => e.style.display = "none");
  }
  else if (role === "free") {
    proTools.forEach(e => e.style.display = "none");
    freeTools.forEach(e => e.style.display = "block");
    guestNotice.forEach(e => e.style.display = "none");
  }
  else { // guest
    proTools.forEach(e => e.style.display = "none");
    freeTools.forEach(e => e.style.display = "none");
    guestNotice.forEach(e => e.style.display = "block");
  }
}

// UI updates on login
function updateUIForUser(user) {
  // Log for debugging
  console.log("Updating UI for user:", user.email);

  // Hide signup and login dropdown items, show logout
  const signupLink = document.querySelector('a[data-bs-target="#signupModal"]');
  const loginLink = document.querySelector('a[data-bs-target="#loginModal"]');
  const logoutLink = document.querySelector('a[onclick="logout()"]');

  // Log which elements are found
  console.log("signupLink:", signupLink ? "found" : "null");
  console.log("loginLink:", loginLink ? "found" : "null");
  console.log("logoutLink:", logoutLink ? "found" : "null");

  if (signupLink) {
    signupLink.style.display = "none";
  } else {
    console.warn("Signup link not found in DOM");
  }
  if (loginLink) {
    loginLink.style.display = "none";
  } else {
    console.warn("Login link not found in DOM");
  }
  if (logoutLink) {
    logoutLink.style.display = "block";
  } else {
    console.warn("Logout link not found in DOM");
  }

  // Update welcome message if welcomeUser element exists
  const welcomeUser = document.getElementById("welcomeUser");
  if (welcomeUser) {
    welcomeUser.textContent = `Welcome, ${user.email}`;
  } else {
    console.warn("welcomeUser element not found in DOM");
  }
}

// UI updates on logout / guest
function updateUIForGuest() {
  // Log for debugging
  console.log("Updating UI for guest");

  // Show signup and login dropdown items, hide logout
  const signupLink = document.querySelector('a[data-bs-target="#signupModal"]');
  const loginLink = document.querySelector('a[data-bs-target="#loginModal"]');
  const logoutLink = document.querySelector('a[onclick="logout()"]');

  // Log which elements are found
  console.log("signupLink:", signupLink ? "found" : "null");
  console.log("loginLink:", loginLink ? "found" : "null");
  console.log("logoutLink:", logoutLink ? "found" : "null");

  if (signupLink) {
    signupLink.style.display = "block";
  } else {
    console.warn("Signup link not found in DOM");
  }
  if (loginLink) {
    loginLink.style.display = "block";
  } else {
    console.warn("Login link not found in DOM");
  }
  if (logoutLink) {
    logoutLink.style.display = "none";
  } else {
    console.warn("Logout link not found in DOM");
  }

  // Clear welcome message if welcomeUser element exists
  const welcomeUser = document.getElementById("welcomeUser");
  if (welcomeUser) {
    welcomeUser.textContent = "";
  } else {
    console.warn("welcomeUser element not found in DOM");
  }
}
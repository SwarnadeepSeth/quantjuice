import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility: show alert
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

// Signup function
window.signup = async function() {
  const email = document.getElementById("signupEmail")?.value.trim();
  const password = document.getElementById("signupPassword")?.value;

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
  if (signupBtn) signupBtn.disabled = true;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      role: "free"
    });

    showAlert("Account created successfully!");
    updateUIForUser(user);
    closeModal('signupModal');
  } catch (error) {
    showAlert("Error: " + getFriendlyErrorMessage(error));
  } finally {
    if (signupBtn) signupBtn.disabled = false;
  }
}

// Login function
window.login = async function() {
  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    showAlert("Please enter both email and password.");
    return;
  }
  if (!emailRegex.test(email)) {
    showAlert("Please enter a valid email address.");
    return;
  }

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.disabled = true;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showAlert("Logged in successfully!");
    updateUIForUser(userCredential.user);
    closeModal('loginModal');
  } catch (error) {
    showAlert("Error: " + getFriendlyErrorMessage(error));
  } finally {
    if (loginBtn) loginBtn.disabled = false;
  }
}

// Logout function
window.logout = async function() {
  try {
    await signOut(auth);
    showAlert("Logged out!");
    updateUIForGuest();
    handleUserRole("guest");
  } catch (error) {
    showAlert("Error: " + getFriendlyErrorMessage(error));
  }
}

// Close modal helper
function closeModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.hide();
  }
}

// Role handling function
function handleUserRole(role) {
  const guestNotice = document.querySelectorAll('.guest-only');
  const accessElements = document.querySelectorAll('[data-access]');

  console.log(`Handling role: ${role}, found ${accessElements.length} controlled elements.`);

  // Guest notice toggle
  if (role === "pro" || role === "free") {
    guestNotice.forEach(e => e.style.display = "none");
  } else {
    guestNotice.forEach(e => e.style.display = "block");
  }

  // Universal access control
  accessElements.forEach(elem => {
    const accessLevel = elem.dataset.access;

    let allow = false;
    if (accessLevel === "pro" && role === "pro") allow = true;
    if (accessLevel === "free" && (role === "free" || role === "pro")) allow = true;
    if (accessLevel === "guest") allow = true;

    if (elem.tagName === "BUTTON") {
      elem.disabled = !allow;
    } else if (elem.tagName === "A") {
      if (allow) {
        elem.classList.remove("disabled");
        elem.style.pointerEvents = "auto";
        elem.style.opacity = 1;
      } else {
        elem.classList.add("disabled");
        elem.style.pointerEvents = "none";
        elem.style.opacity = 0.5;
      }
    }
  });
}

// UI updates on login
function updateUIForUser(user) {
  console.log("Updating UI for user:", user.email);
  const signupLink = document.querySelector('a[data-bs-target="#signupModal"]');
  const loginLink = document.querySelector('a[data-bs-target="#loginModal"]');
  const logoutLink = document.querySelector('a[onclick="logout()"]');

  if (signupLink) signupLink.style.display = "none";
  if (loginLink) loginLink.style.display = "none";
  if (logoutLink) logoutLink.style.display = "block";

  const welcomeUser = document.getElementById("welcomeUser");
  if (welcomeUser) welcomeUser.textContent = `Welcome, ${user.email}`;
}

// UI updates on logout / guest
function updateUIForGuest() {
  console.log("Updating UI for guest");
  const signupLink = document.querySelector('a[data-bs-target="#signupModal"]');
  const loginLink = document.querySelector('a[data-bs-target="#loginModal"]');
  const logoutLink = document.querySelector('a[onclick="logout()"]');

  if (signupLink) signupLink.style.display = "block";
  if (loginLink) loginLink.style.display = "block";
  if (logoutLink) logoutLink.style.display = "none";

  const welcomeUser = document.getElementById("welcomeUser");
  if (welcomeUser) welcomeUser.textContent = "";
}

// Main logic triggered AFTER DOM fully loaded:
window.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        const role = docSnap.exists() ? docSnap.data().role : "free";
        handleUserRole(role);
        updateUIForUser(user);
      } catch (error) {
        console.error("Error fetching user role:", error);
        handleUserRole("free");
        updateUIForUser(user);
      }
    } else {
      handleUserRole("guest");
      updateUIForGuest();
    }
  });
});

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { firebaseConfig } from "./firebase-config.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const authMsg = document.getElementById('authMsg');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, pass);
            authMsg.textContent = 'Logged in — redirecting…';
        } 
        catch (err) {
            authMsg.textContent = err.message;
        }
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', async () => {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const pass = document.getElementById('signupPassword').value;
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, pass);
            await createUserDoc(userCred.user.uid, name, email);
            authMsg.textContent = 'Account created. Redirecting…';
        } 
        catch (err) {
            authMsg.textContent = err.message;
        }
    });
}

//redirect users after auth state change
if (window.location.pathname.endsWith("auth.html") || window.location.pathname === "/") {
    onAuthStateChanged(auth, async (user) => {
    if (!user) 
        return;
    const uref = doc(db, 'users', user.uid);
    const snapshot = await getDoc(uref);
    if (!snapshot.exists()) {
        window.location.href = 'member.html';
        return;
    }
    const data = snapshot.data();
    if (data.role === 'owner') {
        window.location.href = 'owner.html';
    } 
    else {
        window.location.href = 'member.html';
    }
    });
}

//create user document in Firestore
async function createUserDoc(uid, name, email) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    name,
    email,
    role: "member",  //default
  });
}

//logout button used in dashboards
export function attachLogout() {
    const out = document.getElementById('logoutBtn');
    if (!out) 
        return;
    out.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'auth.html';
    });
}

export { auth, db };
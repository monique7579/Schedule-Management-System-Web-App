import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    verifyBeforeUpdateEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js"

import { app } from './firebase_core.js'
import { router } from "./app.js";

const auth = getAuth(app);

export let currentUser = null;

export async function loginFirebase(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutFirebase() {
    await signOut(auth);
}

export async function createAccount (email, password) {
    await createUserWithEmailAndPassword (auth, email, password);
}

export async function sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email);
}

export async function requestEmailChange(newEmail) {
    if (!auth.currentUser) {
        throw new Error('No user currently signed in');
    }
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
}

export async function reauthenticateUser(password) {
    if (!auth.currentUser) {
        throw new Error('No user currently signed in');
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
}

onAuthStateChanged(auth, user => {
    currentUser = user;
    const authContainer = document.getElementById('authContainer');
    const loginDiv = document.getElementById('loginDiv');
    const navMenu = document.getElementById('navMenuContainer');
    const spaRoot = document.getElementById('spaRoot');

    if(user) {
        console.log('Authstate changed: User logged in', user.email);
        loginDiv.classList.replace('d-block','d-none');
        navMenu.classList.replace('d-none','d-block');
        spaRoot.classList.replace('d-none','d-block');
        authContainer.style.display = 'none'; //temp fix, tweak as needed
        router.navigate(window.location.pathname);
    } else {
        console.log('Authstate changed: User logged out'); //this should also log on init load of the login page
        loginDiv.classList.replace('d-none','d-block');
        navMenu.classList.replace('d-block','d-none');
        spaRoot.classList.replace('d-block','d-none');
        authContainer.style.display = 'block'; //temp fix, tweak as needed

        router.currentView = null;
        spaRoot.innerHTML = ''; //cleared view since we are signing out
        // clear the data from the login form once user logs out
        const loginForm = document.forms.loginForm;
        if (loginForm) {
            console.log('clearing login form');
            loginForm.reset();
        }
    }
});
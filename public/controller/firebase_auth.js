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
    await signInWithEmailAndPassword(auth, email, password); //call firebase functin for singing in
}

export async function logoutFirebase() {
    await signOut(auth); //call firebase function for signing out
}

export async function createAccount (email, password) {
    await createUserWithEmailAndPassword (auth, email, password); //call firebase function for creating account
}

export async function sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email); //call firebase function for sending email reset
}

export async function requestEmailChange(newEmail) {
    if (!auth.currentUser) {
        throw new Error('No user currently signed in');
    }
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail); //call firebase function for verifying email update
}

export async function reauthenticateUser(password) {
    if (!auth.currentUser) {
        throw new Error('No user currently signed in');
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential); //call firebase function for reauthentication 
}

onAuthStateChanged(auth, user => { //handle visual changes by whether user is signed in or not
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
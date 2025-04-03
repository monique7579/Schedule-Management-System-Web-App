import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js"

import { app } from './firebase_core.js'
import { router } from "./app.js";
import { glHomeModel } from "./HomeController.js";

const auth = getAuth(app);

export let currentUser = null;

export async function loginFirebase(email, password) {

    await signInWithEmailAndPassword(auth, email, password);

}

export async function logoutFirebase() {
    await signOut(auth);
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
        // glHomeModel.reset(); //reset when sign out
    }
});

export async function createAccount (email, password) {
    await createUserWithEmailAndPassword (auth, email, password);
}
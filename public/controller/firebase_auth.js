import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js"

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
    if(user) {
        console.log('Authstate changed: User logged in', user.email);
        const loginDiv = document.getElementById('loginDiv');
        loginDiv.classList.replace('d-block','d-none');
        const navMenu = document.getElementById('navMenuContainer');
        navMenu.classList.replace('d-none','d-block');
        const spaRoot = document.getElementById('spaRoot');
        spaRoot.classList.replace('d-none','d-block');
        router.navigate(window.location.pathname);
    } else {
        console.log('Authstate changed: User logged out');
        const loginDiv = document.getElementById('loginDiv');
        loginDiv.classList.replace('d-none','d-block');
        const navMenu = document.getElementById('navMenuContainer');
        navMenu.classList.replace('d-block','d-none');
        const spaRoot = document.getElementById('spaRoot');
        spaRoot.classList.replace('d-block','d-none');
        router.currentView = null;
        spaRoot.innerHTML = ''; //cleared view since we are signing out
        glHomeModel.reset(); //reset when sign out
    }
});

export async function createAccount (email, password) {
    await createUserWithEmailAndPassword (auth, email, password);
}
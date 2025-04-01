import { AbstractView } from "./AbstractView.js";
import { currentUser } from "../controller/firebase_auth.js";

export class ProfileView extends AbstractView {
    //instance variables 
    controller = null;
    constructor(controller) {
        super(); //keyword super is required before this.---
        this.controller = controller;
    }

    async onMount() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
        console.log('ProfileView.onMount() called');
    }

    async updateView() { 
        console.log('ProfileView.updateView() called');
        const viewWrapper = document.createElement('div');
        const response = await fetch('/view/templates/profile.html', {cache: 'no-store'}); //to use await functin must be async
        viewWrapper.innerHTML = await response.text();
        const profileContent = document.createElement('div');
        profileContent.innerHTML = `
            <h1>Profile</h1>
            <p>Welcome to your profile page.</p>
            <p>Email: ${currentUser.email}</p>
            <p>User UID: ${currentUser.uid}</p>
        `;
        viewWrapper.appendChild(profileContent);
        
        return viewWrapper;

        //note: anything that we want to render in profile i.e. usrname, email etc will be put hear
    }

    attachEvents() { 
        console.log('ProfileView.attachEvents() called');
        const backHomeButton = document.getElementById('backHomeButton');
        backHomeButton.onclick = this.controller.onClickBackHomeButton;

        //note: if there are any buttons we put in profile (i.e. change password etc) their listeners will be attached here
    }

    async onLeave() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
        console.log('ProfileView.onLeave() called');
    }

}
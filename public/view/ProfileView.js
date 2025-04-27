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
        const profileContent = document.createElement('div');
        profileContent.innerHTML = `
            <h1 class="text-clay">Profile</h1>
            <p class="text-clay">Welcome to your profile page.</p>
            <p class="text-clay">Email: ${currentUser.email}</p>
        `;

        const changePasswordButton = document.createElement('button'); //create btn
        changePasswordButton.id = 'changePasswordButton'; //id
        changePasswordButton.classList.add('btn', 'btn-clay', 'm-2'); //style btn css and bootstrap
        changePasswordButton.innerHTML = 'Change Password'; //btn lable
        profileContent.appendChild(changePasswordButton); //add to profile content

        const changeEmailButton = document.createElement('button'); //create btn
        changeEmailButton.id = 'changeEmailButton'; //id
        changeEmailButton.classList.add('btn', 'btn-clay', 'm-2'); //style with bootstrap and css
        changeEmailButton.innerHTML = 'Change Email'; //btn label
        profileContent.appendChild(changeEmailButton); //add to profile content
        viewWrapper.appendChild(profileContent); //add profile content to view
        
        return viewWrapper;
    }

    attachEvents() { //attach listeners
        console.log('ProfileView.attachEvents() called');

        const changePasswordButton = document.getElementById('changePasswordButton'); //grab change password btn
        changePasswordButton.onclick = this.controller.onClickChangePasswordButton; //attach listener for password change
        const changeEmailButton = document.getElementById('changeEmailButton'); //grab change email btn
        changeEmailButton.onclick = this.controller.onClickChangeEmailButton; //attach listener for email change
    }

    async onLeave() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
        console.log('ProfileView.onLeave() called');
    }

}
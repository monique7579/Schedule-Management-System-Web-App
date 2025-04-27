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
            <h1 class="text-clay">Profile</h1>
            <p class="text-clay">Welcome to your profile page.</p>
            <p class="text-clay">Email: ${currentUser.email}</p>
            <p class="text-clay">User UID: ${currentUser.uid}</p>
        `;

        const changePasswordButton = document.createElement('button');
        changePasswordButton.id = 'changePasswordButton';
        changePasswordButton.classList.add('btn', 'btn-clay', 'm-2');
        changePasswordButton.innerHTML = 'Change Password';
        profileContent.appendChild(changePasswordButton);
        viewWrapper.appendChild(profileContent); 
        
        const changeEmailButton = document.createElement('button');
        changeEmailButton.id = 'changeEmailButton';
        changeEmailButton.classList.add('btn', 'btn-clay', 'm-2');
        changeEmailButton.innerHTML = 'Change Email';
        profileContent.appendChild(changeEmailButton);
        
        const passwordAuthModal = document.createElement('div');
        passwordAuthModal.innerHTML = `
            <div id="passwordAuthModal" class="modal fade" tabindex="-1">
                <div class ="modal-dialog">
                    <form id="passwordForm" class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Reauthenticate</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="password" class="form-control" name="password" placeholder="Enter your password" required>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-clay">Confirm</button>
                        </div>
                    </form>
                </div>
            </div>
        `;  
        viewWrapper.appendChild(passwordAuthModal);

        const messageModal = document.createElement('div');
        messageModal.innerHTML = `
            <div id="messageModal" class="modal fade" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p id="messageModalText" class="text-clay"></p>
                        </div>
                        <div class="modal-footer">
                            <button id="messageModalOkButton" type="button" class="btn btn-clay" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        viewWrapper.appendChild(messageModal);

        const promptModal = document.createElement('div');
        promptModal.innerHTML = `
            <div id="promptModal" class="modal fade" tabindex="-1">
                <div class ="modal-dialog">
                    <div class="modal-content">
                        <form id="promptForm">
                            <div class="modal-header">
                                <h5 class="modal-title" id="promptModalTitle">Input</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <input type="text" class="form-control" id="promptInput" required>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-clay">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;  
        viewWrapper.appendChild(promptModal);

        return viewWrapper;
        //note: anything that we want to render in profile i.e. usrname, email etc will be put hear
    }

    attachEvents() { 
        console.log('ProfileView.attachEvents() called');

        const changePasswordButton = document.getElementById('changePasswordButton');
        changePasswordButton.onclick = this.controller.onClickChangePasswordButton;
        const changeEmailButton = document.getElementById('changeEmailButton');
        changeEmailButton.onclick = this.controller.onClickChangeEmailButton;

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
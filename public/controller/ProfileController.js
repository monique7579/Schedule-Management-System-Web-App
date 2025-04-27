import { ProfileModel } from "../model/ProfileModel.js";
import { currentUser, logoutFirebase, reauthenticateUser, requestEmailChange, sendPasswordReset } from './firebase_auth.js';

export class ProfileController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = new ProfileModel();
        this.onClickChangePasswordButton = this.onClickChangePasswordButton.bind(this);
        this.onClickChangeEmailButton = this.onClickChangeEmailButton.bind(this);
        this.getPasswordModal = this.getPasswordModal.bind(this);
        this.showMessageModal = this.showMessageModal.bind(this);
        this.showPromptModal = this.showPromptModal.bind(this);
    }

    setView(view) {
        this.view = view;
    }

    async onClickChangePasswordButton(e) { //listener for changing password
        // console.log('onClickChangePasswordButton called');
        try {
            await sendPasswordReset(currentUser.email); //call function that calls database function
            await this.showMessageModal('Password reset email sent. Please check your inbox.'); //notify user
            await this.showMessageModal('Please log in again after resetting your password.'); //alert user of what is happening
            await logoutFirebase(); //call firestore function
        } catch(e) { //handle error
            console.error(e);
            await this.showMessageModal('Error sending password reset email');
        }
    }

    async onClickChangeEmailButton(e) { //listener for change email button
        // console.log('onClickChangeEmailButton called');
        const newEmail = await this.showPromptModal('Enter your new email address:'); //promt user to enter new email address
        if (!newEmail) { //if there is no new email
            await this.showMessageModal('Email change cancelled'); //alert user
            return;
        }
        try {
            await requestEmailChange(newEmail); //call firebase function for database side
            await this.showMessageModal('A verification email has been sent to your new email address. Please check your inbox to complete the update.'); //alert user of verification
            await this.showMessageModal('Please sign back in with your new email after verifying.'); //alert user to log back in
            await logoutFirebase(); //call firebase function to log user out after change
        } catch(e) { //handle error
            console.error(e);
            // firebase requires user to be recently logged in to change email
            if (e.code === 'auth/requires-recent-login') {
                const password = await this.getPasswordModal(); //prompt user for password
                if (!password) { //if no password
                    await this.showMessageModal('Cancelled'); //cancel and tell user
                    return;
                }
                try {
                    await reauthenticateUser(password); //call firebase functions , authenticate user
                    await requestEmailChange(newEmail); //email change
                    await this.showMessageModal('A verification email has been sent to your new email address. Please check your inbox to complete the update.'); //notify user of email
                    await this.showMessageModal('Please sign back in with your new email after verifying.'); //alert user to sign back in
                    await logoutFirebase(); //log out user
                } catch(e) { //handle error
                    console.error(e);
                    await this.showMessageModal('Failed to change email');
                }
            } else {
                await this.showMessageModal('Failed to send verification email'); //notify if there was an issue
            }
        }
    }

    async getPasswordModal() {
        // console.log('getPasswordModal called');
        return new Promise((resolve, reject) => {
            const passwordModal = new bootstrap.Modal(document.getElementById('passwordAuthModal'));
            const passwordForm = document.getElementById('passwordForm');

            const handler = (e) => {
                e.preventDefault();
                const password = passwordForm.password.value;
                passwordForm.removeEventListener('submit', handler);
                passwordModal.hide();
                resolve(password);
            };

            passwordForm.addEventListener('submit', handler);
            passwordModal.show();
        });
    }

    async showMessageModal(message) {
        console.log('showMessageModal called');
        return new Promise((resolve) => {
            const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
            const messageText = document.getElementById('messageModalText');
            const okButton = document.getElementById('messageModalOkButton');
            messageText.textContent = message;

            const handler = () => {
                okButton.removeEventListener('click', handler);
                messageModal.hide();
                resolve();
            };
            okButton.addEventListener('click', handler);
            messageModal.show();
        });
    }

    async showPromptModal(promptMessage) {
        console.log('showPromptModal called');
        return new Promise((resolve) => {
            const promptModal = new bootstrap.Modal(document.getElementById('promptModal'));
            const promptForm = document.getElementById('promptForm');
            const promptInput = document.getElementById('promptInput');
            const promptTitle = document.getElementById('promptModalTitle');
            promptTitle.textContent = promptMessage;
            promptInput.value = '';

            const handler = (e) => {
                e.preventDefault();
                const value = promptInput.value.trim();
                promptForm.removeEventListener('submit', handler);
                promptModal.hide();
                resolve(value);
            }
            promptForm.addEventListener('submit', handler);
            promptModal.show();
        })
    }
}

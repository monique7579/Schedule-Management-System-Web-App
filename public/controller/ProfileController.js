import { ProfileModel } from "../model/ProfileModel.js";
import { currentUser, logoutFirebase, reauthenticateUser, requestEmailChange, sendPasswordReset } from './firebase_auth.js';

export class ProfileController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = new ProfileModel();
    }

    setView(view) {
        this.view = view;
    }

    async onClickChangePasswordButton(e) {
        console.log('onClickChangePasswordButton called');
        try {
            await sendPasswordReset(currentUser.email);
            alert('Password reset email sent. Please check your inbox.');
            await logoutFirebase();
            alert('Please log in again after resetting your password.');
        } catch(e) {
            console.error(e);
            alert('Error sending password reset email');
        }
    }

    async onClickChangeEmailButton(e) {
        console.log('onClickChangeEmailButton called');
        const newEmail = prompt('Enter your new email address:');
        if (!newEmail) {
            alert('Email change cancelled');
            return;
        }
        try {
            await requestEmailChange(newEmail);
            alert('A verification email has been sent to your new email address. Please check your inbox to complete the update.');
            await logoutFirebase();
            alert('Please sign back in with your new email after verifying.');
        } catch(e) {
            console.error(e);
            // firebase requires user to be recently logged in to change email
            if (e.code === 'auth/requires-recent-login') {
                const password = prompt('Please enter your password to confirm');
                if (!password) {
                    alert('Cancelled');
                    return;
                }
                try {
                    await reauthenticateUser(password);
                    await requestEmailChange(newEmail);
                    alert('A verification email has been sent to your new email address. Please check your inbox to complete the update.');
                    await logoutFirebase();
                    alert('Please sign back in with your new email after verifying.');
                } catch(e) {
                    console.error(e);
                    alert('Failed to change email');
                }
            } else {
                alert('Failed to send verification email');
            }
        }
    }

    
}

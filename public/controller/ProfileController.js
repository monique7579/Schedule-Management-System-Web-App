import { ProfileModel } from "../model/ProfileModel.js";
import { currentUser, reauthenticateUser, sendPasswordReset } from './firebase_auth.js';

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
        // e.preventDefault();
        try {
            await sendPasswordReset(currentUser.email);
            alert('Password reset email sent. Please check your inbox.');
        } catch(e) {
            console.error(e);
            alert('Error sending password reset email');
        }
    }

    async onClickChangeEmailButton(e) {
        console.log('onClickChangeEmailButton called');
        // e.preventDefault();
        const newEmail = prompt('Enter your new email address:');
        if (!newEmail) {
            alert('Email change cancelled');
            return;
        }
        try {
            await updateUserEmail(newEmail);
            alert('Email updated successfully. Please login with your new email.');
        } catch(e) {
            // firebase requires user to be recently logged in to change email
            if (e.code === 'auth/requires-recent-login') {
                const password = prompt('Please enter your password to confirm');
                if (!password) {
                    alert('Cancelled');
                    return;
                }
                try {
                    await reauthenticateUser(password);
                    await updateUserEmail(newEmail);
                    alert('Email updated successfully');
                } catch(e) {
                    console.error(e);
                    alert('Failed to change email');
                }
            } else {
                alert('Failed to update email');
            }
        }

    }

    
}

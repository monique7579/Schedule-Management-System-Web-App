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

    async onClickChangePasswordButton(e) { //listener for changing password
        // console.log('onClickChangePasswordButton called');
        try {
            await sendPasswordReset(currentUser.email); //call function that calls database function
            alert('Password reset email sent. Please check your inbox.'); //notify user
            await logoutFirebase(); //call firestore function
            alert('Please log in again after resetting your password.'); //alert user of what is happening
        } catch(e) { //handle error
            console.error(e);
            alert('Error sending password reset email');
        }
    }

    async onClickChangeEmailButton(e) { //listener for change email button
        // console.log('onClickChangeEmailButton called');
        const newEmail = prompt('Enter your new email address:'); //promt user to enter new email address
        if (!newEmail) { //if there is no new email
            alert('Email change cancelled'); //alert user 
            return;
        }
        try {
            await requestEmailChange(newEmail); //call firebase function for database side
            alert('A verification email has been sent to your new email address. Please check your inbox to complete the update.'); //alert user of verification
            await logoutFirebase(); //call firebase function to log user out after change
            alert('Please sign back in with your new email after verifying.'); //alert user to log back in
        } catch(e) { //handle error
            console.error(e);
            // firebase requires user to be recently logged in to change email
            if (e.code === 'auth/requires-recent-login') {
                const password = prompt('Please enter your password to confirm'); //prompt user for password
                if (!password) { //if no password
                    alert('Cancelled'); //cancel and tell user
                    return;
                }
                try {
                    await reauthenticateUser(password); //call firebase functions , authenticate user
                    await requestEmailChange(newEmail); //email change
                    alert('A verification email has been sent to your new email address. Please check your inbox to complete the update.'); //notify user of email
                    await logoutFirebase(); //log out user
                    alert('Please sign back in with your new email after verifying.'); //alert user to sign back in
                } catch(e) { //handle error
                    console.error(e);
                    alert('Failed to change email');
                }
            } else {
                alert('Failed to send verification email'); //notify if there was an issue
            }
        }
    }

    
}

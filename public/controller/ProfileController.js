import { ProfileModel } from "../model/ProfileModel.js";
import { router } from "./app.js";

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
    
    onClickBackHomeButton() {
        console.log('back home button called');
        router.navigate('/');
    }
}

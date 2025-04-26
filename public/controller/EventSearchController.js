import { EventSearchModel } from "../model/EventSearchModel.js";
import { router } from "./app.js";

export class EventSearchController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = new EventSearchModel();
    }

    setView(view) {
        this.view = view;
    }
    
    // onClickBackHomeButton() {
    //     console.log('back home button called');
    //     router.navigate('/');
    // }
}

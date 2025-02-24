import { HomeModel } from "../model/HomeModel.js";

export const glHomeModel = new HomeModel();

export class HomeController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = glHomeModel;
        // this.onClickGenerateDataButton = this.onClickGenerateDataButton.bind(this); //function is bound to this current object instead of event source
    }

    setView(view) {
        this.view = view;
    }

    
}
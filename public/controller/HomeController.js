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

    //note: this is where the listeners for home components are added

    //to do: define listener for add event button that calls add event function in firestore controller

    //to do: define listeners for all interact-able components in home view, they will call a corresponding
    //function from firestore_controller.js in a try catch block
    //note: these are the functions that are attached to buttons in HomeView.js attachEvents()

    
}
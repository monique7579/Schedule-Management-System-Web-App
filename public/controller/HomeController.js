import { HomeModel } from "../model/HomeModel.js";

export const glHomeModel = new HomeModel();

export class HomeController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = glHomeModel;
        this.onClickGenerateDataButton = this.onClickGenerateDataButton.bind(this); //function is bound to this current object instead of event source
    }

    setView(view) {
        this.view = view;
    }

    onClickGenerateDataButton() { //event handler
        //generate a random number between 1 and 100 
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        this.model.addNumber(randomNumber); //this refers to object generating this event (special to event handler)
        this.view.render();
    }
}
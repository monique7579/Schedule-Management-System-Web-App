import { HomeModel } from "../model/HomeModel.js";
import { Event } from '../model/Event.js';
import { currentUser } from './firebase_auth.js';
import { addEvent } from './firestore_controller.js';

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

    //listener for add event button that calls add event function in firestore controller
    //note: may not won't work until the html form is given an id attribute for each field?
    async onSubmitCreateEvent(e) {
        e.preventDefault();     // prevent page from reloading on submission
        const uid = currentUser.uid
        const title = e.target.title.value;             
        const description = e.target.description.value;    
        const reminder = e.target.reminder.value;       
        const category = e.target.category.value;
        const location = e.target.location.value;
        const type = e.target.type.value;
        const date = e.target.date.value;
        const time = e.target.time.value;
        const repeat = e.target.repeat.value;
        const eventData = {
            uid, title, description, reminder, category, location, type,
            date, time, repeat
        };
        const event = new Event(eventData);

        try {
            const docId = await addEvent(event.toFirestore());
            event.set_docId(docId);
        } catch (error) {
            console.error('Error adding event: ', error);
            alert('Error adding event' + error);    //if a styled div for error messages is made, attach here
        }
    }

    //to do: define listeners for all interact-able components in home view, they will call a corresponding
    //function from firestore_controller.js in a try catch block
    //note: these are the functions that are attached to buttons in HomeView.js attachEvents()

    
}
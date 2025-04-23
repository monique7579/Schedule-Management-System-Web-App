import { HomeModel } from "../model/HomeModel.js";
import { Event } from '../model/Event.js';
import { Category } from '../model/Category.js';
import { currentUser } from './firebase_auth.js';
import { addCategory, addEvent } from './firestore_controller.js';

export const glHomeModel = new HomeModel();

export class HomeController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = glHomeModel;
        this.onClickPrevMonthButton = this.onClickPrevMonthButton.bind(this);
        this.onClickNextMonthButton = this.onClickNextMonthButton.bind(this);
        // this.onClickGenerateDataButton = this.onClickGenerateDataButton.bind(this); //function is bound to this current object instead of event source
    }

    setView(view) {
        this.view = view;
    }

    //note: this is where the listeners for home components are added

    //listener for add event button that calls add event function in firestore controller
    async onSubmitAddEvent(e) {
        console.log('OnSubmitAddEvent called');
        e.preventDefault();     // prevent page from reloading on submission
        const uid = currentUser.uid;
        const title = e.target.title.value;             
        const description = e.target.description.value;         
        const category = e.target.category.value;
        const start = e.target.start.value;
        const finish = e.target.finish.value;
        const reminderBool = e.target.reminderBool.checked;
        const reminderTime = e.target.reminderTime.value;
        const eventData = {
            uid, title, description, category, start, finish,
            reminderBool, reminderTime
        };
        //checking the validity of the data retrieved from form
        console.log({uid, title, description, category, start, finish,
            reminderBool, reminderTime
        });
        const event = new Event(eventData);

        try {
            const docId = await addEvent(event.toFirestore());
            event.set_docId(docId);
            e.target.reset(); //clear form
            console.log('Added event');
        } catch (error) {
            console.error('Error adding event: ', error);
            alert('Error adding event' + error);    //if a styled div for error messages is made, attach here
        }
    }

    async onSubmitAddCategory(c) {
        console.log('OnSubmitAddCategory called');
        c.preventDefault();
        const uid = currentUser.uid;
        const title = c.target.title.value;
        const categoryData = {
            uid, title
        };
        const category = new Category(categoryData);

        try {
            const docId = await addCategory(category.toFirestore());
            category.set_docId(docId);
            c.target.reset(); //clear form
            console.log('Added category');
        } catch (error) {
            console.error('Error adding category: ', error);
            alert('Error adding category' + error);
        }
    }

    onClickNextMonthButton() {
        console.log('on click next month button called');
        this.view.currentDate.setMonth(this.view.currentDate.getMonth() + 1); // go forward a month
        this.view.buildCalendar(this.view.currentDate);
        this.view.render();
    }

    onClickPrevMonthButton() {
        console.log('on click prev month button called');
        this.view.currentDate.setMonth(this.view.currentDate.getMonth() - 1); // go forward a month
        this.view.buildCalendar(this.view.currentDate);
        this.view.render();

    }

    //to do: define listeners for all interact-able components in home view, they will call a corresponding
    //function from firestore_controller.js in a try catch block
    //note: these are the functions that are attached to buttons in HomeView.js attachEvents()


    
}
import { HomeModel } from "../model/HomeModel.js";
import { Event } from '../model/Event.js';
import { Category } from '../model/Category.js';
import { currentUser } from './firebase_auth.js';
import { addCategory, addEvent, getCategoryList, getEventList } from './firestore_controller.js';
import { startSpinner, stopSpinner } from "../view/util.js";

export const glHomeModel = new HomeModel();

export class HomeController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = glHomeModel;
        this.onSubmitAddEvent = this.onSubmitAddEvent.bind(this);
        this.onSubmitAddCategory = this.onSubmitAddCategory.bind(this);
        this.onClickPrevMonthButton = this.onClickPrevMonthButton.bind(this);
        this.onClickNextMonthButton = this.onClickNextMonthButton.bind(this);
    }

    setView(view) {
        this.view = view;
    }

    //note: this is where the listeners for home components are added

    //functions to load lists
    async onLoadCategoryList() {
        startSpinner();
        try {
            const categoryList = await getCategoryList(currentUser.uid);
            this.model.setCategoryList(categoryList);
            this.model.orderCategoryListAlphabetically();
            stopSpinner();
        } catch (e) {
            stopSpinner();
            console.error(e);
            this.model.setCategoryList([]);
            alert('Error loading categories');
        }
    }

    async onLoadEventList() {
        startSpinner();
        try {
            const eventList = await getEventList(currentUser.uid);
            this.model.setEventList(eventList);
            this.model.orderEventListByStartTime();
            stopSpinner();
        } catch (e) {
            stopSpinner();
            console.error(e);
            this.model.setCategoryList([]);
            alert('Error loading tasks');
        }
    }

    //listener for add event button that calls add event function in firestore controller
    async onSubmitAddEvent(e) {
        console.log('OnSubmitAddEvent called');
        e.preventDefault();// prevent page from reloading on submission
        const uid = currentUser.uid;
        const form = e.target;
        const title = form.title.value;
        const description = form.description.value;
        const category = form.category.value;
        const start = form.start.value;
        const finish = form.finish.value;
        const reminderBool = form.reminderBool.checked;
        const reminderTime = form.reminderTime.value;

        const event = new Event ({
            uid, title, description, category, start, finish,
            reminderBool, reminderTime,
        });
        //checking the validity of the data retrieved from form
        console.log(event);
        startSpinner();
        try {
            const docId = await addEvent(event);//to firestore?
            event.set_docId(docId);
            stopSpinner();
            e.target.reset(); //clear form
            console.log('Added event');
            const b = document.getElementById('modalAddEvent-closeBtn');//
            b.click();
        } catch (e) {
            stopSpinner();
            console.error(e);
            alert('Error adding event to Firestore');
            return;    //if a styled div for error messages is made, attach here
        }
        this.model.prependEvent(event);
        this.model.orderEventListByStartTime();
        this.view.render();
    }

    async onSubmitAddCategory(c) {
        console.log('OnSubmitAddCategory called');
        c.preventDefault();
        const uid = currentUser.uid;
        const title = c.target.title.value;//can add .toLowerCase() if we want
        
        for (let i = 0; i < this.model.categoryList.length; i++) { //this makes it so they user cannot create duplicate categories (not case sensitive)
            if (title === this.model.categoryList[i].title) {
                alert(`${title} already exists.`);
                return;
            }
        }
        const category = new Category({
            uid, title,
        });
        startSpinner();
        try {
            const docId = await addCategory(category.toFirestore());
            category.set_docId(docId);
            stopSpinner();
            c.target.reset(); //clear form
            console.log('Added category');
            const b = document.getElementById('modalAddCategory-closeBtn');//these 2 lines close the form 
            b.click();
        } catch (error) {
            console.error('Error adding category: ', error);
            alert('Error adding category' + error);
        }
        this.model.prependCategory(category);
        this.model.orderCategoryListAlphabetically();
        this.view.render();
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
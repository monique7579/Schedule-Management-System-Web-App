import { HomeModel } from "../model/HomeModel.js";
import { Event } from '../model/Event.js';
import { Category } from '../model/Category.js';
import { currentUser } from './firebase_auth.js';
import { addCategory, addEvent, getCategoryList, getEventList, deleteEvent } from './firestore_controller.js';
import { startSpinner, stopSpinner } from "../view/util.js";

export const glHomeModel = new HomeModel();

export class HomeController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = glHomeModel;
        //VERY IMPORTANT: binds "this" properly
        this.onSubmitAddEvent = this.onSubmitAddEvent.bind(this);
        this.onSubmitAddCategory = this.onSubmitAddCategory.bind(this);
        this.onClickPrevMonthButton = this.onClickPrevMonthButton.bind(this);
        this.onClickNextMonthButton = this.onClickNextMonthButton.bind(this);
        this.onClickDeleteEvent = this.onClickDeleteEvent.bind(this);
        this.onClickEventCard = this.onClickEventCard.bind(this);
        this.onRightClickEventCard = this.onRightClickEventCard.bind(this);
    }

    setView(view) {
        this.view = view;
    }

    //functions to load lists
    async onLoadCategoryList() {
        startSpinner(); //for any time consuming process start spinner so it doesn't appear frozed
        try {
            const categoryList = await getCategoryList(currentUser.uid); //call firstore side
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
            this.model.setEventList([]);
            alert('Error loading tasks');
        }
    }

    //listener for add event button that calls add event function in firestore controller
    async onSubmitAddEvent(e) {
        console.log('OnSubmitAddEvent called');
        e.preventDefault();// prevent page from reloading on submission
        //grab all data needed from the form to create event
        const uid = currentUser.uid;
        const form = e.target;
        const title = form.title.value;
        const description = form.description.value;
        const category = form.category.options[form.category.selectedIndex].textContent; //text content to show the actual title of category not id
        const start = form.start.value;
        const finish = form.finish.value;
        const reminderBool = form.reminderBool.checked;
        const reminderTime = form.reminderTime.value;

        const event = new Event ({ //create event, if key+value have the same name you can just put one (i.e. name instead of name: name)
            uid, title, description, category, start, finish,
            reminderBool, reminderTime,
        });
        
        console.log(event);//checking the validity of the data retrieved from form //testing purpose

        startSpinner();
        try {
            const docId = await addEvent(event.toFirestore()); //call firestore side
            event.set_docId(docId);
            stopSpinner(); //time consuming process done, stop spinner
            e.target.reset(); //clear form
            console.log('Added event'); 
            const b = document.getElementById('modalAddEvent-closeBtn');//
            b.click();
        } catch (e) {
            stopSpinner();
            console.error(e);
            alert('Error adding event to Firestore');
            return; 
        }
        this.model.prependEvent(event); //update model, model + firestore should match
        this.model.orderEventListByStartTime(); //model should be ordered
        this.view.render(); //render view to show the new event
    }

    //listener for add category button that calls add category function in firestore controller
    async onSubmitAddCategory(e) {
        console.log('OnSubmitAddCategory called');
        e.preventDefault();
        const uid = currentUser.uid;
        const title = e.target.title.value;//can add .toLowerCase() if we want
        
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
            e.target.reset(); //clear form
            console.log('Added category');
            const b = document.getElementById('modalAddCategory-closeBtn');//these 2 lines close the form, grab close button
            b.click(); //manually click close
        } catch (e) {
            stopSpinner();
            console.error(e);
            alert('Error adding category to Firestore');
            return; 
        }
        this.model.prependCategory(category);
        this.model.orderCategoryListAlphabetically();
        this.view.render();
    }

    //listener for prev button on calendar, calls function to render the previous month
    onClickPrevMonthButton() {
        console.log('on click prev month button called');
        this.view.currentDate.setMonth(this.view.currentDate.getMonth() - 1); // go back a month
        this.view.buildCalendar(this.view.currentDate); //call the function that builds the calendar
        this.view.render(); //rerender the view

    }
    //listener for next button on calendar, calls function to render the next month
    onClickNextMonthButton() {
        console.log('on click next month button called');
        this.view.currentDate.setMonth(this.view.currentDate.getMonth() + 1); // go forward a month
        this.view.buildCalendar(this.view.currentDate); //call the function that builds the calendar
        this.view.render(); //rerender the view
    }

    //listener for delete event
    async onClickDeleteEvent(e) {
        console.log('OnClickDeleteEvent called');
        e.preventDefault();
        
        //to do: need way to get docId from however the listener is triggered
        //i think this depends on what method we use for deleting the event (right click or button)
        // const docId = e.currentTarget.card.id;
        // const eventNote = this.model.getEventByDocId(docId); 
    
        startSpinner();
        try {
            await deleteEvent(docId); //delete from firestore
            this.model.deleteEventByDocId(docId); //delete from model
            stopSpinner();
            this.view.render(); //rerender the view
        } catch(e) {
            stopSpinner();
            console.error(e);
            alert('Error deleting event from Firestore');
            return;
        }
        
    }

    //to do: listener for left or right clicking event (if that is how we will access options)

    async onClickEventCard(e) {
        console.log('onClickEventCard called');
        const card = e.currentTarget;
        const docId = card.id;
        const event = this.model.getEventByDocId(docId);
        if (!event) {
            console.error('onClickEventCard: event not found', docId);
            return;
        }

        const form = document.forms.formEditEvent;
                
    }

    async onRightClickEventCard(e) {
        console.log('onRightClickEventCard called');
        e.preventDefault();
        const card = e.currentTarget;
        const docId = card.id;
        const event = this.model.getEventByDocId(docId);
        if (!event) {
            console.error('onRightClickEventCard: event not found', docId);
            return;
        }
    }
    //to do: listener for category filter change?
    //to do: listener for updating event
    //to do: listener for deleting category
    //to do: listener for updating category


    //instruction:: DELETE BEFORE SUBMISSION
    //to do: define listeners for all interact-able components in home view, they will call a corresponding
    //function from firestore_controller.js in a try catch block
    //note: these are the functions that are attached to buttons in HomeView.js attachEvents()


    
}
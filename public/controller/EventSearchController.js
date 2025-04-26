import { EventSearchModel } from "../model/EventSearchModel.js";
// import { HomeModel } from "../model/HomeModel.js";
import { Event } from '../model/Event.js';
import { Category } from '../model/Category.js';
import { currentUser } from './firebase_auth.js';
import { addCategory, addEvent, getCategoryList, getEventList, deleteEvent, deleteCategory, updateEvent, updateCategory } from './firestore_controller.js';
import { startSpinner, stopSpinner } from "../view/util.js";

export class EventSearchController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = new EventSearchModel();
        // this.onSubmitSearch = this.onSubmitSearch.bind(this);
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
            // this.model.orderCategoryListAlphabetically();
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
            // this.model.orderEventListByStartTime();
            stopSpinner();
        } catch (e) {
            stopSpinner();
            console.error(e);
            this.model.setEventList([]);
            alert('Error loading tasks');
        }
    }

    // onSubmitSearch(e) {
    //     console.log('onSubmitSearch called')
    //     e.preventDefault();
    //     const keyword = e.target.name.value.toLowerCase().trim();
    //     const filteredEvents = this.model.eventList.filter(event =>
    //         event.title.toLowerCase().trim().includes(keyword) ||
    //         event.description.toLowerCase().trim().includes(keyword)
    //     );
    //     console.log("filtered events from search: ",filteredEvents);
    //     this.model.filteredEventList = filteredEvents;
    //     this.view.render();
    // }

}

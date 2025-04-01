import { AbstractView } from "./AbstractView.js";
import { currentUser } from "../controller/firebase_auth.js";

export class HomeView extends AbstractView {
    //instance variables 
    controller = null;
    constructor(controller) {
        super(); //keyword super is required before this.---
        this.controller = controller;
    }

    async onMount() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
        console.log('HomeView.onMount() called');
    }

    async updateView() {
        console.log('HomeView.updateView() called');
        const viewWrapper = document.createElement('div');
        const response = await fetch('/view/templates/home.html', {cache: 'no-store'}); //to use await functin must be async
        viewWrapper.innerHTML = await response.text();

        // const nav = viewWrapper.querySelector('nav');

        //to do: call render calendar and categories functions
        this.buildCalendar();

        return viewWrapper;
    }

    //to do: create function that renders calendar (called in update view)
    buildCalendar() {
        console.log('HomeView.buildCalendar() called');
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const firstDay = new Date (currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        console.log('current date', currentDate, 'currentMonth', currentMonth)
    }

    //to do: create function that renders event list (called per day)

    //to do: create function that renders categories list (called in update view)

    attachEvents() {
        // console.log('HomeView.attachEvents() called');

        //note: this is where event listeners are attached 

        //to do: attach category check box listeners 
        //to do: attach add category button listeners
        //to do: attach next and prev arrows for month
        //to do: attach add event listener
        //to do: attach submit and close listener for add even modal
        //to do: attach listener to click on event (i.e. right click brings up edit)
        
    }

    async onLeave() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
        console.log('HomeView.onLeave() called');
    }

}
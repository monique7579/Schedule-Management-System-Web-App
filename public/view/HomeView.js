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
        const response = await fetch('/view/templates/home.html', { cache: 'no-store' }); //to use await functin must be async
        viewWrapper.innerHTML = await response.text();

        // const nav = viewWrapper.querySelector('nav');

        //to do: call render calendar and categories functions

        const view = this.buildCalendar();
        viewWrapper.appendChild(view);

        return viewWrapper;
    }

    //to do: create function that renders calendar (called in update view)
    buildCalendar() {
        console.log('HomeView.buildCalendar() called');
        const calendar = document.createElement('div');
        calendar.style.color = '#cc9674';
        calendar.style.padding = '10px';
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        console.log(firstDay);
        console.log(daysInMonth);
        console.log('current date', currentDate, 'currentMonth', currentMonth);

        let dayCounter = 1;
        let rows = [];
        let currentRow = [];
        // calendar.innerHTML = ' ';
        for (let i = 0; i < firstDay; i++) { //fill in blank days
            currentRow.push('<div class="col-1"></div>');
        }
        // Add the actual days
        for (let i = firstDay; i < 7; i++) {
            currentRow.push(`<div class="col-1 calendar-day">${dayCounter}</div>`);
            dayCounter++;
        }
        rows.push(currentRow);
        currentRow = [];

        // Now add the rest of the days
        while (dayCounter <= daysInMonth) {
            for (let i = 0; i < 7; i++) {
                if (dayCounter > daysInMonth) break;
                currentRow.push(`<div class="col-1 calendar-day">${dayCounter}</div>`);
                dayCounter++;
            }
            rows.push(currentRow);
            currentRow = [];
        }

        // Fill the calendar with rows
        rows.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.classList.add('row');
            rowElement.innerHTML = row.join('');
            calendar.appendChild(rowElement);
        });
        return calendar;
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
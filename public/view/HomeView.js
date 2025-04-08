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
        viewWrapper.classList.add('d-flex');
        const response = await fetch('/view/templates/home.html', { cache: 'no-store' }); //to use await functin must be async
        viewWrapper.innerHTML = await response.text();

        //to do: call function that renders category column
        //to do: call render calendar and categories functions
        const left = this.buildCategoryColumn();
        viewWrapper.appendChild(left);
        const view = this.buildCalendar(); //call function to render calendar
        viewWrapper.appendChild(view);

        return viewWrapper;
    }

    //to do: create function that renders category column
    buildCategoryColumn() {
        console.log('HomeView.buildCategoryColumn() called');
        const categoryColumn = document.createElement('div');
        categoryColumn.classList.add('left');
        const addCategory = document.createElement('button');
        addCategory.classList.add('btn-clay', 'btn');
        addCategory.innerHTML = 'Add Category';
        categoryColumn.appendChild(addCategory);

        return categoryColumn;
    }

    //to do: create function that renders calendar (called in update view)
    buildCalendar() {
        console.log('HomeView.buildCalendar() called');
        const calendar = document.createElement('div');
        calendar.classList.add('center');

        const currentDate = new Date(); //get date
        const currentMonth = currentDate.getMonth(); //get month from date
        const currentYear = currentDate.getFullYear(); //get year from date

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        // console.log(firstDay); //testing
        // console.log(daysInMonth);
        // console.log('current date', currentDate, 'currentMonth', currentMonth, 'current year', currentYear);

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; 
        const headerRow = document.createElement('div'); //set up days up the week place
        headerRow.classList.add('row'); 
    
        weekdays.forEach(day => { //add and style each day
            const dayLabel = document.createElement('div');
            dayLabel.classList.add('col-1', 'text-center', 'fw-bold', 'calendar-header'); //calendar-header is added to use css for extra styling
            dayLabel.textContent = day;
            headerRow.appendChild(dayLabel);
        });
        calendar.appendChild(headerRow); //add weekdays to calendar

        let dayCounter = 1; //initialize counter for days (at 1 since first day == 1)
        let rows = [];
        let currentRow = [];
        
        for (let i = 0; i < firstDay; i++) { //fill in blank days (i.e. if the month starts on tuesday, sun and monday are blank)
            currentRow.push('<div class="col-1 calendar-day-prev"></div>');
        }
        // Add the actual days
        for (let i = firstDay; i < 7; i++) { //this is for first week (after blank days)
            currentRow.push(`<div class="col-1 calendar-day">${dayCounter}</div>`);
            dayCounter++;
        }
        rows.push(currentRow);
        currentRow = [];

        // add rest of days
        while (dayCounter <= daysInMonth) {
            for (let i = 0; i < 7; i++) {
                if (dayCounter > daysInMonth) break;
                currentRow.push(`<div class="col-1 calendar-day">${dayCounter}</div>`);
                dayCounter++;
            }
            rows.push(currentRow);
            currentRow = [];
        }

        // Fill the calendar with day rows
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
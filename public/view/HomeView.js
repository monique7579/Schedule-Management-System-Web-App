import { AbstractView } from "./AbstractView.js";
import { currentUser } from "../controller/firebase_auth.js";
import { getCategoryList } from "../controller/firestore_controller.js";

export class HomeView extends AbstractView {
    //instance variables 
    controller = null;
    constructor(controller) {
        super(); //keyword super is required before this.---
        this.controller = controller;
        this.currentDate = new Date(); //multiple things need access to this
    }

    async onMount() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
        await this.controller.onLoadCategoryList();
        await this.controller.onLoadEventList();
        console.log('HomeView.onMount() called');
    }

    async updateView() {
        console.log('HomeView.updateView() called');
        const viewWrapper = document.createElement('div');
        viewWrapper.classList.add('d-flex');
        const response = await fetch('/view/templates/home.html', { cache: 'no-store' }); //to use await functin must be async
        viewWrapper.innerHTML = await response.text();

        //call function that renders category column
        //to do: call render calendar and categories functions
        const left = this.buildCategoryColumn();
        viewWrapper.appendChild(left);
        // const currentDate = new Date(); //get date
        const view = this.buildCalendar(this.currentDate); //call function to render calendar
        viewWrapper.appendChild(view);
        const right = this.buildEventColumn();
        viewWrapper.appendChild(right);

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
        addCategory.setAttribute('data-bs-toggle', 'modal');
        addCategory.setAttribute('data-bs-target', '#modaladdCategory');

        const addCategoryModal = document.createElement('div');
        addCategoryModal.className = 'modal fade';
        addCategoryModal.id = 'modaladdCategory';//id
        addCategoryModal.setAttribute('data-bs-backdrop', 'static');
        addCategoryModal.setAttribute('data-bs-keyboard', 'false');
        addCategoryModal.setAttribute('tabindex', '-1');
        addCategoryModal.setAttribute('aria-labelledby', 'addCategoryModal');
        addCategoryModal.setAttribute('aria-hidden', 'true');
        addCategoryModal.classList.add('modal-clay',);

        addCategoryModal.innerHTML = `
        <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalAddCategoryLabel">Create Category</h1>
            <button id="modalAddCategory-closeBtn" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
            <div class="modal-body">
            <form name="formAddCategory">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" name="title" required minlength="3">
              </div>
              <button type="submit" class="btn btn-clay">Create</button>
            </form>
            </div>
        </div>
        </div>
        `;

        categoryColumn.appendChild(addCategoryModal);
        categoryColumn.appendChild(addCategory);

        //render category list
        const categoryList = this.renderCategoryList();
        categoryColumn.appendChild(categoryList);

        return categoryColumn;
    }

    renderCategoryList() {
        const list = document.createElement('div');
        list.id = 'category-list';
        list.className = 'mt-3'; //add classes/ styling

        if (this.controller.model.categoryList.length === 0) {
            const noData = document.createElement('div');
            noData.innerHTML = '<h4 class="text-clay">No categories have been Added!</h4>';
            list.appendChild(noData);
        } else {
            for (const category of this.controller.model.categoryList) {
                const categoryCheck = document.createElement('div');
                categoryCheck.className = 'form-check category-checkbox';
                categoryCheck.innerHTML = `
                    <input class="form-check-input category-checkbox btn-clay" type="checkbox" value="" id="${category.docId}" checked>
                    <label class="form-check-label" for="${category.docId}">
                        ${category.title}
                    </label>`
                list.appendChild(categoryCheck);
            }
        }
        return list;
    }

    buildEventColumn() {
        console.log('HomeView.buildEventColumn()) called');
        const eventColumn = document.createElement('div');
        eventColumn.classList.add('right');
        const eventHeader = document.createElement('div');
        eventHeader.classList.add('d-flex', 'align-items-center',);
        const title = document.createElement('h4');
        title.innerHTML = "Upcoming";
        title.classList.add('clay-txt');
        eventHeader.appendChild(title);
        const searchButton = document.createElement('button');
        searchButton.classList.add('btn-clay', 'btn', 'm-2');
        searchButton.innerHTML = '<i class="bi bi-search"></i>';
        eventHeader.appendChild(searchButton);
        eventColumn.appendChild(eventHeader);

        //this is the button to add an event
        const addEvent = document.createElement('button');
        addEvent.classList.add('btn-clay', 'btn');
        addEvent.innerHTML = 'Add Event';
        addEvent.setAttribute('data-bs-toggle', 'modal');
        addEvent.setAttribute('data-bs-target', '#modalAddEvent');


        const addEventModal = document.createElement('div');
        addEventModal.className = 'modal fade';
        addEventModal.id = 'modalAddEvent';//id
        addEventModal.setAttribute('data-bs-backdrop', 'static');
        addEventModal.setAttribute('data-bs-keyboard', 'false');
        addEventModal.setAttribute('tabindex', '-1');
        addEventModal.setAttribute('aria-labelledby', 'addEventModal');
        addEventModal.setAttribute('aria-hidden', 'true');
        addEventModal.classList.add('modal-clay',);

        addEventModal.innerHTML = `
        <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalAddEventLabel">Create Event</h1>
            <button id="modalAddEvent-closeBtn" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
            <div class="modal-body">
            <form name="formAddEvent">
              <div class="mb-3">
                <label class="form-label">Title</label>
                <input type="text" class="form-control" name="title" required minlength="3">
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" name="description" rows="10" minlength="5"></textarea>
              </div>
              <div class="mb-3"> 
                <label class="form-label">Category</label>
                <select class="form-select" id="categoryDropdown" name="category" aria-label="Default select example">
                    
                </select>
              </div>
              <div class="mb-3"> 
                <label class="form-label">Start -</label>
                <input type="datetime-local" class="form-control" name="start">
              </div>
              <div class="mb-3"> 
                <label class="form-label">Fin</label>
                <input type="datetime-local" class="form-control" name="finish">
              </div>
              <div class="mb-3"> 
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" name="reminderBool" value="" id="checkDefault">
                    <label class="form-check-label" for="checkDefault">
                    Reminder
                    </label>
                </div>
                <select class="form-select" name="reminderTime" aria-label="Default select example">
                    <option selected>Open this select menu</option>
                    <option value="1">At event time</option>
                    <option value="2">10 minutes before</option>
                    <option value="3">30 minutes before</option>
                    <option value="4">1 hour before</option>
                    <option value="5">1 day before</option>
                </select>
              </div>
              <button id="modalAddEvent-submitBtn" type="submit" class="btn btn-clay">Create</button>
            </form>
            </div>
        </div>
        </div>
        `;

        eventColumn.appendChild(addEventModal);
        eventColumn.appendChild(addEvent);

        const events = this.renderEventList(); //i need event list before I can call this
        eventColumn.appendChild(events);

        return eventColumn;
    }

    //add categories to the dropdown in the event add form
    async populateCategoryDropdown() {
        const select = document.getElementById('categoryDropdown');
        if (!select) {
            console.log('didnt find categorydropdown');
            return;
        }
        try {
            for (const category of this.controller.model.categoryList) {
                const option = document.createElement('option');
                option.value = category.docId;
                option.textContent = category.title;
                select.appendChild(option);
            }
        } catch (e) {
            console.error("Error loading categories", e);
        }
    }

    renderEventList() {
        const list = document.createElement('div');
        list.id = 'event-list';
        list.className = 'mt-3 overflow-auto max';//overflow-auto?
        list.style = "max-height: 500px;";

        if (this.controller.model.eventList.length === 0) {
            const noData = document.createElement('div');
            noData.innerHTML = '<h5 class="text-clay">No upcoming events</h5>';
            list.appendChild(noData);
        } else {
            for (const event of this.controller.model.eventList) {
                const card = this.createCard(event);
                list.appendChild(card);
            }
        }
        return list;
    }

    createCard(event) {
        const card = document.createElement('div');
        card.className = '';
        card.innerHTML = `
        <div id=${event.docId} class="card-event card">
            <h4 class="card-title ms-3 mt-3 text-clay">${event.title}</h4>
            <p class="text-clay">${event.description || 'no description'}</p>
            <p class="text-clay">${event.category}</p>
            <p class="text-clay">${new Date(event.start).toLocaleString()}</p>
        </div>
       `;
       return card;
    }

    //to do: create function that renders calendar (called in update view)
    buildCalendar(currentDate) {
        console.log('HomeView.buildCalendar() called');
        const calendar = document.createElement('div');
        calendar.id = "calendar";
        calendar.classList.add('center',);

        // const currentDate = new Date(); //get date
        const currentMonth = currentDate.getMonth(); //get month from date
        const currentYear = currentDate.getFullYear(); //get year from date

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        // console.log(firstDay); //testing
        // console.log(daysInMonth);
        // console.log('current date', currentDate, 'currentMonth', currentMonth, 'current year', currentYear);
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        const monthLabelRow = document.createElement('div'); //for prev, next buttons and month label
        monthLabelRow.classList.add('row', 'mb-3');
        //prev button vv
        const prevMonthBtnCol = document.createElement('div'); //create div for btn
        prevMonthBtnCol.classList.add('col-1', 'text-center', 'calendar-header'); //center it
        const prevMonthBtn = document.createElement('button'); //create btn element
        prevMonthBtn.id = "prevMonthBtn";
        prevMonthBtn.classList.add('btn-clay', 'btn'); //style btn
        prevMonthBtn.innerHTML = `<i class="bi bi-chevron-left"></i>`; //arrow on btn
        prevMonthBtnCol.appendChild(prevMonthBtn); //add btn to div
        monthLabelRow.appendChild(prevMonthBtnCol); //add div to row
        //month label
        const monthLabel = document.createElement('div'); //create div for label
        monthLabel.classList.add('col-5', 'text-center', 'fw-bold', 'calendar-month-label', 'fs-2'); //style
        monthLabel.textContent = months[currentMonth] + ' ' + currentYear; //add label
        monthLabelRow.appendChild(monthLabel); //append label
        //next month button, same process as prev button
        const nextMonthBtnCol = document.createElement('div');
        nextMonthBtnCol.classList.add('col-1', 'text-center', 'calendar-header');
        const nextMonthBtn = document.createElement('button');
        nextMonthBtn.id = "nextMonthBtn";
        nextMonthBtn.classList.add('btn-clay', 'btn');
        nextMonthBtn.innerHTML = `<i class="bi bi-chevron-right"></i>`;
        nextMonthBtnCol.appendChild(nextMonthBtn);
        monthLabelRow.appendChild(nextMonthBtnCol);

        calendar.appendChild(monthLabelRow); //append the month label row to the calendar

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
        const today = new Date();
        while (dayCounter <= daysInMonth) {
            for (let i = 0; i < 7; i++) {
                if (dayCounter > daysInMonth) {
                    currentRow.push('<div class="col-1 calendar-day-prev"></div>');
                } else {
                    const isToday =
                        dayCounter === today.getDate() &&
                        currentMonth === today.getMonth() &&
                        currentYear === today.getFullYear();
                    const dayClass = isToday ? 'calendar-day today' : 'calendar-day';
                    currentRow.push(`<div class="col-1 ${dayClass}">${dayCounter}</div>`);
                    dayCounter++;
                }
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

    async attachEvents() {
        console.log('HomeView.attachEvents() called');
        await this.populateCategoryDropdown(); //could be placed elsewhere but this worked for now

        //note: this is where event listeners are attached 

        //to do: attach category check box listeners 
        //to do: attach add category button listeners
        //to do: attach next and prev arrows for month
        const nextMonthBtn = document.getElementById('nextMonthBtn');
        nextMonthBtn.onclick = this.controller.onClickNextMonthButton;
        const prevMonthBtn = document.getElementById('prevMonthBtn');
        prevMonthBtn.onclick = this.controller.onClickPrevMonthButton;
        //to do: close forms on submit
        //add event listener
        // const formAddEvent = document.getElementById('modalAddEvent-submitBtn');
        // formAddEvent.onsubmit = this.controller.onSubmitAddEvent;
        document.forms.formAddEvent.onsubmit = this.controller.onSubmitAddEvent;
        // add category listener
        // const formAddCategory = document.querySelector('#modaladdCategory form');
        // formAddCategory.onsubmit = this.controller.onSubmitAddCategory;
        document.forms.formAddCategory.onsubmit = this.controller.onSubmitAddCategory;

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
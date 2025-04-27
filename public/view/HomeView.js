import { AbstractView } from "./AbstractView.js";
import { currentUser } from "../controller/firebase_auth.js";

export class HomeView extends AbstractView {
    //instance variables 
    controller = null;
    constructor(controller) {
        super(); //keyword super is required before this.---
        this.controller = controller;
<<<<<<< HEAD
        this.currentDate = new Date(); //multiple things need access to this
    }

    async onMount() { //function called as part of render
=======
    }

    async onMount() {
>>>>>>> f5a810e3b892286ece1a610fc3b5a6d2147a2cee
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
<<<<<<< HEAD
        await this.controller.onLoadCategoryList(); //when you open it up you need the categories to display and 
        await this.controller.onLoadEventList(); //the events to display
        console.log('HomeView.onMount() called');
    }

    async updateView() { //function called as part of render
        console.log('HomeView.updateView() called');
        const viewWrapper = document.createElement('div'); //create div that will be appended the the "master" view
        viewWrapper.classList.add('d-flex'); //allows the elements to line up horizontally
        const response = await fetch('/view/templates/home.html', { cache: 'no-store' }); //to use await function must be async
        viewWrapper.innerHTML = await response.text();

        const left = this.buildCategoryColumn(); //build the left side column which is the category column
        viewWrapper.appendChild(left); //append the left column to "master" view

        const view = this.buildCalendar(this.currentDate); //call function to render calendar, the center column
        viewWrapper.appendChild(view); //append center column to "master" view

        const right = this.buildEventColumn(); //call function to render event column, the right column
        viewWrapper.appendChild(right); //append right column to "master" view

        return viewWrapper; //return the "master" view, will be rendered in super class render()
    }

    //function that renders category column
    buildCategoryColumn() {
        console.log('HomeView.buildCategoryColumn() called');
        const categoryColumn = document.createElement('div'); //create div element to contain all elements of this column
        categoryColumn.classList.add('left'); //class for css style purposes

        const title = document.createElement('h4'); //title of header
        title.innerHTML = "Categories";
        title.classList.add('text-clay'); //style
        categoryColumn.appendChild(title);

        const addCategory = document.createElement('button'); //create button for creating category, this will link to the modal
        addCategory.classList.add('btn-clay', 'btn'); //style classes for css
        addCategory.innerHTML = 'Add Category'; //text on button
        addCategory.setAttribute('data-bs-toggle', 'modal'); //attributes that connect it to the modal
        addCategory.setAttribute('data-bs-target', '#modaladdCategory');

        const addCategoryModal = document.createElement('div'); //create div element for modal to go in
        addCategoryModal.className = 'modal fade'; //classes for bootstrap modal
        addCategoryModal.id = 'modaladdCategory'; //id
        addCategoryModal.setAttribute('data-bs-backdrop', 'static'); //attributes for boostrap modal vvvv
        addCategoryModal.setAttribute('data-bs-keyboard', 'false');
        addCategoryModal.setAttribute('tabindex', '-1');
        addCategoryModal.setAttribute('aria-labelledby', 'addCategoryModal');
        addCategoryModal.setAttribute('aria-hidden', 'true');
        addCategoryModal.classList.add('modal-clay',); //classes for css styling

        //this is the necessary HTML for the modal and the form that is  within it
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

        categoryColumn.appendChild(addCategoryModal); //add modal to category div
        categoryColumn.appendChild(addCategory); //add button to category div

        const categoryList = this.renderCategoryList(); //call function that renders the category list and returns it
        categoryColumn.appendChild(categoryList); //add category list to category div

        return categoryColumn; //return category div to be added to master div
    }

    renderCategoryList() { //function called by buildCategoryColumn
        const list = document.createElement('div'); //make div to hold the full list
        list.id = 'category-list'; //id
        list.className = 'mt-3 overflow-auto'; //bootstrap styling
        list.style = "max-height: 500px;"; //caps off how tall the list can appear no matter how many events (becomes scrollable)

        if (this.controller.model.categoryList.length === 0) { //if there are no categories (this should never happen)
            const noData = document.createElement('div');
            noData.innerHTML = '<h4 class="text-clay">No categories have been Added!</h4>'; //display that there are no categories
            list.appendChild(noData);
        } else {
            for (const category of this.controller.model.categoryList) { //for every category in the list from the model
                const categoryCheck = document.createElement('div'); //create a div for form to go in
                categoryCheck.className = 'form-check category-checkbox-div text-clay'; //create check box with label == category title
                categoryCheck.id = `${category.docId}`;
                categoryCheck.innerHTML = `
                    <input class="form-check-input category-checkbox btn-clay" data-category="${category.docID}" type="checkbox" value="" id="${category.docId}-input" ${category.isChecked ? 'checked' : ''}>
                    <label class="form-check-label" for="${category.docId}-input">
                        ${category.title}
                    </label>`
                    
                list.appendChild(categoryCheck); //add to list
            }
        }
        return list; //return list to be used in build category column
    }

    //function that renders Event column
    buildEventColumn() {
        console.log('HomeView.buildEventColumn()) called');
        const eventColumn = document.createElement('div'); //create div to hold all elements of the column
        eventColumn.classList.add('right'); //class for css styling purposes
        const eventHeader = document.createElement('div'); //create div for heading of column
        // eventHeader.classList.add('d-flex', 'align-items-center',); //style for proper layout
        const title = document.createElement('h4'); //title of header
        title.innerHTML = "Upcoming";
        title.classList.add('text-clay'); //style
        eventHeader.appendChild(title); //add title to header div

        // const searchBar = document.createElement('div');
        // searchBar.innerHTML = `
        //         <form class="d-flex gap-2 pb-2" name="formCreateItem">
        //             <input id="item-name" name="name" class="form-control form-control-sm text-clay" type="text" placeholder="" required minlength="2">
        //             <button id="create-btn" type="submit" class="btn btn-sm btn-clay"><i class="bi bi-search"></i></button>
        //         </form>
        //     `;
        // eventHeader.appendChild(searchBar); //add search button to header
        eventColumn.appendChild(eventHeader); //add header to event column div

        //this is the button to add an event
        const addEvent = document.createElement('button'); //create button
        addEvent.classList.add('btn-clay', 'btn'); //style
        addEvent.innerHTML = 'Add Event'; //text on btn
        addEvent.setAttribute('data-bs-toggle', 'modal'); //attributes to attach modal v
        addEvent.setAttribute('data-bs-target', '#modalAddEvent');

        //div for modal
        const addEventModal = document.createElement('div'); //create div
        addEventModal.className = 'modal fade'; //class so it is a modal (bootstrap)
        addEventModal.id = 'modalAddEvent'; //id
        addEventModal.setAttribute('data-bs-backdrop', 'static'); //attributes for proper bootstrap modal vvvv
        addEventModal.setAttribute('data-bs-keyboard', 'false');
        addEventModal.setAttribute('tabindex', '-1');
        addEventModal.setAttribute('aria-labelledby', 'addEventModal');
        addEventModal.setAttribute('aria-hidden', 'true');
        addEventModal.classList.add('modal-clay',); //css styling 

        //this is the HTML for the modal and form within, has all buttons input etc
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
                <label class="form-label ">Title</label>
                <input type="text" class="form-control text-clay" name="title" required minlength="3">
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control text-clay" name="description" rows="10"></textarea>
              </div>
              <div class="mb-3"> 
                <label class="form-label">Category</label>
                <select class="form-select text-clay" id="categoryDropdown" name="category" aria-label="Default select example">
                    
                </select>
              </div>
              <div class="mb-3"> 
                <label class="form-label">Start -</label>
                <input type="datetime-local" class="form-control text-clay" name="start" required>
              </div>
              <div class="mb-3"> 
                <label class="form-label">Fin</label>
                <input type="datetime-local" class="form-control text-clay" name="finish" required>
              </div>
              <div class="mb-3"> 
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" name="reminderBool" value="" id="checkDefault">
                    <label class="form-check-label" for="checkDefault">
                    Reminder
                    </label>
                </div>
                <select class="form-select text-clay" name="reminderTime" aria-label="Default select example" disabled>
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

        eventColumn.appendChild(addEventModal); //add the modal to the event column
        eventColumn.appendChild(addEvent); //add the button the the most

        setTimeout(() => {
            const checkbox = addEventModal.querySelector('input[name="reminderBool"]');
            const select = addEventModal.querySelector('select[name="reminderTime"]');

            checkbox.addEventListener('change', () => {
                select.disabled = !checkbox.checked;
            });
        }, 0);

        const events = this.renderEventList(); //call function that renders and returns event list
        eventColumn.appendChild(events); //add event lis tthe column div

        return eventColumn; //return column div to be rendered in the update view
    }

    //add categories to the dropdown in the event add form, this is done dynamically since each user has a seperate list of categories that is saved in firestore and in model
    async populateCategoryDropdown() {
        const select = document.getElementById('categoryDropdown');
        const selectEdit = document.getElementById('categoryDropdown-edit'); //grab the corresponding drop down from the modal
        if (!select) { //if not found (should never happen)
            console.log('didnt find categorydropdown');
            return;
        }
        try {
            for (const category of this.controller.model.categoryList) { //for every category from the modal
                const option = document.createElement('option'); //create option
                option.value = category.docId; //the value is docId for id purposes
                option.textContent = category.title; //shows as the category title
                select.appendChild(option); //add option to drop down
            }
        } catch (e) { //handle any error that occurs
            console.error("Error loading categories", e);
        }
    }

    async populateCategoryDropdownEdit() {
        // const select = document.getElementById('categoryDropdown'); 
        const select = document.getElementById('categoryDropdown-edit'); //grab the corresponding drop down from the modal
        if (!select) { //if not found (should never happen)
            console.log('didnt find categorydropdown');
            return;
        }
        try {
            for (const category of this.controller.model.categoryList) { //for every category from the modal
                const option = document.createElement('option'); //create option
                option.value = category.docId; //the value is docId for id purposes
                option.textContent = category.title; //shows as the category title
                select.appendChild(option); //add option to drop down
            }
        } catch (e) { //handle any error that occurs
            console.error("Error loading categories", e);
        }

        //try 

    }

    //function to render event list, called in buildEventColumn
    renderEventList() {
        const list = document.createElement('div'); //create div to hold all elements in the list
        list.id = 'event-list'; //id, also used for css styling in this case
        list.className = 'mt-3 overflow-auto'; //bootstrap styling
        list.style = "max-height: 500px;"; //caps off how tall the list can appear no matter how many events (becomes scrollable)
        const today = new Date();
        // today.setHours(0, 0, 0, 0);

        if (this.controller.model.eventList.length === 0) { //if no events upcoming 
            const noData = document.createElement('div');
            noData.innerHTML = '<h5 class="text-clay">No upcoming events</h5>'; //rendering message
            list.appendChild(noData);
        } else {
            for (const event of this.controller.model.eventList) { //for every event in list
                //if fin date is in the future
                const eventCategory = this.controller.model.getCategoryByTitle(event.category);
                // const categoryCheckBox = document.querySelector(`[data-category="${event.category}"]`);
                // console.log('categoryCheckBox', categoryCheckBox);
                const finishDate = new Date(event.finish);
                if (finishDate >= today && eventCategory.isChecked ) {
                    const card = this.createCard(event); //call function that creates card
                    list.appendChild(card); //add card to list div
                }
                //if category is checked

            }
        }
        return list; //return the list to be added the column
    }

    //function called by renderEventList to create individual event cards
    createCard(event) {
        const card = document.createElement('div'); //create div that holds and individual card
        card.className = 'mb-2'; //bootstrap style
        //HTML for the card to look how it should and include what it needs to
        card.innerHTML = `
        <div id=${event.docId} class="card-event card">
            <h6 class="card-title ms-2 mt-1 text-clay">${event.title}</h6>
            <small class="text-clay ms-2 mt-1">${event.description || 'no description'}</small>
            <small class="text-clay ms-2 mt-1">${event.category}</small>
            <small class="text-clay ms-2 mt-1">${new Date(event.start).toLocaleString()} - ${new Date(event.finish).toLocaleString()}</small>
        </div>
       `;
        return card; //return card for renderEventList function
    }

    //function that renders calendar (called in update view)
    buildCalendar(currentDate) {
        console.log('HomeView.buildCalendar() called');
        const calendar = document.createElement('div'); //create div that holds all the elements for column
        calendar.id = "calendar"; //id
        calendar.classList.add('center',); //for css styling

        const currentMonth = currentDate.getMonth(); //get month from date
        const currentYear = currentDate.getFullYear(); //get year from date

        const firstDay = new Date(currentYear, currentMonth, 1).getDay(); //get first day, so like is the first on a tuesday
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); //get amount of days in month
        const months = ["January", "February", "March", "April", "May", "June", //months
            "July", "August", "September", "October", "November", "December"];

        const monthLabelRow = document.createElement('div'); //for prev, next buttons and month label, the header
        monthLabelRow.classList.add('row', 'mb-3'); //boostrap styling
        //prev button vv
        const prevMonthBtnCol = document.createElement('div'); //create div for btn
        prevMonthBtnCol.classList.add('col-1', 'text-center', 'calendar-header'); //center it
        const prevMonthBtn = document.createElement('button'); //create btn element
        prevMonthBtn.id = "prevMonthBtn"; //id
        prevMonthBtn.classList.add('btn-clay', 'btn'); //style btn bootstrap
        prevMonthBtn.innerHTML = `<i class="bi bi-chevron-left"></i>`; //arrow on btn icon
        prevMonthBtnCol.appendChild(prevMonthBtn); //add btn to div
        monthLabelRow.appendChild(prevMonthBtnCol); //add div to row
        //month label
        const monthLabel = document.createElement('div'); //create div for label
        monthLabel.classList.add('col-5', 'text-center', 'fw-bold', 'calendar-month-label', 'fs-2'); //style bootstrap and css
        monthLabel.textContent = months[currentMonth] + ' ' + currentYear; //add label
        monthLabelRow.appendChild(monthLabel); //append label
        //next month button, same process as prev button
        const nextMonthBtnCol = document.createElement('div'); //create div for btn
        nextMonthBtnCol.classList.add('col-1', 'text-center', 'calendar-header'); //style bootstrap and css
        const nextMonthBtn = document.createElement('button'); //create button
        nextMonthBtn.id = "nextMonthBtn"; //id
        nextMonthBtn.classList.add('btn-clay', 'btn'); //style btn bootstrap and css
        nextMonthBtn.innerHTML = `<i class="bi bi-chevron-right"></i>`; //icon arrow on btn
        nextMonthBtnCol.appendChild(nextMonthBtn); //add to div
        monthLabelRow.appendChild(nextMonthBtnCol); //add div to row

        calendar.appendChild(monthLabelRow); //append the month label row to the calendar

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; //days of the week labels
        const headerRow = document.createElement('div'); //set up days up the week place
        headerRow.classList.add('row'); //bootstrap styling

        weekdays.forEach(day => { //add and style each day
            const dayLabel = document.createElement('div');
            dayLabel.classList.add('col-1', 'text-center', 'fw-bold', 'calendar-header'); //calendar-header is added to use css for extra styling, others are bootstrap
            dayLabel.textContent = day; //text is the day number i.e. 1 if it's the 1st of month
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
            //if day has an event on it, currentMonth and currentYear are variables for date, day counter would be day
            const date = new Date(currentYear,currentMonth,dayCounter);
            if (this.controller.model.hasEvent(date)) {
                currentRow.push(`<div class="col-1 calendar-day calendar-day-event">${dayCounter}</div>`);
                // console.log('there is an event this date', date);
            } else {
                currentRow.push(`<div class="col-1 calendar-day">${dayCounter}</div>`);
                // console.log('there are no events');
            }
            // dayCounter++;
            // currentRow.push(`<div class="col-1 calendar-day">${dayCounter}</div>`);
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
                    const date = new Date(currentYear, currentMonth, dayCounter);
                    const isToday =
                        dayCounter === today.getDate() &&
                        currentMonth === today.getMonth() &&
                        currentYear === today.getFullYear();
                    const dayClass = isToday ? 'calendar-day today' : 'calendar-day';
                    let eventClass;
                    if (this.controller.model.hasEvent(date)) {
                        eventClass = 'calendar-day-event';
                        // console.log('there is an event this date', date);
                    } else {
                        eventClass = '';
                        // console.log('there are no events');
                    }

                    // const eventClass = this.controller.model.hasEvent(date) ? 'calendar-day-event' : '';
                    currentRow.push(`<div class="col-1 ${dayClass} ${eventClass}">${dayCounter}</div>`);
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

    //attach the event listeners to buttons
    async attachEvents() {
        console.log('HomeView.attachEvents() called');
        await this.populateCategoryDropdown(); //could be placed elsewhere but this worked for now
        await this.populateCategoryDropdownEdit(); //could be placed elsewhere but this worked for now

        const nextMonthBtn = document.getElementById('nextMonthBtn'); //grab next month btn
        nextMonthBtn.onclick = this.controller.onClickNextMonthButton; //attach next month listener (defined in HomeController.js)
        const prevMonthBtn = document.getElementById('prevMonthBtn'); //grab prev month btn
        prevMonthBtn.onclick = this.controller.onClickPrevMonthButton; //attach prev month listener(defined in HomeController.js)

        document.forms.formAddEvent.onsubmit = this.controller.onSubmitAddEvent; //attach listener to submit button of AddEvent modal/form (defined in HomeController.js)

        document.forms.formAddCategory.onsubmit = this.controller.onSubmitAddCategory; //attach listener to submit button of AddCategory modal/form (defined in HomeController.js)

        document.querySelectorAll('.card-event').forEach(card => {
            card.onclick = this.controller.onClickEventCard; //left click
            card.oncontextmenu = this.controller.onRightClickEventCard; //right click
        });

        // document.querySelectorAll('.category-checkbox').forEach(checkbox => {
        //     checkbox.onclick = this.controller.onClickCategoryCheck; //left click
        // });

        document.querySelectorAll('.category-checkbox-div').forEach(checkbox => {
            checkbox.oncontextmenu = this.controller.onRightClickCategoryCheck; //right click
        });

        document.querySelectorAll('.category-checkbox-div').forEach(checkbox => {
            checkbox.onchange = this.controller.onClickCategoryCheck; //left click
        });
        
        const editCategoryBtn = document.getElementById('btn-editCategory');
        editCategoryBtn.onclick = this.controller.onClickEditButton;
        const deleteCategoryBtn = document.getElementById('btn-deleteCategory');
        deleteCategoryBtn.onclick = this.controller.onClickDeleteButton;

        //to do: attach listener to click on event (i.e. right click brings up edit)

        //this makes it so that the reminder drop down in the edit model is only enabled when the checkbox is checked
        const checkbox = document.getElementById('checkDefaultEdit');
        const select = document.getElementById('dropdown-remindertime');

        if (checkbox && select) {
            checkbox.addEventListener('change', () => {
                select.disabled = !checkbox.checked;
            });
        }
=======
        console.log('HomeView.onMount() called');
    }

    async updateView() {
        console.log('HomeView.updateView() called');
        const viewWrapper = document.createElement('div');
        const response = await fetch('/view/templates/home.html', {cache: 'no-store'}); //to use await functin must be async
        viewWrapper.innerHTML = await response.text();

        // const nav = viewWrapper.querySelector('nav');
        

        return viewWrapper;
    }

    attachEvents() {
        // console.log('HomeView.attachEvents() called');
        
>>>>>>> f5a810e3b892286ece1a610fc3b5a6d2147a2cee
    }

    async onLeave() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
        console.log('HomeView.onLeave() called');
    }

}
import { AbstractView } from "./AbstractView.js";
import { currentUser } from "../controller/firebase_auth.js";

export class EventSearchView extends AbstractView {
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
        console.log('EventSearchView.onMount() called');
        await this.controller.onLoadCategoryList(); //when you open it up you need the categories to display and 
        await this.controller.onLoadEventList(); //the events to display
    }

    async updateView() {
        console.log('EventSearchView.updateView() called');
        const viewWrapper = document.createElement('div'); //create div that will be appended the the "master" view
        viewWrapper.classList.add('d-flex'); //allows the elements to line up horizontally
        const response = await fetch('/view/templates/home.html', { cache: 'no-store' }); //to use await function must be async
        viewWrapper.innerHTML = await response.text();


        const left = this.buildCategoryColumn(); //build the left side column which is the category column
        viewWrapper.appendChild(left); //append the left column to "master" view

        const right = this.buildEventColumn(); //call function to render event column, the right column
        viewWrapper.appendChild(right); //append right column to "master" view
        
        
        return viewWrapper;
    }

    //function that renders category column
    buildCategoryColumn() {
        console.log('HomeView.buildCategoryColumn() called');
        const categoryColumn = document.createElement('div'); //create div element to contain all elements of this column
        categoryColumn.classList.add('left'); //class for css style purposes
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
        list.className = 'mt-3'; //add classes/styling

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

    buildEventColumn() {
        console.log('HomeView.buildEventColumn()) called');
        const eventColumn = document.createElement('div'); //create div to hold all elements of the column
        eventColumn.classList.add('right-events'); //class for css styling purposes
        const eventHeader = document.createElement('div'); //create div for heading of column
        // eventHeader.classList.add('d-flex', 'align-items-center',); //style for proper layout
        const title = document.createElement('h4'); //title of header
        title.innerHTML = "Your Events";
        title.classList.add('text-clay'); //style
        eventHeader.appendChild(title); //add title to header div

        const searchBar = document.createElement('div');
        searchBar.innerHTML = `
                <form class="d-flex gap-2 pb-2" name="formCreateItem">
                    <input id="item-name" name="name" class="form-control form-control-sm text-clay" type="text" placeholder="" required minlength="2">
                    <button id="create-btn" type="submit" class="btn btn-sm btn-clay"><i class="bi bi-search"></i></button>
                </form>
            `;
        eventHeader.appendChild(searchBar); //add search button to header
        eventColumn.appendChild(eventHeader); //add header to event column div

        //this is the button to add an event
        const addEvent = document.createElement('button'); //create button
        addEvent.classList.add('btn-clay', 'btn'); //style
        addEvent.innerHTML = 'Add Event'; //text on btn
        addEvent.setAttribute('data-bs-toggle', 'modal'); //attributes to attach modal v
        addEvent.setAttribute('data-bs-target', '#modalAddEvent');


        const events = this.renderEventList(); //call function that renders and returns event list
        eventColumn.appendChild(events); //add event lis tthe column div

        return eventColumn; //return column div to be rendered in the update view
    }

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
                // const eventCategory = this.controller.model.getCategoryByTitle(event.category);
                // const categoryCheckBox = document.querySelector(`[data-category="${event.category}"]`);
                // console.log('categoryCheckBox', categoryCheckBox);
                const finishDate = new Date(event.finish);
                if (finishDate >= today) {
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


    attachEvents() {
        console.log('EventSearchView.attachEvents() called');
    }

    async onLeave() {
        if (!currentUser) {
            this.parentElement.innerHTML = '<h1>Access Denied</h1>';
            return;
        }
        console.log('EventSearchView.onLeave() called');
    }

}
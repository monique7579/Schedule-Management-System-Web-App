import { EventSearchModel } from "../model/EventSearchModel.js";
import { currentUser } from './firebase_auth.js';
import { getCategoryList, getEventList, deleteEvent, deleteCategory, updateEvent, updateCategory } from './firestore_controller.js';
import { startSpinner, stopSpinner } from "../view/util.js";

export class EventSearchController {
    //instance members
    model = null;
    view = null;

    constructor() {
        this.model = new EventSearchModel();
        // this.onSubmitSearch = this.onSubmitSearch.bind(this);
        this.onClickEventCard = this.onClickEventCard.bind(this);
        this.onRightClickEventCard = this.onRightClickEventCard.bind(this);
        this.onClickCategoryCheck = this.onClickCategoryCheck.bind(this);
        this.onRightClickCategoryCheck = this.onRightClickCategoryCheck.bind(this);
        this.onClickEditButton = this.onClickEditButton.bind(this);
        this.onClickDeleteButton = this.onClickDeleteButton.bind(this);
        this.onClickSearchButton = this.onClickSearchButton.bind(this);
        this.onClickClearButton = this.onClickClearButton.bind(this);
    }

    setView(view) {
        this.view = view;
    }

    //functions to load lists
    async onLoadCategoryList() { //function to load category list
        startSpinner(); //for any time consuming process start spinner so it doesn't appear frozen
        try {
            const categoryList = await getCategoryList(currentUser.uid); //call firstore side to get categories from database
            this.model.setCategoryList(categoryList); //sets the model to match
            this.model.orderCategoryListAlphabetically(); //orders the model list by alphabet
            stopSpinner(); //stop spinner since time consuming task is done
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            this.model.setCategoryList([]);
            alert('Error loading categories');
        }
    }

    async onLoadEventList() { //function to load event list
        startSpinner();
        try {
            const eventList = await getEventList(currentUser.uid); //call firestore side to grab events from database
            this.model.setEventList(eventList); //update model to match
            this.model.orderEventListByStartTime(); //order events in model by time
            stopSpinner();
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            this.model.setEventList([]);
            alert('Error loading tasks');
        }
    }

    //edit events
    async onClickEventCard(e) { //clicking on event card to edit
        // console.log('onClickEventCard called');
        const card = e.currentTarget; //grab the card that was clicked on
        const docId = card.id; //grab it's id that matches the id of the event it represents
        const event = this.model.getEventByDocId(docId); //retrieve corresponding event from 
        if (!event) { //if nothing was grabbed through an error
            console.error('onClickEventCard: event not found', docId);
            return;
        }

        const form = document.forms.formEditEvent; //grab the edit event form
        form.title.value = event.title; //set the title value in form the event title from model
        form.description.value = event.description; //set description value in form to the event description from model
        this.selectCategoryByText(event.category); //selects the correct category from dropdown based on event category
        form.start.value = event.start; //match start value to model
        form.finish.value = event.finish; //match finish value to one grabbed from model
        form.reminderBool.value = event.reminderBool; //match reminder check
        form.reminderTime.value = event.reminderTime; //match reminder time

        form.onsubmit = function (e) { //call the function to edit the event
            e.preventDefault(); //prevent default action
            this.onSubmitEventEditForm(e, event); //call function
        }.bind(this);

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-edit')); //grab edit modal
        modal.show(); //make edit modal visible
    }

    async onSubmitEventEditForm(e, event) { 
        const form = document.forms.formEditEvent; //grab form 

        const title = form.title.value; //grab title
        const description = form.description.value; //grab description
        const category = form.category.options[form.category.selectedIndex].textContent; //text content to grab the actual title of category not id
        const start = form.start.value; //grab start value
        const finish = form.finish.value; //grab finish value
        const reminderBool = form.reminderBool.checked; //grab reminder bool
        const reminderTime = form.reminderTime.value; //grab reminder value

        //check if anything has changed
        if (title == event.title &&
            description == event.description &&
            category == event.category &&
            start == event.start &&
            finish == event.finish &&
            reminderBool == event.reminderBool &&
            reminderTime == event.reminderTime
        ) {
            console.log('no change');
            const b = document.getElementById('modalEditEvent-closeBtn'); //if nothing changed manually close modal without updating
            b.click();
            return;
        }

        //make sure start is before fin
        const startDate = new Date(start); //convert start to date type for comparison
        const finishDate = new Date(finish); //convert finish to date type for comparison
        if (startDate > finishDate) {
            alert('Start has to be a earlier date and time than finish!'); //prompt user of issue
            return; //get out of update function, user can resubmit after correcting
        }

        const update = { title, description, category, start, finish, reminderBool, reminderTime }; //create js object with update values
        startSpinner();
        try {
            await updateEvent(event.docId, update); //call function that updates on database side
            this.model.updateEventList(event, update); //update event on model side
            this.model.orderEventListByStartTime(); //order events in model
            const b = document.getElementById('modalEditEvent-closeBtn'); //close modal
            b.click();
            stopSpinner();
            this.view.render(); //render view so edit shows
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            alert('Error updating event');
            return;
        }
    }

    //helper for edit event drop down
    selectCategoryByText(text) {
        const select = document.getElementById('categoryDropdown-edit'); //grabs drop down
        for (let i = 0; i < select.options.length; i++) { //iterates over all the dropdown options
            if (select.options[i].textContent.trim() === text.trim()) { //find the one that matches the given category
                select.selectedIndex = i; //select the correct index
                break;
            }
        }
    }

    //edit categories
    async onClickCategoryCheck(e) { //function called when category is checked/unchecked
        // console.log('onClickCategoryCheck called');
        const checkbox = e.currentTarget; //grab checkbox from DOM
        const docId = checkbox.id; //get id, corresponds to category id
        const category = this.model.getCategoryByDocId(docId); //get category from model

        if (!category) { //throw error if what was grabbed is not a category
            console.error('onClickCategoryCheck: category not found', docId);
        }
        if (category.isChecked) { //if the category value is checked
            const update = { isChecked: false }; //switch to unchecked
            try {
                await updateCategory(category.docId, update); //update database to match
                this.model.updateCategoryList(category, update); //update model to match
            } catch (e) { //handle error
                stopSpinner();
                console.error(e);
                alert('Error updating category');
                return;
            }
        } else { //if the checkbox is unchecked
            const update = { isChecked: true}; //swtich to checked
            try {
                await updateCategory(category.docId, update); //update database to match
                this.model.updateCategoryList(category, update); //update model to match
            } catch (e) { //handle error
                stopSpinner();
                console.error(e);
                alert('Error updating category');
                return;
            }
        }
        this.view.render(); //rerender view to match
    }

    async onClickEditButton(e) { //this is for editing categories
        console.log('onClickEditButton called');
        const form = document.forms.formEditorDeleteCategory; //grab id from modal the appears when category is clicked
        const docId = form.dataset.docId;
        const category = this.model.getCategoryByDocId(docId); //get category
        // console.log(category); //check, testing purposes
        if (!category) { //if what is grabbed is not a category
            console.error('onClickEditButton: category not found', docId); //throw error
            return; //and do not continue function
        }
        const formEdit = document.forms.formEditCategory; //grab form for editing
        formEdit.title.value = category.title; //fill with current data

        formEdit.onsubmit = function (e) { //call function updone submitting form
            e.preventDefault();
            this.onSubmitEditCategoryForm(e, category); //function for editing category
        }.bind(this);

        const editDeleteModal = bootstrap.Modal.getInstance(document.getElementById('modal-editordelete-category')); //close the edit/delete modal when click button
        editDeleteModal.hide(); 

        const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-edit-category')); //show actual edit modal
        editModal.show();
    }

    async onSubmitEditCategoryForm(e, category) { //called when edit category form is submitted
        // console.log('onSubmitEditCategoryForm called');
        const form = document.forms.formEditCategory; //grab form
        const title = form.title.value; //grab title value from form input

        // console.log("Category retrieved from the form: ", category); //testing

        if (title === category.title) { //if the title matches that from the model, there was no edit made
            console.log('no change'); 
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-category')); //close modal 
            modal.hide(); 
            return; //do not continue function
        }
        const update = { title }; //create update js object
        startSpinner();
        try {
            await updateCategory(category.docId, update); //call function that updates database
            this.model.updateCategoryList(category, update); //update the model
            this.model.orderCategoryListAlphabetically(); //order the model
            stopSpinner();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-category')); //close the edit modal
            modal.hide();
            this.view.render(); //render view to match update
        } catch (e) { //handle errors
            stopSpinner();
            console.error(e);
            alert(e.message || 'Error updating category');
            return;
        }
    }

    //delete events
    async onRightClickEventCard(e) { //event listener function for right click on event cards, for deleting
        // console.log('onRightClickEventCard called');
        e.preventDefault();
        const card = e.currentTarget; //grab card
        const docId = card.id; //grab the card id, matches that of the event
        const event = this.model.getEventByDocId(docId); //get event from model
        if (!event) { //if not an event, do not continue function
            console.error('onRightClickEventCard: event not found', docId);
            return;
        }
        //confirm delete 
        if (!confirm('Delete this event')) { //if they choose cancel
            return; //cancel delete
        }
        startSpinner();
        try {
            await deleteEvent(event.docId); //call function that deletes on firebase side
            this.model.deleteEventByDocId(event.docId); //delete on model side
            stopSpinner();
            this.view.render(); //rerender view to match
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            alert('Error deleting event');
            return;
        }
    }

    //delete categories
    async onRightClickCategoryCheck(e) { //listener function called when right clicking on categories
        // console.log('onRightClickCategoryCheck called'); 
        e.preventDefault();
        const checkbox = e.currentTarget; //grab the checkbox that was clicked from DOM
        const docId = checkbox.id; //get id of checkbox, same as the category id
        const category = this.model.getCategoryByDocId(docId); //get category from model
        if (!category) { //if it is not a category, do not continue the function
            console.error('onRightClickCategoryCheck: category not found', docId);
            return;
        }
        // console.log("Category from right click: ", category);

        const form = document.forms.formEditorDeleteCategory; //grab the edit or delete category form
        form.dataset.docId = docId; //save doc id in dataset for futher function
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-editordelete-category')); //grab and show edit or delete modal
        modal.show();
    }

    async onClickDeleteButton(e) { //if user selects delete button for category editing
        // console.log('onClickDeleteButton clicked')
        const form = document.forms.formEditorDeleteCategory; //grab id from modal the appears when category is clicked
        const docId = form.dataset.docId; //grab the id that corresponds to the category id

        const category = this.model.getCategoryByDocId(docId); //get category from model
        // console.log(category); //check, testing purposes
        //don't just delete
        if (!confirm('Delete this category')) { //if they select cancel on confirm ask
            return; //cancel delete
        }
        const b = document.getElementById('modalEditorDeleteCategory-closeBtn'); //close the edit/delete modal when click button
        b.click();
        startSpinner();
        try {
            await deleteCategory(category.docId); //call function that deletes from database
            this.model.deleteCategoryByDocId(category.docId); //delete from model
            //testing
            const eventList = await getEventList(currentUser.uid); //call firestore side to grab events from database
            this.model.setEventList(eventList); //update model to match
            this.model.orderEventListByStartTime(); //order events in model by time
            //testing
            stopSpinner();
            this.view.render();
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            alert('Error deleting category');
            return;
        }
    }

    //searching
    async onClickSearchButton(e) { //listen to the search button
        // console.log('onClickSearchButton called'); 
        e.preventDefault(); 
        startSpinner();
        try {
            const eventList = await getEventList(currentUser.uid); //grab event list from database
            this.model.setEventList(eventList); //set model to match
            this.model.orderEventListByStartTime(); //order events
            stopSpinner();

            this.model.filterEvents(e.target.name.value, eventList); //filter events on model side
            // console.log('success filtering events', this.model.eventList); //testing
            this.view.render(); //render view to match
        } catch(e) { //handle error
            stopSpinner();
            console.error(e);
            alert('OnClickSearchButton: error fetching events/updating model');
            return;
        }
    }

    async onClickClearButton(e) { //listen to clear button
        // console.log('onClickClearButton called'); //testing
        e.preventDefault();
        startSpinner();
        try {
            const eventList = await getEventList(currentUser.uid); //call function that gets event list from database
            this.model.setEventList(eventList); //set model to match
            this.model.orderEventListByStartTime(); //order model
            stopSpinner();

            this.model.filterEvents('', eventList); //pass empty input
            this.view.render(); //render view to match
        } catch(e) { //handle error
            stopSpinner();
            console.error(e);
            alert('onClickClearButton: error fetching events/updating model');
            return;
        }
    }
}
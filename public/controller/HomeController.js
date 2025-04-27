import { HomeModel } from "../model/HomeModel.js";
import { Event } from '../model/Event.js';
import { Category } from '../model/Category.js';
import { currentUser } from './firebase_auth.js';
import { addCategory, addEvent, getCategoryList, getEventList, deleteEvent, deleteCategory, updateEvent, updateCategory } from './firestore_controller.js';
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
        this.onClickEventCard = this.onClickEventCard.bind(this);
        this.onRightClickEventCard = this.onRightClickEventCard.bind(this);
        this.onClickCategoryCheck = this.onClickCategoryCheck.bind(this);
        this.onRightClickCategoryCheck = this.onRightClickCategoryCheck.bind(this);
        this.onClickEditButton = this.onClickEditButton.bind(this);
        this.onClickDeleteButton = this.onClickDeleteButton.bind(this);
        this.showMessageModal = this.showMessageModal.bind(this);
        this.showConfirmModal = this.showConfirmModal.bind(this);
    }

    setView(view) {
        this.view = view;
    }

    //functions to load lists
    async onLoadCategoryList() {
        startSpinner(); //for any time consuming process start spinner so it doesn't appear frozed
        try {
            const categoryList = await getCategoryList(currentUser.uid); //call function that calls database side
            this.model.setCategoryList(categoryList); //match model
            this.model.orderCategoryListAlphabetically(); //order model
            stopSpinner();
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            this.model.setCategoryList([]);
            await this.showMessageModal('Error loading categories');
        }
    }

    async onLoadEventList() { //load the event list
        startSpinner();
        try {
            const eventList = await getEventList(currentUser.uid); //call firestore side to grab from database
            this.model.setEventList(eventList); //match model to result
            this.model.orderEventListByStartTime(); //order
            stopSpinner();
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            this.model.setEventList([]);
            await this.showMessageModal('Error loading tasks');
        }
    }

    //listener for add event button that calls add event function in firestore controller
    async onSubmitAddEvent(e) {
        // console.log('OnSubmitAddEvent called');
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

        //make sure the start date is BEFORE the finish date
        const startDate = new Date(start);
        const finishDate = new Date(finish);
        if (startDate > finishDate) {
            await this.showMessageModal('Start has to be a earlier date and time than finish!');
            return;
        }

        const event = new Event({ //create event, if key+value have the same name you can just put one (i.e. name instead of name: name)
            uid, title, description, category, start, finish,
            reminderBool, reminderTime,
        });

        // console.log(event);//checking the validity of the data retrieved from form //testing purpose

        startSpinner();
        try {
            const docId = await addEvent(event.toFirestore()); //call firestore side
            event.set_docId(docId); //set doc id
            stopSpinner(); //time consuming process done, stop spinner
            e.target.reset(); //clear form
            // console.log('Added event');
            const b = document.getElementById('modalAddEvent-closeBtn'); //close modal manually
            b.click();
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            await this.showMessageModal('Error adding event to Firestore');
            return;
        }
        this.model.prependEvent(event); //update model, model + firestore should match
        this.model.orderEventListByStartTime(); //model should be ordered
        this.view.render(); //render view to show the new event
    }

    //listener for add category button that calls add category function in firestore controller
    async onSubmitAddCategory(e) {
        // console.log('OnSubmitAddCategory called');
        e.preventDefault();
        const uid = currentUser.uid; //get user id
        const title = e.target.title.value.trim();//get title from form

        for (let i = 0; i < this.model.categoryList.length; i++) { //this makes it so they user cannot create duplicate categories (not case sensitive)
            if (title === this.model.categoryList[i].title) { //if the title is the same as a title that already exists
                await this.showMessageModal(`${title} already exists.`); //tell user
                return; //don't continue function
            }
        }
        const category = new Category({ //create new category
            uid, title,
        });
        startSpinner();
        try {
            const docId = await addCategory(category.toFirestore()); //add category to database
            category.set_docId(docId); //set docid
            stopSpinner();
            e.target.reset(); //clear form
            // console.log('Added category');
            const b = document.getElementById('modalAddCategory-closeBtn');//these 2 lines close the form, grab close button
            b.click(); //manually click close
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            await this.showMessageModal('Error adding category to Firestore');
            return;
        }
        this.model.prependCategory(category); //add category to model
        this.model.orderCategoryListAlphabetically(); //order model
        this.view.render(); //render view to match
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

    async onClickEventCard(e) { //listener to clicking on card, for editing event
        // console.log('onClickEventCard called');
        const card = e.currentTarget; //grab the card that was clicked on
        const docId = card.id; //grab it's id that matches the id of the event it represents
        const event = this.model.getEventByDocId(docId);
        if (!event) {  //if nothing was grabbed through an error
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
            e.preventDefault();
            this.onSubmitEventEditForm(e, event); //call function
        }.bind(this);

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-edit')); //grab edit modal
        modal.show(); //make edit modal visible
    }

    async onClickCategoryCheck(e) { //function called when category is checked/unchecked, to edit categories
        // console.log('onClickCategoryCheck called');
        const checkbox = e.currentTarget; //grab checkbox from DOM
        const docId = checkbox.id; //get id, corresponds to category id
        const category = this.model.getCategoryByDocId(docId); //get category from model

        if (!category) { //throw error if what was grabbed is not a category
            console.error('onRightClickCategoryCheck: category not found', docId);
        }
        if (category.isChecked) { //if the category value is checked
            const update = { isChecked: false }; //switch to unchecked
            try {
                await updateCategory(category.docId, update); //update database to match
                this.model.updateCategoryList(category, update); //update model to match
            } catch (e) { //handle error
                stopSpinner();
                console.error(e);
                await this.showMessageModal('Error updating category');
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
                await this.showMessageModal('Error updating category');
                return;
            }
        }
        this.view.render(); //rerender view to match
    }

    async onClickEditButton(e) { //this is for editing categories
        console.log('onClickEditButton called');
        const form = document.forms.formEditorDeleteCategory; //grab id from modal the appears when category is clicked
        const docId = form.dataset.docId; //set doc id
        const category = this.model.getCategoryByDocId(docId); //get category
        console.log(category); //check, testing purposes
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

    //on submit edit form
    async onSubmitEventEditForm(e, event) {
        const form = document.forms.formEditEvent; //grab form 

        const title = form.title.value; //grab title
        const description = form.description.value; //grab description
        const category = form.category.options[form.category.selectedIndex].textContent; //text content to show the actual title of category not id
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
        const finishDate = new Date(finish); //convert finsih to date type for comparison
        if (startDate > finishDate) {
            await this.showMessageModal('Start has to be a earlier date and time than finish!'); //prompt user of issue
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
            await this.showMessageModal('Error updating event');
            return;
        }
    }

    //helper for edit event drop down
    selectCategoryByText(text) {
        const select = document.getElementById('categoryDropdown'); //grabs drop down
        for (let i = 0; i < select.options.length; i++) { //iterates over all the dropdown options
            if (select.options[i].textContent.trim() === text.trim()) { //find the one that matches the given category
                select.selectedIndex = i; //select the correct index
                break;
            }
        }
    }

    async onSubmitEditCategoryForm(e, category) { //called when edit category form is submitted
        // console.log('onSubmitEditCategoryForm called');
        const form = document.forms.formEditCategory; //grab form
        const title = form.title.value; //grab title value from form input

        // console.log("Category retrieved from the form: ", category);

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
            this.view.render();//render view to match update
        } catch (e) { //handle errors
            stopSpinner();
            console.error(e);
            await this.showMessageModal('Error updating category');
            return;
        }
    }

    //listener for delete event
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
        const confirmed = await this.showConfirmModal('Delete this event?'); //prompt user to confirm delete event
        if (!confirmed) { //if they choose cancel
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
            await this.showMessageModal('Error deleting event');
            return;
        }
    }

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

        const category = this.model.getCategoryByDocId(docId); //get category
        console.log(category); //check, testing purposes
        //don't just delete
        const confirmed = await this.showConfirmModal('Delete this category?'); //prompt user for delete confirmation
        if (!confirmed) { //if they select cancel on confirm ask
            return; //cancel delete
        }
        const b = document.getElementById('modalEditorDeleteCategory-closeBtn'); //close the edit/delete modal when click button
        b.click();
        startSpinner();
        try {
            await deleteCategory(category.docId); //call function that deletes from database
            this.model.deleteCategoryByDocId(category.docId); //delete from model
            stopSpinner();
            this.view.render(); //render view to match
        } catch (e) { //handle error
            stopSpinner();
            console.error(e);
            const errorMessage = e?.message || 'Error deleting category';
            await this.showMessageModal(errorMessage);
            return;
        }
    }

    // function to show styled message modal with custom message
    async showMessageModal(message) {
        return new Promise((resolve) => {
            const messageModal = new bootstrap.Modal(document.getElementById('messageModal')); //grab message modal
            const messageText = document.getElementById('messageModalText'); //grab text element inside modal
            const okButton = document.getElementById('messageModalOkButton'); //grab ok button inside modal
            messageText.textContent = message; //set text of the modal to the passed message
            const handler = () => { //handle ok button click
                okButton.removeEventListener('click', handler); //remove event listener once clicked
                messageModal.hide(); //hide modal
                resolve();
            };
            okButton.addEventListener('click', handler); //attach listener
            messageModal.show(); 
        })
    }

    async showConfirmModal(message) {
        // console.log('showConfirmModal called (home)');
        return new Promise((resolve) => {
            const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal')); //grab confirmation modal
            const confirmText = document.getElementById('confirmModalText'); //grab text element inside modal
            const confirmButton = document.getElementById('confirmModalConfirmButton'); //grab confirm button inside modal
            const cancelButton = document.getElementById('confirmModalCancelButton'); //grab cancel button inside modal
            confirmText.textContent = message; //set text of the modal to the passed message
            const onConfirm = () => { //handle confirmation button click
                confirmButton.removeEventListener('click', onConfirm); //remove event listeners once clicked
                cancelButton.removeEventListener('click', onCancel);
                confirmModal.hide();
                resolve(true);
            };
            const onCancel = () => { //handle cancel button click
                confirmButton.removeEventListener('click', onConfirm); //remove event listeners once clicked
                cancelButton.removeEventListener('click', onCancel);
                confirmModal.hide();
                resolve(false);
            };
            confirmButton.addEventListener('click', onConfirm); //attach listeners
            cancelButton.addEventListener('click', onCancel);
            confirmModal.show();
        });
    }
}
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

    //edit events
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
        form.title.value = event.title;
        form.description.value = event.description;
        this.selectCategoryByText(event.category); //selects the correct category from dropdown based on event category
        form.start.value = event.start;
        form.finish.value = event.finish;
        form.reminderBool.value = event.reminderBool;
        form.reminderTime.value = event.reminderTime;

        form.onsubmit = function (e) {
            e.preventDefault();
            this.onSubmitEventEditForm(e, event);
        }.bind(this);

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-edit'));
        modal.show();
    }

    async onSubmitEventEditForm(e, event) {
        e.preventDefault(); //needed?
        const form = document.forms.formEditEvent;

        // const uid = currentUser.uid;
        const title = form.title.value;
        const description = form.description.value;
        const category = form.category.options[form.category.selectedIndex].textContent; //text content to show the actual title of category not id
        const start = form.start.value;
        const finish = form.finish.value;
        const reminderBool = form.reminderBool.checked;
        const reminderTime = form.reminderTime.value;

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
            const b = document.getElementById('modalEditEvent-closeBtn');
            b.click();
            return;
        }

        //make sure start is before fin
        const startDate = new Date(start);
        const finishDate = new Date(finish);
        if (startDate > finishDate) {
            alert('Start has to be a earlier date and time than finish!');
            return;
        }

        const update = { title, description, category, start, finish, reminderBool, reminderTime };
        startSpinner();
        try {
            await updateEvent(event.docId, update);
            this.model.updateEventList(event, update);
            this.model.orderEventListByStartTime();
            const b = document.getElementById('modalEditEvent-closeBtn');
            b.click();
            stopSpinner();
            this.view.render();
        } catch (e) {
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

    async onClickCategoryCheck(e) {
        console.log('onClickCategoryCheck called');
        const checkbox = e.currentTarget;
        const docId = checkbox.id;
        const category = this.model.getCategoryByDocId(docId);

        if (!category) {
            console.error('onRightClickCategoryCheck: category not found', docId);
        }
        if (category.isChecked) {
            const update = { isChecked: false };
            try {
                await updateCategory(category.docId, update);
                this.model.updateCategoryList(category, update);
            } catch (e) {
                stopSpinner();
                console.error(e);
                alert('Error updating category');
                return;
            }
            // category.set_isChecked(false);
        } else {
            // category.set_isChecked(true);
            const update = { isChecked: true};
            try {
                await updateCategory(category.docId, update);
                this.model.updateCategoryList(category, update);
            } catch (e) {
                stopSpinner();
                console.error(e);
                alert('Error updating category');
                return;
            }
        }
        this.view.render();
    }

    async onClickEditButton(e) { //this is for editing categories
        console.log('onClickEditButton called');
        const form = document.forms.formEditorDeleteCategory; //grab id from modal the appears when category is clicked
        const docId = form.dataset.docId;
        const category = this.model.getCategoryByDocId(docId); //get category
        console.log(category); //check, testing purposes
        if (!category) {
            console.error('onClickEditButton: category not found', docId);
            return;
        }
        const formEdit = document.forms.formEditCategory; //grab form for editing
        formEdit.title.value = category.title; //fill with current data

        formEdit.onsubmit = function (e) {
            e.preventDefault();
            this.onSubmitEditCategoryForm(e, category);
        }.bind(this);

        const editDeleteModal = bootstrap.Modal.getInstance(document.getElementById('modal-editordelete-category')); //close the edit/delete modal when click button
        editDeleteModal.hide();

        const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-edit-category')); //show actual edit modal
        editModal.show();
    }

    async onSubmitEditCategoryForm(e, category) {
        console.log('onSubmitEditCategoryForm called');
        const form = document.forms.formEditCategory;
        const title = form.title.value;

        console.log("Category retrieved from the form: ", category);

        if (title === category.title) {
            console.log('no change');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-category'));
            modal.hide();
            return;
        }
        const update = { title };
        startSpinner();
        try {
            await updateCategory(category.docId, update);
            this.model.updateCategoryList(category, update);
            this.model.orderCategoryListAlphabetically();
            stopSpinner();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-edit-category'));
            modal.hide();
            this.view.render();
        } catch (e) {
            stopSpinner();
            console.error(e);
            alert(e.message || 'Error updating category');
            return;
        }
    }

    //delete events

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
        //confirm delete 
        if (!confirm('Delete this event')) {
            return; //cancel delete
        }
        startSpinner();
        try {
            await deleteEvent(event.docId);
            this.model.deleteEventByDocId(event.docId);
            stopSpinner();
            this.view.render();
        } catch (e) {
            stopSpinner();
            console.error(e);
            alert('Error deleting event');
            return;
        }
    }

    //delete categories

    async onRightClickCategoryCheck(e) {
        console.log('onRightClickCategoryCheck called');
        e.preventDefault();
        const checkbox = e.currentTarget;
        const docId = checkbox.id;
        const category = this.model.getCategoryByDocId(docId);
        if (!category) {
            console.error('onRightClickCategoryCheck: category not found', docId);
            return;
        }
        console.log("Category from right click: ", category);

        // modal-editordelete-category
        const form = document.forms.formEditorDeleteCategory;
        form.dataset.docId = docId;
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-editordelete-category'));
        modal.show();
    }

    async onClickDeleteButton(e) {
        console.log('onClickDeleteButton clicked')
        const form = document.forms.formEditorDeleteCategory; //grab id from modal the appears when category is clicked
        const docId = form.dataset.docId;

        const category = this.model.getCategoryByDocId(docId); //get category
        console.log(category); //check, testing purposes
        //don't just delete
        if (!confirm('Delete this category')) {
            return; //cancel delete
        }
        const b = document.getElementById('modalEditorDeleteCategory-closeBtn'); //close the edit/delete modal when click button
        b.click();
        startSpinner();
        try {
            await deleteCategory(category.docId);
            this.model.deleteCategoryByDocId(category.docId);
            stopSpinner();
            this.view.render();
        } catch (e) {
            stopSpinner();
            console.error(e);
            alert('Error deleting category');
            return;
        }

    }

    //searching
    async onClickSearchButton(e) {
        console.log('onClickSearchButton called');
        e.preventDefault();
    }

    async onClickClearButton(e) {
        console.log('onClickClearButton called');
    }
}


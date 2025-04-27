export class EventSearchModel {
    categoryList = []; //model needs to remember the categories
    eventList = []; //and the events
    // filteredEventList = [];

    constructor() {
        this.categoryList = [];
        this.eventList = [];
        // this.filteredEventList = [];
    }

    //setters
    setCategoryList(categoryList) {
        this.categoryList = categoryList;
    }

    setEventList(eventList) {
        this.eventList = eventList;
    }

    //getters
    getCategoryByDocId(docId) {
        return this.categoryList.find(category => category.docId === docId);
    }

    getCategoryByTitle(title) {
        return this.categoryList.find(category => category.title === title);
    }

    getEventByDocId(docId) {
        return this.eventList.find(event => event.docId === docId);
    }

    //update/add
    updateEventList(event, update) {
        Object.assign(event, update);
    }

    updateCategoryList(category, update) {
        Object.assign(category, update);
    }

    //delete
    deleteEventByDocId(docId) {
        const index = this.eventList.findIndex(event => event.docId == docId);
        if (index >= 0) {
            this.eventList.splice(index, 1);
        } else { //shouldn't happen
            //event wasn't found
            console.error('deleteEventByDocId: event not found', docId);
        }
    }

    deleteCategoryByDocId(docId) {
        const index = this.categoryList.findIndex(category => category.docId == docId);
        if (index >= 0) {
            this.categoryList.splice(index, 1);
        } else { //shouldn't happen
            //category wasn't found
            console.error('deleteCategoryByDocId: category not found', docId);
        }
    }

    //order
    //by alphabet for events 
    orderCategoryListAlphabetically() {
        this.categoryList.sort((a, b) => a.title.localeCompare(b.title));
    }

    //by timestamp for tasks
    orderEventListByStartTime() {
        this.eventList.sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    //search/filter
    //fullEventList should be fetched from firestore before calling function, want most up to date version
    filterEvents(searchInput, fullEventList) {
        // console.log('filterEvents called from model');
        
        if (!searchInput || searchInput.trim() === '') { //if search is empty, we won't filter, just reset to full list
            this.eventList = [...fullEventList];
            return;
        }

        const search = searchInput.toLowerCase().trim(); //trim whitespace and toLower for case-insensitive comparison
        const filteredEvents = fullEventList.filter(event => //set filteredEvents to search results
            event.title.toLowerCase().trim().includes(search) || //search for match in titles
            event.description.toLowerCase().trim().includes(search) //search for match in descriptions
        );
        // console.log('filtered events from model');
        this.setEventList(filteredEvents); //set event list to filtered events, this is for simplicity in view rendering
    }
}
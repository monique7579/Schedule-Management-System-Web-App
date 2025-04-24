export class HomeModel {
    categoryList = []; //model needs to remember the categories
    eventList = []; //and the events

    constructor() {
        this.categoryList = [];
        this.eventList = [];
    }

    //setters
    setCategoryList (categoryList) {
        this.categoryList = categoryList;
    }

    setEventList(eventList) {
        this.eventList = eventList;
    }

    //getters
    getCategoryByDocId(docId) {
        return this.categoryList.find(category => category.docId === docId);
    }

    getEventByDocId(docId) {
        return this.eventList.find(event => event.docId === docId);
    }
    
    //update/add
    prependCategory(category) {
        this.categoryList.unshift(category);
    }

    prependEvent(event) {
        this.eventList.unshift(event);
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
        this.categoryList.sort((a,b) => a.title.localeCompare(b.title));
    }

    //by timestamp for tasks
    orderEventListByStartTime() {
        this.eventList.sort((a,b) => b.start - a.start);
    } 
}
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
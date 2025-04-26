export class EventSearchModel {
    categoryList = []; //model needs to remember the categories
    eventList = []; //and the events

    constructor() {
        this.categoryList = [];
        this.eventList = [];
    }

    //setters
    setCategoryList(categoryList) {
        this.categoryList = categoryList;
    }

    setEventList(eventList) {
        this.eventList = eventList;
    }
}
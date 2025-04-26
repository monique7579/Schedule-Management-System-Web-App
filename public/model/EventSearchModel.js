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

}
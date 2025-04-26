export class HomeModel {
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
        this.categoryList.sort((a, b) => a.title.localeCompare(b.title));
    }

    //by timestamp for tasks
    orderEventListByStartTime() {
        this.eventList.sort((a, b) => b.start - a.start);
    }

    //find if given date has event occurring during it 
    //if start day(month and year) equal
    //if fin day equal
    //if start is less than and fin is greater than
    hasEvent(date) {
        const targetTime = date.setHours(0, 0, 0, 0); // normalize target to start of day

        for (const event of this.eventList) {
            const startDate = new Date(event.start);
            const finishDate = new Date(event.finish);

            const startTime = startDate.setHours(0, 0, 0, 0); // start of day
            const finishTime = finishDate.setHours(23, 59, 59, 999); // end of day

            if (
                targetTime >= startTime &&
                targetTime <= finishTime
            ) {
                return true;
            }
        }
        return false;
    }
}
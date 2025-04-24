export class Category {
    uid = null; //user id because categories are per user
    title = null; //a category to the user is just a name
    isDefault = false; //must have at least the default category, so identification required in that aspect
    docId = null; 

    constructor(data) {
        this.uid = data.uid;
        this.title = data.title;
        //default category is generated automatically so user shouldn't be able to set it
        this.isDefault = data.isDefault || false;
    }
    
    set_docId(docId) {
        this.docId = docId;
    }
    
    toFirestore() {
        return {
            uid: this.uid,
            title: this.title,
            isDefault: this.isDefault
        };
    }
}


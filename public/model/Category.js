export class Category {
    uid = null; //user id because categories are per user
    title = null; //a category to the user is just a name
    isChecked = null; //boolean value to be used for filtering events, default to true
    isDefault = false; //must have at least the default category, so identification required in that aspect
    docId = null; //to uniquely identify 

    constructor(data) {
        this.uid = data.uid;
        this.title = data.title;
        this.isChecked = data.isChecked || true;
        //default category is generated automatically so user shouldn't be able to set it
        this.isDefault = data.isDefault || false;
    }
    
    set_docId(docId) {
        this.docId = docId;
    }
    
    toFirestore() { //convert into an object firestore can handle
        return {
            uid: this.uid,
            title: this.title,
            isChecked: this.isChecked,
            isDefault: this.isDefault
        };
    }
}


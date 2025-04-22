export class Category {
    uid = null;
    title = null;
    isDefault = false;
    docId = null;

    constructor(data) {
        this.title = data.title;
        this.uid = data.uid;
        //default is generated automatically so user shoudln't be able to set it
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


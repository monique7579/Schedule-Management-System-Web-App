export class Category {
    uid = null;
    title = null;
    isDefault = false;
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


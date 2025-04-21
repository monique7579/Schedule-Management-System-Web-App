export class Category {
    name = null;
    uid = null;
    docId = null;

    constructor(data) {
        this.name = data.name;
        this.uid = data.uid;
    }
    
    set_docId(docId) {
        this.docId = docId;
    }
    
    toFirestore() {
        return {
            name: this.name,
            uid: this.uid,
        };
    }
}


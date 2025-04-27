import { 
    getFirestore,
    collection,
    addDoc,
    query,
    getDocs,
    getDoc,
    where,
    updateDoc,
    doc,
    deleteDoc,
    writeBatch,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js"
import { Event } from '../model/Event.js';
import { Category } from '../model/Category.js';
import { currentUser } from './firebase_auth.js';
import { app } from './firebase_core.js';
const db = getFirestore(app);

const COLLECTION_EVENTS = 'events'; //define collection for events
const COLLECTION_CATEGORY = 'categories'; //define collection for categories

//add new event
export async function addEvent(event) {
    const collRef = collection(db, COLLECTION_EVENTS); //get a reference to the collection
    const docRef = await addDoc(collRef, event); //call firebase function that adds new document
    // console.log("Writing event to firestore ", event);
    return docRef.id; //docId is automatically assigned by firestore
}

//update event
export async function updateEvent(docId, update) {
    const collRef = collection(db, COLLECTION_EVENTS); //get reference to collection
    const docRef = doc(collRef, docId); //grab reference to the needed document (by id)
    // console.log('Updating event in firestore')
    await updateDoc(docRef, update); //call firebase function that updates document
}

//delete event by docId
export async function deleteEvent(docId) {
    const docRef = doc(db, COLLECTION_EVENTS, docId); //get reference to document by collection and id
    // console.log('Deleting event from firestore'); 
    await deleteDoc(docRef); //call firebase function that deletes document
}

//get all events for the current user (by uid)
export async function getEventList(uid) {
    let eventList = []; //set empty array to hold result
    const q = query( 
        collection(db, COLLECTION_EVENTS),
        where('uid', '==', uid), //only gather the current user's events
    );   
    const querySnapshot = await getDocs(q); //get the documents that satisy the query
    querySnapshot.forEach((doc) => { //push into list format
        const e = doc.data(); //grab doc data
        const event = new Event(e); //create event
        event.set_docId(doc.id); //set the doc id
        eventList.push(event); //add to array
    });
    return eventList; //return complete list
}

//add new category
export async function addCategory(category) {
    const collRef = collection(db, COLLECTION_CATEGORY); //get reference to collection 
    // console.log("Writing category to firestore");
    const docRef = await addDoc(collRef, category); //call firebase function that adds document
    return docRef.id;
}

//update category using docId and update object
export async function updateCategory(docId, update) {
    const collRef = collection(db, COLLECTION_CATEGORY); //get reference to collection
    const docRef = doc(collRef, docId); //get reference to document
    const snapshot = await getDoc(docRef); //fetch the category doc to check default
    const category = snapshot.data();

    if (category.isDefault && 'title' in update) { //preserve default category
        throw new Error("Default category cannot be updated");
    }

    // console.log("Updating category from firestore");
    await updateDoc(docRef, update); //call firebase function that updates document
}

//delete category by docId
export async function deleteCategory(docId) {
    const uid = currentUser?.uid; //?. indicates currentUser can be undefined so I can just kick them out instead of crashing

    const catRef = doc(db, COLLECTION_CATEGORY, docId); //get refrence to collection 
    const snapshot = await getDoc(catRef); //get reference to document
    const category = snapshot.data();

    //every event must have a category, so preserve default category
    if (category.isDefault) {
        throw new Error("Default category cannot be deleted");
    }

    //to delete a category, all events with that category need to be assigned back to default category first
    const categories = await getCategoryList(uid);
    const defaultCategory = categories.find(cat => cat.isDefault);

    if (!defaultCategory) { // shouldn't happen, default category is auto-generated
        throw new Error("No default category found for user", uid);
    }

    // console.log('Searching for events with category:', category.title);
    const eventQ = query(
        collection(db, COLLECTION_EVENTS), //get collection
        where('uid', '==', uid), //match uid
        where('category', '==', category.title) //match title
    );
    const eventSnap = await getDocs(eventQ); //get documents that match the query
    // console.log('Matched events count:', eventSnap.size);
    const batch = writeBatch(db); //batch operation groups the updates/deletes into one atomic request

    eventSnap.forEach(docSnap => {
        const eventRef = doc(db, COLLECTION_EVENTS, docSnap.id); //get document
        // console.log("Default category title:", defaultCategory.title);
        batch.update(eventRef, { //update each event with the default category
            category: defaultCategory.title
        });
    });

    batch.delete(catRef); //finally delete the category
    // console.log('Commiting batch for delete category');
    await batch.commit(); //apply all changes in a single transaction
}

//get all categories for the current user (by uid)
export async function getCategoryList(uid) {
    let categoryList = []; //set array to hold result
    const q = query(
        collection(db, COLLECTION_CATEGORY), //get collection
        where('uid', '==', uid), //matching uid
    );    
    const querySnapshot = await getDocs(q); //get documents that match query 
    querySnapshot.forEach((doc) => { 
        const c = doc.data(); //get document data
        const category = new Category(c); //set up category with data
        category.set_docId(doc.id); //set doc id
        categoryList.push(category); //add category to list
    });

    //check for the existance of a default category
    if(!categoryList.some(cat => cat.isDefault)) { //if the default category is not in the list (doesn't exist)
        const defaultCategory = new Category( //create new category that is the default
            { title:"my calendar", uid, isDefault: true }); //'my calendar' is default for every user
        const docId = await addCategory(defaultCategory.toFirestore()); //add category to database
        defaultCategory.set_docId(docId); //set doc id
        categoryList.push(defaultCategory); //add to list
    }
    return categoryList; //return complete list
}
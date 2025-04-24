import { 
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    getDoc,
    where,
    updateDoc,
    doc,
    deleteDoc
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
    const collRef = collection(db, COLLECTION_EVENTS);
    const docRef = await addDoc(collRef, event);
    console.log("Writing event to firestore ", event);
    return docRef.id; //docId is automatically assigned by firestore
}

//update event using full event object because event is complex and has many fields
export async function updateEvent(event) {
    const docRef = doc(db, COLLECTION_EVENTS, event.docId);
    await updateDoc(docRef, event.toFirestore());
}

//delete event by docId
export async function deleteEvent(docId) {
    const docRef = doc(db, COLLECTION_EVENTS, docId);
    await deleteDoc(docRef);
}

//get single event by docId
//can use if there is an interface for getting more info after clicking an event
export async function getSingleEvent(docId) {
    const docRef = doc(db, COLLECTION_EVENTS, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) { //prevents undefined errors from constructing object just in case
        const event = new Event(docSnap.data());
        event.set_docId(docSnap.id);
        return event;
    } else {
        return null;
    }
}

//get all events for the current user (by uid)
export async function getEventList(uid) {
    let eventList = [];
    const q = query(
        collection(db, COLLECTION_EVENTS),
        where('uid', '==', uid), //only gather the current user's events
        //list is ordered elsewhere

    );   
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => { //push into list format
        const e = doc.data();
        const event = new Event(e);
        event.set_docId(doc.id); 
        eventList.push(event);
    });
    return eventList;
}

//add new category
export async function addCategory(category) {
    const collRef = collection(db, COLLECTION_CATEGORY);
    const docRef = await addDoc(collRef, category);
    console.log("Writing category to firestore");
    return docRef.id;
}

//update category using docId and update object
export async function updateCategory(docId, update) {
    const docRef = doc(db, COLLECTION_CATEGORY, docId);
    const snapshot = await getDoc(docRef);
    const category = snapshot.data();

    if (category.isDefault) { //preserve default category
        throw new Error("Default category cannot be updated");
    }

    await updateDoc(docRef, update);
}

//delete category by docId
export async function deleteCategory(docId) {
    const uid = currentUser?.uid;

    const catRef = doc(db, COLLECTION_CATEGORY, docId);
    const snapshot = await getDoc(catRef); 
    const category = snapshot.data();

    //every event must have a category, so preserve default category
    if (category.isDefault) {
        throw new Error("Default category cannot be deleted");
    }

    //to delete a category, all events with that category need to be assigned back to default category first
    //alternatively we could delete all events under the category being deleted !!
    const categories = await getCategoryList();
    const defaultCategory = categories.find(cat => cat.isDefault);

    const eventQ = query(
        collection(db, COLLECTION_EVENTS),
        where('uid', '==', uid),
        where('category', '==', docId)
    );
    const eventSnap = await getDocs(eventQ);
    const batch = writeBatch(db); //batch operation groups the updates/delets into one atomic request

    eventSnap.forEach(docSnap => {
        const eventRef = doc(db, COLLECTION_EVENTS, docSnap.id);
        batch.update(eventRef, { //update each event with the default category
            category: defaultCategory.docId 
        });
    });

    batch.delete(catRef); //finally delete the category
    await batch.commit(); //apply all changes in a single transaction
}

//get all categories for the current user (by uid)
export async function getCategoryList(uid) {
    let categoryList = [];
    const q = query(
        collection(db, COLLECTION_CATEGORY),
        where('uid', '==', uid),
        //list is ordered elsewhere
    );    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const c = doc.data();
        const category = new Category(c);
        category.set_docId(doc.id);
        categoryList.push(category);
    });

    //if the user has no categories, create a default category
    if (categoryList.length === 0) {
        const defaultCategory = new Category(
            { title:"my calendar", uid, isDefault: true }); //'my calendar' is default for every user
        const docId = await addCategory(defaultCategory.toFirestore());
        defaultCategory.set_docId(docId);
        categoryList.push(defaultCategory);
    }

    return categoryList;
}

//return list of all events from the given category
export async function getEventByCategory(category) {
    const uid = currentUser?.uid;

    let results = [];
    const q = query(
        collection(db, COLLECTION_EVENTS),
        where('uid', '==', uid),
        where('category', '==', category)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
        const event = new Event(doc.data());
        event.set_docId(doc.id);
        results.push(event);
    });

    return results;
}

//firestore doesn't support query predicate "contains"
//but we can search equivalence of the word or beginning of word
//it is also case-sensitive but we are storing everything lowercase
export async function getEventByTitle(keyword) {
    const uid = currentUser?.uid;

    let results = [];
    const q = query(
        collection(db, COLLECTION_EVENTS),
        where('uid', '==', uid),
        where('title', '>=', keyword),
        where('title', '<=', keyword + '\uf8ff') //search by prefix
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
        const event = new Event(doc.data());
        event.set_docId(doc.id);
        results.push(event);
    });

    return results;
}

//search based on the finish date
// export async function searchEventByEnd(date) {
//     const uid = currentUser?.uid;

//     let results =[];
//     const q = query(
//         collection(db, COLLECTION_EVENTS),
//         where('uid', '==', uid),
//         where('finish', '==', date)
//     );

//     const querySnapshot = await getDocs(q);
//     querySnapshot.forEach(doc => {
//         const event = new Event(doc.data());
//         event.set_docId(doc.id);
//         results.push(event);
//     });

//     return results;
// }
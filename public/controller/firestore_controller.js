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

//note: where functions that interact with the firestore database are defined
//i.e. add event { code to add an event as a saved document in firestore}

const COLLECTION_EVENTS = 'events';
const COLLECTION_CATEGORY = 'categories';

//add new event
export async function addEvent(event) {
    const collRef = collection(db, COLLECTION_EVENTS);
    const docRef = await addDoc(collRef, event.toFirestore());
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

    if (docSnap.exists()) {
        const event = new Event(docSnap.data());
        event.set_docId(docSnap.id);
        return event;
    } else {
        return null;
    }
}

//get all events for the current user
export async function getEventList(uid) {
    // const uid = currentUser?.uid;

    let eventList = [];
    const q = query(
        collection(db, COLLECTION_EVENTS),
        where('uid', '==', uid), //only gather the current user's events
        orderBy('start', 'desc') //want to order by date? descending?
    );   
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
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

    if (category.isDefault) {
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

    //to delete a category, all events with that category need to be set back to default first
    const categories = await getCategoryList();
    const defaultCategory = categories.find(cat => cat.isDefault);

    const eventQ = query(
        collection(db, COLLECTION_EVENTS),
        where('uid', '==', uid),
        where('category', '==', docId)
    );
    const eventSnap = await getDocs(eventQ);
    const batch = writeBatch(db);

    eventSnap.forEach(doc => {
        batch.update(eventRef, { 
            category: defaultCategory.docId });
    });

    batch.delete(catRef);
    await batch.commit();
}

//get all categories for the current user
export async function getCategoryList(uid) { //pass uid as parameter instead of grabbing it within function
    // const uid = currentUser?.uid;

    let categoryList = [];
    const q = query(
        collection(db, COLLECTION_CATEGORY),
        where('uid', '==', uid), //ordered later
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
            { title:"My Category", uid, isDefault: true });
        const docId = await addCategory(defaultCategory.toFirestore());
        defaultCategory.set_docId(docId);
        categoryList.push(defaultCategory);
    }

    return categoryList;
}
import { 
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js"
import { Event } from '../model/Event.js';

import {app} from './firebase_core.js';
const db = getFirestore(app);

//note: where functions that interact with the firestore database are defined
//i.e. add event { code to add an event as a saved document in firestore}

const COLLECTION_EVENTS = 'events';

//add a new event
export async function addEvent(event) {
    const eventsRef = collection(db, COLLECTION_EVENTS);
    const docRef = await addDoc(eventsRef, event);
    return docRef.id;
}

//to do: update event

//to do: delete event 

//to do: get single event?

//retrieve all events for the current user using their uid
export async function getEventList(uid) {
    let eventList = [];
    const q = query(collection(db, COLLECTION_EVENTS),
        where('uid', '==', uid),    //only gather the current user's events
        orderBy('date', 'desc'));   //want to order by date? descending?

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const e = doc.data();
        const event = new Event(e);
        event.set_docId(doc.id);    //if the list will be for read only, this may not be necessary
        eventList.push(event);
    });

    return eventList;
}

//to do: add category

//to do: delete category

//to do: get category list
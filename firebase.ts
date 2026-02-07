// Standard imports for bundler environment (Vite)
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAjpS8IWMJmlEHw6_7VRHATbLWJeHzbCYU",
  authDomain: "fisicalplanner.firebaseapp.com",
  databaseURL: "https://fisicalplanner-default-rtdb.firebaseio.com",
  projectId: "fisicalplanner",
  storageBucket: "fisicalplanner.firebasestorage.app",
  messagingSenderId: "439728765666",
  appId: "1:439728765666:web:884c65f808b9337a31bcbb",
  measurementId: "G-8G6JJXX00Z"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Firestore instance
const auth = firebase.auth();
let messaging = null;

try {
  messaging = firebase.messaging();
} catch (e) {
  console.log('Firebase Messaging not supported in this environment');
}

// V9 compatibility shims
// These functions mimic the v9 modular API so the rest of the app doesn't need to change.

// Helper function to recursively remove undefined properties from an object/array
const cleanData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => cleanData(item));
  } else if (data !== null && typeof data === 'object') {
    const newObj: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        newObj[key] = cleanData(data[key]);
      } else {
          // Log only in development or debug scenarios to avoid clutter, 
          // but keeping it here as requested for debugging data issues.
          // console.warn(`[Firebase Shim] Removing undefined key: ${key}`);
      }
    });
    return newObj;
  }
  return data;
};


// Firestore
const collection = (firestoreInstance: any, path: any, ...pathSegments: any[]) => {
    const fullPath = [path, ...pathSegments].join('/');
    return firestoreInstance.collection(fullPath);
};

const collectionGroup = (firestoreInstance: any, collectionId: string) => {
    return firestoreInstance.collectionGroup(collectionId);
};

const doc = (firestoreInstance: any, path: any, ...pathSegments: any[]) => {
    const fullPath = [path, ...pathSegments].join('/');
    return firestoreInstance.doc(fullPath);
}

const getDoc = (docRef: any) => docRef.get();
const getDocs = (queryOrCollectionRef: any) => queryOrCollectionRef.get();
const setDoc = (docRef: any, data: any, options: any) => docRef.set(cleanData(data), options);
const addDoc = (collectionRef: any, data: any) => collectionRef.add(cleanData(data));
const updateDoc = (docRef: any, data: any) => docRef.update(cleanData(data));
const deleteDoc = (docRef: any) => docRef.delete();
const onSnapshot = (ref: any, onNext: any, onError: any) => ref.onSnapshot(onNext, onError);

const writeBatch = (firestoreInstance: any) => {
    const batch = firestoreInstance.batch();
    return {
        set: (docRef: any, data: any) => batch.set(docRef, cleanData(data)),
        update: (docRef: any, data: any) => batch.update(docRef, cleanData(data)),
        delete: (docRef: any) => batch.delete(docRef),
        commit: () => batch.commit()
    };
};

const where = (fieldPath: any, opStr: any, value: any) => ({ type: 'where', payload: [fieldPath, opStr, value] });
const orderBy = (fieldPath: any, directionStr: any) => ({ type: 'orderBy', payload: [fieldPath, directionStr || 'asc'] });

const query = (queryable: any, ...queryConstraints: any[]) => {
    let q = queryable;
    for (const constraint of queryConstraints) {
        q = q[constraint.type](...constraint.payload);
    }
    return q;
};

// Auth
const createUserWithEmailAndPassword = (authInstance: any, email: any, password: any) => authInstance.createUserWithEmailAndPassword(email, password);
const signInWithEmailAndPassword = (authInstance: any, email: any, password: any) => authInstance.signInWithEmailAndPassword(email, password);
const onAuthStateChanged = (authInstance: any, observer: any) => authInstance.onAuthStateChanged(observer);
const signOut = (authInstance: any) => authInstance.signOut();

export { 
  db, // Firestore
  auth,
  // Firestore
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  where,
  orderBy,
  // Auth
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  // Messaging
  messaging
};
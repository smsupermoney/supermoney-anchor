// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig1 = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const firebaseConfig2 = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_2,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_2,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_2,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_2,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_2,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_2
};

function initializeAppSafely(config: object, appName: string): FirebaseApp {
    try {
        return getApp(appName);
    } catch (e) {
        return initializeApp(config, appName);
    }
}

const app1: FirebaseApp = initializeAppSafely(firebaseConfig1, 'app1');
const db1: Firestore = getFirestore(app1, "live");

let app2: FirebaseApp;
let db2: Firestore;

if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_2) {
    app2 = initializeAppSafely(firebaseConfig2, 'app2');
    // Default to the standard database instance for the second project to avoid NOT_FOUND errors
    db2 = getFirestore(app2);
} else {
    // If the second project is not configured, we can point db2 to db1
    // or handle it as an unconfigured service.
    console.warn("Firebase project 'db2' is not configured. Falling back to 'db1'.");
    app2 = app1;
    db2 = db1;
}


export { db1, db2 };

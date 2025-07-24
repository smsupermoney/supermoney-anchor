
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

let app1: FirebaseApp;
let db1: Firestore;

let app2: FirebaseApp;
let db2: Firestore;


if (getApps().length === 0) {
    app1 = initializeApp(firebaseConfig1, 'app1');
    app2 = initializeApp(firebaseConfig2, 'app2');
} else {
    app1 = getApp('app1');
    app2 = getApp('app2');
}

db1 = getFirestore(app1);
db2 = getFirestore(app2);

export { db1, db2 };

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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


// Initialize Firebase
const apps = getApps();
const app1 = apps.find(app => app.name === 'app1') || initializeApp(firebaseConfig1, 'app1');
const db1 = getFirestore(app1);


const app2 = apps.find(app => app.name === 'app2') || initializeApp(firebaseConfig2, 'app2');
const db2 = getFirestore(app2);

export { db1,db2 };

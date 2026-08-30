// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACdXzTO5icuRNN6kWPtaGWM8zcsoR6Zbw",
  authDomain: "travelandtours-20d29.firebaseapp.com",
  projectId: "travelandtours-20d29",
  storageBucket: "travelandtours-20d29.firebasestorage.app",
  messagingSenderId: "289827591191",
  appId: "1:289827591191:web:6af1428fced0895eea7852",
  measurementId: "G-P1N55P62Y3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };

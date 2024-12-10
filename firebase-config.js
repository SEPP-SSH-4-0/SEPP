import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, push, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCoUwd3-ObfcDJ4rrUzjn1oJdQQOgo_sl0",
    authDomain: "ssh-app-b57f1.firebaseapp.com",
    databaseURL: "https://ssh-app-b57f1-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "ssh-app-b57f1",
    storageBucket: "ssh-app-b57f1.firebasestorage.app",
    messagingSenderId: "1044776285843",
    appId: "1:1044776285843:web:ef25fce4a0444c71d73f66",
    measurementId: "G-L8BXNT5N3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Initialise Firebase services
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
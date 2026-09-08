import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyD71KkZr2qTSrquoWoxUo9NZ97qmPe0_8s",

    authDomain:
        "mess-manager-76721.firebaseapp.com",

    projectId:
        "mess-manager-76721",

    storageBucket:
        "mess-manager-76721.firebasestorage.app",

    messagingSenderId:
        "159427434236",

    appId:
        "1:159427434236:web:7adc05bfbf514977d0a979",

    measurementId:
        "G-V837CGVQPH"

};


const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


export {
    app,
    auth,
    db
};
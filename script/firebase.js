import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyB0gtamtMAx3FW4jl6FadNmpxaliAQzJhM",

    authDomain: "mtsprofypisyahda-syahda.firebaseapp.com",

    projectId: "mtsprofypisyahda-syahda",

    storageBucket: "mtsprofypisyahda-syahda.firebasestorage.app",

    messagingSenderId: "996556119331",

    appId: "1:996556119331:web:32f06258a5bd0a91cec096"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };

console.log("✅ Firebase Connected");
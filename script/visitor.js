import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =======================================
// FORMAT TANGGAL
// =======================================

const now = new Date();

const day =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

const month =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0");

const year = String(now.getFullYear());

// =======================================
// SATU KALI PER HARI
// =======================================

const key = "visit_" + day;

if (!localStorage.getItem(key)) {

    localStorage.setItem(key, "1");

    addVisitor();

}

// =======================================

async function addVisitor() {

    await updateCounter("summary", "today");
    await updateCounter("summary", "month");
    await updateCounter("summary", "year");
    await updateCounter("summary", "alltime");

    await updateCounter("daily", day);
    await updateCounter("monthly", month);
    await updateCounter("yearly", year);

}

// =======================================

async function updateCounter(collection, documentId) {

    const ref = doc(db, collection, documentId);

    const snap = await getDoc(ref);

    if (!snap.exists()) {

        await setDoc(ref, {
            total: 1
        });

    } else {

        await updateDoc(ref, {
            total: increment(1)
        });

    }

}

// =======================================
// AMBIL DATA UNTUK WEBSITE
// =======================================

export async function getStatistic() {

    return {

        today: await read("summary", "today"),

        month: await read("summary", "month"),

        year: await read("summary", "year"),

        alltime: await read("summary", "alltime")

    };

}

async function read(collection, documentId) {

    const ref = doc(db, collection, documentId);

    const snap = await getDoc(ref);

    if (!snap.exists()) return 0;

    return snap.data().total;

}
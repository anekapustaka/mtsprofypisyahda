import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =======================================
// TANGGAL
// =======================================

const now = new Date();

const day =
`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

const month =
`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

const year =
`${now.getFullYear()}`;


// =======================================
// SATU VISITOR PER HARI
// =======================================

const visitKey = "visit_" + day;

async function init(){

    if(!localStorage.getItem(visitKey)){

        localStorage.setItem(visitKey,"1");

        await increaseVisitor();

    }

    await renderStatistic();

}

init();


// =======================================
// TAMBAH VISITOR
// =======================================

async function increaseVisitor(){

    await increase("daily",day);

    await increase("monthly",month);

    await increase("yearly",year);

    await increase("summary","alltime");

    await collectVisitorInfo();

}

async function increase(collection,id){

    const ref = doc(db,collection,id);

    const snap = await getDoc(ref);

    if(!snap.exists()){

        await setDoc(ref,{
            total:1
        });

    }else{

        await updateDoc(ref,{
            total:increment(1)
        });

    }

}



// =======================================
// AMBIL DATA
// =======================================

async function getTotal(collection,id){

    const ref = doc(db,collection,id);

    const snap = await getDoc(ref);

    if(!snap.exists()) return 0;

    return snap.data().total ?? 0;

}



// =======================================
// RENDER KE HTML
// =======================================

async function renderStatistic(){

    const today =
        await getTotal("daily",day);

    const monthCount =
        await getTotal("monthly",month);

    const yearCount =
        await getTotal("yearly",year);

    const all =
        await getTotal("summary","alltime");


    setText("todayVisitors",today);

    setText("monthVisitors",monthCount);

    setText("yearVisitors",yearCount);

    setText("allVisitors",all);

    setText(
        "lastUpdate",
        new Date().toLocaleString("id-ID")
    );

}



function setText(id,value){

    const el=document.getElementById(id);

    if(el){

        el.textContent =
            Number(value).toLocaleString("id-ID");

    }

}

// =====================================
// LOKASI + DEVICE + BROWSER
// =====================================

async function collectVisitorInfo(){

    try{

        const res = await fetch("https://ipapi.co/json/");

        const data = await res.json();

        const country = data.country_name || "Unknown";

        const city = data.city || "Unknown";

        const browser = detectBrowser();

        const device = detectDevice();

        await increase("country",country);

        await increase("city",city);

        await increase("browser",browser);

        await increase("device",device);

        renderLocation();

        renderBrowser();

        renderDevice();

    }

    catch(e){

        console.log(e);

    }

}



function detectBrowser(){

    const ua = navigator.userAgent;

    if(ua.includes("Edg")) return "Microsoft Edge";

    if(ua.includes("Chrome")) return "Google Chrome";

    if(ua.includes("Firefox")) return "Firefox";

    if(ua.includes("Safari")) return "Safari";

    return "Lainnya";

}



function detectDevice(){

    if(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent))

        return "Mobile";

    return "Desktop";

}

async function readCollection(name){

    const snapshot = await getDocs(collection(db,name));

    let result=[];

    snapshot.forEach(doc=>{

        result.push({

            id:doc.id,

            total:doc.data().total

        });

    });

    result.sort((a,b)=>b.total-a.total);

    return result;

}

// =====================================
// RENDER LOKASI
// =====================================

async function renderLocation(){

    const list = await readCollection("country");

    const box = document.getElementById("locationList");

    if(!box) return;

    if(list.length===0){

        box.innerHTML=`
        <div class="location-item">
            <span class="location-name">Belum ada data</span>
            <span class="location-count">0</span>
        </div>`;

        return;

    }

    box.innerHTML="";

    list.slice(0,10).forEach(item=>{

        box.innerHTML+=`
        <div class="location-item">
            <span class="location-name">${item.id}</span>
            <span class="location-count">${Number(item.total).toLocaleString("id-ID")}</span>
        </div>`;

    });

}



// =====================================
// RENDER BROWSER
// =====================================

async function renderBrowser(){

    const list = await readCollection("browser");

    const box = document.getElementById("browserList");

    if(!box) return;

    if(list.length===0){

        box.innerHTML=`
        <div class="location-item">
            <span class="location-name">Belum ada data</span>
            <span class="location-count">0</span>
        </div>`;

        return;

    }

    box.innerHTML="";

    list.forEach(item=>{

        box.innerHTML+=`
        <div class="location-item">
            <span class="location-name">${item.id}</span>
            <span class="location-count">${Number(item.total).toLocaleString("id-ID")}</span>
        </div>`;

    });

}



// =====================================
// RENDER DEVICE
// =====================================

async function renderDevice(){

    const list = await readCollection("device");

    const box = document.getElementById("deviceList");

    if(!box) return;

    if(list.length===0){

        box.innerHTML=`
        <div class="location-item">
            <span class="location-name">Belum ada data</span>
            <span class="location-count">0</span>
        </div>`;

        return;

    }

    box.innerHTML="";

    list.forEach(item=>{

        box.innerHTML+=`
        <div class="location-item">
            <span class="location-name">${item.id}</span>
            <span class="location-count">${Number(item.total).toLocaleString("id-ID")}</span>
        </div>`;

    });

}



// =====================================
// AUTO REFRESH SETIAP 15 DETIK
// =====================================

setInterval(async()=>{

    await renderStatistic();

    await renderLocation();

    await renderBrowser();

    await renderDevice();

},15000);



// =====================================
// LOAD PERTAMA
// =====================================

window.addEventListener("load",async()=>{

    await renderStatistic();

    await renderLocation();

    await renderBrowser();

    await renderDevice();

});



// =====================================
// ANIMASI ANGKA
// =====================================

function animateValue(id,end){

    const el=document.getElementById(id);

    if(!el) return;

    const start=0;

    const duration=700;

    const step=Math.ceil(end/40);

    let current=0;

    const timer=setInterval(()=>{

        current+=step;

        if(current>=end){

            current=end;

            clearInterval(timer);

        }

        el.textContent=current.toLocaleString("id-ID");

    },duration/40);

}



// =====================================
// VERSI DENGAN ANIMASI
// =====================================

async function renderStatisticAnimated(){

    const today=await getTotal("daily",day);

    const monthCount=await getTotal("monthly",month);

    const yearCount=await getTotal("yearly",year);

    const all=await getTotal("summary","alltime");

    animateValue("todayVisitors",today);

    animateValue("monthVisitors",monthCount);

    animateValue("yearVisitors",yearCount);

    animateValue("allVisitors",all);

    setText(
        "lastUpdate",
        new Date().toLocaleString("id-ID")
    );

}



// Override render awal memakai animasi
renderStatistic = renderStatisticAnimated;
//--- FIREBASE CONFIG ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9Y9fOZu6uXV8f5_mZVOU_VqORlu014gs",
  authDomain: "sapa-lost-and-found.firebaseapp.com",
  projectId: "sapa-lost-and-found",
  storageBucket: "sapa-lost-and-found.firebasestorage.app",
  messagingSenderId: "790156230729",
  appId: "1:790156230729:web:9df47808e8d9017fcebf98",
  measurementId: "G-PL1L26HRV5"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

console.log("Firestore Connected!");

// --- DATA MANAGEMENT ---
let currentUser = JSON.parse(localStorage.getItem('sapa_user')) || null;
let reports = JSON.parse(localStorage.getItem('sapa_reports')) || [
    { id: 1, type: 'lost', name: 'กระเป๋าตังค์สีดำ', location: 'โรงอาหาร', time: '12:30', reporter: '12345', status: 'searching', date: new Date().toISOString() },
    { id: 2, type: 'found', name: 'กุญแจรถมอเตอร์ไซค์', location: 'สนามบาส', time: '15:00', reporter: '54321', status: 'found', date: new Date().toISOString() }
];

// --- THEME MANAGEMENT ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('sapa_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icons = [document.getElementById('theme-icon'), document.getElementById('theme-icon-auth')];
    icons.forEach(icon => {
        if (!icon) return;
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

// --- NAVIGATION & UI ---
window.openModal = function(id) {
    document.getElementById(id).classList.add('active');
}

window.closeModal = function(id) {
    document.getElementById(id).classList.remove('active');
}

// --- AUTH ---
window.handleStudentLogin = async function () {

    const password =
        document.getElementById("studentPasswordInput").value;

    if (!password) {

        alert("กรุณากรอกรหัสผ่าน");
        return;

    }

    try {

        const response = await fetch(
            "https://script.google.com/macros/s/AKfycby-J4kzMcDSc1ySXRLJKo2cwmO-b0U5wjAmHPEHtFPSO-vBmNSEqZ_1XJvxNhL2BbKy/exec"
        );

        const users = await response.json();

        const user = users.find(
            u => u.password === password
        );

        if (user) {

            currentUser = {
                username: user.username,
                role: user.role
            };

            localStorage.setItem(
                "sapa_user",
                JSON.stringify(currentUser)
            );

            alert("Login สำเร็จ");

            window.location.href = "dashboard.html";

        } else {

            alert("รหัสผ่านไม่ถูกต้อง");

        }

    } catch (error) {

        console.error(error);

        alert("เชื่อมต่อระบบไม่ได้");

    }

}

function handleAdminLogin() {
    const id = document.getElementById('adminIdInput').value;
    const password = document.getElementById('adminPasswordInput').value;
    
    if (!id) {
        alert('กรุณาใส่รหัสผู้ดูแล');
        return;
    }
    
    if (!password) {
        alert('กรุณาใส่รหัสผ่าน');
        return;
    }
    
    // Admin credentials check (for demo: admin ID '20936')
    if (id === '20936' && password === 'sapa@69') {
        currentUser = { id: id, role: 'admin', name: 'ผู้ดูแลระบบ' };
        saveAuth();
        closeModal('adminLoginModal');
        window.location.href = 'admin.html';
    } else {
        alert('รหัสผู้ดูแลหรือรหัสผ่านไม่ถูกต้อง');
    }
}

function handleLogin() {
    const id = document.getElementById('studentIdInput').value;
    if (id === '20936') {
        currentUser = { id: '20936', role: 'admin', name: 'เสฏฐวุฒิ ศรีภิรมย์' };
        saveAuth();
        window.location.href = 'admin.html';
    } else if (id.length === 5) {
        currentUser = { id: id, role: 'student' };
        saveAuth();
        window.location.href = 'dashboard.html';
    } else {
        alert('กรุณาใส่รหัสนักเรียน 5 หลัก');
    }
}

function saveAuth() {
    localStorage.setItem('sapa_user', JSON.stringify(currentUser));
    updateNav();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('sapa_user');
    window.location.href = 'index.html';
}

function updateNav() {
    const guest = document.getElementById('guest-btns');
    const auth = document.getElementById('auth-actions');
    if (!guest || !auth) return;

    if (currentUser) {
        guest.classList.add('hidden');
        auth.classList.remove('hidden');
        if (document.getElementById('display-student-id')) {
            document.getElementById('display-student-id').innerText = currentUser.id;
        }
    } else {
        guest.classList.remove('hidden');
        auth.classList.add('hidden');
    }
}

// --- NOTIFICATIONS ---
function checkMatches() {
    if (!currentUser) return;
    const myLost = reports.filter(r => r.reporter === currentUser.id && r.type === 'lost');
    const othersFound = reports.filter(r => r.reporter !== currentUser.id && r.type === 'found');
    
    const match = myLost.some(l => othersFound.some(f => f.itemType === l.itemType));
    if (match && document.getElementById('notif-dot')) {
        document.getElementById('notif-dot').classList.remove('hidden');
    }
}

function toggleNotifications() {
    const dot = document.getElementById('notif-dot');
    if (dot && !dot.classList.contains('hidden')) {
        alert('แจ้งเตือน: ตรวจพบรายการที่ใกล้เคียงกับของที่คุณทำหาย! กรุณาตรวจสอบในหน้าค้นหา');
        dot.classList.add('hidden');
    } else {
        alert('ยังไม่มีการแจ้งเตือนใหม่');
    }
}

// --- GIMMICKS: SCROLL EFFECTS ---
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(backToTop);

    backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    window.onscroll = () => {
        // Navbar glass effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            backToTop.classList.add('visible');
        } else {
            navbar.classList.remove('scrolled');
            backToTop.classList.remove('visible');
        }

        // Scroll reveal
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const revealTop = el.getBoundingClientRect().top;
            const revealPoint = 150;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };
}

// --- SHARED INITIALIZATION ---
window.addEventListener('load', () => {

    // Apply saved theme
    const savedTheme = localStorage.getItem('sapa_theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);

    updateThemeIcon(savedTheme);

    updateNav();

    if (currentUser) checkMatches();

    initScrollEffects();

    // Load pages
    const path = window.location.pathname;

    if (path.includes('history.html')) {
        renderHistory();
    }

    if (path.includes('search.html')) {
        renderSearch();
    }

    if (path.includes('admin.html')) {
        renderAdmin();
    }

    // Close modal
    window.onclick = function(event) {

        if (event.target.className === 'modal active') {

            event.target.classList.remove('active');

        }

    };

});

window.submitReport = async function(type) {

    const form = document.getElementById('lostForm');

    const formData = new FormData(form);

    const newReport = {

        type: type,

        reporterName: formData.get('reporterName'),

        contactNumber: formData.get('contactNumber'),

        itemType: formData.get('itemType'),

        features: formData.get('features'),

        location: formData.get('location'),

        time: formData.get('timeEstimate'),

        status: 'searching',

        createdAt: new Date()

    };

    try {

        await addDoc(collection(db, "lost_reports"), newReport);

        alert('บันทึกข้อมูลเรียบร้อยแล้ว!');

        window.location.href = 'history.html';

    } catch(error) {

        console.error(error);

        alert('เกิดข้อผิดพลาด');

    }

}

window.submitFoundReport = async function () {

    const form = document.getElementById('foundForm');

    const formData = new FormData(form);

    const newReport = {

        finderName: formData.get('reporterName'),

        contactNumber: formData.get('contactNumber'),

        itemType: formData.get('itemType'),

        location: formData.get('location'),

        status: 'found',

        createdAt: new Date()

    };

    try {

        await addDoc(collection(db, "found_reports"), newReport);

        alert('บันทึกข้อมูลของที่พบเรียบร้อยแล้ว!');

        window.location.href = 'history.html';

    } catch(error) {

        console.error(error);

        alert('เกิดข้อผิดพลาด');

    }

}
window.renderHistory = async function () {

    const container = document.getElementById('historyContainer');

    if (!container) return;

    container.innerHTML = "<p>กำลังโหลดข้อมูล...</p>";

    try {

        const q = query(
            collection(db, "lost_reports"),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        container.innerHTML = "";

        querySnapshot.forEach((doc) => {

            const data = doc.data();

            container.innerHTML += `

                <div class="item-card">

                    <div class="item-content">

                        <div class="item-status-row">
                            <span class="status-badge status-searching">
                                ${data.status || 'searching'}
                            </span>
                        </div>

                        <h3 class="item-title">
                            ${data.features || 'ไม่ระบุ'}
                        </h3>

                        <div class="item-details">

                            <div class="item-detail-row">
                                <i class="fa-solid fa-layer-group"></i>
                                <span>${data.itemType || 'ไม่ระบุ'}</span>
                            </div>

                            <div class="item-detail-row">
                                <i class="fa-solid fa-location-dot"></i>
                                <span>${data.location || 'ไม่ระบุ'}</span>
                            </div>

                            <div class="item-detail-row">
                                <i class="fa-solid fa-clock"></i>
                                <span>${data.time || 'ไม่ระบุ'}</span>
                            </div>

                            <div class="item-detail-row">
                                <i class="fa-solid fa-user"></i>
                                <span>${data.reporterName || 'ไม่ระบุ'}</span>
                            </div>

                        </div>

                    </div>

                </div>

            `;

        });

    } catch(error) {

        console.error(error);

        container.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ</p>";

    }

}

window.addEventListener("load", () => {

    const user =
        JSON.parse(localStorage.getItem("sapa_user"));

    if (user && document.getElementById("displayUsername")) {

        document.getElementById("displayUsername").innerText =
            user.username;

    }

});

window.addEventListener("load", () => {

    const user =
        JSON.parse(localStorage.getItem("sapa_user"));

    if (user) {

        // แสดงชื่อด้านบน Navbar
        const displayUsername =
            document.getElementById("displayUsername");

        if (displayUsername) {

            displayUsername.innerText =
                user.username;

        }

        // แสดงชื่อในข้อความต้อนรับ
        const displayStudentId =
            document.getElementById("display-student-id");

        if (displayStudentId) {

            displayStudentId.innerText =
                user.username;

        }

    }

});


// ==========================================
// 🌟 ส่วนที่เพิ่มเข้าไปใหม่: ระบบดึงข้อมูลค้นหาจาก Real Firebase
// ==========================================
window.renderSearch = async function() {
    const list = document.getElementById('search-results');
    if (!list) return;

    // เติมข้อความระหว่างรอโหลด
    list.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>กำลังดึงข้อมูลจากระบบออนไลน์...</p>";

    try {
        // 1. ดึงข้อมูลจากคอลเลกชัน lost_reports บน Cloud Firestore
        const q = query(collection(db, "lost_reports"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        let onlineReports = [];
        querySnapshot.forEach((doc) => {
            onlineReports.push({ id: doc.id, ...doc.data() });
        });

        // 2. ตรวจสอบช่องพิมพ์ค้นหาบนหน้าเว็บ search.html
        const searchInput = document.getElementById('mainSearchInput');
        const term = searchInput ? searchInput.value.toLowerCase() : "";

        // 3. กรองข้อมูลตามที่พิมพ์ (ค้นหาจาก ชื่อ, สถานที่, ประเภท, ลักษณะ)
        const filtered = onlineReports.filter(r => 
            (r.reporterName && r.reporterName.toLowerCase().includes(term)) || 
            (r.location && r.location.toLowerCase().includes(term)) ||
            (r.itemType && r.itemType.toLowerCase().includes(term)) ||
            (r.features && r.features.toLowerCase().includes(term))
        );

        // 4. สั่งล้างข้อมูลเก่าแล้วเปิดการ์ดข้อมูลชุดจริงขึ้นแสดงผล
        list.innerHTML = '';

        if (filtered.length === 0) {
            list.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>ไม่พบรายการสิ่งของที่ค้นหา</p>";
            return;
        }

        filtered.forEach(r => {
            list.innerHTML += `
                <div class="item-card">
                    <div class="item-img-placeholder">
                        <i class="fa-solid ${r.type === 'lost' ? 'fa-magnifying-glass' : 'fa-box'}"></i>
                        <span class="item-type-badge badge-${r.type || 'lost'}">${r.type || 'lost'}</span>
                    </div>
                    <div class="item-content">
                        <div class="item-status-row">
                            <span class="status-badge status-${r.status || 'searching'}">${r.status || 'searching'}</span>
                        </div>
                        <span class="item-title">${r.reporterName || 'ไม่ระบุชื่อ'} (${r.itemType || 'ทั่วไป'})</span>
                        <div class="item-details">
                            <div class="item-detail-row"><i class="fa-solid fa-location-dot"></i> ${r.location || 'ไม่ระบุสถานที่'}</div>
                            <div class="item-detail-row"><i class="fa-solid fa-clock"></i> ${r.time || 'ไม่ระบุเวลา'}</div>
                            <div class="item-detail-row" style="font-size: 0.85em; color: #666; margin-top: 5px;">
                                <i class="fa-solid fa-asterisk"></i> ลักษณะเด่น: ${r.features || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        // 5. ดักจับเมื่อผู้ใช้งานมีการกดคีย์บอร์ดพิมพ์ค้นหาในกล่องข้อความ
        if (searchInput && !searchInput.dataset.listenerAttached) {
            searchInput.addEventListener('input', () => window.renderSearch());
            searchInput.dataset.listenerAttached = "true"; // มาร์คไว้เพื่อไม่ให้สร้าง Event ซ้ำซ้อน
        }

    } catch (error) {
        console.error("Firebase Search Error: ", error);
        list.innerHTML = "<p style='text-align:center; grid-column: 1/-1; color:red;'>ระบบขัดข้อง ไม่สามารถดึงข้อมูลได้</p>";
    }
};

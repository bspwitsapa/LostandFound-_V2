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
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// --- AUTH ---
function handleLogin() {
    const id = document.getElementById('studentIdInput').value;
    if (id === 'admin') {
        currentUser = { id: 'admin', role: 'admin' };
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

    // Auto-run page specific renders
    const path = window.location.pathname;
    if (path.includes('history.html')) renderHistory();
    if (path.includes('search.html')) renderSearch();
    if (path.includes('admin.html')) renderAdmin();

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.className === 'modal active') {
            event.target.classList.remove('active');
        }
    }
});

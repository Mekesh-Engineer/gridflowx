// Slide Data
const slides = [
    {
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
        title: "LOTUS GT 430",
        subtitle: "Best cars"
    },
    {
        image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80",
        title: "CLASSIC MUSTANG",
        subtitle: "Timeless design"
    },
    {
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        title: "PORSCHE 911",
        subtitle: "Iconic performance"
    },
    {
        image: "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?auto=format&fit=crop&w=1200&q=80",
        title: "JAGUAR E-TYPE",
        subtitle: "British classic"
    },
    {
        image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80",
        title: "ALFA ROMEO",
        subtitle: "Italian elegance"
    }
];

let currentSlide = 0;

// DOM Elements
const slideImage = document.getElementById('slideImage');
const slideTitle = document.getElementById('slideTitle');
const slideSubtitle = document.getElementById('slideSubtitle');
const slideIndicator = document.getElementById('slideIndicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loginBtn = document.getElementById('loginBtn');
const forgotPassword = document.getElementById('forgotPassword');
const searchInput = document.getElementById('searchInput');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const toastContainer = document.getElementById('toastContainer');
const username = document.getElementById('username');
const password = document.getElementById('password');

// Carousel Functions
function showSlide(index) {
    currentSlide = index;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    if (currentSlide >= slides.length) currentSlide = 0;
    
    const slide = slides[currentSlide];
    slideImage.style.opacity = '0';
    
    setTimeout(() => {
        slideImage.src = slide.image;
        slideTitle.textContent = slide.title;
        slideSubtitle.textContent = slide.subtitle;
        slideIndicator.textContent = `0${currentSlide + 1}/0${slides.length}`;
        slideImage.style.opacity = '1';
    }, 200);
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-gray-900';
    toast.className = `${bgColor} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium toast flex items-center gap-3 min-w-[280px]`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-auto opacity-70 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 3000);
}

// Initialize Carousel
function initializeCarousel() {
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') previousSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
}

// Initialize Login
function initializeLogin() {
    loginBtn.addEventListener('click', () => {
        const user = username.value.trim();
        const pass = password.value.trim();
        
        if (!user || !pass) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        showToast('Login successful — prototype mode.', 'success');
    });
    
    forgotPassword.addEventListener('click', () => {
        showToast('Password recovery is not connected in this prototype.');
    });
}

// Initialize Search
function initializeSearch() {
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const term = searchInput.value.trim();
                if (term) {
                    showToast(`Searching for "${term}"...`);
                }
            }
        });
    }
}

// Initialize Mobile Menu
function initializeMobileMenu() {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.setAttribute('data-lucide', 'menu');
        } else {
            icon.setAttribute('data-lucide', 'x');
        }
        lucide.createIcons();
    });
}

// Navigation Interactions
function initializeNavigation() {
    document.querySelectorAll('.nav-link, .nav-btn').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const action = link.dataset.action || link.textContent.trim();
            if (action === 'login') {
                showToast('Login button clicked — prototype mode.');
            } else if (action === 'create-account') {
                showToast('Create account — prototype mode.');
            } else {
                showToast(`${action} section selected.`);
            }
        });
    });
}

// Initialize All
document.addEventListener('DOMContentLoaded', () => {
    initializeCarousel();
    initializeLogin();
    initializeSearch();
    initializeMobileMenu();
    initializeNavigation();
});
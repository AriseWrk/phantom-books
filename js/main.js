document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
    
    // === УПРАВЛЕНИЕ НАТИВНОЙ КНОПКОЙ НАЗАД ===
    const path = window.location.pathname;
    let backUrl = null;
    if (path.includes("/books/")) backUrl = "../../library.html";
    else if (path.includes("library.html") || path.includes("news.html") || path.includes("lore.html") || path.includes("vip.html") || path.includes("gallery.html") || path.includes("social.html") || path.includes("digital.html")) backUrl = "index.html";
    
    if (backUrl && window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => { window.location.href = backUrl; });
    }

    // === ЛОГИКА БИБЛИОТЕКИ ===
    const gridContainer = document.getElementById('books-grid');
    const tabsContainer = document.getElementById('genre-tabs');
    if (gridContainer && tabsContainer) {
        fetch('books.json')
            .then(response => response.json())
            .then(books => { allBooksData = books;
                const genres = ['Все'];
                books.forEach(b => {
                    if (!genres.includes(b.genre)) genres.push(b.genre);
                });
                genres.forEach((genre, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'tab';
                    btn.innerText = genre;
                    if (index === 0) btn.classList.add('active');
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        btn.classList.add('active');
                        currentGenre = genre; renderBooks();
                    });
                    tabsContainer.appendChild(btn);
                });
                renderBooks();
            })
            .catch(e => console.error(e));
    }
    let allBooksData = [];
let currentGenre = 'Все';
let currentSearch = '';

function renderBooks() {
    const gridContainer = document.getElementById('books-grid');
    if (!gridContainer) return;
    
    let filtered = allBooksData;
    if (currentGenre !== 'Все') filtered = filtered.filter(b => b.genre === currentGenre);
    if (currentSearch) filtered = filtered.filter(b => b.title.toLowerCase().includes(currentSearch) || b.genre.toLowerCase().includes(currentSearch));
    
    const favs = getFavorites();
    gridContainer.innerHTML = '';
    
    filtered.forEach(book => {
        const isFav = favs.includes(book.slug);
        const progress = localStorage.getItem('progress_' + book.slug) || Math.floor(Math.random() * 100); // Симуляция прогресса
        
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        
        cardContainer.innerHTML = `
            <a href="books/${book.slug}/index.html" class="card">
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='assets/cover.jpg'">
                <div class="card-content">
                    <span class="genre-tag">${book.genre}</span>
                    <h3>${book.title}</h3>
                    <p>${book.description}</p>
                    <div class="progress-container"><div class="progress-bar" style="width: ${progress}%"></div></div>
                </div>
            </a>
            <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${book.slug}', event)">♥</button>
        `;
        gridContainer.appendChild(cardContainer);
    });
}

function filterBooks() {
    currentSearch = document.getElementById('search-input').value.toLowerCase();
    renderBooks();
});

// === VIP ЛОГИКА (Симуляция) ===
function checkVip() {
    const isVip = localStorage.getItem('arise_vip') === 'true';
    const locked = document.getElementById('vip-locked');
    const unlocked = document.getElementById('vip-unlocked');
    if (locked && unlocked) {
        if (isVip) {
            locked.style.display = 'none';
            unlocked.style.display = 'block';
        } else {
            locked.style.display = 'block';
            unlocked.style.display = 'none';
        }
    }
}

function unlockVip() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showConfirm('Это тестовый режим. Активировать VIP-доступ бесплатно?', (confirmed) => {
            if (confirmed) {
                localStorage.setItem('arise_vip', 'true');
                checkVip();
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        });
    } else {
        localStorage.setItem('arise_vip', 'true');
        checkVip();
    }
}

// === ЦИТАТЫ ===
const quotes = [
    "«Двенадцатый район не прощает ошибок. Он их коллекционирует.»",
    "«Тайны Сибири не спят. Они ждут.»",
    "«В Ордене нет друзей, есть только цели.»",
    "«Любовь на Манхэттене — это игра по особым правилам.»",
    "«Особый контур стирает всё, кроме правды.»",
    "«Вселенная миров начинается там, где заканчивается страх.»"
];

function getRandomQuote() {
    const quoteEl = document.getElementById('random-quote');
    if (quoteEl) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteEl.innerText = quotes[randomIndex];
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    getRandomQuote();
    checkVip();
    
    // Умная кнопка "Назад" для VIP-страницы
    if (window.location.pathname.includes("vip.html") && window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => { window.location.href = 'index.html'; });
    }
});


// === ГЕНЕРАТОР ЦИТАТ (CANVAS) ===
function generateQuoteImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'assets/bg-universe.jpg';
    img.onload = () => {
        ctx.drawImage(img, 0, 0, 1080, 1080);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, 1080, 1080);
        
        const quoteText = document.getElementById('random-quote').innerText;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Перенос строк
        const words = quoteText.split(' ');
        let line = '', lines = [];
        words.forEach(word => {
            let testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > 800) { lines.push(line); line = word + ' '; }
            else { line = testLine; }
        });
        lines.push(line);
        
        let startY = 540 - ((lines.length - 1) * 35);
        lines.forEach((l, i) => { ctx.fillText(l.trim(), 540, startY + (i * 70)); });
        
        ctx.font = '30px -apple-system, sans-serif';
        ctx.fillStyle = '#ff4b4b';
        ctx.fillText('Александр Голубцов • ARISE', 540, 850);

        const link = document.createElement('a');
        link.download = 'arise_quote.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
        if (window.Telegram && window.Telegram.WebApp) window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    };
}

// === ИЗБРАННОЕ ===
function getFavorites() { return JSON.parse(localStorage.getItem('arise_favs') || '[]'); }
function toggleFavorite(slug, event) {
    event.preventDefault(); event.stopPropagation();
    let favs = getFavorites();
    if (favs.includes(slug)) { favs = favs.filter(f => f !== slug); event.target.classList.remove('active'); }
    else { favs.push(slug); event.target.classList.add('active'); }
    localStorage.setItem('arise_favs', JSON.stringify(favs));
}

// === НАСТРОЙКИ ЧТЕНИЯ ===
function applyReadingSettings() {
    const content = document.querySelector('.book-text-content');
    if (!content) return;
    const fontSize = localStorage.getItem('arise_font_size') || '1rem';
    const fontType = localStorage.getItem('arise_font_type') || 'sans';
    const theme = localStorage.getItem('arise_theme') || 'dark';
    
    content.style.fontSize = fontSize;
    content.className = `book-text-content font-${fontType} theme-${theme}`;
}
function changeSetting(key, value) {
    localStorage.setItem(key, value);
    applyReadingSettings();
}


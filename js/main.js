let allBooksData = [];
let currentGenre = 'Все';
let currentSearch = '';

const safeStorage = {
    get: (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
    set: (key, val) => { try { localStorage.setItem(key, val); } catch(e) { console.warn('Storage blocked'); } }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        if (window.Telegram.WebApp.BackButton) {
            window.Telegram.WebApp.BackButton.hide(); // Прячем нативную
        }
    }
    
    // === УМНАЯ КНОПКА НАЗАД ===
    const path = window.location.pathname;
    let backUrl = null;
    if (path.includes("/books/")) backUrl = "../../library.html";
    else if (path.includes("library.html") || path.includes("news.html") || path.includes("lore.html") || path.includes("vip.html") || path.includes("gallery.html") || path.includes("social.html") || path.includes("digital.html")) backUrl = "index.html";
    
    if (backUrl) {
        const backBtn = document.createElement('a');
        backBtn.href = backUrl;
        backBtn.className = 'custom-back-btn';
        backBtn.innerHTML = '← Назад';
        document.body.appendChild(backBtn);
    }

    getRandomQuote();
    checkVip();

    const gridContainer = document.getElementById('books-grid');
    const tabsContainer = document.getElementById('genre-tabs');
    
    if (gridContainer && tabsContainer) {
        gridContainer.innerHTML = '<p style="color: #aaa; grid-column: 1/-1; text-align: center;">Загрузка книг...</p>';
        
        fetch('./books.json?t=' + Date.now())
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(books => {
                allBooksData = books;
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
                        currentGenre = genre;
                        renderBooks();
                    });
                    tabsContainer.appendChild(btn);
                });
                renderBooks();
            })
            .catch(err => {
                gridContainer.innerHTML = `<p style="color: red; grid-column: 1/-1; text-align: center;">Ошибка: ${err.message}</p>`;
            });
    }
    applyReadingSettings();
});

function renderBooks() {
    const gridContainer = document.getElementById('books-grid');
    if (!gridContainer) return;

    let filtered = allBooksData;
    if (currentGenre !== 'Все') filtered = filtered.filter(b => b.genre === currentGenre);
    if (currentSearch) filtered = filtered.filter(b => b.title.toLowerCase().includes(currentSearch) || b.genre.toLowerCase().includes(currentSearch));

    const favs = JSON.parse(safeStorage.get('arise_favs') || '[]');
    gridContainer.innerHTML = '';

    if (filtered.length === 0) {
        gridContainer.innerHTML = '<p style="color: #888; grid-column: 1/-1; text-align: center; margin-top:20px;">Ничего не найдено</p>';
        return;
    }

    filtered.forEach(book => {
        const isFav = favs.includes(book.slug);
        const progress = safeStorage.get('progress_' + book.slug) || 0;

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
    const input = document.getElementById('search-input');
    if (input) {
        currentSearch = input.value.toLowerCase().trim();
        renderBooks();
    }
}

function toggleFavorite(slug, event) {
    event.preventDefault(); event.stopPropagation();
    let favs = JSON.parse(safeStorage.get('arise_favs') || '[]');
    if (favs.includes(slug)) { favs = favs.filter(f => f !== slug); event.target.classList.remove('active'); }
    else { favs.push(slug); event.target.classList.add('active'); }
    safeStorage.set('arise_favs', JSON.stringify(favs));
}

function checkVip() {
    const isVip = safeStorage.get('arise_vip') === 'true';
    const locked = document.getElementById('vip-locked');
    const unlocked = document.getElementById('vip-unlocked');
    if (locked && unlocked) {
        if (isVip) { locked.style.display = 'none'; unlocked.style.display = 'block'; }
        else { locked.style.display = 'block'; unlocked.style.display = 'none'; }
    }
}

function unlockVip() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.showConfirm) {
        window.Telegram.WebApp.showConfirm('Активировать тестовый VIP-доступ?', (confirmed) => {
            if (confirmed) { safeStorage.set('arise_vip', 'true'); checkVip(); }
        });
    } else { safeStorage.set('arise_vip', 'true'); checkVip(); }
}

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
    if (quoteEl) quoteEl.innerText = quotes[Math.floor(Math.random() * quotes.length)];
}

function generateQuoteImage() {
    const quoteEl = document.getElementById('random-quote');
    if (!quoteEl) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'assets/bg-universe.jpg';
    img.onload = () => {
        ctx.drawImage(img, 0, 0, 1080, 1080);
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, 1080, 1080);
        const quoteText = quoteEl.innerText;
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 50px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const words = quoteText.split(' '); let line = '', lines = [];
        words.forEach(word => {
            let testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > 800) { lines.push(line); line = word + ' '; } else { line = testLine; }
        });
        lines.push(line);
        let startY = 540 - ((lines.length - 1) * 35);
        lines.forEach((l, i) => { ctx.fillText(l.trim(), 540, startY + (i * 70)); });
        ctx.font = '30px sans-serif'; ctx.fillStyle = '#ff4b4b'; ctx.fillText('Александр Голубцов • ARISE', 540, 850);
        const link = document.createElement('a');
        link.download = 'arise_quote.jpg'; link.href = canvas.toDataURL('image/jpeg'); link.click();
    };
    img.onerror = () => alert('Не удалось загрузить фон.');
}

function applyReadingSettings() {
    const content = document.querySelector('.book-text-content');
    if (!content) return;
    const fontSize = safeStorage.get('arise_font_size') || '1rem';
    const fontType = safeStorage.get('arise_font_type') || 'sans';
    const theme = safeStorage.get('arise_theme') || 'dark';
    content.style.fontSize = fontSize;
    content.className = `book-text-content font-${fontType} theme-${theme}`;
}
function changeSetting(key, value) {
    safeStorage.set(key, value);
    applyReadingSettings();
}

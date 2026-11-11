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
            .then(books => {
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
                        renderBooks(genre === 'Все' ? books : books.filter(b => b.genre === genre));
                    });
                    tabsContainer.appendChild(btn);
                });
                renderBooks(books);
            })
            .catch(e => console.error(e));
    }
    function renderBooks(filteredBooks) {
        gridContainer.innerHTML = '';
        filteredBooks.forEach(book => {
            const card = document.createElement('a');
            card.href = `books/${book.slug}/index.html`;
            card.className = 'card';
            card.innerHTML = `
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='assets/cover.jpg'">
                <div class="card-content">
                    <span class="genre-tag">${book.genre}</span>
                    <h3>${book.title}</h3>
                    <p>${book.description}</p>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    }
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


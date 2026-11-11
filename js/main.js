document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
    
    // === СОЗДАНИЕ КНОПКИ НАЗАД ===
    const path = window.location.pathname;
    let backUrl = null;
    let backText = "← Назад";
    if (path.includes("/books/")) {
        backUrl = "../../library.html";
        backText = "← Назад в библиотеку";
    } else if (path.includes("library.html")) {
        backUrl = "index.html";
        backText = "← В главное меню";
    }
    
    if (backUrl) {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            const backLink = document.createElement('a');
            backLink.href = backUrl;
            backLink.className = 'back-link';
            backLink.innerHTML = backText;
            overlay.insertBefore(backLink, overlay.firstChild);
        }
        
        // Нативная интеграция с Телеграмом
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(() => { window.location.href = backUrl; });
        }
    }
    
    // === ЛОГИКА ДЛЯ БИБЛИОТЕКИ ===
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
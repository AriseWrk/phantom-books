document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }

    const gridContainer = document.getElementById('books-grid');

    fetch('books.json')
        .then(response => response.json())
        .then(books => {
            books.forEach(book => {
                const card = document.createElement('a');
                card.href = `books/${book.slug}/index.html`;
                card.className = 'card';

                card.innerHTML = `
                    <img src="${book.cover}" alt="${book.title}">
                    <div class="card-content">
                        <span class="genre-tag">${book.genre}</span>
                        <h3>${book.title}</h3>
                        <p>${book.description}</p>
                    </div>
                `;

                gridContainer.appendChild(card);
            });
        })
        .catch(error => console.error('Ошибка загрузки книг:', error));
});

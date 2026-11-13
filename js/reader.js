((function() {
    // Защита от копирования
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
            e.preventDefault();
            alert('Копирование текста запрещено. Пожалуйста, уважайте труд автора.');
        }
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) { e.preventDefault(); }
    });

    const params = new URLSearchParams(window.location.search);
    const bookSlug = params.get('book');
    const chapterId = params.get('chapter');

    if (!bookSlug || !chapterId) {
        document.getElementById('chapter-content').innerHTML = '<p style="color:red;text-align:center;">Ошибка: не указан параметр book или chapter</p>';
        return;
    }

    fetch(`books/${bookSlug}/book.json?t=${Date.now()}`)
        .then(r => r.json())
        .then(bookData => {
            const chapters = bookData.chapters;
            const currentIdx = chapters.findIndex(c => c.id === chapterId);
            if (currentIdx === -1) throw new Error('Глава не найдена');
            
            const currentChapter = chapters[currentIdx];
            document.title = `${currentChapter.title} - ${bookData.title}`;

            return fetch(`books/${bookSlug}/${currentChapter.file}?t=${Date.now()}`)
                .then(r => r.text())
                .then(md => {
                    const html = marked.parse(md);
                    document.getElementById('chapter-content').innerHTML = html;

                    // Обновляем фон для корректных путей к артам
                    const imgs = document.querySelectorAll('.chapter-text img');
                    imgs.forEach(img => {
                        img.src = `books/${bookSlug}/${img.getAttribute('src')}`;
                    });

                    localStorage.setItem(`arise_last_${bookSlug}`, chapterId);

                    const prevBtn = document.getElementById('prev-ch');
                    const nextBtn = document.getElementById('next-ch');

                    if (currentIdx > 0) {
                        const prev = chapters[currentIdx - 1];
                        prevBtn.href = `reader.html?book=${bookSlug}&amp;chapter=${prev.id}`;
                        prevBtn.style.visibility = 'visible';
                        prevBtn.innerText = `← ${prev.title}`;
                    }
                    if (currentIdx < chapters.length - 1) {
                        const next = chapters[currentIdx + 1];
                        nextBtn.href = `reader.html?book=${bookSlug}&amp;chapter=${next.id}`;
                        nextBtn.style.visibility = 'visible';
                        nextBtn.innerText = `${next.title} →`;
                    }
                    window.scrollTo(0, 0);
                });
        })
        .catch(err => {
            document.getElementById('chapter-content').innerHTML = `<p style="color:red;text-align:center;">Ошибка: ${err.message}</p>`;
        });
})();
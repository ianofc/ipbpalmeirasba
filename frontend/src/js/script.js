const video = document.getElementById('aboutVideo');

// Adiciona eventos para controlar o áudio do vídeo
video.addEventListener('mouseover', () => {
    video.muted = false; // Ativa o áudio
});

video.addEventListener('mouseout', () => {
    video.muted = true; // Desativa o áudio
});

const themeButton = document.getElementById('themeButton');
const themeLabel = document.getElementById('themeLabel');
const body = document.getElementById('body');
let currentTheme = 'clean';

themeButton.addEventListener('click', () => {
    if (currentTheme === 'clean') {
        body.classList.remove('bg-cinza-claro');
        body.classList.add('theme-dark');
        themeLabel.textContent = 'Dark';
        currentTheme = 'dark';
    } else if (currentTheme === 'dark') {
        body.classList.remove('theme-dark');
        body.classList.add('theme-green');
        themeLabel.textContent = 'Green';
        currentTheme = 'green';
    } else {
        body.classList.remove('theme-green');
        body.classList.add('bg-cinza-claro');
        themeLabel.textContent = 'Clean';
        currentTheme = 'clean';
    }
});

// Função para rolagem suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Fixar a barra de navegação
const header = document.getElementById('header');
const sticky = header.offsetTop;

window.onscroll = function() {
    if (window.pageYOffset > sticky) {
        header.classList.add('fixed');
    } else {
        header.classList.remove('fixed');
    }
};

 // JavaScript para o slider de organizações
 const slider = document.getElementById('slider');
 const prevButton = document.getElementById('prev');
 const nextButton = document.getElementById('next');
 let currentIndex = 0;

 function updateSlider() {
     const slides = slider.children;
     const totalSlides = slides.length;
     for (let i = 0; i < totalSlides; i++) {
         slides[i].classList.add('hidden');
     }
     slides[currentIndex].classList.remove('hidden');
 }

 prevButton.addEventListener('click', () => {
     currentIndex = (currentIndex > 0) ? currentIndex - 1 : slider.children.length - 1;
     updateSlider();
 });

 nextButton.addEventListener('click', () => {
     currentIndex = (currentIndex < slider.children.length - 1) ? currentIndex + 1 : 0;
     updateSlider();
 });

 // Carregar mensagem do dia
 async function loadMensagemDoDia() {
     const response = await fetch('https://api.biblia.com/v1/verses/João.3.16.js?key=YOUR_API_KEY');
     const data = await response.json();
     document.getElementById('mensagemDoDia').innerText = data.text;
 }

 loadMensagemDoDia();

 let slideIndex = 0;
        showSlides();

        function showSlides() {
            let i;
            let slides = document.getElementsByClassName("mySlides");
            let dots = document.getElementsByClassName("dot");
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            slideIndex++;
            if (slideIndex > slides.length) { slideIndex = 1 }
            for (i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            slides[slideIndex - 1].style.display = "block";
            dots[slideIndex - 1].className += " active";
            setTimeout(showSlides, 2000); // Change image every 2 seconds
        }

        function plusSlides(n) {
            showSlides(slideIndex += n);
        }

        function currentSlide(n) {
            showSlides(slideIndex = n);
        }

// Função para obter a mensagem do dia
document.addEventListener('DOMContentLoaded', function() {
    fetchVerse();
    scheduleDailyVerse();
    loadBooks();
    
    document.getElementById('bookSelect').addEventListener('change', function() {
        const book = this.value;
        if (book) {
            loadChapters(book);
        } else {
            document.getElementById('chapterSelect').disabled = true;
        }
    });
    
    document.getElementById('chapterSelect').addEventListener('change', function() {
        const book = document.getElementById('bookSelect').value;
        const chapter = this.value;
        if (book && chapter) {
            loadVerse(book, chapter);
        }
    });
});

function loadBooks() {
    fetch('/api/books')
        .then(response => response.json())
        .then(books => {
            const select = document.getElementById('bookSelect');
            books.forEach(book => {
                const option = document.createElement('option');
                option.value = book;
                option.textContent = book;
                select.appendChild(option);
            });
        });
}

function loadChapters(book) {
    fetch(`/api/chapters/${book}`)
        .then(response => response.json())
        .then(numChapters => {
            const select = document.getElementById('chapterSelect');
            select.innerHTML = '<option value="">Selecione um capítulo</option>';
            for (let i = 1; i <= numChapters; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Capítulo ${i}`;
                select.appendChild(option);
            }
            select.disabled = false;
        });
}

function loadVerse(book, chapter) {
    fetch(`/api/verse/${book}/${chapter}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('bibleText').innerText = data.text;
        })
        .catch(error => {
            document.getElementById('bibleText').innerText = 'Erro ao carregar o texto.';
        });
}

function fetchVerse() {
    fetch('/random_verse')
        .then(response => response.json())
        .then(data => {
            const verse = `${data.reference} - "${data.text}"`;
            document.getElementById('verse').innerText = verse;
        })
        .catch(error => {
            document.getElementById('verse').innerText = 'Erro ao carregar versículo.';
            console.error('Erro:', error);
        });
}

function scheduleDailyVerse() {
    const now = new Date();
    const next4AM = new Date();
    next4AM.setHours(4, 0, 0, 0);

    if (now.getHours() >= 4) {
        next4AM.setDate(next4AM.getDate() + 1);
    }

    const timeUntilNext4AM = next4AM - now;

    setTimeout(() => {
        fetchVerse();
        setInterval(fetchVerse, 24 * 60 * 60 * 1000);
    }, timeUntilNext4AM);
}
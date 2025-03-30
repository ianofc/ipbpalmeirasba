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
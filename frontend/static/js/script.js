import { fallbackData } from './fallback-data.js';
// Importa o chatbot (é necessário garantir que 'Sarcinha' seja exportado em chatbot.js)
import { Sarcinha } from './chatbot.js'; 

// Define a URL base para as chamadas de API.
const API_BASE_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:5000'
    : '';

/* =================================
   ## Controle de Mídia & Tema
   ================================= */
const video = document.getElementById('aboutVideo');
if (video) {
    video.addEventListener('mouseover', () => {
        video.muted = false; // Ativa o áudio no hover
    });
    video.addEventListener('mouseout', () => {
        video.muted = true; // Desativa o áudio ao sair
    });
}

const themeButton = document.getElementById('themeButton');
const themeLabel = document.getElementById('themeLabel');
const body = document.body;
// Define o tema inicial como 'light-theme' (ou o tema padrão)
let currentTheme = 'light-theme'; 

themeButton?.addEventListener('click', () => {
    // Remove todas as classes de tema para garantir a troca correta
    body.classList.remove('light-theme', 'dark-theme', 'green-theme');

    if (currentTheme === 'light-theme') {
        body.classList.add('dark-theme');
        themeLabel.textContent = 'Dark';
        currentTheme = 'dark-theme';
    } else if (currentTheme === 'dark-theme') {
        body.classList.add('green-theme');
        themeLabel.textContent = 'Green';
        currentTheme = 'green-theme';
    } else {
        body.classList.add('light-theme');
        themeLabel.textContent = 'Light';
        currentTheme = 'light-theme';
    }
});


/* ===========================
   ## Versículo Diário
   =========================== */
async function fetchVerse() {
    const verse = document.getElementById('verse');
    if (!verse) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/random-verse`);
        if (!response.ok) throw new Error("Falha ao buscar versículo.");
        
        const data = await response.json();
        verse.innerText = `${data.reference} - "${data.text}"`;
        
    } catch (error) {
        console.error('Erro ao carregar versículo:', error);
        
        // Uso de fallback em caso de erro da API
        const fallbackVerse = fallbackData.verses[Math.floor(Math.random() * fallbackData.verses.length)];
        verse.innerText = `${fallbackVerse.reference} - "${fallbackVerse.text}"`;
    }
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

/* ===========================
   ## Player de Música (Estático/Fallback)
   =========================== */
let currentTrackIndex = 0;
let tracks = fallbackData.music || []; // Carrega dados estáticos

function loadTrack(index) {
    if (tracks.length === 0) return;

    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];
    document.getElementById('current-title').textContent = track.title;
    
    const player = document.getElementById('youtube-player');
    // Ajustado para usar o iframe do YouTube
    player.src = `https://www.youtube.com/embed/${track.videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;

    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('bg-green-100', i === currentTrackIndex);
    });
}

function updatePlaylist() {
    const playlist = document.getElementById('playlist');
    if (!playlist) return;

    window.loadTrack = loadTrack; // Necessário para o onclick no HTML
    
    playlist.innerHTML = tracks.map((track, index) => `
        <div class="playlist-item cursor-pointer p-3 hover:bg-gray-100 rounded ${index === currentTrackIndex ? 'bg-green-100' : ''}"
             onclick="loadTrack(${index})">
            <div class="flex items-center">
                <span class="mr-3 text-gray-500">${(index + 1).toString().padStart(2, '0')}</span>
                <div>
                    <h4 class="font-semibold">${track.title}</h4>
                </div>
            </div>
        </div>
    `).join('');
}

function initializePlayer() {
    if (!tracks || tracks.length === 0) return;
    if (window.playerInitialized) return;
    
    window.playerInitialized = true;

    updatePlaylist();
    loadTrack(0);

    const prevBtn = document.getElementById('prev-track');
    const nextBtn = document.getElementById('next-track');
    
    if (prevBtn) prevBtn.addEventListener('click', () => loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length));
    if (nextBtn) nextBtn.addEventListener('click', () => loadTrack((currentTrackIndex + 1) % tracks.length));
    
    // A lógica para 'ended' de iframe é mantida, mas ineficaz sem a API JS do YouTube.
    const currentAudio = document.getElementById('current-audio');
    if (currentAudio) {
         currentAudio.addEventListener('ended', () => {
             const newIndex = (currentTrackIndex + 1) % tracks.length;
             loadTrack(newIndex);
         });
    }
}


/* ===========================
   ## Carrossel/Galeria de Fotos (NOVA IMPLEMENTAÇÃO)
   =========================== */
let carouselIndex = 0;
let carouselPhotos = [];
let carouselInterval;

async function setupGalleryCarousel() {
    const galleryContainer = document.getElementById('gallery-container');
    const dotsContainer = document.querySelector('.dots');
    const prevButton = document.querySelector('.slideshow-container .prev');
    const nextButton = document.querySelector('.slideshow-container .next');

    if (!galleryContainer || !dotsContainer) return;
    
    // 1. Carregar Dados
    let photosToDisplay = fallbackData.photos;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/photos`);
        if (response.ok) {
            photosToDisplay = await response.json();
        } else {
            throw new Error(`Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao carregar galeria, usando fallback:', error);
    }

    if (photosToDisplay.length === 0) return;
    carouselPhotos = photosToDisplay;

    // 2. Renderizar Slides e Dots
    galleryContainer.innerHTML = carouselPhotos.map((photo, index) => `
        <div class="mySlides">
            <img src="${photo.url}" alt="${photo.description}" loading="lazy" decoding="async" />
        </div>
    `).join('');

    dotsContainer.innerHTML = carouselPhotos.map((_, index) => 
        `<span class="dot" data-index="${index}"></span>`
    ).join('');

    // 3. Funções de Controle
    function moveCarousel(n) {
        carouselIndex = (n + carouselPhotos.length) % carouselPhotos.length;
        const offset = -carouselIndex * 100;
        
        galleryContainer.style.transform = `translateX(${offset}%)`;
        
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === carouselIndex);
        });
    }

    function autoSlide() {
        moveCarousel(carouselIndex + 1);
    }
    
    // Iniciar auto-slide
    clearInterval(carouselInterval);
    carouselInterval = setInterval(autoSlide, 5000); // Muda a cada 5 segundos

    // 4. Configurar Event Listeners
    prevButton?.addEventListener('click', () => {
        clearInterval(carouselInterval);
        moveCarousel(carouselIndex - 1);
        carouselInterval = setInterval(autoSlide, 5000);
    });

    nextButton?.addEventListener('click', () => {
        clearInterval(carouselInterval);
        moveCarousel(carouselIndex + 1);
        carouselInterval = setInterval(autoSlide, 5000);
    });

    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            clearInterval(carouselInterval);
            const index = parseInt(e.target.dataset.index, 10);
            moveCarousel(index);
            carouselInterval = setInterval(autoSlide, 5000);
        });
    });

    // Inicializa o primeiro slide
    moveCarousel(0);
}


/* ===========================
   ## Funcionalidades de Conteúdo (Docs, Contagem)
   =========================== */

// A função loadGallery foi substituída por setupGalleryCarousel()
// O código abaixo atualiza loadDocuments e updateVisitorCount

// Função loadDocuments
async function loadDocuments() {
    const container = document.getElementById('documents-container');
    if (!container) return;
    
    let documentsToDisplay = fallbackData.documents;

    try {
        const response = await fetch(`${API_BASE_URL}/api/documents`);
        if (response.ok) {
            documentsToDisplay = await response.json();
        } else {
            throw new Error(`Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao carregar documentos, usando fallback:', error);
    }
    
    container.innerHTML = documentsToDisplay.map(doc => `
        <div class="bg-white shadow-lg rounded-lg p-6">
            <h3 class="text-xl font-bold mb-2">${doc.name}</h3>
            <a href="${doc.path}" target="_blank" class="text-green-700 hover:text-green-500 flex items-center">
                <i class="fas fa-download mr-2"></i> Baixar
            </a>
        </div>
    `).join('');
}

// Função updateVisitorCount
async function updateVisitorCount() {
    const visitorCountElement = document.getElementById('visitor-count');
    if (!visitorCountElement) return;

    try {
        const response = await fetch(`${API_BASE_URL}/visitor-count`);
        if (!response.ok) throw new Error("Contagem de visitantes não encontrada");
        
        const data = await response.json();
        visitorCountElement.textContent = data.count;

    } catch (error) {
        console.error('Erro ao atualizar contagem de visitantes:', error);
        visitorCountElement.textContent = 0; // fallback simples
    }
}


/* ===========================
   ## Funções da Bíblia, Slider de Organizações e Mapa
   =========================== */

function setupBibleSelector() {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    if (!bookSelect || !chapterSelect) return;

    // Lista de livros da Bíblia (Mantida)
    const books = [
        "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute",
        "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras",
        "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cânticos", "Isaías",
        "Jeremias", "Lamentações", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias",
        "Jonas", "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
        "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios",
        "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses",
        "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
        "1 João", "2 João", "3 João", "Judas", "Apocalipse"
    ];

    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book;
        option.textContent = book;
        bookSelect.appendChild(option);
    });

    bookSelect.addEventListener('change', function() {
        chapterSelect.innerHTML = '<option value="">Selecione um capítulo</option>';
        if (this.value) {
            const numChapters = getNumberOfChapters(this.value);
            for (let i = 1; i <= numChapters; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Capítulo ${i}`;
                chapterSelect.appendChild(option);
            }
        }
    });

    chapterSelect.addEventListener('change', function() {
        if (this.value && bookSelect.value) {
            loadBibleChapter(bookSelect.value, this.value);
        }
    });

    function getNumberOfChapters(book) {
        const chaptersCount = {
            "Gênesis": 50, "Êxodo": 40, "Levítico": 27, "Números": 36, "Deuteronômio": 34,
            "Josué": 24, "Juízes": 21, "Rute": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Reis": 22,
            "2 Reis": 25, "1 Crônicas": 29, "2 Crônicas": 36, "Esdras": 10, "Neemias": 13,
            "Ester": 10, "Jó": 42, "Salmos": 150, "Provérbios": 31, "Eclesiastes": 12,
            "Cânticos": 8, "Isaías": 66, "Jeremias": 52, "Lamentações": 5, "Ezequiel": 48,
            "Daniel": 12, "Oséias": 14, "Joel": 3, "Amós": 9, "Obadias": 1, "Jonas": 4,
            "Miquéias": 7, "Naum": 3, "Habacuque": 3, "Sofonias": 3, "Ageu": 2, "Zacarias": 14,
            "Malaquias": 4, "Mateus": 28, "Marcos": 16, "Lucas": 24, "João": 21, "Atos": 28,
            "Romanos": 16, "1 Coríntios": 16, "2 Coríntios": 13, "Gálatas": 6, "Efésios": 6,
            "Filipenses": 4, "Colossenses": 4, "1 Tessalonicenses": 5, "2 Tessalonicenses": 3,
            "1 Timóteo": 6, "2 Timóteo": 4, "Tito": 3, "Filemom": 1, "Hebreus": 13, "Tiago": 5,
            "1 Pedro": 5, "2 Pedro": 3, "1 João": 5, "2 João": 1, "3 João": 1, "Judas": 1,
            "Apocalipse": 22
        };
        return chaptersCount[book] || 1;
    }

    async function loadBibleChapter(book, chapter) {
        const bibleContent = document.getElementById('bible-content');
        if (!bibleContent) return;
        
        bibleContent.innerHTML = '<p class="text-center">Carregando...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/verse/${book}/${chapter}`);
            const data = await response.json();
            
            bibleContent.innerHTML = `
                <h3 class="text-xl font-bold mb-4">${data.reference}</h3>
                <p class="text-lg">${data.text}</p>
            `;
        } catch (error) {
            bibleContent.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar o texto bíblico.</p>';
            console.error('Erro ao carregar capítulo da Bíblia:', error);
        }
    }
}

function setupOrganizationSlider() {
    const slider = document.getElementById('slider');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    if (!slider || !prevButton || !nextButton) return;

    let currentIndex = 0;

    function updateSlider() {
        const slides = slider.children;
        const totalSlides = slides.length;
        for (let i = 0; i < totalSlides; i++) {
            slides[i].classList.add('hidden');
        }
        if (slides.length > 0) {
             slides[currentIndex].classList.remove('hidden');
        }
    }

    prevButton.addEventListener('click', () => {
        const slides = slider.children;
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
        updateSlider();
    });

    nextButton.addEventListener('click', () => {
        const slides = slider.children;
        currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
        updateSlider();
    });
    
    updateSlider();
}

async function setupMapAndCalendar() {
    const mapElement = document.getElementById('map');
    const locationPhoto = document.getElementById('location-photo');
    if (!mapElement || !locationPhoto) return;

    // Busca dados da localização da API
    try {
        const locationResponse = await fetch(`${API_BASE_URL}/api/location`);
        if (!locationResponse.ok) throw new Error("Localização não encontrada.");
        
        const locationData = await locationResponse.json();
        const { latitude, longitude } = locationData.coordinates;

        // Cria o mapa e define a visualização inicial (Requer a biblioteca Leaflet.js)
        const map = L.map(mapElement).setView([latitude, longitude], 15);

        // Adiciona a camada de tiles do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Adiciona um marcador
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup('Igreja Presbiteriana em Palmeiras-BA')
            .openPopup();

        // Define uma foto da localização
        locationPhoto.src = "/src/imgs/acs/igreja.png";

    } catch (error) {
        console.error('Erro ao configurar mapa:', error);
    }
    
    // Carrega o calendário
    async function loadCalendar() {
        const calendarFrame = document.getElementById('google-calendar');
        if (!calendarFrame) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/calendar`);
            const data = await response.json();
            calendarFrame.src = data.calendar_url;
        } catch (error) {
            console.error('Erro ao carregar calendário:', error);
        }
    }

    loadCalendar();
}


/* ===========================
   ## Rolagem e Header Fixo
   =========================== */
// Rolagem suave para âncoras (Mantido)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const element = document.querySelector(this.getAttribute('href'));
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Fixar a barra de navegação (Mantido)
const header = document.getElementById('header');
if (header) {
    const sticky = header.offsetTop;

    window.onscroll = function() {
        if (window.pageYOffset > sticky) {
            header.classList.add('fixed', 'shadow-md');
        } else {
            header.classList.remove('fixed', 'shadow-md');
        }
    };
}


/* ===========================
   ## Inicialização do DOM
   =========================== */
document.addEventListener('DOMContentLoaded', function() {
    // Funções Antigas e atualizadas
    fetchVerse();
    scheduleDailyVerse();
    initializePlayer();
    
    // Funções de Conteúdo
    updateVisitorCount();
    loadDocuments(); // Não confunda com setupGalleryCarousel

    // Novas Funções
    setupGalleryCarousel(); // NOVO: Gerencia o carrossel de fotos (galeria)
    setupBibleSelector();
    setupOrganizationSlider();
    setupMapAndCalendar();

    // Inicializa o Chatbot Sarcinha
    new Sarcinha();
});

// NOTA: As funções globais plusSlides e currentSlide da versão antiga foram removidas
// pois a nova lógica do carrossel as substitui com setupGalleryCarousel e seus listeners.

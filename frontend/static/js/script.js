import { fallbackData } from './fallback-data.js';

const API_BASE_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:5000'
    : 'https://clownfish-app-suiwz.ondigitalocean.app';

/* ===========================
   ## Inicialização do Vídeo
   =========================== */
const video = document.getElementById('aboutVideo');
if (video) {
    video.addEventListener('mouseover', () => {
        video.muted = false; // Ativa o áudio
    });
    video.addEventListener('mouseout', () => {
        video.muted = true; // Desativa o áudio
    });
}

/* ===========================
   ## Controle de Tema
   =========================== */
const themeButton = document.getElementById('themeButton');
const themeLabel = document.getElementById('themeLabel');
const body = document.body;
let currentTheme = 'clean';

themeButton?.addEventListener('click', () => {
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

/* ===========================
   ## Versículo Diário
   =========================== */
function fetchVerse() {
    fetch(`${API_BASE_URL}/api/random-verse`)
        .then(response => response.json())
        .then(data => {
            const verse = document.getElementById('verse');
            if (verse) {
                verse.innerText = `${data.reference} - "${data.text}"`;
            }
        })
        .catch(error => {
            console.error('Erro ao carregar versículo:', error);
            const verse = document.getElementById('verse');
            if (verse) {
                const fallbackVerse = fallbackData.verses[Math.floor(Math.random() * fallbackData.verses.length)];
                verse.innerText = `${fallbackVerse.reference} - "${fallbackVerse.text}"`;
            }
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

/* ===========================
   ## Player de Música
   =========================== */
let currentTrackIndex = 0;
let tracks = [];

function loadTrack(index) {
    if (tracks.length === 0) return;

    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];
    document.getElementById('current-title').textContent = track.title;
    const player = document.getElementById('youtube-player');
    player.static = `https://www.youtube.com/embed/${track.videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;

    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('bg-green-100', i === currentTrackIndex);
    });
}

function updatePlaylist() {
    const playlist = document.getElementById('playlist');
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

async function initializePlayer() {
    if (!tracks || tracks.length === 0) return;

    if (window.playerInitialized) return; // evita duplicação
    window.playerInitialized = true;

    updatePlaylist();
    loadTrack(0);

    const prevBtn = document.getElementById('prev-track');
    const nextBtn = document.getElementById('next-track');
    if (prevBtn) prevBtn.addEventListener('click', () => loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length));
    if (nextBtn) nextBtn.addEventListener('click', () => loadTrack((currentTrackIndex + 1) % tracks.length));
}


/* ===========================
   ## Galeria de Fotos
   =========================== */
function loadGallery() {
    fetch(`${API_BASE_URL}/api/photos`)
        .then(response => response.json())
        .then(photos => {
            const galleryContainer = document.getElementById('gallery-container');
            galleryContainer.innerHTML = photos.map(photo => `
                <div class="gallery-item">
                    <img static="${photo.url}" alt="${photo.description}" />
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Erro ao carregar galeria:', error);
            const galleryContainer = document.getElementById('gallery-container');
            galleryContainer.innerHTML = fallbackData.photos.map(photo => `
                <div class="gallery-item">
                    <img static="${photo.url}" alt="${photo.description}" />
                </div>
            `).join('');
        });
}


/* ===========================
   ## Documentos
   =========================== */
function loadDocuments() {
    fetch(`${API_BASE_URL}/api/documents`)
        .then(response => {
            if (!response.ok) throw new Error("Documentos não encontrados");
            return response.json();
        })
        .then(documents => {
            const container = document.getElementById('documents-container');
            container.innerHTML = documents.map(doc => `
                <div class="bg-white shadow-lg rounded-lg p-6">
                    <h3 class="text-xl font-bold mb-2">${doc.name}</h3>
                    <a href="${doc.path}" target="_blank" class="text-green-700 hover:text-green-500 flex items-center">
                        <i class="fas fa-download mr-2"></i> Baixar
                    </a>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Erro ao carregar documentos:', error);
            const container = document.getElementById('documents-container');
            container.innerHTML = fallbackData.documents.map(doc => `
                <div class="bg-white shadow-lg rounded-lg p-6">
                    <h3 class="text-xl font-bold mb-2">${doc.name}</h3>
                    <a href="${doc.path}" target="_blank" class="text-green-700 hover:text-green-500 flex items-center">
                        <i class="fas fa-download mr-2"></i> Baixar
                    </a>
                </div>
            `).join('');
        });
}


/* ===========================
   ## Contagem de Visitantes
   =========================== */
function updateVisitorCount() {
    fetch(`${API_BASE_URL}/visitor-count`)
        .then(response => {
            if (!response.ok) throw new Error("Contagem de visitantes não encontrada");
            return response.json();
        })
        .then(data => {
            document.getElementById('visitor-count').textContent = data.count;
        })
        .catch(error => {
            console.error('Erro ao atualizar contagem de visitantes:', error);
            document.getElementById('visitor-count').textContent = 0; // fallback simples
        });
}


/* ===========================
   ## Inicialização do DOM
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
    fetchVerse();
    scheduleDailyVerse();
    initializePlayer();
    updateVisitorCount();
    loadGallery();
    loadDocuments();

    // Lazy loading para imagens
    document.querySelectorAll('img').forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
        if (!img.alt) {
            img.alt = 'Imagem da Igreja Presbiteriana em Palmeiras';
        }
    });

    // Rolagem suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const element = document.querySelector(this.getAttribute('href'));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});


import { fallbackData } from './fallback-data.js';

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
    fetch("https://ipbpalmeirasba.onrender.com/random_verse")
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
    player.src = `https://www.youtube.com/embed/${track.videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;

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
    try {
        const response = await fetch("https://ipbpalmeirasba.onrender.com/api/music");
        tracks = await response.json();
    } catch (error) {
        console.error('Erro ao carregar músicas:', error);
        tracks = fallbackData.music; // Usa o fallback local
    }

    if (tracks.length > 0) {
        updatePlaylist();
        loadTrack(0);

        document.getElementById('prev-track').addEventListener('click', () => {
            const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
            loadTrack(newIndex);
        });

        document.getElementById('next-track').addEventListener('click', () => {
            const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
            loadTrack(newIndex);
        });
    }
}

/* ===========================
   ## Galeria de Fotos
   =========================== */
function loadGallery() {
    fetch("https://ipbpalmeirasba.onrender.com/api/photos")
        .then(response => response.json())
        .then(photos => {
            const galleryContainer = document.getElementById('gallery-container');
            galleryContainer.innerHTML = photos.map(photo => `
                <div class="gallery-item">
                    <img src="${photo.url}" alt="${photo.description}" />
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Erro ao carregar galeria:', error);
            const galleryContainer = document.getElementById('gallery-container');
            galleryContainer.innerHTML = fallbackData.photos.map(photo => `
                <div class="gallery-item">
                    <img src="${photo.url}" alt="${photo.description}" />
                </div>
            `).join('');
        });
}

/* ===========================
   ## Documentos
   =========================== */
function loadDocuments() {
    fetch("https://ipbpalmeirasba.onrender.com/api/documents")
        .then(response => response.json())
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
    fetch("https://ipbpalmeirasba.onrender.com/visitor-count")
        .then(response => response.json())
        .then(data => {
            document.getElementById('visitor-count').textContent = data.count;
        })
        .catch(error => console.error('Erro ao atualizar contagem de visitantes:', error));
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


import { fallbackData } from './fallback-data.js';

// Define a URL base para as chamadas de API.
// Usa 'http://localhost:5000' para desenvolvimento e caminho relativo ('') para produção (DigitalOcean).
const API_BASE_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:5000'
    : '';

/* =================================
   ## Variáveis e Inicialização do Vídeo
   ================================= */
let currentTrackIndex = 0;
let tracks = []; // Array global para armazenar a playlist

const video = document.getElementById('aboutVideo');
if (video) {
    // Liga o som no hover (mouse sobre)
    video.addEventListener('mouseover', () => {
        video.muted = false; 
    });
    // Desliga o som no mouse out (mouse fora)
    video.addEventListener('mouseout', () => {
        video.muted = true;
    });
}

/* ===========================
   ## Controle de Tema
   =========================== */
// Este bloco está semanticamente correto, mantive.
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
   ## Versículo Diário (Refatorado para async/await)
   =========================== */
async function fetchVerse() {
    const verse = document.getElementById('verse');
    if (!verse) return; // Sai se o elemento não existir
    
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
    // Mantido como estava, pois usa setTimeout/setInterval nativos
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
function loadTrack(index) {
    if (tracks.length === 0) return;

    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];
    document.getElementById('current-title').textContent = track.title;
    
    const player = document.getElementById('youtube-player');
    
    // CORREÇÃO CRÍTICA (1): player.src está correto
    player.src = `https://www.youtube.com/embed/${track.videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;

    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('bg-green-100', i === currentTrackIndex);
    });
}

function updatePlaylist() {
    const playlist = document.getElementById('playlist');
    if (!playlist) return;

    // Garante que o loadTrack funcione, tornando-o acessível globalmente
    window.loadTrack = loadTrack; 
    
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
    if (window.playerInitialized) return; 
    
    window.playerInitialized = true;

    updatePlaylist();
    loadTrack(0);

    const prevBtn = document.getElementById('prev-track');
    const nextBtn = document.getElementById('next-track');
    if (prevBtn) prevBtn.addEventListener('click', () => loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length));
    if (nextBtn) nextBtn.addEventListener('click', () => loadTrack((currentTrackIndex + 1) % tracks.length));
}

// CORREÇÃO CRÍTICA (2): Função para buscar a playlist da API
function fetchMusic() {
    fetch(`${API_BASE_URL}/api/music`) // Assuma que o endpoint é /api/music
        .then(response => {
            if (!response.ok) throw new Error("Playlist não encontrada");
            return response.json();
        })
        .then(data => {
            tracks = data; // Popula o array global
            initializePlayer();
        })
        .catch(error => {
            console.error('Erro ao carregar músicas:', error);
            tracks = fallbackData.music; // Usa fallback se a API falhar
            initializePlayer();
        });
}


/* ===========================
   ## Galeria de Fotos (Refatorado para async/await)
   =========================== */
async function loadGallery() {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;

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
        // photosToDisplay já é o fallback
    }

    // CRÍTICA (3): Injeção do HTML com 'src' corrigido.
    galleryContainer.innerHTML = photosToDisplay.map(photo => `
        <div class="gallery-item">
            <img src="${photo.url}" alt="${photo.description}" loading="lazy" decoding="async" />
        </div>
    `).join('');
}


/* ===========================
   ## Documentos (Refatorado para async/await)
   =========================== */
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
        // documentsToDisplay já é o fallback
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


/* ===========================
   ## Contagem de Visitantes (Refatorado para async/await)
   =========================== */
async function updateVisitorCount() {
    const visitorCountElement = document.getElementById('visitor-count');
    if (!visitorCountElement) return;

    try {
        const response = await fetch(`${API_BASE_URL}/visitor-count`);
        if (!response.ok) throw new Error("Contagem de visitantes não encontrada");
        
        const data = await response.json();
        // Assume que o Flask retorna { "count": 123 }
        visitorCountElement.textContent = data.count; 

    } catch (error) {
        console.error('Erro ao atualizar contagem de visitantes:', error);
        visitorCountElement.textContent = 0; // fallback simples
    }
}


/* ===========================
   ## Inicialização do DOM
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
    fetchVerse();
    scheduleDailyVerse();
    fetchMusic(); // ✅ CORRIGIDO: Agora carrega as músicas e só depois inicializa o player
    updateVisitorCount();
    loadGallery();
    loadDocuments();

    // Otimização: Remoção de código redundante de lazy loading, pois já está nos componentes
    
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
});

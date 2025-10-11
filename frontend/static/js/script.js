import { fallbackData } from './fallback-data.js';

// Define a URL base para as chamadas de API.
const API_BASE_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:5000'
    : '';

/* =================================
   ## Controle de Mídia & Tema
   ================================= */

// Controle de áudio no vídeo de boas-vindas
const video = document.getElementById('aboutVideo');
if (video) {
    video.addEventListener('mouseover', () => {
        video.muted = false; // Ativa o áudio no hover
    });
    video.addEventListener('mouseout', () => {
        video.muted = true; // Desativa o áudio ao sair
    });
}

// ---------------------------------
// Lógica de Troca de Tema
// ---------------------------------
const themeButton = document.getElementById('themeButton');
const themeLabel = document.getElementById('themeLabel');
const body = document.body; 
let currentTheme = 'light'; // Corrigido para 'light' para ser o tema inicial

// Função para aplicar o tema no body
function applyTheme(theme) {
    body.classList.remove('light-theme', 'dark-theme', 'green-theme');
    body.classList.add(`${theme}-theme`);
    themeLabel.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    currentTheme = theme;
    localStorage.setItem('churchTheme', theme); // Salva a preferência
}

// Inicializa o tema ao carregar
const savedTheme = localStorage.getItem('churchTheme');
if (savedTheme) {
    applyTheme(savedTheme);
} else {
    applyTheme('light'); // Tema padrão
}

themeButton?.addEventListener('click', () => {
    let newTheme;
    if (currentTheme === 'light') {
        newTheme = 'dark';
    } else if (currentTheme === 'dark') {
        newTheme = 'green';
    } else {
        newTheme = 'light';
    }
    applyTheme(newTheme);
});


/* =================================
   ## Controle da Barra de Navegação (Scroll)
   ================================= */
document.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


/* =================================
   ## Menu Mobile
   ================================= */
const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');

menuButton?.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Fecha o menu ao clicar em um link (para mobile)
mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});


/* =================================
   ## Botões Flutuantes (Acessibilidade, Tradução, Chatbot)
   ================================= */
   
// ---------------------------------
// Acessibilidade (Exemplo de funcionalidade)
// ---------------------------------
const accessibilityButton = document.getElementById('accessibilityButton');

accessibilityButton?.addEventListener('click', () => {
    // Exemplo: Toggle de Alto Contraste
    body.classList.toggle('high-contrast'); 
    alert('Função de Acessibilidade (Alto Contraste) ativada/desativada. Outras funções podem ser adicionadas aqui (tamanho da fonte, leitor de tela, etc).');
});

// ---------------------------------
// Tradução (Apenas placeholder - a lógica completa estaria em outro arquivo JS)
// ---------------------------------
const translateButton = document.getElementById('translateButton');

translateButton?.addEventListener('click', () => {
    alert('Função de Tradução em desenvolvimento. Utilize o Google Translate (se disponível) ou espere pela implementação completa.');
});

// ---------------------------------
// Chatbot (Apenas toggle - a lógica completa está em chatbot.js)
// ---------------------------------
const chatbotButton = document.getElementById('chatbotButton');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');

chatbotButton?.addEventListener('click', () => {
    chatbotWindow.classList.toggle('hidden');
    // Move o botão do chatbot para baixo na barra flutuante quando aberto para evitar sobreposição
    chatbotButton.classList.toggle('bg-green-700'); 
});

chatbotClose?.addEventListener('click', () => {
    chatbotWindow.classList.add('hidden');
    chatbotButton.classList.remove('bg-green-700');
});


/* =================================
   ## Conteúdo Dinâmico (API/Fallback)
   ================================= */

// ---------------------------------
// 1. Versículo Diário
// ---------------------------------
async function fetchVerse() {
    const verseElement = document.getElementById('daily-verse');
    const referenceElement = document.getElementById('verse-reference');

    if (!verseElement || !referenceElement) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/verse`);
        if (!response.ok) throw new Error('Falha ao buscar API de versículo');

        const data = await response.json();
        verseElement.textContent = `"${data.text}"`;
        referenceElement.textContent = `- ${data.reference}`;

    } catch (error) {
        console.error('Erro ao buscar versículo:', error);
        // Usa fallback data
        const fallbackVerse = fallbackData.verses[Math.floor(Math.random() * fallbackData.verses.length)];
        verseElement.textContent = `"${fallbackVerse.text}"`;
        referenceElement.textContent = `- ${fallbackVerse.reference} (Offline)`;
    }
}

// ---------------------------------
// 2. Contador de Visitantes
// ---------------------------------
async function updateVisitorCount() {
    const visitorCountElement = document.getElementById('visitor-count');
    if (!visitorCountElement) return;

    try {
        const response = await fetch(`${API_BASE_URL}/visitor-count`);
        if (!response.ok) throw new Error('Falha ao buscar contador');

        const data = await response.json();
        visitorCountElement.textContent = data.count.toLocaleString('pt-BR');

    } catch (error) {
        console.error('Erro ao atualizar contador de visitantes:', error);
        visitorCountElement.textContent = 'Indisponível';
    }
}

// ---------------------------------
// 3. Player de Música
// ---------------------------------
async function initializePlayer() {
    const playerContainer = document.getElementById('player-container');
    if (!playerContainer) return;

    let musicData = [];
    try {
        const response = await fetch(`${API_BASE_URL}/api/music`);
        if (!response.ok) throw new Error('Falha ao buscar lista de músicas');
        musicData = await response.json();
    } catch (error) {
        console.warn('Erro ao carregar músicas da API, usando fallback.', error);
        musicData = fallbackData.music;
    }

    if (musicData.length === 0) {
        playerContainer.innerHTML = `<p class="text-gray-500">Nenhuma música disponível no momento.</p>`;
        return;
    }
    
    // Escolhe uma música aleatória
    const selectedMusic = musicData[Math.floor(Math.random() * musicData.length)];

    playerContainer.innerHTML = `
        <h3 class="text-xl font-semibold mb-3">${selectedMusic.title}</h3>
        <iframe class="w-full aspect-video rounded-lg"
            src="https://www.youtube.com/embed/${selectedMusic.videoId}?controls=1&autoplay=0"
            title="${selectedMusic.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
        </iframe>
        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Atualize para uma nova sugestão de louvor.</p>
    `;
}

// ---------------------------------
// 4. Galeria de Fotos (Slider)
// ---------------------------------
let slideIndex = 0;
let slides = [];
let slideshowTimeout;

async function loadGallery() {
    const innerContainer = document.getElementById('slideshow-inner-container');
    const dotsContainer = document.getElementById('slider-dots');
    
    if (!innerContainer || !dotsContainer) return;

    let photoData = [];
    try {
        const response = await fetch(`${API_BASE_URL}/api/photos`);
        if (!response.ok) throw new Error('Falha ao buscar fotos');
        photoData = await response.json();
    } catch (error) {
        console.warn('Erro ao carregar fotos da API, usando fallback.', error);
        photoData = fallbackData.photos;
    }

    if (photoData.length === 0) {
        innerContainer.innerHTML = `<p class="text-center text-gray-500">Galeria de fotos indisponível.</p>`;
        return;
    }

    innerContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    slides = [];

    photoData.forEach((photo, index) => {
        // Cria a div do slide
        const slideDiv = document.createElement('div');
        slideDiv.className = 'mySlides fade hidden'; // Inicia oculto
        slideDiv.innerHTML = `
            <img src="${photo.url}" alt="${photo.description}" class="w-full h-96 object-cover rounded-lg shadow-xl mx-auto">
            <div class="text-center mt-3 text-sm text-gray-700 dark:text-gray-300">${photo.description}</div>
        `;
        innerContainer.appendChild(slideDiv);
        slides.push(slideDiv);
        
        // Cria o dot de navegação
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.onclick = () => currentSlide(index + 1);
        dotsContainer.appendChild(dot);
    });

    showSlides();
}

function showSlides() {
    if (slides.length === 0) return;

    clearTimeout(slideshowTimeout);
    
    // Incrementa e faz o loop
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    
    // Oculta todos os slides e remove o ativo dos dots
    slides.forEach(slide => slide.classList.add('hidden'));
    document.querySelectorAll('#slider-dots .dot').forEach(dot => dot.classList.remove('active'));

    // Exibe o slide atual
    slides[slideIndex - 1].classList.remove('hidden');
    document.querySelectorAll('#slider-dots .dot')[slideIndex - 1].classList.add('active');

    slideshowTimeout = setTimeout(showSlides, 5000); // Mude a imagem a cada 5 segundos
}

// Funções globais para botões de navegação no HTML
window.plusSlides = function(n) {
    clearTimeout(slideshowTimeout);
    slideIndex += n - 1; // Ajusta o slideIndex
    if (slideIndex < 0) {
        slideIndex = slides.length - 1;
    } else if (slideIndex >= slides.length) {
        slideIndex = 0;
    }
    showSlides(); // Chama showSlides para exibir o slide correto e reiniciar o timer
}

window.currentSlide = function(n) {
    clearTimeout(slideshowTimeout);
    slideIndex = n - 1; // n é baseado em 1, slideIndex é baseado em 0
    showSlides(); // Chama showSlides para exibir o slide correto e reiniciar o timer
}


// ---------------------------------
// 5. Documentos para Download
// ---------------------------------
async function loadDocuments() {
    const documentsList = document.getElementById('documents-list');
    if (!documentsList) return;

    let documents = [];
    try {
        const response = await fetch(`${API_BASE_URL}/api/documents`);
        if (!response.ok) throw new Error('Falha ao buscar documentos');
        documents = await response.json();
    } catch (error) {
        console.warn('Erro ao carregar documentos da API, usando fallback.', error);
        documents = fallbackData.documents;
    }

    if (documents.length === 0) {
        documentsList.innerHTML = `<p class="text-center text-gray-500">Nenhum documento disponível no momento.</p>`;
        return;
    }

    documentsList.innerHTML = '';

    documents.forEach(doc => {
        const docItem = document.createElement('div');
        docItem.className = 'flex justify-between items-center p-4 mb-3 bg-white dark:bg-gray-700 rounded-lg shadow transition-shadow hover:shadow-md';
        docItem.innerHTML = `
            <span class="text-lg font-medium">${doc.name}</span>
            <a href="${doc.path}" target="_blank" download="${doc.name}" class="text-green-600 dark:text-green-400 hover:text-green-800 transition-colors">
                <i class="fas fa-download mr-2"></i> Baixar
            </a>
        `;
        documentsList.appendChild(docItem);
    });
}

// ---------------------------------
// 6. Slider de Organizações (Placeholder)
// ---------------------------------
function setupOrganizationSlider() {
    const sliderContent = document.getElementById('slider-content');
    if (!sliderContent) return;

    const organizations = [
        { name: 'UCP', description: 'União de Crianças Presbiterianas', img: '/static/imgs/icons/ucp.png' },
        { name: 'UMP', description: 'União de Adolescentes Presbiterianos', img: '/static/imgs/icons/ump.png' },
        { name: 'UPA', description: 'União de Jovens Presbiterianos', img: '/static/imgs/icons/upa.png' },
        { name: 'SAF', description: 'Sociedade Auxiliadora Feminina', img: '/static/imgs/icons/saf.png' },
        { name: 'UPH', description: 'União Presbiteriana de Homens', img: '/static/imgs/icons/icons-ipb.png' }
    ];

    sliderContent.innerHTML = `
        <div class="flex space-x-4 overflow-x-auto p-4 snap-x snap-mandatory">
            ${organizations.map(org => `
                <div class="flex-shrink-0 w-64 snap-center bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 text-center border-t-4 border-green-600">
                    <img src="${org.img}" alt="${org.name}" class="w-20 h-20 mx-auto mb-4 object-cover rounded-full">
                    <h4 class="text-xl font-bold mb-2 text-green-700 dark:text-green-400">${org.name}</h4>
                    <p class="text-gray-700 dark:text-gray-300">${org.description}</p>
                </div>
            `).join('')}
        </div>
        <p class="text-center text-sm mt-4 text-gray-500 dark:text-gray-400">Deslize para ver todas as organizações.</p>
    `;
}

// ---------------------------------
// 7. Mapa e Calendário (Configuração)
// ---------------------------------
function setupMapAndCalendar() {
    // Configura o Mapa (Leaflet)
    try {
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            // Coordenadas de Palmeiras, BA - IPB (Aproximadas)
            const lat = -12.5292; 
            const lon = -41.5645;

            // Inicializa o mapa com foco nas coordenadas
            const map = L.map('map-container').setView([lat, lon], 13);

            // Adiciona o tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Adiciona um marcador
            L.marker([lat, lon]).addTo(map)
                .bindPopup('<b>Igreja Presbiteriana em Palmeiras</b><br>Rua Coronel Antônio Afonso, 38.')
                .openPopup();
        }
    } catch (error) {
        console.error('Erro ao inicializar o mapa:', error);
    }
    
    // O calendário (iframe) já está no HTML, não precisa de API call, 
    // mas a lógica para carregar o URL via API (se implementado) seria a seguinte:
    // async function loadCalendar() { ... }
    // loadCalendar();
}


/* ===========================
   ## Inicialização do DOM
   =========================== */
document.addEventListener('DOMContentLoaded', function() {
    // Funções de Conteúdo Dinâmico
    fetchVerse();
    initializePlayer(); 
    updateVisitorCount();
    loadGallery();
    loadDocuments();
    
    // Funções de Componentes
    setupOrganizationSlider();
    setupMapAndCalendar();
    
    // Recarrega o versículo a cada 1 hora (para simular a atualização diária)
    // Nota: Em produção, a API deve cuidar da lógica diária.
    setInterval(fetchVerse, 3600000); 
});

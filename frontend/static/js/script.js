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
// Lógica de Troca de Tema (Ícone de Pincel)
// ---------------------------------
const themeButton = document.getElementById('themeButton');
const body = document.body; 
let currentTheme = 'light'; 

// Função para aplicar o tema no body
function applyTheme(theme) {
    // Adicionado 'green-theme' para remover corretamente
    body.classList.remove('light-theme', 'dark-theme', 'green-theme');
    body.classList.add(`${theme}-theme`);
    currentTheme = theme;
    localStorage.setItem('churchTheme', theme); // Salva a preferência
}

// Inicializa o tema ao carregar
const savedTheme = localStorage.getItem('churchTheme');
if (savedTheme) {
    applyTheme(savedTheme);
} else {
    applyTheme('light');
}

/**
 * Alterna tema entre Light, Dark e Green.
 */
function toggleTheme() {
    let newTheme;
    if (currentTheme === 'light') {
        newTheme = 'dark';
    } else if (currentTheme === 'dark') {
        newTheme = 'green';
    } else {
        newTheme = 'light';
    }
    applyTheme(newTheme);
}
window.toggleTheme = toggleTheme; 


// Event Listeners para botões de tema
themeButton?.addEventListener('click', toggleTheme);
document.getElementById('themeButtonMobile')?.addEventListener('click', toggleTheme);

// ---------------------------------
// Player de Música (Ícone de Música)
// ---------------------------------

/**
 * Alterna a visibilidade da barra do player de música no rodapé.
 */
function toggleMusicPlayer() {
    const playerBar = document.getElementById('musicPlayerBar');
    
    if (playerBar) {
        // Toggle da visibilidade (Tailwind class)
        playerBar.classList.toggle('hidden');

        // Adiciona/remove padding no body para evitar que o player cubra o conteúdo do footer
        document.body.classList.toggle('content-padding-active', !playerBar.classList.contains('hidden'));

        // Lógica simplificada de Play/Pause ao mostrar/ocultar
        const playerButton = document.getElementById('player-play-pause');
        const playerIcon = playerButton?.querySelector('i');
        
        if (!playerBar.classList.contains('hidden')) {
            // Mostrar: Simula Play
            if (playerIcon) playerIcon.className = 'fas fa-pause text-xl';
            console.log("Música iniciada (Placeholder)");
        } else {
            // Ocultar: Simula Pause
            if (playerIcon) playerIcon.className = 'fas fa-play text-xl';
            console.log("Música pausada (Placeholder)");
        }
    }
}

/**
 * Função placeholder para alternar Play/Pause no controle central.
 */
function togglePlayback() {
    const playerButton = document.getElementById('player-play-pause');
    const playerIcon = playerButton?.querySelector('i');

    if (playerIcon?.classList.contains('fa-play')) {
        playerIcon.className = 'fas fa-pause text-xl';
        console.log("Play (Placeholder)");
    } else if (playerIcon?.classList.contains('fa-pause')) {
        playerIcon.className = 'fas fa-play text-xl';
        console.log("Pause (Placeholder)");
    }
}

// Expõe a função para ser chamada pelo `onclick` no HTML
window.toggleMusicPlayer = toggleMusicPlayer;
window.togglePlayback = togglePlayback;


/* =================================
   ## Lógica de Menus de Utilidade (Acessibilidade, Tradução)
   ================================= */

/**
 * Função utilitária para fechar todos os menus suspensos e o chatbot antes de abrir um novo.
 */
function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        const isHidden = menu.classList.contains('hidden');
        
        // Fecha todos os outros menus e o chatbot antes de abrir este
        document.getElementById('accessibility-menu')?.classList.add('hidden');
        document.getElementById('translation-menu')?.classList.add('hidden');
        document.getElementById('chatbotWindow')?.classList.add('hidden'); 
        
        if (isHidden) {
            menu.classList.remove('hidden');
        } else {
            menu.classList.add('hidden');
        }
    }
}

// ---------------------------------
// Acessibilidade (Ícone de Acessibilidade) - LÓGICA ATUALIZADA
// ---------------------------------
let isHighContrast = false;
let isScreenReaderOn = false;
let currentZoom = 1.0;
let isHighlightLinks = false;
let isDyslexiaFont = false;


function toggleAccessibilityMenu() {
    toggleMenu('accessibility-menu');
}

/**
 * Ativa/Desativa o alto contraste (toggla a classe CSS 'high-contrast').
 */
function setContrast() {
    isHighContrast = !isHighContrast;
    body.classList.toggle('high-contrast', isHighContrast);
    console.log(`Alto Contraste: ${isHighContrast ? 'Ativado' : 'Desativado'}`);
}

/**
 * Aumenta ou diminui o zoom da fonte em 0.1, limitado entre 0.8x e 1.5x.
 * O fator 1.1 significa Aumentar, 0.9 significa Diminuir.
 */
function setZoom(factor) {
    const step = 0.1;
    const maxZoom = 1.5;
    const minZoom = 0.8; 
    
    if (factor > 1) {
        // Aumenta
        currentZoom = Math.min(currentZoom + step, maxZoom);
    } else if (factor < 1) {
        // Diminui
        currentZoom = Math.max(currentZoom - step, minZoom);
    }
    
    body.style.fontSize = `${currentZoom}em`;
    console.log(`Zoom atual: ${currentZoom.toFixed(1)}x`);
}

/**
 * Ativa/Desativa a classe de leitor de tela (simulação).
 */
function screenReaderToggle() {
    isScreenReaderOn = !isScreenReaderOn;
    body.classList.toggle('screen-reader-on', isScreenReaderOn);
    console.log(`Leitura de Tela: ${isScreenReaderOn ? 'Ativada' : 'Desativada'}`);
}

/**
 * NOVO: Ativa/Desativa o destaque de links.
 */
function highlightLinksToggle() {
    isHighlightLinks = !isHighlightLinks;
    body.classList.toggle('highlight-links', isHighlightLinks);
    console.log(`Destacar Links: ${isHighlightLinks ? 'Ativado' : 'Desativado'}`);
}

/**
 * NOVO: Ativa/Desativa a fonte para dislexia.
 */
function dyslexiaFontToggle() {
    isDyslexiaFont = !isDyslexiaFont;
    body.classList.toggle('dyslexia-font', isDyslexiaFont);
    console.log(`Fonte Dislexia: ${isDyslexiaFont ? 'Ativada' : 'Desativada'}`);
}

/**
 * NOVO: Reseta todas as configurações de acessibilidade.
 */
function resetAccessibility() {
    // Reset Zoom
    currentZoom = 1.0;
    body.style.fontSize = '1.0em'; 
    
    // Reset Toggles
    isHighContrast = false;
    isScreenReaderOn = false;
    isHighlightLinks = false;
    isDyslexiaFont = false;

    // Remove Classes
    body.classList.remove('high-contrast', 'screen-reader-on', 'highlight-links', 'dyslexia-font');
    
    console.log("Configurações de Acessibilidade Resetadas.");
    toggleMenu('accessibility-menu'); // Fecha o menu após resetar
}


// ---------------------------------
// Tradução (Ícone de Globo) - LÓGICA ATUALIZADA (DeepL Simulado)
// ---------------------------------

function toggleTranslationMenu() {
    toggleMenu('translation-menu');
}

/**
 * Simula a tradução da página com menção à DeepL API.
 */
function translate(langCode) {
    // Define lang no elemento raiz para que o navegador tente aplicar fontes e regras de idioma
    document.documentElement.lang = langCode; 
    
    let langName;
    switch(langCode) {
        case 'pt': langName = 'Português (Padrão)'; break;
        case 'en': langName = 'Inglês'; break;
        case 'es': langName = 'Espanhol'; break;
        case 'fr': langName = 'Francês'; break;
        case 'de': langName = 'Alemão'; break;
        case 'it': langName = 'Italiano'; break;
        default: langName = langCode;
    }
    
    // Simulação da chamada DeepL
    console.log(`DeepL Simulado: Iniciando tradução para: ${langName} (${langCode}).`);
    
    // Em uma implementação real, a DeepL API faria a tradução de todo o conteúdo aqui.
    
    toggleMenu('translation-menu'); // Fecha após a seleção
}

// Expõe as funções para uso no HTML (Barra Lateral)
window.toggleAccessibilityMenu = toggleAccessibilityMenu;
window.setContrast = setContrast;
window.setZoom = setZoom; // Função unificada para aumentar/diminuir
window.screenReaderToggle = screenReaderToggle;
window.highlightLinksToggle = highlightLinksToggle; // NOVO
window.dyslexiaFontToggle = dyslexiaFontToggle; // NOVO
window.resetAccessibility = resetAccessibility; // NOVO
window.toggleTranslationMenu = toggleTranslationMenu;
window.translate = translate;


// ---------------------------------
// Chatbot (Ícone de Sarça) - LÓGICA ATUALIZADA (Nova Posição)
// ---------------------------------

/**
 * Alterna a visibilidade da janela do chatbot na nova posição ao lado da sidebar.
 */
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbotWindow');
    if (chatbotWindow) {
        const isHidden = chatbotWindow.classList.contains('hidden');
        
        // Fecha outros menus antes de abrir o chatbot
        document.getElementById('accessibility-menu')?.classList.add('hidden');
        document.getElementById('translation-menu')?.classList.add('hidden');

        if (isHidden) {
            chatbotWindow.classList.remove('hidden');
        } else {
            chatbotWindow.classList.add('hidden');
        }

        if (!chatbotWindow.classList.contains('hidden')) {
            document.getElementById('chat-input')?.focus();
            console.log("Chatbot Sarcinha: Visível ao lado da barra lateral.");
        }
    }
}
window.toggleChatbot = toggleChatbot;


/* =================================
   ## Lógica de Conteúdo Dinâmico
   ================================= */

// ... (O restante das funções fetchData, fetchVerse, updateVisitorCount, 
// loadGallery, showSlides, plusSlides, currentSlide, loadDocuments, 
// setupOrganizationSlider, setupMapAndCalendar, e o DOMContentLoaded) ...

async function fetchData(endpoint, useFallback = false) {
    // Tenta carregar dados da API
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Erro de rede ou API: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Falha ao buscar dados de ${endpoint}.`, error);
        
        // Retorna dados de fallback se a flag for true
        if (useFallback) {
            const key = endpoint.split('/')[2]; 
            return fallbackData[key];
        }
        return null;
    }
}

// ---------------------------------
// 1. Versículo Diário
// ---------------------------------
async function fetchVerse() {
    const verseContainer = document.getElementById('verse-text');
    const referenceContainer = document.getElementById('verse-reference');
    
    const data = await fetchData('/api/verse', true); 

    if (data && data.text && data.reference) {
        verseContainer.textContent = data.text;
        referenceContainer.textContent = `- ${data.reference}`;
    } else {
        verseContainer.textContent = "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.";
        referenceContainer.textContent = "- Mateus 6:33";
    }
}

// ---------------------------------
// 2. Contador de Visitantes
// ---------------------------------
async function updateVisitorCount() {
    const countElement = document.getElementById('visitor-count');
    try {
        const response = await fetch(`${API_BASE_URL}/visitor-count`);
        const data = await response.json();
        if (data && data.count !== undefined) {
            countElement.textContent = data.count.toLocaleString('pt-BR');
        } else {
             countElement.textContent = '350+'; 
        }
    } catch (error) {
        console.error("Não foi possível atualizar o contador de visitantes:", error);
        countElement.textContent = '350+'; 
    }
}

// ---------------------------------
// 3. Galeria de Fotos
// ---------------------------------
let currentSlideIndex = 0;
let photoData = [];

async function loadGallery() {
    const container = document.getElementById('slideshow-inner-container');
    const dotsContainer = document.getElementById('slider-dots');

    photoData = await fetchData('/api/photos', true); 

    if (!photoData || photoData.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Galeria indisponível no momento.</p>';
        return;
    }

    container.innerHTML = ''; 

    photoData.forEach((photo, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide absolute top-0 left-0 w-full h-full';
        slide.style.zIndex = '1';
        slide.innerHTML = `
            <img src="${photo.url}" alt="${photo.description}" class="w-full h-full object-cover rounded-lg">
            <div class="absolute bottom-0 w-full p-4 bg-black bg-opacity-50 text-white rounded-b-lg">
                ${photo.description}
            </div>
        `;
        container.appendChild(slide);

        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.onclick = () => currentSlide(index + 1);
        dotsContainer.appendChild(dot);
    });
    
    container.innerHTML += `
        <a class="prev z-20" onclick="plusSlides(-1)">&#10094;</a>
        <a class="next z-20" onclick="plusSlides(1)">&#10095;</a>
    `;

    showSlides(1); 
}

function showSlides(n) {
    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return;

    if (n > slides.length) {n = 1}
    if (n < 1) {n = slides.length}
    currentSlideIndex = n;

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        slides[i].style.zIndex = '1'; 
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    slides[currentSlideIndex-1].style.display = "block";
    slides[currentSlideIndex-1].style.zIndex = '10'; 
    if (dots.length > 0) {
        dots[currentSlideIndex-1].className += " active";
    }
}

function plusSlides(n) {
    showSlides(currentSlideIndex + n);
}

function currentSlide(n) {
    showSlides(n);
}

// Expõe as funções para uso no HTML
window.plusSlides = plusSlides;
window.currentSlide = currentSlide;

// ---------------------------------
// 4. Downloads de Documentos
// ---------------------------------
async function loadDocuments() {
    const listContainer = document.getElementById('documents-list');

    const documents = await fetchData('/api/documents', true);

    if (!documents || documents.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-500">Nenhum recurso disponível no momento.</p>';
        return;
    }

    listContainer.innerHTML = ''; 

    documents.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-green-600';
        item.innerHTML = `
            <span class="text-lg font-semibold">${doc.name}</span>
            <a href="${doc.path}" target="_blank" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center">
                <i class="fas fa-download mr-2"></i> Download
            </a>
        `;
        listContainer.appendChild(item);
    });
}

// ---------------------------------
// 5. Organizações (Slider)
// ---------------------------------
function setupOrganizationSlider() {
    const sliderContent = document.getElementById('slider-content');
    const organizations = [
        { name: "UCP", title: "União de Crianças Presbiterianas", icon: "fas fa-child", color: "text-red-500" },
        { name: "UPA", title: "União de Adolescentes Presbiterianos", icon: "fas fa-users", color: "text-blue-500" },
        { name: "UMP", title: "União de Mocidade Presbiteriana", icon: "fas fa-graduation-cap", color: "text-yellow-500" },
        { name: "UPH", title: "União Presbiteriana de Homens", icon: "fas fa-male", color: "text-indigo-500" },
        { name: "SAF", title: "Sociedade Auxiliadora Feminina", icon: "fas fa-female", color: "text-pink-500" },
    ];
    
    // Gera o HTML para o slider simples
    sliderContent.innerHTML = `
        <div class="swiper-container">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                ${organizations.map(org => `
                    <div class="p-6 text-center rounded-lg shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-${org.color.split('-')[1]}-500 dark:bg-gray-800">
                        <i class="${org.icon} text-5xl ${org.color} mb-4"></i>
                        <h3 class="text-xl font-bold mb-1">${org.name}</h3>
                        <p class="text-gray-600 dark:text-gray-400">${org.title}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ---------------------------------
// 6. Mapa e Agenda (Placeholder)
// ---------------------------------
function setupMapAndCalendar() {
    const lat = -12.515350; 
    const lon = -41.576050; 

    try {
        if (document.getElementById('map-container')) {
            const map = L.map('map-container').setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            L.marker([lat, lon]).addTo(map)
                .bindPopup('<b>Igreja Presbiteriana em Palmeiras</b><br>Rua Coronel Antonio Afonso, 38.')
                .openPopup();
        }
    } catch (error) {
        console.error('Erro ao inicializar o mapa:', error);
    }
}


/* ===========================
   ## Inicialização do DOM e Eventos
   =========================== */
document.addEventListener('DOMContentLoaded', function() {
    // Funções de Conteúdo Dinâmico
    fetchVerse();
    updateVisitorCount();
    loadGallery();
    loadDocuments();
    
    // Funções de Componentes
    setupOrganizationSlider();
    setupMapAndCalendar();
    
    // Recarrega o versículo a cada 1 hora
    setInterval(fetchVerse, 3600000); 
    
    // Setup do menu mobile 
    const menuButton = document.getElementById('menuButton');
    menuButton?.addEventListener('click', toggleMobileMenu);

    // Evento para fechar o menu móvel ao clicar em um link
    document.getElementById('mobileMenu')?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu?.classList.add('hidden');
            document.querySelector('#menuButton i').className = 'fas fa-bars';
        });
    });

    // Função de alternância do menu móvel (mantida do código original, mas não foi fornecida, assumindo que existe)
    if (!window.toggleMobileMenu) {
        window.toggleMobileMenu = function() {
            const mobileMenu = document.getElementById('mobileMenu');
            const icon = document.querySelector('#menuButton i');
            mobileMenu?.classList.toggle('hidden');
            if (mobileMenu?.classList.contains('hidden')) {
                icon.className = 'fas fa-bars';
            } else {
                icon.className = 'fas fa-times';
            }
        };
    }
    
    // Configuração do Chatbot (Usa a função global toggleChatbot)
    // O botão de toggle está na sidebar: document.getElementById('chatbot-toggle')

    // Evento para fechar o chatbot
    const chatbotClose = document.getElementById('chatbotClose');
    chatbotClose?.addEventListener('click', () => {
        document.getElementById('chatbotWindow')?.classList.add('hidden');
    });

    // Adiciona o evento de fechamento dos menus de utilidade
    document.addEventListener('click', (event) => {
        const accMenu = document.getElementById('accessibility-menu');
        const trnMenu = document.getElementById('translation-menu');
        const accButton = document.querySelector('button[title="Acessibilidade"]');
        const trnButton = document.querySelector('button[title="Traduzir Página"]');
        
        // Verifica se o clique foi fora dos menus e de seus botões
        if (accMenu && accButton && !accMenu.contains(event.target) && !accButton.contains(event.target)) {
            accMenu.classList.add('hidden');
        }
        if (trnMenu && trnButton && !trnMenu.contains(event.target) && !trnButton.contains(event.target)) {
            trnMenu.classList.add('hidden');
        }
    });
});

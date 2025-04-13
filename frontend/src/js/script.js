function toggleTheme() {
    const body = document.body;
    const themeLabel = document.getElementById('themeLabel');
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeLabel.textContent = 'Dark';
    } else if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('green-theme');
        themeLabel.textContent = 'Green';
    } else {
        body.classList.remove('green-theme');
        body.classList.add('light-theme');
        themeLabel.textContent = 'Light';
    }
}

const video = document.getElementById('aboutVideo');

// Adiciona eventos para controlar o �udio do v�deo
if (video) {
    video.addEventListener('mouseover', () => {
        video.muted = false; // Ativa o �udio
    });

    video.addEventListener('mouseout', () => {
        video.muted = true; // Desativa o �udio
    });
}

const themeButton = document.getElementById('themeButton');
const themeLabel = document.getElementById('themeLabel');
const body = document.body;
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

// Fun��es para o vers�culo di�rio
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
            const verse = document.getElementById('verse');
            if (verse) {
                verse.innerText = 'Erro ao carregar vers�culo.';
            }
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

// Vari�veis globais para o player de m�sica
let currentTrackIndex = 0;
let tracks = [];

// Fun��o para carregar e tocar m�sica
function loadTrack(index) {
    if (tracks.length === 0) return;

    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];

    document.getElementById('current-title').textContent = track.title;

    const player = document.getElementById('youtube-player');
    player.src = `https://www.youtube.com/embed/${track.videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;

    // Atualizar visual da playlist
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('bg-green-100', i === currentTrackIndex);
    });
}

// Fun��o para atualizar a playlist
function updatePlaylist() {
    const playlist = document.getElementById('playlist');
    const startIndex = Math.max(0, Math.min(currentTrackIndex - 2, tracks.length - 5));
    const visibleTracks = tracks.slice(startIndex, startIndex + 5);

    playlist.innerHTML = visibleTracks.map((track, index) => {
        const actualIndex = startIndex + index;
        return `
            <div class="playlist-item cursor-pointer p-3 hover:bg-gray-100 rounded ${actualIndex === currentTrackIndex ? 'bg-green-100' : ''}"
                 onclick="loadTrack(${actualIndex})">
                <div class="flex items-center">
                    <span class="mr-3 text-gray-500">${(actualIndex + 1).toString().padStart(2, '0')}</span>
                    <div>
                        <h4 class="font-semibold">${track.title}</h4>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Fun��o para inicializar o player
async function initializePlayer() {
    try {
        const response = await fetch("https://ipbpalmeirasba.onrender.com/api/music");
        tracks = await response.json();

        if (tracks.length > 0) {
            updatePlaylist();
            loadTrack(0);
            // Auto start the first track
            const player = document.getElementById('youtube-player');
            player.src = `https://www.youtube.com/embed/${tracks[0].videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;

            // Adicionar event listeners para os bot�es
            document.getElementById('prev-track').addEventListener('click', () => {
                const newIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
                loadTrack(newIndex);
            });

            document.getElementById('next-track').addEventListener('click', () => {
                const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
                loadTrack(newIndex);
            });

            // Tocar pr�xima m�sica quando a atual terminar
            document.getElementById('current-audio').addEventListener('ended', () => {
                const newIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
                loadTrack(newIndex);
            });
        }
    } catch (error) {
        console.error('Error loading music:', error);
    }
}


// Inicializar vers�culo do dia
function loadChristianMusic() {
    // This function is now redundant and should be removed as the new music player handles this functionality.
}


function updateVisitorCount() {
    fetch("https://ipbpalmeirasba.onrender.com/visitor-count")
        .then(response => response.json())
        .then(data => {
            document.getElementById('visitor-count').textContent = data.count;
        });
}

// Translation functions
const apiKey = "0f589a67-653f-48d4-8e10-ae561e883d26:fx";

// Cache original texts
const originalTexts = new Map();

async function translateText(text, targetLang) {
    try {
        const langMap = {
            'PT-BR': 'pt',
            'EN': 'en',
            'ES': 'es',
            'FR': 'fr',
            'DE': 'de',
            'ZH': 'zh',
            'JA': 'ja'
        };

        const finalLang = langMap[targetLang] || 'en';
        const sourceLang = targetLang === 'PT-BR' ? 'en' : 'pt';
        
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${finalLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        } else {
            throw new Error('Falha na tradu��o');
        }
    } catch (error) {
        console.error('Erro na tradu��o:', error);
        console.log('Texto original:', text);
        console.log('Idioma alvo:', targetLang);
        return text; // Retorna o texto original em caso de erro
    }
}

async function translatePage(targetLang) {
    try {
        const elementsToTranslate = document.querySelectorAll('[data-translate]');
        const translations = [];

        for (const element of elementsToTranslate) {
            // Armazena o texto original se ainda n�o estiver armazenado
            if (!originalTexts.has(element)) {
                originalTexts.set(element, element.textContent);
            }
            
            // Obt�m o texto a ser traduzido
            const textToTranslate = targetLang === 'PT-BR' ? 
                originalTexts.get(element) : 
                element.textContent;
            
            translations.push({
                element,
                translation: translateText(textToTranslate, targetLang)
            });
        }

        // Mostra o indicador de carregamento
        document.body.style.cursor = 'wait';

        // Aguarda todas as tradu��es serem conclu�das
        const results = await Promise.all(translations.map(t => t.translation));
        
        // Atualiza todos os elementos com suas tradu��es
        translations.forEach((item, index) => {
            item.element.textContent = results[index];
        });

        // Esconde o indicador de carregamento
        document.body.style.cursor = 'default';
        
        console.log(`P�gina traduzida para ${targetLang}`);
    } catch (error) {
        console.error('Falha na tradu��o:', error);
        document.body.style.cursor = 'default';
    }
}
function translateToPortugues() { translatePage('PT-BR'); }
function translateToEnglish() { translatePage('EN'); }
function translateToSpanish() { translatePage('ES'); }
function translateToFrench() { translatePage('FR'); }
function translateToGerman() { translatePage('DE'); }
function translateToMandarin() { translatePage('ZH'); }
function translateToJapanese() { translatePage('JA'); }

// Scroll behavior for menu
function handleScroll() {
    const scrollPosition = window.scrollY;
    const menuItems = document.querySelectorAll('#main-nav a');
    
    menuItems.forEach(item => {
        const textSpan = item.querySelector('span');
        const icon = item.querySelector('img');
        
        if (scrollPosition > 100) {
            if (textSpan) textSpan.classList.add('hidden');
            if (icon) icon.classList.remove('hidden');
        } else {
            if (textSpan) textSpan.classList.remove('hidden');
            if (icon) icon.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchVerse();
    scheduleDailyVerse();
    initializePlayer();
    updateVisitorCount();
    new Sarcinha(); // Inicializa o chatbot
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Add lazy loading to all images
    document.querySelectorAll('img').forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
        if (!img.alt) {
            img.alt = 'Imagem da Igreja Presbiteriana em Palmeiras';
        }
    });
});

// Fun��o para rolagem suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const element = document.querySelector(this.getAttribute('href'));
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Fixar a barra de navega��o
const header = document.getElementById('header');
if (header) {
    const sticky = header.offsetTop;

    window.onscroll = function() {
        if (window.pageYOffset > sticky) {
            header.classList.add('fixed');
        } else {
            header.classList.remove('fixed');
        }
    };
}

// Volume control removed


// Fun��es para a B�blia
document.addEventListener('DOMContentLoaded', function() {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    const bibleContent = document.getElementById('bible-content');

    // Lista de livros da B�blia
    const books = [
        "G�nesis", "�xodo", "Lev�tico", "N�meros", "Deuteron�mio", "Josu�", "Ju�zes", "Rute",
        "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Cr�nicas", "2 Cr�nicas", "Esdras",
        "Neemias", "Ester", "J�", "Salmos", "Prov�rbios", "Eclesiastes", "C�nticos", "Isa�as",
        "Jeremias", "Lamenta��es", "Ezequiel", "Daniel", "Os�ias", "Joel", "Am�s", "Obadias",
        "Jonas", "Miqu�ias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
        "Mateus", "Marcos", "Lucas", "Jo�o", "Atos", "Romanos", "1 Cor�ntios", "2 Cor�ntios",
        "G�latas", "Ef�sios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses",
        "1 Tim�teo", "2 Tim�teo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
        "1 Jo�o", "2 Jo�o", "3 Jo�o", "Judas", "Apocalipse"
    ];

    // Preencher select de livros
    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book;
        option.textContent = book;
        bookSelect.appendChild(option);
    });

    // Fun��o para atualizar cap�tulos quando um livro � selecionado
bookSelect.addEventListener('change', function() {
    chapterSelect.innerHTML = '<option value="">Selecione um cap�tulo</option>';
    if (this.value) {
        const numChapters = getNumberOfChapters(this.value);
        for (let i = 1; i <= numChapters; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Cap�tulo ${i}`;
            chapterSelect.appendChild(option);
        }
    }
});

    // Carregar vers�culos quando um cap�tulo � selecionado
    chapterSelect.addEventListener('change', function() {
        if (this.value && bookSelect.value) {
            loadBibleChapter(bookSelect.value, this.value);
        }
    });

    // Fun��o para obter n�mero de cap�tulos por livro
    function getNumberOfChapters(book) {
        const chaptersCount = {
            "G�nesis": 50, "�xodo": 40, "Lev�tico": 27, "N�meros": 36, "Deuteron�mio": 34,
            "Josu�": 24, "Ju�zes": 21, "Rute": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Reis": 22,
            "2 Reis": 25, "1 Cr�nicas": 29, "2 Cr�nicas": 36, "Esdras": 10, "Neemias": 13,
            "Ester": 10, "J�": 42, "Salmos": 150, "Prov�rbios": 31, "Eclesiastes": 12,
            "C�nticos": 8, "Isa�as": 66, "Jeremias": 52, "Lamenta��es": 5, "Ezequiel": 48,
            "Daniel": 12, "Os�ias": 14, "Joel": 3, "Am�s": 9, "Obadias": 1, "Jonas": 4,
            "Miqu�ias": 7, "Naum": 3, "Habacuque": 3, "Sofonias": 3, "Ageu": 2, "Zacarias": 14,
            "Malaquias": 4, "Mateus": 28, "Marcos": 16, "Lucas": 24, "Jo�o": 21, "Atos": 28,
            "Romanos": 16, "1 Cor�ntios": 16, "2 Cor�ntios": 13, "G�latas": 6, "Ef�sios": 6,
            "Filipenses": 4, "Colossenses": 4, "1 Tessalonicenses": 5, "2 Tessalonicenses": 3,
            "1 Tim�teo": 6, "2 Tim�teo": 4, "Tito": 3, "Filemom": 1, "Hebreus": 13, "Tiago": 5,
            "1 Pedro": 5, "2 Pedro": 3, "1 Jo�o": 5, "2 Jo�o": 1, "3 Jo�o": 1, "Judas": 1,
            "Apocalipse": 22
        };
        return chaptersCount[book] || 1;
    }

    // Fun��o para carregar cap�tulo da B�blia
    function loadBibleChapter(book, chapter) {
        const bookMap = {
            "G�nesis": "genesis", "�xodo": "exodus", "Lev�tico": "leviticus",
            // Adicione mais mapeamentos conforme necess�rio
        };

        const apiBook = bookMap[book] || book.toLowerCase().replace(/\s+/g, '');
        bibleContent.innerHTML = '<p class="text-center">Carregando...</p>';

        fetch('https://ipbpalmeirasba.onrender.com/api/verse/${book}/${chapter}')
            .then(response => response.json())
            .then(data => {
                bibleContent.innerHTML = `
                    <h3 class="text-xl font-bold mb-4">${data.reference}</h3>
                    <p class="text-lg">${data.text}</p>
                `;
            })
            .catch(error => {
                bibleContent.innerHTML = '<p class="text-red-500 text-center">Erro ao carregar o texto b�blico.</p>';
                console.error('Erro:', error);
            });
    }
});

// JavaScript para o slider de organiza��es
const slider = document.getElementById('slider');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
let currentIndex = 0;

function updateSlider() {
    if (!slider) return;
    const slides = slider.children;
    const totalSlides = slides.length;
    for (let i = 0; i < totalSlides; i++) {
        slides[i].classList.add('hidden');
    }
    slides[currentIndex].classList.remove('hidden');
}

if (prevButton && nextButton && slider) {
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : slider.children.length - 1;
        updateSlider();
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex < slider.children.length - 1) ? currentIndex + 1 : 0;
        updateSlider();
    });
}

let slideIndex = 0;
showSlides();

function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    if (!slides.length || !dots.length) return;

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1 }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
    setTimeout(showSlides, 2000);
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

document.addEventListener("DOMContentLoaded", async function() {
    const mapElement = document.getElementById('map');
    const locationPhoto = document.getElementById('location-photo');

    // Busca dados da localiza��o da API
    const locationResponse = await fetch("https://ipbpalmeirasba.onrender.com/api/location");
    const locationData = await locationResponse.json();
    const { latitude, longitude } = locationData.coordinates;

    // Cria o mapa e define a visualiza��o inicial
    const map = L.map(mapElement).setView([latitude, longitude], 15);

    // Adiciona a camada de tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Adiciona um marcador para a igreja
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup('Igreja Presbiteriana em Palmeiras-BA')
        .openPopup();

    // Define uma foto da localiza��o
    locationPhoto.src = "/src/imgs/acs/igreja.png";

    // Carrega o calend�rio
    async function loadCalendar() {
        const response = await fetch('https://ipbpalmeirasba.onrender.com/api/calendar');
        const data = await response.json();
        const calendarFrame = document.getElementById('google-calendar');
        calendarFrame.src = data.calendar_url;
    }

    loadCalendar();
});

// Load documents
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
        console.error('Error loading documents:', error);
    });

let currentSlideIndex = 0;
let galleryPhotos = [];

function loadGallery() {
    fetch("https://ipbpalmeirasba.onrender.com/api/photos")
        .then(response => response.json())
        .then(photos => {
            galleryPhotos = photos;
            const galleryContainer = document.getElementById('gallery-container');
            galleryContainer.innerHTML = `
                <div class="relative w-full h-full">
                    <div class="gallery-slideshow h-full">
                        <div class="gallery-item h-full">
                            <img src="${photos[0].url}" alt="${photos[0].description}" class="w-full h-[70vh] object-cover">
                            <p class="text-center p-4 text-lg">${photos[0].description}</p>
                        </div>
                    </div>
                    <button onclick="changeSlide(-1)" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-75">?</button>
                    <button onclick="changeSlide(1)" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-75">?</button>
                </div>
            `;
            startSlideshow();
        })
        .catch(error => {
            console.error('Error loading gallery:', error);
        });
}

function changeSlide(direction) {
    currentSlideIndex = (currentSlideIndex + direction + galleryPhotos.length) % galleryPhotos.length;
    updateSlide();
}

function updateSlide() {
    const galleryItem = document.querySelector('.gallery-item');
    const photo = galleryPhotos[currentSlideIndex];
    galleryItem.innerHTML = `
        <img src="${photo.url}" alt="Foto da galeria" class="w-full h-[400px] object-cover">
    `;
}

function startSlideshow() {
    setInterval(() => {
        changeSlide(1);
    }, 3000);
}

// Chame a fun��o para carregar a galeria quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    loadGallery();
});
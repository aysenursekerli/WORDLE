const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['DEL', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'ENTER']
];

const wordList = [
    // 5 Harfli Kelimeler
    "BAHAR", "ÇİÇEK", "MÜZİK", "SAHNE", "COŞKU", "ÇADIR", "GÜNEŞ", "ÇİMEN", "BİLET", "STANT",
    "ŞARKI", "RİTİM", "YEMEK", "YARIŞ", "GİTAR", "BAHÇE", "DAVET",

    // 6 Harfli Kelimeler
    "ŞENLİK", "KONSER", "KAMPÜS", "PİKNİK", "SOHBET", "MELODİ", "ZEYBEK", "SPORCU",
    "KÜLTÜR", "NEŞELİ", "COŞKUN", "KANTİN",

    // 7 Harfli Kelimeler
    "EĞLENCE", "GÖSTERİ", "YARIŞMA", "TİYATRO", "HEYECAN", "GENÇLİK", "DİNLETİ", "DOSTLUK", "PANAYIR", "TURNUVA",
    "ŞARKICI", "OYUNCAK", "AKADEMİ", "KUTLAMA", "COŞKULU"
];
const maxAttempts = 6;
let currentLevel = 1; // 1: Kolay, 2: Orta, 3: Zor
let wordLength;
let targetWord;
let currentRow = 0;
let currentTile = 0;
let timerInterval = null;
let elapsedSeconds = 0;

const keyState = {}; // { A: 'correct' | 'present' | 'absent' }

const timerEl = document.getElementById('timer');
const levelIndicatorEl = document.getElementById('level-indicator');
const keyboardContainer = document.getElementById('keyboard-container');
const gameBoard = document.getElementById('game-board');
const themeToggleBtn = document.getElementById('theme-toggle');

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('hacker-mode');
        if (document.body.classList.contains('hacker-mode')) {
            themeToggleBtn.textContent = '☀️';
        } else {
            themeToggleBtn.textContent = '🌙';
        }
    });
}

// Modal Elementleri
const modalEl = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalBtn = document.getElementById('modal-btn');

modalBtn.addEventListener('click', () => {
    modalEl.classList.add('hidden');
    init();
});

function setKeyState(letter, state) {
    const priority = { absent: 0, present: 1, correct: 2 };
    const current = keyState[letter];

    if (current && priority[current] >= priority[state]) return;
    keyState[letter] = state;

    const keyButtons = Array.from(document.querySelectorAll('.key'));
    const button = keyButtons.find(b => b.textContent === letter);
    if (!button) return;

    if (state === 'correct') {
        button.style.backgroundColor = '#538d4e';
        button.style.color = 'white';
    } else if (state === 'present') {
        button.style.backgroundColor = '#b59f3b';
        button.style.color = 'white';
    } else if (state === 'absent') {
        button.style.backgroundColor = '#3a3a3c';
        button.style.color = 'white';
    }
}

function pickRandomWord() {
    let targetLength = 5;
    if (currentLevel === 2) targetLength = 6;
    if (currentLevel === 3) targetLength = 7;
    
    const filteredList = wordList.filter(w => w.length === targetLength);
    targetWord = filteredList[Math.floor(Math.random() * filteredList.length)];
    wordLength = targetWord.length;
}

function getInitialTime() {
    if (wordLength === 5) return 90;
    if (wordLength === 6) return 120;
    if (wordLength === 7) return 150;
    return 90; // Default
}

function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        elapsedSeconds -= 1;

        if (elapsedSeconds <= 0) {
            elapsedSeconds = 0;
            formatTimer();
            timeOutGame();
            return;
        }

        formatTimer();
    }, 1000);
}

function formatTimer() {
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    timerEl.textContent = `${minutes}:${seconds}`;

    if (elapsedSeconds <= 15 && elapsedSeconds > 0) {
        timerEl.classList.add('warning');
    } else {
        timerEl.classList.remove('warning');
    }
}

function timeOutGame() {
    stopTimer();
    setTimeout(() => {
        modalTitle.textContent = "SÜRE BİTTİ!";
        modalTitle.style.color = "#d9534f";
        modalMessage.innerHTML = `Süreniz doldu.<br>Bulmanız gereken kelime: <b>${targetWord}</b><br><br>Oyun en baştan (Kolay seviyeden) başlıyor.`;
        modalBtn.textContent = "Baştan Başla";
        currentLevel = 1;
        modalEl.classList.remove('hidden');
    }, 300);
}

function stopTimer() {
    if (!timerInterval) return;
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetGameBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;

    const totalTiles = wordLength * maxAttempts;
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.setAttribute('id', 'tile-' + i);
        gameBoard.appendChild(tile);
    }
}

function buildKeyboard() {
    keyboardContainer.innerHTML = '';

    keys.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.classList.add('keyboard-row');

        row.forEach(key => {
            const button = document.createElement('div');
            button.textContent = key;
            button.classList.add('key');
            if (key === 'ENTER' || key === 'DEL') {
                button.classList.add('wide');
            }
            button.onclick = () => handleKeyPress(key);
            rowElement.appendChild(button);
        });

        keyboardContainer.appendChild(rowElement);
    });
}

function handleKeyPress(key) {
    startTimer();
    if (key === 'DEL') {
        deleteLetter();
    } else if (key === 'ENTER') {
        checkRow();
    } else {
        addLetter(key);
    }
}

function addLetter(key) {
    if (currentTile === 0 && !timerInterval) {
        startTimer();
    }

    if (currentTile < wordLength) {
        const tile = document.getElementById('tile-' + (currentRow * wordLength + currentTile));
        tile.textContent = key;
        currentTile++;
    }
}

function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.getElementById('tile-' + (currentRow * wordLength + currentTile));
        tile.textContent = "";
    }
}

function checkRow() {
    if (currentTile !== wordLength) return;

    const rowStart = currentRow * wordLength;
    let guess = '';

    for (let i = 0; i < wordLength; i++) {
        guess += document.getElementById('tile-' + (rowStart + i)).textContent;
    }

    const targetArr = [...targetWord];
    const guessArr = [...guess];
    const result = Array(wordLength).fill('absent');
    const counts = {};

    // Harf sayımlarını çıkar
    targetArr.forEach(ch => counts[ch] = (counts[ch] || 0) + 1);

    // Önce doğru yerleri (yeşil) kontrol et
    for (let i = 0; i < wordLength; i++) {
        if (guessArr[i] === targetArr[i]) {
            result[i] = 'correct';
            counts[guessArr[i]]--;
        }
    }

    // Sonra yanlış yerleri (sarı) kontrol et
    for (let i = 0; i < wordLength; i++) {
        if (result[i] === 'correct') continue;
        const ch = guessArr[i];
        if (counts[ch] > 0) {
            result[i] = 'present';
            counts[ch]--;
        }
    }

    // Animasyonları sırayla uygula
    for (let i = 0; i < wordLength; i++) {
        const tile = document.getElementById('tile-' + (rowStart + i));
        const letter = guess[i];
        const res = result[i];

        setTimeout(() => {
            tile.classList.add('flip');
            setTimeout(() => {
                tile.classList.remove('flip');
                tile.classList.add('revealed');

                if (res === 'correct') {
                    tile.style.backgroundColor = '#538d4e';
                    tile.style.borderColor = '#538d4e';
                    setKeyState(letter, 'correct');
                } else if (res === 'present') {
                    tile.style.backgroundColor = '#b59f3b';
                    tile.style.borderColor = '#b59f3b';
                    tile.style.color = 'white';
                    setKeyState(letter, 'present');
                } else {
                    tile.style.backgroundColor = '#3a3a3c';
                    tile.style.borderColor = '#3a3a3c';
                    setKeyState(letter, 'absent');
                }
            }, 150);
        }, i * 250);
    }

    setTimeout(() => {
        if (guess === targetWord) {
            stopTimer();
            let timePlayed = getInitialTime() - elapsedSeconds;
            const minutes = String(Math.floor(timePlayed / 60)).padStart(2, '0');
            const seconds = String(timePlayed % 60).padStart(2, '0');

            let messageAddon = "";
            if (currentRow < 3) {
                createFire(); // Hızlı bildi, alev animasyonu!
                messageAddon = "<br><br><b>Harika! Çok hızlı buldun! 🔥</b>";
            } else {
                createFlowers(); // Çiçek animasyonu
            }

            setTimeout(() => {
                if (currentLevel < 3) {
                    modalTitle.textContent = "TEBRİKLER, SEVİYE ATLADINIZ!";
                    modalTitle.style.color = "#538d4e";
                    let nextLevel = currentLevel === 1 ? "Orta" : "Zor";
                    modalMessage.innerHTML = `Kelimeyi buldunuz!${messageAddon}<br><br>Süreniz: ${minutes}:${seconds}<br><br>Sıradaki seviyeye (<b>${nextLevel}</b>) geçmeye hazırsanız butona tıklayın!`;
                    modalBtn.textContent = "Sıradaki Seviye";
                    currentLevel++;
                } else {
                    modalTitle.textContent = "ŞAMPİYON!";
                    modalTitle.style.color = "#ff7eb3";
                    modalMessage.innerHTML = `Oyunu başarıyla bitirdiniz!<br>Tüm zorluk seviyelerini (Kolay, Orta, Zor) aştınız.<br><br>Son Seviye Süreniz: ${minutes}:${seconds}`;
                    modalBtn.textContent = "Baştan Başla";
                    currentLevel = 1;
                }
                modalEl.classList.remove('hidden');
            }, 300);
            return;
        }

        if (currentRow === maxAttempts - 1) {
            stopTimer();
            setTimeout(() => {
                modalTitle.textContent = "MAALESEF BİTTİ!";
                modalTitle.style.color = "#d9534f";
                modalMessage.innerHTML = `Bulmanız gereken kelime: <b>${targetWord}</b><br><br>Kaybettiniz. Oyun en başa (Kolay seviyeye) dönüyor.`;
                modalBtn.textContent = "Baştan Başla";
                currentLevel = 1;
                modalEl.classList.remove('hidden');
            }, 300);
            return;
        }

        currentRow++;
        currentTile = 0;
    }, wordLength * 250 + 200);
}

function init() {
    stopTimer(); // Varsa eski sayacı durdur
    currentRow = 0;
    currentTile = 0;

    let levelText = "Kolay";
    let levelColor = "#538d4e";
    if (currentLevel === 2) { levelText = "Orta"; levelColor = "#b59f3b"; }
    if (currentLevel === 3) { levelText = "Zor"; levelColor = "#d9534f"; }
    
    if (levelIndicatorEl) {
        levelIndicatorEl.textContent = `Seviye ${currentLevel}: ${levelText}`;
        levelIndicatorEl.style.backgroundColor = levelColor;
    }

    // Kelimeyi seç
    pickRandomWord();

    // Süreyi ayarla
    elapsedSeconds = getInitialTime();
    formatTimer();

    // Yeni oyun için tuş durumlarını sınırla (eski renkler kalmasın)
    for (const key in keyState) {
        delete keyState[key];
    }

    resetGameBoard();
    buildKeyboard();

    // İlk harfi otomatik olarak yerleştir ve yeşil yap
    const firstLetter = targetWord[0];
    const firstTile = document.getElementById('tile-0');

    if (firstTile) {
        firstTile.textContent = firstLetter;
        firstTile.classList.add('revealed');
        firstTile.style.backgroundColor = '#538d4e';
        firstTile.style.borderColor = '#538d4e';
        firstTile.style.color = 'white';
        setKeyState(firstLetter, 'correct'); // Klavyede de yeşil yap
        currentTile = 1; // İkinci kutudan başlasın
    }
}

// Fiziksel klavye dinleyicisi
document.addEventListener('keydown', (e) => {
    // Sadece oyun aktifken klavye kullanımına izin ver
    if (!modalEl.classList.contains('hidden') || elapsedSeconds <= 0) {
        return;
    }

    let pressedKey = String(e.key);

    // Enter ve Backspace özel işlemleri
    if (pressedKey.toUpperCase() === 'ENTER') {
        handleKeyPress('ENTER');
        return;
    }
    if (pressedKey.toUpperCase() === 'BACKSPACE') {
        handleKeyPress('DEL');
        return;
    }

    // Harf karakteri kontrolü - Türkçe karakterleri destekler (İ, Ş, Ğ, Ü, vb.)
    pressedKey = pressedKey.toLocaleUpperCase('tr-TR'); // Türkçe kurallarına göre büyük harf yap (i -> İ)

    let isKeyValid = false;
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].includes(pressedKey)) {
            isKeyValid = true;
            break;
        }
    }

    if (isKeyValid) {
        handleKeyPress(pressedKey);
    }
});

function createFlowers() {
    const emojis = ['🌸', '🌼', '🌺', '🍃', '🦋'];
    const flowerCount = 30;

    for (let i = 0; i < flowerCount; i++) {
        const flower = document.createElement('div');
        flower.classList.add('flower');
        flower.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        // Rastgele yatay konum
        flower.style.left = Math.random() * 100 + 'vw';

        // Rastgele animasyon süresi ve gecikme
        const duration = Math.random() * 3 + 2; // 2-5 saniye arası
        flower.style.animationDuration = duration + 's';
        flower.style.animationDelay = Math.random() * 2 + 's';

        document.body.appendChild(flower);

        // Animasyon bitince elementi temizle
        setTimeout(() => {
            flower.remove();
        }, (duration + 2) * 1000);
    }
}

function createFire() {
    const emojis = ['🔥', '💥', '🚀', '🎇'];
    const fireCount = 40;

    for (let i = 0; i < fireCount; i++) {
        const fire = document.createElement('div');
        fire.classList.add('flower'); // Re-use the absolute positioning style of flower
        fire.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        fire.style.left = Math.random() * 100 + 'vw';
        fire.style.top = '110vh'; // Start from bottom

        const duration = Math.random() * 2 + 1; // 1-3 saniye (daha hızlı)
        
        // Custom animation for fire (going up)
        fire.animate([
            { transform: 'translateY(0) scale(0.5)', opacity: 1 },
            { transform: `translateY(-120vh) scale(1.5) rotate(${Math.random()*360}deg)`, opacity: 0 }
        ], {
            duration: duration * 1000,
            easing: 'ease-out',
            fill: 'forwards',
            delay: Math.random() * 1000
        });

        document.body.appendChild(fire);

        setTimeout(() => {
            fire.remove();
        }, duration * 1000 + 1500);
    }
}

init();

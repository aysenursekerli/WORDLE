const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['DEL', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'ENTER']
];

const wordList = [
    "İFTAR",
    "SAHUR",
    "ZEKAT",
    "SECDE",
    "ŞÜKÜR",
    "SABIR",
    "NİMET",
    "TAKVA",
    "KIBLE",
    "RAHİM",
    "HACET",
    "KELAM",
    "SALİH",
    "HELAL",
    "İMSAK",
    "HURMA",
    "SEVAP",
    "MELEK",
    "ZİKİR",
    "TESBİH",
    "KURBAN",
    "İBADET",
    "HİKMET",
    "RAHMAN",
    "KIRAAT",
    "SÜNNET",
    "SECDAH",
    "RAMAZAN",
    "TERAVİH",
    "SADAKA",
    "MÜBAREK",
    "RAHMET",
    "CENNET",
    "ŞEFAAT",
    "BEREKET",
    "HİKMETLİ",
    "NİYAZ",
    "İKRAM",
    "TEVBE",
    "RAHMET",
    "MÜMİN",
    // 6 Harfli Kelimeler
    "KANDİL", "TERAVİ", "YARDIM", "ŞERBET", "PİDELİ", "İBADET", "TESBİH", "MİNARE",

    // 7 Harfli Kelimeler
    "RAMAZAN", "SADAKA", "MÜBAREK", "NİYETLİ"
];
const maxAttempts = 6;
let wordLength;
let targetWord;
let currentRow = 0;
let currentTile = 0;
let timerInterval = null;
let elapsedSeconds = 0;

const keyState = {}; // { A: 'correct' | 'present' | 'absent' }

const timerEl = document.getElementById('timer');
const keyboardContainer = document.getElementById('keyboard-container');
const gameBoard = document.getElementById('game-board');

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
        button.style.backgroundColor = '#6aaa64';
        button.style.color = 'white';
    } else if (state === 'present') {
        button.style.backgroundColor = '#c9b458';
        button.style.color = 'white';
    } else if (state === 'absent') {
        button.style.backgroundColor = '#787c7e';
        button.style.color = 'white';
    }
}

function pickRandomWord() {
    targetWord = wordList[Math.floor(Math.random() * wordList.length)];
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
}

function timeOutGame() {
    stopTimer();
    setTimeout(() => {
        modalTitle.textContent = "SÜRE BİTTİ!";
        modalTitle.style.color = "#d9534f";
        modalMessage.innerHTML = `Süreniz doldu.<br>Bulmanız gereken kelime: <b>${targetWord}</b>`;
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
                    tile.style.backgroundColor = '#6aaa64';
                    tile.style.borderColor = '#6aaa64';
                    setKeyState(letter, 'correct');
                } else if (res === 'present') {
                    tile.style.backgroundColor = '#c9b458';
                    tile.style.borderColor = '#c9b458';
                    setKeyState(letter, 'present');
                } else {
                    tile.style.backgroundColor = '#787c7e';
                    tile.style.borderColor = '#787c7e';
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

            setTimeout(() => {
                modalTitle.textContent = "TEBRİKLER!";
                modalTitle.style.color = "#6aaa64";
                modalMessage.innerHTML = `Kelimeyi buldunuz!<br><br><b>Oynama Süreniz:</b> ${minutes}:${seconds}`;
                modalEl.classList.remove('hidden');
            }, 300);
            return;
        }

        if (currentRow === maxAttempts - 1) {
            stopTimer();
            setTimeout(() => {
                modalTitle.textContent = "MAALESEF BİTTİ!";
                modalTitle.style.color = "#d9534f";
                modalMessage.innerHTML = `Bulmanız gereken kelime: <b>${targetWord}</b><br><br><b>Kalan Süreniz:</b> ${timerEl.textContent}`;
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
        firstTile.style.backgroundColor = '#6aaa64';
        firstTile.style.borderColor = '#6aaa64';
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

init();

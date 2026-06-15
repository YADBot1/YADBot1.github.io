// ======================
// ЕЛЕМЕНТИ DOM ТА ЗМІННІ
// ======================
const apiKey = document.getElementById("apiKey");
const pasteBtn = document.getElementById("pasteBtn");
const connectBtn = document.getElementById("connectBtn");
const apiStatus = document.getElementById("apiStatus");
const welcome = document.getElementById("welcomeScreen");
const folderSection = document.getElementById("folderSection");
const folderInput = document.getElementById("folderInput");
const folderName = document.getElementById("folderName");
const startBtn = document.getElementById("startBtn");
const tableWrapper = document.getElementById("tableWrapper");
const photoTable = document.querySelector("#photoTable tbody");
const modelSelect = document.getElementById("modelSelect");
const progressWrapper = document.getElementById("progressWrapper");

const CSV_URL = "https://docs.google.com/spreadsheets/d/1kc_v-kZMPSh_2f3k4g1ELiI23Uhe8XxQAblkEo3EwC0/export?format=csv";

let isRunning = false;
let currentRunId = 0; 
window.allFiles = []; 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ======================
// ЛОГІКА МОВИ (COOKIES ТА ПЕРЕКЛАД)
// ======================
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

const translations = {
    uk: {
        mainTitle: "Stock Keymaster",
        apiKeyPlaceholder: "Вставте Gemini API Key", pasteBtn: "Вставити", connectBtn: "Підключити",
        welcomeTitle: "Для генерації використовується Google Gemini API", welcomeText: "Щоб почати роботу необхідно отримати та вставити API ключ.", getKeyBtn: "Отримати API ключ",
        folderBtn: "Вибрати папку", folderDefault: "Папка не вибрана", folderSelected: "Вибрана папка: ",
        modelDefaultOpt: "Завантаження моделей...", startBtn: "Почати генерацію", stopBtn: "Стоп",
        thMedia: "Медіа", thTitle: "Назва", thDesc: "Опис", thKeys: "Ключові слова",
        noData: "Немає даних", analyzing: "Аналіз...", error: "Помилка",
        statusConnecting: "З'єднання з сервером...", statusActive: "Ключ активний. Можна працювати!",
        statusInvalid: "Помилка: Неправильний API ключ або немає з'єднання.", statusStopped: "Генерація зупинена.",
        statusStarted: "Генерація запущена...", statusPaused: "Помилка. Пауза 30с перед повтором...",
        statusRestored: "Генерація відновлена...", statusFinished: "Генерація успішно завершена!", alertPaste: "Будь ласка, вставте ключ вручну."
    },
    en: {
        mainTitle: "Stock Keymaster",
        apiKeyPlaceholder: "Paste Gemini API Key", pasteBtn: "Paste", connectBtn: "Connect",
        welcomeTitle: "Google Gemini API is used for generation", welcomeText: "To start working, you need to get and paste an API key.", getKeyBtn: "Get API Key",
        folderBtn: "Select folder", folderDefault: "No folder selected", folderSelected: "Selected folder: ",
        modelDefaultOpt: "Loading models...", startBtn: "Start generation", stopBtn: "Stop",
        thMedia: "Media", thTitle: "Title", thDesc: "Description", thKeys: "Keywords",
        noData: "No data", analyzing: "Analyzing...", error: "Error",
        statusConnecting: "Connecting to server...", statusActive: "Key is active. Ready to work!",
        statusInvalid: "Error: Invalid API key or connection failed.", statusStopped: "Generation stopped.",
        statusStarted: "Generation started...", statusPaused: "Error. Pausing 30s before retrying...",
        statusRestored: "Generation restored...", statusFinished: "Generation successfully completed!", alertPaste: "Please paste the key manually."
    }
};

let currentLang = getCookie('stock_lang') || 'uk';

function changeLanguage(lang) {
    currentLang = lang;
    setCookie('stock_lang', lang, 365);
    const t = translations[lang];

    // Оновлення кнопок перемикача
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));

    // Оновлення статичних текстів (з перевіркою чи існує елемент)
    if (document.getElementById('mainTitle')) document.getElementById('mainTitle').innerText = t.mainTitle;
    if (apiKey) apiKey.placeholder = t.apiKeyPlaceholder;
    if (pasteBtn) pasteBtn.innerText = t.pasteBtn;
    if (connectBtn) connectBtn.innerText = t.connectBtn;
    if (document.getElementById('welcomeTitle')) document.getElementById('welcomeTitle').innerText = t.welcomeTitle;
    if (document.getElementById('welcomeText')) document.getElementById('welcomeText').innerText = t.welcomeText;
    if (document.getElementById('getKeyBtn')) document.getElementById('getKeyBtn').innerText = t.getKeyBtn;
    if (document.getElementById('folderBtnText')) document.getElementById('folderBtnText').innerText = t.folderBtn;
    
    if (document.getElementById('modelDefaultOpt')) document.getElementById('modelDefaultOpt').innerText = t.modelDefaultOpt;
    
    if (window.allFiles && window.allFiles.length > 0) {
        folderName.innerText = t.folderSelected + window.allFiles[0].webkitRelativePath.split("/")[0];
    } else {
        folderName.innerText = t.folderDefault;
    }

    if (startBtn) startBtn.innerText = isRunning ? t.stopBtn : t.startBtn;

    // Заголовки таблиці
    if (document.getElementById('thMedia')) document.getElementById('thMedia').innerText = t.thMedia;
    if (document.getElementById('thTitle')) document.getElementById('thTitle').innerText = t.thTitle;
    if (document.getElementById('thDesc')) document.getElementById('thDesc').innerText = t.thDesc;
    if (document.getElementById('thKeys')) document.getElementById('thKeys').innerText = t.thKeys;

    // Динамічні тексти в таблиці (Немає даних / Помилка)
    document.querySelectorAll('.text-content').forEach(cell => {
        const text = cell.innerText.trim();
        if (text === translations['uk'].noData || text === translations['en'].noData) cell.innerText = t.noData;
        if (text === translations['uk'].error || text === translations['en'].error) cell.innerHTML = `<span style="color: #ff4444;">${t.error}</span>`;
    });

    // Крутилки завантаження
    document.querySelectorAll('.loading-wrapper').forEach(wrapper => {
        wrapper.innerHTML = `<div class="loader"></div> ${t.analyzing}`;
    });

    // Оновлення статусу
    if (apiStatus && apiStatus.innerText) {
        const currentStatus = apiStatus.innerText;
        if (currentStatus.includes(translations['uk'].statusActive) || currentStatus.includes(translations['en'].statusActive)) apiStatus.innerHTML = `✅ ${t.statusActive}`;
        else if (currentStatus.includes(translations['uk'].statusInvalid) || currentStatus.includes(translations['en'].statusInvalid)) apiStatus.innerHTML = `❌ ${t.statusInvalid}`;
        else if (currentStatus.includes(translations['uk'].statusConnecting) || currentStatus.includes(translations['en'].statusConnecting)) apiStatus.innerHTML = t.statusConnecting;
        else if (currentStatus.includes(translations['uk'].statusStopped) || currentStatus.includes(translations['en'].statusStopped)) apiStatus.innerHTML = `⏹ ${t.statusStopped}`;
        else if (currentStatus.includes(translations['uk'].statusStarted) || currentStatus.includes(translations['en'].statusStarted)) apiStatus.innerHTML = `✅ ${t.statusStarted}`;
        else if (currentStatus.includes("30") || currentStatus.includes("Пауза") || currentStatus.includes("Pausing")) apiStatus.innerHTML = `⚠️ ${t.statusPaused}`;
        else if (currentStatus.includes(translations['uk'].statusFinished) || currentStatus.includes(translations['en'].statusFinished)) apiStatus.innerHTML = `✅ ${t.statusFinished}`;
    }
}

// Слухачі для кнопок перемикача мови
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => changeLanguage(btn.dataset.lang));
});


// ======================
// ЗАВАНТАЖЕННЯ МОДЕЛЕЙ З ТАБЛИЦІ
// ======================
async function loadModelsFromCSV() {
    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error("Помилка доступу");
        const data = await response.text();
        const rows = data.split(/\r?\n/);
        modelSelect.innerHTML = ""; 

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;
            const columns = row.split(',');
            if (columns.length >= 2) {
                const name = columns[0].trim();
                const tag = columns[1].trim();
                if (name && tag) {
                    const option = document.createElement("option");
                    option.value = tag;
                    option.text = name;
                    modelSelect.appendChild(option);
                }
            }
        }
        const savedModel = localStorage.getItem("GEMINI_MODEL");
        if (savedModel) modelSelect.value = savedModel;
    } catch (error) { console.error("Помилка:", error); }
}

// ======================
// АВТОРИЗАЦІЯ
// ======================
function saveKey(value) { localStorage.setItem("GEMINI_KEY", value); }
function updateState(isValidated = false) {
    const hasKey = apiKey.value.trim().length > 0;
    if (hasKey && !isValidated) {
        connectBtn.classList.remove("hidden");
        welcome.classList.remove("hidden");
        folderSection.classList.add("hidden-locked");
        tableWrapper.classList.add("hidden");
    } else if (hasKey && isValidated) {
        connectBtn.classList.add("hidden");
        welcome.classList.add("hidden");
        folderSection.classList.remove("hidden-locked");
    } else {
        connectBtn.classList.add("hidden");
        welcome.classList.remove("hidden");
        folderSection.classList.add("hidden-locked");
        tableWrapper.classList.add("hidden");
        apiStatus.innerHTML = "";
    }
}

apiKey.addEventListener("input", () => { apiStatus.innerHTML = ""; updateState(false); });
pasteBtn.addEventListener("click", async () => {
    try { apiKey.value = await navigator.clipboard.readText(); apiStatus.innerHTML = ""; updateState(false); } 
    catch (err) { alert(translations[currentLang].alertPaste); }
});

connectBtn.addEventListener("click", async () => {
    const key = apiKey.value.trim();
    if (!key) return;
    connectBtn.disabled = true;
    apiStatus.innerHTML = translations[currentLang].statusConnecting;
    apiStatus.className = "api-status";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (response.ok) {
            apiStatus.innerHTML = `✅ ${translations[currentLang].statusActive}`;
            apiStatus.className = "api-status status-success";
            await loadModelsFromCSV();
            saveKey(key);
            updateState(true);
        } else throw new Error("Invalid Key");
    } catch (error) {
        apiStatus.innerHTML = `❌ ${translations[currentLang].statusInvalid}`;
        apiStatus.className = "api-status status-error";
        updateState(false);
    } finally { connectBtn.disabled = false; }
});
modelSelect.addEventListener("change", (e) => localStorage.setItem("GEMINI_MODEL", e.target.value));

// ======================
// ЕКСТРАКЦІЯ КАДРУ З ВІДЕО
// ======================
function extractVideoFrame(file, timeFraction) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        const url = URL.createObjectURL(file);
        video.src = url;

        video.onloadedmetadata = () => {
            video.currentTime = Math.max(0, Math.min(video.duration * timeFraction, video.duration - 0.1));
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            let w = video.videoWidth;
            let h = video.videoHeight;
            const max = 1024; 
            if (w > max || h > max) {
                if (w > h) { h = Math.round(h * (max / w)); w = max; } 
                else { w = Math.round(w * (max / h)); h = max; }
            }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
            URL.revokeObjectURL(url);
        };
        video.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    });
}

// ======================
// ОБРОБКА ВИБОРУ ПАПКИ
// ======================
folderInput.addEventListener("change", () => {
    const files = [...folderInput.files];
    if (!files.length) return;

    folderName.innerText = translations[currentLang].folderSelected + files[0].webkitRelativePath.split("/")[0];
    tableWrapper.classList.remove("hidden");
    startBtn.classList.remove("hidden");
    photoTable.innerHTML = "";

    const validFiles = files.filter(f => 
        (f.type.startsWith("image/") || f.type.startsWith("video/")) && 
        !f.webkitRelativePath.includes("StockKeymaster_Results") && 
        !f.webkitRelativePath.includes("/src/")
    );
    window.allFiles = validFiles; 

    const fragment = document.createDocumentFragment();
    validFiles.forEach((file, index) => {
        const row = document.createElement("tr");
        const isVideo = file.type.startsWith("video/");
        const noDataText = translations[currentLang].noData;
        
        row.innerHTML = `
            <td>
                <div class="${isVideo ? 'thumb-video-icon' : ''}">
                    <img src="" class="thumb" data-index="${index}">
                </div>
            </td>
            <td><div class="content-wrapper"><div class="text-content">${noDataText}</div><button class="copy-btn" onclick="copyText(this)">📋</button></div></td>
            <td><div class="content-wrapper"><div class="text-content">${noDataText}</div><button class="copy-btn" onclick="copyText(this)">📋</button></div></td>
            <td><div class="content-wrapper"><div class="text-content keys">${noDataText}</div><button class="copy-btn" onclick="copyText(this)">📋</button></div></td>
        `;
        fragment.appendChild(row);

        const imgEl = row.querySelector('.thumb');
        
        if (isVideo) {
            extractVideoFrame(file, 0.1).then(dataUrl => { if(dataUrl) imgEl.src = dataUrl; });
        } else {
            imgEl.src = URL.createObjectURL(file);
            imgEl.onload = () => URL.revokeObjectURL(imgEl.src);
        }
    });
    photoTable.appendChild(fragment);
    updateProgress(0, validFiles.length);
});

// ======================
// ГЕНЕРАЦІЯ ЧЕРЕЗ API
// ======================
startBtn.addEventListener("click", async () => {
    if (isRunning) {
        isRunning = false;
        currentRunId++; 
        startBtn.innerText = translations[currentLang].startBtn;
        apiStatus.innerHTML = `⏹ ${translations[currentLang].statusStopped}`;
        apiStatus.className = "api-status";
        resetLoadingRows(); 
        return;
    }

    isRunning = true;
    currentRunId++;
    const myRunId = currentRunId; 

    startBtn.innerText = translations[currentLang].stopBtn;
    progressWrapper.classList.remove("hidden");
    apiStatus.innerHTML = `✅ ${translations[currentLang].statusStarted}`;
    apiStatus.className = "api-status status-success";
    
    const key = apiKey.value.trim();
    const model = modelSelect.value;
    const rows = [...photoTable.querySelectorAll("tr")];
    const files = window.allFiles;

    for (let i = 0; i < rows.length; i++) {
        if (!isRunning || currentRunId !== myRunId) break;

        const firstCell = rows[i].querySelector(".text-content").innerText.trim();
        if (firstCell !== translations[currentLang].noData && firstCell !== translations[currentLang].error) {
            updateProgress(i + 1, rows.length);
            continue; 
        }

        let success = false;
        while (!success && isRunning && currentRunId === myRunId) {
            try {
                setRowLoading(rows[i]); 
                const result = await generateDataAPI(key, model, files[i]);
                if (!isRunning || currentRunId !== myRunId) break; 
                
                updateTableRow(rows[i], result); 
                success = true;
                updateProgress(i + 1, rows.length);
                await sleep(2000); 
                
            } catch (err) {
                console.error(err);
                if (!isRunning || currentRunId !== myRunId) break;
                setRowError(rows[i]);
                apiStatus.innerHTML = `⚠️ ${translations[currentLang].statusPaused}`;
                apiStatus.className = "api-status status-error";
                
                for (let sec = 0; sec < 30; sec++) {
                    if (!isRunning || currentRunId !== myRunId) break;
                    await sleep(1000);
                }
                if (isRunning && currentRunId === myRunId) {
                    apiStatus.innerHTML = `✅ ${translations[currentLang].statusRestored}`;
                    apiStatus.className = "api-status status-success";
                }
            }
        }
    }
    
    if (isRunning && currentRunId === myRunId) {
        isRunning = false;
        startBtn.innerText = translations[currentLang].startBtn;
        apiStatus.innerHTML = `✅ ${translations[currentLang].statusFinished}`;
    }
});

async function generateDataAPI(key, model, file) {
    const isVideo = file.type.startsWith("video/");
    let parts = [];

    const prompt = `Проаналізуй ${isVideo ? 'кадри з відео' : 'фото'} для фотостоку Adobe Stock. 
Поверни відповідь СУВОРО у форматі JSON з наступними полями:
- "title": короткий, комерційно привабливий заголовок (5-10 слів).
- "description": детальний та змістовний опис того, що зображено, складений з 2-3 повноцінних речень.
- "keywords": список з 49 релевантних ключових слів (тільки суть фото/відео, без технічних термінів як 'generative ai' чи '8k').
Мова всього тексту: Англійська.`;

    parts.push({ text: prompt });

    if (isVideo) {
        const frames = await Promise.all([
            extractVideoFrame(file, 0.1), 
            extractVideoFrame(file, 0.5), 
            extractVideoFrame(file, 0.9)  
        ]);
        frames.forEach(frame => {
            if (frame) {
                parts.push({ inline_data: { mime_type: "image/jpeg", data: frame.split(',')[1] } });
            }
        });
    } else {
        const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        parts.push({ inline_data: { mime_type: file.type, data: base64Data } });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: parts }] })
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonStr);
}

function resetLoadingRows() {
    photoTable.querySelectorAll("tr").forEach(row => {
        if (row.querySelector(".loading-wrapper")) {
            const cells = row.querySelectorAll(".text-content");
            cells[0].innerText = translations[currentLang].noData;
            cells[1].innerText = translations[currentLang].noData;
            cells[2].innerText = translations[currentLang].noData;
        }
    });
}
function setRowLoading(row) {
    const cells = row.querySelectorAll(".text-content");
    const loaderHTML = `<div class="loading-wrapper"><div class="loader"></div> ${translations[currentLang].analyzing}</div>`;
    cells[0].innerHTML = loaderHTML; cells[1].innerHTML = loaderHTML; cells[2].innerHTML = loaderHTML;
}
function setRowError(row) {
    const cells = row.querySelectorAll(".text-content");
    cells.forEach(c => c.innerHTML = `<span style="color: #ff4444;">${translations[currentLang].error}</span>`);
}
function updateTableRow(row, data) {
    const cells = row.querySelectorAll(".text-content");
    cells[0].innerText = data.title;
    cells[1].innerText = data.description;
    cells[2].innerText = Array.isArray(data.keywords) ? data.keywords.join(", ") : data.keywords;
}
function updateProgress(current, total) {
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    document.getElementById("progressText").innerText = `${current} / ${total}`;
    document.getElementById("progressFill").style.width = `${percent}%`;
    document.getElementById("percentText").innerText = `${percent}%`;
}

// ======================
// ПЛАВАЮЧЕ ПРЕВ'Ю МИШІ
// ======================
const hoverPreview = document.getElementById('hoverPreview');
const hoverImage = document.getElementById('hoverImage');
const hoverVideo = document.getElementById('hoverVideo');
let isTracking = false; 

photoTable.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('thumb')) {
        isTracking = true;
        const fileIndex = e.target.getAttribute('data-index');
        const file = window.allFiles[fileIndex];

        if (file.type.startsWith('video/')) {
            hoverImage.style.display = 'none';
            hoverVideo.style.display = 'block';
            hoverVideo.src = URL.createObjectURL(file);
            hoverVideo.play().catch(err => console.log('Autoplay:', err));
        } else {
            hoverVideo.style.display = 'none';
            hoverImage.style.display = 'block';
            hoverImage.src = URL.createObjectURL(file);
        }
        hoverPreview.classList.add('visible');
    }
});

photoTable.addEventListener('mousemove', (e) => {
    if (isTracking) {
        const offset = 20;
        const previewHeight = hoverPreview.offsetHeight || 300;
        const previewWidth = hoverPreview.offsetWidth || 300;
        
        if (e.clientY + previewHeight + offset > window.innerHeight) {
            hoverPreview.style.top = (e.clientY - previewHeight - offset) + 'px';
        } else {
            hoverPreview.style.top = (e.clientY + offset) + 'px';
        }
        
        if (e.clientX + previewWidth + offset > window.innerWidth) {
            hoverPreview.style.left = (e.clientX - previewWidth - offset) + 'px';
        } else {
            hoverPreview.style.left = (e.clientX + offset) + 'px';
        }
    }
});

photoTable.addEventListener('mouseout', (e) => {
    if (e.target.classList.contains('thumb')) {
        isTracking = false;
        hoverPreview.classList.remove('visible');
        
        setTimeout(() => {
            if (!isTracking) {
                if (hoverVideo.src) { hoverVideo.pause(); URL.revokeObjectURL(hoverVideo.src); hoverVideo.removeAttribute('src'); }
                if (hoverImage.src) { URL.revokeObjectURL(hoverImage.src); hoverImage.removeAttribute('src'); }
            }
        }, 300);
    }
});

// ======================
// КОПІЮВАННЯ ТЕКСТУ
// ======================
window.copyText = function(btn) {
    const text = btn.parentElement.querySelector('.text-content').innerText;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(textArea);
    }
    const oldText = btn.innerHTML;
    btn.innerHTML = '✅';
    setTimeout(() => btn.innerHTML = oldText, 1500);
};

// ======================
// ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ
// ======================
function init() {
    changeLanguage(currentLang);
    const saved = localStorage.getItem("GEMINI_KEY");
    if (saved) { apiKey.value = saved; updateState(false); connectBtn.click(); }
}
// Запускаємо відразу після завантаження
init();
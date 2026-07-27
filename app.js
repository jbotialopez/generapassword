const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = new Set(["0", "O", "o", "1", "l", "I", "5", "S", "8", "B"]);
const LEVEL_LABEL = { weak: "Débil", fair: "Aceptable", medium: "Buena", strong: "Muy fuerte" };

const CLIPBOARD_CLEAR_MS = 25000;

// Lista propia de sustantivos comunes en español para el modo "Frase" (estilo
// diceware): se generan uniendo N palabras al azar con guiones, sin depender de
// ninguna lista ni servicio externo.
const WORDS = [
    "perro", "gato", "oso", "lobo", "zorro", "conejo", "liebre", "rata", "vaca", "toro",
    "cabra", "oveja", "cerdo", "pollo", "gallina", "pavo", "pato", "ganso", "caballo", "mula",
    "burro", "camello", "elefante", "mono", "gorila", "cebra", "koala", "canguro", "foca", "nutria",
    "castor", "ardilla", "erizo", "hormiga", "abeja", "mosca", "mosquito", "grillo", "mariposa", "oruga",
    "gusano", "caracol", "cangrejo", "langosta", "pulpo", "tiburón", "delfín", "ballena", "pez", "sapo",
    "rana", "lagarto", "tortuga", "cocodrilo", "serpiente", "águila", "halcón", "búho", "cuervo", "paloma",
    "loro", "pingüino", "cisne", "gaviota", "avestruz", "jirafa", "leopardo", "pantera", "tigre", "león",
    "rinoceronte", "murciélago", "araña", "escorpión", "lagartija",
    "monte", "valle", "río", "lago", "mar", "océano", "playa", "isla", "bosque", "selva",
    "desierto", "volcán", "cueva", "cascada", "colina", "llano", "pradera", "nube", "cielo", "estrella",
    "luna", "sol", "planeta", "cometa", "nieve", "hielo", "lluvia", "niebla", "viento", "trueno",
    "relámpago", "duna", "arena", "piedra", "roca", "tierra", "barro", "lodo", "hoja", "rama",
    "tronco", "raíz", "flor", "semilla", "corteza", "espina",
    "martillo", "clavo", "tornillo", "llave", "puerta", "ventana", "mesa", "silla", "cama", "lámpara",
    "espejo", "reloj", "libro", "pluma", "papel", "tinta", "caja", "bolsa", "cesta", "cuerda",
    "cadena", "escalera", "cubo", "pala", "tijera", "cuchillo", "tenedor", "cuchara", "plato", "vaso",
    "taza", "olla", "sartén", "horno", "nevera", "radio", "teléfono", "cámara", "maleta", "mochila",
    "paraguas", "sombrero", "guante", "bufanda", "cinturón", "zapato", "bota", "sandalia", "tambor", "guitarra",
    "piano", "violín", "flauta", "trompeta", "silbato", "pincel", "lápiz", "tiza", "pizarra", "cuaderno",
    "libreta", "sobre", "sello", "cartel", "mapa", "brújula", "linterna", "vela", "fósforo", "candado",
    "tuerca", "alambre", "tubería", "manguera", "escoba", "trapo", "jabón", "esponja", "peine", "cepillo",
    "plancha", "tostadora", "licuadora", "batidora",
    "manzana", "plátano", "naranja", "limón", "uva", "pera", "melón", "sandía", "fresa", "cereza",
    "durazno", "mango", "coco", "nuez", "almendra", "avellana", "pan", "queso", "leche", "huevo",
    "carne", "pescado", "arroz", "trigo", "maíz", "papa", "tomate", "cebolla", "ajo", "pimiento",
    "lechuga", "zanahoria", "pepino", "calabaza", "aceituna", "aceite", "vinagre", "azúcar", "sal", "miel",
    "chocolate", "café", "vino", "cerveza", "agua", "jugo", "sopa", "ensalada", "pastel", "helado",
    "jamón", "mostaza", "canela", "jarabe", "mermelada",
    "rojo", "azul", "verde", "amarillo", "negro", "blanco", "gris", "violeta", "rosa", "dorado", "plateado",
    "casa", "castillo", "torre", "puente", "palacio", "iglesia", "escuela", "hospital", "mercado", "museo",
    "teatro", "biblioteca", "jardín", "parque", "granero", "molino", "faro", "puerto", "aeropuerto", "estación",
    "mano", "pie", "cabeza", "ojo", "oreja", "nariz", "boca", "diente", "brazo", "pierna",
    "dedo", "cuello", "hombro", "rodilla", "codo",
    "médico", "maestro", "piloto", "marinero", "granjero", "pescador", "cocinero", "panadero", "herrero", "carpintero",
    "pintor", "músico", "bailarín", "escritor", "poeta",
];

const body = document.body;
const lengthSlider = document.getElementById("length");
const lengthNumber = document.getElementById("lengthNumber");
const passwordField = document.getElementById("password");
const meter = document.getElementById("meter");
const meterLabel = document.getElementById("meterLabel");
const ticks = meter.querySelectorAll(".tick");
const hint = document.getElementById("hint");
const copyBtn = document.getElementById("copyBtn");
const generateBtn = document.getElementById("generateBtn");
const themeToggle = document.getElementById("themeToggle");
const srStatus = document.getElementById("srStatus");
const toast = document.getElementById("toast");

const switches = {
    uppercase: document.getElementById("uppercase"),
    lowercase: document.getElementById("lowercase"),
    numbers: document.getElementById("numbers"),
    symbols: document.getElementById("symbols"),
    noAmbiguous: document.getElementById("noAmbiguous"),
};

const modeRadios = document.querySelectorAll('input[name="mode"]');
const lengthIndex = document.getElementById("lengthIndex");
const switchesRandom = document.getElementById("switchesRandom");
const switchesPhrase = document.getElementById("switchesPhrase");
const phraseCapitalize = document.getElementById("phraseCapitalize");
const phraseNumber = document.getElementById("phraseNumber");

// --- Tema: respeta el sistema por defecto; el botón fuerza y persiste una preferencia ---
const storedTheme = localStorage.getItem("theme");
if (storedTheme === "dark") body.classList.add("dark-mode");
else if (storedTheme === "light") body.classList.add("light-mode");

function isDarkEffective() {
    if (body.classList.contains("dark-mode")) return true;
    if (body.classList.contains("light-mode")) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function syncThemeIcon() {
    const dark = isDarkEffective();
    themeToggle.classList.toggle("is-dark", dark);
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}

themeToggle.addEventListener("click", () => {
    if (isDarkEffective()) {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        localStorage.setItem("theme", "light");
    } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
    }
    syncThemeIcon();
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!body.classList.contains("dark-mode") && !body.classList.contains("light-mode")) syncThemeIcon();
});

syncThemeIcon();

// --- Tipo de contraseña: aleatoria (caracteres) o frase (palabras) ---
const MODE_CONFIG = {
    random: { min: 4, max: 128, default: 16, index: "02 · Longitud", rangeLabel: "Longitud de la contraseña", numberLabel: "Longitud exacta" },
    phrase: { min: 3, max: 12, default: 6, index: "02 · Número de palabras", rangeLabel: "Número de palabras", numberLabel: "Número exacto de palabras" },
};

function currentMode() {
    return document.querySelector('input[name="mode"]:checked').value;
}

function applyMode() {
    const mode = currentMode();
    const cfg = MODE_CONFIG[mode];

    lengthSlider.min = cfg.min;
    lengthSlider.max = cfg.max;
    lengthNumber.min = cfg.min;
    lengthNumber.max = cfg.max;
    lengthSlider.setAttribute("aria-label", cfg.rangeLabel);
    lengthNumber.setAttribute("aria-label", cfg.numberLabel);
    lengthIndex.textContent = cfg.index;

    switchesRandom.hidden = mode !== "random";
    switchesPhrase.hidden = mode !== "phrase";

    syncLength(cfg.default);
    generatePassword(false);
}

// --- Longitud: slider y campo numérico sincronizados ---
function syncLength(value) {
    const min = parseInt(lengthSlider.min, 10);
    const max = parseInt(lengthSlider.max, 10);
    let v = parseInt(value, 10);
    if (Number.isNaN(v)) v = parseInt(lengthSlider.value, 10) || min;
    v = Math.min(max, Math.max(min, v));
    lengthSlider.value = v;
    lengthNumber.value = v;
    return v;
}

// --- Generación de contraseñas ---
function getRandomInt(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

function filterAmbiguous(chars) {
    if (!switches.noAmbiguous.checked) return chars;
    return Array.from(chars).filter(c => !AMBIGUOUS.has(c)).join("");
}

// Una entrada por cada clase de carácter activada, ya filtrada de ambiguos.
function buildClassPools() {
    const classes = [];
    if (switches.numbers.checked) classes.push(filterAmbiguous(DIGITS));
    if (switches.uppercase.checked) classes.push(filterAmbiguous(UPPER));
    if (switches.lowercase.checked) classes.push(filterAmbiguous(LOWER));
    if (switches.symbols.checked) classes.push(filterAmbiguous(SYMBOLS));
    return classes;
}

function shuffle(chars) {
    for (let i = chars.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
}

// Reserva una posición por cada clase seleccionada (para garantizar que todas
// aparezcan) y rellena el resto por muestreo uniforme sobre el pool combinado.
function generateFromClasses(classes, length) {
    const pool = classes.join("");
    if (!pool || length < 1) return "";

    const chars = classes.slice(0, length).map(cls => cls[getRandomInt(cls.length)]);
    for (let i = chars.length; i < length; i++) {
        chars.push(pool[getRandomInt(pool.length)]);
    }
    shuffle(chars);
    return chars.join("");
}

// Entropía real de una contraseña muestreada uniformemente de un pool conocido:
// cada carácter aporta log2(tamaño del pool) bits.
function calculateEntropyBits(poolSize, length) {
    if (poolSize <= 0 || length <= 0) return 0;
    return length * Math.log2(poolSize);
}

function classifyEntropy(bits) {
    if (bits >= 80) return "strong";
    if (bits >= 60) return "medium";
    if (bits >= 40) return "fair";
    return "weak";
}

// Frase estilo diceware: N palabras al azar (con repetición posible) unidas por
// guiones. "Incluir un número" añade un dígito a una palabra al azar; la
// mayúscula inicial es solo formato y no aporta entropía.
function generatePhrase(wordCount) {
    const words = [];
    for (let i = 0; i < wordCount; i++) {
        words.push(WORDS[getRandomInt(WORDS.length)]);
    }
    if (phraseNumber.checked) {
        const i = getRandomInt(words.length);
        words[i] = words[i] + getRandomInt(10);
    }
    if (phraseCapitalize.checked) {
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
    }
    return words.join("-");
}

function calculatePhraseEntropyBits(wordCount, includeNumber) {
    let bits = wordCount * Math.log2(WORDS.length);
    if (includeNumber) bits += Math.log2(10);
    return bits;
}

function updateMeter(bits) {
    const level = classifyEntropy(bits);
    meter.dataset.level = level;
    meterLabel.textContent = bits > 0 ? `${LEVEL_LABEL[level]} · ${Math.round(bits)} bits` : "—";
    const ratio = Math.min(bits / 128, 1);
    const onCount = Math.round(ratio * ticks.length);
    ticks.forEach((tick, i) => tick.classList.toggle("is-on", i < onCount));
}

function generatePassword(animate) {
    let password, bits;

    if (currentMode() === "phrase") {
        hint.hidden = true;
        const wordCount = parseInt(lengthSlider.value, 10);
        password = generatePhrase(wordCount);
        bits = calculatePhraseEntropyBits(wordCount, phraseNumber.checked);
    } else {
        const classes = buildClassPools();
        const poolSize = classes.reduce((sum, cls) => sum + cls.length, 0);

        if (!poolSize) {
            hint.textContent = "Selecciona al menos un tipo de carácter.";
            hint.hidden = false;
            passwordField.value = "";
            updateMeter(0);
            return;
        }
        hint.hidden = true;

        const length = parseInt(lengthSlider.value, 10);
        password = generateFromClasses(classes, length);
        bits = calculateEntropyBits(poolSize, length);
    }

    passwordField.value = password;
    updateMeter(bits);

    if (animate) {
        passwordField.classList.remove("is-generating");
        requestAnimationFrame(() => passwordField.classList.add("is-generating"));
        srStatus.textContent = "Nueva contraseña generada.";
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

let clipboardClearTimer = null;

// Si el portapapeles todavía contiene la contraseña copiada, la sustituye por una
// cadena vacía. Si el navegador no concede permiso de lectura, no forzamos el
// borrado para no interrumpir con un aviso de permisos.
async function clearClipboardIfUnchanged(expected) {
    try {
        const current = await navigator.clipboard.readText();
        if (current === expected) await navigator.clipboard.writeText("");
    } catch (err) {
        // Sin permiso de lectura del portapapeles: se omite el borrado automático.
    }
}

async function copyPassword() {
    if (!passwordField.value) return;
    const value = passwordField.value;
    try {
        await navigator.clipboard.writeText(value);
    } catch (err) {
        passwordField.select();
    }
    showToast("Contraseña copiada · se borrará del portapapeles en 25 s");
    srStatus.textContent = "Contraseña copiada al portapapeles. Se borrará automáticamente en 25 segundos.";
    copyBtn.classList.add("is-copied");
    clearTimeout(copyBtn._timer);
    copyBtn._timer = setTimeout(() => copyBtn.classList.remove("is-copied"), 1300);

    clearTimeout(clipboardClearTimer);
    clipboardClearTimer = setTimeout(() => clearClipboardIfUnchanged(value), CLIPBOARD_CLEAR_MS);
}

lengthSlider.addEventListener("input", () => {
    syncLength(lengthSlider.value);
    generatePassword(false);
});
lengthNumber.addEventListener("input", () => {
    // Mientras se escribe no se recorta el valor visible (evitaría poder teclear "16"
    // tras el primer "1", que por sí solo es menor que el mínimo). El slider sí se
    // actualiza con el valor recortado para generar una vista previa en vivo.
    const v = parseInt(lengthNumber.value, 10);
    if (Number.isNaN(v)) return;
    const min = parseInt(lengthSlider.min, 10);
    const max = parseInt(lengthSlider.max, 10);
    lengthSlider.value = Math.min(max, Math.max(min, v));
    generatePassword(false);
});
lengthNumber.addEventListener("blur", () => syncLength(lengthNumber.value));
lengthNumber.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    syncLength(lengthNumber.value);
    lengthNumber.blur();
});
modeRadios.forEach(radio => radio.addEventListener("change", applyMode));
phraseCapitalize.addEventListener("change", () => generatePassword(false));
phraseNumber.addEventListener("change", () => generatePassword(false));
Object.values(switches).forEach(sw => sw.addEventListener("change", () => generatePassword(false)));
generateBtn.addEventListener("click", () => generatePassword(true));
copyBtn.addEventListener("click", copyPassword);

// Generar al cargar
applyMode();

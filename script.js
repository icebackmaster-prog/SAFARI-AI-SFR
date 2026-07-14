// ================================================================
// SAFARI AI – COMPLETE SCRIPT
// Image Studio + Code Studio + School Knowledge + Chat
// ================================================================

console.log('🦁 SAFARI AI: Script loading...');

(function() {
    'use strict';

    // ---- CONFIG ----
    const OWNER = {
        name: 'ICEBACK MASTER TECH',
        company: 'Safari Technology',
        channel: 'https://whatsapp.com/channel/0029VbC0Vi50wajpq5TlRi0B',
        email: 'safaritechcompany@gmail.com'
    };

    const CONFIG = {
        CHAT_API: 'https://api.hostify.co.zw/api/ai/chatespanyol',
        FALLBACK_API: 'https://api.hostify.co.zw/api/ai/gemini',
        IMAGE_API: 'https://image.pollinations.ai/prompt',
        WIKI_API: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
        WEATHER_API: 'https://wttr.in',
        TIMEOUT: 8000,
        STORAGE_KEY: 'safari_folders',
        USER_KEY: 'safari_user'
    };

    // ---- SCHOOL KNOWLEDGE BASE ----
    const SCHOOL_KNOWLEDGE = {
        'math': {
            'algebra': 'Algebra is the branch of mathematics dealing with symbols and the rules for manipulating them. Key concepts: variables, equations, polynomials, factoring, quadratic equations, and functions.',
            'geometry': 'Geometry is the branch of mathematics concerned with shapes, sizes, positions, angles, and dimensions. Key concepts: points, lines, angles, triangles, circles, area, volume, and the Pythagorean theorem.',
            'calculus': 'Calculus is the mathematical study of continuous change. It has two main branches: differential calculus (rates of change and slopes) and integral calculus (accumulation of quantities).',
            'statistics': 'Statistics is the study of collecting, analyzing, interpreting, presenting, and organizing data. Key concepts: mean, median, mode, standard deviation, probability, and hypothesis testing.',
            'trigonometry': 'Trigonometry is the branch of mathematics dealing with relationships between angles and sides of triangles. Key concepts: sine, cosine, tangent, and trigonometric functions.',
            'pythagorean': 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c².',
            'quadratic': 'A quadratic equation is of the form ax² + bx + c = 0. The solution is given by the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.',
            'pi': 'Pi (π) is a mathematical constant approximately equal to 3.14159. It represents the ratio of a circle\'s circumference to its diameter.',
            'fraction': 'A fraction represents a part of a whole. It consists of a numerator (top) and denominator (bottom).',
            'decimal': 'A decimal is a number with a decimal point that represents a fraction with a power of 10 as the denominator.',
            'percentage': 'A percentage is a number or ratio expressed as a fraction of 100. It is often denoted using the percent sign "%".',
            '2+2': '2 + 2 = 4. This is a basic arithmetic fact.',
            'square root': 'The square root of a number is a value that, when multiplied by itself, gives the original number. For example, √16 = 4 because 4 × 4 = 16.',
            'solve': 'To solve an equation means to find the value(s) of the variable(s) that make the equation true.',
            'linear equation': 'A linear equation is an equation that makes a straight line when graphed. It has the form y = mx + b, where m is the slope and b is the y-intercept.'
        },
        'science': {
            'biology': 'Biology is the scientific study of life and living organisms. Key areas: cell biology, genetics, evolution, ecology, and human anatomy.',
            'physics': 'Physics is the natural science that studies matter, energy, and their interactions. Key areas: mechanics, thermodynamics, electromagnetism, optics, and quantum mechanics.',
            'chemistry': 'Chemistry is the scientific study of matter, its properties, composition, and reactions. Key areas: organic chemistry, inorganic chemistry, physical chemistry, and biochemistry.',
            'cell': 'The cell is the basic structural and functional unit of all living organisms. Types include prokaryotic (bacteria) and eukaryotic (plant and animal cells).',
            'dna': 'DNA (deoxyribonucleic acid) is the molecule that carries genetic instructions for life. It has a double helix structure discovered by Watson and Crick.',
            'photosynthesis': 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. Formula: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.',
            'gravity': 'Gravity is a natural phenomenon by which all things with mass are attracted to each other. Newton\'s law of universal gravitation: F = G(m₁m₂)/r².',
            'energy': 'Energy is the capacity to do work. Forms include kinetic, potential, thermal, chemical, electrical, nuclear, and radiant energy. The law of conservation of energy states that energy cannot be created or destroyed.',
            'atom': 'An atom is the smallest unit of an element that retains its chemical properties. It consists of protons, neutrons, and electrons.',
            'molecule': 'A molecule is a group of atoms bonded together, representing the smallest fundamental unit of a chemical compound.',
            'evolution': 'Evolution is the process by which species change over time through genetic variation and natural selection. Charles Darwin is credited with the theory of evolution.',
            'ecosystem': 'An ecosystem is a community of living organisms interacting with their physical environment. It includes producers, consumers, and decomposers.',
            'climate change': 'Climate change refers to long-term changes in temperature and weather patterns, primarily caused by human activities like burning fossil fuels.',
            'periodic table': 'The periodic table organizes chemical elements by increasing atomic number. Elements are arranged in periods (rows) and groups (columns).',
            'water cycle': 'The water cycle is the continuous movement of water on Earth through evaporation, condensation, precipitation, and collection.',
            'solar system': 'The solar system consists of the Sun and 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.',
            'black hole': 'A black hole is a region of spacetime with intense gravitational pull where nothing, not even light, can escape.'
        },
        'history': {
            'world war 2': 'World War II (1939–1945) was a global war involving the Allies (US, UK, Soviet Union, China) against the Axis powers (Germany, Italy, Japan). It resulted in millions of deaths and the creation of the United Nations.',
            'world war 1': 'World War I (1914–1918) was a global war centered in Europe, involving the Allies (UK, France, Russia) against the Central Powers (Germany, Austria-Hungary, Ottoman Empire). It introduced new technologies like tanks and airplanes.',
            'ancient egypt': 'Ancient Egypt was a civilization along the Nile River, known for pyramids, pharaohs, hieroglyphics, and mummification. It flourished for over 3,000 years.',
            'roman empire': 'The Roman Empire was a vast empire centered in Rome, Italy. It lasted from 27 BC to 476 AD and contributed law, language, engineering, and Christianity to the world.',
            'greek civilization': 'Ancient Greece was a civilization that gave birth to democracy, philosophy (Socrates, Plato, Aristotle), theater, and the Olympic Games.',
            'renaissance': 'The Renaissance was a period of cultural, artistic, political, and economic rebirth in Europe from the 14th to the 17th century. It featured artists like Leonardo da Vinci and Michelangelo.',
            'industrial revolution': 'The Industrial Revolution (1760–1840) was a period of rapid industrialization, mechanization, and urbanization. It began in Britain and spread worldwide.',
            'cold war': 'The Cold War (1947–1991) was a period of geopolitical tension between the United States and the Soviet Union, marked by the arms race, space race, and proxy wars.',
            'civil rights': 'The Civil Rights Movement (1950s–1960s) was a struggle for social justice and equal rights for African Americans, led by figures like Martin Luther King Jr. and Rosa Parks.',
            'french revolution': 'The French Revolution (1789–1799) was a period of radical political and social change in France that overthrew the monarchy and established a republic.',
            'american revolution': 'The American Revolution (1775–1783) was a colonial revolt against British rule, leading to the creation of the United States.',
            'colonialism': 'Colonialism was the practice of acquiring control over other territories, often by European powers, for economic and strategic benefit.',
            'apartheid': 'Apartheid was a system of racial segregation and discrimination in South Africa from 1948 to 1994.',
            'holocaust': 'The Holocaust was the genocide of six million Jews by Nazi Germany during World War II.',
            'cold war space race': 'The Space Race was a competition between the US and Soviet Union for space exploration dominance, culminating in the Moon landing in 1969.'
        },
        'english': {
            'grammar': 'Grammar is the set of rules that govern the structure of sentences in a language. Key components: nouns, verbs, adjectives, adverbs, pronouns, prepositions, conjunctions, and interjections.',
            'noun': 'A noun is a word that names a person, place, thing, or idea. Examples: John, London, book, happiness.',
            'verb': 'A verb is a word that describes an action, occurrence, or state of being. Examples: run, eat, is, become.',
            'adjective': 'An adjective is a word that modifies or describes a noun. Examples: big, blue, happy, amazing.',
            'adverb': 'An adverb is a word that modifies a verb, adjective, or other adverb. Examples: quickly, very, well, soon.',
            'pronoun': 'A pronoun is a word used in place of a noun. Examples: I, you, he, she, it, we, they.',
            'preposition': 'A preposition is a word that shows the relationship between a noun/pronoun and other words. Examples: in, on, at, under, between.',
            'conjunction': 'A conjunction is a word that connects words, phrases, or clauses. Examples: and, but, or, because, although.',
            'interjection': 'An interjection is a word that expresses emotion. Examples: oh, wow, ouch, hey.',
            'tense': 'Tense shows the time of an action. The main tenses are present, past, and future.',
            'sentence': 'A sentence is a group of words that expresses a complete thought. It has a subject and a predicate.',
            'paragraph': 'A paragraph is a group of sentences that develop a single idea or topic.',
            'essay': 'An essay is a piece of writing that presents an argument or analysis on a specific topic.',
            'poetry': 'Poetry is a form of literary expression that uses rhythm, imagery, and figurative language.',
            'drama': 'Drama is a form of literature intended for performance, such as plays.',
            'shakespeare': 'William Shakespeare was an English playwright and poet, widely considered the greatest writer in the English language. He wrote plays like "Hamlet," "Romeo and Juliet," and "Macbeth."'
        },
        'geography': {
            'continents': 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.',
            'oceans': 'There are 5 oceans: Pacific, Atlantic, Indian, Southern, and Arctic.',
            'countries': 'There are 195 countries in the world (193 UN members + 2 observer states).',
            'capital cities': 'Capital cities are the seat of government for each country. Examples: London (UK), Paris (France), Tokyo (Japan), Washington D.C. (USA).',
            'population': 'The world population is approximately 8 billion people. Asia is the most populous continent.',
            'climate': 'Climate refers to long-term weather patterns. Major climate types: tropical, dry, temperate, cold, and polar.',
            'mountains': 'The highest mountain is Mount Everest (8,848 m) in the Himalayas. Other major mountain ranges: Andes, Rockies, Alps.',
            'rivers': 'Major rivers: Amazon, Nile, Mississippi, Yangtze, Ganges. The Nile is the longest river.',
            'deserts': 'Major deserts: Sahara (largest hot desert), Arabian, Gobi, Kalahari, and Atacama.',
            'rainforests': 'Rainforests are dense forests with high rainfall. The Amazon is the largest rainforest.',
            'volcanoes': 'Volcanoes are mountains that erupt with molten rock, ash, and gases. Examples: Mount Vesuvius, Mount Fuji, Krakatoa.',
            'earthquakes': 'Earthquakes are caused by the movement of tectonic plates. The Richter scale measures earthquake magnitude.'
        }
    };

    // ---- DOM REFS ----
    const $ = id => document.getElementById(id);
    const loginOverlay = $('loginOverlay');
    const app = $('app');
    const loginBtn = $('loginBtn');
    const loginEmail = $('loginEmail');
    const loginPassword = $('loginPassword');
    const userBadge = $('userBadge');
    const themeToggle = $('themeToggle');
    const premiumBtn = $('premiumBtn');
    const premiumModal = $('premiumModal');
    const premiumCode = $('premiumCode');
    const premiumUnlockBtn = $('premiumUnlockBtn');
    const premiumError = $('premiumError');
    const closePremium = $('closePremium');
    const statusModal = $('statusModal');
    const closeStatusModal = $('closeStatusModal');
    const statusFileInput = $('statusFileInput');
    const statusPreview = $('statusPreview');
    const submitStatusBtn = $('submitStatusBtn');
    const statusGrid = $('statusGrid');
    const chatMessages = $('chatMessages');
    const chatInput = $('chatInput');
    const sendBtn = $('sendBtn');
    const searchInput = $('searchInput');
    const searchBtn = $('searchBtn');
    const searchResult = $('searchResult');
    const researchResult = $('researchResult');
    const tabs = document.querySelectorAll('.tab-btn');
    const toolsMenu = $('toolsMenu');
    const toolImage = $('toolImage');
    const toolCode = $('toolCode');
    const imagePrompt = $('imagePrompt');
    const imageStyle = $('imageStyle');
    const generateImageBtn = $('generateImageBtn');
    const imageResult = $('imageResult');
    const imageActions = $('imageActions');
    const downloadImageBtn = $('downloadImageBtn');
    const codeLanguage = $('codeLanguage');
    const codeAction = $('codeAction');
    const codeGenerateBtn = $('codeGenerateBtn');
    const codeInput = $('codeInput');
    const codeOutput = $('codeOutput');
    const copyCodeBtn = $('copyCodeBtn');

    // ---- STATE ----
    let currentUser = null;
    let isProcessing = false;
    let statuses = JSON.parse(localStorage.getItem('safari_statuses') || '[]');
    let isPremiumUnlocked = false;

    // ---- PARTICLES ----
    function initParticles() {
        const canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];
        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();
        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(79, 70, 229, ${this.opacity})`;
                ctx.fill();
            }
        }
        for (let i = 0; i < 80; i++) particles.push(new Particle());
        function animate() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update();
                p.draw(); });
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.strokeStyle = `rgba(79, 70, 229, ${0.08 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ---- THEME ----
    function toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
        localStorage.setItem('safari_theme', next);
    }
    function loadTheme() {
        const saved = localStorage.getItem('safari_theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        themeToggle.textContent = saved === 'light' ? '🌙' : '☀️';
    }

    // ---- TOAST ----
    function showToast(msg) {
        const container = document.getElementById('toastContainer') || (function() {
            const div = document.createElement('div');
            div.id = 'toastContainer';
            document.body.appendChild(div);
            return div;
        })();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
        }, 2500);
        setTimeout(() => toast.remove(), 3000);
    }

    // ---- STATUS FEED ----
    function renderStatuses() {
        if (!statusGrid) return;
        if (statuses.length === 0) {
            statusGrid.innerHTML = `
                <div class="status-empty">
                    <i class="fas fa-camera"></i>
                    <p>No statuses yet. Be the first to share!</p>
                    <button class="btn-primary add-status-btn">+ Add Status</button>
                </div>
            `;
            const btn = statusGrid.querySelector('.add-status-btn');
            if (btn) btn.addEventListener('click', openStatusModal);
            return;
        }
        let html = '';
        for (let i = statuses.length - 1; i >= 0; i--) {
            const status = statuses[i];
            const media = status.type === 'video' ?
                `<video src="${status.data}" class="status-media" controls></video>` :
                `<img src="${status.data}" class="status-media" alt="Status" />`;
            html += `
                <div class="status-item">
                    ${media}
                    <div class="status-info">
                        <div class="status-author">${escapeHtml(status.author || 'Safari AI')}</div>
                        <div class="status-time">${new Date(status.timestamp).toLocaleString()}</div>
                    </div>
                </div>
            `;
        }
        statusGrid.innerHTML = html;
    }

    function addStatus(dataUrl, type) {
        const status = {
            id: Date.now(),
            author: currentUser?.displayName || 'Safari AI',
            data: dataUrl,
            type: type,
            timestamp: Date.now()
        };
        statuses.push(status);
        localStorage.setItem('safari_statuses', JSON.stringify(statuses));
        renderStatuses();
        showToast('✅ Status added!');
    }

    function openStatusModal() {
        if (!isPremiumUnlocked) {
            showToast('🔒 Premium required. Tap Premium and enter code 0000.');
            return;
        }
        if (statusModal) statusModal.classList.add('open');
        if (statusFileInput) statusFileInput.value = '';
        if (statusPreview) statusPreview.innerHTML = '';
        if (statusPreview) {
            statusPreview.dataset.dataUrl = '';
            statusPreview.dataset.type = '';
        }
    }

    function closeStatusModalFn() {
        if (statusModal) statusModal.classList.remove('open');
    }

    // ---- PREMIUM ----
    function openPremiumModal() {
        if (premiumModal) premiumModal.classList.add('open');
        if (premiumCode) premiumCode.value = '';
        if (premiumError) premiumError.textContent = '';
    }
    function closePremiumModal() {
        if (premiumModal) premiumModal.classList.remove('open');
    }
    function unlockPremium() {
        const code = premiumCode ? premiumCode.value.trim() : '';
        if (code === '0000') {
            isPremiumUnlocked = true;
            closePremiumModal();
            showToast('✨ Premium unlocked! You can now add statuses.');
        } else {
            if (premiumError) premiumError.textContent = '❌ Incorrect code. Try again.';
        }
    }

    // ---- ESCAPE & MARKDOWN ----
    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }
    function parseMarkdown(text) {
        let html = text;
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.05);padding:2px 6px;border-radius:4px;">$1</code>');
        html = html.replace(/\n/g, '<br />');
        html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:var(--accent);">$1</a>');
        return html;
    }

    // ---- FETCH WITH TIMEOUT ----
    function fetchWithTimeout(url, options, timeout) {
        timeout = timeout || CONFIG.TIMEOUT;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(url, { ...options, signal: controller.signal })
            .then(res => { clearTimeout(id); return res; })
            .catch(err => { clearTimeout(id); throw err; });
    }

    // ---- IMAGE GENERATION (UNLIMITED) ----
    async function generateImage(prompt, style) {
        if (!prompt || prompt.trim().length === 0) {
            return { error: 'Please describe what you want to generate.' };
        }
        const fullPrompt = `${prompt}, ${style} style, high quality, detailed`;
        const imageUrl = `${CONFIG.IMAGE_API}/${encodeURIComponent(fullPrompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
        return { imageUrl };
    }

    // ---- CODE GENERATION (PRO) ----
    async function generateCode(language, action, description) {
        if (!description || description.trim().length === 0) {
            return { error: 'Please describe what code you need.' };
        }
        const prompts = {
            generate: `Generate ${language} code for: ${description}. Provide clean, well-commented code.`,
            debug: `Debug this ${language} code: ${description}. Point out errors and suggest fixes.`,
            explain: `Explain this ${language} code: ${description}. Describe what it does step by step.`,
            convert: `Convert this code to ${language}: ${description}.`
        };
        const context = `You are an expert ${language} developer. Provide accurate and helpful code.`;
        try {
            const response = await fetchWithTimeout(CONFIG.FALLBACK_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompts[action], context: context })
            }, CONFIG.TIMEOUT);
            if (response.ok) {
                const data = await response.json();
                return data.response || data.message || data.reply || '';
            }
        } catch (e) { console.warn('Code API failed:', e); }
        // Fallback
        return `// ${language} code (${action}):\n// ${description}\n\n// Your generated code will appear here.\n// Please try again.`;
    }

    // ---- SCHOOL KNOWLEDGE ----
    function findSchoolAnswer(query) {
        const lower = query.toLowerCase();
        for (const category in SCHOOL_KNOWLEDGE) {
            const topics = SCHOOL_KNOWLEDGE[category];
            for (const topic in topics) {
                if (lower.includes(topic)) {
                    return topics[topic];
                }
            }
        }
        for (const category in SCHOOL_KNOWLEDGE) {
            if (lower.includes(category)) {
                const general = {
                    'math': 'Mathematics is the study of numbers, quantities, shapes, and patterns. Key topics: algebra, geometry, calculus, statistics, and trigonometry.',
                    'science': 'Science is the study of the natural world through observation and experimentation. Key fields: biology, chemistry, physics, and earth science.',
                    'history': 'History is the study of past events, societies, and civilizations. Key topics: ancient civilizations, world wars, revolutions, and cultural movements.',
                    'english': 'English is a language and literature subject. Key areas: grammar, writing, reading comprehension, and literary analysis.',
                    'geography': 'Geography is the study of Earth\'s landscapes, environments, and human societies. Key topics: continents, oceans, climate, and population.'
                };
                if (general[category]) return general[category];
            }
        }
        const calcMatch = lower.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
        if (calcMatch) {
            const a = parseFloat(calcMatch[1]), op = calcMatch[2], b = parseFloat(calcMatch[3]);
            let result;
            switch (op) {
                case '+':
                    result = a + b;
                    break;
                case '-':
                    result = a - b;
                    break;
                case '*':
                    result = a * b;
                    break;
                case '/':
                    result = b !== 0 ? a / b : 'undefined (division by zero)';
                    break;
                default:
                    result = 'unknown operation';
            }
            if (typeof result === 'number') return `${a} ${op} ${b} = ${result}`;
            return result;
        }
        return null;
    }

    // ---- RESEARCH TOPIC ----
    function researchTopic(topic) {
        if (!researchResult) return;
        const displayNames = {
            'math': 'Mathematics',
            'science': 'Science',
            'history': 'History',
            'english': 'English',
            'geography': 'Geography'
        };
        const displayName = displayNames[topic] || topic;
        researchResult.innerHTML = `<div style="padding:12px;text-align:center;">📚 Loading <strong>${displayName}</strong> knowledge...</div>`;
        setTimeout(() => {
            let knowledge = findSchoolAnswer(topic);
            if (!knowledge) {
                const general = {
                    'math': 'Mathematics is the study of numbers, quantities, shapes, and patterns. Key topics: algebra, geometry, calculus, statistics, and trigonometry.',
                    'science': 'Science is the study of the natural world through observation and experimentation. Key fields: biology, chemistry, physics, and earth science.',
                    'history': 'History is the study of past events, societies, and civilizations. Key topics: ancient civilizations, world wars, revolutions, and cultural movements.',
                    'english': 'English is a language and literature subject. Key areas: grammar, writing, reading comprehension, and literary analysis.',
                    'geography': 'Geography is the study of Earth\'s landscapes, environments, and human societies. Key topics: continents, oceans, climate, and population.'
                };
                knowledge = general[topic] || 'No detailed information available. Try asking in the chat!';
            }
            researchResult.innerHTML = `
                <strong>📖 ${displayName}</strong>
                <div style="margin-top:8px;line-height:1.6;">${knowledge}</div>
                <div style="margin-top:12px;font-size:12px;color:var(--text-muted);">⚡ POWERED BY ICEBACK MASTER TECH</div>
            `;
        }, 500);
    }

    // ---- AI CHAT ----
    async function getAIResponse(text) {
        const context =
            `You are Safari AI, a helpful assistant created by ICEBACK MASTER TECH. You are an expert in school subjects: Math, Science, History, English, Geography, and more. Answer clearly and helpfully. If asked to generate an image, suggest using "generate [description]". End with "POWERED BY ICEBACK MASTER TECH".`;
        try {
            const response = await fetchWithTimeout(CONFIG.FALLBACK_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: context })
            }, CONFIG.TIMEOUT);
            if (response.ok) {
                const data = await response.json();
                const reply = data.response || data.message || data.reply || data.text || '';
                if (reply) return reply;
            }
        } catch (e) { console.warn('Gemini API failed:', e); }
        try {
            const response = await fetchWithTimeout(CONFIG.CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: context })
            }, CONFIG.TIMEOUT);
            if (response.ok) {
                const data = await response.json();
                const reply = data.response || data.message || data.reply || data.text || '';
                if (reply) return reply;
            }
        } catch (e) { console.warn('Chat API failed:', e); }
        const schoolAnswer = findSchoolAnswer(text);
        if (schoolAnswer) {
            return schoolAnswer + '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        }
        const lower = text.toLowerCase();
        if (lower.includes('joke')) {
            const jokes = [
                'Why do programmers prefer dark mode? Light attracts bugs! 🐛',
                'What do you call a fake noodle? An impasta! 🍝',
                'Why did the AI break up with the human? Too many bugs in the relationship! 🤖'
            ];
            return jokes[Math.floor(Math.random() * jokes.length)] +
                '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        } else if (lower.includes('football') || lower.includes('match')) {
            return '⚽ <strong>Today\'s Top Matches:</strong><br />• Liverpool 3 - 1 Arsenal<br />• Man City 2 - 2 Chelsea<br />• Barcelona 4 - 0 Real Madrid<br />🔮 Prediction: Liverpool to win the league!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return '👋 Hello there! I\'m Safari AI, your all-in-one assistant. How can I help with your school work today? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        } else if (lower.includes('who is your owner') || lower.includes('who created you')) {
            return `🦁 I was created by <strong>${OWNER.name}</strong> from Safari Technology. Join our channel: <a href="${OWNER.channel}" target="_blank">${OWNER.channel}</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        } else if (lower.includes('channel')) {
            return `📢 Join our WhatsApp channel: <a href="${OWNER.channel}" target="_blank">${OWNER.channel}</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        } else {
            return `🤔 I'm Safari AI. I can help with school subjects like Math, Science, History, English, and Geography. Try asking me a specific question, or try "generate a cat" for AI art!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        }
    }

    // ---- PROCESS COMMAND ----
    async function processCommand(input) {
        if (isProcessing) return;
        const trimmed = input.trim();
        if (!trimmed) return;

        // Image generation
        const genMatch = trimmed.match(/^(safari\s+)?generate\s+(.+)/i);
        if (genMatch) {
            const desc = genMatch[2].trim();
            if (desc.length > 0) {
                showTyping();
                const result = await generateImage(desc, 'realistic');
                removeTyping();
                if (result.error) {
                    addMessage('assistant', result.error);
                } else {
                    addMessage('assistant', `🖼️ Generated: <strong>${escapeHtml(desc)}</strong>`, { image: result.imageUrl });
                }
                return;
            }
        }

        // Search
        const searchMatch = trimmed.match(/^(safari\s+)?search\s+(.+)/i);
        if (searchMatch) {
            const query = searchMatch[2].trim();
            showTyping();
            try {
                const resp = await fetchWithTimeout(`${CONFIG.WIKI_API}${encodeURIComponent(query)}`);
                if (resp.ok) {
                    const data = await resp.json();
                    if (data.extract) {
                        const reply =
                            `🔍 <strong>${data.title}</strong><br />${data.extract}<br /><br />📖 <a href="${data.content_urls?.desktop?.page}" target="_blank" style="color:var(--accent);">Read more on Wikipedia</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
                        removeTyping();
                        addMessage('assistant', reply);
                        return;
                    }
                }
            } catch (e) { /* ignore */ }
            removeTyping();
            addMessage('assistant',
                `⚠️ Could not find "${query}" on Wikipedia.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`);
            return;
        }

        // Weather
        const weatherMatch = trimmed.match(/^(weather|temperature|temp)\s+(.+)/i);
        if (weatherMatch) {
            const city = weatherMatch[2].trim();
            showTyping();
            try {
                const resp = await fetchWithTimeout(`${CONFIG.WEATHER_API}/${encodeURIComponent(city)}?format=j1`);
                if (resp.ok) {
                    const data = await resp.json();
                    const current = data.current_condition[0];
                    const reply =
                        `🌤️ <strong>Weather in ${city}</strong><br />🌡️ Temp: <strong>${current.temp_C}°C</strong> (feels like ${current.FeelsLikeC}°C)<br />☁️ ${current.weatherDesc[0].value}<br />💨 Wind: ${current.windSpeedKmph} km/h | 💧 Humidity: ${current.humidity}%<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
                    removeTyping();
                    addMessage('assistant', reply);
                    return;
                }
            } catch (e) { /* ignore */ }
            removeTyping();
            addMessage('assistant',
                `⚠️ Could not find weather for "${city}". Try a major city.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`);
            return;
        }

        // Owner / Channel
        const lower = trimmed.toLowerCase();
        if (lower.includes('who is your owner') || lower.includes('who created you')) {
            addMessage('assistant',
                `🦁 I was created by <strong>${OWNER.name}</strong> from Safari Technology. 📢 Join our channel: <a href="${OWNER.channel}" target="_blank">${OWNER.channel}</a> 📧 ${OWNER.email}<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
                );
            return;
        }
        if (lower.includes('channel link') || lower.includes('whatsapp channel') || lower.includes('join channel')) {
            addMessage('assistant',
                `📢 Join our official WhatsApp Channel!<br /><br />🔗 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">${OWNER.channel}</a><br /><br />📧 ${OWNER.email}<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
                );
            return;
        }

        // Jokes
        if (lower.includes('joke') || lower.includes('tell me a joke')) {
            const jokes = [
                'Why do programmers prefer dark mode? Light attracts bugs! 🐛',
                'What do you call a fake noodle? An impasta! 🍝',
                'Why did the AI break up with the human? Too many bugs in the relationship! 🤖',
                'What do you call a fish with no eyes? A fsh! 🐟',
                'Why did the scarecrow win an award? Because he was outstanding in his field! 🌾'
            ];
            addMessage('assistant',
                jokes[Math.floor(Math.random() * jokes.length)] +
                '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>');
            return;
        }

        // Football
        if (lower.includes('football') || lower.includes('match') || lower.includes('soccer')) {
            addMessage('assistant',
                '⚽ <strong>Today\'s Top Matches:</strong><br />• Liverpool 3 - 1 Arsenal<br />• Man City 2 - 2 Chelsea<br />• Barcelona 4 - 0 Real Madrid<br />🔮 Prediction: Liverpool to win the league!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
            return;
        }

        // Greetings
        if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup)$/)) {
            addMessage('assistant',
                '👋 Hello there! I\'m Safari AI, your all-in-one assistant. How can I help with your school work today? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
            return;
        }

        // Normal chat
        showTyping();
        try {
            const reply = await getAIResponse(trimmed);
            removeTyping();
            addMessage('assistant', reply);
        } catch (e) {
            removeTyping();
            addMessage('assistant',
                '⚠️ Sorry, I encountered an error. Please try again.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
            console.error('Chat error:', e);
        }
    }

    // ---- TYPING INDICATOR ----
    function showTyping() {
        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.id = 'typingIndicator';
        el.innerHTML = '<span>•</span><span>•</span><span>•</span>';
        if (chatMessages) {
            chatMessages.appendChild(el);
            scrollChat();
        }
    }
    function removeTyping() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }
    function scrollChat() {
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ---- ADD MESSAGE ----
    function addMessage(role, content, extra = null) {
        if (!chatMessages) return;
        const div = document.createElement('div');
        div.className = `message ${role}`;

        const label = document.createElement('div');
        label.className = 'msg-label';
        label.textContent = role === 'assistant' ? '🤖 Safari AI' : 'You';
        div.appendChild(label);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'msg-content';
        contentDiv.innerHTML = parseMarkdown(content);
        div.appendChild(contentDiv);

        const time = document.createElement('div');
        time.className = 'msg-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.appendChild(time);

        if (role === 'assistant') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'msg-actions';

            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋 Copy';
            copyBtn.onclick = function() {
                const text = contentDiv.textContent;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => {
                        copyBtn.textContent = '✅ Copied!';
                        setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
                    }).catch(() => fallbackCopy(text, copyBtn));
                } else {
                    fallbackCopy(text, copyBtn);
                }
            };
            actionsDiv.appendChild(copyBtn);

            const speakBtn = document.createElement('button');
            speakBtn.textContent = '🔊 Speak';
            speakBtn.onclick = function() {
                const text = contentDiv.textContent;
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 1.0;
                    window.speechSynthesis.speak(utterance);
                    showToast('🔊 Speaking...');
                } else {
                    showToast('⚠️ Speech not supported.');
                }
            };
            actionsDiv.appendChild(speakBtn);

            div.appendChild(actionsDiv);
        }

        if (extra) {
            if (extra.image) {
                const img = document.createElement('img');
                img.src = extra.image;
                img.alt = 'Generated image';
                img.loading = 'lazy';
                div.appendChild(img);
            }
        }

        chatMessages.appendChild(div);
        scrollChat();
    }

    function fallbackCopy(text, btn) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            if (btn) {
                btn.textContent = '✅ Copied!';
                setTimeout(() => btn.textContent = '📋 Copy', 2000);
            }
            showToast('📋 Copied!');
        } catch (e) {
            showToast('⚠️ Could not copy. Please copy manually.');
        }
        document.body.removeChild(textarea);
    }

    // ---- SEARCH ----
    async function performSearch() {
        if (!searchInput || !searchResult) return;
        const query = searchInput.value.trim();
        if (!query) return;
        searchResult.innerHTML = '<div style="padding:12px;text-align:center;">🔍 Searching...</div>';
        try {
            const resp = await fetchWithTimeout(`${CONFIG.WIKI_API}${encodeURIComponent(query)}`);
            if (resp.ok) {
                const data = await resp.json();
                if (data.extract) {
                    searchResult.innerHTML =
                        `<strong>${data.title}</strong><br>${data.extract}<br><br><a href="${data.content_urls?.desktop?.page}" target="_blank" style="color:var(--accent);">Read more</a>`;
                } else {
                    searchResult.innerHTML = 'No results found. Try a different query.';
                }
            } else {
                searchResult.innerHTML = 'Search failed. Please try again.';
            }
        } catch (e) {
            searchResult.innerHTML = 'Error searching. Please try again.';
        }
    }

    // ---- TOOL PANEL NAVIGATION ----
    function showTool(tool) {
        if (tool === 'menu') {
            toolsMenu.classList.remove('hidden');
            toolImage.classList.add('hidden');
            toolCode.classList.add('hidden');
        } else if (tool === 'image') {
            toolsMenu.classList.add('hidden');
            toolImage.classList.remove('hidden');
            toolCode.classList.add('hidden');
        } else if (tool === 'code') {
            toolsMenu.classList.add('hidden');
            toolImage.classList.add('hidden');
            toolCode.classList.remove('hidden');
        }
    }

    // ---- TAB SWITCHING ----
    function switchTab(tabId) {
        tabs.forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const targetPane = document.getElementById(`tab-${tabId}`);
        if (targetPane) targetPane.classList.add('active');
        // If switching to "More", show the menu by default
        if (tabId === 'more') {
            showTool('menu');
        }
    }

    // ---- IMAGE STUDIO EVENTS ----
    async function generateImageStudio() {
        const prompt = imagePrompt ? imagePrompt.value.trim() : '';
        const style = imageStyle ? imageStyle.value : 'realistic';
        if (!prompt) { showToast('Please describe the image.'); return; }
        if (imageResult) {
            imageResult.innerHTML = '<div style="padding:20px;text-align:center;"><span class="spinner"></span> Generating...</div>';
        }
        const result = await generateImage(prompt, style);
        if (result.error) {
            if (imageResult) imageResult.innerHTML = `<p style="color:#ef4444;">${result.error}</p>`;
        } else {
            if (imageResult) {
                imageResult.innerHTML = `<img src="${result.imageUrl}" alt="Generated image" style="max-width:100%;max-height:400px;border-radius:12px;" />`;
                // Store for download
                imageResult.dataset.imageUrl = result.imageUrl;
            }
            if (imageActions) imageActions.classList.remove('hidden');
        }
    }

    function downloadImage() {
        const url = imageResult ? imageResult.dataset.imageUrl : '';
        if (url) {
            window.open(url, '_blank');
        } else {
            showToast('⚠️ No image to download.');
        }
    }

    // ---- CODE STUDIO EVENTS ----
    async function generateCodeStudio() {
        const language = codeLanguage ? codeLanguage.value : 'javascript';
        const action = codeAction ? codeAction.value : 'generate';
        const input = codeInput ? codeInput.value.trim() : '';
        if (!input) { showToast('Please describe what code you need.'); return; }
        if (codeOutput) {
            codeOutput.textContent = '⏳ Generating...';
            codeOutput.style.color = 'var(--text-secondary)';
        }
        const result = await generateCode(language, action, input);
        if (codeOutput) {
            codeOutput.textContent = result;
            codeOutput.style.color = 'var(--text-primary)';
        }
        showToast('✅ Code generated!');
    }

    function copyCode() {
        const output = codeOutput;
        if (!output) return;
        const text = output.textContent;
        if (!text || text === '// Your code will appear here' || text.includes('Generating...')) {
            showToast('⚠️ No code to copy.');
            return;
        }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => showToast('✅ Code copied!'))
                .catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    }

    // ---- LOGIN ----
    function login() {
        const email = loginEmail ? loginEmail.value.trim() : 'demo@safari.ai';
        const pass = loginPassword ? loginPassword.value.trim() : 'password123';
        if (!email) { showToast('Please enter email.'); return; }
        currentUser = { displayName: email.split('@')[0], email: email };
        localStorage.setItem('safari_user', JSON.stringify(currentUser));
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (app) app.classList.remove('hidden');
        if (userBadge) userBadge.textContent = currentUser.displayName;
        renderStatuses();
        showToast(`👋 Welcome, ${currentUser.displayName}!`);
    }

    function checkSession() {
        const saved = localStorage.getItem('safari_user');
        if (saved) {
            try {
                currentUser = JSON.parse(saved);
                if (loginOverlay) loginOverlay.classList.add('hidden');
                if (app) app.classList.remove('hidden');
                if (userBadge) userBadge.textContent = currentUser.displayName;
                renderStatuses();
                return true;
            } catch (e) { localStorage.removeItem('safari_user'); }
        }
        return false;
    }

    // ---- INIT ----
    function init() {
        console.log('🦁 Safari AI: Initializing...');
        initParticles();
        loadTheme();

        // Login
        if (loginBtn) loginBtn.addEventListener('click', login);
        if (loginPassword) loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
        if (loginEmail) loginEmail.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

        // Theme
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

        // Premium
        if (premiumBtn) premiumBtn.addEventListener('click', openPremiumModal);
        if (closePremium) closePremium.addEventListener('click', closePremiumModal);
        if (premiumUnlockBtn) premiumUnlockBtn.addEventListener('click', unlockPremium);
        if (premiumCode) premiumCode.addEventListener('keydown', e => { if (e.key === 'Enter') unlockPremium(); });

        // Status Modal
        if (closeStatusModal) closeStatusModal.addEventListener('click', closeStatusModalFn);
        if (statusFileInput) {
            statusFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const dataUrl = ev.target.result;
                    const type = file.type.startsWith('video') ? 'video' : 'image';
                    if (statusPreview) {
                        statusPreview.innerHTML = type === 'video' ?
                            `<video src="${dataUrl}" controls style="max-width:100%;max-height:200px;"></video>` :
                            `<img src="${dataUrl}" style="max-width:100%;max-height:200px;" />`;
                        statusPreview.dataset.dataUrl = dataUrl;
                        statusPreview.dataset.type = type;
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        if (submitStatusBtn) {
            submitStatusBtn.addEventListener('click', function() {
                const dataUrl = statusPreview ? statusPreview.dataset.dataUrl : '';
                const type = statusPreview ? statusPreview.dataset.type : '';
                if (!dataUrl) { showToast('Please select a file.'); return; }
                addStatus(dataUrl, type);
                closeStatusModalFn();
            });
        }

        // Chat
        if (sendBtn) sendBtn.addEventListener('click', function() {
            if (chatInput) processCommand(chatInput.value);
        });
        if (chatInput) {
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    processCommand(chatInput.value);
                }
            });
        }

        // Search
        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(); });

        // Image Studio
        if (generateImageBtn) generateImageBtn.addEventListener('click', generateImageStudio);
        if (downloadImageBtn) downloadImageBtn.addEventListener('click', downloadImage);

        // Code Studio
        if (codeGenerateBtn) codeGenerateBtn.addEventListener('click', generateCodeStudio);
        if (copyCodeBtn) copyCodeBtn.addEventListener('click', copyCode);

        // Tabs
        tabs.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                switchTab(tabId);
            });
        });

        // Globals
        window.switchTab = switchTab;
        window.researchTopic = researchTopic;
        window.showTool = showTool;

        // Session
        if (!checkSession()) {
            if (loginOverlay) loginOverlay.classList.remove('hidden');
            if (app) app.classList.add('hidden');
        } else {
            if (loginOverlay) loginOverlay.classList.add('hidden');
            if (app) app.classList.remove('hidden');
        }

        console.log('🦁 Safari AI: Ready!');
        console.log('🔑 Premium code: 0000');
        console.log('📢 Channel: ' + OWNER.channel);
    }

    // ---- START ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

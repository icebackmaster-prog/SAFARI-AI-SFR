// ================================================================
// SAFARI AI – UPGRADED SCRIPT (FULL)
// Status feed, premium, AI chat, research, school mode,
// Drawing tool, speech-to-text, text-to-speech
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

    // ---- STATE ----
    let currentUser = null;
    let isProcessing = false;
    let statuses = JSON.parse(localStorage.getItem('safari_statuses') || '[]');
    let isPremiumUnlocked = false;
    let isSchoolModeOpen = false;
    let isDrawingOpen = false;
    let recognition = null;
    let isRecording = false;

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
    const voiceInputBtn = $('voiceInputBtn');
    const ttsBtn = $('ttsBtn');
    const searchInput = $('searchInput');
    const searchBtn = $('searchBtn');
    const searchResult = $('searchResult');
    const researchResult = $('researchResult');
    const tabs = document.querySelectorAll('.tab-btn');

    // School refs
    const schoolMode = $('schoolMode');
    const schoolInput = $('schoolInput');
    const schoolAskBtn = $('schoolAskBtn');
    const schoolVoiceBtn = $('schoolVoiceBtn');
    const schoolResult = $('schoolResult');

    // Drawing refs
    const drawingTool = $('drawingTool');
    const openDrawingBtn = $('openDrawingBtn');
    const drawCanvas = $('drawCanvas');
    const drawColor = $('drawColor');
    const drawSize = $('drawSize');
    const sizeLabel = $('sizeLabel');

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
        if (statusPreview) {
            statusPreview.innerHTML = '';
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

    // ---- SPEECH-TO-TEXT ----
    function initSpeechToText(inputElement) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            showToast('⚠️ Speech recognition not supported in this browser.');
            return null;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.lang = 'en-US';
        recog.continuous = false;
        recog.interimResults = true;

        recog.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    if (inputElement) {
                        inputElement.value = transcript;
                        inputElement.dispatchEvent(new Event('input'));
                        // Auto-submit if it's school search
                        if (inputElement.id === 'schoolInput') {
                            askSchoolQuestion();
                        }
                    }
                }
            }
        };

        recog.onerror = function() {
            if (inputElement && inputElement.id === 'chatInput') {
                if (voiceInputBtn) voiceInputBtn.classList.remove('recording');
            }
            if (inputElement && inputElement.id === 'schoolInput') {
                if (schoolVoiceBtn) schoolVoiceBtn.classList.remove('recording');
            }
            isRecording = false;
        };

        recog.onend = function() {
            if (inputElement && inputElement.id === 'chatInput') {
                if (voiceInputBtn) voiceInputBtn.classList.remove('recording');
            }
            if (inputElement && inputElement.id === 'schoolInput') {
                if (schoolVoiceBtn) schoolVoiceBtn.classList.remove('recording');
            }
            isRecording = false;
        };

        return recog;
    }

    function toggleVoiceInput(inputElement, btnElement) {
        if (!recognition) {
            recognition = initSpeechToText(inputElement);
            if (!recognition) return;
        }
        if (isRecording) {
            recognition.stop();
            if (btnElement) btnElement.classList.remove('recording');
            isRecording = false;
            return;
        }
        try {
            recognition.start();
            isRecording = true;
            if (btnElement) btnElement.classList.add('recording');
            showToast('🎤 Listening... Speak now.');
        } catch (e) {
            showToast('⚠️ Please allow microphone access.');
        }
    }

    // ---- TEXT-TO-SPEECH ----
    function speakText(text) {
        if (!('speechSynthesis' in window)) {
            showToast('⚠️ Text-to-speech not supported in this browser.');
            return;
        }
        if (!text || text.trim() === '') {
            showToast('No text to speak.');
            return;
        }
        // Cancel any ongoing speech
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        // Try to use a female voice if available
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes('Google UK') || v.name.includes('Samantha') || v.name.includes(
            'Victoria'));
        if (femaleVoice) utterance.voice = femaleVoice;
        window.speechSynthesis.speak(utterance);
        showToast('🔊 Speaking...');
    }

    function speakLastAIResponse() {
        const messages = chatMessages ? chatMessages.querySelectorAll('.message.assistant') : [];
        if (messages.length === 0) {
            showToast('No AI response to speak.');
            return;
        }
        const lastMsg = messages[messages.length - 1];
        const content = lastMsg.querySelector('.msg-content');
        if (content) {
            speakText(content.textContent);
        }
    }

    // ---- CHAT ----
    async function sendChatMessage() {
        if (!chatInput || !chatMessages) return;
        const text = chatInput.value.trim();
        if (!text || isProcessing) return;
        chatInput.value = '';
        isProcessing = true;

        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.innerHTML =
            `<div class="msg-label">You</div><div class="msg-content">${escapeHtml(text)}</div><div class="msg-time">Just now</div>`;
        chatMessages.appendChild(userMsg);
        scrollChat();

        const typing = document.createElement('div');
        typing.className = 'message assistant';
        typing.innerHTML =
            `<div class="msg-label">🤖 Safari AI</div><div class="msg-content"><span class="typing-dots"><span></span><span></span><span></span></span></div>`;
        chatMessages.appendChild(typing);
        scrollChat();

        try {
            let reply = await getAIResponse(text);
            if (!reply) {
                const lower = text.toLowerCase();
                if (lower.includes('who is your owner') || lower.includes('who created you')) {
                    reply =
                        `🦁 I was created by <strong>${OWNER.name}</strong> from Safari Technology. Join our channel: <a href="${OWNER.channel}" target="_blank">${OWNER.channel}</a>`;
                } else if (lower.includes('channel')) {
                    reply = `📢 Join our WhatsApp channel: <a href="${OWNER.channel}" target="_blank">${OWNER.channel}</a>`;
                } else if (lower.includes('joke')) {
                    const jokes = [
                        'Why do programmers prefer dark mode? Light attracts bugs! 🐛',
                        'What do you call a fake noodle? An impasta! 🍝',
                        'Why did the AI break up with the human? Too many bugs in the relationship! 🤖'
                    ];
                    reply = jokes[Math.floor(Math.random() * jokes.length)];
                } else {
                    reply = `🤔 I'm Safari AI. Try asking about weather, search, or just chat with me!`;
                }
            }

            if (chatMessages.contains(typing)) chatMessages.removeChild(typing);

            const aiMsg = document.createElement('div');
            aiMsg.className = 'message assistant';
            aiMsg.innerHTML =
                `<div class="msg-label">🤖 Safari AI</div><div class="msg-content">${parseMarkdown(reply)}</div><div class="msg-time">Just now</div>`;
            chatMessages.appendChild(aiMsg);
            scrollChat();

        } catch (e) {
            if (chatMessages.contains(typing)) chatMessages.removeChild(typing);
            const errMsg = document.createElement('div');
            errMsg.className = 'message assistant';
            errMsg.innerHTML =
                `<div class="msg-label">🤖 Safari AI</div><div class="msg-content">⚠️ Error: ${escapeHtml(e.message)}</div><div class="msg-time">Just now</div>`;
            chatMessages.appendChild(errMsg);
            scrollChat();
        }
        isProcessing = false;
    }

    async function getAIResponse(text) {
        const context =
            `You are Safari AI, a helpful assistant created by ICEBACK MASTER TECH. Answer concisely and helpfully.`;
        try {
            const response = await fetchWithTimeout('https://api.hostify.co.zw/api/ai/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: context })
            }, 8000);
            if (response.ok) {
                const data = await response.json();
                return data.response || data.message || data.reply || '';
            }
        } catch (e) { /* ignore */ }
        return '';
    }

    function fetchWithTimeout(url, options, timeout) {
        timeout = timeout || 8000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(url, { ...options, signal: controller.signal })
            .then(res => { clearTimeout(id); return res; })
            .catch(err => { clearTimeout(id); throw err; });
    }

    function parseMarkdown(text) {
        let html = text;
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br />');
        return html;
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function scrollChat() {
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ---- SEARCH ----
    async function performSearch() {
        if (!searchInput || !searchResult) return;
        const query = searchInput.value.trim();
        if (!query) return;
        searchResult.innerHTML = '<div style="padding:12px;text-align:center;">🔍 Searching...</div>';
        try {
            const resp = await fetchWithTimeout(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
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

    // ---- RESEARCH ----
    const researchData = {
        'AI': '🤖 <strong>What is Artificial Intelligence?</strong><br><br>Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think and learn like humans.<br><br><strong>Key areas:</strong><br>• Machine Learning<br>• Natural Language Processing<br>• Computer Vision<br>• Robotics<br><br>AI powers everything from virtual assistants like Siri to self-driving cars and advanced medical diagnostics.',
        'Business': '📊 <strong>Business Strategy</strong><br><br>Business strategy involves setting goals, determining actions to achieve them, and mobilizing resources to execute the actions.<br><br><strong>Key components:</strong><br>• Market analysis<br>• Competitive advantage<br>• Resource allocation<br>• Growth planning<br>• Risk management',
        'Technology': '💻 <strong>Technology Trends</strong><br><br>Technology is rapidly evolving across multiple domains:<br><br>• <strong>Artificial Intelligence</strong> - Smart systems and automation<br>• <strong>Blockchain</strong> - Secure, decentralized ledgers<br>• <strong>IoT</strong> - Connected devices everywhere<br>• <strong>Quantum Computing</strong> - Exponential processing power<br>• <strong>5G</strong> - Ultra-fast connectivity',
        'Education': '📚 <strong>Education & Learning</strong><br><br>Education is the process of facilitating learning and acquiring knowledge, skills, values, and habits.<br><br><strong>Key trends in education:</strong><br>• EdTech (Educational Technology)<br>• Personalized learning<br>• Online and hybrid learning<br>• Lifelong learning<br>• Skills-based education',
        'Health': '❤️ <strong>Health & Wellness</strong><br><br>Health is a state of complete physical, mental, and social well-being.<br><br><strong>Key areas:</strong><br>• Nutrition and balanced diet<br>• Regular exercise and fitness<br>• Mental health and stress management<br>• Preventive healthcare<br>• Sleep and recovery',
        'Science': '🔬 <strong>Science</strong><br><br>Science is the systematic study of the structure and behavior of the physical and natural world through observation and experiment.<br><br><strong>Main branches:</strong><br>• <strong>Physics</strong> - Matter, energy, motion<br>• <strong>Chemistry</strong> - Substances, reactions<br>• <strong>Biology</strong> - Living organisms, life processes<br>• <strong>Earth Science</strong> - Planets, geology, climate',
        'History': '🏛️ <strong>History</strong><br><br>History is the study of past events, particularly in human affairs.<br><br><strong>Key periods:</strong><br>• Ancient civilizations (Egypt, Greece, Rome)<br>• Medieval period<br>• Renaissance & Enlightenment<br>• Modern history (19th-21st century)<br>• Contemporary world events'
    };

    function researchTopic(topic) {
        if (!researchResult) return;
        const data = researchData[topic];
        if (data) {
            researchResult.innerHTML = data;
        } else {
            researchResult.innerHTML = `<strong>${topic}</strong><br>Research data will appear here. Try another topic.`;
        }
    }

    // ---- SCHOOL MODE ----
    function openSchoolMode() {
        isSchoolModeOpen = true;
        if (schoolMode) schoolMode.classList.add('open');
        if (schoolResult) {
            schoolResult.innerHTML = `
                <div class="school-placeholder">
                    <i class="fas fa-graduation-cap"></i>
                    <p>Ask about agriculture, biology, math, history, or any school subject!</p>
                    <p style="font-size:13px;color:var(--text-muted);">Try: "What is agriculture?" or "Draw respiratory system"</p>
                </div>
            `;
        }
        // Close drawing if open
        if (isDrawingOpen) closeDrawing();
    }

    function closeSchoolMode() {
        isSchoolModeOpen = false;
        if (schoolMode) schoolMode.classList.remove('open');
        if (drawingTool) drawingTool.classList.remove('open');
        isDrawingOpen = false;
    }

    async function askSchoolQuestion() {
        if (!schoolInput || !schoolResult) return;
        const query = schoolInput.value.trim();
        if (!query) return;
        schoolResult.innerHTML = '<div style="padding:12px;text-align:center;">🧠 Thinking... Please wait.</div>';

        try {
            // Try to get an answer from the AI API first
            let answer = await getAIResponse(`Provide a detailed, educational answer about: ${query}. Include key facts and explanations suitable for a student.`);

            // If API fails, use fallback knowledge
            if (!answer) {
                answer = getSchoolFallback(query);
            }

            // Check if the query asks to draw something
            const lowerQuery = query.toLowerCase();
            if (lowerQuery.includes('draw') || lowerQuery.includes('diagram') || lowerQuery.includes('label')) {
                // Extract what to draw
                let drawTopic = query.replace(/draw|diagram|label|show|illustrate/gi, '').trim() || 'diagram';
                if (drawTopic.includes('respiratory') || drawTopic.includes('lungs') || drawTopic.includes('breathing')) {
                    answer +=
                        `<br><br><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Respiratory_system_complete_en.svg/300px-Respiratory_system_complete_en.svg.png" alt="Respiratory System Diagram" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" />`;
                    answer +=
                        `<br><span class="diagram-label">📋 Diagram: Human Respiratory System (source: Wikimedia Commons)</span>`;
                } else if (drawTopic.includes('heart') || drawTopic.includes('circulatory')) {
                    answer +=
                        `<br><br><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Diagram_of_the_human_heart_%28cropped%29.svg/300px-Diagram_of_the_human_heart_%28cropped%29.svg.png" alt="Heart Diagram" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" />`;
                    answer += `<br><span class="diagram-label">📋 Diagram: Human Heart (source: Wikimedia Commons)</span>`;
                } else if (drawTopic.includes('brain') || drawTopic.includes('nervous')) {
                    answer +=
                        `<br><br><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Human_brain_MRI.jpg/300px-Human_brain_MRI.jpg" alt="Brain Diagram" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" />`;
                    answer += `<br><span class="diagram-label">📋 Diagram: Human Brain (MRI) (source: Wikimedia Commons)</span>`;
                } else if (drawTopic.includes('digestive') || drawTopic.includes('stomach')) {
                    answer +=
                        `<br><br><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Digestive_system_diagram_en.svg/300px-Digestive_system_diagram_en.svg.png" alt="Digestive System" style="max-width:100%;border-radius:8px;border:1px solid var(--border);" />`;
                    answer +=
                        `<br><span class="diagram-label">📋 Diagram: Human Digestive System (source: Wikimedia Commons)</span>`;
                } else {
                    answer +=
                        `<br><br>📝 <strong>To draw this:</strong> You can use the <strong>Drawing Tool</strong> below to sketch and label it yourself! Click "Open Drawing Tool" and start drawing.`;
                }
            }

            schoolResult.innerHTML =
                `<div class="answer-content">${parseMarkdown(answer)}</div><div style="margin-top:8px;font-size:12px;color:var(--text-muted);">⚡ Powered by Safari AI</div>`;

        } catch (e) {
            schoolResult.innerHTML =
                `<div style="color:#ef4444;">⚠️ Error: ${escapeHtml(e.message)}. Please try again.</div>`;
        }
    }

    function getSchoolFallback(query) {
        const lower = query.toLowerCase();
        if (lower.includes('agriculture') || lower.includes('farming')) {
            return `🌾 <strong>What is Agriculture?</strong><br><br>Agriculture is the science, art, and practice of cultivating plants and livestock. It is the backbone of human civilization.<br><br><strong>Key areas:</strong><br>• <strong>Crop farming</strong> - Growing plants for food, fiber, and fuel<br>• <strong>Animal husbandry</strong> - Raising livestock for meat, milk, and other products<br>• <strong>Agronomy</strong> - Soil management and crop production<br>• <strong>Horticulture</strong> - Growing fruits, vegetables, and ornamental plants<br><br>Agriculture provides food, raw materials, and employment for billions of people worldwide.`;
        } else if (lower.includes('respiratory') || lower.includes('lungs') || lower.includes('breathing')) {
            return `🫁 <strong>Respiratory System</strong><br><br>The respiratory system is the network of organs and tissues that help you breathe. It includes your airways, lungs, and blood vessels.<br><br><strong>Main organs:</strong><br>• <strong>Nose & Mouth</strong> - Air enters here<br>• <strong>Trachea (Windpipe)</strong> - Carries air to the lungs<br>• <strong>Bronchi</strong> - Two large tubes that branch into the lungs<br>• <strong>Lungs</strong> - Main organs where gas exchange occurs<br>• <strong>Alveoli</strong> - Tiny air sacs where oxygen enters the blood<br><br>💡 The diaphragm is a muscle that helps you breathe in and out.`;
        } else if (lower.includes('photosynthesis')) {
            return `🌱 <strong>Photosynthesis</strong><br><br>Photosynthesis is the process by which plants convert light energy into chemical energy (glucose).<br><br><strong>Equation:</strong><br>6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂<br><br><strong>Key parts:</strong><br>• <strong>Chlorophyll</strong> - Green pigment that captures light<br>• <strong>Chloroplasts</strong> - Organelles where photosynthesis occurs<br>• <strong>Stomata</strong> - Small pores on leaves that allow gas exchange<br><br>This process provides oxygen for all living things! 🌍`;
        } else if (lower.includes('math') || lower.includes('algebra') || lower.includes('equation')) {
            return `📐 <strong>Mathematics Help</strong><br><br>I can help with various math topics:<br><br>• <strong>Basic arithmetic</strong> - Addition, subtraction, multiplication, division<br>• <strong>Algebra</strong> - Equations, variables, functions<br>• <strong>Geometry</strong> - Shapes, angles, area, volume<br>• <strong>Statistics</strong> - Mean, median, mode, probability<br>• <strong>Calculus</strong> - Derivatives, integrals, limits<br><br>💡 Need help with a specific problem? Ask me directly!`;
        } else if (lower.includes('history') || lower.includes('ancient')) {
            return `🏛️ <strong>History</strong><br><br>History is the study of past events and human achievements.<br><br><strong>Major periods:</strong><br>• <strong>Ancient History</strong> - Egypt, Greece, Rome (3000 BC - 500 AD)<br>• <strong>Medieval History</strong> - Middle Ages (500-1500 AD)<br>• <strong>Renaissance</strong> - Cultural rebirth (14th-17th century)<br>• <strong>Modern History</strong> - Industrial Revolution to present (18th century - today)<br><br>💡 I can help with specific historical events or figures too!`;
        } else if (lower.includes('science') || lower.includes('physics') || lower.includes('chemistry')) {
            return `🔬 <strong>Science</strong><br><br>Science is the systematic study of the natural world through observation and experiment.<br><br><strong>Main branches:</strong><br>• <strong>Physics</strong> - Studies matter, energy, and forces (gravity, light, motion)<br>• <strong>Chemistry</strong> - Studies substances, molecules, and chemical reactions<br>• <strong>Biology</strong> - Studies living organisms and life processes<br>• <strong>Earth Science</strong> - Studies the planet, climate, and geology<br><br>💡 Science helps us understand the universe and solve real-world problems!`;
        } else {
            return `📚 <strong>Great question!</strong><br><br>I'm Safari AI, your educational assistant. I can help with:<br><br>• <strong>Agriculture</strong> - Farming, crops, livestock<br>• <strong>Biology</strong> - Human body, plants, animals, cells<br>• <strong>Chemistry</strong> - Elements, compounds, reactions<br>• <strong>Physics</strong> - Motion, energy, forces<br>• <strong>Math</strong> - Arithmetic, algebra, geometry<br>• <strong>History</strong> - Ancient, medieval, modern<br>• <strong>Geography</strong> - Countries, continents, climate<br><br>💡 Type "what is agriculture?" or "draw respiratory system" to learn more!`;
        }
    }

    // ---- DRAWING TOOL ----
    let ctx = null;
    let isDrawing = false;
    let lastX = 0,
        lastY = 0;
    let currentTool = 'pen';
    let textMode = false;
    let textInput = '';

    function initCanvas() {
        if (!drawCanvas) return;
        ctx = drawCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

        // Mouse events
        drawCanvas.addEventListener('mousedown', startDraw);
        drawCanvas.addEventListener('mousemove', draw);
        drawCanvas.addEventListener('mouseup', endDraw);
        drawCanvas.addEventListener('mouseleave', endDraw);

        // Touch events for mobile
        drawCanvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const rect = drawCanvas.getBoundingClientRect();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            drawCanvas.dispatchEvent(mouseEvent);
        }, { passive: false });

        drawCanvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const rect = drawCanvas.getBoundingClientRect();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            drawCanvas.dispatchEvent(mouseEvent);
        }, { passive: false });

        drawCanvas.addEventListener('touchend', function(e) {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            drawCanvas.dispatchEvent(mouseEvent);
        }, { passive: false });

        // Size label
        if (drawSize && sizeLabel) {
            drawSize.addEventListener('input', function() {
                sizeLabel.textContent = this.value;
            });
        }
    }

    function getCanvasCoords(e) {
        const rect = drawCanvas.getBoundingClientRect();
        const scaleX = drawCanvas.width / rect.width;
        const scaleY = drawCanvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    function startDraw(e) {
        if (!ctx) return;
        if (currentTool === 'text') {
            // Prompt for text
            const text = prompt('Enter text to label:', 'Label');
            if (text && text.trim()) {
                const coords = getCanvasCoords(e);
                ctx.font = `${parseInt(drawSize.value) * 4 + 16}px Arial`;
                ctx.fillStyle = drawColor.value;
                ctx.fillText(text.trim(), coords.x, coords.y);
                showToast('✅ Label added!');
            }
            return;
        }
        isDrawing = true;
        const coords = getCanvasCoords(e);
        lastX = coords.x;
        lastY = coords.y;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    function draw(e) {
        if (!isDrawing || !ctx) return;
        const coords = getCanvasCoords(e);
        ctx.strokeStyle = drawColor.value;
        ctx.lineWidth = parseInt(drawSize.value);

        if (currentTool === 'pen') {
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        } else if (currentTool === 'line') {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        } else if (currentTool === 'rect') {
            const w = coords.x - lastX;
            const h = coords.y - lastY;
            ctx.strokeRect(lastX, lastY, w, h);
        } else if (currentTool === 'circle') {
            const radius = Math.sqrt(Math.pow(coords.x - lastX, 2) + Math.pow(coords.y - lastY, 2));
            ctx.beginPath();
            ctx.arc(lastX, lastY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function endDraw() {
        isDrawing = false;
        if (ctx) ctx.closePath();
    }

    function setDrawTool(tool) {
        currentTool = tool;
        // Update active button
        document.querySelectorAll('.draw-btn').forEach(btn => btn.classList.remove('active'));
        const btns = document.querySelectorAll('.draw-btn');
        btns.forEach(btn => {
            if (btn.textContent.trim().toLowerCase().includes(tool) ||
                btn.textContent.trim() === tool.charAt(0).toUpperCase() + tool.slice(1)) {
                btn.classList.add('active');
            }
        });
        if (tool === 'pen') {
            drawCanvas.style.cursor = 'crosshair';
        } else if (tool === 'text') {
            drawCanvas.style.cursor = 'text';
        } else {
            drawCanvas.style.cursor = 'crosshair';
        }
    }

    function clearCanvas() {
        if (!ctx) return;
        ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#1a2332' : '#ffffff';
        ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        showToast('🗑️ Canvas cleared.');
    }

    function saveDrawing() {
        if (!drawCanvas) return;
        const link = document.createElement('a');
        link.download = `drawing_${Date.now()}.png`;
        link.href = drawCanvas.toDataURL('image/png');
        link.click();
        showToast('✅ Drawing saved!');
    }

    function openDrawing() {
        if (!drawingTool) return;
        drawingTool.classList.add('open');
        isDrawingOpen = true;
        if (!ctx) initCanvas();
        // Resize canvas to fit container
        const wrapper = drawingTool.querySelector('.drawing-canvas-wrapper');
        if (wrapper) {
            const maxWidth = wrapper.clientWidth - 16;
            if (maxWidth > 0) {
                drawCanvas.style.width = Math.min(maxWidth, 700) + 'px';
                drawCanvas.style.height = 'auto';
            }
        }
        showToast('✏️ Drawing tool opened!');
    }

    function closeDrawing() {
        if (!drawingTool) return;
        drawingTool.classList.remove('open');
        isDrawingOpen = false;
    }

    // ---- TAB SWITCHING ----
    function switchTab(tabId) {
        tabs.forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const targetPane = document.getElementById(`tab-${tabId}`);
        if (targetPane) targetPane.classList.add('active');
        // Close school mode when switching tabs
        if (isSchoolModeOpen) closeSchoolMode();
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

        // Status modal
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
        if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);
        if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

        // Speech-to-Text for Chat
        if (voiceInputBtn) {
            voiceInputBtn.addEventListener('click', function() {
                toggleVoiceInput(chatInput, this);
            });
        }

        // Text-to-Speech
        if (ttsBtn) {
            ttsBtn.addEventListener('click', speakLastAIResponse);
        }

        // Search
        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(); });

        // Tabs
        tabs.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                switchTab(tabId);
            });
        });

        // School Mode
        if (schoolAskBtn) schoolAskBtn.addEventListener('click', askSchoolQuestion);
        if (schoolInput) schoolInput.addEventListener('keydown', e => { if (e.key === 'Enter') askSchoolQuestion(); });
        if (schoolVoiceBtn) {
            schoolVoiceBtn.addEventListener('click', function() {
                toggleVoiceInput(schoolInput, this);
            });
        }

        // Drawing
        if (openDrawingBtn) openDrawingBtn.addEventListener('click', openDrawing);
        if (drawCanvas) initCanvas();

        // ---- GLOBALS ----
        window.switchTab = switchTab;
        window.researchTopic = researchTopic;
        window.openSchoolMode = openSchoolMode;
        window.closeSchoolMode = closeSchoolMode;
        window.askSchoolQuestion = askSchoolQuestion;
        window.setDrawTool = setDrawTool;
        window.clearCanvas = clearCanvas;
        window.saveDrawing = saveDrawing;
        window.closeDrawing = closeDrawing;
        window.openDrawing = openDrawing;
        window.speakText = speakText;

        // ---- SESSION ----
        if (!checkSession()) {
            if (loginOverlay) loginOverlay.classList.remove('hidden');
            if (app) app.classList.add('hidden');
        } else {
            if (loginOverlay) loginOverlay.classList.add('hidden');
            if (app) app.classList.remove('hidden');
        }

        // Preload voices for TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = function() {
                window.speechSynthesis.getVoices();
            };
        }

        console.log('🦁 Safari AI: Ready!');
        console.log('🔑 Premium code: 0000');
        console.log('📢 Channel: ' + OWNER.channel);
        console.log('📧 Email: ' + OWNER.email);
    }

    // ---- START ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

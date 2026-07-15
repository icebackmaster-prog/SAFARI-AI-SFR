// ================================================================
// SAFARI AI V1 – COMPLETE SCRIPT
// Multi-API Engine · Image Generation · Fast Responses
// ================================================================

console.log('🦁 SAFARI AI V1: Script loading...');

(function() {
    'use strict';

    // ---- CONFIG ----
    const OWNER = {
        name: 'ICEBACK MASTER TECH',
        company: 'Safari Technology',
        channel: 'https://whatsapp.com/channel/0029VbC0Vi50wajpq5TlRi0B',
        email: 'safaritechcompany@gmail.com',
        phone: '+263788377887',
        ownerEmail: 'icebackmaster@gmail.com'
    };

    const CONFIG = {
        // Multiple AI APIs (ordered by priority)
        APIS: [
            'https://api.hostify.co.zw/api/ai/deepsearch',
            'https://api.hostify.co.zw/api/ai/gemini',
            'https://api.hostify.co.zw/api/ai/unlimited',
            'https://api.hostify.co.zw/api/ai/notegpt'
        ],
        IMAGE_API: 'https://image.pollinations.ai/prompt',
        FALLBACK_API: 'https://api.hostify.co.zw/api/ai/gemini',
        TIMEOUT: 10000,
        PREMIUM_PIN: '0000'
    };

    // ---- DOM REFS ----
    const $ = id => document.getElementById(id);
    const loginOverlay = $('loginOverlay');
    const app = $('app');
    const loginBtn = $('loginBtn');
    const loginEmail = $('loginEmail');
    const loginPassword = $('loginPassword');
    const userBadge = $('userBadge');
    const chatMessages = $('chatMessages');
    const chatInput = $('chatInput');
    const sendBtn = $('sendBtn');
    const voiceBtn = $('voiceBtn');
    const chatFileInput = $('chatFileInput');
    const cameraInput = $('cameraInput');
    const filePreview = $('filePreview');
    const menuToggle = $('menuToggle');
    const closeMenu = $('closeMenu');
    const menuOverlay = $('menuOverlay');
    const sideMenu = $('sideMenu');
    const premiumBtn = $('premiumBtn');
    const premiumModal = $('premiumModal');
    const closePremium = $('closePremium');
    const premiumCode = $('premiumCode');
    const premiumUnlockBtn = $('premiumUnlockBtn');
    const premiumError = $('premiumError');
    const premiumFeatures = $('premiumFeatures');
    const addStoryBtn = $('addStoryBtn');
    const searchIcon = $('searchIcon');
    const notifIcon = $('notifIcon');
    const notifBadge = $('notifBadge');
    const logoutBtn = $('logoutBtn');
    const ownerStoryRing = $('ownerStoryRing');

    // ---- STATE ----
    let currentUser = null;
    let isProcessing = false;
    let isPremium = false;
    let isOwner = false;

    // ---- AUTH ----
    function login() {
        const email = loginEmail.value.trim() || 'demo@safari.ai';
        const pass = loginPassword.value.trim() || 'password123';
        if (!email) { showToast('Please enter email.'); return; }
        currentUser = { displayName: email.split('@')[0], email: email };
        localStorage.setItem('safari_user', JSON.stringify(currentUser));
        loginOverlay.classList.add('hidden');
        app.classList.remove('hidden');
        userBadge.textContent = currentUser.displayName;
        if (email === 'demo@safari.ai' || currentUser.displayName === 'Iceback') {
            isOwner = true;
        }
        showToast(`👋 Welcome, ${currentUser.displayName}!`);
        // Send welcome message
        addMessage('assistant', '👋 Welcome to <strong>SAFARI AI V1</strong>! I\'m built by <strong>ICEBACK MASTER TECH</strong>. I can answer school questions, generate images, search the web, and more. Ask me anything!');
    }

    function checkSession() {
        const saved = localStorage.getItem('safari_user');
        if (saved) {
            try {
                currentUser = JSON.parse(saved);
                loginOverlay.classList.add('hidden');
                app.classList.remove('hidden');
                userBadge.textContent = currentUser.displayName;
                if (currentUser.displayName === 'Iceback' || currentUser.email === 'demo@safari.ai') {
                    isOwner = true;
                }
                return true;
            } catch (e) { localStorage.removeItem('safari_user'); }
        }
        return false;
    }

    function logout() {
        localStorage.removeItem('safari_user');
        currentUser = null;
        loginOverlay.classList.remove('hidden');
        app.classList.add('hidden');
        showToast('Logged out.');
    }

    // ---- HELPERS ----
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

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function parseMarkdown(text) {
        let html = text;
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br />');
        html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:var(--accent-end);">$1</a>');
        return html;
    }

    // ---- MESSAGES ----
    function addMessage(role, content, extra = null) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        const avatar = role === 'user' ? '👤' : '🦁';
        const label = role === 'user' ? 'You' : 'SAFARI AI V1';
        div.innerHTML = `
            <div class="msg-avatar">${avatar}</div>
            <div class="msg-bubble">
                <div class="msg-label">${label}</div>
                <div class="msg-content">${parseMarkdown(content)}</div>
                <div class="msg-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
        `;
        // Actions for assistant
        if (role === 'assistant') {
            const actions = document.createElement('div');
            actions.className = 'msg-actions';
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋 Copy';
            copyBtn.onclick = function() {
                const text = div.querySelector('.msg-content').textContent;
                navigator.clipboard.writeText(text).then(() => showToast('📋 Copied!'));
            };
            actions.appendChild(copyBtn);
            const speakBtn = document.createElement('button');
            speakBtn.textContent = '🔊 Speak';
            speakBtn.onclick = function() {
                const text = div.querySelector('.msg-content').textContent;
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 1.0;
                    window.speechSynthesis.speak(utterance);
                    showToast('🔊 Speaking...');
                } else showToast('⚠️ Speech not supported.');
            };
            actions.appendChild(speakBtn);
            div.querySelector('.msg-bubble').appendChild(actions);
        }
        // Extra (image)
        if (extra && extra.image) {
            const img = document.createElement('img');
            img.src = extra.image;
            img.alt = 'Generated image';
            img.loading = 'lazy';
            div.querySelector('.msg-content').appendChild(img);
        }
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'message assistant';
        div.id = 'typingIndicator';
        div.innerHTML = `
            <div class="msg-avatar">🦁</div>
            <div class="msg-bubble">
                <div class="msg-label">SAFARI AI V1</div>
                <div class="msg-content"><span class="spinner"></span> Thinking...</div>
            </div>
        `;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    // ---- AI ENGINE (Multi-API) ----
    async function getAIResponse(query, context) {
        context = context || `You are Safari AI V1, created by ICEBACK MASTER TECH. You are an expert in school subjects, AI, and general knowledge. Answer accurately and helpfully. End with "POWERED BY ICEBACK MASTER TECH".`;

        // Try each API in order
        for (let api of CONFIG.APIS) {
            try {
                const response = await fetchWithTimeout(api, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: query, context: context })
                }, CONFIG.TIMEOUT);
                if (response.ok) {
                    const data = await response.json();
                    const reply = data.response || data.message || data.reply || data.text || data.content || data.result || '';
                    if (reply) {
                        // Add owner branding if not present
                        if (!reply.includes('POWERED BY ICEBACK MASTER TECH')) {
                            return reply + '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
                        }
                        return reply;
                    }
                }
            } catch (e) {
                console.warn(`API ${api} failed:`, e);
            }
        }

        // Ultimate fallback
        return `🤔 I'm Safari AI V1, built by ICEBACK MASTER TECH. I couldn't reach my AI services right now. Please try again later.`;
    }

    function fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(url, { ...options, signal: controller.signal })
            .then(res => { clearTimeout(id); return res; })
            .catch(err => { clearTimeout(id); throw err; });
    }

    // ---- IMAGE GENERATION ----
    async function generateImage(description) {
        const url = `${CONFIG.IMAGE_API}/${encodeURIComponent(description)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
        return url;
    }

    // ---- COMMAND PROCESSING ----
    async function processCommand(input) {
        if (isProcessing) return;
        const trimmed = input.trim();
        if (!trimmed) return;

        addMessage('user', escapeHtml(trimmed));
        chatInput.value = '';
        isProcessing = true;

        // Check for image generation
        const genMatch = trimmed.match(/^(generate|create|make)\s+(.+)/i);
        if (genMatch) {
            const desc = genMatch[2].trim();
            showTyping();
            try {
                const imgUrl = await generateImage(desc);
                removeTyping();
                addMessage('assistant', `🖼️ Here is your generated image: <strong>${escapeHtml(desc)}</strong>`, { image: imgUrl });
            } catch (e) {
                removeTyping();
                addMessage('assistant', '⚠️ Failed to generate image. Please try again.');
            }
            isProcessing = false;
            return;
        }

        // Check for owner info
        const lower = trimmed.toLowerCase();
        if (lower.includes('who is your owner') || lower.includes('who created you')) {
            addMessage('assistant', `🦁 I was created by <strong>${OWNER.name}</strong> from ${OWNER.company}.<br />📞 ${OWNER.phone}<br />📧 ${OWNER.ownerEmail}<br />📢 <a href="${OWNER.channel}" target="_blank">Join Channel</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`);
            isProcessing = false;
            return;
        }

        if (lower.includes('channel link') || lower.includes('whatsapp channel')) {
            addMessage('assistant', `📢 Join our WhatsApp Channel:<br /><a href="${OWNER.channel}" target="_blank">${OWNER.channel}</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`);
            isProcessing = false;
            return;
        }

        // Show typing and get AI response
        showTyping();
        try {
            const reply = await getAIResponse(trimmed);
            removeTyping();
            addMessage('assistant', reply);
        } catch (e) {
            removeTyping();
            addMessage('assistant', '⚠️ Error: ' + e.message);
        }
        isProcessing = false;
    }

    // ---- VOICE INPUT ----
    function initVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceBtn.style.display = 'none';
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;
        let isRecording = false;
        voiceBtn.addEventListener('click', function() {
            if (isRecording) {
                recognition.stop();
                isRecording = false;
                this.classList.remove('recording');
                this.innerHTML = '<i class="fas fa-microphone"></i>';
                return;
            }
            try {
                recognition.start();
                isRecording = true;
                this.classList.add('recording');
                this.innerHTML = '<i class="fas fa-stop-circle"></i>';
            } catch (e) { /* ignore */ }
        });
        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    chatInput.value = transcript;
                    voiceBtn.classList.remove('recording');
                    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    isRecording = false;
                    processCommand(transcript);
                }
            }
        };
        recognition.onerror = function() {
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            isRecording = false;
        };
        recognition.onend = function() {
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            isRecording = false;
        };
    }

    // ---- FILE UPLOAD HANDLING ----
    function handleFileUpload(files) {
        if (files.length === 0) return;
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        addMessage('user', `📎 Attached: ${fileNames}`);
        // For images, show preview
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const div = document.createElement('div');
                    div.className = 'message user';
                    div.innerHTML = `
                        <div class="msg-avatar">👤</div>
                        <div class="msg-bubble">
                            <div class="msg-label">You</div>
                            <div class="msg-content"><img src="${e.target.result}" style="max-width:200px;max-height:200px;border-radius:8px;" /><br>📸 ${file.name}</div>
                            <div class="msg-time">Just now</div>
                        </div>
                    `;
                    chatMessages.appendChild(div);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                };
                reader.readAsDataURL(file);
            }
        }
        chatFileInput.value = '';
        filePreview.innerHTML = '';
        // Optionally process file with AI if it's a text file
        if (files.length === 1 && files[0].type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result.slice(0, 2000);
                processCommand(`Analyze this file:\n${content}`);
            };
            reader.readAsText(files[0]);
        }
    }

    // ---- PREMIUM ----
    function unlockPremium() {
        const code = premiumCode.value.trim();
        if (code === CONFIG.PREMIUM_PIN) {
            isPremium = true;
            premiumFeatures.classList.remove('hidden');
            premiumError.textContent = '';
            showToast('✨ Premium unlocked!');
            setTimeout(() => premiumModal.classList.remove('open'), 1000);
        } else {
            premiumError.textContent = '❌ Incorrect PIN. Try again.';
        }
    }

    // ---- MENU ----
    function toggleMenu() {
        sideMenu.classList.toggle('open');
        menuOverlay.classList.toggle('show');
    }

    function closeMenu() {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('show');
    }

    // ---- PARTICLES BACKGROUND ----
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
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
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
                ctx.fillStyle = `rgba(108, 92, 231, ${this.opacity})`;
                ctx.fill();
            }
        }
        for (let i = 0; i < 120; i++) particles.push(new Particle());
        function animate() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            // Draw connections
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.strokeStyle = `rgba(108, 92, 231, ${0.05 * (1 - dist/150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ---- INIT ----
    function init() {
        console.log('🦁 SAFARI AI V1: Initializing...');
        initParticles();
        initVoice();

        // ---- LOGIN ----
        loginBtn.addEventListener('click', login);
        loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
        loginEmail.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

        // ---- CHAT ----
        sendBtn.addEventListener('click', () => processCommand(chatInput.value));
        chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); processCommand(chatInput.value); } });

        // ---- FILE UPLOAD ----
        chatFileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                filePreview.innerHTML = Array.from(this.files).map(f =>
                    `<span class="file-tag">📎 ${f.name} <span class="remove-file" onclick="this.parentElement.remove();">✕</span></span>`
                ).join('');
                handleFileUpload(this.files);
            }
        });
        cameraInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                showToast('📸 Image captured!');
                chatFileInput.files = this.files;
                const event = new Event('change');
                chatFileInput.dispatchEvent(event);
            }
        });

        // ---- MENU ----
        menuToggle.addEventListener('click', toggleMenu);
        closeMenu.addEventListener('click', closeMenu);
        menuOverlay.addEventListener('click', closeMenu);

        // ---- PREMIUM ----
        premiumBtn.addEventListener('click', function() {
            premiumModal.classList.add('open');
            premiumCode.value = '';
            premiumError.textContent = '';
            premiumFeatures.classList.add('hidden');
        });
        closePremium.addEventListener('click', function() { premiumModal.classList.remove('open'); });
        premiumUnlockBtn.addEventListener('click', unlockPremium);
        premiumCode.addEventListener('keydown', e => { if (e.key === 'Enter') unlockPremium(); });

        // ---- SEARCH & NOTIFICATIONS ----
        searchIcon.addEventListener('click', () => chatInput.focus());
        notifIcon.addEventListener('click', () => showToast('🔔 You have 3 notifications.'));

        // ---- LOGOUT ----
        logoutBtn.addEventListener('click', logout);

        // ---- ADD STORY (demo) ----
        addStoryBtn.addEventListener('click', function() {
            if (isOwner || isPremium) {
                showToast('📸 Status upload coming soon!');
            } else {
                showToast('🔒 Premium required to add statuses. Enter PIN 0000.');
            }
        });

        // ---- SESSION ----
        if (!checkSession()) {
            loginOverlay.classList.remove('hidden');
            app.classList.add('hidden');
        } else {
            loginOverlay.classList.add('hidden');
            app.classList.remove('hidden');
        }

        console.log('🦁 SAFARI AI V1: Ready!');
        console.log('🔑 Premium PIN: 0000');
        console.log('📢 Channel: ' + OWNER.channel);
        console.log('👑 Owner: ' + OWNER.name);
    }

    // ---- START ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally
    window.closeMenu = closeMenu;
})();

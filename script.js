// ================================================================
// SAFARI AI – UPGRADED SCRIPT (FIXED)
// Status feed, premium posting, AI chat, search, research
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
            // Attach event listener to the newly created button
            const btn = statusGrid.querySelector('.add-status-btn');
            if (btn) btn.addEventListener('click', openStatusModal);
            return;
        }
        let html = '';
        // Show newest first (reverse)
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
        // Reset data attributes
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

    // ---- CHAT ----
    async function sendChatMessage() {
        if (!chatInput || !chatMessages) return;
        const text = chatInput.value.trim();
        if (!text || isProcessing) return;
        chatInput.value = '';
        isProcessing = true;

        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.innerHTML =
            `<div class="msg-label">You</div><div class="msg-content">${escapeHtml(text)}</div><div class="msg-time">Just now</div>`;
        chatMessages.appendChild(userMsg);
        scrollChat();

        // Typing indicator
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
                    reply =
                        `🤔 I'm Safari AI. Try asking about weather, search, or just chat with me!`;
                }
            }

            // Remove typing
            chatMessages.removeChild(typing);

            // AI reply
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
    function researchTopic(topic) {
        if (!researchResult) return;
        researchResult.innerHTML = `<div style="padding:12px;text-align:center;">📊 Researching ${topic}...</div>`;
        setTimeout(() => {
            const facts = {
                'AI': 'Artificial Intelligence is transforming industries. Key areas: machine learning, NLP, computer vision.',
                'Business': 'Business strategy involves market analysis, competitive advantage, and sustainable growth.',
                'Technology': 'Technology trends: AI, blockchain, IoT, quantum computing, and 5G.',
                'Education': 'Education is evolving with edtech, personalized learning, and lifelong learning platforms.'
            };
            researchResult.innerHTML =
                `<strong>${topic}</strong><br>${facts[topic] || 'Research data will appear here.'}`;
        }, 800);
    }

    // ---- TAB SWITCHING ----
    function switchTab(tabId) {
        tabs.forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        const targetPane = document.getElementById(`tab-${tabId}`);
        if (targetPane) targetPane.classList.add('active');
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

        // ---- LOGIN ----
        if (loginBtn) loginBtn.addEventListener('click', login);
        if (loginPassword) loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
        if (loginEmail) loginEmail.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

        // ---- THEME ----
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

        // ---- PREMIUM ----
        if (premiumBtn) premiumBtn.addEventListener('click', openPremiumModal);
        if (closePremium) closePremium.addEventListener('click', closePremiumModal);
        if (premiumUnlockBtn) premiumUnlockBtn.addEventListener('click', unlockPremium);
        if (premiumCode) premiumCode.addEventListener('keydown', e => { if (e.key === 'Enter') unlockPremium(); });

        // ---- STATUS MODAL ----
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

        // ---- CHAT ----
        if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);
        if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

        // ---- SEARCH ----
        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(); });

        // ---- TABS ----
        tabs.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                switchTab(tabId);
            });
        });

        // ---- GLOBALS ----
        window.switchTab = switchTab;
        window.researchTopic = researchTopic;

        // ---- SESSION ----
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

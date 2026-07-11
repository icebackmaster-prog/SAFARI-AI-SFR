// ================================================================
// SAFARI AI – COMPLETE SCRIPT
// Working Google Login · GitHub/Apple: Maintenance
// Weather · Safari Search · AI Chat · Image · Code · Writing
// ================================================================

console.log('🦁 SAFARI AI: Script loading...');

(function() {
    'use strict';

    // ===== CONFIG =====
    const OWNER = {
        name: 'ICEBACK MASTER TECH',
        company: 'Safari Technology',
        phone1: '+263788377887',
        phone2: '+263788848481',
        channel: 'https://whatsapp.com/channel/0029VbC0Vi50wajpq5TlRi0B'
    };

    const CONFIG = {
        CHAT_API: 'https://api.hostify.co.zw/api/ai/chatespanyol',
        FALLBACK_API: 'https://api.hostify.co.zw/api/ai/gemini',
        IMAGE_API: 'https://image.pollinations.ai/prompt',
        WIKI_API: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
        WEATHER_API: 'https://wttr.in',
        TIMEOUT: 8000
    };

    // ===== FIREBASE CONFIG (REPLACE WITH YOUR OWN) =====
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // ===== DOM HELPERS =====
    function $(id) {
        const el = document.getElementById(id);
        if (!el) console.warn('⚠️ Element not found:', id);
        return el;
    }

    function qs(selector) { return document.querySelector(selector); }
    function qsa(selector) { return document.querySelectorAll(selector); }

    // ===== STATE =====
    let currentUser = null;
    let currentPage = 'dashboard';
    let chatHistory = [];
    let currentChatId = null;
    let isProcessing = false;
    let stats = JSON.parse(localStorage.getItem('safari_stats') || '{"chats":0,"images":0,"code":0}');
    let todos = JSON.parse(localStorage.getItem('safari_todos') || '[]');
    let sttRecognition = null;
    let isRecording = false;
    let auth = null;

    // ===== PARTICLES =====
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

    // ===== THEME =====
    function toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        updateThemeUI(next);
        localStorage.setItem('safari_theme', next);
    }

    function updateThemeUI(theme) {
        const isDark = theme === 'dark';
        const icon = isDark ? 'fa-sun' : 'fa-moon';
        const text = isDark ? 'Light Mode' : 'Dark Mode';
        const iconTop = document.getElementById('themeIconTop');
        const iconSide = document.getElementById('themeIconSidebar');
        const textSide = document.getElementById('themeTextSidebar');
        const settingsToggle = document.getElementById('themeToggleSettings');
        if (iconTop) iconTop.className = `fas ${icon}`;
        if (iconSide) iconSide.className = `fas ${icon}`;
        if (textSide) textSide.textContent = text;
        if (settingsToggle) {
            settingsToggle.className = `toggle ${isDark ? 'active' : ''}`;
        }
    }

    function loadTheme() {
        const saved = localStorage.getItem('safari_theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeUI(saved);
    }

    // ===== NAVIGATION =====
    function navigateTo(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`page-${page}`);
        if (target) target.classList.add('active');
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
        const navItem = document.querySelector(`.sidebar-nav .nav-item[data-page="${page}"]`);
        if (navItem) navItem.classList.add('active');
        currentPage = page;
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('open');
        }
        if (page === 'dashboard') updateDashboard();
        if (page === 'chat') initChat();
    }

    // ===== DASHBOARD =====
    function updateDashboard() {
        const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
        const email = currentUser?.email || 'user@safari.ai';

        const nameEl = document.getElementById('dashboardUserName');
        if (nameEl) nameEl.textContent = name;
        document.getElementById('statChats').textContent = stats.chats || 0;
        document.getElementById('statImages').textContent = stats.images || 0;
        document.getElementById('statCode').textContent = stats.code || 0;
        document.getElementById('statTasks').textContent = todos.filter(t => !t.done).length;

        document.getElementById('profChats').textContent = stats.chats || 0;
        document.getElementById('profImages').textContent = stats.images || 0;

        const avatar = document.getElementById('userAvatar');
        if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
        const profAvatar = document.getElementById('profileAvatar');
        if (profAvatar) profAvatar.textContent = name.charAt(0).toUpperCase();
        const profName = document.getElementById('profileName');
        if (profName) profName.textContent = name;
        const profEmail = document.getElementById('profileEmail');
        if (profEmail) profEmail.textContent = email;
    }

    // ===== FIREBASE AUTH =====
    function initFirebase() {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK not loaded. Social login disabled.');
            return false;
        }
        if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
            console.warn('⚠️ Firebase config not set. Social login disabled.');
            return false;
        }
        try {
            const app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            console.log('🔥 Firebase initialized!');
            return true;
        } catch (e) {
            console.warn('⚠️ Firebase init error:', e.message);
            return false;
        }
    }

    function handleAuthSuccess(user) {
        currentUser = user;
        const loginPage = document.getElementById('loginPage');
        const app = document.getElementById('app');
        if (loginPage) loginPage.classList.add('hidden');
        if (app) app.classList.remove('hidden');
        loadChatHistory();
        loadTheme();
        updateDashboard();
        navigateTo('dashboard');
        const name = user.displayName || user.email.split('@')[0];
        showToast(`👋 Welcome, ${name}!`);
    }

    function handleAuthError(error) {
        console.error('Auth error:', error);
        const msg = error.message || 'Authentication failed. Please try again.';
        showToast(`⚠️ ${msg}`);
    }

    // ----- EMAIL LOGIN (with auto-create) -----
    function loginWithEmail() {
        if (!auth) { showToast('🔐 Firebase not configured. Using demo login.'); return demoLogin(); }
        const email = document.getElementById('loginEmail')?.value?.trim() || '';
        const pass = document.getElementById('loginPassword')?.value?.trim() || '';
        if (!email || !pass) { showToast('Please enter email and password.'); return; }

        showToast('⏳ Logging in...');
        auth.signInWithEmailAndPassword(email, pass)
            .then(result => handleAuthSuccess(result.user))
            .catch(error => {
                if (error.code === 'auth/user-not-found') {
                    auth.createUserWithEmailAndPassword(email, pass)
                        .then(result => handleAuthSuccess(result.user))
                        .catch(handleAuthError);
                } else {
                    handleAuthError(error);
                }
            });
    }

    // ----- GOOGLE LOGIN (WORKING) -----
    function loginWithGoogle() {
        if (!auth) { showToast('🔑 Google login coming soon! Configure Firebase.'); return; }
        const provider = new firebase.auth.GoogleAuthProvider();
        showToast('⏳ Signing in with Google...');
        auth.signInWithPopup(provider)
            .then(result => handleAuthSuccess(result.user))
            .catch(handleAuthError);
    }

    // ----- GITHUB LOGIN (UNDER MAINTENANCE) -----
    function loginWithGitHub() {
        showToast('🔧 GitHub login is currently under maintenance. Please use Google or Email login.');
    }

    // ----- APPLE LOGIN (UNDER MAINTENANCE) -----
    function loginWithApple() {
        showToast('🍎 Apple login is currently under maintenance. Please use Google or Email login.');
    }

    // ----- DEMO LOGIN (Fallback) -----
    function demoLogin() {
        const email = 'demo@safari.ai';
        currentUser = {
            displayName: 'Demo User',
            email: email,
            uid: 'demo_' + Date.now()
        };
        handleAuthSuccess(currentUser);
    }

    // ----- CHECK SESSION -----
    function checkSession() {
        if (auth && auth.currentUser) {
            handleAuthSuccess(auth.currentUser);
            return true;
        }
        const saved = localStorage.getItem('safari_user');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (Date.now() - data.loginTime < 86400000 * 30) {
                    currentUser = data;
                    const loginPage = document.getElementById('loginPage');
                    const app = document.getElementById('app');
                    if (loginPage) loginPage.classList.add('hidden');
                    if (app) app.classList.remove('hidden');
                    loadChatHistory();
                    loadTheme();
                    updateDashboard();
                    navigateTo('dashboard');
                    return true;
                }
            } catch (e) { localStorage.removeItem('safari_user'); }
        }
        return false;
    }

    // ----- LOGOUT -----
    function logout() {
        if (!confirm('Logout?')) return;
        if (auth) {
            auth.signOut().catch(() => {});
        }
        localStorage.removeItem('safari_user');
        currentUser = null;
        const app = document.getElementById('app');
        const loginPage = document.getElementById('loginPage');
        if (app) app.classList.add('hidden');
        if (loginPage) loginPage.classList.remove('hidden');
        showToast('👋 Logged out.');
    }

    // ===== CHAT HELPERS =====
    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function parseMarkdown(text) {
        let html = text;
        html = html.replace(/<script/gi, '&lt;script');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/```([\s\S]*?)```/g, (_, code) =>
            `<pre style="background:rgba(0,0,0,0.05);padding:10px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:13px;">${code}</pre>`
        );
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.05);padding:2px 6px;border-radius:4px;">$1</code>');
        html = html.replace(/\n/g, '<br />');

        const lower = html.toLowerCase();
        if (lower.includes('who is your owner') || lower.includes('who created you') ||
            lower.includes('your creator') || lower.includes('who made you')) {
            html =
                `🦁 <strong>I was created by ${OWNER.name} from ${OWNER.company}!</strong><br /><br />📞 Contact: ${OWNER.phone1} / ${OWNER.phone2}<br />📢 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;">Join our WhatsApp Channel</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        }
        if (lower.includes('channel link') || lower.includes('whatsapp channel') || lower.includes('join channel')) {
            html =
                `📢 <strong>Join our official WhatsApp Channel!</strong><br /><br />🔗 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">${OWNER.channel}</a><br /><br />Stay updated with the latest AI features and news! 🚀<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        }
        return html;
    }

    function scrollChat() {
        const container = document.getElementById('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }

    function showToast(msg) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = msg;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
        }, 3000);
        setTimeout(() => toast.remove(), 3500);
    }

    // ===== CHAT HISTORY =====
    function saveChatHistory() {
        localStorage.setItem('safari_chat_history', JSON.stringify(chatHistory));
    }

    function loadChatHistory() {
        const data = localStorage.getItem('safari_chat_history');
        if (data) {
            try { chatHistory = JSON.parse(data); } catch (e) { chatHistory = []; }
        }
        if (chatHistory.length === 0) createNewChat();
    }

    function createNewChat() {
        const id = 'chat_' + Date.now();
        const chat = { id, title: 'New Chat', messages: [], created: Date.now() };
        chatHistory.unshift(chat);
        currentChatId = id;
        saveChatHistory();
        renderChatHistory();
        loadChatMessages(id);
        const input = document.getElementById('chatInput');
        if (input) { input.value = '';
            input.focus(); }
    }

    function renderChatHistory() {
        const container = document.getElementById('chatHistoryList');
        if (!container) return;
        if (chatHistory.length === 0) {
            container.innerHTML =
                '<div style="padding:12px;color:var(--text-secondary);font-size:13px;text-align:center;">No chats yet.<br>Start a new conversation!</div>';
            return;
        }
        let html = '';
        chatHistory.forEach(chat => {
            const active = chat.id === currentChatId ? 'active' : '';
            const preview = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content.slice(0, 50) ||
                '...' : 'Empty chat';
            html +=
                `<div class="chat-history-item ${active}" data-id="${chat.id}"><div class="cht-title">${escapeHtml(chat.title || 'New Chat')}</div><div class="cht-preview">${escapeHtml(preview)}</div></div>`;
        });
        container.innerHTML = html;
        container.querySelectorAll('.chat-history-item').forEach(el => {
            el.addEventListener('click', function() {
                currentChatId = this.dataset.id;
                renderChatHistory();
                loadChatMessages(currentChatId);
            });
        });
    }

    function loadChatMessages(chatId) {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        const chat = chatHistory.find(c => c.id === chatId);
        if (!chat) {
            container.innerHTML =
                '<div class="chat-msg assistant"><div class="msg-avatar">🦁</div><div class="msg-bubble"><div class="msg-label">SAFARI AI</div><div class="msg-content">Start a new chat!</div></div></div>';
            return;
        }
        container.innerHTML = '';
        if (chat.messages.length === 0) {
            container.innerHTML =
                `<div class="chat-msg assistant"><div class="msg-avatar">🦁</div><div class="msg-bubble"><div class="msg-label">SAFARI AI</div><div class="msg-content">👋 Hello! I\'m Safari AI. How can I help you today?</div><div class="msg-time">Just now</div></div></div>`;
            return;
        }
        chat.messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `chat-msg ${msg.role}`;
            const avatar = msg.role === 'user' ? '👤' : '🦁';
            const label = msg.role === 'user' ? 'You' : 'SAFARI AI';
            let actions = '';
            if (msg.role === 'assistant') {
                actions =
                    `<div class="msg-actions"><button class="copy-msg"><i class="fas fa-copy"></i> Copy</button><button class="speak-msg"><i class="fas fa-volume-up"></i> Speak</button></div>`;
            }
            div.innerHTML = `<div class="msg-avatar">${avatar}</div><div class="msg-bubble"><div class="msg-label">${label}</div><div class="msg-content">${parseMarkdown(msg.content)}</div><div class="msg-time">${msg.time || 'Just now'}</div>${actions}</div>`;
            container.appendChild(div);
        });

        container.querySelectorAll('.copy-msg').forEach(btn => {
            btn.addEventListener('click', function() {
                const bubble = this.closest('.msg-bubble');
                const content = bubble.querySelector('.msg-content');
                if (content) {
                    const text = content.textContent;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(() => showToast('📋 Copied!'));
                    } else {
                        const range = document.createRange();
                        range.selectNode(content);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(range);
                        document.execCommand('copy');
                        showToast('📋 Copied!');
                    }
                }
            });
        });

        container.querySelectorAll('.speak-msg').forEach(btn => {
            btn.addEventListener('click', function() {
                const bubble = this.closest('.msg-bubble');
                const content = bubble.querySelector('.msg-content');
                if (content && 'speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(content.textContent);
                    utterance.rate = 1.0;
                    window.speechSynthesis.speak(utterance);
                    showToast('🔊 Speaking...');
                } else {
                    showToast('⚠️ Speech not supported.');
                }
            });
        });
        scrollChat();
    }

    function addChatMessage(role, content) {
        const chat = chatHistory.find(c => c.id === currentChatId);
        if (!chat) return;
        const msg = {
            role,
            content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        chat.messages.push(msg);
        chat.updated = Date.now();
        if (chat.messages.length === 1 && role === 'user') {
            chat.title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
        }
        saveChatHistory();
        renderChatHistory();
        loadChatMessages(currentChatId);
        if (role === 'user') {
            stats.chats = (stats.chats || 0) + 1;
            localStorage.setItem('safari_stats', JSON.stringify(stats));
            updateDashboard();
        }
        scrollChat();
    }

    // ===== FETCH WITH TIMEOUT =====
    function fetchWithTimeout(url, options = {}, timeout = CONFIG.TIMEOUT) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        return fetch(url, { ...options, signal: controller.signal })
            .then(response => { clearTimeout(id); return response; })
            .catch(error => { clearTimeout(id); throw error; });
    }

    // ===== DIRECT COMMAND HANDLER =====
    function handleDirectCommand(text) {
        const lower = text.toLowerCase().trim();

        if (lower.includes('who is your owner') || lower.includes('who created you') ||
            lower.includes('your creator') || lower.includes('who made you') || lower.includes('about safari ai')) {
            return {
                reply:
                    `🦁 <strong>I am Safari AI, created by ${OWNER.name} from ${OWNER.company}!</strong><br /><br />📞 Contact: ${OWNER.phone1} / ${OWNER.phone2}<br />📢 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;">Join our WhatsApp Channel</a><br /><br />🌍 <strong>About Safari AI:</strong> I am an all-in-one AI platform built to help you with chat, coding, image generation, writing, business tools, and much more. I'm powered by cutting-edge AI technology and designed to be your ultimate digital assistant.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
            };
        }

        if (lower.includes('channel link') || lower.includes('whatsapp channel') || lower.includes('join channel')) {
            return {
                reply:
                    `📢 <strong>Join our official WhatsApp Channel!</strong><br /><br />🔗 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">${OWNER.channel}</a><br /><br />Stay updated with the latest AI features, news, and announcements! 🚀<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
            };
        }

        return null;
    }

    // ===== ASYNC HANDLERS (Weather, Safari Search) =====
    async function handleAsyncCommand(text) {
        const lower = text.toLowerCase().trim();

        // WEATHER: "weather London" or "weather Harare"
        const weatherMatch = lower.match(/^(weather|temperature|temp)\s+(.+)/i);
        if (weatherMatch) {
            const city = weatherMatch[2].trim();
            try {
                const resp = await fetchWithTimeout(`${CONFIG.WEATHER_API}/${encodeURIComponent(city)}?format=j1`);
                if (!resp.ok) throw new Error('City not found');
                const data = await resp.json();
                const current = data.current_condition[0];
                return {
                    reply:
                        `🌤️ <strong>Weather in ${city}</strong><br />🌡️ Temp: <strong>${current.temp_C}°C</strong> (feels like ${current.FeelsLikeC}°C)<br />☁️ ${current.weatherDesc[0].value}<br />💨 Wind: ${current.windSpeedKmph} km/h | 💧 Humidity: ${current.humidity}%<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
                };
            } catch (e) {
                return {
                    reply:
                        `⚠️ Could not find weather for "${city}". Try a major city name.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
                };
            }
        }

        // SAFARI SEARCH: "safari search Zimbabwe" or "safari search AI"
        const searchMatch = lower.match(/safari\s+search\s+(.+)/i);
        if (searchMatch) {
            const query = searchMatch[1].trim();
            try {
                const resp = await fetchWithTimeout(`${CONFIG.WIKI_API}${encodeURIComponent(query)}`);
                if (!resp.ok) throw new Error('Not found');
                const data = await resp.json();
                if (data.extract) {
                    return {
                        reply:
                            `🔍 <strong>${data.title}</strong><br />${data.extract}<br /><br />📖 <a href="${data.content_urls?.desktop?.page || '#'}" target="_blank" style="color:var(--accent);">Read more on Wikipedia</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
                    };
                } else {
                    return {
                        reply:
                            `❌ No summary found for "${query}". Please try a different search term.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
                    };
                }
            } catch (e) {
                return {
                    reply:
                        `⚠️ Could not search for "${query}". Please check your spelling and try again.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
                };
            }
        }

        return null;
    }

    // ===== SEND CHAT MESSAGE =====
    async function sendChatMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text || isProcessing) return;
        input.value = '';
        isProcessing = true;

        addChatMessage('user', text);

        const container = document.getElementById('chatMessages');
        if (!container) return;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-msg assistant';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML =
            `<div class="msg-avatar">🦁</div><div class="msg-bubble"><div class="msg-label">SAFARI AI</div><div class="msg-content"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>`;
        container.appendChild(typingDiv);
        scrollChat();

        try {
            // 1. Direct commands (owner, channel)
            const directReply = handleDirectCommand(text);
            if (directReply) {
                document.getElementById('typingIndicator')?.remove();
                addChatMessage('assistant', directReply.reply);
                isProcessing = false;
                return;
            }

            // 2. Async commands (weather, safari search)
            const asyncReply = await handleAsyncCommand(text);
            if (asyncReply) {
                document.getElementById('typingIndicator')?.remove();
                addChatMessage('assistant', asyncReply.reply);
                isProcessing = false;
                return;
            }

            // 3. AI API calls
            const personaSelect = document.getElementById('chatPersona');
            const persona = personaSelect ? personaSelect.value : 'general';
            const personaMap = {
                general: 'friendly assistant',
                programmer: 'senior software engineer',
                teacher: 'patient teacher',
                business: 'business consultant',
                creative: 'creative writer',
                translator: 'professional translator'
            };
            const context =
                `You are Safari AI, a ${personaMap[persona] || 'friendly assistant'}. Be helpful. End with "POWERED BY ICEBACK MASTER TECH".`;

            let reply = '';
            let apiSuccess = false;

            // Try Primary API
            try {
                const response = await fetchWithTimeout(CONFIG.CHAT_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        context,
                        history: chatHistory.find(c => c.id === currentChatId)?.messages?.slice(-6) || []
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    reply = data.response || data.message || data.reply || data.text || data.content || data.result || '';
                    if (reply) apiSuccess = true;
                }
            } catch (e) { console.warn('Primary API failed:', e); }

            // Try Fallback API
            if (!apiSuccess) {
                try {
                    const response = await fetchWithTimeout(CONFIG.FALLBACK_API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: text, context })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        reply = data.response || data.message || data.reply || data.text || data.content || data.result || '';
                        if (reply) apiSuccess = true;
                    }
                } catch (e) { console.warn('Fallback API failed:', e); }
            }

            // 4. Smart Fallback (if all APIs failed)
            if (!apiSuccess || !reply) {
                const lowerText = text.toLowerCase();
                if (lowerText.includes('joke')) {
                    const jokes = [
                        'Why do programmers prefer dark mode? Light attracts bugs! 🐛',
                        'What do you call a fake noodle? An *impasta*! 🍝',
                        'Why did the AI break up with the human? Too many bugs in the relationship! 🤖'
                    ];
                    reply = jokes[Math.floor(Math.random() * jokes.length)] +
                        '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
                } else if (lowerText.includes('football') || lowerText.includes('match')) {
                    reply =
                        '⚽ <strong>Today\'s Top Matches:</strong><br />• Liverpool 3 - 1 Arsenal<br />• Man City 2 - 2 Chelsea<br />• Barcelona 4 - 0 Real Madrid<br />🔮 Prediction: Liverpool to win the league!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
                } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
                    reply =
                        '👋 Hello there! I\'m Safari AI, your all-in-one assistant. How can I make you smile today? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
                } else {
                    reply =
                        '🤔 I\'m Safari AI. I can help with: <br />• "weather London" (get weather)<br />• "safari search Einstein" (search Wikipedia)<br />• "who is your owner" (about me)<br />• "channel link" (join WhatsApp)<br />• "generate image of a cat" (AI art)<br />• "tell me a joke"<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
                }
            }

            document.getElementById('typingIndicator')?.remove();
            addChatMessage('assistant', reply);

        } catch (e) {
            document.getElementById('typingIndicator')?.remove();
            addChatMessage('assistant',
                '⚠️ Sorry, I encountered an error. Please try again.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
            console.error('Chat error:', e);
        }

        isProcessing = false;
    }

    // ===== IMAGE GENERATION =====
    async function generateImage() {
        const promptInput = document.getElementById('imagePrompt');
        const prompt = promptInput ? promptInput.value.trim() : '';
        if (!prompt) { showToast('Please describe the image.'); return; }
        const styleSelect = document.getElementById('imageStyle');
        const style = styleSelect ? styleSelect.value : 'realistic';
        const fullPrompt = `${prompt}, ${style} style, high quality`;
        const url = `${CONFIG.IMAGE_API}/${encodeURIComponent(fullPrompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;

        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.innerHTML =
                `<div style="padding:20px;text-align:center;color:var(--text-secondary);"><div class="typing-dots"><span></span><span></span><span></span></div><p style="margin-top:8px;">Generating...</p></div>`;
        }

        await new Promise(r => setTimeout(r, 1200));

        if (preview) {
            preview.innerHTML =
                `<img src="${url}" alt="${escapeHtml(prompt)}" style="max-width:100%;max-height:350px;border-radius:12px;" />`;
        }

        stats.images = (stats.images || 0) + 1;
        localStorage.setItem('safari_stats', JSON.stringify(stats));
        updateDashboard();
        showToast('✅ Image generated!');
    }

    // ===== VOICE INPUT =====
    function initVoice() {
        const voiceBtn = document.getElementById('voiceChatBtn');
        const sttBtn = document.getElementById('sttRecordBtn');
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            if (voiceBtn) voiceBtn.style.display = 'none';
            if (sttBtn) sttBtn.style.display = 'none';
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        sttRecognition = new SpeechRecognition();
        sttRecognition.lang = 'en-US';
        sttRecognition.continuous = false;
        sttRecognition.interimResults = true;

        if (voiceBtn) {
            let isVoiceRecording = false;
            voiceBtn.addEventListener('click', function() {
                if (isVoiceRecording) { sttRecognition.stop();
                    isVoiceRecording = false;
                    this.style.color = 'var(--text-secondary)'; return; }
                try {
                    sttRecognition.start();
                    isVoiceRecording = true;
                    this.style.color = '#ef4444';
                    showToast('🎤 Listening...');
                } catch (e) { showToast('⚠️ Microphone access needed.'); }
            });
        }

        sttRecognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    const input = document.getElementById('chatInput');
                    if (input) { input.value = transcript;
                        sendChatMessage(); }
                    const voiceBtn2 = document.getElementById('voiceChatBtn');
                    if (voiceBtn2) { voiceBtn2.style.color = 'var(--text-secondary)'; }
                }
            }
            const sttResult = document.getElementById('sttResult');
            if (sttResult) sttResult.textContent = '📝 ' + transcript;
        };

        sttRecognition.onerror = function() {
            const voiceBtn2 = document.getElementById('voiceChatBtn');
            if (voiceBtn2) voiceBtn2.style.color = 'var(--text-secondary)';
            showToast('⚠️ Voice recognition error.');
        };

        sttRecognition.onend = function() {
            const voiceBtn2 = document.getElementById('voiceChatBtn');
            if (voiceBtn2) voiceBtn2.style.color = 'var(--text-secondary)';
            isRecording = false;
        };

        // STT button in Audio Studio
        if (sttBtn) {
            sttBtn.addEventListener('click', function() {
                if (!sttRecognition) { showToast('⚠️ Speech recognition not available.'); return; }
                if (isRecording) { sttRecognition.stop();
                    isRecording = false;
                    this.innerHTML = '<i class="fas fa-microphone"></i> Start Recording'; return; }
                try {
                    sttRecognition.start();
                    isRecording = true;
                    this.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Recording';
                    const result = document.getElementById('sttResult');
                    if (result) result.textContent = '🎤 Listening... Speak now.';
                } catch (e) { showToast('⚠️ Please allow microphone access.'); }
            });
        }
    }

    // ===== INIT =====
    function init() {
        console.log('🦁 SAFARI AI: Initializing...');

        // Firebase
        const firebaseReady = initFirebase();

        // Particles
        initParticles();

        // Voice
        initVoice();

        // Check session
        if (!checkSession()) {
            document.getElementById('welcomeScreen')?.classList.remove('hidden');
            document.getElementById('loginPage')?.classList.remove('hidden');
            document.getElementById('app')?.classList.add('hidden');
        } else {
            document.getElementById('welcomeScreen')?.classList.add('hidden');
            document.getElementById('loginPage')?.classList.add('hidden');
            document.getElementById('app')?.classList.remove('hidden');
        }

        // ===== EVENT BINDINGS =====

        // Welcome
        document.getElementById('welcomeGetStarted')?.addEventListener('click', function() {
            document.getElementById('welcomeScreen')?.classList.add('hidden');
            document.getElementById('loginPage')?.classList.remove('hidden');
        });

        // Email Login
        document.getElementById('loginBtn')?.addEventListener('click', loginWithEmail);
        document.getElementById('loginPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') loginWithEmail(); });
        document.getElementById('loginEmail')?.addEventListener('keydown', e => { if (e.key === 'Enter') loginWithEmail(); });

        // Social Logins
        document.getElementById('googleLogin')?.addEventListener('click', loginWithGoogle);
        document.getElementById('githubLogin')?.addEventListener('click', loginWithGitHub);
        document.getElementById('appleLogin')?.addEventListener('click', loginWithApple);

        // Password toggle
        document.getElementById('togglePassword')?.addEventListener('click', function() {
            const input = document.getElementById('loginPassword');
            if (input) {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' :
                    '<i class="fas fa-eye-slash"></i>';
            }
        });

        // Forgot password
        document.getElementById('forgotPassword')?.addEventListener('click', function(e) {
            e.preventDefault();
            if (auth) {
                const email = document.getElementById('loginEmail')?.value?.trim();
                if (email) {
                    auth.sendPasswordResetEmail(email).then(() => showToast('📧 Password reset email sent!'))
                        .catch(() => showToast('⚠️ Enter your email address first.'));
                } else {
                    showToast('⚠️ Please enter your email address.');
                }
            } else {
                showToast('📧 Password reset link would be sent to your email.');
            }
        });

        // Create account
        document.getElementById('createAccountLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('📝 Use the email/password fields above and click Login to create an account automatically!');
        });

        // Theme
        document.getElementById('themeToggleTop')?.addEventListener('click', toggleTheme);
        document.getElementById('themeToggleSidebar')?.addEventListener('click', toggleTheme);
        document.getElementById('themeToggleSettings')?.addEventListener('click', toggleTheme);

        // Menu
        const menuBtn = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
            document.addEventListener('click', e => {
                if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }

        // Notifications
        document.getElementById('notifBtn')?.addEventListener('click', function() {
            document.getElementById('notifPanel')?.classList.toggle('open');
        });
        document.getElementById('closeNotifBtn')?.addEventListener('click', function() {
            document.getElementById('notifPanel')?.classList.remove('open');
        });
        document.addEventListener('click', function(e) {
            const panel = document.getElementById('notifPanel');
            const btn = document.getElementById('notifBtn');
            if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
                panel.classList.remove('open');
            }
        });

        // Global search
        document.getElementById('globalSearch')?.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const q = this.value.trim().toLowerCase();
                if (!q) return;
                const pages = ['chat', 'image', 'video', 'audio', 'code', 'writing', 'documents', 'business',
                    'profile', 'settings'
                ];
                let found = false;
                for (const p of pages) {
                    if (p.includes(q) || q.includes(p)) { navigateTo(p);
                        found = true; break; }
                }
                if (!found) showToast(`🔍 No match for "${q}"`);
                this.value = '';
            }
        });

        // Sidebar nav
        document.querySelectorAll('.sidebar-nav .nav-item[data-page]').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.dataset.page;
                const validPages = ['dashboard', 'chat', 'image', 'video', 'audio', 'code', 'writing',
                    'documents', 'business', 'projects', 'history', 'downloads', 'profile', 'settings'
                ];
                if (validPages.includes(page)) navigateTo(page);
            });
        });

        // Quick cards
        document.querySelectorAll('.quick-card[data-action]').forEach(card => {
            card.addEventListener('click', function() {
                const action = this.dataset.action;
                const map = {
                    chat: 'chat',
                    image: 'image',
                    'edit-image': 'image',
                    video: 'video',
                    audio: 'audio',
                    code: 'code',
                    writing: 'writing',
                    documents: 'documents',
                    business: 'business',
                    invoice: 'business',
                    'business-plan': 'business',
                    marketing: 'business',
                    'product-desc': 'business'
                };
                if (map[action]) navigateTo(map[action]);
                else showToast(`🚀 ${action} feature coming soon!`);
            });
        });

        // Chat
        document.getElementById('chatSendBtn')?.addEventListener('click', sendChatMessage);
        document.getElementById('chatInput')?.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault();
                sendChatMessage(); }
        });
        document.getElementById('newChatBtn')?.addEventListener('click', createNewChat);

        // Attach file
        document.getElementById('attachFileBtn')?.addEventListener('click', function() {
            document.getElementById('chatFileInput')?.click();
        });
        document.getElementById('chatFileInput')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const input = document.getElementById('chatInput');
                if (input) input.value = `📎 Attached: ${file.name}. Please analyze.`;
                this.value = '';
                showToast('📎 File attached!');
            }
        });

        // Image generation
        document.getElementById('generateImageBtn')?.addEventListener('click', generateImage);
        document.getElementById('imagePrompt')?.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') generateImage();
        });

        // Image drop zone
        const dropZone = document.getElementById('imageDropZone');
        const imgUpload = document.getElementById('imageUpload');
        if (dropZone && imgUpload) {
            dropZone.addEventListener('click', () => imgUpload.click());
            dropZone.addEventListener('dragover', e => { e.preventDefault();
                dropZone.style.borderColor = 'var(--accent)'; });
            dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = 'var(--border)');
            dropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = 'var(--border)';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) handleImageUpload(file);
            });
            imgUpload.addEventListener('change', function(e) {
                if (this.files[0]) handleImageUpload(this.files[0]);
            });
        }

        function handleImageUpload(file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const preview = document.getElementById('uploadPreview');
                const img = document.getElementById('uploadPreviewImg');
                if (preview && img) {
                    preview.style.display = 'block';
                    img.src = ev.target.result;
                    showToast('📸 Image uploaded!');
                    const prompt = document.getElementById('imagePrompt');
                    if (prompt) prompt.value = `Edit this image: ${file.name}`;
                }
            };
            reader.readAsDataURL(file);
        }

        // Tool chips
        document.querySelectorAll('.tool-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                showToast(`🔧 ${this.textContent.trim()} coming soon!`);
            });
        });

        // TTS
        document.getElementById('ttsCard')?.addEventListener('click', function() {
            const panel = document.getElementById('ttsPanel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        document.getElementById('ttsPlayBtn')?.addEventListener('click', function() {
            const text = document.getElementById('ttsText')?.value || 'Hello, I am Safari AI.';
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                window.speechSynthesis.speak(utterance);
                showToast('🔊 Speaking...');
            } else showToast('⚠️ Speech not supported.');
        });

        // STT card
        document.getElementById('sttCard')?.addEventListener('click', function() {
            const panel = document.getElementById('sttPanel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        // Code generation
        document.getElementById('codeGenerateBtn')?.addEventListener('click', async function() {
            const lang = document.getElementById('codeLanguage')?.value || 'javascript';
            const action = document.getElementById('codeAction')?.value || 'generate';
            const input = document.getElementById('codeInput')?.value?.trim();
            if (!input) { showToast('Please describe what code you need.'); return; }
            const output = document.getElementById('codeOutput');
            if (output) { output.textContent = '⏳ Generating...';
                output.style.color = 'var(--text-secondary)'; }
            try {
                const prompt = `${action} ${lang} code for: ${input}. Provide clean, well-commented code.`;
                const resp = await fetchWithTimeout(CONFIG.FALLBACK_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: prompt })
                });
                let code = '';
                if (resp.ok) {
                    const data = await resp.json();
                    code = data.response || data.message || data.reply || '';
                }
                if (!code) {
                    code =
                        `// Generated ${lang} code for: ${input}\n// Action: ${action}\n\n// Your code would appear here.\n// Please try again with a more specific request.`;
                }
                if (output) { output.textContent = code;
                    output.style.color = 'var(--text-primary)'; }
                stats.code = (stats.code || 0) + 1;
                localStorage.setItem('safari_stats', JSON.stringify(stats));
                updateDashboard();
                showToast('✅ Code generated!');
            } catch (e) {
                if (output) { output.textContent = `// Error: ${e.message}`;
                    output.style.color = '#ef4444'; }
                showToast('⚠️ Error generating code.');
            }
        });

        // Copy code
        document.getElementById('copyCodeBtn')?.addEventListener('click', function() {
            const output = document.getElementById('codeOutput');
            if (output) {
                const text = output.textContent;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => showToast('✅ Code copied!'));
                } else {
                    const range = document.createRange();
                    range.selectNode(output);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                    document.execCommand('copy');
                    showToast('✅ Code copied!');
                }
            }
        });

        // Writing generation
        document.getElementById('writingGenerateBtn')?.addEventListener('click', async function() {
            const type = document.getElementById('writingType')?.value || 'essay';
            const input = document.getElementById('writingInput')?.value?.trim();
            if (!input) { showToast('Please describe what you want to write.'); return; }
            const output = document.getElementById('writingOutput');
            if (output) { output.textContent = '✍️ Writing...';
                output.style.color = 'var(--text-secondary)'; }
            const typeLabels = {
                essay: 'Write an essay on',
                story: 'Write a creative story about',
                email: 'Write a professional email about',
                grammar: 'Fix the grammar of:',
                resume: 'Create a resume for:',
                proposal: 'Write a business proposal for:',
                caption: 'Write social media captions for:',
                blog: 'Write a blog post about:',
                translate: 'Translate this to English:'
            };
            try {
                const prompt = `${typeLabels[type] || 'Write about'} ${input}`;
                const resp = await fetchWithTimeout(CONFIG.FALLBACK_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: prompt })
                });
                let content = '';
                if (resp.ok) {
                    const data = await resp.json();
                    content = data.response || data.message || data.reply || '';
                }
                if (!content) {
                    content =
                        `[${type}] - Content would appear here.\n\nTopic: ${input}\n\nPlease try again with a more specific request.`;
                }
                if (output) { output.textContent = content;
                    output.style.color = 'var(--text-primary)'; }
                showToast('✅ Content generated!');
            } catch (e) {
                if (output) { output.textContent = `⚠️ Error: ${e.message}`;
                    output.style.color = '#ef4444'; }
                showToast('⚠️ Error generating content.');
            }
        });

        // Copy writing
        document.getElementById('copyWritingBtn')?.addEventListener('click', function() {
            const output = document.getElementById('writingOutput');
            if (output) {
                const text = output.textContent;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => showToast('✅ Content copied!'));
                } else {
                    const range = document.createRange();
                    range.selectNode(output);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                    document.execCommand('copy');
                    showToast('✅ Content copied!');
                }
            }
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', logout);

        // Settings toggles
        document.querySelectorAll('.settings-group .toggle:not(#themeToggleSettings)').forEach(toggle => {
            toggle.addEventListener('click', function() {
                this.classList.toggle('active');
                const label = this.closest('.setting-row')?.querySelector('.title');
                if (label) showToast(`⚙️ ${label.textContent} toggled!`);
            });
        });

        // Keyboard shortcut: Ctrl+K
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('globalSearch')?.focus();
            }
        });

        console.log('🦁 SAFARI AI: Initialization complete!');
        console.log(`👤 Owner: ${OWNER.name}`);
        console.log(`📢 Channel: ${OWNER.channel}`);
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

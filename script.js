// ================================================================
// SAFARI AI – COMPLETE PLATFORM SCRIPT
// All features: Chat, Image, Video, Audio, Coding, Writing,
// Documents, Business, Productivity, Tools, Dashboard
// ================================================================

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
    };

    // ===== DOM REFS =====
    const $ = id => document.getElementById(id);
    const welcomeScreen = $('welcomeScreen');
    const loginPage = $('loginPage');
    const app = $('app');
    const sidebar = $('sidebar');
    const menuToggle = $('menuToggle');
    const notifBtn = $('notifBtn');
    const notifPanel = $('notifPanel');
    const closeNotifBtn = $('closeNotifBtn');
    const themeToggleTop = $('themeToggleTop');
    const themeToggleSidebar = $('themeToggleSidebar');
    const themeToggleSettings = $('themeToggleSettings');
    const themeIconTop = $('themeIconTop');
    const themeIconSidebar = $('themeIconSidebar');
    const themeTextSidebar = $('themeTextSidebar');
    const logoutBtn = $('logoutBtn');
    const globalSearch = $('globalSearch');
    const userAvatar = $('userAvatar');

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

    // ===== PARTICLES =====
    function initParticles() {
        const canvas = document.getElementById('particlesCanvas');
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
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(79, 70, 229, ${0.08 * (1 - dist/120)})`;
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
        [themeIconTop, themeIconSidebar].forEach(el => { if (el) el.className = `fas ${icon}`; });
        if (themeTextSidebar) themeTextSidebar.textContent = text;
        if (themeToggleSettings) {
            themeToggleSettings.className = `toggle ${isDark ? 'active' : ''}`;
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
        const target = $(`page-${page}`);
        if (target) target.classList.add('active');
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
        const navItem = document.querySelector(`.sidebar-nav .nav-item[data-page="${page}"]`);
        if (navItem) navItem.classList.add('active');
        currentPage = page;
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
        if (page === 'dashboard') updateDashboard();
        if (page === 'chat') initChat();
    }

    // ===== DASHBOARD =====
    function updateDashboard() {
        const name = currentUser?.identifier || 'User';
        $('dashboardUserName').textContent = name;
        $('statChats').textContent = stats.chats || 0;
        $('statImages').textContent = stats.images || 0;
        $('statCode').textContent = stats.code || 0;
        $('statTasks').textContent = todos.filter(t => !t.done).length;
        $('profChats').textContent = stats.chats || 0;
        $('profImages').textContent = stats.images || 0;
        userAvatar.textContent = name.charAt(0).toUpperCase();
        const avatarEl = $('profileAvatar');
        if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
        const nameEl = $('profileName');
        if (nameEl) nameEl.textContent = name;
    }

    // ===== CHAT =====
    function initChat() {
        renderChatHistory();
        if (!currentChatId && chatHistory.length > 0) {
            currentChatId = chatHistory[0].id;
            loadChatMessages(currentChatId);
        } else if (!currentChatId) {
            createNewChat();
        }
    }

    function createNewChat() {
        const id = 'chat_' + Date.now();
        const chat = { id, title: 'New Chat', messages: [], created: Date.now() };
        chatHistory.unshift(chat);
        currentChatId = id;
        saveChatHistory();
        renderChatHistory();
        loadChatMessages(id);
        $('chatInput').value = '';
        $('chatInput').focus();
    }

    function renderChatHistory() {
        const container = $('chatHistoryList');
        if (!container) return;
        if (chatHistory.length === 0) {
            container.innerHTML =
                '<div style="padding:12px;color:var(--text-secondary);font-size:13px;text-align:center;">No chats yet.<br>Start a new conversation!</div>';
            return;
        }
        container.innerHTML = chatHistory.map(chat => `
            <div class="chat-history-item ${chat.id === currentChatId ? 'active' : ''}" data-id="${chat.id}">
                <div class="cht-title">${escapeHtml(chat.title || 'New Chat')}</div>
                <div class="cht-preview">${chat.messages.length > 0 ? escapeHtml(chat.messages[chat.messages.length-1].content?.slice(0,50) || '...') : 'Empty chat'}</div>
            </div>
        `).join('');
        container.querySelectorAll('.chat-history-item').forEach(el => {
            el.addEventListener('click', () => {
                currentChatId = el.dataset.id;
                renderChatHistory();
                loadChatMessages(currentChatId);
            });
        });
    }

    function loadChatMessages(chatId) {
        const container = $('chatMessages');
        if (!container) return;
        const chat = chatHistory.find(c => c.id === chatId);
        if (!chat) { container.innerHTML =
                '<div class="chat-msg assistant"><div class="msg-avatar">🦁</div><div class="msg-bubble"><div class="msg-label">SAFARI AI</div><div class="msg-content">Start a new chat!</div></div></div>';
            return; }
        container.innerHTML = '';
        if (chat.messages.length === 0) {
            container.innerHTML =
                `<div class="chat-msg assistant"><div class="msg-avatar">🦁</div><div class="msg-bubble"><div class="msg-label">SAFARI AI</div><div class="msg-content">👋 Hello! I'm Safari AI. How can I help you today?</div><div class="msg-time">Just now</div></div></div>`;
            return;
        }
        chat.messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `chat-msg ${msg.role}`;
            const avatar = msg.role === 'user' ? '👤' : '🦁';
            const label = msg.role === 'user' ? 'You' : 'SAFARI AI';
            div.innerHTML = `
                <div class="msg-avatar">${avatar}</div>
                <div class="msg-bubble">
                    <div class="msg-label">${label}</div>
                    <div class="msg-content">${parseMarkdown(msg.content)}</div>
                    <div class="msg-time">${msg.time || 'Just now'}</div>
                    ${msg.role === 'assistant' ? `<div class="msg-actions"><button class="copy-msg"><i class="fas fa-copy"></i> Copy</button><button class="speak-msg"><i class="fas fa-volume-up"></i> Speak</button></div>` : ''}
                </div>
            `;
            container.appendChild(div);
        });
        container.querySelectorAll('.copy-msg').forEach(btn => {
            btn.addEventListener('click', function() {
                const bubble = this.closest('.msg-bubble');
                const content = bubble.querySelector('.msg-content');
                if (content) {
                    navigator.clipboard.writeText(content.textContent).then(() => {
                        showToast('📋 Copied!');
                    }).catch(() => {
                        const range = document.createRange();
                        range.selectNode(content);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(range);
                        document.execCommand('copy');
                        showToast('📋 Copied!');
                    });
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
        const msg = { role, content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
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

    function scrollChat() {
        const container = $('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }

    function saveChatHistory() {
        localStorage.setItem('safari_chat_history', JSON.stringify(chatHistory));
    }

    function loadChatHistory() {
        const data = localStorage.getItem('safari_chat_history');
        if (data) { try { chatHistory = JSON.parse(data); } catch (e) { chatHistory = []; } }
        if (chatHistory.length === 0) createNewChat();
    }

    // ===== MARKDOWN =====
    function parseMarkdown(text) {
        let html = text;
        html = html.replace(/<script/gi, '&lt;script');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/```([\s\S]*?)```/g, function(m, c) {
            return '<pre style="background:rgba(0,0,0,0.05);padding:10px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:13px;">' +
                c + '</pre>';
        });
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.05);padding:2px 6px;border-radius:4px;">$1</code>');
        html = html.replace(/\n/g, '<br />');

        // OWNER INFO DETECTION
        if (html.toLowerCase().includes('who is your owner') || html.toLowerCase().includes('who created you') || html
            .toLowerCase().includes('your creator') || html.toLowerCase().includes('who made you')) {
            html =
                `🦁 <strong>I was created by ${OWNER.name} from ${OWNER.company}!</strong><br /><br />📞 Contact: ${OWNER.phone1} / ${OWNER.phone2}<br />📢 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;">Join our WhatsApp Channel</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        }
        if (html.toLowerCase().includes('channel link') || html.toLowerCase().includes('whatsapp channel') || html
            .toLowerCase().includes('join channel')) {
            html =
                `📢 <strong>Join our official WhatsApp Channel!</strong><br /><br />🔗 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">${OWNER.channel}</a><br /><br />Stay updated with the latest AI features and news! 🚀<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        }
        return html;
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    // ===== AI CHAT SEND =====
    async function sendChatMessage() {
        const input = $('chatInput');
        const text = input.value.trim();
        if (!text || isProcessing) return;
        input.value = '';
        isProcessing = true;

        addChatMessage('user', text);

        const container = $('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-msg assistant';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="msg-avatar">🦁</div>
            <div class="msg-bubble">
                <div class="msg-label">SAFARI AI</div>
                <div class="msg-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>
            </div>
        `;
        container.appendChild(typingDiv);
        scrollChat();

        try {
            const persona = $('chatPersona')?.value || 'general';
            const personaMap = {
                general: 'friendly assistant',
                programmer: 'senior software engineer',
                teacher: 'patient teacher',
                business: 'business consultant',
                creative: 'creative writer',
                translator: 'professional translator'
            };
            const context =
                `You are Safari AI, a ${personaMap[persona] || 'friendly assistant'}. Be helpful. End with "POWERED BY ICEBACK MASTER TECH". If asked who your owner is, say you were created by ICEBACK MASTER TECH from Safari Technology and give the WhatsApp channel link: ${OWNER.channel}.`;

            const response = await fetch(CONFIG.CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    context: context,
                    history: chatHistory.find(c => c.id === currentChatId)?.messages?.slice(-6) || []
                })
            });

            let reply = '';
            if (response.ok) {
                const data = await response.json();
                reply = data.response || data.message || data.reply || data.text || data.content || data.result || '';
            }

            if (!reply) {
                const fallback = await fetch(CONFIG.FALLBACK_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, context })
                });
                if (fallback.ok) {
                    const data = await fallback.json();
                    reply = data.response || data.message || data.reply || '';
                }
            }

            if (!reply) {
                const lower = text.toLowerCase();
                if (lower.includes('who is your owner') || lower.includes('who created you') || lower.includes(
                        'your creator') || lower.includes('who made you')) {
                    reply =
                        `🦁 I was created by <strong>${OWNER.name}</strong> from <strong>${OWNER.company}</strong>!<br /><br />📞 Contact: ${OWNER.phone1} / ${OWNER.phone2}<br />📢 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;">Join our WhatsApp Channel</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
                } else if (lower.includes('channel link') || lower.includes('whatsapp channel') || lower.includes(
                        'join channel')) {
                    reply =
                        `📢 <strong>Join our official WhatsApp Channel!</strong><br /><br />🔗 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">${OWNER.channel}</a><br /><br />Stay updated with the latest AI features and news! 🚀<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
                } else {
                    reply =
                        `🤔 I'm Safari AI. I'm here to help! Could you please rephrase your question?<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
                }
            }

            const typing = document.getElementById('typingIndicator');
            if (typing) typing.remove();
            addChatMessage('assistant', reply);

        } catch (e) {
            const typing = document.getElementById('typingIndicator');
            if (typing) typing.remove();
            addChatMessage('assistant',
                '⚠️ Sorry, I encountered an error. Please try again.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
            console.error('Chat error:', e);
        }

        isProcessing = false;
    }

    // ===== IMAGE GENERATION =====
    async function generateImage() {
        const prompt = $('imagePrompt')?.value?.trim();
        if (!prompt) { showToast('Please describe the image.'); return; }
        const style = $('imageStyle')?.value || 'realistic';
        const fullPrompt = `${prompt}, ${style} style, high quality`;
        const url =
            `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=512&height=512&nologo=true&seed=${Date.now()}`;

        const preview = $('imagePreview');
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

    // ===== TOAST =====
    function showToast(msg) {
        const container = $('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = msg;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s'; }, 3000);
        setTimeout(() => toast.remove(), 3500);
    }

    // ===== VOICE =====
    function initVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            document.querySelectorAll('#voiceChatBtn, #sttRecordBtn').forEach(b => { if (b) b.style.display = 'none'; });
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        sttRecognition = new SpeechRecognition();
        sttRecognition.lang = 'en-US';
        sttRecognition.continuous = false;
        sttRecognition.interimResults = true;

        const voiceBtn = $('voiceChatBtn');
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
                    const input = $('chatInput');
                    if (input) { input.value = transcript;
                        sendChatMessage(); }
                    const voiceBtn2 = $('voiceChatBtn');
                    if (voiceBtn2) { voiceBtn2.style.color = 'var(--text-secondary)'; }
                }
            }
            const sttResult = $('sttResult');
            if (sttResult) sttResult.textContent = '📝 ' + transcript;
        };

        sttRecognition.onerror = function() {
            const voiceBtn2 = $('voiceChatBtn');
            if (voiceBtn2) voiceBtn2.style.color = 'var(--text-secondary)';
            showToast('⚠️ Voice recognition error.');
        };

        sttRecognition.onend = function() {
            const voiceBtn2 = $('voiceChatBtn');
            if (voiceBtn2) voiceBtn2.style.color = 'var(--text-secondary)';
            isRecording = false;
        };
    }

    // ===== LOGIN =====
    function login() {
        const email = $('loginEmail')?.value?.trim() || 'demo@safari.ai';
        const pass = $('loginPassword')?.value?.trim() || 'password123';
        if (!email) { showToast('Please enter your email.'); return; }

        currentUser = { identifier: email, loginTime: Date.now() };
        localStorage.setItem('safari_user', JSON.stringify(currentUser));

        loginPage.classList.add('hidden');
        app.classList.remove('hidden');
        loadChatHistory();
        loadTheme();
        updateDashboard();
        navigateTo('dashboard');
        showToast(`👋 Welcome back, ${email.split('@')[0]}!`);
    }

    function checkSession() {
        const saved = localStorage.getItem('safari_user');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (Date.now() - data.loginTime < 86400000 * 30) {
                    currentUser = data;
                    loginPage.classList.add('hidden');
                    app.classList.remove('hidden');
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

    function logout() {
        if (!confirm('Logout?')) return;
        localStorage.removeItem('safari_user');
        currentUser = null;
        app.classList.add('hidden');
        loginPage.classList.remove('hidden');
        showToast('👋 Logged out.');
    }

    // ===== EVENT LISTENERS =====
    function initEventListeners() {
        // Welcome
        $('welcomeGetStarted').addEventListener('click', function() {
            welcomeScreen.classList.add('hidden');
            loginPage.classList.remove('hidden');
        });

        // Login
        $('loginBtn').addEventListener('click', login);
        $('loginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
        $('loginEmail').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

        // Password toggle
        const toggleEye = $('togglePassword');
        if (toggleEye) {
            toggleEye.addEventListener('click', function() {
                const input = $('loginPassword');
                if (input) {
                    const type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' :
                        '<i class="fas fa-eye-slash"></i>';
                }
            });
        }

        // Social logins
        ['googleLogin', 'appleLogin', 'githubLogin'].forEach(id => {
            const btn = $(id);
            if (btn) {
                btn.addEventListener('click', function() {
                    showToast(`🔐 ${this.id.replace('Login','')} login coming soon!`);
                });
            }
        });

        // Forgot password
        $('forgotPassword')?.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('📧 Password reset link sent to your email.');
        });

        // Create account
        $('createAccountLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('📝 Account creation coming soon!');
        });

        // Theme toggles
        themeToggleTop.addEventListener('click', toggleTheme);
        themeToggleSidebar.addEventListener('click', toggleTheme);
        if (themeToggleSettings) {
            themeToggleSettings.addEventListener('click', toggleTheme);
        }

        // Menu toggle
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });

        // Notifications
        notifBtn.addEventListener('click', function() {
            notifPanel.classList.toggle('open');
        });
        closeNotifBtn.addEventListener('click', function() {
            notifPanel.classList.remove('open');
        });

        // Global search
        globalSearch.addEventListener('keydown', function(e) {
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

        // Sidebar navigation
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
        $('chatSendBtn').addEventListener('click', sendChatMessage);
        $('chatInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault();
                sendChatMessage(); }
        });
        $('newChatBtn').addEventListener('click', createNewChat);

        // Attach file
        $('attachFileBtn').addEventListener('click', function() {
            $('chatFileInput').click();
        });
        $('chatFileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const input = $('chatInput');
                if (input) input.value = `📎 Attached: ${file.name}. Please analyze.`;
                this.value = '';
                showToast('📎 File attached!');
            }
        });

        // Image generation
        $('generateImageBtn').addEventListener('click', generateImage);
        $('imagePrompt').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') generateImage();
        });

        // Image drag & drop
        const dropZone = $('imageDropZone');
        if (dropZone) {
            dropZone.addEventListener('click', function() { $('imageUpload').click(); });
            dropZone.addEventListener('dragover', function(e) { e.preventDefault();
                this.style.borderColor = 'var(--accent)'; });
            dropZone.addEventListener('dragleave', function(e) { this.style.borderColor = 'var(--border)'; });
            dropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = 'var(--border)';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) handleImageUpload(file);
            });
            $('imageUpload').addEventListener('change', function(e) {
                if (this.files[0]) handleImageUpload(this.files[0]);
            });
        }

        function handleImageUpload(file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const preview = $('uploadPreview');
                const img = $('uploadPreviewImg');
                if (preview && img) {
                    preview.style.display = 'block';
                    img.src = ev.target.result;
                    showToast('📸 Image uploaded!');
                    const prompt = $('imagePrompt');
                    if (prompt) prompt.value = `Edit this image: ${file.name}`;
                }
            };
            reader.readAsDataURL(file);
        }

        // Image tool chips
        document.querySelectorAll('.tool-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                showToast(`🔧 ${this.textContent.trim()} coming soon!`);
            });
        });

        // TTS
        $('ttsCard')?.addEventListener('click', function() {
            const panel = $('ttsPanel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        $('ttsPlayBtn')?.addEventListener('click', function() {
            const text = $('ttsText')?.value || 'Hello, I am Safari AI.';
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                window.speechSynthesis.speak(utterance);
                showToast('🔊 Speaking...');
            } else showToast('⚠️ Speech not supported.');
        });

        // STT
        $('sttCard')?.addEventListener('click', function() {
            const panel = $('sttPanel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        const sttBtn = $('sttRecordBtn');
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
                    $('sttResult').textContent = '🎤 Listening... Speak now.';
                } catch (e) { showToast('⚠️ Please allow microphone access.'); }
            });
        }

        // Code generation
        $('codeGenerateBtn').addEventListener('click', async function() {
            const lang = $('codeLanguage')?.value || 'javascript';
            const action = $('codeAction')?.value || 'generate';
            const input = $('codeInput')?.value?.trim();
            if (!input) { showToast('Please describe what code you need.'); return; }
            const output = $('codeOutput');
            if (output) { output.textContent = '⏳ Generating...';
                output.style.color = 'var(--text-secondary)'; }
            try {
                const prompt = `${action} ${lang} code for: ${input}. Provide clean, well-commented code.`;
                const resp = await fetch(CONFIG.FALLBACK_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: prompt })
                });
                let code = '';
                if (resp.ok) { const data = await resp.json();
                    code = data.response || data.message || data.reply || ''; }
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
        $('copyCodeBtn').addEventListener('click', function() {
            const output = $('codeOutput');
            if (output) {
                navigator.clipboard.writeText(output.textContent).then(() => showToast('✅ Code copied!'))
                    .catch(() => { const r = document.createRange();
                        r.selectNode(output);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(r);
                        document.execCommand('copy');
                        showToast('✅ Code copied!'); });
            }
        });

        // Writing generation
        $('writingGenerateBtn').addEventListener('click', async function() {
            const type = $('writingType')?.value || 'essay';
            const input = $('writingInput')?.value?.trim();
            if (!input) { showToast('Please describe what you want to write.'); return; }
            const output = $('writingOutput');
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
                const resp = await fetch(CONFIG.FALLBACK_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: prompt })
                });
                let content = '';
                if (resp.ok) { const data = await resp.json();
                    content = data.response || data.message || data.reply || ''; }
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
        $('copyWritingBtn').addEventListener('click', function() {
            const output = $('writingOutput');
            if (output) {
                navigator.clipboard.writeText(output.textContent).then(() => showToast('✅ Content copied!'))
                    .catch(() => { const r = document.createRange();
                        r.selectNode(output);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(r);
                        document.execCommand('copy');
                        showToast('✅ Content copied!'); });
            }
        });

        // Logout
        logoutBtn.addEventListener('click', logout);

        // Settings toggles
        document.querySelectorAll('.settings-group .toggle:not(#themeToggleSettings)').forEach(toggle => {
            toggle.addEventListener('click', function() {
                this.classList.toggle('active');
                const label = this.closest('.setting-row')?.querySelector('.title');
                if (label) showToast(`⚙️ ${label.textContent} toggled!`);
            });
        });

        // Close notif panel
        document.addEventListener('click', function(e) {
            if (!notifPanel.contains(e.target) && !notifBtn.contains(e.target)) {
                notifPanel.classList.remove('open');
            }
        });

        console.log('🦁 SAFARI AI Platform loaded!');
        console.log(`👤 Owner: ${OWNER.name} (${OWNER.company})`);
        console.log(`📢 Channel: ${OWNER.channel}`);
    }

    // ===== INIT =====
    function init() {
        initParticles();
        initVoice();

        if (!checkSession()) {
            welcomeScreen.classList.remove('hidden');
            loginPage.classList.add('hidden');
            app.classList.add('hidden');
        } else {
            welcomeScreen.classList.add('hidden');
            loginPage.classList.add('hidden');
            app.classList.remove('hidden');
        }

        initEventListeners();

        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                globalSearch.focus();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();

// ================================================================
// SAFARI AI – COMPLETE SCRIPT WITH FIREBASE AUTH
// Google · GitHub · Email/Password · Apple (Coming Soon)
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

    // ===== FIREBASE CONFIG =====
    // ⚠️ REPLACE WITH YOUR FIREBASE CONFIG FROM FIREBASE CONSOLE
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    let firebaseApp = null;
    let auth = null;

    function initFirebase() {
        try {
            if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
                firebaseApp = firebase.initializeApp(firebaseConfig);
                auth = firebase.auth();
                console.log('🔥 Firebase initialized successfully!');
                return true;
            } else {
                console.warn('⚠️ Firebase not configured. Social login will show "Coming soon".');
                return false;
            }
        } catch (e) {
            console.warn('⚠️ Firebase init error:', e.message);
            return false;
        }
    }

    // ===== DOM HELPERS =====
    function $(id) {
        var el = document.getElementById(id);
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

    // ===== PARTICLES =====
    function initParticles() {
        var canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w, h, particles = [];

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        function Particle() {
            this.reset = function() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            };
            this.reset();
            this.update = function() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
            };
            this.draw = function() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(79, 70, 229, ' + this.opacity + ')';
                ctx.fill();
            };
        }

        for (var i = 0; i < 80; i++) particles.push(new Particle());

        function animate() {
            ctx.clearRect(0, 0, w, h);
            for (var i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            for (var a = 0; a < particles.length; a++) {
                for (var b = a + 1; b < particles.length; b++) {
                    var dx = particles[a].x - particles[b].x;
                    var dy = particles[a].y - particles[b].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.strokeStyle = 'rgba(79, 70, 229, ' + (0.08 * (1 - dist / 120)) + ')';
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
        var html = document.documentElement;
        var current = html.getAttribute('data-theme');
        var next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        updateThemeUI(next);
        localStorage.setItem('safari_theme', next);
    }

    function updateThemeUI(theme) {
        var isDark = theme === 'dark';
        var icon = isDark ? 'fa-sun' : 'fa-moon';
        var text = isDark ? 'Light Mode' : 'Dark Mode';
        var iconTop = document.getElementById('themeIconTop');
        var iconSide = document.getElementById('themeIconSidebar');
        var textSide = document.getElementById('themeTextSidebar');
        var settingsToggle = document.getElementById('themeToggleSettings');
        if (iconTop) iconTop.className = 'fas ' + icon;
        if (iconSide) iconSide.className = 'fas ' + icon;
        if (textSide) textSide.textContent = text;
        if (settingsToggle) {
            settingsToggle.className = 'toggle ' + (isDark ? 'active' : '');
        }
    }

    function loadTheme() {
        var saved = localStorage.getItem('safari_theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeUI(saved);
    }

    // ===== NAVIGATION =====
    function navigateTo(page) {
        var pages = document.querySelectorAll('.page');
        pages.forEach(function(p) { p.classList.remove('active'); });
        var target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(function(n) { n.classList.remove('active'); });
        var navItem = document.querySelector('.sidebar-nav .nav-item[data-page="' + page + '"]');
        if (navItem) navItem.classList.add('active');
        currentPage = page;
        if (window.innerWidth <= 768) {
            var sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('open');
        }
        if (page === 'dashboard') updateDashboard();
        if (page === 'chat') initChat();
    }

    // ===== DASHBOARD =====
    function updateDashboard() {
        var name = (currentUser && currentUser.displayName) ? currentUser.displayName :
            (currentUser && currentUser.email) ? currentUser.email.split('@')[0] : 'User';
        var email = (currentUser && currentUser.email) ? currentUser.email : 'user@safari.ai';

        var nameEl = document.getElementById('dashboardUserName');
        if (nameEl) nameEl.textContent = name;
        var chatsEl = document.getElementById('statChats');
        if (chatsEl) chatsEl.textContent = stats.chats || 0;
        var imagesEl = document.getElementById('statImages');
        if (imagesEl) imagesEl.textContent = stats.images || 0;
        var codeEl = document.getElementById('statCode');
        if (codeEl) codeEl.textContent = stats.code || 0;
        var tasksEl = document.getElementById('statTasks');
        if (tasksEl) tasksEl.textContent = todos.filter(function(t) { return !t.done; }).length;

        var profChats = document.getElementById('profChats');
        if (profChats) profChats.textContent = stats.chats || 0;
        var profImages = document.getElementById('profImages');
        if (profImages) profImages.textContent = stats.images || 0;

        var avatar = document.getElementById('userAvatar');
        if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
        var profAvatar = document.getElementById('profileAvatar');
        if (profAvatar) profAvatar.textContent = name.charAt(0).toUpperCase();
        var profName = document.getElementById('profileName');
        if (profName) profName.textContent = name;
        var profEmail = document.getElementById('profileEmail');
        if (profEmail) profEmail.textContent = email;
    }

    // ===== AUTH HANDLERS =====
    function handleAuthSuccess(user) {
        currentUser = user;
        var loginPage = document.getElementById('loginPage');
        var app = document.getElementById('app');
        if (loginPage) loginPage.classList.add('hidden');
        if (app) app.classList.remove('hidden');
        loadChatHistory();
        loadTheme();
        updateDashboard();
        navigateTo('dashboard');
        var name = user.displayName || user.email.split('@')[0];
        showToast('👋 Welcome, ' + name + '!');
    }

    function handleAuthError(error) {
        console.error('Auth error:', error);
        var msg = error.message || 'Authentication failed. Please try again.';
        showToast('⚠️ ' + msg);
    }

    // ===== EMAIL LOGIN =====
    function loginWithEmail() {
        if (!auth) { showToast('⚠️ Firebase not configured. Use demo login.'); return demoLogin(); }
        var emailInput = document.getElementById('loginEmail');
        var passInput = document.getElementById('loginPassword');
        var email = emailInput ? emailInput.value.trim() : '';
        var pass = passInput ? passInput.value.trim() : '';
        if (!email || !pass) { showToast('Please enter email and password.'); return; }

        showToast('⏳ Logging in...');
        auth.signInWithEmailAndPassword(email, pass)
            .then(function(result) { handleAuthSuccess(result.user); })
            .catch(function(error) {
                if (error.code === 'auth/user-not-found') {
                    // Create account if doesn't exist
                    auth.createUserWithEmailAndPassword(email, pass)
                        .then(function(result) { handleAuthSuccess(result.user); })
                        .catch(handleAuthError);
                } else {
                    handleAuthError(error);
                }
            });
    }

    // ===== GOOGLE LOGIN =====
    function loginWithGoogle() {
        if (!auth) { showToast('🔑 Google login coming soon! Configure Firebase.'); return; }
        var provider = new firebase.auth.GoogleAuthProvider();
        showToast('⏳ Signing in with Google...');
        auth.signInWithPopup(provider)
            .then(function(result) { handleAuthSuccess(result.user); })
            .catch(handleAuthError);
    }

    // ===== GITHUB LOGIN =====
    function loginWithGitHub() {
        if (!auth) { showToast('🔑 GitHub login coming soon! Configure Firebase.'); return; }
        var provider = new firebase.auth.GithubAuthProvider();
        showToast('⏳ Signing in with GitHub...');
        auth.signInWithPopup(provider)
            .then(function(result) { handleAuthSuccess(result.user); })
            .catch(handleAuthError);
    }

    // ===== APPLE LOGIN (Requires Apple Developer Account) =====
    function loginWithApple() {
        showToast('🍎 Apple Login requires an Apple Developer account and Firebase Apple Auth setup. Coming soon!');
    }

    // ===== DEMO LOGIN (Fallback) =====
    function demoLogin() {
        var email = 'demo@safari.ai';
        currentUser = {
            displayName: 'Demo User',
            email: email,
            uid: 'demo_' + Date.now()
        };
        handleAuthSuccess(currentUser);
    }

    // ===== CHECK SESSION =====
    function checkSession() {
        // Check Firebase session first
        if (auth && auth.currentUser) {
            handleAuthSuccess(auth.currentUser);
            return true;
        }
        // Fallback to localStorage demo
        var saved = localStorage.getItem('safari_user');
        if (saved) {
            try {
                var data = JSON.parse(saved);
                if (Date.now() - data.loginTime < 86400000 * 30) {
                    currentUser = data;
                    var loginPage = document.getElementById('loginPage');
                    var app = document.getElementById('app');
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

    // ===== LOGOUT =====
    function logout() {
        if (!confirm('Logout?')) return;
        if (auth) {
            auth.signOut().catch(function(e) { console.warn('Sign out error:', e); });
        }
        localStorage.removeItem('safari_user');
        currentUser = null;
        var app = document.getElementById('app');
        var loginPage = document.getElementById('loginPage');
        if (app) app.classList.add('hidden');
        if (loginPage) loginPage.classList.remove('hidden');
        showToast('👋 Logged out.');
    }

    // ===== CHAT HELPERS =====
    function escapeHtml(text) {
        var d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function parseMarkdown(text) {
        var html = text;
        html = html.replace(/<script/gi, '&lt;script');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
            return '<pre style="background:rgba(0,0,0,0.05);padding:10px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:13px;">' +
                code + '</pre>';
        });
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.05);padding:2px 6px;border-radius:4px;">$1</code>');
        html = html.replace(/\n/g, '<br />');

        var lower = html.toLowerCase();
        if (lower.includes('who is your owner') || lower.includes('who created you') ||
            lower.includes('your creator') || lower.includes('who made you')) {
            html =
                '🦁 <strong>I was created by ' + OWNER.name + ' from ' + OWNER.company + '!</strong><br /><br />📞 Contact: ' +
                OWNER.phone1 + ' / ' + OWNER.phone2 +
                '<br />📢 <a href="' + OWNER.channel + '" target="_blank" style="color:var(--accent);font-weight:600;">Join our WhatsApp Channel</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        }
        if (lower.includes('channel link') || lower.includes('whatsapp channel') || lower.includes('join channel')) {
            html =
                '📢 <strong>Join our official WhatsApp Channel!</strong><br /><br />🔗 <a href="' + OWNER.channel +
                '" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">' + OWNER.channel +
                '</a><br /><br />Stay updated with the latest AI features and news! 🚀<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        }
        return html;
    }

    function scrollChat() {
        var container = document.getElementById('chatMessages');
        if (container) container.scrollTop = container.scrollHeight;
    }

    function showToast(msg) {
        var container = document.getElementById('toastContainer');
        if (!container) return;
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = msg;
        container.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
        }, 3000);
        setTimeout(function() { toast.remove(); }, 3500);
    }

    // ===== CHAT HISTORY =====
    function saveChatHistory() {
        localStorage.setItem('safari_chat_history', JSON.stringify(chatHistory));
    }

    function loadChatHistory() {
        var data = localStorage.getItem('safari_chat_history');
        if (data) {
            try { chatHistory = JSON.parse(data); } catch (e) { chatHistory = []; }
        }
        if (chatHistory.length === 0) createNewChat();
    }

    function createNewChat() {
        var id = 'chat_' + Date.now();
        var chat = { id: id, title: 'New Chat', messages: [], created: Date.now() };
        chatHistory.unshift(chat);
        currentChatId = id;
        saveChatHistory();
        renderChatHistory();
        loadChatMessages(id);
        var input = document.getElementById('chatInput');
        if (input) { input.value = '';
            input.focus(); }
    }

    function renderChatHistory() {
        var container = document.getElementById('chatHistoryList');
        if (!container) return;
        if (chatHistory.length === 0) {
            container.innerHTML =
                '<div style="padding:12px;color:var(--text-secondary);font-size:13px;text-align:center;">No chats yet.<br>Start a new conversation!</div>';
            return;
        }
        var html = '';
        chatHistory.forEach(function(chat) {
            var active = chat.id === currentChatId ? 'active' : '';
            var preview = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content.slice(0, 50) ||
                '...' : 'Empty chat';
            html +=
                '<div class="chat-history-item ' + active + '" data-id="' + chat.id +
                '"><div class="cht-title">' + escapeHtml(chat.title || 'New Chat') +
                '</div><div class="cht-preview">' + escapeHtml(preview) + '</div></div>';
        });
        container.innerHTML = html;
        container.querySelectorAll('.chat-history-item').forEach(function(el) {
            el.addEventListener('click', function() {
                currentChatId = this.dataset.id;
                renderChatHistory();
                loadChatMessages(currentChatId);
            });
        });
    }

    function loadChatMessages(chatId) {
        var container = document.getElementById('chatMessages');
        if (!container) return;
        var chat = chatHistory.find(function(c) { return c.id === chatId; });
        if (!chat) {
            container.innerHTML =
                '<div class="chat-msg assistant"><div class="msg-avatar">🦁</div><div class="msg-bubble"><div class="msg-label">SAFARI AI</div><div class="msg-content">Start a new chat!</div></div></div>';
            return;
        }
        container.innerHTML = '';
        if (chat.messages.length === 0) {
            container.innerHTML =
                '<div class="chat-msg assistant"><div class="msg-avatar">🦁</div><div class="msg-bubble"><div class="msg-label">SAFARI AI</div><div class="msg-content">👋 Hello! I\'m Safari AI. How can I help you today?</div><div class="msg-time">Just now</div></div></div>';
            return;
        }
        chat.messages.forEach(function(msg) {
            var div = document.createElement('div');
            div.className = 'chat-msg ' + msg.role;
            var avatar = msg.role === 'user' ? '👤' : '🦁';
            var label = msg.role === 'user' ? 'You' : 'SAFARI AI';
            var actions = '';
            if (msg.role === 'assistant') {
                actions =
                    '<div class="msg-actions"><button class="copy-msg"><i class="fas fa-copy"></i> Copy</button><button class="speak-msg"><i class="fas fa-volume-up"></i> Speak</button></div>';
            }
            div.innerHTML =
                '<div class="msg-avatar">' + avatar +
                '</div><div class="msg-bubble"><div class="msg-label">' + label +
                '</div><div class="msg-content">' + parseMarkdown(msg.content) + '</div><div class="msg-time">' + (msg
                    .time || 'Just now') + '</div>' + actions + '</div>';
            container.appendChild(div);
        });

        container.querySelectorAll('.copy-msg').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var bubble = this.closest('.msg-bubble');
                var content = bubble.querySelector('.msg-content');
                if (content) {
                    var text = content.textContent;
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(function() { showToast('📋 Copied!'); });
                    } else {
                        var range = document.createRange();
                        range.selectNode(content);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(range);
                        document.execCommand('copy');
                        showToast('📋 Copied!');
                    }
                }
            });
        });

        container.querySelectorAll('.speak-msg').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var bubble = this.closest('.msg-bubble');
                var content = bubble.querySelector('.msg-content');
                if (content && 'speechSynthesis' in window) {
                    var utterance = new SpeechSynthesisUtterance(content.textContent);
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
        var chat = chatHistory.find(function(c) { return c.id === currentChatId; });
        if (!chat) return;
        var msg = {
            role: role,
            content: content,
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
    function fetchWithTimeout(url, options, timeout) {
        timeout = timeout || CONFIG.TIMEOUT;
        var controller = new AbortController();
        var id = setTimeout(function() { controller.abort(); }, timeout);
        return fetch(url, { ...options, signal: controller.signal }).then(function(response) {
            clearTimeout(id);
            return response;
        }).catch(function(error) {
            clearTimeout(id);
            throw error;
        });
    }

    // ===== DIRECT COMMAND HANDLER =====
    function handleDirectCommand(text) {
        var lower = text.toLowerCase().trim();

        if (lower.includes('who is your owner') || lower.includes('who created you') ||
            lower.includes('your creator') || lower.includes('who made you') || lower.includes('about safari ai')) {
            return {
                reply:
                    '🦁 <strong>I am Safari AI, created by ' + OWNER.name + ' from ' + OWNER.company +
                    '!</strong><br /><br />📞 Contact: ' + OWNER.phone1 + ' / ' + OWNER.phone2 +
                    '<br />📢 <a href="' + OWNER.channel +
                    '" target="_blank" style="color:var(--accent);font-weight:600;">Join our WhatsApp Channel</a><br /><br />🌍 <strong>About Safari AI:</strong> I am an all-in-one AI platform built to help you with chat, coding, image generation, writing, business tools, and much more. I\'m powered by cutting-edge AI technology and designed to be your ultimate digital assistant.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
            };
        }

        if (lower.includes('channel link') || lower.includes('whatsapp channel') || lower.includes('join channel')) {
            return {
                reply:
                    '📢 <strong>Join our official WhatsApp Channel!</strong><br /><br />🔗 <a href="' + OWNER.channel +
                    '" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">' + OWNER.channel +
                    '</a><br /><br />Stay updated with the latest AI features, news, and announcements! 🚀<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
            };
        }

        return null;
    }

    // ===== ASYNC HANDLERS =====
    async function handleAsyncCommand(text) {
        var lower = text.toLowerCase().trim();

        var weatherMatch = lower.match(/^(weather|temperature|temp)\s+(.+)/i);
        if (weatherMatch) {
            var city = weatherMatch[2].trim();
            try {
                var resp = await fetchWithTimeout(CONFIG.WEATHER_API + '/' + encodeURIComponent(city) + '?format=j1');
                if (!resp.ok) throw new Error('City not found');
                var data = await resp.json();
                var current = data.current_condition[0];
                var temp = current.temp_C;
                var feels = current.FeelsLikeC;
                var desc = current.weatherDesc[0].value;
                var wind = current.windSpeedKmph;
                var humid = current.humidity;
                return {
                    reply: '🌤️ <strong>Weather in ' + city + '</strong><br />🌡️ Temp: <strong>' + temp +
                        '°C</strong> (feels like ' + feels + '°C)<br />☁️ ' + desc + '<br />💨 Wind: ' + wind +
                        ' km/h | 💧 Humidity: ' + humid +
                        '%<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                };
            } catch (e) {
                return {
                    reply: '⚠️ Could not find weather for "' + city +
                        '". Try a major city name.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                };
            }
        }

        var searchMatch = lower.match(/safari\s+search\s+(.+)/i);
        if (searchMatch) {
            var query = searchMatch[1].trim();
            try {
                var resp2 = await fetchWithTimeout(CONFIG.WIKI_API + '/' + encodeURIComponent(query));
                if (!resp2.ok) throw new Error('Not found');
                var data2 = await resp2.json();
                if (data2.extract) {
                    return {
                        reply: '🔍 <strong>' + data2.title +
                        '</strong><br />' + data2.extract +
                        '<br /><br />📖 <a href="' + (data2.content_urls?.desktop?.page || '#') +
                        '" target="_blank" style="color:var(--accent);">Read more on Wikipedia</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                    };
                } else {
                    return {
                        reply: '❌ No summary found for "' + query +
                        '". Please try a different search term.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                    };
                }
            } catch (e) {
                return {
                    reply: '⚠️ Could not search for "' + query +
                        '". Please check your spelling and try again.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                };
            }
        }

        return null;
    }

    // ===== SEND CHAT MESSAGE =====
    async function sendChatMessage() {
        var input = document.getElementById('chatInput');
        if (!input) return;
        var text = input.value.trim();
        if (!text || isProcessing) return;
        input.value = '';
        isProcessing = true;

        addChatMessage('user', text);

        var container = document.getElementById('chatMessages');
        if (!container) return;
        var typingDiv = document.createElement('div');
        typingDiv.className = 'chat-msg assistant';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML =
            '<div class="msg-avatar">🦁</div><div class="msg-bubble"><div class="msg-label">SAFARI AI</div><div class="msg-content"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>';
        container.appendChild(typingDiv);
        scrollChat();

        try {
            var directReply = handleDirectCommand(text);
            if (directReply) {
                var typing = document.getElementById('typingIndicator');
                if (typing) typing.remove();
                addChatMessage('assistant', directReply.reply);
                isProcessing = false;
                return;
            }

            var asyncReply = await handleAsyncCommand(text);
            if (asyncReply) {
                var typing2 = document.getElementById('typingIndicator');
                if (typing2) typing2.remove();
                addChatMessage('assistant', asyncReply.reply);
                isProcessing = false;
                return;
            }

            var personaSelect = document.getElementById('chatPersona');
            var persona = personaSelect ? personaSelect.value : 'general';
            var personaMap = {
                general: 'friendly assistant',
                programmer: 'senior software engineer',
                teacher: 'patient teacher',
                business: 'business consultant',
                creative: 'creative writer',
                translator: 'professional translator'
            };
            var context = 'You are Safari AI, a ' + (personaMap[persona] || 'friendly assistant') +
                '. Be helpful. End with "POWERED BY ICEBACK MASTER TECH".';

            var reply = '';
            var apiSuccess = false;

            try {
                var response = await fetchWithTimeout(CONFIG.CHAT_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        context: context,
                        history: chatHistory.find(function(c) { return c.id === currentChatId; })?.messages
                            ?.slice(-6) || []
                    })
                });
                if (response.ok) {
                    var data = await response.json();
                    reply = data.response || data.message || data.reply || data.text || data.content || data.result ||
                        '';
                    if (reply) apiSuccess = true;
                }
            } catch (e) { console.warn('Primary API failed:', e); }

            if (!apiSuccess) {
                try {
                    var response2 = await fetchWithTimeout(CONFIG.FALLBACK_API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: text, context: context })
                    });
                    if (response2.ok) {
                        var data2 = await response2.json();
                        reply = data2.response || data2.message || data2.reply || data2.text || data2.content ||
                            data2.result || '';
                        if (reply) apiSuccess = true;
                    }
                } catch (e) { console.warn('Fallback API failed:', e); }
            }

            if (!apiSuccess || !reply) {
                var lowerText = text.toLowerCase();
                if (lowerText.includes('joke')) {
                    var jokes = [
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

            var typing3 = document.getElementById('typingIndicator');
            if (typing3) typing3.remove();
            addChatMessage('assistant', reply);

        } catch (e) {
            var typing4 = document.getElementById('typingIndicator');
            if (typing4) typing4.remove();
            addChatMessage('assistant',
                '⚠️ Sorry, I encountered an error. Please try again.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
            console.error('Chat error:', e);
        }

        isProcessing = false;
    }

    // ===== IMAGE GENERATION =====
    async function generateImage() {
        var promptInput = document.getElementById('imagePrompt');
        var prompt = promptInput ? promptInput.value.trim() : '';
        if (!prompt) { showToast('Please describe the image.'); return; }
        var styleSelect = document.getElementById('imageStyle');
        var style = styleSelect ? styleSelect.value : 'realistic';
        var fullPrompt = prompt + ', ' + style + ' style, high quality';
        var url = CONFIG.IMAGE_API + '/' + encodeURIComponent(fullPrompt) +
            '?width=512&height=512&nologo=true&seed=' + Date.now();

        var preview = document.getElementById('imagePreview');
        if (preview) {
            preview.innerHTML =
                '<div style="padding:20px;text-align:center;color:var(--text-secondary);"><div class="typing-dots"><span></span><span></span><span></span></div><p style="margin-top:8px;">Generating...</p></div>';
        }

        await new Promise(function(r) { setTimeout(r, 1200); });

        if (preview) {
            preview.innerHTML = '<img src="' + url + '" alt="' + escapeHtml(prompt) +
                '" style="max-width:100%;max-height:350px;border-radius:12px;" />';
        }

        stats.images = (stats.images || 0) + 1;
        localStorage.setItem('safari_stats', JSON.stringify(stats));
        updateDashboard();
        showToast('✅ Image generated!');
    }

    // ===== VOICE =====
    function initVoice() {
        var voiceBtn = document.getElementById('voiceChatBtn');
        var sttBtn = document.getElementById('sttRecordBtn');
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            if (voiceBtn) voiceBtn.style.display = 'none';
            if (sttBtn) sttBtn.style.display = 'none';
            return;
        }
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        sttRecognition = new SpeechRecognition();
        sttRecognition.lang = 'en-US';
        sttRecognition.continuous = false;
        sttRecognition.interimResults = true;

        if (voiceBtn) {
            var isVoiceRecording = false;
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
            var transcript = '';
            for (var i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    var input = document.getElementById('chatInput');
                    if (input) { input.value = transcript;
                        sendChatMessage(); }
                    var voiceBtn2 = document.getElementById('voiceChatBtn');
                    if (voiceBtn2) { voiceBtn2.style.color = 'var(--text-secondary)'; }
                }
            }
            var sttResult = document.getElementById('sttResult');
            if (sttResult) sttResult.textContent = '📝 ' + transcript;
        };

        sttRecognition.onerror = function() {
            var voiceBtn2 = document.getElementById('voiceChatBtn');
            if (voiceBtn2) voiceBtn2.style.color = 'var(--text-secondary)';
            showToast('⚠️ Voice recognition error.');
        };

        sttRecognition.onend = function() {
            var voiceBtn2 = document.getElementById('voiceChatBtn');
            if (voiceBtn2) voiceBtn2.style.color = 'var(--text-secondary)';
            isRecording = false;
        };

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
                    var result = document.getElementById('sttResult');
                    if (result) result.textContent = '🎤 Listening... Speak now.';
                } catch (e) { showToast('⚠️ Please allow microphone access.'); }
            });
        }
    }

    // ===== INIT =====
    function init() {
        console.log('🦁 SAFARI AI: Initializing...');

        // Initialize Firebase
        var firebaseReady = initFirebase();

        // Particles
        initParticles();

        // Voice
        initVoice();

        // Check session
        if (!checkSession()) {
            var welcome = document.getElementById('welcomeScreen');
            var loginPage = document.getElementById('loginPage');
            var app = document.getElementById('app');
            if (welcome) welcome.classList.remove('hidden');
            if (loginPage) loginPage.classList.remove('hidden');
            if (app) app.classList.add('hidden');
        } else {
            var welcome2 = document.getElementById('welcomeScreen');
            var loginPage2 = document.getElementById('loginPage');
            var app2 = document.getElementById('app');
            if (welcome2) welcome2.classList.add('hidden');
            if (loginPage2) loginPage2.classList.add('hidden');
            if (app2) app2.classList.remove('hidden');
        }

        // ===== EVENT BINDINGS =====

        // Welcome
        var welcomeBtn = document.getElementById('welcomeGetStarted');
        if (welcomeBtn) {
            welcomeBtn.addEventListener('click', function() {
                var welcome = document.getElementById('welcomeScreen');
                var login = document.getElementById('loginPage');
                if (welcome) welcome.classList.add('hidden');
                if (login) login.classList.remove('hidden');
            });
        }

        // Login - Email
        var loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.addEventListener('click', loginWithEmail);
        var loginPass = document.getElementById('loginPassword');
        if (loginPass) loginPass.addEventListener('keydown', function(e) { if (e.key === 'Enter') loginWithEmail(); });
        var loginEmail = document.getElementById('loginEmail');
        if (loginEmail) loginEmail.addEventListener('keydown', function(e) { if (e.key === 'Enter') loginWithEmail(); });

        // Social Logins
        var googleBtn = document.getElementById('googleLogin');
        if (googleBtn) googleBtn.addEventListener('click', loginWithGoogle);
        var githubBtn = document.getElementById('githubLogin');
        if (githubBtn) githubBtn.addEventListener('click', loginWithGitHub);
        var appleBtn = document.getElementById('appleLogin');
        if (appleBtn) appleBtn.addEventListener('click', loginWithApple);

        // Password toggle
        var toggleEye = document.getElementById('togglePassword');
        if (toggleEye) {
            toggleEye.addEventListener('click', function() {
                var input = document.getElementById('loginPassword');
                if (input) {
                    var type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' :
                        '<i class="fas fa-eye-slash"></i>';
                }
            });
        }

        // Forgot password
        var forgotLink = document.getElementById('forgotPassword');
        if (forgotLink) {
            forgotLink.addEventListener('click', function(e) {
                e.preventDefault();
                if (auth) {
                    var email = document.getElementById('loginEmail')?.value?.trim();
                    if (email) {
                        auth.sendPasswordResetEmail(email).then(function() {
                            showToast('📧 Password reset email sent!');
                        }).catch(function() {
                            showToast('⚠️ Enter your email address first.');
                        });
                    } else {
                        showToast('⚠️ Please enter your email address.');
                    }
                } else {
                    showToast('📧 Password reset link would be sent to your email.');
                }
            });
        }

        // Create account
        var createLink = document.getElementById('createAccountLink');
        if (createLink) {
            createLink.addEventListener('click', function(e) {
                e.preventDefault();
                showToast('📝 Create account: Use email/password above and click Login!');
            });
        }

        // Theme toggles
        var themeTop = document.getElementById('themeToggleTop');
        var themeSide = document.getElementById('themeToggleSidebar');
        var themeSettings = document.getElementById('themeToggleSettings');
        if (themeTop) themeTop.addEventListener('click', toggleTheme);
        if (themeSide) themeSide.addEventListener('click', toggleTheme);
        if (themeSettings) themeSettings.addEventListener('click', toggleTheme);

        // Menu toggle
        var menuBtn = document.getElementById('menuToggle');
        var sidebar = document.getElementById('sidebar');
        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && sidebar && menuBtn) {
                if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });

        // Notifications
        var notifBtn = document.getElementById('notifBtn');
        var notifPanel = document.getElementById('notifPanel');
        var closeNotif = document.getElementById('closeNotifBtn');
        if (notifBtn && notifPanel) {
            notifBtn.addEventListener('click', function() { notifPanel.classList.toggle('open'); });
        }
        if (closeNotif && notifPanel) {
            closeNotif.addEventListener('click', function() { notifPanel.classList.remove('open'); });
        }
        document.addEventListener('click', function(e) {
            if (notifPanel && !notifPanel.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
                notifPanel.classList.remove('open');
            }
        });

        // Search
        var searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    var q = this.value.trim().toLowerCase();
                    if (!q) return;
                    var pages = ['chat', 'image', 'video', 'audio', 'code', 'writing', 'documents', 'business',
                        'profile', 'settings'
                    ];
                    var found = false;
                    for (var i = 0; i < pages.length; i++) {
                        if (pages[i].includes(q) || q.includes(pages[i])) {
                            navigateTo(pages[i]);
                            found = true;
                            break;
                        }
                    }
                    if (!found) showToast('🔍 No match for "' + q + '"');
                    this.value = '';
                }
            });
        }

        // Sidebar Navigation
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-page]');
        navItems.forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                var page = this.dataset.page;
                var validPages = ['dashboard', 'chat', 'image', 'video', 'audio', 'code', 'writing',
                    'documents', 'business', 'projects', 'history', 'downloads', 'profile', 'settings'
                ];
                if (validPages.indexOf(page) !== -1) navigateTo(page);
            });
        });

        // Quick Cards
        var quickCards = document.querySelectorAll('.quick-card[data-action]');
        quickCards.forEach(function(card) {
            card.addEventListener('click', function() {
                var action = this.dataset.action;
                var map = {
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
                else showToast('🚀 ' + action + ' feature coming soon!');
            });
        });

        // Chat Send
        var sendBtn = document.getElementById('chatSendBtn');
        var chatInput = document.getElementById('chatInput');
        if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);
        if (chatInput) {
            chatInput.addEventListener('keydown

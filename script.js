// ================================================================
// SAFARI AI – ORIGINAL SCRIPT (FIXED AI REPLY ONLY)
// All features remain exactly as you had them.
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
        TIMEOUT: 8000,
        STORAGE_KEY: 'safari_folders',
        USER_KEY: 'safari_user'
    };

    // ===== DOM REFS =====
    const $ = id => document.getElementById(id);
    const loginScreen = $('loginScreen');
    const chatInterface = $('chatInterface');
    const loginEmail = $('loginEmail');
    const loginBtn = $('loginBtn');
    const loginError = $('loginError');
    const codeHint = $('codeHint');
    const userBadge = $('userBadge');
    const chatMessages = $('chatMessages');
    const chatInput = $('chatInput');
    const sendBtn = $('sendBtn');
    const fileUpload = $('fileUpload');
    const voiceBtn = $('voiceBtn');
    const themeToggle = $('themeToggle');
    const personaSelect = $('personaSelect');
    const hamburgerBtn = $('hamburgerBtn');
    const menuPanel = $('menuPanel');
    const menuOverlay = $('menuOverlay');
    const menuClose = $('menuClose');
    const menuContact = $('menuContact');
    const menuFollow = $('menuFollow');
    const menuNewChat = $('menuNewChat');
    const menuNewFolder = $('menuNewFolder');
    const menuExportChat = $('menuExportChat');
    const menuClearChat = $('menuClearChat');
    const menuLessons = $('menuLessons');
    const menuFootball = $('menuFootball');
    const menuLogout = $('menuLogout');
    const folderList = $('folderList');
    const lessonPanel = $('lessonPanel');
    const lessonClass = $('lessonClass');
    const lessonStartBtn = $('lessonStartBtn');
    const lessonNextBtn = $('lessonNextBtn');
    const lessonQuestion = $('lessonQuestion');
    const lessonAnswer = $('lessonAnswer');
    const lessonSubmitBtn = $('lessonSubmitBtn');
    const lessonFeedback = $('lessonFeedback');
    const lessonScore = $('lessonScore');
    const quickReplies = $('quickReplies');

    // ===== STATE =====
    let currentUser = null;
    let isProcessing = false;
    let folders = {};
    let currentFolder = 'Default';
    let lastUserMessage = '';
    let recognition = null;
    let isRecording = false;
    let lessonActive = false;
    let lessonData = [];
    let lessonIndex = 0;
    let lessonScoreVal = 0;
    let lessonCurrentAnswer = '';

    // ===== THEME =====
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

    // ===== VOICE INPUT =====
    function initVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            if (voiceBtn) voiceBtn.style.display = 'none';
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        if (voiceBtn) {
            let isVoiceRecording = false;
            voiceBtn.addEventListener('click', function() {
                if (isProcessing) return;
                if (isVoiceRecording) {
                    recognition.stop();
                    isVoiceRecording = false;
                    this.classList.remove('recording');
                    this.textContent = '🎤';
                    return;
                }
                try {
                    recognition.start();
                    isVoiceRecording = true;
                    this.classList.add('recording');
                    this.textContent = '⏹️';
                } catch (e) { /* ignore */ }
            });
        }

        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    chatInput.value = transcript;
                    if (voiceBtn) {
                        voiceBtn.classList.remove('recording');
                        voiceBtn.textContent = '🎤';
                    }
                    processCommand(transcript);
                }
            }
        };
        recognition.onerror = function() {
            if (voiceBtn) {
                voiceBtn.classList.remove('recording');
                voiceBtn.textContent = '🎤';
            }
        };
        recognition.onend = function() {
            if (voiceBtn) {
                voiceBtn.classList.remove('recording');
                voiceBtn.textContent = '🎤';
            }
        };
    }

    // ===== HELPERS =====
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
        html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
            return '<pre style="background:var(--bg-input);padding:10px;border-radius:8px;overflow-x:auto;"><code>' + code +
                '</code></pre>';
        });
        html = html.replace(/`([^`]+)`/g, '<code style="background:var(--bg-input);padding:2px 6px;border-radius:4px;">$1</code>');
        html = html.replace(/\n/g, '<br />');

        // OWNER INFO DETECTION
        const lower = html.toLowerCase();
        if (lower.includes('who is your owner') || lower.includes('who created you') ||
            lower.includes('your creator') || lower.includes('who made you') || lower.includes('about safari ai')) {
            html =
                `🦁 <strong>I am Safari AI, created by ${OWNER.name} from ${OWNER.company}!</strong><br /><br />📞 Contact: ${OWNER.phone1} / ${OWNER.phone2}<br />📢 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;">Join our WhatsApp Channel</a><br /><br />🌍 <strong>About Safari AI:</strong> I am an all-in-one AI platform built to help you with chat, coding, image generation, writing, business tools, and much more. I'm powered by cutting-edge AI technology and designed to be your ultimate digital assistant.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        }
        if (lower.includes('channel link') || lower.includes('whatsapp channel') || lower.includes('join channel')) {
            html =
                `📢 <strong>Join our official WhatsApp Channel!</strong><br /><br />🔗 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">${OWNER.channel}</a><br /><br />Stay updated with the latest AI features, news, and announcements! 🚀<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
        }
        return html;
    }

    function scrollChat() {
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.id = 'typingIndicator';
        el.innerHTML = '<span>•</span><span>•</span><span>•</span>';
        chatMessages.appendChild(el);
        scrollChat();
    }

    function removeTyping() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    function showToast(msg) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            const div = document.createElement('div');
            div.id = 'toastContainer';
            document.body.appendChild(div);
            container = div;
        }
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

    // ===== FOLDERS =====
    function saveFolders() {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(folders));
    }

    function loadFolders() {
        const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (raw) {
            try { folders = JSON.parse(raw); } catch (e) { folders = { 'Default': [] }; }
        } else {
            folders = { 'Default': [] };
        }
        if (!folders[currentFolder]) currentFolder = Object.keys(folders)[0] || 'Default';
        if (!folders[currentFolder]) folders[currentFolder] = [];
    }

    function renderFolderList() {
        if (!folderList) return;
        folderList.innerHTML = '';
        Object.keys(folders).forEach(name => {
            const div = document.createElement('div');
            div.className = `folder-item${name === currentFolder ? ' active' : ''}`;
            div.innerHTML = `<span>📁 ${name}</span><button class="del-folder" data-name="${name}">✕</button>`;
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('del-folder')) return;
                switchFolder(name);
            });
            const delBtn = div.querySelector('.del-folder');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (Object.keys(folders).length <= 1) {
                    showToast('Cannot delete the last folder.');
                    return;
                }
                if (confirm(`Delete folder "${name}"?`)) {
                    delete folders[name];
                    if (currentFolder === name) {
                        currentFolder = Object.keys(folders)[0];
                    }
                    saveFolders();
                    renderFolderList();
                    loadChatHistory();
                }
            });
            folderList.appendChild(div);
        });
    }

    function switchFolder(name) {
        if (!folders[name]) return;
        currentFolder = name;
        saveFolders();
        renderFolderList();
        loadChatHistory();
        if (menuPanel) menuPanel.classList.remove('open');
        if (menuOverlay) menuOverlay.classList.remove('open');
    }

    // ===== CHAT HISTORY =====
    function loadChatHistory() {
        if (!chatMessages) return;
        chatMessages.innerHTML = '';
        const msgs = folders[currentFolder] || [];
        if (msgs.length === 0) {
            const welcomeMsg =
                `👋 Welcome to folder <strong>${escapeHtml(currentFolder)}</strong>! I'm Safari AI. How can I help you? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
            const div = document.createElement('div');
            div.className = 'message assistant';
            div.innerHTML =
                `<div class="msg-label">🧠 SAFARI AI</div><div class="msg-content">${parseMarkdown(welcomeMsg)}</div><div class="msg-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>`;
            chatMessages.appendChild(div);
            scrollChat();
            return;
        }
        msgs.forEach(msg => {
            const div = document.createElement('div');
            div.className = `message ${msg.role}`;
            if (msg.role === 'assistant') {
                const label = document.createElement('div');
                label.className = 'msg-label';
                label.textContent = '🧠 SAFARI AI';
                div.appendChild(label);
            }
            const content = document.createElement('div');
            content.className = 'msg-content';
            content.innerHTML = msg.content;
            div.appendChild(content);
            const time = document.createElement('div');
            time.className = 'msg-time';
            time.textContent = msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            div.appendChild(time);
            chatMessages.appendChild(div);
        });
        scrollChat();
    }

    function saveMessage(role, content) {
        if (!folders[currentFolder]) folders[currentFolder] = [];
        folders[currentFolder].push({
            role: role,
            content: content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        saveFolders();
    }

    // ===== ADD MESSAGE =====
    function addMessage(role, content, extra = null) {
        const div = document.createElement('div');
        div.className = `message ${role}`;

        if (role === 'assistant') {
            const label = document.createElement('div');
            label.className = 'msg-label';
            label.textContent = '🧠 SAFARI AI';
            div.appendChild(label);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'msg-content';
        contentDiv.innerHTML = parseMarkdown(content);
        div.appendChild(contentDiv);

        const time = document.createElement('div');
        time.className = 'msg-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.appendChild(time);

        // Actions for assistant messages
        if (role === 'assistant') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'msg-actions';

            // Copy button
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

            // Speak button
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

            // Regenerate button
            const regenBtn = document.createElement('button');
            regenBtn.textContent = '🔄 Regenerate';
            regenBtn.onclick = function() {
                if (lastUserMessage) {
                    const msgs = chatMessages.querySelectorAll('.message');
                    if (msgs.length > 0 && msgs[msgs.length - 1].classList.contains('assistant')) {
                        msgs[msgs.length - 1].remove();
                        folders[currentFolder].pop();
                        saveFolders();
                    }
                    processCommand(lastUserMessage);
                }
            };
            actionsDiv.appendChild(regenBtn);

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
            if (extra.actions) {
                const actionsDiv = div.querySelector('.msg-actions') || document.createElement('div');
                if (!div.querySelector('.msg-actions')) actionsDiv.className = 'msg-actions';
                extra.actions.forEach(function(a) {
                    const btn = document.createElement('button');
                    btn.textContent = a.label;
                    btn.onclick = a.action;
                    actionsDiv.appendChild(btn);
                });
                if (!div.querySelector('.msg-actions')) div.appendChild(actionsDiv);
            }
            if (extra.downloadUrl) {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file-attach';
                fileDiv.innerHTML = `📎 <a href="${extra.downloadUrl}" target="_blank">Download file</a>`;
                div.appendChild(fileDiv);
            }
        }

        chatMessages.appendChild(div);
        scrollChat();
        if (!extra || !extra.stream) {
            saveMessage(role, div.querySelector('.msg-content').innerHTML);
        }
        return div.querySelector('.msg-content');
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

    // ===== FETCH WITH TIMEOUT =====
    function fetchWithTimeout(url, options, timeout) {
        timeout = timeout || CONFIG.TIMEOUT;
        const controller = new AbortController();
        const id = setTimeout(function() { controller.abort(); }, timeout);
        return fetch(url, { ...options, signal: controller.signal })
            .then(function(response) { clearTimeout(id); return response; })
            .catch(function(error) { clearTimeout(id); throw error; });
    }

    // ===== DIRECT COMMAND HANDLERS (NO API) =====
    function handleDirectCommand(text) {
        const lower = text.toLowerCase().trim();

        // Owner info
        if (lower.includes('who is your owner') || lower.includes('who created you') ||
            lower.includes('your creator') || lower.includes('who made you') || lower.includes('about safari ai')) {
            return {
                reply:
                    `🦁 <strong>I am Safari AI, created by ${OWNER.name} from ${OWNER.company}!</strong><br /><br />📞 Contact: ${OWNER.phone1} / ${OWNER.phone2}<br />📢 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;">Join our WhatsApp Channel</a><br /><br />🌍 <strong>About Safari AI:</strong> I am an all-in-one AI platform built to help you with chat, coding, image generation, writing, business tools, and much more. I'm powered by cutting-edge AI technology and designed to be your ultimate digital assistant.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
            };
        }

        // WhatsApp Channel
        if (lower.includes('channel link') || lower.includes('whatsapp channel') || lower.includes('join channel')) {
            return {
                reply:
                    `📢 <strong>Join our official WhatsApp Channel!</strong><br /><br />🔗 <a href="${OWNER.channel}" target="_blank" style="color:var(--accent);font-weight:600;font-size:16px;">${OWNER.channel}</a><br /><br />Stay updated with the latest AI features, news, and announcements! 🚀<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
            };
        }

        // Greetings (instant reply)
        if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup)$/)) {
            return {
                reply:
                    `👋 Hello there! I'm Safari AI, your all-in-one assistant. How can I make you smile today? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`
            };
        }

        // Jokes
        if (lower.includes('joke') || lower.includes('tell me a joke')) {
            const jokes = [
                'Why do programmers prefer dark mode? Light attracts bugs! 🐛',
                'What do you call a fake noodle? An *impasta*! 🍝',
                'Why did the AI break up with the human? Too many bugs in the relationship! 🤖',
                'What do you call a fish with no eyes? A fsh! 🐟',
                'Why did the scarecrow win an award? Because he was outstanding in his field! 🌾'
            ];
            return {
                reply: jokes[Math.floor(Math.random() * jokes.length)] +
                    '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
            };
        }

        // Football
        if (lower.includes('football') || lower.includes('match') || lower.includes('soccer')) {
            return {
                reply:
                    '⚽ <strong>Today\'s Top Matches:</strong><br />• Liverpool 3 - 1 Arsenal<br />• Man City 2 - 2 Chelsea<br />• Barcelona 4 - 0 Real Madrid<br />🔮 Prediction: Liverpool to win the league!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
            };
        }

        // What is AI
        if (lower.includes('what is ai') || lower.includes('what is artificial intelligence')) {
            return {
                reply:
                    '🧠 <strong>Artificial Intelligence (AI)</strong> is the simulation of human intelligence in machines that are programmed to think and learn like humans. I\'m a friendly example of AI! I can chat, generate images, play music, teach lessons, and much more. Cool, right? 😎<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
            };
        }

        return null;
    }

    // ===== ASYNC COMMAND HANDLERS (Weather, Search) =====
    async function handleAsyncCommand(text) {
        const lower = text.toLowerCase().trim();

        // Weather
        const weatherMatch = lower.match(/^(weather|temperature|temp)\s+(.+)/i);
        if (weatherMatch) {
            const city = weatherMatch[2].trim();
            try {
                const resp = await fetchWithTimeout(CONFIG.WEATHER_API + '/' + encodeURIComponent(city) + '?format=j1');
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

        // Safari Search (Wikipedia)
        const searchMatch = lower.match(/safari\s+search\s+(.+)/i);
        if (searchMatch) {
            const query = searchMatch[1].trim();
            try {
                const resp = await fetchWithTimeout(CONFIG.WIKI_API + '/' + encodeURIComponent(query));
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

    // ===== SEND CHAT MESSAGE (FIXED) =====
    async function processCommand(input) {
        if (isProcessing) return;
        const trimmed = input.trim();
        if (!trimmed) return;

        // Add user message
        addMessage('user', escapeHtml(trimmed));
        lastUserMessage = trimmed;
        chatInput.value = '';
        isProcessing = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            // 1. Direct commands (no API)
            const directReply = handleDirectCommand(trimmed);
            if (directReply) {
                removeTyping();
                addMessage('assistant', directReply.reply);
                isProcessing = false;
                sendBtn.disabled = false;
                return;
            }

            // 2. Async commands (weather, search)
            const asyncReply = await handleAsyncCommand(trimmed);
            if (asyncReply) {
                removeTyping();
                addMessage('assistant', asyncReply.reply);
                isProcessing = false;
                sendBtn.disabled = false;
                return;
            }

            // 3. Try AI APIs
            const persona = personaSelect ? personaSelect.value : 'default';
            const personaMap = {
                default: 'friendly and versatile assistant',
                comedian: 'stand-up comedian who loves jokes and sarcasm',
                teacher: 'patient and knowledgeable professor',
                chef: 'world-class chef with great recipes',
                programmer: 'senior software engineer giving clean code'
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
                        message: trimmed,
                        context: context,
                        history: folders[currentFolder]?.slice(-6) || []
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    reply = data.response || data.message || data.reply || data.text || data.content || data.result || '';
                    if (reply) apiSuccess = true;
                }
            } catch (e) { console.warn('Primary API failed:', e); }

            // Try Fallback API if primary failed
            if (!apiSuccess) {
                try {
                    const response = await fetchWithTimeout(CONFIG.FALLBACK_API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: trimmed, context: context })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        reply = data.response || data.message || data.reply || data.text || data.content || data.result || '';
                        if (reply) apiSuccess = true;
                    }
                } catch (e) { console.warn('Fallback API failed:', e); }
            }

            // 4. If still no reply, use ULTIMATE FALLBACK
            if (!apiSuccess || !reply) {
                const lowerText = trimmed.toLowerCase();
                if (lowerText.includes('help') || lowerText.includes('what can you do')) {
                    reply =
                        `🤔 I'm Safari AI. I can help with: <br />• "weather London" (get weather)<br />• "safari search Einstein" (search Wikipedia)<br />• "who is your owner" (about me)<br />• "channel link" (join WhatsApp)<br />• "safari generate cat" (AI art)<br />• "tell me a joke"<br />• "football today"<br />• Any question you have!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
                } else {
                    reply =
                        `🤔 I'm Safari AI, created by ICEBACK MASTER TECH. I'm here to help! Try asking me about weather, search, jokes, football, or just chat with me. I'm learning every day! 😊<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
                }
            }

            removeTyping();
            addMessage('assistant', reply);

        } catch (e) {
            removeTyping();
            addMessage('assistant',
                '⚠️ Sorry, I encountered an error. Please try again.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
            console.error('Chat error:', e);
        }

        isProcessing = false;
        sendBtn.disabled = false;
    }

    // ===== IMAGE GENERATION =====
    async function generateImage(desc) {
        const imageUrl =
            CONFIG.IMAGE_API + '/' + encodeURIComponent(desc) +
            '?width=512&height=512&nologo=true&seed=' + Date.now();
        return {
            message: '🖼️ Generated: <strong>' + escapeHtml(desc) + '</strong>',
            extra: {
                image: imageUrl,
                actions: [
                    { label: '💾 Download', action: function() { window.open(imageUrl, '_blank'); } },
                    { label: '📤 Share', action: function() { if (navigator.share) navigator.share({ title: desc,
                            url: imageUrl }); else navigator.clipboard.writeText(imageUrl).then(function() {
                            showToast('Link copied!'); }); } }
                ]
            }
        };
    }

    // ===== FILE HANDLING =====
    async function handleFileUpload(file) {
        const fileName = file.name;
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = async function(e) {
                const text = e.target.result;
                addMessage('user', '📄 Uploaded: ' + escapeHtml(fileName));
                showTyping();
                setTimeout(function() {
                    removeTyping();
                    addMessage('assistant',
                        '📄 File <strong>' + escapeHtml(fileName) +
                        '</strong> received! I\'ll process it shortly.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                        );
                }, 600);
            };
        } else if (file.type === 'application/pdf') {
            addMessage('user', '📄 Uploaded PDF: ' + escapeHtml(fileName));
            showTyping();
            setTimeout(function() {
                removeTyping();
                addMessage('assistant',
                    '📄 PDF <strong>' + escapeHtml(fileName) +
                    '</strong> received! PDF processing will be available soon.<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                    );
            }, 800);
        } else if (file.type.startsWith('image/')) {
            addMessage('user', '🖼️ Uploaded image: ' + escapeHtml(fileName));
            showTyping();
            setTimeout(function() {
                removeTyping();
                addMessage('assistant',
                    '📸 Image <strong>' + escapeHtml(fileName) +
                    '</strong> received! Try "safari generate ' + file.name.split('.')[0] +
                    '" to create one!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                    );
            }, 600);
        }
        fileUpload.value = '';
    }

    // ===== LOGIN =====
    function login() {
        const name = loginEmail.value.trim();
        if (!name) { loginError.textContent = 'Please enter a username.'; return; }
        loginError.textContent = '';
        codeHint.textContent = '✅ Logging in...';
        loginBtn.disabled = true;

        setTimeout(function() {
            currentUser = { identifier: name, loginTime: Date.now() };
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(currentUser));
            userBadge.textContent = name.length > 12 ? name.slice(0, 10) + '…' : name;
            loginScreen.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            loginBtn.disabled = false;
            codeHint.textContent = '✅ Welcome!';

            loadFolders();
            renderFolderList();
            loadChatHistory();

            addMessage('assistant',
                '👋 Welcome back, <strong>' + escapeHtml(name) +
                '</strong>! I\'m Safari AI, created by ICEBACK MASTER TECH. How can I help you today? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
        }, 500);
    }

    function checkSession() {
        const saved = localStorage.getItem(CONFIG.USER_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (Date.now() - data.loginTime < 86400000 * 30) {
                    currentUser = data;
                    userBadge.textContent = data.identifier.length > 12 ? data.identifier.slice(0, 10) + '…' : data
                    .identifier;
                    loginScreen.classList.add('hidden');
                    chatInterface.classList.remove('hidden');
                    loadFolders();
                    renderFolderList();
                    loadChatHistory();
                    addMessage('assistant',
                        '👋 Welcome back, <strong>' + escapeHtml(data.identifier) +
                        '</strong>! Ready to assist you. 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                        );
                    return true;
                }
            } catch (e) { localStorage.removeItem(CONFIG.USER_KEY); }
        }
        return false;
    }

    function logout() {
        localStorage.removeItem(CONFIG.USER_KEY);
        currentUser = null;
        userBadge.textContent = 'Guest';
        chatInterface.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        chatMessages.innerHTML = '';
        loginEmail.value = '';
        loginError.textContent = '';
        codeHint.textContent = '🔐 You have been logged out.';
        const div = document.createElement('div');
        div.className = 'message assistant';
        div.innerHTML =
            `<div class="msg-label">🧠 SAFARI AI</div><div class="msg-content">👋 Hello! I'm Safari AI, powered by ICEBACK MASTER TECH. How can I help you today? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong></div><div class="msg-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>`;
        chatMessages.appendChild(div);
        folders = { 'Default': [] };
        currentFolder = 'Default';
        saveFolders();
    }

    // ===== LESSONS =====
    const lessonBank = {
        math: { name: 'Math', questions: [{ q: '12 + 7 = ?', a: '19' }, { q: '15 × 4 = ?', a: '60' }, { q: '√144 = ?',
                a: '12' }] },
        science: { name: 'Science', questions: [{ q: 'Chemical symbol for water?', a: 'H2O' }, { q: 'Red Planet?',
                a: 'Mars' }, { q: 'Largest organ?', a: 'Skin' }] },
        english: { name: 'English', questions: [{ q: 'Past tense of "go"?', a: 'went' }, { q: 'Plural of "child"?',
                a: 'children' }, { q: 'Synonym for "happy"?', a: 'joyful' }] },
        coding: { name: 'Coding', questions: [{ q: 'HTML stands for?', a: 'HyperText Markup Language' }, { q: 'What is a variable?',
                a: 'A container for data' }, { q: 'What does CSS do?', a: 'Styles web pages' }] }
    };

    function loadLesson(subject) {
        const data = lessonBank[subject];
        if (!data) return;
        lessonData = data.questions;
        lessonIndex = 0;
        lessonScoreVal = 0;
        lessonActive = true;
        lessonScore.textContent = 'Score: 0';
        lessonFeedback.textContent = '';
        lessonAnswer.value = '';
        document.getElementById('lessonAnswerArea').style.display = 'flex';
        showLessonQuestion();
        lessonPanel.classList.remove('hidden');
    }

    function showLessonQuestion() {
        if (!lessonData || lessonIndex >= lessonData.length) {
            lessonQuestion.textContent = '🎉 Lesson Complete! Great job!';
            document.getElementById('lessonAnswerArea').style.display = 'none';
            lessonFeedback.textContent = '✅ You\'re a genius! ⭐';
            return;
        }
        const q = lessonData[lessonIndex];
        lessonQuestion.textContent = 'Q' + (lessonIndex + 1) + ': ' + q.q;
        lessonCurrentAnswer = q.a.toLowerCase().trim();
        lessonAnswer.value = '';
        lessonFeedback.textContent = '';
        document.getElementById('lessonAnswerArea').style.display = 'flex';
    }

    function checkLessonAnswer() {
        if (!lessonActive || !lessonData || lessonIndex >= lessonData.length) return;
        const userAns = lessonAnswer.value.trim().toLowerCase();
        if (userAns === lessonCurrentAnswer) {
            lessonScoreVal += 10;
            lessonFeedback.innerHTML = '✅ Correct! +10 🎉';
        } else {
            lessonFeedback.innerHTML = '❌ Wrong. Answer: <strong>' + lessonData[lessonIndex].a + '</strong>';
        }
        lessonScore.textContent = 'Score: ' + lessonScoreVal;
        lessonIndex++;
        setTimeout(showLessonQuestion, 1000);
    }

    // ===== INIT =====
    function init() {
        console.log('🦁 SAFARI AI: Initializing...');
        loadTheme();
        initVoice();

        // ---- LOGIN ----
        loginBtn.addEventListener('click', login);
        loginEmail.addEventListener('keydown', function(e) { if (e.key === 'Enter') login(); });

        // ---- SEND ----
        sendBtn.addEventListener('click', function() { processCommand(chatInput.value); });
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                processCommand(chatInput.value);
            }
        });

        // ---- QUICK REPLIES ----
        quickReplies.addEventListener('click', function(e) {
            const btn = e.target.closest('button');
            if (btn) {
                const msg = btn.dataset.msg;
                if (msg === 'safari generate cat') {
                    processCommand('safari generate a cute cat');
                } else {
                    processCommand(msg);
                }
            }
        });

        // ---- FILE UPLOAD ----
        fileUpload.addEventListener('change', function(e) {
            if (this.files[0]) handleFileUpload(this.files[0]);
            this.value = '';
        });

        // ---- THEME ----
        themeToggle.addEventListener('click', toggleTheme);

        // ---- MENU ----
        hamburgerBtn.addEventListener('click', function() {
            menuPanel.classList.add('open');
            menuOverlay.classList.add('open');
        });
        menuClose.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
        });
        menuOverlay.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
        });

        // ---- MENU ITEMS ----
        menuContact.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            const choice = confirm('Contact us?\nOK = WhatsApp (+' + OWNER.phone1 + ')\nCancel = Call (+' + OWNER
            .phone2 + ')');
            if (choice) window.open('https://wa.me/' + OWNER.phone1.replace('+', '') + '?text=Hello%20Safari%20AI',
                '_blank');
            else window.location.href = 'tel:' + OWNER.phone2;
        });

        menuFollow.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            window.open(OWNER.channel, '_blank');
        });

        menuNewChat.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            chatMessages.innerHTML = '';
            folders[currentFolder] = [];
            saveFolders();
            loadChatHistory();
            addMessage('assistant',
                '🔄 New conversation started! How can I help you?<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>'
                );
        });

        menuNewFolder.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            const name = prompt('New folder name:');
            if (name && name.trim()) {
                if (folders[name.trim()]) { showToast('Folder exists.'); return; }
                folders[name.trim()] = [];
                currentFolder = name.trim();
                saveFolders();
                renderFolderList();
                loadChatHistory();
                showToast('📁 Folder "' + name.trim() + '" created!');
            }
        });

        menuExportChat.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            const msgs = folders[currentFolder] || [];
            if (msgs.length === 0) { showToast('No messages to export.'); return; }
            let txt = 'SAFARI AI CHAT EXPORT\nFolder: ' + currentFolder + '\nDate: ' + new Date().toISOString() +
                '\n' + '='.repeat(40) + '\n\n';
            msgs.forEach(function(m) {
                const role = m.role === 'user' ? 'YOU' : 'SAFARI AI';
                txt += '[' + role + '] (' + (m.time || '') + ')\n' + m.content.replace(/<[^>]*>/g, '') + '\n\n';
            });
            const blob = new Blob([txt], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'SafariAI_' + currentFolder + '_' + Date.now() + '.txt';
            a.click();
            URL.revokeObjectURL(url);
            showToast('📥 Chat exported!');
        });

        menuClearChat.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            if (confirm('Clear chat history in this folder?')) {
                folders[currentFolder] = [];
                saveFolders();
                loadChatHistory();
                showToast('🗑️ Chat cleared!');
            }
        });

        menuLessons.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            if (!lessonActive) loadLesson('math');
            else lessonPanel.classList.toggle('hidden');
        });

        menuFootball.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            processCommand('football today');
        });

        menuLogout.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            if (confirm('Logout?')) logout();
        });

        // ---- LESSONS ----
        lessonStartBtn.addEventListener('click', function() { loadLesson(lessonClass.value); });
        lessonNextBtn.addEventListener('click', function() { if (lessonActive) { lessonIndex++;
                showLessonQuestion(); } });
        lessonSubmitBtn.addEventListener('click', checkLessonAnswer);
        lessonAnswer.addEventListener('keydown', function(e) { if (e.key === 'Enter') checkLessonAnswer(); });

        // ---- KEYBOARD SHORTCUT ----
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                menuPanel.classList.remove('open');
                menuOverlay.classList.remove('open');
            }
        });

        // ---- SESSION ----
        if (!checkSession()) {
            loginScreen.classList.remove('hidden');
            chatInterface.classList.add('hidden');
        }

        console.log('🦁 SAFARI AI: Initialization complete!');
        console.log('👤 Owner: ' + OWNER.name);
        console.log('📢 Channel: ' + OWNER.channel);
    }

    // ---- START ----
    document.addEventListener('DOMContentLoaded', init);

})();

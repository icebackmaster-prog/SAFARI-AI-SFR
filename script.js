(function() {
    'use strict';

    // ========== CONFIG (Branded) ==========
    const CONFIG = {
        CHAT_API: 'https://api.hostify.co.zw/api/ai/chatespanyol',
        FALLBACK_CHAT_API: 'https://api.hostify.co.zw/api/ai/gemini',
        IMAGE_API: 'https://image.pollinations.ai/prompt',
        STORAGE_KEY: 'safari_messages',
        USER_KEY: 'safari_user',
        PHONE1: '+263788377887',
        PHONE2: '+263788848481',
        CHANNEL: 'https://whatsapp.com/channel/0029VbC0Vi50wajpq5TlRi0B'
    };

    // ========== DOM REFS ==========
    const $ = id => document.getElementById(id);
    const loginScreen = $('loginScreen');
    const chatInterface = $('chatInterface');
    const loginEmail = $('loginEmail');
    const loginPassword = $('loginPassword');
    const loginBtn = $('loginBtn');
    const guestBtn = $('guestBtn');
    const loginError = $('loginError');
    const codeHint = $('codeHint');
    const userBadge = $('userBadge');
    const chatMessages = $('chatMessages');
    const chatInput = $('chatInput');
    const sendBtn = $('sendBtn');
    const fileUpload = $('fileUpload');
    const voiceBtn = $('voiceBtn');
    const themeToggle = $('themeToggle');
    const hamburgerBtn = $('hamburgerBtn');
    const menuPanel = $('menuPanel');
    const menuOverlay = $('menuOverlay');
    const menuClose = $('menuClose');
    const menuContact = $('menuContact');
    const menuFollow = $('menuFollow');
    const menuNewChat = $('menuNewChat');
    const menuLessons = $('menuLessons');
    const menuFootball = $('menuFootball');
    const menuClearChat = $('menuClearChat');
    const menuLogout = $('menuLogout');
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

    // ========== STATE ==========
    let currentUser = null;
    let isProcessing = false;
    let messageHistory = [];
    let lessonActive = false;
    let lessonData = [];
    let lessonIndex = 0;
    let lessonScoreVal = 0;
    let lessonCurrentAnswer = '';
    let recognition = null;

    // ========== THEME ==========
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

    // ========== VOICE INPUT ==========
    function initVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceBtn.style.display = 'none';
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        voiceBtn.addEventListener('click', () => {
            if (isProcessing) return;
            if (voiceBtn.classList.contains('recording')) {
                recognition.stop();
                return;
            }
            try {
                recognition.start();
                voiceBtn.classList.add('recording');
                voiceBtn.textContent = '⏹️';
            } catch (e) { /* ignore */ }
        });

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    chatInput.value = transcript;
                    voiceBtn.classList.remove('recording');
                    voiceBtn.textContent = '🎤';
                    processCommand(transcript);
                }
            }
        };
        recognition.onerror = () => {
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
        };
        recognition.onend = () => {
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
        };
    }

    // ========== HELPERS ==========
    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function parseMarkdown(text) {
        let html = escapeHtml(text);
        html = html.replace(/```([\s\S]*?)```/g, '<pre style="background:var(--bg-input);padding:10px;border-radius:8px;overflow-x:auto;"><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code style="background:var(--bg-input);padding:2px 6px;border-radius:4px;">$1</code>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/^### (.*)$/gm, '<h4 style="margin:8px 0 4px;">$1</h4>');
        html = html.replace(/\n/g, '<br />');
        return html;
    }

    function scrollChat() { chatMessages.scrollTop = chatMessages.scrollHeight; }

    function showTyping() {
        const el = document.createElement('div');
        el.className = 'typing-indicator';
        el.id = 'typingIndicator';
        el.innerHTML = '<span>•</span><span>•</span><span>•</span>';
        chatMessages.appendChild(el);
        scrollChat();
    }

    function removeTyping() { const el = document.getElementById('typingIndicator'); if (el) el.remove(); }

    // ========== SAVE / LOAD MESSAGES ==========
    function saveMessages() {
        const msgs = [];
        document.querySelectorAll('.message').forEach(el => {
            const role = el.classList.contains('user') ? 'user' : 'assistant';
            const content = el.querySelector('.msg-content')?.innerHTML || el.textContent;
            msgs.push({ role, content });
        });
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(msgs));
    }

    function loadMessages() {
        const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!raw) return false;
        try {
            const msgs = JSON.parse(raw);
            chatMessages.innerHTML = '';
            msgs.forEach(msg => {
                const div = document.createElement('div');
                div.className = `message ${msg.role}`;
                if (msg.role === 'assistant') {
                    const label = document.createElement('div');
                    label.className = 'msg-label';
                    label.textContent = '🧠 SAFARI AI (by ICEBACK MASTER TECH)';
                    div.appendChild(label);
                }
                const content = document.createElement('div');
                content.className = 'msg-content';
                content.innerHTML = msg.content;
                div.appendChild(content);
                chatMessages.appendChild(div);
            });
            scrollChat();
            return true;
        } catch (e) { return false; }
    }

    // ========== ADD MESSAGE (With Copy Button) ==========
    function addMessage(role, content, extra = null) {
        const div = document.createElement('div');
        div.className = `message ${role}`;

        if (role === 'assistant') {
            const label = document.createElement('div');
            label.className = 'msg-label';
            label.textContent = '🧠 SAFARI AI (by ICEBACK MASTER TECH)';
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

        // Actions container
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'msg-actions';

        // Copy button for AI messages
        if (role === 'assistant') {
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋 Copy';
            copyBtn.onclick = () => {
                const textToCopy = contentDiv.textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    copyBtn.textContent = '✅ Copied!';
                    setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
                }).catch(() => alert('Copy manually!'));
            };
            actionsDiv.appendChild(copyBtn);
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
                extra.actions.forEach(a => {
                    const btn = document.createElement('button');
                    btn.textContent = a.label;
                    btn.onclick = a.action;
                    actionsDiv.appendChild(btn);
                });
            }
            if (extra.downloadUrl) {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file-attach';
                fileDiv.innerHTML = `📎 <a href="${extra.downloadUrl}" target="_blank">Download file</a>`;
                div.appendChild(fileDiv);
            }
        }

        if (actionsDiv.children.length > 0) {
            div.appendChild(actionsDiv);
        }

        chatMessages.appendChild(div);
        scrollChat();
        saveMessages();
    }

    // ========== SMART AI ENGINE (Fixed Empty) ==========
    async function askAI(query, context = '') {
        const systemContext = context || `You are Safari AI, created by ICEBACK MASTER TECH from Safari Technology. 
            Be conversational, funny, and helpful. If asked about football, give scores. 
            If asked to generate images, guide them to use "safari generate". 
            Always mention "POWERED BY ICEBACK MASTER TECH" at the end.`;

        try {
            let response = await fetch(CONFIG.CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query, context: systemContext, history: messageHistory.slice(-6) })
            });

            let data = {};
            if (response.ok) data = await response.json();

            const reply = data.response || data.message || data.reply || data.text || data.content || data.result || null;
            if (reply && reply.trim().length > 0) {
                return reply.includes('POWERED BY ICEBACK MASTER TECH') ? reply : reply + '<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
            }

            // Fallback
            response = await fetch(CONFIG.FALLBACK_CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query, context: systemContext })
            });
            if (response.ok) {
                data = await response.json();
                const reply2 = data.response || data.message || data.reply || data.text || data.content || data.result || null;
                if (reply2 && reply2.trim().length > 0) {
                    return reply2.includes('POWERED BY ICEBACK MASTER TECH') ? reply2 : reply2 + '<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
                }
            }

            return smartFallback(query);
        } catch (e) {
            console.error('AI Error:', e);
            return smartFallback(query);
        }
    }

    function smartFallback(query) {
        const q = query.toLowerCase();
        if (q.includes('hi') || q.includes('hello')) return '👋 Hello! I\'m Safari AI by ICEBACK MASTER TECH. How can I help? 😄<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        if (q.includes('how are you')) return 'I\'m phenomenal! Ready to assist you 24/7. 🚀<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        if (q.includes('joke')) {
            const jokes = ['Why do programmers prefer dark mode? Light attracts bugs! 🐛', 'What do you call a fake noodle? An *impasta*! 🍝', 'Why did the AI break up with the human? Too many bugs! 🤖'];
            return jokes[Math.floor(Math.random() * jokes.length)] + '<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        }
        if (q.includes('what is ai')) return '🧠 AI simulates human intelligence. I\'m Safari AI, built by ICEBACK MASTER TECH to chat, generate images, and teach lessons!<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        if (q.includes('football')) return '⚽ <strong>Today\'s Top Matches:</strong><br>• Liverpool 3 - 1 Arsenal<br>• Man City 2 - 2 Chelsea<br>• Barcelona 4 - 0 Real Madrid<br>🔮 Prediction: Liverpool win!<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        return `🤔 I'm Safari AI. Try "safari generate cat", "football today", or tell me a joke!<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
    }

    // ========== IMAGE GENERATION (REAL) ==========
    async function generateImage(desc) {
        const imageUrl = `${CONFIG.IMAGE_API}/${encodeURIComponent(desc)}?width=512&height=512&nologo=true&seed=${Date.now()}`;
        return {
            message: `🖼️ Generated: <strong>${escapeHtml(desc)}</strong>`,
            extra: {
                image: imageUrl,
                actions: [
                    { label: '💾 Download', action: () => window.open(imageUrl, '_blank') },
                    { label: '📤 Share', action: () => { if (navigator.share) navigator.share({ title: desc, url: imageUrl }); else navigator.clipboard.writeText(imageUrl).then(() => alert('Link copied!')); } }
                ]
            }
        };
    }

    // ========== MUSIC ==========
    async function fetchMusic(song, artist) {
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(song + ' ' + artist)}`;
        return {
            message: `🎵 <strong>${escapeHtml(song)}</strong> by ${escapeHtml(artist)}`,
            extra: {
                downloadUrl: url,
                actions: [{ label: '🔍 Search YouTube', action: () => window.open(url, '_blank') }]
            }
        };
    }

    // ========== PROCESS COMMAND ==========
    async function processCommand(input) {
        if (isProcessing) return;
        const trimmed = input.trim();
        if (!trimmed) return;

        addMessage('user', escapeHtml(trimmed));
        chatInput.value = '';
        isProcessing = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            const lower = trimmed.toLowerCase();

            const genMatch = lower.match(/safari\s+generate\s+(.+)/i);
            if (genMatch) {
                removeTyping();
                const result = await generateImage(genMatch[1].trim());
                addMessage('assistant', result.message, result.extra);
                isProcessing = false; sendBtn.disabled = false; return;
            }

            const musicMatch = lower.match(/safari\s+play\s+(.+?)\s+by\s+(.+)/i);
            if (musicMatch) {
                removeTyping();
                const result = await fetchMusic(musicMatch[1].trim(), musicMatch[2].trim());
                addMessage('assistant', result.message, result.extra);
                isProcessing = false; sendBtn.disabled = false; return;
            }

            if (lower.includes('football') || lower.includes('match')) {
                removeTyping();
                addMessage('assistant', await askAI(trimmed));
                isProcessing = false; sendBtn.disabled = false; return;
            }

            removeTyping();
            addMessage('assistant', await askAI(trimmed));

        } catch (err) {
            removeTyping();
            addMessage('assistant', '⚠️ Error. Please try again.<br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>');
            console.error(err);
        }
        isProcessing = false;
        sendBtn.disabled = false;
    }

    // ========== LESSONS ==========
    const lessonBank = {
        math: { name: 'Math', questions: [{ q: '12 + 7 = ?', a: '19' }, { q: '15 × 4 = ?', a: '60' }, { q: '√144 = ?', a: '12' }] },
        science: { name: 'Science', questions: [{ q: 'Chemical symbol for water?', a: 'H2O' }, { q: 'Red Planet?', a: 'Mars' }, { q: 'Largest organ?', a: 'Skin' }] },
        english: { name: 'English', questions: [{ q: 'Past tense of "go"?', a: 'went' }, { q: 'Plural of "child"?', a: 'children' }, { q: 'Synonym for "happy"?', a: 'joyful' }] },
        coding: { name: 'Coding', questions: [{ q: 'HTML stands for?', a: 'HyperText Markup Language' }, { q: 'What is a variable?', a: 'A container for data' }, { q: 'What does CSS do?', a: 'Styles web pages' }] }
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
        lessonQuestion.textContent = `Q${lessonIndex+1}: ${q.q}`;
        lessonCurrentAnswer = q.a.toLowerCase().trim();
        lessonAnswer.value = '';
        lessonFeedback.textContent = '';
        document.getElementById('lessonAnswerArea').style.display = 'flex';
    }

    function checkLessonAnswer() {
        if (!lessonActive || !lessonData || lessonIndex >= lessonData.length) return;
        const userAns = lessonAnswer.value.trim().toLowerCase();
        if (userAns === lessonCurrentAnswer) { lessonScoreVal += 10;
            lessonFeedback.innerHTML = '✅ Correct! +10 🎉'; } else lessonFeedback.innerHTML = `❌ Wrong. Answer: <strong>${lessonData[lessonIndex].a}</strong>`;
        lessonScore.textContent = `Score: ${lessonScoreVal}`;
        lessonIndex++;
        setTimeout(showLessonQuestion, 1000);
    }

    // ========== LOGIN / SESSION ==========
    function loginUser(identifier) {
        currentUser = { identifier, loginTime: Date.now() };
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(currentUser));
        userBadge.textContent = identifier.length > 12 ? identifier.slice(0, 10) + '…' : identifier;
        loginScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');
        if (!loadMessages()) {
            addMessage('assistant', `👋 Welcome back, <strong>${escapeHtml(identifier)}</strong>! I'm Safari AI by ICEBACK MASTER TECH. How can I help? 😄<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`);
        }
    }

    function login() {
        const email = loginEmail.value.trim();
        const pass = loginPassword.value.trim();
        if (!email || !pass) { loginError.textContent = 'Please fill in all fields.'; return; }
        loginError.textContent = '';
        codeHint.textContent = '📲 Verifying...';
        loginBtn.disabled = true;
        setTimeout(() => {
            loginUser(email);
            loginBtn.disabled = false;
            codeHint.textContent = '✅ Logged in successfully!';
        }, 500);
    }

    function guestLogin() {
        const guestName = 'Guest_' + Math.floor(Math.random() * 1000);
        loginUser(guestName);
    }

    function logout() {
        localStorage.removeItem(CONFIG.USER_KEY);
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        currentUser = null;
        userBadge.textContent = 'Guest';
        chatInterface.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        chatMessages.innerHTML = '';
        lessonPanel.classList.add('hidden');
        lessonActive = false;
    }

    function checkSession() {
        const saved = localStorage.getItem(CONFIG.USER_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (Date.now() - data.loginTime < 86400000) {
                    loginScreen.classList.add('hidden');
                    chatInterface.classList.remove('hidden');
                    userBadge.textContent = data.identifier.length > 12 ? data.identifier.slice(0, 10) + '…' : data.identifier;
                    if (!loadMessages()) {
                        addMessage('assistant', `👋 Welcome back, <strong>${escapeHtml(data.identifier)}</strong>! Ready to assist!<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`);
                    }
                    return true;
                }
            } catch (e) { localStorage.removeItem(CONFIG.USER_KEY); }
        }
        return false;
    }

    // ========== EVENT LISTENERS ==========
    function init() {
        loadTheme();
        initVoice();

        loginBtn.addEventListener('click', login);
        guestBtn.addEventListener('click', guestLogin);
        loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

        sendBtn.addEventListener('click', () => processCommand(chatInput.value));
        chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault();
                processCommand(chatInput.value); } });

        quickReplies.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn) processCommand(btn.dataset.msg);
        });

        fileUpload.addEventListener('change', function(e) {
            const file = this.files[0];
            if (!file) return;
            addMessage('user', `📎 Attached: ${escapeHtml(file.name)}`);
            showTyping();
            setTimeout(() => { removeTyping();
                addMessage('assistant', `📁 File <strong>${escapeHtml(file.name)}</strong> received!<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`); }, 600);
            this.value = '';
        });

        themeToggle.addEventListener('click', toggleTheme);

        // Menu
        hamburgerBtn.addEventListener('click', () => { menuPanel.classList.add('open');
            menuOverlay.classList.add('open'); });
        menuClose.addEventListener('click', () => { menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open'); });
        menuOverlay.addEventListener('click', () => { menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open'); });

        menuContact.addEventListener('click', () => {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            const choice = confirm(`Contact us?\nOK = WhatsApp (+${CONFIG.PHONE1})\nCancel = Call (+${CONFIG.PHONE2})`);
            if (choice) window.open(`https://wa.me/${CONFIG.PHONE1.replace('+','')}?text=Hello%20Safari%20AI`, '_blank');
            else window.location.href = `tel:${CONFIG.PHONE2}`;
        });

        menuFollow.addEventListener('click', () => {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            window.open(CONFIG.CHANNEL, '_blank');
        });

        menuNewChat.addEventListener('click', () => {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            chatMessages.innerHTML = '';
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            addMessage('assistant', '🔄 New conversation! How can I help?<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>');
        });

        menuClearChat.addEventListener('click', () => {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            if (confirm('Clear chat history?')) {
                chatMessages.innerHTML = '';
                localStorage.removeItem(CONFIG.STORAGE_KEY);
                addMessage('assistant', '🗑️ History cleared!<br/><br/><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>');
            }
        });

        menuLessons.addEventListener('click', () => {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            if (!lessonActive) loadLesson('math');
            else lessonPanel.classList.toggle('hidden');
        });

        menuFootball.addEventListener('click', () => {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            processCommand('football today');
        });

        menuLogout.addEventListener('click', () => {
            menuPanel.classList.remove('open');
            menuOverlay.classList.remove('open');
            if (confirm('Logout?')) logout();
        });

        // Lessons
        lessonStartBtn.addEventListener('click', () => loadLesson(lessonClass.value));
        lessonNextBtn.addEventListener('click', () => { if (lessonActive) { lessonIndex++;
                showLessonQuestion(); } });
        lessonSubmitBtn.addEventListener('click', checkLessonAnswer);
        lessonAnswer.addEventListener('keydown', e => { if (e.key === 'Enter') checkLessonAnswer(); });

        if (!checkSession()) {
            loginScreen.classList.remove('hidden');
            chatInterface.classList.add('hidden');
        }

        console.log('🚀 SAFARI AI v3.0 (Website) by ICEBACK MASTER TECH loaded.');
    }

    document.addEventListener('DOMContentLoaded', init);
})();

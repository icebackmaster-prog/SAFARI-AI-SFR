(function() {
    'use strict';

    const CONFIG = {
        CHAT_API: 'https://api.hostify.co.zw/api/ai/chatespanyol',
        FALLBACK_CHAT_API: 'https://api.hostify.co.zw/api/ai/gemini',
        IMAGE_API: 'https://image.pollinations.ai/prompt',
        WIKI_API: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
        STORAGE_KEY: 'safari_folders',
        USER_KEY: 'safari_user',
        PHONE1: '+263788377887',
        PHONE2: '+263788848481',
        CHANNEL: 'https://whatsapp.com/channel/0029VbC0Vi50wajpq5TlRi0B'
    };

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

    let currentUser = null, isProcessing = false, folders = {}, currentFolder = 'Default';
    let lastUserMessage = '', streamInterval = null, recognition = null;

    // ========== THEME ==========
    function toggleTheme() {
        const html = document.documentElement;
        const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
        localStorage.setItem('safari_theme', next);
    }
    function loadTheme() {
        const saved = localStorage.getItem('safari_theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        themeToggle.textContent = saved === 'light' ? '🌙' : '☀️';
    }

    // ========== VOICE ==========
    function initVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { voiceBtn.style.display = 'none'; return; }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;
        voiceBtn.addEventListener('click', () => {
            if (isProcessing) return;
            if (voiceBtn.classList.contains('recording')) { recognition.stop(); return; }
            try { recognition.start(); voiceBtn.classList.add('recording'); voiceBtn.textContent = '⏹️'; } catch(e) {}
        });
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    chatInput.value = transcript;
                    voiceBtn.classList.remove('recording'); voiceBtn.textContent = '🎤';
                    processCommand(transcript);
                }
            }
        };
        recognition.onerror = () => { voiceBtn.classList.remove('recording'); voiceBtn.textContent = '🎤'; };
        recognition.onend = () => { voiceBtn.classList.remove('recording'); voiceBtn.textContent = '🎤'; };
    }

    // ========== MARKDOWN PARSER (FIXED - no HTML escaping!) ==========
    function parseMarkdown(text) {
        let html = text;
        html = html.replace(/<script/gi, '&lt;script');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
            return '<pre style="background:var(--bg-input);padding:10px;border-radius:8px;overflow-x:auto;"><code>' + code + '</code></pre>';
        });
        html = html.replace(/`([^`]+)`/g, '<code style="background:var(--bg-input);padding:2px 6px;border-radius:4px;">$1</code>');
        html = html.replace(/\n/g, '<br />');
        return html;
    }

    function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
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

    // ========== FOLDERS ==========
    function saveFolders() { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(folders)); }
    function loadFolders() {
        const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (raw) { try { folders = JSON.parse(raw); } catch(e) { folders = { 'Default': [] }; } } 
        else { folders = { 'Default': [] }; }
        if (!folders[currentFolder]) currentFolder = Object.keys(folders)[0] || 'Default';
        if (!folders[currentFolder]) folders[currentFolder] = [];
    }
    function renderFolderList() {
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
                if (Object.keys(folders).length <= 1) { alert('Cannot delete the last folder.'); return; }
                if (confirm(`Delete folder "${name}"?`)) {
                    delete folders[name];
                    if (currentFolder === name) currentFolder = Object.keys(folders)[0];
                    saveFolders(); renderFolderList(); loadChatHistory();
                }
            });
            folderList.appendChild(div);
        });
    }
    function switchFolder(name) {
        if (!folders[name]) return;
        currentFolder = name;
        saveFolders(); renderFolderList(); loadChatHistory();
        menuPanel.classList.remove('open'); menuOverlay.classList.remove('open');
    }

    // ========== CHAT HISTORY ==========
    function loadChatHistory() {
        chatMessages.innerHTML = '';
        const msgs = folders[currentFolder] || [];
        if (msgs.length === 0) {
            const welcome = `👋 Welcome to <strong>${escapeHtml(currentFolder)}</strong>! I'm Safari AI. How can I help? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
            const div = document.createElement('div');
            div.className = 'message assistant';
            div.innerHTML = `<div class="msg-label">🧠 SAFARI AI</div><div class="msg-content">${parseMarkdown(welcome)}</div><div class="msg-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>`;
            chatMessages.appendChild(div);
            scrollChat(); return;
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
            time.textContent = msg.time || new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
            div.appendChild(time);
            chatMessages.appendChild(div);
        });
        scrollChat();
    }
    function saveMessage(role, content) {
        if (!folders[currentFolder]) folders[currentFolder] = [];
        folders[currentFolder].push({ role, content, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) });
        saveFolders();
    }

    // ========== ADD MESSAGE ==========
    function addMessage(role, content, extra = null, stream = false) {
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
        if (stream && role === 'assistant') {
            contentDiv.innerHTML = '<span class="typing-cursor"></span>';
        } else {
            contentDiv.innerHTML = parseMarkdown(content);
        }
        div.appendChild(contentDiv);

        const time = document.createElement('div');
        time.className = 'msg-time';
        time.textContent = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        div.appendChild(time);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'msg-actions';

        if (role === 'assistant') {
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '📋 Copy';
            copyBtn.onclick = () => {
                const text = contentDiv.textContent;
                navigator.clipboard.writeText(text).then(() => { copyBtn.textContent = '✅ Copied!'; setTimeout(() => copyBtn.textContent = '📋 Copy', 2000); });
            };
            actionsDiv.appendChild(copyBtn);

            const speakBtn = document.createElement('button');
            speakBtn.textContent = '🔊 Speak';
            speakBtn.onclick = () => {
                const text = contentDiv.textContent;
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 1.0;
                    window.speechSynthesis.speak(utterance);
                } else alert('Speech not supported.');
            };
            actionsDiv.appendChild(speakBtn);

            const regenBtn = document.createElement('button');
            regenBtn.textContent = '🔄 Regenerate';
            regenBtn.onclick = () => {
                if (lastUserMessage) {
                    const msgs = chatMessages.querySelectorAll('.message');
                    if (msgs.length > 0 && msgs[msgs.length-1].classList.contains('assistant')) {
                        msgs[msgs.length-1].remove();
                        folders[currentFolder].pop();
                        saveFolders();
                    }
                    processCommand(lastUserMessage);
                }
            };
            actionsDiv.appendChild(regenBtn);
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

        if (actionsDiv.children.length > 0) div.appendChild(actionsDiv);
        chatMessages.appendChild(div);
        scrollChat();
        if (!stream) saveMessage(role, contentDiv.innerHTML);
        return contentDiv;
    }

    // ========== STREAMING ==========
    function streamMessage(fullText, contentDiv) {
        if (streamInterval) clearInterval(streamInterval);
        let index = 0;
        const chars = fullText.split('');
        contentDiv.innerHTML = '';
        streamInterval = setInterval(() => {
            if (index < chars.length) {
                contentDiv.innerHTML += chars[index];
                index++;
                scrollChat();
            } else {
                clearInterval(streamInterval);
                streamInterval = null;
                contentDiv.innerHTML = parseMarkdown(fullText);
                saveMessage('assistant', contentDiv.innerHTML);
                scrollChat();
            }
        }, 15);
    }

    // ========== AI ENGINE ==========
    function getPersonaPrompt() {
        const p = personaSelect.value;
        const base = 'You are Safari AI, created by ICEBACK MASTER TECH from Safari Technology. Be helpful and end with "POWERED BY ICEBACK MASTER TECH".';
        if (p === 'comedian') return 'You are a stand-up comedian. Be hilarious and sarcastic. ' + base;
        if (p === 'teacher') return 'You are a patient, knowledgeable professor. Explain things simply. ' + base;
        if (p === 'chef') return 'You are a world-class chef. Give recipes and cooking tips. ' + base;
        if (p === 'programmer') return 'You are a senior software engineer. Give clean code examples. ' + base;
        return 'You are a friendly, versatile assistant. ' + base;
    }

    async function askAI(query) {
        const context = getPersonaPrompt();
        try {
            let response = await fetch(CONFIG.CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query, context, history: [] })
            });
            let data = {};
            if (response.ok) data = await response.json();
            const reply = data.response || data.message || data.reply || data.text || data.content || data.result || null;
            if (reply && reply.trim().length > 0) {
                return reply.includes('POWERED BY ICEBACK MASTER TECH') ? reply : reply + '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
            }
            response = await fetch(CONFIG.FALLBACK_CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query, context })
            });
            if (response.ok) {
                data = await response.json();
                const reply2 = data.response || data.message || data.reply || data.text || data.content || data.result || null;
                if (reply2 && reply2.trim().length > 0) return reply2.includes('POWERED BY ICEBACK MASTER TECH') ? reply2 : reply2 + '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
            }
            return smartFallback(query);
        } catch(e) {
            console.error('AI Error:', e);
            return smartFallback(query);
        }
    }

    function smartFallback(query) {
        const q = query.toLowerCase();
        if (q.includes('hi') || q.includes('hello')) return '👋 Hello! I\'m Safari AI by ICEBACK MASTER TECH. How can I help? 😄<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        if (q.includes('joke')) {
            const jokes = ['Why do programmers prefer dark mode? Light attracts bugs! 🐛', 'What do you call a fake noodle? An *impasta*! 🍝'];
            return jokes[Math.floor(Math.random() * jokes.length)] + '<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        }
        if (q.includes('football')) return '⚽ <strong>Today\'s Top Matches:</strong><br />• Liverpool 3 - 1 Arsenal<br />• Man City 2 - 2 Chelsea<br />🔮 Prediction: Liverpool win!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>';
        return `🤔 I'm Safari AI. Try "safari generate cat", "safari search London", or tell me a joke!<br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
    }

    // ========== WIKIPEDIA ==========
    async function wikipediaSearch(query) {
        try {
            const resp = await fetch(CONFIG.WIKI_API + encodeURIComponent(query));
            if (!resp.ok) return `⚠️ Could not find "${query}" on Wikipedia.`;
            const data = await resp.json();
            if (data.extract) return `🔍 <strong>${data.title}</strong><br />${data.extract}<br /><br />📖 <a href="${data.content_urls?.desktop?.page}" target="_blank">Read more</a><br /><br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>`;
            return `No summary found for "${query}".`;
        } catch(e) { return `Error searching Wikipedia.`; }
    }

    // ========== IMAGE ==========
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

    // ========== PROCESS COMMAND ==========
    async function processCommand(input) {
        if (isProcessing) return;
        const trimmed = input.trim();
        if (!trimmed) return;

        addMessage('user', escapeHtml(trimmed));
        lastUserMessage = trimmed;
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

            const searchMatch = lower.match(/safari\s+search\s+(.+)/i);
            if (searchMatch) {
                removeTyping();
                const result = await wikipediaSearch(searchMatch[1].trim());
                addMessage('assistant', result);
                isProcessing = false; sendBtn.disabled = false; return;
            }

            const musicMatch = lower.match(/safari\s+play\s+(.+?)\s+by\s+(.+)/i);
            if (musicMatch) {
                removeTyping();
                const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(musicMatch[1].trim() + ' ' + musicMatch[2].trim())}`;
                addMessage('assistant', `🎵 <strong>${escapeHtml(musicMatch[1].trim())}</strong> by ${escapeHtml(musicMatch[2].trim())}`, {
                    downloadUrl: url,
                    actions: [{ label: '🔍 Search YouTube', action: () => window.open(url, '_blank') }]
                });
                isProcessing = false; sendBtn.disabled = false; return;
            }

            if (lower.includes('football') || lower.includes('match')) {
                removeTyping();
                addMessage('assistant', await askAI(trimmed));
                isProcessing = false; sendBtn.disabled = false; return;
            }

            removeTyping();
            const fullReply = await askAI(trimmed);
            const contentDiv = addMessage('assistant', '', null, true);
            streamMessage(fullReply, contentDiv);

        } catch (err) {
            removeTyping();
            addMessage('assistant', '⚠️ Error. Please try again.<br /><strong>⚡ POWERED BY ICEBACK MASTER TECH</strong>');
            console.error(err);
        }
        isProcessing = false;
        sendBtn.disabled = false;
    }

    // ========== FILE HANDLING ==========
    async function handleFileUpload(file) {
        const fileName = file.name;
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = async (e) => {
                const text = e.target.result;
                addMessage('user', `📄 Uploaded: ${escapeHtml(fileName)}`);
                showTyping();
                const reply = await askAI(`I uploaded a text file named ${fileName}. Content: ${text.slice(0, 1500)}. Please summarize or discuss.`);
                removeTyping();
                const cd = addMessage('assistant', '', null, true);
                streamMessage(reply, cd);
            };
        } else if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                addMessage('user', `📄 Uploaded PDF: ${escapeHtml(fileName)}`);
                showTyping();
                const reply = await askAI(`I uploaded a PDF named ${fileName}. Content: ${fullText.slice(0, 2000)}. Please summarize.`);
                removeTyping();
                const cd = addMessage('assistant', '', null, true);
                streamMessage(reply, cd);
            } catch(e) {
                addMessage('assistant', '⚠️ Could not read PDF. Ensure it is text-based.');
            }
        } else if (file.type.startsWith('image/')) {
            addMessage('user', `🖼️ Uploaded image: ${escapeHtml(fileName)}`);
            addMessage('assistant', `📸 Image received! Try "safari generate ${file.name.split('.')[0]}" to create one!`);
        }
        fileUpload.value = '';
    }

    // ========== EXPORT ==========
    function exportChat() {
        const msgs = folders[currentFolder] || [];
        if (msgs.length === 0) { alert('No messages to export.'); return; }
        let txt = `SAFARI AI CHAT EXPORT\nFolder: ${currentFolder}\nDate: ${new Date().toISOString()}\n${'='.repeat(40)}\n\n`;
        msgs.forEach(m => {
            const role = m.role === 'user' ? 'YOU' : 'SAFARI AI';
            txt += `[${role}] (${m.time || ''})\n${m.content.replace(/<[^>]*>/g, '')}\n\n`;
        });
        const blob = new Blob([txt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SafariAI_${currentFolder}_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ========== LOGIN ==========
    function loginUser(identifier) {
        currentUser = { identifier };
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(currentUser));
        userBadge.textContent = identifier.length > 12 ? identifier.slice(0,10)+'…' : identifier;
        loginScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');
        loadFolders();
        renderFolderList();
        loadChatHistory();
    }
    function login() {
        const name = loginEmail.value.trim();
        if (!name) { loginError.textContent = 'Enter a username.'; return; }
        loginError.textContent = '';
        codeHint.textContent = '✅ Logging in...';
        loginBtn.disabled = true;
        setTimeout(() => { loginUser(name); loginBtn.disabled = false; codeHint.textContent = '✅ Welcome!'; }, 300);
    }
    function logout() {
        localStorage.removeItem(CONFIG.USER_KEY);
        currentUser = null; userBadge.textContent = 'Guest';
        chatInterface.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        chatMessages.innerHTML = '';
        lessonPanel.classList.add('hidden');
        if (streamInterval) clearInterval(streamInterval);
    }
    function checkSession() {
        const saved = localStorage.getItem(CONFIG.USER_KEY);
        if (saved) {
            try { const data = JSON.parse(saved); loginUser(data.identifier); return true; } 
            catch(e) { localStorage.removeItem(CONFIG.USER_KEY); }
        }
        return false;
    }

    // ========== LESSONS ==========
    const lessonBank = {
        math: { name: 'Math', questions: [{ q: '12 + 7 = ?', a: '19' }, { q: '15 × 4 = ?', a: '60' }, { q: '√144 = ?', a: '12' }] },
        science: { name: 'Science', questions: [{ q: 'Chemical symbol for water?', a: 'H2O' }, { q: 'Red Planet?', a: 'Mars' }, { q: 'Largest organ?', a: 'Skin' }] },
        english: { name: 'English', questions: [{ q: 'Past tense of "go"?', a: 'went' }, { q: 'Plural of "child"?', a: 'children' }, { q: 'Synonym for "happy"?', a: 'joyful' }] },
        coding: { name: 'Coding', questions: [{ q: 'HTML stands for?', a: 'HyperText Markup Language' }, { q: 'What is a variable?', a: 'A container for data' }, { q: 'What does CSS do?', a: 'Styles web pages' }] }
    };
    let lessonActive = false, lessonData = [], lessonIndex = 0, lessonScoreVal = 0, lessonCurrentAnswer = '';
    function loadLesson(subject) {
        const data = lessonBank[subject]; if (!data) return;
        lessonData = data.questions; lessonIndex = 0; lessonScoreVal = 0; lessonActive = true;
        lessonScore.textContent = 'Score: 0'; lessonFeedback.textContent = ''; lessonAnswer.value = '';
        document.getElementById('lessonAnswerArea').style.display = 'flex';
        showLessonQuestion(); lessonPanel.classList.remove('hidden');
    }
    function showLessonQuestion() {
        if (!lessonData || lessonIndex >= lessonData.length) {
            lessonQuestion.textContent = '🎉 Lesson Complete!'; document.getElementById('lessonAnswerArea').style.display = 'none';
            lessonFeedback.textContent = '✅ Great job! ⭐'; return;
        }
        const q = lessonData[lessonIndex];
        lessonQuestion.textContent = `Q${lessonIndex+1}: ${q.q}`;
        lessonCurrentAnswer = q.a.toLowerCase().trim(); lessonAnswer.value = ''; lessonFeedback.textContent = '';
        document.getElementById('lessonAnswerArea').style.display = 'flex';
    }
    function checkLessonAnswer() {
        if (!lessonActive || !lessonData || lessonIndex >= lessonData.length) return;
        const userAns = lessonAnswer.value.trim().toLowerCase();
        if (userAns === lessonCurrentAnswer) { lessonScoreVal += 10; lessonFeedback.innerHTML = '✅ Correct! +10 🎉'; }
        else lessonFeedback.innerHTML = `❌ Wrong. Answer: <strong>${lessonData[lessonIndex].a}</strong>`;
        lessonScore.textContent = `Score: ${lessonScoreVal}`; lessonIndex++;
        setTimeout(showLessonQuestion, 1000);
    }

    // ========== INIT ==========
    function init() {
        loadTheme();
        initVoice();
        loginBtn.addEventListener('click', login);
        loginEmail.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
        sendBtn.addEventListener('click', () => processCommand(chatInput.value));
        chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); processCommand(chatInput.value); } });
        quickReplies.addEventListener('click', (e) => { const btn = e.target.closest('button'); if (btn) processCommand(btn.dataset.msg); });
        fileUpload.addEventListener('change', function(e) { if (this.files[0]) handleFileUpload(this.files[0]); this.value = ''; });
        themeToggle.addEventListener('click', toggleTheme);

        hamburgerBtn.addEventListener('click', () => { menuPanel.classList.add('open'); menuOverlay.classList.add('open'); });
        menuClose.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); });
        menuOverlay.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); });

        menuContact.addEventListener('click', () => {
            menuPanel.classList.remove('open'); menuOverlay.classList.remove('open');
            const choice = confirm(`Contact?\nOK = WhatsApp (+${CONFIG.PHONE1})\nCancel = Call (+${CONFIG.PHONE2})`);
            if (choice) window.open(`https://wa.me/${CONFIG.PHONE1.replace('+','')}?text=Hello%20Safari%20AI`, '_blank');
            else window.location.href = `tel:${CONFIG.PHONE2}`;
        });
        menuFollow.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); window.open(CONFIG.CHANNEL, '_blank'); });
        menuNewChat.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); if (confirm('Clear current folder?')) { folders[currentFolder] = []; saveFolders(); loadChatHistory(); } });
        menuNewFolder.addEventListener('click', () => {
            menuPanel.classList.remove('open'); menuOverlay.classList.remove('open');
            const name = prompt('New folder name:');
            if (name && name.trim()) {
                if (folders[name.trim()]) { alert('Folder exists.'); return; }
                folders[name.trim()] = []; currentFolder = name.trim(); saveFolders(); renderFolderList(); loadChatHistory();
            }
        });
        menuExportChat.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); exportChat(); });
        menuClearChat.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); if (confirm('Clear ALL chat history?')) { folders[currentFolder] = []; saveFolders(); loadChatHistory(); } });
        menuLessons.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); if (!lessonActive) loadLesson('math'); else lessonPanel.classList.toggle('hidden'); });
        menuFootball.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); processCommand('football today'); });
        menuLogout.addEventListener('click', () => { menuPanel.classList.remove('open'); menuOverlay.classList.remove('open'); if (confirm('Logout?')) logout(); });

        lessonStartBtn.addEventListener('click', () => loadLesson(lessonClass.value));
        lessonNextBtn.addEventListener('click', () => { if (lessonActive) { lessonIndex++; showLessonQuestion(); } });
        lessonSubmitBtn.addEventListener('click', checkLessonAnswer);
        lessonAnswer.addEventListener('keydown', e => { if (e.key === 'Enter') checkLessonAnswer(); });

        if (!checkSession()) { loginScreen.classList.remove('hidden'); chatInterface.classList.add('hidden'); }
        console.log('🚀 SAFARI AI ULTIMATE v3.0 - All features fixed!');
    }

    document.addEventListener('DOMContentLoaded', init);
})();

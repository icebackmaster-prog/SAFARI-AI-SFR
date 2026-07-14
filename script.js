// ================================================================
// SAFARI AI – COMPLETE SCRIPT
// Supabase Realtime · Status Stories · Premium · AI Chat
// ================================================================

console.log('🦁 SAFARI AI: Script loading...');

(function() {
    'use strict';

    // ---- CONFIG ----
    const SUPABASE_URL = 'https://grhindrjbytwbpxxmqay.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_UjfNzHX5OdSfEKgarqosBw_jTDE0qDv';

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
        TIMEOUT: 8000,
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
    const storiesScroll = $('storiesScroll');
    const statusViewModal = $('statusViewModal');
    const closeStatusView = $('closeStatusView');
    const statusMediaContainer = $('statusMediaContainer');
    const statusProgressFill = $('statusProgressFill');
    const statusAuthor = $('statusAuthor');
    const statusTime = $('statusTime');
    const statusViews = $('statusViews');
    const prevStatusBtn = $('prevStatusBtn');
    const nextStatusBtn = $('nextStatusBtn');
    const addStoryBtn = $('addStoryBtn');
    const searchIcon = $('searchIcon');
    const notifIcon = $('notifIcon');
    const notifBadge = $('notifBadge');

    // ---- STATE ----
    let currentUser = null;
    let isProcessing = false;
    let statuses = [];
    let currentStatusIndex = 0;
    let statusInterval = null;
    let isPremium = false;
    let supabase = null;
    let chatHistory = [];

    // ---- SUPABASE INIT ----
    async function initSupabase() {
        try {
            const { createClient } = supabase;
            supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✅ Supabase initialized');

            // Setup realtime subscription for statuses
            const channel = supabase
                .channel('statuses-channel')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'statuses'
                }, (payload) => {
                    console.log('Status change:', payload);
                    fetchStatuses();
                })
                .subscribe();

            // Initial fetch
            await fetchStatuses();

            return true;
        } catch (e) {
            console.warn('⚠️ Supabase not available, using localStorage fallback.', e);
            return false;
        }
    }

    // ---- FETCH STATUSES (Supabase + localStorage fallback) ----
    async function fetchStatuses() {
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('statuses')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data && data.length > 0) {
                    statuses = data;
                    renderStatuses();
                    return;
                }
            }
        } catch (e) {
            console.warn('Supabase fetch failed, using localStorage:', e);
        }
        // Fallback to localStorage
        const local = localStorage.getItem('safari_statuses');
        if (local) {
            try { statuses = JSON.parse(local); } catch (e) { statuses = []; }
        } else {
            // Seed with a sample status
            statuses = [{
                id: 'sample1',
                author: 'ICEBACK MASTER TECH',
                type: 'text',
                content: 'Welcome to SAFARI AI! 🚀',
                caption: 'First status!',
                created_at: new Date().toISOString(),
                views: 0,
                pinned: true
            }];
        }
        renderStatuses();
    }

    // ---- RENDER STATUSES ----
    function renderStatuses() {
        // Keep the owner ring and add button
        const ownerRing = document.querySelector('#ownerStoryRing');
        const addBtn = document.querySelector('#addStoryBtn');
        storiesScroll.innerHTML = '';
        if (ownerRing) storiesScroll.appendChild(ownerRing);
        // Add other statuses (excluding owner's own ring)
        statuses.forEach(status => {
            if (status.author === 'ICEBACK MASTER TECH' && status.id === 'owner') return;
            const ring = document.createElement('div');
            ring.className = 'story-ring';
            ring.dataset.id = status.id;
            const content = status.type === 'text' ?
                `<div class="ring"><div class="text-status">${status.content.slice(0, 10)}</div></div>` :
                `<div class="ring"><img src="${status.content}" alt="Status" /></div>`;
            ring.innerHTML = `
                ${content}
                <span class="story-name">${status.author || 'Owner'}</span>
                <span class="story-time">${timeAgo(status.created_at)}</span>
            `;
            ring.addEventListener('click', () => openStatusView(statuses.indexOf(status)));
            storiesScroll.appendChild(ring);
        });
        if (addBtn) storiesScroll.appendChild(addBtn);
    }

    // ---- TIME AGO ----
    function timeAgo(date) {
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return minutes + 'm';
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + 'h';
        const days = Math.floor(hours / 24);
        return days + 'd';
    }

    // ---- STATUS VIEW ----
    function openStatusView(index) {
        if (statuses.length === 0) return;
        currentStatusIndex = index;
        showStatus(currentStatusIndex);
        statusViewModal.classList.add('open');
        clearInterval(statusInterval);
        startStatusTimer();
    }

    function showStatus(index) {
        const status = statuses[index];
        if (!status) return;
        const container = statusMediaContainer;
        if (status.type === 'text') {
            container.innerHTML = `<div class="text-status-view">${status.content}</div>`;
        } else if (status.type === 'image') {
            container.innerHTML = `<img src="${status.content}" alt="Status" />`;
        } else if (status.type === 'video') {
            container.innerHTML = `<video src="${status.content}" controls autoplay muted></video>`;
        } else {
            container.innerHTML = `<div class="text-status-view">📸 Status</div>`;
        }
        statusAuthor.textContent = status.author || 'Owner';
        statusTime.textContent = status.created_at ? new Date(status.created_at).toLocaleString() : 'Just now';
        statusViews.textContent = `👁️ ${status.views || 0} views`;
        // Update progress bar
        statusProgressFill.style.width = '100%';
        // Increment view count (local only for demo)
        status.views = (status.views || 0) + 1;
        if (supabase) {
            // Update views in DB
            supabase.from('statuses').update({ views: status.views }).eq('id', status.id).then();
        } else {
            localStorage.setItem('safari_statuses', JSON.stringify(statuses));
        }
    }

    function startStatusTimer() {
        let progress = 100;
        statusInterval = setInterval(() => {
            progress -= 0.5;
            if (progress <= 0) {
                clearInterval(statusInterval);
                nextStatus();
            }
            statusProgressFill.style.width = progress + '%';
        }, 50);
    }

    function nextStatus() {
        if (currentStatusIndex < statuses.length - 1) {
            currentStatusIndex++;
            showStatus(currentStatusIndex);
            startStatusTimer();
        } else {
            closeStatusView();
        }
    }

    function prevStatus() {
        if (currentStatusIndex > 0) {
            currentStatusIndex--;
            showStatus(currentStatusIndex);
            clearInterval(statusInterval);
            startStatusTimer();
        }
    }

    function closeStatusView() {
        statusViewModal.classList.remove('open');
        clearInterval(statusInterval);
    }

    // ---- ADD STATUS (Owner only) ----
    function openOwnerStatusModal() {
        if (!isPremium) {
            showToast('🔒 Premium required to add statuses.');
            return;
        }
        // Simple prompt for status content (text only for demo)
        const type = prompt('Status type: text, image, video? (enter "text" for now)');
        if (type === 'text') {
            const content = prompt('Enter your status message:');
            if (content) {
                addStatus('text', content);
            }
        } else {
            // For image/video, we would use file input; for demo we skip.
            showToast('📸 Image/video upload not implemented in demo.');
        }
    }

    async function addStatus(type, content) {
        const newStatus = {
            id: 'status_' + Date.now(),
            author: 'ICEBACK MASTER TECH',
            type: type,
            content: content,
            caption: '',
            created_at: new Date().toISOString(),
            views: 0,
            pinned: false
        };
        if (supabase) {
            const { error } = await supabase.from('statuses').insert([newStatus]);
            if (error) {
                console.error('Error inserting status:', error);
                showToast('⚠️ Failed to add status.');
                return;
            }
            showToast('✅ Status added!');
            await fetchStatuses();
        } else {
            statuses.unshift(newStatus);
            localStorage.setItem('safari_statuses', JSON.stringify(statuses));
            renderStatuses();
            showToast('✅ Status added!');
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
            setTimeout(() => {
                premiumModal.classList.remove('open');
            }, 1500);
        } else {
            premiumError.textContent = '❌ Incorrect PIN. Try again.';
        }
    }

    // ---- AI CHAT ----
    async function sendChatMessage() {
        const text = chatInput.value.trim();
        if (!text && !chatFileInput.files.length) return;
        const files = chatFileInput.files;
        chatInput.value = '';
        filePreview.innerHTML = '';

        // Add user message
        let userContent = text;
        if (files.length > 0) {
            const fileNames = Array.from(files).map(f => f.name).join(', ');
            userContent += (text ? ' ' : '') + `📎 Attached: ${fileNames}`;
        }
        addMessage('user', userContent);

        // Process files if any (just show a message for demo)
        if (files.length > 0) {
            for (let file of files) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // For images, could display preview
                    if (file.type.startsWith('image/')) {
                        addMessage('assistant', `📸 Image received: ${file.name}`);
                    } else {
                        addMessage('assistant', `📄 File received: ${file.name}`);
                    }
                };
                reader.readAsDataURL(file);
            }
            chatFileInput.value = '';
        }

        if (!text) return;

        // Show typing indicator
        showTyping();
        try {
            let reply = await getAIResponse(text);
            removeTyping();
            addMessage('assistant', reply);
        } catch (e) {
            removeTyping();
            addMessage('assistant', '⚠️ Sorry, I encountered an error.');
            console.error(e);
        }
    }

    async function getAIResponse(text) {
        const context =
            `You are Safari AI, a helpful assistant created by ICEBACK MASTER TECH. Answer clearly and helpfully. If asked about school, give detailed explanations. End with "POWERED BY ICEBACK MASTER TECH".`;
        try {
            const response = await fetch(CONFIG.FALLBACK_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context })
            });
            if (response.ok) {
                const data = await response.json();
                return data.response || data.message || data.reply || data.text || '';
            }
        } catch (e) { /* ignore */ }
        // Fallback
        return `🤔 I'm Safari AI. I can help with many things! Try asking me something specific.`;
    }

    function addMessage(role, content) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        const label = document.createElement('div');
        label.className = 'msg-label';
        label.textContent = role === 'assistant' ? '🤖 Safari AI' : 'You';
        div.appendChild(label);
        const contentDiv = document.createElement('div');
        contentDiv.className = 'msg-content';
        contentDiv.textContent = content;
        div.appendChild(contentDiv);
        const time = document.createElement('div');
        time.className = 'msg-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.appendChild(time);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'message assistant';
        div.id = 'typingIndicator';
        div.innerHTML =
            `<div class="msg-label">🤖 Safari AI</div><div class="msg-content"><span class="spinner"></span> Thinking...</div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
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
                    sendChatMessage();
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

    // ---- MENU ----
    function toggleMenu() {
        sideMenu.classList.toggle('open');
        menuOverlay.style.display = sideMenu.classList.contains('open') ? 'block' : 'none';
    }

    function closeMenu() {
        sideMenu.classList.remove('open');
        menuOverlay.style.display = 'none';
    }

    // ---- LOGIN ----
    function login() {
        const email = loginEmail.value.trim() || 'demo@safari.ai';
        const pass = loginPassword.value.trim() || 'password123';
        if (!email) { showToast('Please enter email.'); return; }
        currentUser = { displayName: email.split('@')[0], email: email };
        localStorage.setItem('safari_user', JSON.stringify(currentUser));
        loginOverlay.classList.add('hidden');
        app.classList.remove('hidden');
        userBadge.textContent = currentUser.displayName;
        fetchStatuses();
        showToast(`👋 Welcome, ${currentUser.displayName}!`);
    }

    function checkSession() {
        const saved = localStorage.getItem('safari_user');
        if (saved) {
            try {
                currentUser = JSON.parse(saved);
                loginOverlay.classList.add('hidden');
                app.classList.remove('hidden');
                userBadge.textContent = currentUser.displayName;
                fetchStatuses();
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

    // ---- INIT ----
    async function init() {
        console.log('🦁 Safari AI: Initializing...');
        initParticles();
        initVoice();

        // Supabase
        await initSupabase();

        // Login
        loginBtn.addEventListener('click', login);
        loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
        loginEmail.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

        // Chat
        sendBtn.addEventListener('click', sendChatMessage);
        chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault();
                sendChatMessage(); } });

        // File upload
        chatFileInput.addEventListener('change', function(e) {
            const files = this.files;
            if (files.length > 0) {
                filePreview.innerHTML = Array.from(files).map(f => `<span>📎 ${f.name}</span>`).join('');
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

        // Menu
        menuToggle.addEventListener('click', toggleMenu);
        closeMenu.addEventListener('click', closeMenu);
        menuOverlay.addEventListener('click', closeMenu);

        // Premium
        premiumBtn.addEventListener('click', function() {
            premiumModal.classList.add('open');
            premiumCode.value = '';
            premiumError.textContent = '';
            premiumFeatures.classList.add('hidden');
        });
        closePremium.addEventListener('click', function() { premiumModal.classList.remove('open'); });
        premiumUnlockBtn.addEventListener('click', unlockPremium);
        premiumCode.addEventListener('keydown', e => { if (e.key === 'Enter') unlockPremium(); });

        // Status view
        closeStatusView.addEventListener('click', closeStatusView);
        prevStatusBtn.addEventListener('click', prevStatus);
        nextStatusBtn.addEventListener('click', nextStatus);

        // Add status button
        addStoryBtn.addEventListener('click', openOwnerStatusModal);

        // Search icon (just focus chat)
        searchIcon.addEventListener('click', function() { chatInput.focus(); });

        // Notifications (demo)
        notifIcon.addEventListener('click', function() {
            showToast('🔔 You have 3 notifications.');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', logout);

        // Session
        if (!checkSession()) {
            loginOverlay.classList.remove('hidden');
            app.classList.add('hidden');
        } else {
            loginOverlay.classList.add('hidden');
            app.classList.remove('hidden');
        }

        console.log('🦁 Safari AI: Ready!');
        console.log('🔑 Premium PIN: 0000');
        console.log('📢 Channel: ' + OWNER.channel);
    }

    // ---- START ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

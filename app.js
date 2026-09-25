/**
 * StudyVerse — Clean Minimalist Student Workspace
 * Features:
 * - Visible Black (Light Mode) and White (Dark Mode) Constellations
 * - Periodic Shooting Stars & Meteor Showers on Flashcard Streaks (10 in a row)
 * - Multi-Metric Dashboard with Custom User Metrics
 * - PFP (Avatar Presets & Image Upload) and Name Management
 * - Fully Functional Course Management with Drag & Drop Embeds
 * - Anki Spaced Repetition (SM-2) Flashcard Studio with Manual & AI Generation
 * - Zero-Emoji Clean Typography with Inline SVG Icons
 * - Continuous Background Pomodoro Engine
 */

(function () {
    'use strict';

    /* ==========================================================================
       1. CONSTELLATIONS & METEOR ENGINE (WITH METEOR SHOWER)
       ========================================================================== */
    const Constellations = {
        canvas: null,
        ctx: null,
        stars: [],
        meteors: [],
        width: 0,
        height: 0,
        mouse: { x: -1000, y: -1000 },
        lastMeteorTime: 0,

        init() {
            this.canvas = document.getElementById('constellationCanvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();

            // Populate constellation stars
            const STAR_COUNT = Math.floor((this.width * this.height) / 14000);
            this.stars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                this.stars.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 1.5 + 0.8,
                    baseAlpha: Math.random() * 0.25 + 0.15
                });
            }

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener('resize', () => this.resize());
            this.animate();
        },

        resize() {
            if (!this.canvas) return;
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
        },

        spawnMeteor(isShower = false) {
            const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25; // ~45 deg
            const speed = Math.random() * 8 + 12;
            const length = Math.random() * 80 + 70;

            this.meteors.push({
                x: Math.random() * this.width * 1.2 - this.width * 0.2,
                y: -50,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length: length,
                alpha: 1,
                decay: isShower ? 0.015 : 0.018,
                width: Math.random() * 1.5 + 1.2
            });
        },

        triggerMeteorShower(count = 22) {
            Toast.show("10 Correct in a Row! Meteor Shower Unlocked!");
            let spawned = 0;
            const interval = setInterval(() => {
                this.spawnMeteor(true);
                this.spawnMeteor(true);
                spawned += 2;
                if (spawned >= count) clearInterval(interval);
            }, 120);
        },

        animate() {
            const ctx = this.ctx;
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.clearRect(0, 0, this.width, this.height);

            const starR = isDark ? 255 : 24;
            const starG = isDark ? 255 : 24;
            const starB = isDark ? 255 : 27;
            const maxDist = 125;

            // Draw Constellations
            for (let i = 0; i < this.stars.length; i++) {
                const s = this.stars[i];
                s.x += s.vx;
                s.y += s.vy;

                if (s.x < 0) s.x = this.width;
                if (s.x > this.width) s.x = 0;
                if (s.y < 0) s.y = this.height;
                if (s.y > this.height) s.y = 0;

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${starR}, ${starG}, ${starB}, ${s.baseAlpha * (isDark ? 1.5 : 1.2)})`;
                ctx.fill();

                for (let j = i + 1; j < this.stars.length; j++) {
                    const s2 = this.stars[j];
                    const dx = s.x - s2.x;
                    const dy = s.y - s2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * (isDark ? 0.12 : 0.08);
                        ctx.beginPath();
                        ctx.moveTo(s.x, s.y);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.strokeStyle = `rgba(${starR}, ${starG}, ${starB}, ${alpha})`;
                        ctx.lineWidth = 0.85;
                        ctx.stroke();
                    }
                }

                // Interactive mouse proximity
                const mdx = s.x - this.mouse.x;
                const mdy = s.y - this.mouse.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < 140) {
                    const mAlpha = (1 - mdist / 140) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(this.mouse.x, this.mouse.y);
                    ctx.strokeStyle = `rgba(232, 152, 60, ${mAlpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Periodic Random Shooting Stars
            const now = Date.now();
            if (now - this.lastMeteorTime > 4500 && Math.random() < 0.35) {
                this.spawnMeteor();
                this.lastMeteorTime = now;
            }

            // Render Meteors / Shooting Stars
            for (let i = this.meteors.length - 1; i >= 0; i--) {
                const m = this.meteors[i];
                m.x += m.vx;
                m.y += m.vy;
                m.alpha -= m.decay;

                if (m.alpha <= 0 || m.x > this.width + 100 || m.y > this.height + 100) {
                    this.meteors.splice(i, 1);
                    continue;
                }

                const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
                const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

                const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
                grad.addColorStop(0, `rgba(${starR}, ${starG}, ${starB}, 0)`);
                grad.addColorStop(1, isDark ? `rgba(255, 255, 255, ${m.alpha})` : `rgba(24, 24, 27, ${m.alpha * 0.85})`);

                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(m.x, m.y);
                ctx.strokeStyle = grad;
                ctx.lineWidth = m.width;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            requestAnimationFrame(() => this.animate());
        }
    };

    /* ==========================================================================
       2. USER DATA STORE & PERSISTENCE
       ========================================================================== */
    const Store = {
        uid: null,
        data: {
            profile: {
                username: 'Scholar',
                pfp: 'star', // 'star', 'voyager', 'atom', 'quill', 'orbit'
                customAvatarUrl: null,
                streak: 1,
                lastActiveDate: new Date().toISOString().split('T')[0],
                theme: 'light'
            },
            metrics: [], // Custom user metrics: [{ id, name, current, target, unit }]
            tasks: [],
            notes: [],
            events: [],
            courses: [],
            decks: [],
            pomodoro: {
                completedSessions: 0,
                totalFocusMinutes: 0
            }
        },

        getCookie(name) {
            const matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },

        async init() {
            this.uid = this.getCookie('studyverse_uid');

            try {
                const res = await fetch('/api/user-data');
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        this.uid = json.uid || this.uid;
                        this.data = { ...this.data, ...json.data };
                    }
                }
            } catch (e) {
                const cached = localStorage.getItem('studyverse_user_data');
                if (cached) {
                    try { this.data = JSON.parse(cached); } catch (err) {}
                }
            }

            // Ensure profile & metrics are clean
            this.data.profile = this.data.profile || {
                username: 'Scholar',
                pfp: 'star',
                customAvatarUrl: null,
                streak: 1,
                lastActiveDate: new Date().toISOString().split('T')[0],
                theme: 'light'
            };
            this.data.metrics = this.data.metrics || [];

            // Check streak
            const today = new Date().toISOString().split('T')[0];
            if (this.data.profile.lastActiveDate !== today) {
                const last = new Date(this.data.profile.lastActiveDate || today);
                const diffDays = Math.round((new Date(today) - last) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    this.data.profile.streak = (this.data.profile.streak || 1) + 1;
                } else if (diffDays > 1) {
                    this.data.profile.streak = 1;
                }
                this.data.profile.lastActiveDate = today;
                this.save();
            }

            const savedTheme = localStorage.getItem('studyverse_theme') || this.data.profile.theme || 'light';
            this.setTheme(savedTheme, false);
            this.updateProfileUI();
        },

        setTheme(theme, save = true) {
            this.data.profile.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('studyverse_theme', theme);

            const themeLabel = document.getElementById('profileThemeLabel');
            if (themeLabel) {
                themeLabel.textContent = theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
            }
            if (save) this.save();
        },

        toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            this.setTheme(next, true);
            Toast.show(`Switched to ${next} theme`);
        },

        getAvatarSVG(pfpKey) {
            const svgMap = {
                star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
                voyager: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
                atom: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-45 12 12)"/></svg>`,
                quill: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>`,
                orbit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9"/></svg>`
            };
            return svgMap[pfpKey] || svgMap.star;
        },

        updateProfileUI() {
            const p = this.data.profile;
            const nameEl = document.getElementById('profileBtnName');
            const avatarBox = document.getElementById('profileBtnAvatar');

            if (nameEl) nameEl.textContent = p.username || 'Scholar';
            if (avatarBox) {
                if (p.customAvatarUrl) {
                    avatarBox.innerHTML = `<img src="${p.customAvatarUrl}" alt="Avatar">`;
                } else {
                    avatarBox.innerHTML = this.getAvatarSVG(p.pfp || 'star');
                }
            }

            const dropName = document.getElementById('dropProfileName');
            const dropStreak = document.getElementById('dropProfileStreak');
            if (dropName) dropName.textContent = p.username || 'Scholar';
            if (dropStreak) dropStreak.textContent = `${p.streak || 1} Day Streak`;

            const dashGreetingName = document.getElementById('dashGreetingName');
            if (dashGreetingName) dashGreetingName.textContent = p.username || 'Scholar';
        },

        async save() {
            localStorage.setItem('studyverse_user_data', JSON.stringify(this.data));
            try {
                await fetch('/api/user-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.data)
                });
            } catch (e) {}
        },

        async resetWorkspace() {
            if (!confirm('Start a fresh blank slate? This will reset tasks, notes, courses, and flashcards.')) return;
            try {
                await fetch('/api/user-data/reset', { method: 'POST' });
            } catch (e) {}
            localStorage.removeItem('studyverse_user_data');
            window.location.reload();
        }
    };

    /* ==========================================================================
       3. PROFILE MODAL (EDIT NAME & PFP IMAGE OR PRESETS)
       ========================================================================== */
    const ProfileModal = {
        selectedPreset: 'star',
        uploadedDataUrl: null,

        open() {
            const p = Store.data.profile;
            this.selectedPreset = p.pfp || 'star';
            this.uploadedDataUrl = p.customAvatarUrl || null;

            const modal = document.getElementById('profileEditModal');
            if (!modal) return;

            document.getElementById('profileEditUsernameInput').value = p.username || 'Scholar';

            // Highlight selected preset
            document.querySelectorAll('.pfp-preset-opt').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.preset === this.selectedPreset);
            });

            modal.classList.add('show');
        },

        close() {
            const modal = document.getElementById('profileEditModal');
            if (modal) modal.classList.remove('show');
        },

        handleImageUpload(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadedDataUrl = e.target.result;
                const preview = document.getElementById('pfpCustomPreview');
                if (preview) {
                    preview.src = this.uploadedDataUrl;
                    preview.style.display = 'block';
                }
                Toast.show("Custom avatar loaded");
            };
            reader.readAsDataURL(file);
        },

        save() {
            const name = (document.getElementById('profileEditUsernameInput')?.value || '').trim();
            if (!name) return;

            Store.data.profile.username = name;
            Store.data.profile.pfp = this.selectedPreset;
            Store.data.profile.customAvatarUrl = this.uploadedDataUrl;
            Store.save();
            Store.updateProfileUI();

            this.close();
            Toast.show("Profile updated");
        }
    };

    /* ==========================================================================
       4. DASHBOARD & CUSTOM METRICS
       ========================================================================== */
    const Dashboard = {
        init() {
            this.bindEvents();
            this.render();
        },

        bindEvents() {
            const addMetricBtn = document.getElementById('openAddMetricModalBtn');
            if (addMetricBtn) addMetricBtn.addEventListener('click', () => this.openAddMetricModal());

            const saveMetricBtn = document.getElementById('saveCustomMetricBtn');
            if (saveMetricBtn) saveMetricBtn.addEventListener('click', () => this.saveCustomMetric());
        },

        openAddMetricModal() {
            document.getElementById('metricNameInput').value = '';
            document.getElementById('metricTargetInput').value = '10';
            document.getElementById('metricUnitInput').value = 'chapters';
            document.getElementById('addMetricModal').classList.add('show');
        },

        saveCustomMetric() {
            const name = (document.getElementById('metricNameInput')?.value || '').trim();
            const target = parseInt(document.getElementById('metricTargetInput')?.value, 10) || 10;
            const unit = (document.getElementById('metricUnitInput')?.value || '').trim() || 'units';

            if (!name) return;

            Store.data.metrics = Store.data.metrics || [];
            Store.data.metrics.push({
                id: `metric_${Date.now()}`,
                name: name,
                current: 0,
                target: target,
                unit: unit
            });
            Store.save();

            document.getElementById('addMetricModal').classList.remove('show');
            this.render();
            Toast.show(`Added metric "${name}"`);
        },

        stepMetric(id, delta) {
            const m = (Store.data.metrics || []).find(item => item.id === id);
            if (!m) return;
            m.current = Math.max(0, (m.current || 0) + delta);
            Store.save();
            this.render();
        },

        deleteMetric(id) {
            Store.data.metrics = (Store.data.metrics || []).filter(item => item.id !== id);
            Store.save();
            this.render();
            Toast.show("Metric removed");
        },

        render() {
            Store.updateProfileUI();

            // 1. Metric: Study Streak
            const streakCountEl = document.getElementById('dashMetricStreak');
            if (streakCountEl) streakCountEl.textContent = `${Store.data.profile.streak || 1} Days`;

            // 2. Metric: Focus Time Today
            const pomoMins = Store.data.pomodoro?.totalFocusMinutes || 0;
            const focusTimeEl = document.getElementById('dashMetricFocus');
            if (focusTimeEl) focusTimeEl.textContent = `${pomoMins} min`;

            // 3. Metric: Flashcard Mastery
            const decks = Store.data.decks || [];
            let totalCards = 0;
            let masteredCards = 0;
            decks.forEach(d => {
                totalCards += (d.cards || []).length;
                masteredCards += (d.cards || []).filter(c => (c.repetitions || 0) >= 2).length;
            });
            const accuracyPct = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
            const cardAccuracyEl = document.getElementById('dashMetricAccuracy');
            if (cardAccuracyEl) cardAccuracyEl.textContent = `${accuracyPct}%`;

            // 4. Metric: Task Completion
            const tasks = Store.data.tasks || [];
            const completedCount = tasks.filter(t => t.completed).length;
            const taskRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
            const taskRateEl = document.getElementById('dashMetricTasks');
            if (taskRateEl) taskRateEl.textContent = `${completedCount} / ${tasks.length} (${taskRate}%)`;

            // Weekly Study Velocity Bars
            const velocityDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const todayIndex = new Date().getDay();
            const barsWrap = document.getElementById('velocityBarsWrap');
            if (barsWrap) {
                barsWrap.innerHTML = velocityDays.map((day, idx) => {
                    const isToday = idx === todayIndex;
                    const heightPercent = isToday ? Math.min(100, Math.max(15, (pomoMins / 60) * 100)) : 10;
                    return `
                        <div class="velocity-bar-col">
                            <div class="velocity-bar-fill ${isToday ? 'active' : ''}" style="height:${heightPercent}%;"></div>
                            <span class="velocity-bar-day" style="${isToday ? 'font-weight:700; color:var(--sv-orange);' : ''}">${day}</span>
                        </div>
                    `;
                }).join('');
            }

            // Custom Metrics Deck
            const customGrid = document.getElementById('customMetricsGrid');
            if (customGrid) {
                const metrics = Store.data.metrics || [];
                if (metrics.length === 0) {
                    customGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; padding:12px; font-size:0.82rem; color:var(--text-muted); text-align:center;">
                            No custom metrics added yet. Click "+ Add Metric" to track custom study targets.
                        </div>
                    `;
                } else {
                    customGrid.innerHTML = metrics.map(m => {
                        const pct = Math.min(100, Math.round(((m.current || 0) / (m.target || 1)) * 100));
                        return `
                            <div class="custom-metric-card">
                                <div class="custom-metric-top">
                                    <span class="custom-metric-name">${escapeHtml(m.name)}</span>
                                    <button class="btn btn-subtle btn-sm" onclick="window.StudyVerse.Dashboard.deleteMetric('${m.id}')">&times;</button>
                                </div>
                                <div class="custom-metric-val-row">
                                    <span>${m.current} / ${m.target} ${escapeHtml(m.unit)}</span>
                                    <span>${pct}%</span>
                                </div>
                                <div class="custom-metric-progress">
                                    <div class="custom-metric-progress-fill" style="width:${pct}%;"></div>
                                </div>
                                <div style="display:flex; justify-content:flex-end; margin-top:2px;">
                                    <div class="custom-metric-steppers">
                                        <button onclick="window.StudyVerse.Dashboard.stepMetric('${m.id}', -1)">-</button>
                                        <button onclick="window.StudyVerse.Dashboard.stepMetric('${m.id}', 1)">+</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            // Overview previews
            const todayTasks = tasks.filter(t => t.isToday && !t.completed);
            const taskPreview = document.getElementById('dashTodayTasksList');
            if (taskPreview) {
                taskPreview.innerHTML = todayTasks.length === 0
                    ? `<div style="font-size:0.82rem; color:var(--text-muted); padding:8px 0;">No tasks for today.</div>`
                    : todayTasks.slice(0, 3).map(t => `
                        <div style="display:flex; align-items:center; gap:8px; padding:6px 0; font-size:0.85rem; border-bottom:1px solid var(--border-subtle);">
                            <div class="task-check" onclick="window.StudyVerse.Tasks.toggleTask('${t.id}')"></div>
                            <span>${escapeHtml(t.title)}</span>
                        </div>
                    `).join('');
            }

            const events = Store.data.events || [];
            const eventPreview = document.getElementById('dashEventsList');
            if (eventPreview) {
                eventPreview.innerHTML = events.length === 0
                    ? `<div style="font-size:0.82rem; color:var(--text-muted); padding:8px 0;">No events scheduled.</div>`
                    : events.slice(0, 3).map(e => `
                        <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:0.85rem; border-bottom:1px solid var(--border-subtle);">
                            <span style="font-weight:600;">${escapeHtml(e.title)}</span>
                            <span style="color:var(--text-muted); font-size:0.75rem;">${e.date}</span>
                        </div>
                    `).join('');
            }

            const deckPreview = document.getElementById('dashDecksList');
            if (deckPreview) {
                deckPreview.innerHTML = decks.length === 0
                    ? `<div style="font-size:0.82rem; color:var(--text-muted); padding:8px 0;">No decks created.</div>`
                    : decks.slice(0, 3).map(d => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:0.85rem; border-bottom:1px solid var(--border-subtle);">
                            <span>${escapeHtml(d.title)}</span>
                            <button class="btn btn-secondary btn-sm" onclick="window.StudyVerse.Flashcards.startPracticeById('${d.id}')">Practice</button>
                        </div>
                    `).join('');
            }
        }
    };

    /* ==========================================================================
       5. CONTINUOUS POMODORO TIMER
       ========================================================================== */
    const Pomodoro = {
        mode: 'focus',
        durations: { focus: 25 * 60, deep: 50 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
        timeRemaining: 25 * 60,
        isRunning: false,
        timerInterval: null,

        init() {
            const saved = localStorage.getItem('studyverse_pomodoro_state');
            if (saved) {
                try {
                    const s = JSON.parse(saved);
                    this.mode = s.mode || 'focus';
                    if (s.isRunning && s.endTime) {
                        const diff = Math.round((s.endTime - Date.now()) / 1000);
                        if (diff > 0) {
                            this.timeRemaining = diff;
                            this.start(false);
                        } else {
                            this.timeRemaining = this.durations[this.mode] || (25 * 60);
                        }
                    } else {
                        this.timeRemaining = s.timeRemaining || this.durations[this.mode];
                    }
                } catch (e) {}
            } else {
                this.timeRemaining = this.durations.focus;
            }

            this.bindEvents();
            this.updateDisplay();
        },

        bindEvents() {
            const headerPill = document.getElementById('headerPomoPill');
            const headerToggle = document.getElementById('headerPomoToggle');

            if (headerPill) {
                headerPill.addEventListener('click', (e) => {
                    if (e.target.closest('#headerPomoToggle')) return;
                    Router.navigate('pomodoro');
                });
            }

            if (headerToggle) {
                headerToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle();
                });
            }

            const startBtn = document.getElementById('pomoStartBtn');
            const resetBtn = document.getElementById('pomoResetBtn');
            const skipBtn = document.getElementById('pomoSkipBtn');

            if (startBtn) startBtn.addEventListener('click', () => this.toggle());
            if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
            if (skipBtn) skipBtn.addEventListener('click', () => this.completeSession());

            document.querySelectorAll('.pomo-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const mode = btn.dataset.mode;
                    if (mode) this.setMode(mode);
                });
            });
        },

        saveState() {
            const state = {
                mode: this.mode,
                timeRemaining: this.timeRemaining,
                isRunning: this.isRunning,
                endTime: this.isRunning ? (Date.now() + this.timeRemaining * 1000) : null
            };
            localStorage.setItem('studyverse_pomodoro_state', JSON.stringify(state));
        },

        setMode(newMode) {
            if (this.isRunning) {
                if (!confirm('Switch focus mode and reset timer?')) return;
                this.pause();
            }
            this.mode = newMode;
            this.timeRemaining = this.durations[newMode] || (25 * 60);

            document.querySelectorAll('.pomo-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === newMode);
            });

            const modeLabel = document.getElementById('pomoModeLabel');
            if (modeLabel) {
                const labels = { focus: 'Focus Session', deep: 'Deep Focus', shortBreak: 'Short Break', longBreak: 'Long Break' };
                modeLabel.textContent = labels[newMode] || 'Focus';
            }

            this.updateDisplay();
            this.saveState();
        },

        toggle() {
            if (this.isRunning) this.pause();
            else this.start(true);
        },

        start(userAction = true) {
            this.isRunning = true;
            this.saveState();
            clearInterval(this.timerInterval);
            this.timerInterval = setInterval(() => this.tick(), 1000);
            this.updateDisplay();
        },

        pause() {
            this.isRunning = false;
            clearInterval(this.timerInterval);
            this.saveState();
            this.updateDisplay();
        },

        reset() {
            this.isRunning = false;
            clearInterval(this.timerInterval);
            this.timeRemaining = this.durations[this.mode] || (25 * 60);
            this.saveState();
            this.updateDisplay();
        },

        tick() {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.updateDisplay();
                if (this.timeRemaining % 5 === 0) this.saveState();
            } else {
                this.completeSession();
            }
        },

        completeSession() {
            this.isRunning = false;
            clearInterval(this.timerInterval);

            const isFocus = this.mode === 'focus' || this.mode === 'deep';
            if (isFocus) {
                const mins = Math.round((this.durations[this.mode] || (25 * 60)) / 60);
                Store.data.pomodoro = Store.data.pomodoro || { completedSessions: 0, totalFocusMinutes: 0 };
                Store.data.pomodoro.completedSessions = (Store.data.pomodoro.completedSessions || 0) + 1;
                Store.data.pomodoro.totalFocusMinutes = (Store.data.pomodoro.totalFocusMinutes || 0) + mins;
                Store.save();
                Toast.show(`Focus session finished (${mins}m logged)`);
                this.setMode('shortBreak');
            } else {
                Toast.show("Break over. Ready for next session?");
                this.setMode('focus');
            }

            this.saveState();
            Dashboard.render();
        },

        formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        },

        updateDisplay() {
            const formatted = this.formatTime(this.timeRemaining);

            const clock = document.getElementById('pomoTimeDisplay');
            if (clock) clock.textContent = formatted;

            const startBtn = document.getElementById('pomoStartBtn');
            if (startBtn) {
                startBtn.textContent = this.isRunning ? 'Pause' : 'Start Focus';
                startBtn.className = this.isRunning ? 'btn btn-secondary btn-lg' : 'btn btn-primary btn-lg';
            }

            const ring = document.getElementById('pomoProgressRing');
            if (ring) {
                const total = this.durations[this.mode] || (25 * 60);
                const fraction = Math.max(0, Math.min(1, this.timeRemaining / total));
                const circ = 2 * Math.PI * 120;
                ring.style.strokeDasharray = `${circ}`;
                ring.style.strokeDashoffset = `${circ * (1 - fraction)}`;
            }

            const headerPill = document.getElementById('headerPomoPill');
            const headerTime = document.getElementById('headerPomoTime');
            const headerToggle = document.getElementById('headerPomoToggle');

            if (headerPill) headerPill.classList.toggle('running', this.isRunning);
            if (headerTime) headerTime.textContent = formatted;
            if (headerToggle) {
                headerToggle.innerHTML = this.isRunning
                    ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
                    : `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
            }

            document.title = this.isRunning ? `(${formatted}) StudyVerse` : 'StudyVerse';
        }
    };

    /* ==========================================================================
       6. FLASHCARDS STUDIO (ANKI PRACTICE + METEOR SHOWER ON 10 CORRECT)
       ========================================================================== */
    const Flashcards = {
        activeTab: 'generator',
        extractedText: '',
        generatedCards: [],
        currentPracticeDeck: null,
        currentCardIndex: 0,
        isFlipped: false,
        consecutiveCorrectStreak: 0,
        draggedDeckId: null,

        init() {
            this.bindEvents();
            this.renderDecksList();
        },

        bindEvents() {
            document.querySelectorAll('#flashcardsSubnav .subnav-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab.dataset.tab);
                });
            });

            const dropzone = document.getElementById('fcDropzone');
            const fileInput = document.getElementById('fcFileInput');

            if (dropzone && fileInput) {
                ['dragenter', 'dragover'].forEach(n => {
                    dropzone.addEventListener(n, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
                });
                ['dragleave', 'drop'].forEach(n => {
                    dropzone.addEventListener(n, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); });
                });
                dropzone.addEventListener('drop', (e) => {
                    if (e.dataTransfer.files?.[0]) this.uploadFile(e.dataTransfer.files[0]);
                });
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files?.[0]) this.uploadFile(e.target.files[0]);
                });
            }

            const generateBtn = document.getElementById('fcGenerateBtn');
            if (generateBtn) generateBtn.addEventListener('click', () => this.generateFlashcards());

            const saveDeckBtn = document.getElementById('fcSaveDeckBtn');
            if (saveDeckBtn) saveDeckBtn.addEventListener('click', () => this.saveGeneratedDeck());

            const ankiCard = document.getElementById('ankiCardContainer');
            if (ankiCard) ankiCard.addEventListener('click', () => this.flipCard());

            window.addEventListener('keydown', (e) => {
                if (this.activeTab !== 'practice') return;
                if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

                if (e.code === 'Space') {
                    e.preventDefault();
                    this.flipCard();
                } else if (this.isFlipped) {
                    if (e.key === '1') this.rateCard('again');
                    else if (e.key === '2') this.rateCard('hard');
                    else if (e.key === '3') this.rateCard('good');
                    else if (e.key === '4') this.rateCard('easy');
                }
            });

            document.querySelectorAll('.anki-rating-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.rateCard(btn.dataset.rating);
                });
            });

            const returnBtn = document.getElementById('ankiReturnDecksBtn');
            if (returnBtn) returnBtn.addEventListener('click', () => this.switchTab('decks'));
        },

        switchTab(tabId) {
            this.activeTab = tabId;
            document.querySelectorAll('#flashcardsSubnav .subnav-tab').forEach(t => {
                t.classList.toggle('active', t.dataset.tab === tabId);
            });

            document.getElementById('fcTabGenerator').style.display = tabId === 'generator' ? 'block' : 'none';
            document.getElementById('fcTabDecks').style.display = tabId === 'decks' ? 'block' : 'none';
            document.getElementById('fcTabPractice').style.display = tabId === 'practice' ? 'block' : 'none';

            if (tabId === 'decks') this.renderDecksList();
        },

        async uploadFile(file) {
            const statusEl = document.getElementById('fcUploadStatus');
            if (statusEl) statusEl.textContent = `Reading ${file.name}...`;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload-file', { method: 'POST', body: formData });
                const json = await res.json();
                if (json.success) {
                    this.extractedText = json.text;
                    const badge = document.getElementById('fcFileBadge');
                    const badgeText = document.getElementById('fcBadgeFileName');
                    if (badge && badgeText) {
                        badgeText.textContent = `${json.fileName} (${Math.round(json.fileSize / 1024)} KB)`;
                        badge.classList.add('show');
                    }
                    const titleInput = document.getElementById('fcDeckTitle');
                    if (titleInput && !titleInput.value) {
                        titleInput.value = json.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                    }
                    Toast.show(`Extracted ${json.text.length} characters`);
                } else {
                    alert(json.error || 'Could not parse document.');
                }
            } catch (e) {
                alert('Upload failed.');
            } finally {
                if (statusEl) statusEl.textContent = '';
            }
        },

        async generateFlashcards() {
            const manualText = (document.getElementById('fcStudyNotesInput')?.value || '').trim();
            const textToUse = this.extractedText ? `${this.extractedText}\n\n${manualText}` : manualText;

            if (!textToUse || textToUse.length < 10) {
                alert('Please upload a PDF or document, or paste study notes.');
                return;
            }

            const title = (document.getElementById('fcDeckTitle')?.value || 'Untitled Deck').trim();
            const cardCount = parseInt(document.getElementById('fcCardCount')?.value, 10) || 10;
            const focus = (document.getElementById('fcTopicFocus')?.value || '').trim();

            const btn = document.getElementById('fcGenerateBtn');
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `Generating Cards...`;

            try {
                const res = await fetch('/api/generate-flashcards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studyText: textToUse, deckTitle: title, cardCount, focusTopic: focus })
                });

                const json = await res.json();
                if (json.success && Array.isArray(json.cards) && json.cards.length > 0) {
                    this.generatedCards = json.cards;
                    this.renderGeneratedPreview(json.cards);
                    Toast.show(`Generated ${json.cards.length} flashcards`);
                } else {
                    alert(json.error || 'Failed to generate flashcards.');
                }
            } catch (e) {
                alert('Generation error: ' + e.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        },

        renderGeneratedPreview(cards) {
            const container = document.getElementById('fcGeneratedPreview');
            const list = document.getElementById('fcPreviewCardsList');
            const countLabel = document.getElementById('fcPreviewCount');

            if (!container || !list) return;
            container.style.display = 'block';
            if (countLabel) countLabel.textContent = `${cards.length} cards`;

            list.innerHTML = cards.map((c, i) => `
                <div class="card" style="margin-bottom:8px; padding:12px 14px;">
                    <div style="font-size:0.72rem; font-weight:700; color:var(--sv-orange); text-transform:uppercase; margin-bottom:3px;">
                        ${escapeHtml(c.concept || 'Concept ' + (i + 1))}
                    </div>
                    <div style="font-weight:600; font-size:0.9rem; margin-bottom:4px; color:var(--text-primary);">
                        ${escapeHtml(c.question)}
                    </div>
                    <div style="font-size:0.84rem; color:var(--text-secondary);">
                        ${escapeHtml(c.answer)}
                    </div>
                </div>
            `).join('');

            container.scrollIntoView({ behavior: 'smooth' });
        },

        saveGeneratedDeck() {
            if (!this.generatedCards || this.generatedCards.length === 0) return;

            const title = (document.getElementById('fcDeckTitle')?.value || 'Study Deck').trim();
            const courseSelect = document.getElementById('fcCourseSelect');
            const courseId = courseSelect ? courseSelect.value : null;

            const newDeck = {
                id: `deck_${Date.now()}`,
                title: title,
                courseId: courseId || null,
                createdAt: new Date().toISOString(),
                cards: this.generatedCards
            };

            Store.data.decks = Store.data.decks || [];
            Store.data.decks.unshift(newDeck);
            Store.save();

            Toast.show(`Saved "${title}"`);
            this.switchTab('decks');
        },

        renderDecksList() {
            const listEl = document.getElementById('fcDecksList');
            if (!listEl) return;

            const courseSelect = document.getElementById('fcCourseSelect');
            if (courseSelect) {
                const courses = Store.data.courses || [];
                courseSelect.innerHTML = `<option value="">No Course</option>` +
                    courses.map(c => `<option value="${c.id}">${escapeHtml(c.code)} - ${escapeHtml(c.title)}</option>`).join('');
            }

            const decks = Store.data.decks || [];

            if (decks.length === 0) {
                listEl.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1; text-align:center; padding:32px;">
                        <h4 style="font-size:0.95rem; font-weight:600;">No Flashcard Decks</h4>
                        <p style="font-size:0.82rem; color:var(--text-muted); margin:6px 0 16px;">Generate cards from a PDF or notes.</p>
                        <button class="btn btn-primary btn-sm" onclick="window.StudyVerse.Flashcards.switchTab('generator')">
                            Create First Deck
                        </button>
                    </div>
                `;
                return;
            }

            listEl.innerHTML = decks.map(deck => {
                const course = (Store.data.courses || []).find(c => c.id === deck.courseId);
                const total = deck.cards?.length || 0;
                const mastered = (deck.cards || []).filter(c => (c.repetitions || 0) >= 2).length;
                const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

                return `
                    <div class="deck-card" draggable="true" data-deck-id="${deck.id}"
                         ondragstart="window.StudyVerse.Flashcards.handleDeckDragStart(event, '${deck.id}')"
                         ondragend="window.StudyVerse.Flashcards.handleDeckDragEnd(event)">
                        <div>
                            ${course ? `<div class="deck-course-tag">${escapeHtml(course.code)}</div>` : ''}
                            <div class="deck-header">
                                <h3 class="deck-title">${escapeHtml(deck.title)}</h3>
                                <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${total} cards</span>
                            </div>
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:14px;">
                                Mastery: ${pct}%
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <button class="btn btn-primary btn-sm" onclick="window.StudyVerse.Flashcards.startPracticeById('${deck.id}')">
                                Practice
                            </button>
                            <button class="btn btn-subtle btn-sm" onclick="window.StudyVerse.Flashcards.deleteDeck('${deck.id}')">&times;</button>
                        </div>
                    </div>
                `;
            }).join('');
        },

        handleDeckDragStart(e, deckId) {
            this.draggedDeckId = deckId;
            e.dataTransfer.setData('text/plain', deckId);
            e.target.classList.add('dragging');
        },

        handleDeckDragEnd(e) {
            e.target.classList.remove('dragging');
            document.querySelectorAll('.course-card').forEach(c => c.classList.remove('drag-target-hover'));
        },

        startPracticeById(deckId) {
            const deck = (Store.data.decks || []).find(d => d.id === deckId);
            if (deck) this.startPractice(deck);
        },

        startPractice(deck) {
            if (!deck.cards || deck.cards.length === 0) return;
            this.currentPracticeDeck = deck;
            this.currentCardIndex = 0;
            this.isFlipped = false;
            this.consecutiveCorrectStreak = 0;

            this.switchTab('practice');
            document.getElementById('ankiPracticeScreen').style.display = 'block';
            document.getElementById('ankiResultsScreen').style.display = 'none';
            document.getElementById('ankiDeckTitle').textContent = deck.title;
            this.renderCurrentCard();
        },

        renderCurrentCard() {
            const deck = this.currentPracticeDeck;
            if (!deck || this.currentCardIndex >= deck.cards.length) {
                this.showPracticeResults();
                return;
            }

            const card = deck.cards[this.currentCardIndex];
            this.isFlipped = false;

            const cardContainer = document.getElementById('ankiCardContainer');
            if (cardContainer) cardContainer.classList.remove('is-flipped');

            document.getElementById('ankiCardConcept').textContent = card.concept || 'Concept';
            document.getElementById('ankiCardQuestion').textContent = card.question;

            document.getElementById('ankiCardBackQuestion').textContent = card.question;
            document.getElementById('ankiCardAnswer').textContent = card.answer;
            const hintRow = document.getElementById('ankiCardHint');
            if (hintRow) {
                if (card.hint) {
                    hintRow.style.display = 'block';
                    hintRow.textContent = `Hint: ${card.hint}`;
                } else {
                    hintRow.style.display = 'none';
                }
            }

            const pct = ((this.currentCardIndex) / deck.cards.length) * 100;
            const fill = document.getElementById('ankiProgressFill');
            if (fill) fill.style.width = `${pct}%`;

            const cardNum = document.getElementById('ankiCardIndexNum');
            if (cardNum) cardNum.textContent = `${this.currentCardIndex + 1} / ${deck.cards.length}`;

            // Update streak pill
            const streakPill = document.getElementById('ankiCardStreakPill');
            if (streakPill) {
                streakPill.textContent = `${this.consecutiveCorrectStreak} in a row`;
            }

            const ratingsBar = document.getElementById('ankiRatingsBar');
            if (ratingsBar) ratingsBar.classList.remove('show');
        },

        flipCard() {
            this.isFlipped = !this.isFlipped;
            const cardContainer = document.getElementById('ankiCardContainer');
            if (cardContainer) cardContainer.classList.toggle('is-flipped', this.isFlipped);
            const ratingsBar = document.getElementById('ankiRatingsBar');
            if (ratingsBar) ratingsBar.classList.toggle('show', this.isFlipped);
        },

        rateCard(rating) {
            const deck = this.currentPracticeDeck;
            if (!deck) return;
            const card = deck.cards[this.currentCardIndex];

            card.repetitions = card.repetitions || 0;
            card.interval = card.interval || 0;
            card.easeFactor = card.easeFactor || 2.5;

            if (rating === 'again') {
                card.repetitions = 0;
                card.interval = 1;
                deck.cards.push(card);
                this.consecutiveCorrectStreak = 0;
            } else if (rating === 'hard') {
                card.interval = Math.max(1, Math.round((card.interval || 1) * 1.2));
                this.consecutiveCorrectStreak++;
            } else if (rating === 'good') {
                card.interval = card.repetitions === 0 ? 1 : Math.round(card.interval * card.easeFactor);
                card.repetitions++;
                this.consecutiveCorrectStreak++;
            } else if (rating === 'easy') {
                card.interval = card.repetitions === 0 ? 4 : Math.round(card.interval * card.easeFactor * 1.3);
                card.repetitions++;
                this.consecutiveCorrectStreak++;
            }

            // METEOR SHOWER TRIGGER AT 10 CORRECT IN A ROW
            if (this.consecutiveCorrectStreak === 10 || (this.consecutiveCorrectStreak > 10 && this.consecutiveCorrectStreak % 10 === 0)) {
                Constellations.triggerMeteorShower(24);
            }

            Store.save();
            this.currentCardIndex++;
            this.renderCurrentCard();
        },

        showPracticeResults() {
            document.getElementById('ankiPracticeScreen').style.display = 'none';
            document.getElementById('ankiResultsScreen').style.display = 'block';
        },

        deleteDeck(deckId) {
            if (!confirm('Delete deck?')) return;
            Store.data.decks = (Store.data.decks || []).filter(d => d.id !== deckId);
            Store.save();
            this.renderDecksList();
            Toast.show('Deck deleted.');
        }
    };

    /* ==========================================================================
       7. STREAMLINED TASKS ENGINE
       ========================================================================== */
    const Tasks = {
        isTodaySelected: false,

        init() {
            this.bindEvents();
            this.render();
        },

        bindEvents() {
            const addBtn = document.getElementById('taskAddBtn');
            const input = document.getElementById('taskInputTitle');
            const todayChip = document.getElementById('taskTodayChip');

            if (todayChip) {
                todayChip.addEventListener('click', () => {
                    this.isTodaySelected = !this.isTodaySelected;
                    todayChip.classList.toggle('active', this.isTodaySelected);
                });
            }

            if (addBtn && input) {
                addBtn.addEventListener('click', () => this.addTask());
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });
            }
        },

        addTask() {
            const input = document.getElementById('taskInputTitle');
            const title = (input?.value || '').trim();
            if (!title) return;

            const priority = document.getElementById('taskPrioritySelect')?.value || 'medium';
            const dateVal = document.getElementById('taskDueDateInput')?.value || null;

            const newTask = {
                id: `task_${Date.now()}`,
                title: title,
                isToday: this.isTodaySelected || (!dateVal),
                dueDate: dateVal,
                priority: priority,
                completed: false,
                subtasks: [],
                createdAt: new Date().toISOString()
            };

            Store.data.tasks = Store.data.tasks || [];
            Store.data.tasks.unshift(newTask);
            Store.save();

            input.value = '';
            this.render();
            Dashboard.render();
        },

        toggleTask(id) {
            const task = (Store.data.tasks || []).find(t => t.id === id);
            if (!task) return;
            task.completed = !task.completed;
            Store.save();
            this.render();
            Dashboard.render();
        },

        deleteTask(id) {
            Store.data.tasks = (Store.data.tasks || []).filter(t => t.id !== id);
            Store.save();
            this.render();
            Dashboard.render();
        },

        addSubtask(taskId, inputEl) {
            const title = (inputEl.value || '').trim();
            if (!title) return;

            const task = (Store.data.tasks || []).find(t => t.id === taskId);
            if (!task) return;

            task.subtasks = task.subtasks || [];
            task.subtasks.push({ id: `sub_${Date.now()}`, title: title, completed: false });
            Store.save();
            inputEl.value = '';
            this.render();
        },

        toggleSubtask(taskId, subId) {
            const task = (Store.data.tasks || []).find(t => t.id === taskId);
            if (!task) return;
            const sub = (task.subtasks || []).find(s => s.id === subId);
            if (!sub) return;
            sub.completed = !sub.completed;
            Store.save();
            this.render();
        },

        deleteSubtask(taskId, subId) {
            const task = (Store.data.tasks || []).find(t => t.id === taskId);
            if (!task) return;
            task.subtasks = (task.subtasks || []).filter(s => s.id !== subId);
            Store.save();
            this.render();
        },

        render() {
            const listEl = document.getElementById('tasksList');
            if (!listEl) return;

            const tasks = Store.data.tasks || [];

            if (tasks.length === 0) {
                listEl.innerHTML = `
                    <div class="card" style="text-align:center; padding:24px; color:var(--text-muted); font-size:0.84rem;">
                        No tasks. Type a task above and press Enter.
                    </div>
                `;
                return;
            }

            const todayTasks = tasks.filter(t => t.isToday && !t.completed);
            const otherTasks = tasks.filter(t => !t.isToday && !t.completed);
            const completedTasks = tasks.filter(t => t.completed);

            let html = '';

            if (todayTasks.length > 0) {
                html += `<div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin:14px 0 6px;">Today</div>`;
                html += todayTasks.map(t => this.renderTaskItem(t)).join('');
            }

            if (otherTasks.length > 0) {
                html += `<div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin:14px 0 6px;">Upcoming</div>`;
                html += otherTasks.map(t => this.renderTaskItem(t)).join('');
            }

            if (completedTasks.length > 0) {
                html += `<div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin:14px 0 6px;">Completed (${completedTasks.length})</div>`;
                html += completedTasks.map(t => this.renderTaskItem(t)).join('');
            }

            listEl.innerHTML = html;
        },

        renderTaskItem(t) {
            const subs = t.subtasks || [];
            const completedSubs = subs.filter(s => s.completed).length;

            return `
                <div class="task-item-group">
                    <div class="task-row-main">
                        <div style="display:flex; align-items:center; gap:10px; flex:1;">
                            <div class="task-check ${t.completed ? 'checked' : ''}" onclick="window.StudyVerse.Tasks.toggleTask('${t.id}')">
                                ${t.completed ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                            </div>
                            <span style="font-size:0.88rem; ${t.completed ? 'text-decoration:line-through; color:var(--text-dim);' : ''}">${escapeHtml(t.title)}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:var(--text-muted);">
                            ${subs.length > 0 ? `<span style="font-family:var(--font-mono);">${completedSubs}/${subs.length} sub</span>` : ''}
                            ${t.isToday ? `<span style="color:var(--sv-orange); font-weight:600;">Today</span>` : ''}
                            <button class="btn btn-subtle btn-sm" onclick="window.StudyVerse.Tasks.deleteTask('${t.id}')">&times;</button>
                        </div>
                    </div>

                    <div class="task-subtasks-drawer">
                        ${subs.map(s => `
                            <div class="subtask-row">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div class="task-check ${s.completed ? 'checked' : ''}" style="width:13px; height:13px;" onclick="window.StudyVerse.Tasks.toggleSubtask('${t.id}', '${s.id}')">
                                        ${s.completed ? `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                                    </div>
                                    <span style="${s.completed ? 'text-decoration:line-through; color:var(--text-dim);' : ''}">${escapeHtml(s.title)}</span>
                                </div>
                                <button class="btn btn-subtle btn-sm" onclick="window.StudyVerse.Tasks.deleteSubtask('${t.id}', '${s.id}')">&times;</button>
                            </div>
                        `).join('')}

                        <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                            <span style="color:var(--text-dim); font-size:0.75rem;">+</span>
                            <input type="text" placeholder="Add sub-task... (Enter)" style="background:transparent; border:none; outline:none; font-size:0.78rem; color:var(--text-primary); width:100%;"
                                   onkeydown="if(event.key==='Enter') window.StudyVerse.Tasks.addSubtask('${t.id}', this)">
                        </div>
                    </div>
                </div>
            `;
        }
    };

    /* ==========================================================================
       8. NOTES ENGINE
       ========================================================================== */
    const Notes = {
        selectedNoteId: null,

        init() {
            this.bindEvents();
            this.render();
        },

        bindEvents() {
            const newBtn = document.getElementById('noteNewBtn');
            if (newBtn) newBtn.addEventListener('click', () => this.createNote());

            const titleInput = document.getElementById('noteEditorTitle');
            const bodyInput = document.getElementById('noteEditorBody');
            const courseSelect = document.getElementById('noteCourseSelect');

            if (titleInput) titleInput.addEventListener('input', () => this.saveCurrentNote());
            if (bodyInput) bodyInput.addEventListener('input', () => this.saveCurrentNote());
            if (courseSelect) courseSelect.addEventListener('change', () => this.saveCurrentNote());

            const sendToAiBtn = document.getElementById('noteMakeFlashcardsBtn');
            if (sendToAiBtn) sendToAiBtn.addEventListener('click', () => this.makeFlashcards());

            const deleteBtn = document.getElementById('noteDeleteBtn');
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteCurrentNote());
        },

        createNote(courseId = null) {
            const newNote = {
                id: `note_${Date.now()}`,
                title: 'Untitled Note',
                courseId: courseId,
                content: '',
                updatedAt: new Date().toISOString()
            };

            Store.data.notes = Store.data.notes || [];
            Store.data.notes.unshift(newNote);
            Store.save();

            this.selectedNoteId = newNote.id;
            this.render();
        },

        saveCurrentNote() {
            if (!this.selectedNoteId) return;
            const note = (Store.data.notes || []).find(n => n.id === this.selectedNoteId);
            if (!note) return;

            note.title = (document.getElementById('noteEditorTitle')?.value || '').trim() || 'Untitled';
            note.content = document.getElementById('noteEditorBody')?.value || '';
            const courseSelect = document.getElementById('noteCourseSelect');
            if (courseSelect) note.courseId = courseSelect.value || null;
            note.updatedAt = new Date().toISOString();

            Store.save();
            const titleEl = document.querySelector(`.note-item-btn[data-id="${note.id}"] .note-item-title`);
            if (titleEl) titleEl.textContent = note.title;
        },

        makeFlashcards() {
            if (!this.selectedNoteId) return;
            const note = (Store.data.notes || []).find(n => n.id === this.selectedNoteId);
            if (!note || !note.content) {
                alert('Add text to your note first.');
                return;
            }

            Router.navigate('flashcards');
            Flashcards.switchTab('generator');

            const textInput = document.getElementById('fcStudyNotesInput');
            const titleInput = document.getElementById('fcDeckTitle');
            const courseSelect = document.getElementById('fcCourseSelect');

            if (textInput) textInput.value = note.content;
            if (titleInput) titleInput.value = note.title + ' Flashcards';
            if (courseSelect && note.courseId) courseSelect.value = note.courseId;

            Toast.show('Loaded note text into Flashcards Generator');
        },

        deleteCurrentNote() {
            if (!this.selectedNoteId) return;
            Store.data.notes = (Store.data.notes || []).filter(n => n.id !== this.selectedNoteId);
            this.selectedNoteId = Store.data.notes[0]?.id || null;
            Store.save();
            this.render();
            Toast.show('Note deleted.');
        },

        render() {
            const listEl = document.getElementById('notesList');
            const notes = Store.data.notes || [];

            const courseSelect = document.getElementById('noteCourseSelect');
            if (courseSelect) {
                const courses = Store.data.courses || [];
                courseSelect.innerHTML = `<option value="">No Course</option>` +
                    courses.map(c => `<option value="${c.id}">${escapeHtml(c.code)} - ${escapeHtml(c.title)}</option>`).join('');
            }

            if (notes.length === 0) {
                if (listEl) listEl.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:10px;">No notes. Click "+ New Note".</div>`;
                document.getElementById('noteEditorPane').style.display = 'none';
                return;
            }

            document.getElementById('noteEditorPane').style.display = 'flex';
            if (!this.selectedNoteId || !notes.find(n => n.id === this.selectedNoteId)) {
                this.selectedNoteId = notes[0].id;
            }

            const current = notes.find(n => n.id === this.selectedNoteId);
            if (current) {
                document.getElementById('noteEditorTitle').value = current.title;
                document.getElementById('noteEditorBody').value = current.content;
                if (courseSelect) courseSelect.value = current.courseId || '';
            }

            if (listEl) {
                listEl.innerHTML = notes.map(n => {
                    const course = (Store.data.courses || []).find(c => c.id === n.courseId);
                    return `
                        <button class="note-item-btn ${n.id === this.selectedNoteId ? 'active' : ''}" data-id="${n.id}"
                                onclick="window.StudyVerse.Notes.selectNote('${n.id}')">
                            <div class="note-item-title" style="font-weight:600; font-size:0.85rem; color:var(--text-primary);">${escapeHtml(n.title)}</div>
                            <div style="font-size:0.72rem; color:var(--text-muted); display:flex; gap:4px;">
                                ${course ? `<span style="color:var(--sv-orange); font-weight:600;">${escapeHtml(course.code)}</span><span>·</span>` : ''}
                                <span>${new Date(n.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </button>
                    `;
                }).join('');
            }
        },

        selectNote(id) {
            this.selectedNoteId = id;
            this.render();
        }
    };

    /* ==========================================================================
       9. FUNCTIONAL CALENDAR (MONTH & WEEKDAYS + DAY INSPECTOR MODAL)
       ========================================================================== */
    const Calendar = {
        viewMode: 'month',
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        selectedDateStr: null,

        init() {
            this.bindEvents();
            this.render();
        },

        bindEvents() {
            const prevBtn = document.getElementById('calPrevBtn');
            const nextBtn = document.getElementById('calNextBtn');
            const todayBtn = document.getElementById('calTodayBtn');

            if (prevBtn) prevBtn.addEventListener('click', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
                this.render();
            });

            if (nextBtn) nextBtn.addEventListener('click', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
                this.render();
            });

            if (todayBtn) todayBtn.addEventListener('click', () => {
                this.currentMonth = new Date().getMonth();
                this.currentYear = new Date().getFullYear();
                this.render();
            });

            document.querySelectorAll('.cal-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.cal-tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.viewMode = btn.dataset.calView || 'month';
                    this.render();
                });
            });

            const closeInspectorBtn = document.getElementById('calModalClose');
            if (closeInspectorBtn) closeInspectorBtn.addEventListener('click', () => this.closeInspector());

            const saveEventBtn = document.getElementById('calModalSaveEventBtn');
            if (saveEventBtn) saveEventBtn.addEventListener('click', () => this.saveEventFromModal());
        },

        openInspector(dateStr) {
            this.selectedDateStr = dateStr;
            const modal = document.getElementById('calDayInspectorModal');
            if (!modal) return;

            document.getElementById('calInspectorDateTitle').textContent = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });

            this.renderInspectorEventsList();
            modal.classList.add('show');
        },

        closeInspector() {
            const modal = document.getElementById('calDayInspectorModal');
            if (modal) modal.classList.remove('show');
        },

        renderInspectorEventsList() {
            const listEl = document.getElementById('calInspectorEventsList');
            if (!listEl || !this.selectedDateStr) return;

            const events = (Store.data.events || []).filter(e => e.date === this.selectedDateStr);

            if (events.length === 0) {
                listEl.innerHTML = `<div style="font-size:0.82rem; color:var(--text-muted); padding:8px 0;">No events scheduled for this day.</div>`;
                return;
            }

            listEl.innerHTML = events.map(e => `
                <div class="card" style="padding:10px 12px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-weight:600; font-size:0.9rem; color:var(--text-primary);">${escapeHtml(e.title)}</span>
                            <span style="font-size:0.7rem; font-weight:600; padding:1px 6px; border-radius:4px; background:var(--sv-orange-light); color:var(--sv-orange);">
                                ${escapeHtml(e.tag || 'General')}
                            </span>
                        </div>
                        ${e.time ? `<div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${escapeHtml(e.time)}</div>` : ''}
                        ${e.desc ? `<div style="font-size:0.8rem; color:var(--text-secondary); margin-top:3px;">${escapeHtml(e.desc)}</div>` : ''}
                    </div>
                    <button class="btn btn-subtle btn-sm" onclick="window.StudyVerse.Calendar.deleteEvent('${e.id}')">&times;</button>
                </div>
            `).join('');
        },

        saveEventFromModal() {
            const titleInput = document.getElementById('calEventTitleInput');
            const title = (titleInput?.value || '').trim();
            if (!title) {
                alert('Please enter an event title.');
                return;
            }

            const startTime = document.getElementById('calEventStartTime')?.value || '';
            const endTime = document.getElementById('calEventEndTime')?.value || '';
            const tag = document.getElementById('calEventTagInput')?.value || 'Lecture';
            const desc = (document.getElementById('calEventDescInput')?.value || '').trim();

            const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : (startTime || 'All Day');

            const newEvent = {
                id: `evt_${Date.now()}`,
                date: this.selectedDateStr,
                title: title,
                time: timeStr,
                tag: tag,
                desc: desc
            };

            Store.data.events = Store.data.events || [];
            Store.data.events.push(newEvent);
            Store.save();

            titleInput.value = '';
            document.getElementById('calEventDescInput').value = '';

            this.renderInspectorEventsList();
            this.render();
            Dashboard.render();
            Toast.show("Event added");
        },

        deleteEvent(id) {
            Store.data.events = (Store.data.events || []).filter(e => e.id !== id);
            Store.save();
            this.renderInspectorEventsList();
            this.render();
            Dashboard.render();
        },

        render() {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const titleEl = document.getElementById('calMonthTitle');
            if (titleEl) titleEl.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

            const monthContainer = document.getElementById('calMonthViewContainer');
            const weekContainer = document.getElementById('calWeekViewContainer');

            if (this.viewMode === 'week') {
                if (monthContainer) monthContainer.style.display = 'none';
                if (weekContainer) weekContainer.style.display = 'block';
                this.renderWeekView();
            } else {
                if (monthContainer) monthContainer.style.display = 'block';
                if (weekContainer) weekContainer.style.display = 'none';
                this.renderMonthView();
            }
        },

        renderMonthView() {
            const gridEl = document.getElementById('calGrid');
            if (!gridEl) return;

            const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
            const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
            const today = new Date();
            const events = Store.data.events || [];

            let html = '';
            for (let i = 0; i < firstDay; i++) {
                html += `<div class="cal-cell other-month"></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = today.getDate() === day && today.getMonth() === this.currentMonth && today.getFullYear() === this.currentYear;
                const dayEvents = events.filter(e => e.date === dateKey);

                html += `
                    <div class="cal-cell ${isToday ? 'today' : ''}" onclick="window.StudyVerse.Calendar.openInspector('${dateKey}')">
                        <div class="cal-cell-num">${day}</div>
                        ${dayEvents.map(ev => `
                            <div class="cal-event-pill" title="${escapeHtml(ev.title)}">
                                ${escapeHtml(ev.title)}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            gridEl.innerHTML = html;
        },

        renderWeekView() {
            const weekGrid = document.getElementById('calWeekGrid');
            if (!weekGrid) return;

            const today = new Date();
            const sun = new Date(today);
            sun.setDate(today.getDate() - today.getDay());

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const events = Store.data.events || [];

            let html = '';
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(sun);
                dayDate.setDate(sun.getDate() + i);

                const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                const isToday = today.toDateString() === dayDate.toDateString();
                const dayEvents = events.filter(e => e.date === dateKey);

                html += `
                    <div class="week-col" onclick="window.StudyVerse.Calendar.openInspector('${dateKey}')">
                        <div class="week-col-header" style="${isToday ? 'color:var(--sv-orange); font-weight:700;' : ''}">
                            ${dayNames[i].slice(0, 3)} ${dayDate.getDate()}
                        </div>
                        <div class="week-col-body">
                            ${dayEvents.map(ev => `
                                <div class="card" style="padding:6px 8px; font-size:0.75rem;">
                                    <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(ev.title)}</div>
                                    <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted);">${escapeHtml(ev.time || '')}</div>
                                </div>
                            `).join('')}
                            ${dayEvents.length === 0 ? `<div style="text-align:center; padding-top:16px; font-size:0.72rem; color:var(--text-dim);">+ Add Event</div>` : ''}
                        </div>
                    </div>
                `;
            }
            weekGrid.innerHTML = html;
        }
    };

    /* ==========================================================================
       10. COURSES ENGINE (MODAL ADD COURSE & DRAG-AND-DROP EMBEDS)
       ========================================================================== */
    const Courses = {
        init() {
            this.bindEvents();
            this.render();
        },

        bindEvents() {
            const addBtn = document.getElementById('courseAddBtn');
            if (addBtn) addBtn.addEventListener('click', () => this.openAddCourseModal());

            const saveBtn = document.getElementById('saveNewCourseBtn');
            if (saveBtn) saveBtn.addEventListener('click', () => this.saveNewCourse());
        },

        openAddCourseModal() {
            document.getElementById('newCourseCode').value = '';
            document.getElementById('newCourseTitle').value = '';
            document.getElementById('newCourseInstructor').value = '';
            document.getElementById('newCourseLocation').value = '';
            document.getElementById('addCourseModal').classList.add('show');
        },

        saveNewCourse() {
            const code = (document.getElementById('newCourseCode')?.value || '').trim().toUpperCase();
            const title = (document.getElementById('newCourseTitle')?.value || '').trim();
            const prof = (document.getElementById('newCourseInstructor')?.value || '').trim() || 'TBA';
            const loc = (document.getElementById('newCourseLocation')?.value || '').trim() || 'Campus';

            if (!code || !title) {
                alert('Please enter both Course Code (e.g. CS101) and Course Title.');
                return;
            }

            const newCourse = {
                id: `course_${Date.now()}`,
                code: code,
                title: title,
                instructor: prof,
                location: loc,
                createdAt: new Date().toISOString()
            };

            Store.data.courses = Store.data.courses || [];
            Store.data.courses.push(newCourse);
            Store.save();

            document.getElementById('addCourseModal').classList.remove('show');
            this.render();
            Toast.show(`Added course ${newCourse.code}`);
        },

        handleDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('drag-target-hover');
        },

        handleDragLeave(e) {
            e.currentTarget.classList.remove('drag-target-hover');
        },

        handleDrop(e, courseId) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-target-hover');

            const deckId = e.dataTransfer.getData('text/plain') || Flashcards.draggedDeckId;
            if (!deckId) return;

            const deck = (Store.data.decks || []).find(d => d.id === deckId);
            const course = (Store.data.courses || []).find(c => c.id === courseId);

            if (deck && course) {
                deck.courseId = courseId;
                Store.save();
                Toast.show(`Embedded "${deck.title}" into ${course.code}`);
                this.render();
                Flashcards.renderDecksList();
            }
        },

        openCourseDetails(courseId) {
            const course = (Store.data.courses || []).find(c => c.id === courseId);
            if (!course) return;

            const linkedDecks = (Store.data.decks || []).filter(d => d.courseId === courseId);
            const linkedNotes = (Store.data.notes || []).filter(n => n.courseId === courseId);

            const modal = document.getElementById('courseDetailsModal');
            if (!modal) return;

            document.getElementById('courseModalTitle').textContent = `${course.code}: ${course.title}`;
            document.getElementById('courseModalMeta').textContent = `Instructor: ${course.instructor} · Location: ${course.location}`;

            const decksList = document.getElementById('courseModalDecksList');
            if (decksList) {
                decksList.innerHTML = linkedDecks.length === 0
                    ? `<div style="font-size:0.8rem; color:var(--text-muted);">No flashcards embedded yet. Drag a deck onto this course card or generate cards.</div>`
                    : linkedDecks.map(d => `
                        <div class="card" style="padding:10px 14px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-weight:600; font-size:0.86rem;">${escapeHtml(d.title)}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted); margin-left:8px;">${d.cards?.length || 0} cards</span>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="window.StudyVerse.Flashcards.startPracticeById('${d.id}')">Practice</button>
                        </div>
                    `).join('');
            }

            const notesList = document.getElementById('courseModalNotesList');
            if (notesList) {
                notesList.innerHTML = linkedNotes.length === 0
                    ? `<div style="font-size:0.8rem; color:var(--text-muted);">No notes embedded for this course.</div>`
                    : linkedNotes.map(n => `
                        <div class="card" style="padding:10px 14px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600; font-size:0.86rem;">${escapeHtml(n.title)}</span>
                            <button class="btn btn-secondary btn-sm" onclick="window.StudyVerse.Router.navigate('notes'); window.StudyVerse.Notes.selectNote('${n.id}')">Open</button>
                        </div>
                    `).join('');
            }

            document.getElementById('courseModalAddNoteBtn').onclick = () => {
                modal.classList.remove('show');
                Router.navigate('notes');
                Notes.createNote(courseId);
            };

            modal.classList.add('show');
        },

        deleteCourse(id) {
            if (!confirm('Remove this course?')) return;
            Store.data.courses = (Store.data.courses || []).filter(c => c.id !== id);
            Store.save();
            this.render();
            Toast.show('Course removed.');
        },

        render() {
            const grid = document.getElementById('coursesGrid');
            if (!grid) return;

            const courses = Store.data.courses || [];

            if (courses.length === 0) {
                grid.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1; text-align:center; padding:32px;">
                        <h4 style="font-size:0.95rem; font-weight:600;">No Courses Added</h4>
                        <p style="font-size:0.82rem; color:var(--text-muted); margin:6px 0 16px;">Add your enrolled classes to link decks and notes.</p>
                        <button class="btn btn-primary btn-sm" onclick="window.StudyVerse.Courses.openAddCourseModal()">+ Add Course</button>
                    </div>
                `;
                return;
            }

            grid.innerHTML = courses.map(c => {
                const linkedDecks = (Store.data.decks || []).filter(d => d.courseId === c.id);
                const linkedNotes = (Store.data.notes || []).filter(n => n.courseId === c.id);

                return `
                    <div class="course-card"
                         ondragover="window.StudyVerse.Courses.handleDragOver(event)"
                         ondragleave="window.StudyVerse.Courses.handleDragLeave(event)"
                         ondrop="window.StudyVerse.Courses.handleDrop(event, '${c.id}')">
                        <div>
                            <div class="course-code">${escapeHtml(c.code)}</div>
                            <h3 class="course-title">${escapeHtml(c.title)}</h3>
                            <div style="font-size:0.8rem; color:var(--text-muted); line-height:1.45;">
                                <div>Instructor: ${escapeHtml(c.instructor)}</div>
                                <div>Location: ${escapeHtml(c.location)}</div>
                            </div>

                            <div class="course-embedded-chips">
                                ${linkedDecks.map(d => `<span class="course-embedded-chip">Deck: ${escapeHtml(d.title)}</span>`).join('')}
                                ${linkedNotes.map(n => `<span class="course-embedded-chip">Note: ${escapeHtml(n.title)}</span>`).join('')}
                                ${linkedDecks.length === 0 && linkedNotes.length === 0 ? `<span style="font-size:0.74rem; color:var(--text-dim);">(Drag & drop decks or notes here)</span>` : ''}
                            </div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px solid var(--border-subtle); padding-top:10px;">
                            <button class="btn btn-secondary btn-sm" onclick="window.StudyVerse.Courses.openCourseDetails('${c.id}')">
                                Open Course
                            </button>
                            <button class="btn btn-subtle btn-sm" onclick="window.StudyVerse.Courses.deleteCourse('${c.id}')">&times;</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    };

    /* ==========================================================================
       11. SPA ROUTER & PROFILE DROPDOWN
       ========================================================================== */
    const Router = {
        init() {
            window.addEventListener('hashchange', () => this.handleHash());
            window.addEventListener('popstate', () => this.handleHash());

            document.querySelectorAll('.app-nav .nav-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate(btn.dataset.route);
                });
            });

            document.querySelectorAll('[data-route-jump]').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate(el.dataset.routeJump);
                });
            });

            const profileBtn = document.getElementById('headerProfileBtn');
            const dropdown = document.getElementById('profileDropdown');

            if (profileBtn && dropdown) {
                profileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('show');
                });
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('#profileDropdown') && !e.target.closest('#headerProfileBtn')) {
                        dropdown.classList.remove('show');
                    }
                });
            }

            const openEditProfileBtn = document.getElementById('dropEditProfileBtn');
            if (openEditProfileBtn) {
                openEditProfileBtn.addEventListener('click', () => {
                    dropdown.classList.remove('show');
                    ProfileModal.open();
                });
            }

            const themeBtn = document.getElementById('dropToggleThemeBtn');
            if (themeBtn) {
                themeBtn.addEventListener('click', () => Store.toggleTheme());
            }

            const resetBtn = document.getElementById('dropResetBtn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => Store.resetWorkspace());
            }

            // PFP Preset Selector in modal
            document.querySelectorAll('.pfp-preset-opt').forEach(opt => {
                opt.addEventListener('click', () => {
                    document.querySelectorAll('.pfp-preset-opt').forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    ProfileModal.selectedPreset = opt.dataset.preset;
                    ProfileModal.uploadedDataUrl = null;
                });
            });

            const pfpFileInput = document.getElementById('pfpFileInput');
            if (pfpFileInput) {
                pfpFileInput.addEventListener('change', (e) => {
                    if (e.target.files?.[0]) ProfileModal.handleImageUpload(e.target.files[0]);
                });
            }

            const saveProfileBtn = document.getElementById('saveProfileChangesBtn');
            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', () => ProfileModal.save());
            }

            this.handleHash();
        },

        handleHash() {
            let hash = window.location.hash.replace('#', '').toLowerCase();
            const valid = ['dashboard', 'flashcards', 'pomodoro', 'tasks', 'notes', 'calendar', 'courses'];
            this.showView(valid.includes(hash) ? hash : 'dashboard');
        },

        navigate(route) {
            window.location.hash = route;
            this.showView(route);
        },

        showView(route) {
            document.querySelectorAll('.app-nav .nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.route === route);
            });

            document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active-view'));
            const target = document.getElementById(`view-${route}`);
            if (target) {
                target.classList.add('active-view');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            if (route === 'dashboard') Dashboard.render();
            if (route === 'flashcards') Flashcards.renderDecksList();
            if (route === 'tasks') Tasks.render();
            if (route === 'notes') Notes.render();
            if (route === 'calendar') Calendar.render();
            if (route === 'courses') Courses.render();
            if (route === 'pomodoro') Pomodoro.updateDisplay();
        }
    };

    /* ==========================================================================
       12. TOAST NOTICES
       ========================================================================== */
    const Toast = {
        timer: null,
        show(msg) {
            const toast = document.getElementById('toastNotice');
            const text = document.getElementById('toastText');
            if (!toast || !text) return;
            text.textContent = msg;
            toast.classList.add('show');
            clearTimeout(this.timer);
            this.timer = setTimeout(() => toast.classList.remove('show'), 3000);
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ==========================================================================
       13. BOOTSTRAP
       ========================================================================== */
    document.addEventListener('DOMContentLoaded', async () => {
        Constellations.init();
        await Store.init();

        Pomodoro.init();
        Flashcards.init();
        Tasks.init();
        Notes.init();
        Calendar.init();
        Courses.init();
        Dashboard.init();
        Router.init();

        window.StudyVerse = {
            Store,
            Constellations,
            Pomodoro,
            Flashcards,
            Tasks,
            Notes,
            Calendar,
            Courses,
            Dashboard,
            Router,
            Toast,
            ProfileModal
        };
    });

})();

(function () {
    'use strict';

    const Constellations = {
        canvas: null,
        ctx: null,
        stars: [],
        deepStars: [],
        constellationsData: [],
        meteors: [],
        width: 0,
        height: 0,
        mouse: { x: -1000, y: -1000, targetX: 0, targetY: 0, currentX: 0, currentY: 0 },
        lastMeteorTime: 0,
        hoveredConstellation: null,

        init() {
            this.canvas = document.getElementById('constellationCanvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.setupSpaceField();

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
                this.mouse.targetX = (e.clientX - this.width / 2) * 0.05;
                this.mouse.targetY = (e.clientY - this.height / 2) * 0.05;
            });

            window.addEventListener('resize', () => {
                this.resize();
                this.setupSpaceField();
            });

            this.animate();
        },

        resize() {
            if (!this.canvas) return;
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
        },

        setupSpaceField() {
            const w = this.width;
            const h = this.height;

            this.deepStars = [];
            const deepCount = Math.floor((w * h) / 6000);
            for (let i = 0; i < deepCount; i++) {
                this.deepStars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    depth: Math.random() * 0.4 + 0.1, 
                    r: Math.random() * 0.9 + 0.4,
                    alpha: Math.random() * 0.35 + 0.15,
                    twinkleSpeed: Math.random() * 0.02 + 0.008,
                    twinklePhase: Math.random() * Math.PI * 2,
                    vx: (Math.random() - 0.5) * 0.08,
                    vy: (Math.random() - 0.5) * 0.08
                });
            }

            this.stars = [];
            const midCount = Math.floor((w * h) / 12000);
            for (let i = 0; i < midCount; i++) {
                this.stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    depth: Math.random() * 0.4 + 0.6, 
                    r: Math.random() * 1.4 + 0.7,
                    alpha: Math.random() * 0.4 + 0.2,
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: (Math.random() - 0.5) * 0.15,
                    twinkleSpeed: Math.random() * 0.03 + 0.01,
                    twinklePhase: Math.random() * Math.PI * 2
                });
            }

            this.constellationsData = [
                {
                    name: "Orion",
                    latin: "The Hunter (with Betelgeuse & Rigel)",
                    center: { x: w * 0.18, y: h * 0.28 },
                    depth: 1.35, 
                    scale: Math.min(w, h) * 0.0022,
                    opacity: 0.9,
                    stars: [
                        { name: "Betelgeuse", ox: -35, oy: -55, r: 3.4, bright: true, color: "orange" },
                        { name: "Bellatrix", ox: 32, oy: -50, r: 2.6, bright: true },
                        { name: "Alnitak", ox: -16, oy: -6, r: 2.3, bright: true },
                        { name: "Alnilam", ox: 0, oy: -4, r: 2.5, bright: true },
                        { name: "Mintaka", ox: 16, oy: -2, r: 2.3, bright: true },
                        { name: "Saiph", ox: -30, oy: 50, r: 2.5, bright: true },
                        { name: "Rigel", ox: 35, oy: 55, r: 3.6, bright: true, color: "blue" },
                        { name: "Meissa", ox: 0, oy: -75, r: 2.1 }
                    ],
                    lines: [
                        [0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 7], [1, 7]
                    ]
                },
                {
                    name: "Ursa Major",
                    latin: "The Great Bear (Big Dipper)",
                    center: { x: w * 0.82, y: h * 0.24 },
                    depth: 1.0, 
                    scale: Math.min(w, h) * 0.0018,
                    opacity: 0.75,
                    stars: [
                        { name: "Dubhe", ox: 40, oy: -35, r: 2.7, bright: true },
                        { name: "Merak", ox: 42, oy: 15, r: 2.5, bright: true },
                        { name: "Phecda", ox: -5, oy: 20, r: 2.4, bright: true },
                        { name: "Megrez", ox: -10, oy: -28, r: 2.3, bright: true },
                        { name: "Alioth", ox: -50, oy: -32, r: 2.7, bright: true },
                        { name: "Mizar", ox: -82, oy: -45, r: 2.6, bright: true },
                        { name: "Alkaid", ox: -115, oy: -65, r: 2.9, bright: true }
                    ],
                    lines: [
                        [0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]
                    ]
                },
                {
                    name: "Cassiopeia",
                    latin: "The Queen (W-Constellation)",
                    center: { x: w * 0.52, y: h * 0.16 },
                    depth: 0.55, 
                    scale: Math.min(w, h) * 0.0012,
                    opacity: 0.5,
                    stars: [
                        { name: "Caph", ox: -65, oy: 10, r: 2.2, bright: true },
                        { name: "Schedar", ox: -30, oy: -22, r: 2.5, bright: true, color: "orange" },
                        { name: "Gamma Cas", ox: 0, oy: 12, r: 2.6, bright: true },
                        { name: "Ruchbah", ox: 32, oy: -18, r: 2.1, bright: true },
                        { name: "Segin", ox: 65, oy: 15, r: 2.0, bright: true }
                    ],
                    lines: [
                        [0, 1], [1, 2], [2, 3], [3, 4]
                    ]
                },
                {
                    name: "Cygnus",
                    latin: "The Northern Cross (with Deneb & Albireo)",
                    center: { x: w * 0.74, y: h * 0.75 },
                    depth: 0.8, 
                    scale: Math.min(w, h) * 0.0015,
                    opacity: 0.65,
                    stars: [
                        { name: "Deneb", ox: 0, oy: -55, r: 3.0, bright: true, color: "blue" },
                        { name: "Sadr", ox: 0, oy: 0, r: 2.4, bright: true },
                        { name: "Albireo", ox: 0, oy: 65, r: 2.4, bright: true, color: "orange" },
                        { name: "Gienah", ox: -45, oy: 5, r: 2.2, bright: true },
                        { name: "Fawaris", ox: 48, oy: -5, r: 2.2, bright: true }
                    ],
                    lines: [
                        [0, 1], [1, 2], [3, 1], [1, 4]
                    ]
                },
                {
                    name: "Canis Major",
                    latin: "Home of Sirius, the Brightest Star",
                    center: { x: w * 0.16, y: h * 0.78 },
                    depth: 1.45, 
                    scale: Math.min(w, h) * 0.0022,
                    opacity: 0.95,
                    stars: [
                        { name: "Sirius", ox: 0, oy: -40, r: 4.4, bright: true, radiant: true, color: "blue" },
                        { name: "Mirzam", ox: -38, oy: -35, r: 2.7, bright: true },
                        { name: "Muliphein", ox: 22, oy: -25, r: 2.1 },
                        { name: "Wezen", ox: 15, oy: 25, r: 3.0, bright: true },
                        { name: "Adhara", ox: -12, oy: 48, r: 3.2, bright: true },
                        { name: "Aludra", ox: 42, oy: 52, r: 2.8, bright: true }
                    ],
                    lines: [
                        [0, 1], [0, 2], [0, 3], [3, 4], [3, 5]
                    ]
                },
                {
                    name: "Taurus & Pleiades",
                    latin: "The Bull (with Red Giant Aldebaran)",
                    center: { x: w * 0.44, y: h * 0.82 },
                    depth: 0.65, 
                    scale: Math.min(w, h) * 0.0013,
                    opacity: 0.58,
                    stars: [
                        { name: "Aldebaran", ox: -15, oy: 10, r: 3.3, bright: true, color: "orange" },
                        { name: "Elnath", ox: 45, oy: -45, r: 2.4, bright: true },
                        { name: "Tianguan", ox: 50, oy: 25, r: 2.1 },
                        { name: "Ain", ox: -5, oy: -15, r: 2.0 },
                        { name: "Hyadum I", ox: -30, oy: -5, r: 1.9 },
                        { name: "Pleiades Cluster", ox: -65, oy: -35, r: 2.4, cluster: true }
                    ],
                    lines: [
                        [0, 3], [3, 4], [0, 4], [3, 1], [0, 2]
                    ]
                }
            ];
        },

        spawnMeteor(isShower = false) {
            const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.22;
            const speed = Math.random() * 9 + 14;
            const length = Math.random() * 90 + 75;

            this.meteors.push({
                x: Math.random() * this.width * 1.3 - this.width * 0.25,
                y: -60,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                length: length,
                alpha: 1,
                decay: isShower ? 0.014 : 0.018,
                width: Math.random() * 1.6 + 1.2
            });
        },

        triggerMeteorShower(count = 24) {
            Toast.show("✦ 10 Streak Combo! Meteor Shower Unlocked ✦");
            let spawned = 0;
            const interval = setInterval(() => {
                this.spawnMeteor(true);
                this.spawnMeteor(true);
                spawned += 2;
                if (spawned >= count) clearInterval(interval);
            }, 110);
        },

        animate() {
            const ctx = this.ctx;
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.clearRect(0, 0, this.width, this.height);

            const bgGrad = ctx.createRadialGradient(
                this.width * 0.5, this.height * 0.4, 100,
                this.width * 0.5, this.height * 0.5, Math.max(this.width, this.height) * 0.8
            );
            if (isDark) {
                bgGrad.addColorStop(0, 'rgba(24, 24, 30, 0.2)');
                bgGrad.addColorStop(1, 'rgba(15, 16, 19, 0.4)');
            } else {
                bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
                bgGrad.addColorStop(1, 'rgba(246, 246, 244, 0.35)');
            }
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, this.width, this.height);

            this.mouse.currentX += (this.mouse.targetX - this.mouse.currentX) * 0.08;
            this.mouse.currentY += (this.mouse.targetY - this.mouse.currentY) * 0.08;

            const starBaseR = isDark ? 255 : 24;
            const starBaseG = isDark ? 255 : 24;
            const starBaseB = isDark ? 255 : 27;

            for (let i = 0; i < this.deepStars.length; i++) {
                const s = this.deepStars[i];
                s.twinklePhase += s.twinkleSpeed;
                const twinkle = Math.sin(s.twinklePhase) * 0.25 + 0.75;
                const px = s.x + this.mouse.currentX * s.depth;
                const py = s.y + this.mouse.currentY * s.depth;

                ctx.beginPath();
                ctx.arc(px, py, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${starBaseR}, ${starBaseG}, ${starBaseB}, ${s.alpha * twinkle * (isDark ? 0.7 : 0.4)})`;
                ctx.fill();
            }

            for (let i = 0; i < this.stars.length; i++) {
                const s = this.stars[i];
                s.x += s.vx;
                s.y += s.vy;
                if (s.x < 0) s.x = this.width;
                if (s.x > this.width) s.x = 0;
                if (s.y < 0) s.y = this.height;
                if (s.y > this.height) s.y = 0;

                s.twinklePhase += s.twinkleSpeed;
                const twinkle = Math.sin(s.twinklePhase) * 0.3 + 0.7;
                const px = s.x + this.mouse.currentX * s.depth;
                const py = s.y + this.mouse.currentY * s.depth;

                ctx.beginPath();
                ctx.arc(px, py, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${starBaseR}, ${starBaseG}, ${starBaseB}, ${s.alpha * twinkle * (isDark ? 1.0 : 0.65)})`;
                ctx.fill();
            }

            let hoveredConst = null;

            this.constellationsData.forEach((c) => {
                const depth = c.depth || 1.0;
                const cx = c.center.x + this.mouse.currentX * depth;
                const cy = c.center.y + this.mouse.currentY * depth;
                const scale = c.scale || 1;
                const baseOpacity = c.opacity || 0.8;

                const distToCenter = Math.hypot(this.mouse.x - cx, this.mouse.y - cy);
                const isHovered = distToCenter < (120 * depth);
                if (isHovered) hoveredConst = c;

                c.lines.forEach(([i1, i2]) => {
                    const st1 = c.stars[i1];
                    const st2 = c.stars[i2];
                    const x1 = cx + st1.ox * scale;
                    const y1 = cy + st1.oy * scale;
                    const x2 = cx + st2.ox * scale;
                    const y2 = cy + st2.oy * scale;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    if (isHovered) {
                        ctx.strokeStyle = `rgba(232, 152, 60, ${isDark ? 0.55 : 0.4})`;
                        ctx.lineWidth = 1.4 * Math.min(1.2, depth);
                    } else {
                        const lineAlpha = (isDark ? 0.18 : 0.1) * baseOpacity * depth;
                        ctx.strokeStyle = `rgba(${starBaseR}, ${starBaseG}, ${starBaseB}, ${lineAlpha})`;
                        ctx.lineWidth = 0.85 * Math.min(1.1, depth);
                    }
                    ctx.stroke();
                });

                c.stars.forEach((st) => {
                    const sx = cx + st.ox * scale;
                    const sy = cy + st.oy * scale;
                    const starRadius = st.r * Math.min(1.25, Math.max(0.7, depth * 0.9));

                    if (st.bright || isHovered) {
                        const haloRadius = starRadius * (isHovered ? 4.5 : 3.0);
                        ctx.beginPath();
                        ctx.arc(sx, sy, haloRadius, 0, Math.PI * 2);
                        const haloGrad = ctx.createRadialGradient(sx, sy, starRadius * 0.4, sx, sy, haloRadius);
                        if (st.color === 'orange' || isHovered) {
                            haloGrad.addColorStop(0, `rgba(232, 152, 60, ${0.45 * baseOpacity})`);
                            haloGrad.addColorStop(1, 'rgba(232, 152, 60, 0)');
                        } else if (st.color === 'blue') {
                            haloGrad.addColorStop(0, `rgba(96, 165, 250, ${0.45 * baseOpacity})`);
                            haloGrad.addColorStop(1, 'rgba(96, 165, 250, 0)');
                        } else {
                            haloGrad.addColorStop(0, isDark ? `rgba(255, 255, 255, ${0.35 * baseOpacity})` : `rgba(24, 24, 27, ${0.25 * baseOpacity})`);
                            haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        }
                        ctx.fillStyle = haloGrad;
                        ctx.fill();
                    }

                    ctx.beginPath();
                    ctx.arc(sx, sy, starRadius * (isHovered ? 1.2 : 1), 0, Math.PI * 2);
                    if (st.color === 'orange') {
                        ctx.fillStyle = isDark ? '#fba444' : '#d97706';
                    } else if (st.color === 'blue') {
                        ctx.fillStyle = isDark ? '#93c5fd' : '#2563eb';
                    } else {
                        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${baseOpacity})` : `rgba(24, 24, 27, ${baseOpacity})`;
                    }
                    ctx.fill();
                });

                if (isHovered) {
                    ctx.save();
                    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
                    ctx.fillStyle = isDark ? 'rgba(232, 152, 60, 0.95)' : 'rgba(194, 107, 18, 0.95)';
                    ctx.textAlign = 'center';
                    ctx.fillText(`✦ ${c.name} Constellation`, cx, cy + 90 * scale);
                    ctx.font = '400 9px Plus Jakarta Sans, sans-serif';
                    ctx.fillStyle = isDark ? 'rgba(161, 161, 170, 0.85)' : 'rgba(113, 113, 122, 0.85)';
                    ctx.fillText(c.latin, cx, cy + 104 * scale);
                    ctx.restore();
                }
            });

            const now = Date.now();
            if (now - this.lastMeteorTime > 4000 && Math.random() < 0.38) {
                this.spawnMeteor();
                this.lastMeteorTime = now;
            }

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
                grad.addColorStop(0, `rgba(${starBaseR}, ${starBaseG}, ${starBaseB}, 0)`);
                grad.addColorStop(0.7, `rgba(232, 152, 60, ${m.alpha * 0.5})`);
                grad.addColorStop(1, isDark ? `rgba(255, 255, 255, ${m.alpha})` : `rgba(24, 24, 27, ${m.alpha * 0.9})`);

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

    const Store = {
        uid: null,
        data: {
            profile: {
                username: 'Scholar',
                pfp: 'star',
                customAvatarUrl: null,
                streak: 1,
                lastActiveDate: new Date().toISOString().split('T')[0],
                theme: 'light'
            },
            metrics: [],
            tasks: [],
            notes: [],
            events: [],
            courses: [],
            decks: [],
            pomodoro: {
                completedSessions: 0,
                totalFocusMinutes: 0
            },
            classroom: {
                connected: false,
                user: null,
                lastSynced: null,
                classes: [],
                upcoming: [],
                recentPosts: []
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

            this.data.profile = this.data.profile || {
                username: 'Scholar',
                pfp: 'star',
                customAvatarUrl: null,
                streak: 1,
                lastActiveDate: new Date().toISOString().split('T')[0],
                theme: 'light'
            };
            this.data.metrics = this.data.metrics || [];

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
                orbit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9"/></svg>`,
                scholar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
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

        openResetModal() {
            const modal = document.getElementById('resetConfirmModal');
            const expectedNameSpan = document.getElementById('resetConfirmExpectedName');
            const input = document.getElementById('resetConfirmInput');
            const btn = document.getElementById('executeResetBtn');
            const err = document.getElementById('resetConfirmError');

            if (!modal) return;

            const expected = (this.data.profile?.username || 'Scholar').trim();
            if (expectedNameSpan) expectedNameSpan.textContent = expected;
            if (input) {
                input.value = '';
                input.focus();
            }
            if (btn) btn.disabled = true;
            if (err) err.style.display = 'none';

            modal.classList.add('show');
        },

        async executeReset() {
            const input = document.getElementById('resetConfirmInput');
            const expected = (this.data.profile?.username || 'Scholar').trim();
            const val = (input?.value || '').trim();

            if (val !== expected) {
                const err = document.getElementById('resetConfirmError');
                if (err) err.style.display = 'block';
                return;
            }

            try {
                await fetch('/api/user-data/reset', { method: 'POST' });
            } catch (e) {}

            localStorage.removeItem('studyverse_user_data');
            localStorage.removeItem('studyverse_pomodoro_state');

            this.data = {
                uid: this.uid,
                profile: {
                    username: expected,
                    pfp: this.data.profile?.pfp || 'star',
                    customAvatarUrl: null,
                    streak: 1,
                    lastActiveDate: new Date().toISOString().split('T')[0],
                    theme: this.data.profile?.theme || 'light'
                },
                metrics: [],
                tasks: [],
                notes: [],
                events: [],
                courses: [],
                decks: [],
                pomodoro: {
                    completedSessions: 0,
                    totalFocusMinutes: 0
                },
                classroom: {
                    connected: false,
                    user: null,
                    lastSynced: null,
                    classes: [],
                    upcoming: [],
                    recentPosts: []
                }
            };

            const modal = document.getElementById('resetConfirmModal');
            if (modal) modal.classList.remove('show');

            Dashboard.render();
            Flashcards.renderDecksList();
            Tasks.render();
            Notes.render();
            Calendar.render();
            Courses.render();
            Classroom.render();
            SettingsModal.render();
            Pomodoro.reset();

            Toast.show("Workspace reset to blank slate");
        }
    };

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

    const Dashboard = {
        draggedMetricId: null,

        init() {
            this.bindEvents();
            this.render();
        },

        bindEvents() {
            const addMetricBtn = document.getElementById('openAddMetricModalBtn');
            if (addMetricBtn) addMetricBtn.addEventListener('click', () => this.openAddMetricModal());

            const floatingWidgetBtn = document.getElementById('floatingAddWidgetBtn');
            if (floatingWidgetBtn) floatingWidgetBtn.addEventListener('click', () => this.openAddMetricModal());

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
            Toast.show(`Added widget "${name}"`);
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
            Toast.show("Widget removed");
        },

        handleMetricDragStart(e, id) {
            this.draggedMetricId = id;
            e.dataTransfer.setData('text/plain', id);
            e.currentTarget.classList.add('dragging');
        },

        handleMetricDragEnd(e) {
            e.currentTarget.classList.remove('dragging');
            document.querySelectorAll('.custom-metric-card').forEach(c => c.classList.remove('drag-target-hover'));
        },

        handleMetricDrop(e, targetId) {
            e.preventDefault();
            if (!this.draggedMetricId || this.draggedMetricId === targetId) return;

            const metrics = Store.data.metrics || [];
            const srcIdx = metrics.findIndex(m => m.id === this.draggedMetricId);
            const targetIdx = metrics.findIndex(m => m.id === targetId);

            if (srcIdx > -1 && targetIdx > -1) {
                const [moved] = metrics.splice(srcIdx, 1);
                metrics.splice(targetIdx, 0, moved);
                Store.save();
                this.render();
            }
        },

        render() {
            Store.updateProfileUI();

            const streakCountEl = document.getElementById('dashMetricStreak');
            if (streakCountEl) {
                const st = Store.data.profile.streak || 1;
                streakCountEl.textContent = `${st} ${st === 1 ? 'Day' : 'Days'}`;
                streakCountEl.classList.add('highlight-orange');
            }

            const pomoMins = Store.data.pomodoro?.totalFocusMinutes || 0;
            const focusTimeEl = document.getElementById('dashMetricFocus');
            if (focusTimeEl) focusTimeEl.textContent = `${pomoMins} min`;

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

            const tasks = Store.data.tasks || [];
            const completedCount = tasks.filter(t => t.completed).length;
            const taskRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
            const taskRateEl = document.getElementById('dashMetricTasks');
            if (taskRateEl) taskRateEl.textContent = `${completedCount} / ${tasks.length}`;

            const velocityDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const todayIndex = new Date().getDay();
            const barsWrap = document.getElementById('velocityBarsWrap');
            if (barsWrap) {
                barsWrap.innerHTML = velocityDays.map((day, idx) => {
                    const isToday = idx === todayIndex;
                    const heightPercent = isToday ? Math.min(100, Math.max(18, (pomoMins / 60) * 100)) : 10;
                    return `
                        <div class="velocity-bar-col">
                            <div class="velocity-bar-fill ${isToday ? 'active' : ''}" style="height:${heightPercent}%;"></div>
                            <span class="velocity-bar-day" style="${isToday ? 'font-weight:700; color:var(--sv-orange);' : ''}">${day}</span>
                        </div>
                    `;
                }).join('');
            }

            const metricsSection = document.getElementById('customMetricsSection');
            const customGrid = document.getElementById('customMetricsGrid');
            const metrics = Store.data.metrics || [];

            if (metricsSection) {
                metricsSection.style.display = metrics.length > 0 ? 'block' : 'none';
            }

            if (customGrid && metrics.length > 0) {
                customGrid.innerHTML = metrics.map(m => {
                    const pct = Math.min(100, Math.round(((m.current || 0) / (m.target || 1)) * 100));
                    return `
                        <div class="custom-metric-card" draggable="true"
                             ondragstart="window.StudyVerse.Dashboard.handleMetricDragStart(event, '${m.id}')"
                             ondragend="window.StudyVerse.Dashboard.handleMetricDragEnd(event)"
                             ondragover="event.preventDefault()"
                             ondrop="window.StudyVerse.Dashboard.handleMetricDrop(event, '${m.id}')">
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

            const todayTasks = tasks.filter(t => t.isToday && !t.completed);
            const taskPreview = document.getElementById('dashTodayTasksList');
            if (taskPreview) {
                taskPreview.innerHTML = todayTasks.length === 0
                    ? `<div style="font-size:0.82rem; color:var(--text-muted); padding:8px 0;">No pending tasks for today.</div>`
                    : todayTasks.slice(0, 3).map(t => `
                        <div style="display:flex; align-items:center; gap:8px; padding:6px 0; font-size:0.85rem; border-bottom:1px solid var(--border-subtle);">
                            <div class="task-check" onclick="window.StudyVerse.Tasks.toggleTask('${t.id}')"></div>
                            <span style="font-weight:500;">${escapeHtml(t.title)}</span>
                        </div>
                    `).join('');
            }

            const events = Calendar.getSortedEvents();
            const eventPreview = document.getElementById('dashEventsList');
            if (eventPreview) {
                eventPreview.innerHTML = events.length === 0
                    ? `<div style="font-size:0.82rem; color:var(--text-muted); padding:8px 0;">No upcoming events scheduled.</div>`
                    : events.slice(0, 3).map(e => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:0.85rem; border-bottom:1px solid var(--border-subtle);">
                            <span style="font-weight:600;">${escapeHtml(e.title)}</span>
                            <span style="color:var(--text-muted); font-size:0.75rem; font-family:var(--font-mono);">${e.time || e.date}</span>
                        </div>
                    `).join('');
            }

            const deckPreview = document.getElementById('dashDecksList');
            if (deckPreview) {
                deckPreview.innerHTML = decks.length === 0
                    ? `<div style="font-size:0.82rem; color:var(--text-muted); padding:8px 0;">No decks created yet.</div>`
                    : decks.slice(0, 3).map(d => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:0.85rem; border-bottom:1px solid var(--border-subtle);">
                            <span style="font-weight:600;">${escapeHtml(d.title)}</span>
                            <button class="btn btn-secondary btn-sm" onclick="window.StudyVerse.Flashcards.startPracticeById('${d.id}')">Practice</button>
                        </div>
                    `).join('');
            }
        }
    };

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
                Toast.show(`Focus session finished (+${mins}m logged)`);
                this.setMode('shortBreak');
            } else {
                Toast.show("Break finished. Ready to focus?");
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

    const Flashcards = {
        activeTab: 'decks',
        extractedText: '',
        generatedCards: [],
        manualCards: [
            { question: '', answer: '' },
            { question: '', answer: '' },
            { question: '', answer: '' }
        ],
        currentPracticeDeck: null,
        currentCardIndex: 0,
        isFlipped: false,
        consecutiveCorrectStreak: 0,
        draggedDeckId: null,

        init() {
            this.bindEvents();
            this.renderDecksList();
            this.renderManualCardsList();
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

            const addCardTopBtn = document.getElementById('fcAddManualCardBtn');
            if (addCardTopBtn) addCardTopBtn.addEventListener('click', () => this.addManualCardRow());

            const addCardBottomBtn = document.getElementById('fcAddManualCardBottomBtn');
            if (addCardBottomBtn) addCardBottomBtn.addEventListener('click', () => this.addManualCardRow());

            const saveManualTopBtn = document.getElementById('fcSaveManualDeckBtn');
            if (saveManualTopBtn) saveManualTopBtn.addEventListener('click', () => this.saveManualDeck());

            const saveManualBottomBtn = document.getElementById('fcSaveManualDeckBottomBtn');
            if (saveManualBottomBtn) saveManualBottomBtn.addEventListener('click', () => this.saveManualDeck());

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

            const genTab = document.getElementById('fcTabGenerator');
            const decksTab = document.getElementById('fcTabDecks');
            const manualTab = document.getElementById('fcTabManual');
            const practiceTab = document.getElementById('fcTabPractice');

            if (genTab) genTab.style.display = tabId === 'generator' ? 'block' : 'none';
            if (decksTab) decksTab.style.display = tabId === 'decks' ? 'block' : 'none';
            if (manualTab) manualTab.style.display = tabId === 'manual' ? 'block' : 'none';
            if (practiceTab) practiceTab.style.display = tabId === 'practice' ? 'block' : 'none';

            if (tabId === 'decks') this.renderDecksList();
            if (tabId === 'manual') {
                this.updateCourseDropdowns();
                this.renderManualCardsList();
            }
        },

        updateCourseDropdowns() {
            const courses = Store.data.courses || [];
            const optionsHtml = `<option value="">No Course (General)</option>` +
                courses.map(c => `<option value="${c.id}">${escapeHtml(c.code)} - ${escapeHtml(c.title)}</option>`).join('');

            const genSelect = document.getElementById('fcCourseSelect');
            const manualSelect = document.getElementById('fcManualCourseSelect');

            if (genSelect) genSelect.innerHTML = optionsHtml;
            if (manualSelect) manualSelect.innerHTML = optionsHtml;
        },

        addManualCardRow() {
            this.manualCards.push({ question: '', answer: '' });
            this.renderManualCardsList();
        },

        removeManualCardRow(index) {
            if (this.manualCards.length <= 1) {
                this.manualCards = [{ question: '', answer: '' }];
            } else {
                this.manualCards.splice(index, 1);
            }
            this.renderManualCardsList();
        },

        updateManualCardValue(index, field, value) {
            if (this.manualCards[index]) {
                this.manualCards[index][field] = value;
            }
        },

        renderManualCardsList() {
            const listEl = document.getElementById('fcManualCardsList');
            const countLabel = document.getElementById('fcManualCardsCount');
            if (!listEl) return;

            if (countLabel) {
                countLabel.textContent = `Cards (${this.manualCards.length})`;
            }

            listEl.innerHTML = this.manualCards.map((card, i) => `
                <div class="manual-card-row">
                    <div class="manual-card-index">#${i + 1}</div>
                    <div class="manual-card-fields">
                        <div class="manual-card-col">
                            <label>Front / Question</label>
                            <textarea class="manual-card-input" placeholder="e.g. Mitochondria function"
                                      oninput="window.StudyVerse.Flashcards.updateManualCardValue(${i}, 'question', this.value)">${escapeHtml(card.question || '')}</textarea>
                        </div>
                        <div class="manual-card-col">
                            <label>Back / Answer</label>
                            <textarea class="manual-card-input" placeholder="e.g. Produces cellular ATP energy"
                                      oninput="window.StudyVerse.Flashcards.updateManualCardValue(${i}, 'answer', this.value)">${escapeHtml(card.answer || '')}</textarea>
                        </div>
                    </div>
                    <button class="manual-card-delete-btn" type="button" title="Delete card" onclick="window.StudyVerse.Flashcards.removeManualCardRow(${i})">&times;</button>
                </div>
            `).join('');
        },

        saveManualDeck() {
            const title = (document.getElementById('fcManualDeckTitle')?.value || '').trim();
            const courseSelect = document.getElementById('fcManualCourseSelect');
            const courseId = courseSelect ? courseSelect.value : null;

            const validCards = this.manualCards
                .map((c, i) => ({
                    question: (c.question || '').trim(),
                    answer: (c.answer || '').trim(),
                    concept: `Card ${i + 1}`
                }))
                .filter(c => c.question.length > 0 || c.answer.length > 0);

            if (!title) {
                alert('Please give your flashcard deck a title.');
                return;
            }

            if (validCards.length === 0) {
                alert('Please write at least one flashcard before saving.');
                return;
            }

            const newDeck = {
                id: `deck_${Date.now()}`,
                title: title,
                courseId: courseId || null,
                createdAt: new Date().toISOString(),
                cards: validCards
            };

            Store.data.decks = Store.data.decks || [];
            Store.data.decks.unshift(newDeck);
            Store.save();

            const titleInput = document.getElementById('fcManualDeckTitle');
            if (titleInput) titleInput.value = '';
            this.manualCards = [
                { question: '', answer: '' },
                { question: '', answer: '' },
                { question: '', answer: '' }
            ];

            Toast.show(`Created "${title}" with ${validCards.length} cards`);
            this.switchTab('decks');
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
                        badge.style.display = 'flex';
                    }
                    const titleInput = document.getElementById('fcDeckTitle');
                    if (titleInput && !titleInput.value) {
                        titleInput.value = json.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                    }
                    Toast.show(`Extracted document text`);
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
                alert('Please upload a document or paste notes.');
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
                        ${escapeHtml(c.concept || 'Card ' + (i + 1))}
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

            this.updateCourseDropdowns();
            const decks = Store.data.decks || [];
            const courses = Store.data.courses || [];

            let html = decks.map(deck => {
                const course = courses.find(c => c.id === deck.courseId);
                const total = deck.cards?.length || 0;
                const mastered = (deck.cards || []).filter(c => (c.repetitions || 0) >= 2).length;
                const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

                return `
                    <div class="deck-card" draggable="true" data-deck-id="${deck.id}"
                         ondragstart="window.StudyVerse.Flashcards.handleDeckDragStart(event, '${deck.id}')"
                         ondragend="window.StudyVerse.Flashcards.handleDeckDragEnd(event)">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                                ${course ? `<div class="deck-course-tag" style="color:${course.color === 'blue' ? '#3b82f6' : course.color === 'emerald' ? '#10b981' : course.color === 'purple' ? '#8b5cf6' : course.color === 'rose' ? '#f43f5e' : 'var(--sv-orange)'};">${escapeHtml(course.code)}</div>` : `<span style="font-size:0.7rem; color:var(--text-dim);">General</span>`}
                                <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${total} cards</span>
                            </div>
                            <h3 class="deck-title">${escapeHtml(deck.title)}</h3>
                            <div style="font-size:0.75rem; color:var(--text-muted); margin:6px 0 14px;">
                                Mastery: <span style="font-weight:600; color:var(--text-primary);">${pct}%</span>
                            </div>
                        </div>

                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                                <button class="btn btn-primary btn-sm" onclick="window.StudyVerse.Flashcards.startPracticeById('${deck.id}')" style="flex:1;">
                                    Practice
                                </button>
                                <select class="select" style="width:auto; padding:2px 6px; font-size:0.72rem;" onchange="window.StudyVerse.Flashcards.assignDeckToCourse('${deck.id}', this.value)" title="Assign course">
                                    <option value="" ${!deck.courseId ? 'selected' : ''}>No Course</option>
                                    ${courses.map(c => `<option value="${c.id}" ${deck.courseId === c.id ? 'selected' : ''}>${escapeHtml(c.code)}</option>`).join('')}
                                </select>
                                <button class="btn btn-subtle btn-sm" onclick="window.StudyVerse.Flashcards.deleteDeck('${deck.id}')" title="Delete deck">&times;</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            html += `
                <div class="ghost-deck-card" onclick="window.StudyVerse.Flashcards.switchTab('manual')">
                    <div class="ghost-deck-icon">+</div>
                    <div style="font-weight:600; font-size:0.88rem;">Create Deck Manually</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Write your own prompt & answer cards</div>
                </div>
            `;

            listEl.innerHTML = html;
        },

        assignDeckToCourse(deckId, courseId) {
            const deck = (Store.data.decks || []).find(d => d.id === deckId);
            if (!deck) return;
            deck.courseId = courseId || null;
            Store.save();
            const course = (Store.data.courses || []).find(c => c.id === courseId);
            Toast.show(course ? `Linked to ${course.code}` : `Unlinked course`);
            this.renderDecksList();
            Courses.render();
        },

        handleDeckDragStart(e, deckId) {
            this.draggedDeckId = deckId;
            e.dataTransfer.setData('text/plain', deckId);
            e.dataTransfer.setData('studyverse/type', 'deck');
            e.currentTarget.classList.add('dragging');
            window.StudyVerse.draggedPayload = { type: 'deck', id: deckId };

            const coursesNav = document.querySelector('.nav-item[data-route="courses"]');
            if (coursesNav) coursesNav.classList.add('drag-candidate-active');
        },

        handleDeckDragEnd(e) {
            e.currentTarget.classList.remove('dragging');
            document.querySelectorAll('.course-card').forEach(c => c.classList.remove('drag-target-hover'));
            const coursesNav = document.querySelector('.nav-item[data-route="courses"]');
            if (coursesNav) coursesNav.classList.remove('drag-candidate-active');
            window.StudyVerse.draggedPayload = null;
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

            document.getElementById('ankiCardConcept').textContent = card.concept || 'Front';
            document.getElementById('ankiCardQuestion').textContent = card.question || '';

            document.getElementById('ankiCardBackQuestion').textContent = card.question || '';
            document.getElementById('ankiCardAnswer').textContent = card.answer || '';
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

            if (this.consecutiveCorrectStreak === 10 || (this.consecutiveCorrectStreak > 10 && this.consecutiveCorrectStreak % 10 === 0)) {
                Constellations.triggerMeteorShower(26);
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
            if (!confirm('Delete this flashcard deck?')) return;
            Store.data.decks = (Store.data.decks || []).filter(d => d.id !== deckId);
            Store.save();
            this.renderDecksList();
            Courses.render();
            Toast.show('Deck deleted.');
        }
    };

    function formatTime12h(timeStr) {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    function formatTaskDateAndTime(dateStr, timeStr, isToday) {
        if (!dateStr && !timeStr) {
            return isToday ? 'Today' : '';
        }
        let datePart = '';
        if (dateStr) {
            const todayStr = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            if (dateStr === todayStr) {
                datePart = 'Today';
            } else if (dateStr === tomorrowStr) {
                datePart = 'Tomorrow';
            } else {
                const d = new Date(dateStr + 'T00:00:00');
                datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        } else if (isToday) {
            datePart = 'Today';
        }

        const timePart = timeStr ? formatTime12h(timeStr) : '';
        if (datePart && timePart) return `${datePart} · ${timePart}`;
        return datePart || timePart;
    }

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
                    const dateInput = document.getElementById('taskDueDateInput');
                    if (this.isTodaySelected && dateInput && !dateInput.value) {
                        dateInput.value = new Date().toISOString().split('T')[0];
                    }
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
            let dateVal = document.getElementById('taskDueDateInput')?.value || null;
            const timeVal = document.getElementById('taskDueTimeInput')?.value || null;
            const courseVal = document.getElementById('taskCourseSelect')?.value || null;
            const subtextVal = (document.getElementById('taskSubtextInput')?.value || '').trim();

            if (!dateVal && this.isTodaySelected) {
                dateVal = new Date().toISOString().split('T')[0];
            } else if (!dateVal && timeVal) {
                dateVal = new Date().toISOString().split('T')[0];
            }

            const newTask = {
                id: `task_${Date.now()}`,
                title: title,
                isToday: this.isTodaySelected || (dateVal === new Date().toISOString().split('T')[0]),
                dueDate: dateVal,
                dueTime: timeVal,
                courseId: courseVal || null,
                subtext: subtextVal || null,
                priority: priority,
                completed: false,
                subtasks: [],
                createdAt: new Date().toISOString()
            };

            Store.data.tasks = Store.data.tasks || [];
            Store.data.tasks.unshift(newTask);
            Store.save();

            input.value = '';
            const subtextInput = document.getElementById('taskSubtextInput');
            if (subtextInput) subtextInput.value = '';

            this.render();
            Dashboard.render();
            Calendar.render();
            Toast.show("Task created");
        },

        toggleTask(id) {
            const task = (Store.data.tasks || []).find(t => t.id === id);
            if (!task) return;
            task.completed = !task.completed;
            Store.save();
            this.render();
            Dashboard.render();
            Calendar.render();
        },

        deleteTask(id) {
            Store.data.tasks = (Store.data.tasks || []).filter(t => t.id !== id);
            Store.save();
            this.render();
            Dashboard.render();
            Calendar.render();
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
            const courseSelect = document.getElementById('taskCourseSelect');
            if (courseSelect) {
                const currentVal = courseSelect.value;
                const courses = Store.data.courses || [];
                courseSelect.innerHTML = `<option value="">No Course (General)</option>` +
                    courses.map(c => `<option value="${c.id}">${escapeHtml(c.code)} - ${escapeHtml(c.title)}</option>`).join('');
                courseSelect.value = currentVal || '';
            }

            if (!listEl) return;

            const tasks = Store.data.tasks || [];

            if (tasks.length === 0) {
                listEl.innerHTML = `
                    <div class="card" style="text-align:center; padding:30px; color:var(--text-muted); font-size:0.86rem;">
                        No study tasks yet. Type a task above and press Enter.
                    </div>
                `;
                return;
            }

            const todayStr = new Date().toISOString().split('T')[0];
            const todayTasks = tasks.filter(t => (t.isToday || t.dueDate === todayStr) && !t.completed);
            const otherTasks = tasks.filter(t => (!t.isToday && t.dueDate !== todayStr) && !t.completed);
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
            const course = (Store.data.courses || []).find(c => c.id === t.courseId);
            const dateTimeLabel = formatTaskDateAndTime(t.dueDate, t.dueTime, t.isToday);

            const isToday = t.isToday || (t.dueDate === new Date().toISOString().split('T')[0]);
            const isOverdue = t.dueDate && !t.completed && (t.dueDate < new Date().toISOString().split('T')[0]);

            return `
                <div class="task-item-group">
                    <div class="task-row-main">
                        <div style="display:flex; align-items:flex-start; gap:10px; flex:1;">
                            <div class="task-check ${t.completed ? 'checked' : ''}" style="margin-top:2px;" onclick="window.StudyVerse.Tasks.toggleTask('${t.id}')">
                                ${t.completed ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                            </div>
                            <div class="task-content-block">
                                <div class="task-title-line">
                                    <span style="font-size:0.9rem; font-weight:600; ${t.completed ? 'text-decoration:line-through; color:var(--text-dim);' : 'color:var(--text-primary);'}">
                                        ${escapeHtml(t.title)}
                                    </span>
                                    ${course ? `<span class="task-course-chip">${escapeHtml(course.code)}</span>` : ''}
                                </div>
                                ${t.subtext ? `<div class="task-subtext" style="${t.completed ? 'text-decoration:line-through; color:var(--text-dim);' : ''}">${escapeHtml(t.subtext)}</div>` : ''}
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:var(--text-muted);">
                            ${dateTimeLabel ? `
                                <span class="task-due-badge ${isOverdue ? 'overdue' : (isToday ? 'today' : '')}">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    ${dateTimeLabel}
                                </span>
                            ` : ''}
                            ${subs.length > 0 ? `<span style="font-family:var(--font-mono); font-size:0.72rem;">${completedSubs}/${subs.length}</span>` : ''}
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

        handleNoteDragStart(e, noteId) {
            e.dataTransfer.setData('text/plain', noteId);
            e.dataTransfer.setData('studyverse/type', 'note');
            e.currentTarget.classList.add('dragging');
            window.StudyVerse.draggedPayload = { type: 'note', id: noteId };

            const coursesNav = document.querySelector('.nav-item[data-route="courses"]');
            if (coursesNav) coursesNav.classList.add('drag-candidate-active');
        },

        handleNoteDragEnd(e) {
            e.currentTarget.classList.remove('dragging');
            document.querySelectorAll('.course-card').forEach(c => c.classList.remove('drag-target-hover'));
            const coursesNav = document.querySelector('.nav-item[data-route="courses"]');
            if (coursesNav) coursesNav.classList.remove('drag-candidate-active');
            window.StudyVerse.draggedPayload = null;
        },

        render() {
            const listEl = document.getElementById('notesList');
            const editorPane = document.getElementById('noteEditorPane');
            const notes = Store.data.notes || [];

            const courseSelect = document.getElementById('noteCourseSelect');
            if (courseSelect) {
                const courses = Store.data.courses || [];
                courseSelect.innerHTML = `<option value="">No Course (General)</option>` +
                    courses.map(c => `<option value="${c.id}">${escapeHtml(c.code)} - ${escapeHtml(c.title)}</option>`).join('');
            }

            if (notes.length === 0) {
                if (listEl) {
                    listEl.innerHTML = `
                        <div class="notes-empty-state">
                            <div class="notes-empty-title">No notes yet</div>
                            <p style="font-size:0.78rem; color:var(--text-muted); margin:4px 0 14px;">Capture lecture summaries, ideas, and study notes.</p>
                            <button class="btn btn-primary btn-sm" onclick="window.StudyVerse.Notes.createNote()">+ Create First Note</button>
                        </div>
                    `;
                }
                if (editorPane) editorPane.style.display = 'none';
                return;
            }

            if (editorPane) editorPane.style.display = 'flex';
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
                                draggable="true"
                                ondragstart="window.StudyVerse.Notes.handleNoteDragStart(event, '${n.id}')"
                                ondragend="window.StudyVerse.Notes.handleNoteDragEnd(event)"
                                onclick="window.StudyVerse.Notes.selectNote('${n.id}')">
                            <div class="note-item-title" style="font-weight:600; font-size:0.86rem; color:var(--text-primary);">${escapeHtml(n.title)}</div>
                            <div style="font-size:0.72rem; color:var(--text-muted); display:flex; gap:4px; align-items:center; margin-top:2px;">
                                ${course ? `<span style="color:var(--sv-orange); font-weight:700;">${escapeHtml(course.code)}</span><span>·</span>` : ''}
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

        getSortedEvents(dateFilter = null) {
            let list = (Store.data.events || []).map(e => ({ ...e, isTask: false }));

            const tasksWithDeadline = (Store.data.tasks || []).filter(t => t.dueDate);
            tasksWithDeadline.forEach(t => {
                const course = (Store.data.courses || []).find(c => c.id === t.courseId);
                const tag = course ? course.code : (t.priority === 'high' ? 'High Priority' : 'Assignment');
                const timeStr = t.dueTime ? formatTime12h(t.dueTime) : 'Deadline';
                list.push({
                    id: `task_evt_${t.id}`,
                    isTask: true,
                    taskId: t.id,
                    completed: t.completed,
                    date: t.dueDate,
                    title: t.title,
                    time: timeStr,
                    tag: tag,
                    desc: t.subtext || (t.completed ? 'Completed task' : 'Task deadline')
                });
            });

            if (dateFilter) {
                list = list.filter(e => e.date === dateFilter);
            }

            return list.slice().sort((a, b) => {
                const parseTimeScore = (tStr) => {
                    if (!tStr || tStr.toLowerCase() === 'all day' || tStr.toLowerCase() === 'deadline') return 999;
                    const match = tStr.match(/(\d{1,2}):(\d{2})/);
                    if (!match) return 999;
                    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
                };
                const scoreA = parseTimeScore(a.time);
                const scoreB = parseTimeScore(b.time);
                return scoreA - scoreB;
            });
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

            const events = this.getSortedEvents(this.selectedDateStr);

            if (events.length === 0) {
                listEl.innerHTML = `<div style="font-size:0.82rem; color:var(--text-muted); padding:8px 0;">No events scheduled for this day yet.</div>`;
                return;
            }

            listEl.innerHTML = events.map(e => `
                <div class="card" style="padding:10px 12px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${e.isTask ? `
                                <div class="task-check ${e.completed ? 'checked' : ''}" style="width:14px; height:14px; margin-right:2px;" onclick="window.StudyVerse.Tasks.toggleTask('${e.taskId}')">
                                    ${e.completed ? `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                                </div>
                            ` : ''}
                            <span style="font-weight:700; font-size:0.9rem; color:var(--text-primary); ${e.completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">
                                ${escapeHtml(e.title)}
                            </span>
                            <span style="font-size:0.7rem; font-weight:700; padding:1px 6px; border-radius:4px; background:var(--sv-orange-light); color:var(--sv-orange);">
                                ${escapeHtml(e.tag || 'General')}
                            </span>
                        </div>
                        ${e.time ? `<div style="font-family:var(--font-mono); font-size:0.76rem; color:var(--text-muted); margin-top:2px; font-weight:600;">${escapeHtml(e.time)}</div>` : ''}
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
            if (id && id.startsWith('task_evt_')) {
                const taskId = id.replace('task_evt_', '');
                Tasks.deleteTask(taskId);
                this.renderInspectorEventsList();
                this.render();
                return;
            }
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

            let html = '';
            for (let i = 0; i < firstDay; i++) {
                html += `<div class="cal-cell other-month"></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = today.getDate() === day && today.getMonth() === this.currentMonth && today.getFullYear() === this.currentYear;
                const dayEvents = this.getSortedEvents(dateKey);

                html += `
                    <div class="cal-cell ${isToday ? 'today' : ''}" onclick="window.StudyVerse.Calendar.openInspector('${dateKey}')">
                        <div class="cal-cell-num">${day}</div>
                        <div class="cal-cell-add-icon">+</div>
                        ${dayEvents.map(ev => `
                            <div class="cal-event-pill" title="${escapeHtml(ev.title)} (${escapeHtml(ev.time || '')})">
                                ${ev.time && ev.time !== 'All Day' ? `<span class="ev-time">${escapeHtml(ev.time.split('-')[0].trim())}</span>` : ''}
                                <span>${escapeHtml(ev.title)}</span>
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

            let html = '';
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(sun);
                dayDate.setDate(sun.getDate() + i);

                const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                const isToday = today.toDateString() === dayDate.toDateString();
                const dayEvents = this.getSortedEvents(dateKey); 

                html += `
                    <div class="week-col" onclick="window.StudyVerse.Calendar.openInspector('${dateKey}')">
                        <div class="week-col-header" style="${isToday ? 'color:var(--sv-orange); font-weight:800;' : ''}">
                            ${dayNames[i].slice(0, 3)} ${dayDate.getDate()}
                        </div>
                        <div class="week-col-body">
                            ${dayEvents.map(ev => `
                                <div class="card" style="padding:6px 8px; font-size:0.75rem;">
                                    <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(ev.title)}</div>
                                    <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--sv-orange); font-weight:600;">${escapeHtml(ev.time || 'All Day')}</div>
                                </div>
                            `).join('')}
                            ${dayEvents.length === 0 ? `<div style="text-align:center; padding-top:16px; font-size:0.74rem; color:var(--text-dim); font-weight:500;">+ Add Event</div>` : ''}
                        </div>
                    </div>
                `;
            }
            weekGrid.innerHTML = html;
        }
    };

    const Courses = {
        selectedColor: 'orange',

        init() {
            this.bindEvents();
            this.render();
        },

        bindEvents() {
            const addBtn = document.getElementById('courseAddBtn');
            if (addBtn) addBtn.addEventListener('click', () => this.openAddCourseModal());

            const saveBtn = document.getElementById('saveNewCourseBtn');
            if (saveBtn) saveBtn.addEventListener('click', () => this.saveNewCourse());

            document.querySelectorAll('#newCourseColorPalette .course-color-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('#newCourseColorPalette .course-color-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.selectedColor = btn.dataset.color || 'orange';
                });
            });
        },

        openAddCourseModal() {
            document.getElementById('newCourseCode').value = '';
            document.getElementById('newCourseTitle').value = '';
            document.getElementById('newCourseInstructor').value = '';
            document.getElementById('newCourseLocation').value = '';
            this.selectedColor = 'orange';
            document.querySelectorAll('#newCourseColorPalette .course-color-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.color === 'orange');
            });
            document.getElementById('addCourseModal').classList.add('show');
        },

        saveNewCourse() {
            const code = (document.getElementById('newCourseCode')?.value || '').trim().toUpperCase();
            const title = (document.getElementById('newCourseTitle')?.value || '').trim();
            const prof = (document.getElementById('newCourseInstructor')?.value || '').trim() || 'TBA';
            const loc = (document.getElementById('newCourseLocation')?.value || '').trim() || 'Campus';
            const color = this.selectedColor || 'orange';

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
                color: color,
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

            const payload = window.StudyVerse.draggedPayload;
            const course = (Store.data.courses || []).find(c => c.id === courseId);
            if (!course) return;

            if (payload && payload.type === 'deck') {
                const deck = (Store.data.decks || []).find(d => d.id === payload.id);
                if (deck) {
                    deck.courseId = courseId;
                    Store.save();
                    Toast.show(`Assigned "${deck.title}" to ${course.code}`);
                    this.render();
                    Flashcards.renderDecksList();
                }
            } else if (payload && payload.type === 'note') {
                const note = (Store.data.notes || []).find(n => n.id === payload.id);
                if (note) {
                    note.courseId = courseId;
                    Store.save();
                    Toast.show(`Assigned note "${note.title}" to ${course.code}`);
                    this.render();
                    Notes.render();
                }
            } else {
                const plainId = e.dataTransfer.getData('text/plain');
                if (plainId) {
                    const deck = (Store.data.decks || []).find(d => d.id === plainId);
                    if (deck) {
                        deck.courseId = courseId;
                        Store.save();
                        Toast.show(`Assigned "${deck.title}" to ${course.code}`);
                        this.render();
                    }
                }
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
                    ? `<div style="font-size:0.8rem; color:var(--text-muted); padding:6px 0;">No flashcard decks linked yet. Drag a deck card onto this course to link it.</div>`
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
                    ? `<div style="font-size:0.8rem; color:var(--text-muted); padding:6px 0;">No notes linked for this course yet.</div>`
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
                    <div class="card" style="grid-column: 1 / -1; text-align:center; padding:36px;">
                        <h4 style="font-size:1rem; font-weight:700;">No Courses Added</h4>
                        <p style="font-size:0.82rem; color:var(--text-muted); margin:6px 0 18px;">Add your enrolled classes to link decks and notes.</p>
                        <button class="btn btn-primary btn-sm" onclick="window.StudyVerse.Courses.openAddCourseModal()">+ Add Course</button>
                    </div>
                `;
                return;
            }

            grid.innerHTML = courses.map(c => {
                const linkedDecks = (Store.data.decks || []).filter(d => d.courseId === c.id);
                const linkedNotes = (Store.data.notes || []).filter(n => n.courseId === c.id);

                return `
                    <div class="course-card" data-color="${c.color || 'orange'}"
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
                                ${linkedDecks.length === 0 && linkedNotes.length === 0 ? `<span style="font-size:0.74rem; color:var(--text-dim);">(Drag & drop flashcards or notes here)</span>` : ''}
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

    const TopLeftNotification = {
        show(title, message, audioAlert = true) {
            const existing = document.getElementById('svTopLeftNotification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.id = 'svTopLeftNotification';
            notification.className = 'top-left-notification';
            notification.innerHTML = `
                <div class="tl-noti-header">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sv-orange)" stroke-width="2.5">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <span style="font-weight:700; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--sv-orange);">New Class Post</span>
                    </div>
                    <button class="tl-noti-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="tl-noti-body">
                    <div class="tl-noti-title">${escapeHtml(title)}</div>
                    <div class="tl-noti-msg">${escapeHtml(message)}</div>
                </div>
            `;

            document.body.appendChild(notification);

            if (audioAlert) {
                const audio = new Audio('/assets/notification.wav');
                audio.volume = 0.45;
                audio.play().catch(() => {});
            }

            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.classList.add('fade-out');
                    setTimeout(() => {
                        if (notification.parentNode) notification.remove();
                    }, 400);
                }
            }, 6000);
        }
    };

    const Classroom = {
        cachedAccessToken: null,
        filter: 'all',
        selectedClassId: null,
        autoSyncTimer: null,
        isSyncing: false,
        authInitialized: false,

        async init() {
            this.bindEvents();
            await this.initFirebaseAuth();
            this.updateNavVisibility();
            this.render();

            if (this.isConnected()) {
                this.sync(true);
            }

            this.autoSyncTimer = setInterval(() => {
                if (this.isConnected() && !document.hidden) {
                    this.sync(true);
                }
            }, 180000);

            window.addEventListener('focus', () => {
                if (this.isConnected()) {
                    const last = Store.data.classroom?.lastSynced;
                    if (!last || (Date.now() - new Date(last).getTime() > 120000)) {
                        this.sync(true);
                    }
                }
            });
        },

        bindEvents() {
            const syncBtn = document.getElementById('classroomSyncNowBtn');
            if (syncBtn) {
                syncBtn.addEventListener('click', () => this.sync(false));
            }

            const settingsBtn = document.getElementById('classroomOpenSettingsBtn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => SettingsModal.open('connections'));
            }

            document.querySelectorAll('.cr-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    document.querySelectorAll('.cr-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    this.filter = chip.dataset.crFilter || 'all';
                    this.renderUpcoming();
                });
            });
        },

        async initFirebaseAuth() {
            if (typeof firebase === 'undefined') return;
            try {
                if (!firebase.apps.length) {
                    const configRes = await fetch('/firebase-applet-config.json');
                    if (configRes.ok) {
                        const config = await configRes.json();
                        firebase.initializeApp(config);
                    }
                }

                if (firebase.apps.length) {
                    this.authInitialized = true;
                }
            } catch (e) {
                console.warn('Firebase init warning:', e.message);
            }
        },

        isConnected() {
            return Boolean(Store.data.classroom && Store.data.classroom.connected);
        },

        updateNavVisibility() {
            const navItem = document.getElementById('navItemClassroom');
            const connected = this.isConnected();
            if (navItem) {
                navItem.style.display = connected ? '' : 'none';
            }
            if (!connected && window.location.hash.replace('#', '').toLowerCase() === 'classroom') {
                Router.navigate('dashboard');
            }
        },

        async connect() {
            if (typeof firebase === 'undefined') {
                Toast.show('Authentication service loading...');
                return;
            }

            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
                provider.addScope('https://www.googleapis.com/auth/classroom.coursework.me.readonly');
                provider.addScope('https://www.googleapis.com/auth/classroom.announcements.readonly');
                provider.addScope('https://www.googleapis.com/auth/classroom.student-submissions.me.readonly');

                const result = await firebase.auth().signInWithPopup(provider);
                const credential = result.credential;
                const token = credential?.accessToken;

                if (!token) {
                    throw new Error('Could not retrieve access token from Google sign in.');
                }

                this.cachedAccessToken = token;
                const userPayload = {
                    displayName: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL,
                    uid: result.user.uid
                };

                Toast.show('Connecting to Google Classroom...');
                await this.syncWithToken(token, userPayload, false);

                this.updateNavVisibility();
                SettingsModal.render();
                Toast.show('Google Classroom connected!');
            } catch (err) {
                console.error('Google Classroom connect error:', err);
                Toast.show(err.message || 'Failed to connect Google Classroom.');
            }
        },

        async disconnect() {
            if (!confirm('Disconnect Google Classroom from StudyVerse?')) return;
            try {
                await fetch('/api/classroom/disconnect', { method: 'POST' });
            } catch (e) {}

            if (typeof firebase !== 'undefined' && firebase.apps.length) {
                try { await firebase.auth().signOut(); } catch (e) {}
            }

            this.cachedAccessToken = null;
            Store.data.classroom = {
                connected: false,
                user: null,
                lastSynced: null,
                classes: [],
                upcoming: [],
                recentPosts: []
            };
            this.selectedClassId = null;
            Store.save();

            this.updateNavVisibility();
            this.render();
            SettingsModal.render();
            Toast.show('Google Classroom disconnected.');
        },

        async sync(silent = false) {
            if (!this.isConnected()) return;
            if (this.isSyncing) return;

            this.isSyncing = true;
            this.setSyncingState(true);

            try {
                let token = this.cachedAccessToken;

                const res = await fetch('/api/classroom/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ accessToken: token, user: Store.data.classroom?.user })
                });

                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.classroom) {
                        if (json.classroom.accessToken) {
                            this.cachedAccessToken = json.classroom.accessToken;
                        }
                        const oldUpcomingIds = new Set((Store.data.classroom?.upcoming || []).map(u => u.id));
                        const oldPostIds = new Set((Store.data.classroom?.recentPosts || []).map(p => p.id));

                        const newUpcoming = json.classroom.upcoming || [];
                        const newPosts = json.classroom.recentPosts || [];

                        const addedUpcoming = newUpcoming.filter(u => !oldUpcomingIds.has(u.id));
                        const addedPosts = newPosts.filter(p => !oldPostIds.has(p.id));

                        Store.data.classroom = json.classroom;
                        Store.save();
                        this.render();
                        SettingsModal.render();

                        if (!silent) Toast.show('Classroom synced successfully');

                        // Fire Top-Left Notification with Sound for newly fetched class content
                        const hasPriorData = oldUpcomingIds.size > 0 || oldPostIds.size > 0;
                        if (hasPriorData) {
                            if (addedUpcoming.length > 0) {
                                const latest = addedUpcoming[0];
                                TopLeftNotification.show(
                                    `${latest.courseName}: New Assignment`,
                                    latest.title
                                );
                            } else if (addedPosts.length > 0) {
                                const latest = addedPosts[0];
                                TopLeftNotification.show(
                                    `${latest.courseName}: New ${latest.type === 'assignment' ? 'Assignment' : 'Announcement'}`,
                                    latest.title === 'Announcement' ? latest.preview : latest.title
                                );
                            }
                        }
                    }
                } else if (res.status === 401) {
                    if (!silent) {
                        Toast.show('Google Classroom session expired. Please reconnect in Settings.');
                        SettingsModal.open('connections');
                    }
                } else {
                    if (!silent) Toast.show('Classroom sync completed');
                }
            } catch (err) {
                console.warn('Classroom sync warning:', err);
                if (!silent) Toast.show('Could not refresh Classroom right now');
            } finally {
                this.isSyncing = false;
                this.setSyncingState(false);
            }
        },

        async syncWithToken(token, userPayload, silent = false) {
            this.isSyncing = true;
            this.setSyncingState(true);

            try {
                const res = await fetch('/api/classroom/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ accessToken: token, user: userPayload })
                });

                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.classroom) {
                        if (json.classroom.accessToken) {
                            this.cachedAccessToken = json.classroom.accessToken;
                        }
                        const oldUpcomingIds = new Set((Store.data.classroom?.upcoming || []).map(u => u.id));
                        const oldPostIds = new Set((Store.data.classroom?.recentPosts || []).map(p => p.id));

                        const newUpcoming = json.classroom.upcoming || [];
                        const newPosts = json.classroom.recentPosts || [];

                        const addedUpcoming = newUpcoming.filter(u => !oldUpcomingIds.has(u.id));
                        const addedPosts = newPosts.filter(p => !oldPostIds.has(p.id));

                        Store.data.classroom = json.classroom;
                        Store.save();
                        this.render();
                        SettingsModal.render();

                        const hasPriorData = oldUpcomingIds.size > 0 || oldPostIds.size > 0;
                        if (hasPriorData) {
                            if (addedUpcoming.length > 0) {
                                const latest = addedUpcoming[0];
                                TopLeftNotification.show(
                                    `${latest.courseName}: New Assignment`,
                                    latest.title
                                );
                            } else if (addedPosts.length > 0) {
                                const latest = addedPosts[0];
                                TopLeftNotification.show(
                                    `${latest.courseName}: New Announcement`,
                                    latest.title === 'Announcement' ? latest.preview : latest.title
                                );
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Initial sync error:', e);
            } finally {
                this.isSyncing = false;
                this.setSyncingState(false);
            }
        },

        setSyncingState(isSyncing) {
            document.querySelectorAll('.sync-spin-icon').forEach(icon => {
                icon.classList.toggle('spinning', isSyncing);
            });
        },

        selectClass(classId) {
            if (this.selectedClassId === classId) {
                this.selectedClassId = null; // Toggle selection off
            } else {
                this.selectedClassId = classId;
            }
            this.render();
        },

        render() {
            this.updateNavVisibility();
            const data = Store.data.classroom || { classes: [], upcoming: [], recentPosts: [] };

            const classes = data.classes || [];
            const upcoming = data.upcoming || [];
            const recentPosts = data.recentPosts || [];

            const pendingCount = upcoming.filter(u => u.status === 'Assigned' || u.status === 'Missing').length;

            const statClasses = document.getElementById('classroomStatClassesCount');
            const statUpcoming = document.getElementById('classroomStatUpcomingCount');
            const statPending = document.getElementById('classroomStatPendingCount');
            const statAnnouncements = document.getElementById('classroomStatAnnouncementsCount');
            const classesBadge = document.getElementById('classroomClassesBadge');

            if (statClasses) statClasses.textContent = classes.length;
            if (statUpcoming) statUpcoming.textContent = upcoming.length;
            if (statPending) statPending.textContent = pendingCount;
            if (statAnnouncements) statAnnouncements.textContent = recentPosts.length;
            if (classesBadge) classesBadge.textContent = `${classes.length} Classes`;

            const lastSyncLabel = document.getElementById('classroomLastSyncLabel');
            if (lastSyncLabel) {
                if (data.lastSynced) {
                    const d = new Date(data.lastSynced);
                    lastSyncLabel.textContent = `Last synced: ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                } else {
                    lastSyncLabel.textContent = 'Last synced: Just now';
                }
            }

            this.renderUpcoming();
            this.renderClasses();
            this.renderRecentPosts();
        },

        renderUpcoming() {
            const listEl = document.getElementById('classroomUpcomingList');
            if (!listEl) return;

            const all = Store.data.classroom?.upcoming || [];

            // User Friendly Filter: Only show tasks from the past 30 days and future assignments
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

            let filtered = all.filter(item => {
                if (item.dueDate) {
                    return item.dueDate >= thirtyDaysAgoStr;
                }
                if (item.creationTime) {
                    return item.creationTime >= thirtyDaysAgo.toISOString();
                }
                return true;
            });

            // Filter by Selected Class
            if (this.selectedClassId) {
                filtered = filtered.filter(item => item.courseId === this.selectedClassId);
            }

            // Filter by Category Chip
            if (this.filter === 'pending') {
                filtered = filtered.filter(item => item.status === 'Assigned');
            } else if (this.filter === 'missing') {
                filtered = filtered.filter(item => item.status === 'Missing');
            } else if (this.filter === 'completed') {
                filtered = filtered.filter(item => item.status === 'Turned in' || item.status === 'Graded');
            }

            if (filtered.length === 0) {
                listEl.innerHTML = `
                    <div style="text-align:center; padding:48px 16px; color:var(--text-muted); font-size:0.86rem;">
                        No coursework found for this filter.
                    </div>
                `;
                return;
            }

            listEl.innerHTML = filtered.map(item => {
                const statusClass = (item.status || 'assigned').toLowerCase().replace(/\s+/g, '-');
                let dueLabel = 'No due date';
                if (item.dueDate) {
                    dueLabel = formatTaskDateAndTime(item.dueDate, item.dueTime, false);
                }

                const displayCourseName = truncateString(item.courseName || 'Class', 18);
                const displayTitle = truncateString(item.title, 64);
                const displayDesc = truncateString(item.description || '', 150);

                return `
                    <a class="classroom-card-item" href="${escapeHtml(item.alternateLink)}" target="_blank" rel="noopener noreferrer" title="Click to view assignment in Google Classroom">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; min-width:0; flex:1;">
                                <span class="cr-course-pill">${escapeHtml(displayCourseName)}</span>
                                <span style="font-weight:700; font-size:0.92rem; color:var(--text-primary);">${escapeHtml(displayTitle)}</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                                <span class="cr-status-tag ${statusClass}">${escapeHtml(item.status)}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </div>
                        </div>

                        ${displayDesc ? `<div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.45; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${escapeHtml(displayDesc)}</div>` : ''}

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">
                            <div style="display:flex; align-items:center; gap:5px;">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                <span>Due: ${dueLabel}</span>
                            </div>
                            ${item.maxPoints ? `<span>${item.maxPoints} pts</span>` : ''}
                        </div>
                    </a>
                `;
            }).join('');
        },

        renderClasses() {
            const listEl = document.getElementById('classroomClassesList');
            if (!listEl) return;

            const classes = Store.data.classroom?.classes || [];
            if (classes.length === 0) {
                listEl.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:10px 0;">No active classes found.</div>`;
                return;
            }

            const selId = this.selectedClassId;

            listEl.innerHTML = classes.map(c => {
                const isActive = (selId === c.id);
                const displayClassName = truncateString(c.name, 36);
                const displayClassSection = truncateString(c.section || c.room || 'Active Class', 28);
                return `
                    <div class="cr-class-row ${isActive ? 'selected-class' : ''}" onclick="window.StudyVerse.Classroom.selectClass('${c.id}')" title="Click to view posts and assignments for ${escapeHtml(c.name)}">
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:700; font-size:0.88rem; color: ${isActive ? 'var(--sv-orange)' : 'var(--text-primary)'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(displayClassName)}</div>
                            <div style="font-size:0.74rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(displayClassSection)}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                            <a href="${escapeHtml(c.alternateLink)}" target="_blank" rel="noopener noreferrer" class="cr-class-open-link" onclick="event.stopPropagation();" title="Open class in Google Classroom">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
        },

        renderRecentPosts() {
            const listEl = document.getElementById('classroomRecentPostsList');
            if (!listEl) return;

            const posts = Store.data.classroom?.recentPosts || [];
            let filtered = posts;

            // Filter by Selected Class
            if (this.selectedClassId) {
                filtered = filtered.filter(p => p.courseId === this.selectedClassId);
            }

            if (filtered.length === 0) {
                listEl.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:24px 10px; text-align:center;">No recent announcements for this filter.</div>`;
                return;
            }

            listEl.innerHTML = filtered.map(p => {
                const dateStr = p.date ? new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                const displayCourseName = truncateString(p.courseName, 18);
                const displayTitle = truncateString(p.title, 48);
                const displayPreview = truncateString(p.preview || '', 120);

                return `
                    <a class="cr-post-item" href="${escapeHtml(p.alternateLink)}" target="_blank" rel="noopener noreferrer" title="View post in Google Classroom">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <span class="cr-course-pill" style="font-size:0.68rem; padding:1px 6px; flex-shrink:0;">${escapeHtml(displayCourseName)}</span>
                            <span style="font-size:0.72rem; color:var(--text-dim); font-family:var(--font-mono); flex-shrink:0;">${dateStr}</span>
                        </div>
                        <div style="font-weight:600; font-size:0.84rem; color:var(--text-primary); margin-top:2px; word-break:break-word;">${escapeHtml(displayTitle)}</div>
                        ${displayPreview ? `<div style="font-size:0.76rem; color:var(--text-secondary); line-height:1.4; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(displayPreview)}</div>` : ''}
                    </a>
                `;
            }).join('');
        }
    };

    const SettingsModal = {
        activeTab: 'connections',

        init() {
            this.bindEvents();
        },

        bindEvents() {
            const openBtn = document.getElementById('dropSettingsBtn');

            if (openBtn) {
                openBtn.addEventListener('click', () => {
                    const dropdown = document.getElementById('profileDropdown');
                    if (dropdown) dropdown.classList.remove('show');
                    this.open('connections');
                });
            }

            document.querySelectorAll('.settings-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.dataset.settingsTab;
                    this.switchTab(tab);
                });
            });

            const connectBtn = document.getElementById('btnConnectGoogleClassroom');
            if (connectBtn) {
                connectBtn.addEventListener('click', () => Classroom.connect());
            }

            const disconnectBtn = document.getElementById('btnDisconnectGoogleClassroom');
            if (disconnectBtn) {
                disconnectBtn.addEventListener('click', () => Classroom.disconnect());
            }

            const syncBtn = document.getElementById('btnSettingsClassroomSync');
            if (syncBtn) {
                syncBtn.addEventListener('click', () => Classroom.sync(false));
            }
        },

        open(tab = 'connections') {
            const modal = document.getElementById('settingsModal');
            if (!modal) return;
            this.switchTab(tab);
            this.render();
            modal.classList.add('show');
        },

        switchTab(tab) {
            this.activeTab = tab;
            document.querySelectorAll('.settings-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.settingsTab === tab);
            });

            const connContent = document.getElementById('settingsTabConnections');
            const genContent = document.getElementById('settingsTabGeneral');

            if (connContent) connContent.style.display = (tab === 'connections') ? 'block' : 'none';
            if (genContent) genContent.style.display = (tab === 'general') ? 'block' : 'none';
        },

        render() {
            const isConnected = Classroom.isConnected();
            const crData = Store.data.classroom || {};
            const badge = document.getElementById('settingsClassroomStatusBadge');
            const disconnectedState = document.getElementById('classroomDisconnectedState');
            const connectedState = document.getElementById('classroomConnectedState');

            if (badge) {
                badge.textContent = isConnected ? 'Connected' : 'Disconnected';
                badge.className = `connection-status-pill ${isConnected ? 'connected' : 'disconnected'}`;
            }

            if (disconnectedState) disconnectedState.style.display = isConnected ? 'none' : 'block';
            if (connectedState) connectedState.style.display = isConnected ? 'block' : 'none';

            if (isConnected && crData.user) {
                const user = crData.user;
                const nameEl = document.getElementById('settingsClassroomUserName');
                const emailEl = document.getElementById('settingsClassroomUserEmail');
                const imgEl = document.getElementById('settingsClassroomUserImg');
                const initEl = document.getElementById('settingsClassroomUserInitials');
                const lastSyncEl = document.getElementById('settingsClassroomLastSync');

                if (nameEl) nameEl.textContent = user.displayName || 'Student Account';
                if (emailEl) emailEl.textContent = user.email || 'student@school.edu';

                if (user.photoURL && imgEl) {
                    imgEl.src = user.photoURL;
                    imgEl.style.display = 'block';
                    if (initEl) initEl.style.display = 'none';
                } else if (initEl) {
                    initEl.textContent = (user.displayName || user.email || 'S').charAt(0).toUpperCase();
                    initEl.style.display = 'flex';
                    if (imgEl) imgEl.style.display = 'none';
                }

                if (lastSyncEl) {
                    if (crData.lastSynced) {
                        const d = new Date(crData.lastSynced);
                        lastSyncEl.textContent = `Last synced: ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    } else {
                        lastSyncEl.textContent = 'Last synced: Just now';
                    }
                }
            }
        }
    };

    const Router = {
        dragHoverTimer: null,

        init() {
            window.addEventListener('hashchange', () => this.handleHash());
            window.addEventListener('popstate', () => this.handleHash());

            document.querySelectorAll('.app-nav .nav-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate(btn.dataset.route);
                });

                btn.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    btn.classList.add('drag-hover-target');
                    if (!this.dragHoverTimer) {
                        this.dragHoverTimer = setTimeout(() => {
                            this.navigate(btn.dataset.route);
                            this.dragHoverTimer = null;
                        }, 180);
                    }
                });

                btn.addEventListener('dragleave', () => {
                    btn.classList.remove('drag-hover-target');
                    clearTimeout(this.dragHoverTimer);
                    this.dragHoverTimer = null;
                });

                btn.addEventListener('drop', () => {
                    btn.classList.remove('drag-hover-target');
                    clearTimeout(this.dragHoverTimer);
                    this.dragHoverTimer = null;
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
                resetBtn.addEventListener('click', () => {
                    dropdown.classList.remove('show');
                    Store.openResetModal();
                });
            }

            const resetInput = document.getElementById('resetConfirmInput');
            const executeResetBtn = document.getElementById('executeResetBtn');
            if (resetInput && executeResetBtn) {
                resetInput.addEventListener('input', () => {
                    const expected = (Store.data.profile?.username || 'Scholar').trim();
                    const isMatch = resetInput.value.trim() === expected;
                    executeResetBtn.disabled = !isMatch;
                });
                executeResetBtn.addEventListener('click', () => Store.executeReset());
            }

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
            const valid = ['dashboard', 'flashcards', 'pomodoro', 'tasks', 'notes', 'calendar', 'courses', 'classroom'];
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

            const floatingWidgetWrap = document.getElementById('floatingAddWidgetWrap');
            if (floatingWidgetWrap) {
                floatingWidgetWrap.style.display = (route === 'dashboard') ? 'block' : 'none';
            }

            if (route === 'dashboard') Dashboard.render();
            if (route === 'flashcards') Flashcards.renderDecksList();
            if (route === 'tasks') Tasks.render();
            if (route === 'notes') Notes.render();
            if (route === 'calendar') Calendar.render();
            if (route === 'courses') Courses.render();
            if (route === 'classroom') Classroom.render();
            if (route === 'pomodoro') Pomodoro.updateDisplay();
        }
    };

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

    function truncateString(str, maxLen) {
        if (!str) return '';
        if (str.length <= maxLen) return str;
        return str.slice(0, maxLen - 3) + '...';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

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
        Classroom.init();
        SettingsModal.init();
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
            Classroom,
            SettingsModal,
            Router,
            Toast,
            ProfileModal,
            TopLeftNotification,
            draggedPayload: null
        };
    });

})();

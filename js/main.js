/* =========================================================
   RENANDO. Portfolio — interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Header: scrolled state, progress bar, active link ---------- */
  const header = $("#header");
  const progress = $("#scrollProgress");
  const navLinks = $$("[data-nav]");
  const sections = navLinks
    .map((a) => $(a.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + "%";

    // active nav link
    let current = sections[0];
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top - window.innerHeight * 0.4 <= 0) current = sec;
    }
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current.id));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  function closeNav() {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", closeNav));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
  const forceReveal = /[?&]reveal=all/.test(location.search); // ?reveal=all disables scroll reveal (debug)
  if ("IntersectionObserver" in window && !reduceMotion && !forceReveal) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => {
      const d = el.getAttribute("data-reveal-delay");
      if (d) el.style.setProperty("--delay", d + "ms");
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Counters ---------- */
  const counters = $$("[data-counter]");
  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-counter"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.getAttribute("data-counter")));
  }

  /* ---------- Works: filters + carousel buttons ---------- */
  const track = $("#worksTrack");
  const works = $$(".work", track);
  const empty = $("#worksEmpty");

  $("#filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter").forEach((f) => {
      f.classList.toggle("is-active", f === btn);
      f.setAttribute("aria-selected", String(f === btn));
    });
    const cat = btn.getAttribute("data-filter");
    let shown = 0;
    works.forEach((w) => {
      const show = cat === "all" || w.getAttribute("data-category") === cat;
      w.classList.toggle("is-hidden", !show);
      if (show) {
        shown++;
        // re-trigger reveal
        w.classList.remove("is-visible");
        requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add("is-visible")));
      }
    });
    empty.hidden = shown !== 0;
    track.scrollTo({ left: 0, behavior: "smooth" });
  });

  function scrollTrack(dir) {
    const card = works.find((w) => !w.classList.contains("is-hidden"));
    const step = card ? card.getBoundingClientRect().width + 24 : 340;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  }
  $("#worksPrev").addEventListener("click", () => scrollTrack(-1));
  $("#worksNext").addEventListener("click", () => scrollTrack(1));

  // Drag-to-scroll on desktop
  let isDown = false, startX = 0, startLeft = 0;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    isDown = true; startX = e.clientX; startLeft = track.scrollLeft;
    track.style.scrollSnapType = "none";
  });
  window.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    track.scrollLeft = startLeft - (e.clientX - startX);
  });
  window.addEventListener("pointerup", () => {
    if (!isDown) return;
    isDown = false;
    track.style.scrollSnapType = "";
  });
  // prevent link navigation after drag
  $$(".work__media", track).forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openReel();
    })
  );

  /* ---------- Awards: floating preview ---------- */
  const preview = $("#awardPreview");
  const awardsList = $("#awardsList");
  if (preview && finePointer) {
    awardsList.addEventListener("mouseover", (e) => {
      const li = e.target.closest(".award");
      if (!li) return;
      const src = li.getAttribute("data-img");
      if (src && preview.getAttribute("src") !== src) preview.setAttribute("src", src);
      preview.classList.add("is-visible");
    });
    awardsList.addEventListener("mouseleave", () => preview.classList.remove("is-visible"));
    awardsList.addEventListener("mousemove", (e) => {
      preview.style.left = e.clientX + 40 + "px";
      preview.style.top = e.clientY + "px";
    });
  }

  /* ---------- Before / After slider ---------- */
  const ba = $("#ba");
  const range = $("#baRange");
  const legendRaw = $("#legendRaw");
  const legendFinal = $("#legendFinal");

  function setPos(p) {
    p = Math.max(0, Math.min(100, p));
    ba.style.setProperty("--pos", p + "%");
    ba.style.setProperty("--pos-num", Math.max(0.001, p / 100));
    range.value = p;
    legendRaw.classList.toggle("is-active", p >= 50);
    legendFinal.classList.toggle("is-active", p < 50);
  }
  setPos(50);
  range.addEventListener("input", () => setPos(parseFloat(range.value)));
  $$(".legend").forEach((b) =>
    b.addEventListener("click", () => animateTo(parseFloat(b.getAttribute("data-pos"))))
  );
  function animateTo(target) {
    const from = parseFloat(range.value);
    if (reduceMotion) return setPos(target);
    const start = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - start) / 600);
      const eased = 1 - Math.pow(1 - p, 3);
      setPos(from + (target - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- Showreel modal ---------- */
  const modal = $("#reelModal");
  const video = $("#reelVideo");
  function openReel() {
    modal.hidden = false;
    document.body.classList.add("no-scroll");
  }
  function closeReel() {
    modal.hidden = true;
    document.body.classList.remove("no-scroll");
    try { video.pause(); } catch (_) {}
  }
  $("#openReel").addEventListener("click", openReel);
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeReel));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!modal.hidden) closeReel(); closeNav(); }
  });

  /* ---------- Custom cursor + particle trail (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    const cursor = $("#cursor");
    const label = $(".cursor__label", cursor);
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add("is-visible");
      spawn(e.clientX, e.clientY, e.movementX, e.movementY);
    });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));

    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      if (t) { label.textContent = t.getAttribute("data-cursor"); cursor.classList.add("is-hover"); }
      else cursor.classList.remove("is-hover");
    });

    // particle trail canvas
    const canvas = $("#trail");
    const ctx = canvas.getContext("2d");
    let particles = [];
    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(x, y, vx, vy) {
      const speed = Math.hypot(vx, vy);
      if (speed < 2) return;
      const n = Math.min(3, Math.ceil(speed / 12));
      for (let i = 0; i < n; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 2 - vx * 0.08,
          vy: (Math.random() - 0.5) * 2 - vy * 0.08,
          life: 1,
          size: 3 + Math.random() * 5,
          rot: Math.atan2(vy, vx) + (Math.random() - 0.5),
          red: Math.random() > 0.35,
        });
      }
      if (particles.length > 160) particles.splice(0, particles.length - 160);
    }

    function drawTriangle(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life * 0.9;
      ctx.fillStyle = p.red ? "#e50914" : "#ffffff";
      ctx.beginPath();
      ctx.moveTo(p.size, 0);
      ctx.lineTo(-p.size * 0.7, p.size * 0.6);
      ctx.lineTo(-p.size * 0.7, -p.size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    (function loop() {
      // smooth cursor follow
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles = particles.filter((p) => p.life > 0.02);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.life *= 0.94;
        drawTriangle(p);
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Hero parallax (subtle) ---------- */
  const bgWord = $(".hero__bg-word");
  if (bgWord && !reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          bgWord.style.transform = `translate(-50%, calc(-50% + ${y * 0.25}px))`;
          bgWord.style.opacity = String(Math.max(0, 0.9 - y / window.innerHeight));
        }
      },
      { passive: true }
    );
  }

  /* ---------- Bilingual i18n (Indonesian & English) ---------- */
  const translations = {
    id: {
      /* Meta & Accessibility */
      "meta.title": "Osman ARK. — Editor & VFX Artist",
      "meta.description": "Portfolio Osman ARK — Editor & VFX Artist. Menggabungkan seni bercerita dengan efek visual berkualitas tinggi.",
      "aria.nav": "Navigasi utama",
      "aria.burger": "Buka menu",
      "aria.portraitAlt": "Potret Osman ARK, Editor & VFX Artist",
      "aria.scrollDown": "Scroll ke bawah",
      "aria.prevWork": "Sebelumnya",
      "aria.nextWork": "Berikutnya",
      "aria.filters": "Filter kategori",
      "aria.marquee": "Partner dan kolaborator",
      "aria.baAfterAlt": "Hasil akhir color grading dan VFX",
      "aria.baBeforeAlt": "Rekaman mentah (raw log)",
      "aria.baRange": "Pembanding sebelum dan sesudah",
      "aria.modalClose": "Tutup",
      "cursor.play": "PUTAR",
      "cursor.view": "LIHAT",

      /* Header & Navigation */
      "nav.home": "Home",
      "nav.works": "Karya",
      "nav.about": "Tentang",
      "nav.career": "Perjalanan",
      "nav.contact": "Kontak",
      "nav.hire": "Rekrut Saya",

      /* Hero */
      "hero.eyebrow": "Halo, Saya",
      "hero.role": 'EDITOR <span class="amp">&amp;</span> VFX ARTIST',
      "hero.desc": "Menggabungkan seni bercerita dengan efek visual berkualitas tinggi untuk menciptakan konten yang memukau dan tak terlupakan.",
      "hero.btnReel": "Putar Showreel",
      "hero.btnWorks": "Lihat Karya",
      "hero.stat1": "Tahun<br />Pengalaman",
      "hero.stat2": "Proyek<br />Selesai",
      "hero.stat3": "Penghargaan /<br />Rekognisi",
      "hero.scroll": "GULIR",

      /* Selected Works & Category Filters */
      "works.eyebrow": "Karya Pilihan Saya",
      "works.title": 'KARYA YANG <span class="accent">BICARA.</span>',
      "works.filterAll": "Semua",
      "works.filterVfx": "VFX",
      "works.filterFilm": "Film",
      "works.filterCommercial": "Komersial",
      "works.filterPhotography": "Fotografi",
      "works.filterMusic": "Video Musik",
      "works.filterManipulasi": "Manipulasi",
      "works.filterAnimasi": "Animasi",
      "works.item1Title": "VFX SHOWREEL 24",
      "works.item1Sub": "Compositing VFX • Editor",
      "works.item2Title": "SERIAL : TEASER",
      "works.item2Sub": "Editor Offline & Online",
      "works.item3Title": "LINGKUNGAN CYBERPUNK",
      "works.item3Sub": "Lingkungan 3D • CGI",
      "works.item4Title": "IKLAN KOMERSIAL BRAND",
      "works.item4Sub": "Sutradara Edit • Warna",
      "works.item5Title": "VIDEO MUSIK : NEON",
      "works.item5Sub": "Editor • Motion Graphics",
      "works.item6Title": "BINGKAI DIAM",
      "works.item6Sub": "Fotografi • Retouch",
      "works.item7Title": "MANIPULASI SUREALIS",
      "works.item7Sub": "Manipulasi Foto • Matte Paint",
      "works.empty": "Belum ada karya di kategori ini.",
      "works.trusted": "DIPERCAYA OLEH & KOLABORASI",

      /* Recognition & Awards */
      "awards.eyebrow": "Rekognisi & Penghargaan",
      "awards.title": 'KARYA.<br /><span class="accent">PENGAKUAN.</span>',
      "awards.lead": "Karya yang tidak hanya memikat hati penonton, tetapi juga diakui oleh juri dan festival terkemuka.",
      "awards.cta": "Lihat Sertifikat",
      "awards.item1Title": "Juara 1",
      "awards.item1Fest": "Film Kompetensi Terbaik",
      "awards.item2Title": "Film Kompetensi Terbaik",
      "awards.item2Fest": "Festival Film Nasional",
      "awards.item3Title": "Film Pendek Terbaik",
      "awards.item3Fest": "Indie Movie Fest",
      "awards.item4Title": "Juara 1, Film Pendek",
      "awards.item4Fest": "Festival Film Pelajar",
      "awards.item5Title": "Juara 1, Film Pendek",
      "awards.item5Fest": "Festival Film Pemuda",
      "awards.item6Title": "Video Kreatif Terbaik",
      "awards.item6Fest": "Digital Creation Awards",

      /* VFX Breakdown (Before / After) */
      "compare.eyebrow": "Bedah VFX",
      "compare.title": 'DARI MENTAH.<br />JADI <span class="accent">NYATA.</span>',
      "compare.lead": "Satu adegan, jutaan kemungkinan. Mengubah rekaman mentah menjadi visual yang hidup dan memiliki kedalaman cerita.",
      "compare.btnRaw": "Rekaman Mentah",
      "compare.btnFinal": "Warna Akhir & VFX",
      "compare.hint": "Geser pembatas untuk membandingkan",

      /* Philosophy & Skills */
      "about.eyebrow": "Filosofi & Keahlian Saya",
      "about.title": 'BUKAN SEKADAR VISUAL,<br />TAPI <span class="accent">CARA BERCERITA.</span>',
      "about.lead": "Setiap potongan, setiap warna, dan setiap efek punya alasan. Saya percaya bahwa pacing, color grading, dan CGI adalah bahasa — bukan hiasan. Tujuannya satu: membuat penonton merasakan ceritanya.",
      "about.eduTitle": "PENDIDIKAN & KEAHLIAN",
      "about.edu1Title": "SMK Telkom Malang",
      "about.edu1Sub": "Animasi / Multimedia",
      "about.edu2Title": "Bidang Keahlian",
      "about.edu2Sub": "VFX, Editing & Pascaproduksi",
      "about.edu3Title": "Alur Kerja Standar",
      "about.edu3Sub": "Sesuai standar pipeline industri",
      "about.toolsLabel": "PERANGKAT",
      "about.pipeTitle": "DARI IDE KE FRAME AKHIR",
      "about.step1Title": "PRA-PRODUKSI",
      "about.step1Sub": "Konsep & Storyboard",
      "about.step2Title": "EDITING",
      "about.step2Sub": "Assembly, Pacing & Offline Cut",
      "about.step3Title": "VFX & 3D",
      "about.step3Sub": "Compositing, Tracking & CGI",
      "about.step4Title": "WARNA & MASTER",
      "about.step4Sub": "Color Grading & Final Delivery",
      "about.quote": "Dari konsep dan storytelling, sampai visual yang sinematik.",

      /* Career Journey & Wins */
      "career.eyebrow": "Perjalanan Karier",
      "career.title": 'TERUS BERGERAK.<br />TERUS <span class="accent">BERKARYA.</span>',
      "career.tl1Year": "2023 — SEKARANG",
      "career.tl1Role": "Kreator Lepas",
      "career.tl1Org": "Pekerja Lepas",
      "career.tl1Desc": "Mengembangkan berbagai macam proyek komersial, video musik, dan konten branded untuk klien nasional dan internasional.",
      "career.tl2Year": "2022 — 2023",
      "career.tl2Role": "VFX Artist",
      "career.tl2Org": "Studio / Rumah Produksi",
      "career.tl2Desc": "Compositing, rotoscoping, dan integrasi CGI untuk series dan iklan televisi nasional.",
      "career.tl3Year": "2021 — 2022",
      "career.tl3Role": "Magang VFX",
      "career.tl3Org": "Magang Spesialis VFX",
      "career.tl3Desc": "Belajar pipeline produksi profesional, dari tracking hingga final delivery.",
      "career.tl4Year": "2020 — 2021",
      "career.tl4Role": "Editor Lepas",
      "career.tl4Org": "Video Editor & Motion Designer",
      "career.tl4Desc": "Editing konten digital, motion graphics, dan video promosi untuk UMKM dan brand lokal.",
      "career.tl5Year": "2019 — 2020",
      "career.tl5Role": "Content Creator",
      "career.tl5Org": "Creative Lead",
      "career.tl5Desc": "Memulai perjalanan dengan membuat konten kreatif, eksperimen VFX, dan short film pelajar.",
      "career.winsTitle": 'PENCAPAIAN KECIL.<br /><span class="accent">MAKNA BESAR.</span>',
      "career.win1": "18+ proyek selesai tepat waktu",
      "career.win2": "10+ penghargaan festival film",
      "career.win3": "Kolaborasi dengan 7+ studio & label",
      "career.win4": "1 juta+ total penayangan karya",
      "career.win5": "Mentor VFX untuk komunitas pelajar",
      "career.cta": "Mulai Proyek",

      /* Contact */
      "contact.eyebrow": "Mari Bicara",
      "contact.title": 'MARI BEKERJA<br /><span class="accent">BERSAMA.</span>',
      "contact.lead": "Punya proyek yang ingin diwujudkan? Mari diskusi dan buat sesuatu yang luar biasa bersama.",
      "contact.emailLabel": "EMAIL",
      "contact.waLabel": "WHATSAPP",
      "contact.locLabel": "LOKASI",
      "contact.locValue": "INDONESIA • SIAP REMOTE",
      "contact.feelCard": 'BUAT TERASA<br /><span class="accent">NYATA.</span>',

      /* Footer & Showreel Modal */
      "footer.rights": "© 2024 OSMAN ARK. HAK CIPTA DILINDUNGI.",
      "footer.crafted": "DIRANCANG & DIKEMBANGKAN DENGAN DEDIKASI.",
      "modal.fallback": "Browser Anda tidak mendukung video.",
      "modal.caption": "SHOWREEL 2024 • PLACEHOLDER — ganti dengan video Anda",
    },

    en: {
      /* Meta & Accessibility */
      "meta.title": "Osman ARK. — Editor & VFX Artist",
      "meta.description": "Portfolio of Osman ARK — Editor & VFX Artist. Combining the art of storytelling with high-end visual effects.",
      "aria.nav": "Main navigation",
      "aria.burger": "Open menu",
      "aria.portraitAlt": "Portrait of Osman ARK, Editor & VFX Artist",
      "aria.scrollDown": "Scroll down",
      "aria.prevWork": "Previous",
      "aria.nextWork": "Next",
      "aria.filters": "Category filters",
      "aria.marquee": "Partners and collaborators",
      "aria.baAfterAlt": "Final color grading and VFX result",
      "aria.baBeforeAlt": "Raw footage (raw log)",
      "aria.baRange": "Before and after comparison slider",
      "aria.modalClose": "Close",
      "cursor.play": "PLAY",
      "cursor.view": "VIEW",

      /* Header & Navigation */
      "nav.home": "Home",
      "nav.works": "Works",
      "nav.about": "About",
      "nav.career": "Journey",
      "nav.contact": "Contact",
      "nav.hire": "Hire Me",

      /* Hero */
      "hero.eyebrow": "Hello, I'm",
      "hero.role": 'EDITOR <span class="amp">&amp;</span> VFX ARTIST',
      "hero.desc": "Combining the art of storytelling with high-end visual effects to craft captivating and unforgettable visual content.",
      "hero.btnReel": "Play Showreel",
      "hero.btnWorks": "View Works",
      "hero.stat1": "Years<br />Experience",
      "hero.stat2": "Projects<br />Completed",
      "hero.stat3": "Awards /<br />Recognition",
      "hero.scroll": "SCROLL",

      /* Selected Works & Category Filters */
      "works.eyebrow": "My Selected Work",
      "works.title": 'WORK THAT <span class="accent">SPEAKS.</span>',
      "works.filterAll": "All",
      "works.filterVfx": "VFX",
      "works.filterFilm": "Film",
      "works.filterCommercial": "Commercial",
      "works.filterPhotography": "Photography",
      "works.filterMusic": "Music Video",
      "works.filterManipulasi": "Manipulation",
      "works.filterAnimasi": "Animation",
      "works.item1Title": "VFX SHOWREEL 24",
      "works.item1Sub": "VFX Compositing • Editor",
      "works.item2Title": "SERIES : TEASER",
      "works.item2Sub": "Offline & Online Editor",
      "works.item3Title": "CYBERPUNK ENVIRONMENT",
      "works.item3Sub": "3D Environment • CGI",
      "works.item4Title": "BRAND COMMERCIAL",
      "works.item4Sub": "Director of Edit • Color",
      "works.item5Title": "MUSIC VIDEO : NEON",
      "works.item5Sub": "Editor • Motion Graphics",
      "works.item6Title": "STILL FRAMES",
      "works.item6Sub": "Photography • Retouch",
      "works.item7Title": "SURREAL MANIPULATION",
      "works.item7Sub": "Photo Manipulation • Matte Paint",
      "works.empty": "No works in this category yet.",
      "works.trusted": "TRUSTED BY & COLLABORATION",

      /* Recognition & Awards */
      "awards.eyebrow": "Recognition & Awards",
      "awards.title": 'THE WORK.<br />THE <span class="accent">RECOGNITION.</span>',
      "awards.lead": "Work that not only captivates audiences, but is also recognized by juries and leading festivals.",
      "awards.cta": "View Certificates",
      "awards.item1Title": "1st Place",
      "awards.item1Fest": "Best Competency Film",
      "awards.item2Title": "Best Competency Film",
      "awards.item2Fest": "National Film Festival",
      "awards.item3Title": "Best Short Film",
      "awards.item3Fest": "Indie Movie Fest",
      "awards.item4Title": "1st Place, Short Film",
      "awards.item4Fest": "Student Film Festival",
      "awards.item5Title": "1st Place, Short Film",
      "awards.item5Fest": "Youth Film Festival",
      "awards.item6Title": "Best Creative Video",
      "awards.item6Fest": "Digital Creation Awards",

      /* VFX Breakdown (Before / After) */
      "compare.eyebrow": "VFX Breakdown",
      "compare.title": 'FROM RAW.<br />TO <span class="accent">REAL.</span>',
      "compare.lead": "One scene, endless possibilities. Transforming raw footage into vivid visuals rich with narrative depth.",
      "compare.btnRaw": "Raw Footage",
      "compare.btnFinal": "Final Color & VFX",
      "compare.hint": "Drag the slider to compare",

      /* Philosophy & Skills */
      "about.eyebrow": "My Philosophy & Skills",
      "about.title": 'NOT JUST VISUALS,<br />BUT <span class="accent">HOW WE TELL STORIES.</span>',
      "about.lead": "Every cut, every color, and every effect exists for a reason. I believe pacing, color grading, and CGI are a language — not decoration. The goal is singular: making the audience feel the story.",
      "about.eduTitle": "EDUCATION & SKILLS",
      "about.edu1Title": "SMK Telkom Malang",
      "about.edu1Sub": "Animation / Multimedia",
      "about.edu2Title": "Core Expertise",
      "about.edu2Sub": "VFX, Editing & Post-Production",
      "about.edu3Title": "Standard Workflow",
      "about.edu3Sub": "Industry pipeline compliance",
      "about.toolsLabel": "TOOLS",
      "about.pipeTitle": "FROM IDEA TO FINAL FRAME",
      "about.step1Title": "PRE-PROD",
      "about.step1Sub": "Concept & Storyboard",
      "about.step2Title": "EDITING",
      "about.step2Sub": "Assembly, Pacing & Offline Cut",
      "about.step3Title": "VFX & 3D",
      "about.step3Sub": "Compositing, Tracking & CGI",
      "about.step4Title": "COLOR & MASTER",
      "about.step4Sub": "Color Grading & Final Delivery",
      "about.quote": "From concept and storytelling to cinematic visuals.",

      /* Career Journey & Wins */
      "career.eyebrow": "Career Journey",
      "career.title": 'KEEP MOVING.<br />KEEP <span class="accent">CREATING.</span>',
      "career.tl1Year": "2023 — PRESENT",
      "career.tl1Role": "Freelance Creative",
      "career.tl1Org": "Independent Freelancer",
      "career.tl1Desc": "Developing diverse commercial projects, music videos, and branded content for national and international clients.",
      "career.tl2Year": "2022 — 2023",
      "career.tl2Role": "VFX Artist",
      "career.tl2Org": "Studio / Production House",
      "career.tl2Desc": "Compositing, rotoscoping, and CGI integration for series and national television commercials.",
      "career.tl3Year": "2021 — 2022",
      "career.tl3Role": "VFX Internship",
      "career.tl3Org": "VFX Specialist Intern",
      "career.tl3Desc": "Learned professional production pipelines, from camera tracking through final delivery.",
      "career.tl4Year": "2020 — 2021",
      "career.tl4Role": "Freelance Editor",
      "career.tl4Org": "Video Editor & Motion Designer",
      "career.tl4Desc": "Edited digital content, motion graphics, and promotional videos for SMEs and local brands.",
      "career.tl5Year": "2019 — 2020",
      "career.tl5Role": "Content Creator",
      "career.tl5Org": "Creative Lead",
      "career.tl5Desc": "Started the journey creating digital content, VFX experiments, and student short films.",
      "career.winsTitle": 'LITTLE WINS.<br /><span class="accent">BIG MEANING.</span>',
      "career.win1": "18+ projects delivered on time",
      "career.win2": "10+ film festival awards",
      "career.win3": "Collaborated with 7+ studios & labels",
      "career.win4": "1M+ total views across works",
      "career.win5": "VFX mentor for student communities",
      "career.cta": "Start a Project",

      /* Contact */
      "contact.eyebrow": "Let's Talk",
      "contact.title": 'LET\'S WORK<br /><span class="accent">TOGETHER.</span>',
      "contact.lead": "Have a project in mind? Let's talk and create something extraordinary together.",
      "contact.emailLabel": "EMAIL",
      "contact.waLabel": "WHATSAPP",
      "contact.locLabel": "LOCATION",
      "contact.locValue": "INDONESIA • REMOTE READY",
      "contact.feelCard": 'MAKE IT<br />FEEL <span class="accent">REAL.</span>',

      /* Footer & Showreel Modal */
      "footer.rights": "© 2024 OSMAN ARK. ALL RIGHTS RESERVED.",
      "footer.crafted": "DESIGNED & DEVELOPED WITH PASSION.",
      "modal.fallback": "Your browser does not support video playback.",
      "modal.caption": "SHOWREEL 2024 • PLACEHOLDER — replace with your video",
    },
  };

  const langSwitch = $("#langSwitch");
  const langBtns = langSwitch ? $$("[data-lang]", langSwitch) : [];

  function applyLanguage(lang) {
    const dict = translations[lang] ? translations[lang] : translations.id;
    const activeLang = translations[lang] ? lang : "id";

    document.documentElement.lang = activeLang;
    if (dict["meta.title"]) {
      document.title = dict["meta.title"];
      const ogTitle = $('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", dict["meta.title"]);
    }
    if (dict["meta.description"]) {
      const metaDesc = $('meta[name="description"]');
      const ogDesc = $('meta[property="og:description"]');
      if (metaDesc) metaDesc.setAttribute("content", dict["meta.description"]);
      if (ogDesc) ogDesc.setAttribute("content", dict["meta.description"]);
    }

    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key] !== undefined) el.textContent = dict[key];
    });
    $$("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (key && dict[key] !== undefined) el.innerHTML = dict[key];
    });
    $$("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (key && dict[key] !== undefined) el.setAttribute("aria-label", dict[key]);
    });
    $$("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      if (key && dict[key] !== undefined) el.setAttribute("alt", dict[key]);
    });
    $$("[data-i18n-cursor]").forEach((el) => {
      const key = el.getAttribute("data-i18n-cursor");
      if (key && dict[key] !== undefined) el.setAttribute("data-cursor", dict[key]);
    });

    langBtns.forEach((btn) => {
      const isMatch = btn.getAttribute("data-lang") === activeLang;
      btn.classList.toggle("is-active", isMatch);
      btn.setAttribute("aria-pressed", String(isMatch));
    });

    try {
      localStorage.setItem("osman_ark_lang", activeLang);
    } catch (_) {}
  }

  if (langSwitch) {
    langSwitch.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lang]");
      if (!btn) return;
      applyLanguage(btn.getAttribute("data-lang"));
    });
  }

  let initialLang = "id";
  const urlLang = new URLSearchParams(location.search).get("lang");
  if (urlLang === "en" || urlLang === "id") {
    initialLang = urlLang;
  } else {
    try {
      const saved = localStorage.getItem("osman_ark_lang");
      if (saved === "en" || saved === "id") initialLang = saved;
    } catch (_) {}
  }
  applyLanguage(initialLang);
})();

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
})();

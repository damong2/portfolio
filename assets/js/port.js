// Canvas sunlight + dust based on the user's main reference code
const sunCvs = document.getElementById("sun-canvas");
const sc = sunCvs.getContext("2d");
const dstCvs = document.getElementById("dust-canvas");
const dc = dstCvs.getContext("2d");

function W() {
  return window.innerWidth;
}
function H() {
  return window.innerHeight;
}

function resize() {
  sunCvs.width = W();
  sunCvs.height = H();
  dstCvs.width = W();
  dstCvs.height = H();
}
resize();
window.addEventListener("resize", resize);

const RAYS = Array.from({ length: 24 }, (_, i) => {
  const totalSpread = 80;
  const p = i / 23;
  const angleDeg = -90 + (p - 0.5) * totalSpread;
  const angleRad = (angleDeg * Math.PI) / 180;
  const distFromCenter = Math.abs(p - 0.5) * 2;
  const brightness = 1.0 - distFromCenter * 0.55;

  return {
    angle: angleRad,
    width: (18 + Math.random() * 48) * brightness,
    baseOp: (0.09 + Math.random() * 0.18) * brightness,
    wobbleAmp: 0.012 + Math.random() * 0.01,
    wobbleSpd: 0.5 + Math.random() * 0.6,
    phase: Math.random() * Math.PI * 2,
  };
});

const DUST = Array.from({ length: 150 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: 0.4 + Math.random() * 1.7,
  vx: (Math.random() - 0.5) * 0.00011,
  vy: -0.000035 - Math.random() * 0.0001,
  op: 0.1 + Math.random() * 0.4,
  fl: Math.random() * Math.PI * 2,
}));

let t = 0;

function drawSun() {
  const w = W(),
    h = H();
  sc.clearRect(0, 0, w, h);

  const srcX = w * 0.5;
  const srcY = h * -0.03;

  RAYS.forEach((ray) => {
    const wobble = Math.sin(t * ray.wobbleSpd + ray.phase) * ray.wobbleAmp;
    const angle = ray.angle + wobble;
    const pulse =
      0.6 + 0.4 * Math.sin(t * ray.wobbleSpd * 0.8 + ray.phase + 0.5);

    const len = h * 2.0;
    const ex = srcX + Math.cos(angle) * len;
    const ey = srcY + Math.sin(angle) * len;

    const topW = ray.width * 0.06;
    const botW = ray.width * 1.2;
    const perpX = Math.sin(angle);
    const perpY = -Math.cos(angle);

    const grad = sc.createLinearGradient(srcX, srcY, ex, ey);
    grad.addColorStop(0, `rgba(255,252,220, ${ray.baseOp * pulse * 1.6})`);
    grad.addColorStop(0.04, `rgba(220,245,255, ${ray.baseOp * pulse * 1.3})`);
    grad.addColorStop(0.2, `rgba(140,210,245, ${ray.baseOp * pulse * 1.0})`);
    grad.addColorStop(0.5, `rgba(70,155,215, ${ray.baseOp * pulse * 0.55})`);
    grad.addColorStop(0.8, `rgba(30,100,190, ${ray.baseOp * pulse * 0.18})`);
    grad.addColorStop(1, "rgba(10,60,160,0)");

    sc.beginPath();
    sc.moveTo(srcX - perpX * topW, srcY - perpY * topW);
    sc.lineTo(srcX + perpX * topW, srcY + perpY * topW);
    sc.lineTo(ex + perpX * botW, ey + perpY * botW);
    sc.lineTo(ex - perpX * botW, ey - perpY * botW);
    sc.closePath();

    sc.fillStyle = grad;
    sc.globalCompositeOperation = "screen";
    sc.fill();
  });

  const glowR = 150 + 24 * Math.sin(t * 0.65);
  const glow = sc.createRadialGradient(srcX, srcY, 0, srcX, srcY, glowR);
  glow.addColorStop(0, `rgba(255,252,220, ${0.78 + 0.16 * Math.sin(t * 0.9)})`);
  glow.addColorStop(0.16, "rgba(220,245,255,0.36)");
  glow.addColorStop(0.46, "rgba(110,200,245,0.13)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  sc.fillStyle = glow;
  sc.fillRect(srcX - glowR, srcY - glowR, glowR * 2, glowR * 2);

  const surfGrad = sc.createLinearGradient(0, 0, 0, h * 0.9);
  surfGrad.addColorStop(
    0,
    `rgba(170,235,255, ${0.22 + 0.05 * Math.sin(t * 0.4)})`,
  );
  surfGrad.addColorStop(0.18, "rgba(110,195,245,0.1)");
  surfGrad.addColorStop(0.42, "rgba(55,135,215,0.045)");
  surfGrad.addColorStop(0.72, "rgba(25,92,185,0.015)");
  surfGrad.addColorStop(1, "rgba(0,0,0,0)");
  sc.fillStyle = surfGrad;
  sc.fillRect(0, 0, w, h);
}

function drawDust() {
  const w = W(),
    h = H();
  dc.clearRect(0, 0, w, h);

  DUST.forEach((d) => {
    d.x += d.vx + Math.sin(t * 0.38 + d.fl) * 0.000085;
    d.y += d.vy;
    if (d.y < -0.01) d.y = 1.01;
    if (d.x < 0) d.x = 1;
    if (d.x > 1) d.x = 0;

    const pulse = 0.5 + 0.5 * Math.sin(t * 1.3 + d.fl);
    const bright = Math.pow(1.0 - d.y, 0.6);
    dc.beginPath();
    dc.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
    dc.fillStyle = `rgba(${Math.round(190 + bright * 65)},242,255,${d.op * pulse * (0.4 + bright * 0.6)})`;
    dc.fill();
  });
}

function loop() {
  requestAnimationFrame(loop);
  t += 0.01;
  drawSun();
  drawDust();
}
loop();

function spawnBubble() {
  const el = document.createElement("div");
  el.className = "ocean-bubble";
  const sz = 2 + Math.random() * 11;
  const left = 4 + Math.random() * 92;
  const dur = 10 + Math.random() * 14;
  const del = Math.random() * 2;
  const drift = (Math.random() - 0.5) * 70;
  el.style.cssText = `width:${sz}px;height:${sz}px;left:${left}vw;bottom:-3vh;--drift:${drift}px;animation-duration:${dur}s;animation-delay:${del}s;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), (dur + del) * 1000 + 200);
}
for (let i = 0; i < 16; i++) spawnBubble();
setInterval(spawnBubble, 750);

const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.18 },
);

revealEls.forEach((el) => observer.observe(el));

/* ========================= Scroll depth mood ========================= */
const root = document.documentElement;

function mixColor(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function rgb(c) {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/* 여러 색을 단계적으로 섞는 함수 */
function paletteColor(stops, t) {
  if (t <= stops[0].pos) return stops[0].color;
  if (t >= stops[stops.length - 1].pos) return stops[stops.length - 1].color;

  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];

    if (t >= current.pos && t <= next.pos) {
      const localT = (t - current.pos) / (next.pos - current.pos);
      return mixColor(current.color, next.color, localT);
    }
  }
}

function updateDepthMood() {
  const scrollY = window.scrollY;

  /*
    숫자가 작을수록 색 변화가 빨라짐.
    3.2 = 꽤 드라마틱
    3.8 = 조금 더 천천히
  */
  const rawProgress = Math.min(scrollY / (window.innerHeight * 3.2), 1);

  /*
    ease 효과
    초반 에메랄드 유지 → 중반부터 깊어짐
  */
  const depthProgress =
    rawProgress < 0.5
      ? 2 * rawProgress * rawProgress
      : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

  const heroProgress = Math.min(scrollY / (window.innerHeight * 1.5), 1);

  const topColor = paletteColor(
    [
      { pos: 0, color: [92, 205, 210] },
      { pos: 0.32, color: [36, 145, 178] },
      { pos: 0.68, color: [9, 64, 112] },
      { pos: 1, color: [3, 22, 48] },
    ],
    depthProgress,
  );

  const midColor = paletteColor(
    [
      { pos: 0, color: [30, 122, 156] },
      { pos: 0.35, color: [14, 86, 136] },
      { pos: 0.72, color: [5, 42, 86] },
      { pos: 1, color: [1, 12, 32] },
    ],
    depthProgress,
  );

  const bottomColor = paletteColor(
    [
      { pos: 0, color: [8, 42, 76] },
      { pos: 0.42, color: [5, 32, 68] },
      { pos: 0.76, color: [2, 18, 48] },
      { pos: 1, color: [0, 5, 18] },
    ],
    depthProgress,
  );

  root.style.setProperty("--depth-progress", depthProgress.toFixed(4));
  root.style.setProperty("--hero-progress", heroProgress.toFixed(4));

  root.style.setProperty("--ocean-top", rgb(topColor));
  root.style.setProperty("--ocean-mid", rgb(midColor));
  root.style.setProperty("--ocean-bottom", rgb(bottomColor));
}

/* 함수 바깥에 있어야 함 */
updateDepthMood();
window.addEventListener("scroll", updateDepthMood, { passive: true });
window.addEventListener("resize", updateDepthMood);

/* ========================= Active nav + depth sync ========================= */
const navLinks = document.querySelectorAll(
  '.nav-links a[href^="#"]:not(.contact-link)',
);
const depthLinks = document.querySelectorAll('.depth-meter a[href^="#"]');

const syncLinks = [...navLinks, ...depthLinks];

const sectionTargets = [
  {
    hash: "#top",
    el: document.querySelector(".hero") || document.querySelector("#top"),
  },
  {
    hash: "#about",
    el: document.querySelector("#about"),
  },
  {
    hash: "#artwork",
    el: document.querySelector("#artwork"),
  },
  {
    hash: "#motion",
    el: document.querySelector("#motion"),
  },
  {
    hash: "#design",
    el: document.querySelector("#design"),
  },
  {
    hash: "#nfnl",
    el: document.querySelector("#nfnl"),
  },
].filter((section) => section.el);

function setActiveSection(hash) {
  // 상단 네비 active
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === hash);
  });

  // 왼쪽 수심 active
  depthLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === hash);
  });

  // hero / top에서는 상단 네비 active 제거, 수심 0m만 active
  if (hash === "#top") {
    navLinks.forEach((link) => link.classList.remove("active"));
  }
}

function getCurrentSectionHash() {
  const checkPoint = window.scrollY + window.innerHeight * 0.42;
  let currentHash = "#top";

  sectionTargets.forEach((section) => {
    if (section.el.offsetTop <= checkPoint) {
      currentHash = section.hash;
    }
  });

  if (window.scrollY < window.innerHeight * 0.35) {
    currentHash = "#top";
  }

  return currentHash;
}

function updateActiveSection() {
  setActiveSection(getCurrentSectionHash());
}

syncLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const hash = link.getAttribute("href");
    setActiveSection(hash);
  });
});

updateActiveSection();
window.addEventListener("scroll", updateActiveSection, { passive: true });
window.addEventListener("resize", updateActiveSection);
window.addEventListener("hashchange", updateActiveSection);

/* ========================= Motion modal video switch ========================= */
const motionMainVideo = document.querySelector(".motion-main-video");
const motionThumbBtns = document.querySelectorAll(".motion-thumb-btn");

const motionCount = document.querySelector(".motion-count");
const motionTitle = document.querySelector(".motion-current-title");
const motionConcept = document.querySelector(".motion-current-concept");
const motionRole = document.querySelector(".motion-current-role");
const motionTools = document.querySelector(".motion-current-tools");

function updateMotionModal(btn) {
  if (!btn || !motionMainVideo) return;

  const videoSrc = btn.dataset.video;
  const source = motionMainVideo.querySelector("source");

  motionThumbBtns.forEach((item) => item.classList.remove("active"));
  btn.classList.add("active");

  if (motionCount) motionCount.textContent = btn.dataset.count || "";
  if (motionTitle) motionTitle.textContent = btn.dataset.title || "";
  if (motionConcept) motionConcept.textContent = btn.dataset.concept || "";
  if (motionRole) motionRole.textContent = btn.dataset.role || "";
  if (motionTools) motionTools.textContent = btn.dataset.tools || "";

  motionMainVideo.pause();

  if (source && videoSrc) {
    source.src = videoSrc;
    motionMainVideo.load();
  }
}

function resetMotionModal() {
  const firstMotionThumb = document.querySelector(".motion-thumb-btn");
  updateMotionModal(firstMotionThumb);
}

// 영상 호버시 미리보기 재생
motionThumbBtns.forEach((btn) => {
  const thumbVideo = btn.querySelector("video");
  if (!thumbVideo) return;

  btn.addEventListener("mouseenter", () => {
    thumbVideo.currentTime = 0;
    thumbVideo.play().catch(() => {});
  });

  btn.addEventListener("mouseleave", () => {
    thumbVideo.pause();
    thumbVideo.currentTime = 0;
  });
});

/* ========================= Motion thumbs horizontal scroll ========================= */
const motionThumbs = document.querySelector(".motion-thumbs");

if (motionThumbs) {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let moved = false;

  /* 마우스 휠을 내리면 좌우 스크롤 */
  motionThumbs.addEventListener(
    "wheel",
    (e) => {
      const canScrollX = motionThumbs.scrollWidth > motionThumbs.clientWidth;
      if (!canScrollX) return;

      e.preventDefault();
      motionThumbs.scrollLeft += e.deltaY + e.deltaX;
    },
    { passive: false },
  );

  /* 드래그 시작 */
  motionThumbs.addEventListener("mousedown", (e) => {
    isDown = true;
    moved = false;
    startX = e.pageX;
    scrollLeft = motionThumbs.scrollLeft;
    motionThumbs.classList.add("is-dragging");
  });

  /* 드래그 중 */
  motionThumbs.addEventListener("mousemove", (e) => {
    if (!isDown) return;

    const moveX = e.pageX - startX;

    if (Math.abs(moveX) > 10) {
      moved = true;
      motionThumbs.scrollLeft = scrollLeft - moveX;
    }
  });

  /* 드래그 끝 */
  motionThumbs.addEventListener("mouseup", () => {
    isDown = false;
    motionThumbs.classList.remove("is-dragging");
  });

  motionThumbs.addEventListener("mouseleave", () => {
    isDown = false;
    motionThumbs.classList.remove("is-dragging");
  });

  /* 드래그한 경우만 클릭 막기 / 그냥 클릭은 허용 */
  motionThumbBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();

        setTimeout(() => {
          moved = false;
        }, 0);

        return;
      }

      updateMotionModal(btn);
    });
  });
}

/* ========================= Motion section card open modal ========================= */
const motionModalDefaultOpenBtns = document.querySelectorAll(
  'a[href="#modal-motion"]',
);

motionModalDefaultOpenBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    resetMotionModal();
  });
});

const motionSectionCards = document.querySelectorAll(
  ".motion-strip .motion-card",
);

motionSectionCards.forEach((card) => {
  card.style.cursor = "pointer";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");

  function openMatchedMotionModal() {
    const cardVideo = card.querySelector("video");
    if (!cardVideo) return;

    const cardVideoSrc = cardVideo.getAttribute("src");

    const matchedThumb = [...motionThumbBtns].find((thumb) => {
      return thumb.dataset.video === cardVideoSrc;
    });

    window.location.hash = "modal-motion";

    if (matchedThumb) {
      updateMotionModal(matchedThumb);
    } else {
      resetMotionModal();
    }
  }

  card.addEventListener("click", openMatchedMotionModal);

  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMatchedMotionModal();
    }
  });
});

/* ========================= Design modal slider ========================= */
const designTrack = document.querySelector(".design-slide-track");
const designSlides = document.querySelectorAll(".design-slide");
const designPrev = document.querySelector(".design-prev");
const designNext = document.querySelector(".design-next");
const designDots = document.querySelectorAll(".design-dots button");
const designSlideTitle = document.querySelector(".design-slide-title");

let designIndex = 0;
const designTitles = ["Event Page", "Banners"];

function updateDesignSlide(index) {
  if (!designTrack || !designSlides.length) return;

  designIndex = index;

  if (designIndex < 0) {
    designIndex = designSlides.length - 1;
  }

  if (designIndex >= designSlides.length) {
    designIndex = 0;
  }

  designTrack.style.transform = `translateX(-${designIndex * 100}%)`;

  designDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === designIndex);
  });

  if (designSlideTitle) {
    designSlideTitle.textContent = designTitles[designIndex];
  }
}

if (designPrev && designNext) {
  designPrev.addEventListener("click", () => {
    updateDesignSlide(designIndex - 1);
  });

  designNext.addEventListener("click", () => {
    updateDesignSlide(designIndex + 1);
  });
}

designDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    updateDesignSlide(Number(dot.dataset.designIndex));
  });
});

/* ========================= Design image zoom ========================= */
const designZoom = document.querySelector(".design-zoom");
const designZoomImg = document.querySelector(".design-zoom img");
const designZoomClose = document.querySelector(".design-zoom-close");
const zoomableDesignImgs = document.querySelectorAll("[data-zoom-src]");

/*
  줌 레이어와 X 버튼을 body 바로 아래로 분리
  - 평상시: X 안 보임
  - 줌 열렸을 때: X만 화면 우측 상단에 고정
*/
if (designZoom) {
  document.body.appendChild(designZoom);
}

if (designZoomClose) {
  document.body.appendChild(designZoomClose);
  designZoomClose.classList.remove("active");
  designZoomClose.setAttribute("aria-hidden", "true");
}

function openDesignZoom(img) {
  if (!designZoom || !designZoomImg) return;

  const zoomSrc = img.dataset.zoomSrc || img.src;
  const isBanner = !!img.closest(".design-banner-works");

  designZoomImg.src = zoomSrc;
  designZoomImg.alt = img.alt || "";

  designZoom.classList.toggle("banner", isBanner);
  designZoom.classList.add("active");
  designZoom.setAttribute("aria-hidden", "false");

  designZoomClose?.classList.add("active");
  designZoomClose?.setAttribute("aria-hidden", "false");

  designZoom.scrollTop = 0;

  requestAnimationFrame(() => {
    designZoomClose?.focus();
  });
}

function closeDesignZoom() {
  if (!designZoom || !designZoomImg) return;

  // aria-hidden 경고 방지: 숨기기 전에 포커스 제거
  if (
    document.activeElement &&
    (designZoom.contains(document.activeElement) ||
      document.activeElement === designZoomClose)
  ) {
    document.activeElement.blur();
  }

  designZoom.classList.remove("active");
  designZoom.classList.remove("banner");
  designZoom.setAttribute("aria-hidden", "true");

  designZoomClose?.classList.remove("active");
  designZoomClose?.setAttribute("aria-hidden", "true");

  designZoomImg.removeAttribute("src");
  designZoomImg.alt = "";
}

zoomableDesignImgs.forEach((img) => {
  img.addEventListener("click", () => {
    openDesignZoom(img);
  });
});

designZoomClose?.addEventListener("click", closeDesignZoom);

designZoom?.addEventListener("click", (e) => {
  if (e.target === designZoom) {
    closeDesignZoom();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && designZoom?.classList.contains("active")) {
    closeDesignZoom();
  }
});

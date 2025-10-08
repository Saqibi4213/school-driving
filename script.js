(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) =>
    Array.from((ctx || document).querySelectorAll(sel));

  const burgerBtn = $("#burger-btn"),
    mobileMenu = $("#mobile-menu"),
    closeMenu = $("#close-menu");
  const scrollBtn = $("#scrollTop"),
    NAV = $("nav"),
    stickyBook = $("#stickyBook");
  const darkToggle = $("#darkToggle"),
    bookingCancel = $("#bookingCancel");

  const navHeight = NAV?.offsetHeight || 72;

  // Remove full-screen height on small devices
  if (window.innerWidth < 900 && document.body.classList.contains("h-screen")) {
    document.body.classList.remove("h-screen");
  }

  // ---------------- Mobile Menu ----------------
  const openMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.add("show");
    mobileMenu.setAttribute("aria-hidden", "false");
    burgerBtn.setAttribute("aria-expanded", "true");
    $("#close-menu", mobileMenu)?.focus();
    document.body.style.overflow = "hidden";
  };
  const closeMenuFn = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("show");
    mobileMenu.setAttribute("aria-hidden", "true");
    burgerBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    burgerBtn?.focus();
  };
  burgerBtn?.addEventListener("click", openMenu);
  closeMenu?.addEventListener("click", closeMenuFn);
  window.addEventListener(
    "keydown",
    (e) =>
      e.key === "Escape" &&
      mobileMenu?.classList.contains("show") &&
      closeMenuFn()
  );
  window.addEventListener("click", (e) => {
    if (
      mobileMenu?.classList.contains("show") &&
      !mobileMenu.contains(e.target) &&
      !burgerBtn.contains(e.target)
    )
      closeMenuFn();
  });
  $$("#mobile-menu a", mobileMenu).forEach((a) =>
    a.addEventListener("click", closeMenuFn)
  );

  // ---------------- Smooth Scroll ----------------
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const targetY =
        target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      closeMenuFn();
    });
  });

  // ---------------- Section Animations ----------------
  const sections = document.querySelectorAll(".section-hidden");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("section-show");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    sections.forEach((s) => observer.observe(s));
  } else sections.forEach((s) => s.classList.add("section-show"));

  // ---------------- Active Nav ----------------
  (function () {
    const navLinks = $$("nav .nav-link"),
      idMap = {};
    navLinks.forEach((a) => {
      const h = a.getAttribute("href");
      if (h?.startsWith("#")) idMap[h.slice(1)] = a;
    });
    const observeSections = Object.keys(idMap)
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (observeSections.length && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const id = e.target.id,
              link = idMap[id];
            if (!link) return;
            if (e.isIntersecting) {
              navLinks.forEach((n) => n.classList.remove("active"));
              link.classList.add("active");
              $$(".mobile-link").forEach((m) => {
                if (m.getAttribute("href") === `#${id}`) {
                  $$(".mobile-link").forEach((x) =>
                    x.classList.remove("active")
                  );
                  m.classList.add("active");
                }
              });
            }
          });
        },
        { threshold: 0.48, rootMargin: `-${navHeight}px 0px -40% 0px` }
      );
      observeSections.forEach((s) => obs.observe(s));
    }
  })();

  // ---------------- Scroll & Sticky CTA ----------------
  scrollBtn &&
    window.addEventListener("scroll", () => {
      scrollBtn.classList.toggle("show", window.scrollY > 300);
      NAV?.classList.toggle("scrolled", window.scrollY > 20);
      const hero = $("#home");
      hero &&
        stickyBook?.classList.toggle(
          "hidden",
          hero.getBoundingClientRect().bottom >= 60
        );
    });
  scrollBtn?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  // ---------------- Gallery Auto-Scroll ----------------
  (function () {
    const scrollers = $$(".animate-scroll");
    if (!scrollers.length) return;
    let styleSheet = document.createElement("style");
    styleSheet.dataset.generated = "gallery-scroll";
    document.head.appendChild(styleSheet);
    const speed = 90;
    function init(s, idx) {
      const parent = s.parentElement;
      if (!parent || s.children.length < 2) return;
      let clones = 12;
      while (s.scrollWidth < parent.clientWidth * 2 && clones-- > 0)
        Array.from(s.children).forEach((n) => s.appendChild(n.cloneNode(true)));
      const distance = s.scrollWidth / 2;
      if (!isFinite(distance) || distance <= 0) return;
      const dur = Math.max(8, Math.round(distance / speed)),
        name = `scrollX_${idx}`;
      styleSheet.sheet.insertRule(
        `@keyframes ${name}{from{transform:translateX(0);}to{transform:translateX(-${distance}px);}}`,
        styleSheet.sheet.cssRules.length
      );
      s.style.animation = `${name} ${dur}s linear infinite`;
      s.style.willChange = "transform";
      // Pause on hover
      s.addEventListener(
        "mouseenter",
        () => (s.style.animationPlayState = "paused")
      );
      s.addEventListener(
        "mouseleave",
        () => (s.style.animationPlayState = "running")
      );
    }
    scrollers.forEach(init);
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        styleSheet.remove();
        styleSheet = document.createElement("style");
        styleSheet.dataset.generated = "gallery-scroll";
        document.head.appendChild(styleSheet);
        scrollers.forEach((s, i) => {
          s.style.animation = "";
          init(s, i);
        });
      }, 300);
    });
  })();

  // ---------------- Booking Buttons Pulse ----------------
  $$('a[href="#booking"]').forEach((a) => {
    a.classList.add("pulse", "glow-btn");
    a.addEventListener("click", () => {
      a.classList.add("active");
      setTimeout(() => a.classList.remove("active"), 900);
    });
  });

  // ---------------- Booking Form ----------------
  (function () {
    const form = $("#bookingForm");
    if (!form) return;
    form.addEventListener("submit", () => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Verzenden...";
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = "Verstuur boeking";
        }, 2500);
      }
    });
    bookingCancel?.addEventListener("click", () => form.reset());
  })();

  // ---------------- Contact Form ----------------
  (function () {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", () => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Verzenden...";
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = "Verstuur";
        }, 2000);
      }
    });
  })();

  // ---------------- Dark Mode ----------------
  (function () {
    const key = "rijopleiding-dark",
      setDark = (d) => {
        document.documentElement.classList.toggle("dark", d);
        localStorage.setItem(key, !!d);
      };
    const stored = localStorage.getItem(key);
    stored !== null
      ? setDark(stored === "true")
      : setDark(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    darkToggle?.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem(key, isDark);
    });
    document.documentElement.style.transition =
      "background-color 0.3s,color 0.3s";
  })();

  // ---------------- Navbar Enhancement ----------------
  (function () {
    const logo = $("nav img"),
      links = $$("nav .nav-link");
    links.forEach((l) => {
      l.addEventListener(
        "mouseenter",
        () => (l.style.textShadow = "0 2px 10px rgba(14,165,233,0.4)")
      );
      l.addEventListener("mouseleave", () => (l.style.textShadow = ""));
    });
    function centerLogo() {
      if (!logo) return;
      if (window.innerWidth < 768) {
        logo.style.display = "block";
        logo.style.margin = "0 auto";
      } else {
        logo.style.display = "";
        logo.style.margin = "";
      }
    }
    centerLogo();
    window.addEventListener("resize", centerLogo);
  })();

  // ---------------- Translation Support ----------------
  window.translatePage = function (lang = "en") {
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (window.i18n && i18n[lang]?.[key]) el.textContent = i18n[lang][key];
    });
  };
})();
document.getElementById("contactForm").addEventListener("submit", function (e) {
  setTimeout(() => {
    alert("Bedankt! We hebben uw bericht ontvangen.");
    this.reset(); // clears the form
  }, 500);
});
document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const email = "mosawermh@gmail.com";

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        showToast("✅ Bericht succesvol verzonden!");
        form.reset();
      } else {
        showToast("❌ Verzenden mislukt. Probeer opnieuw.");
      }
    } catch {
      showToast("⚠️ Netwerkfout. Controleer je verbinding.");
    }
  });

function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.className =
    "fixed bottom-6 right-6 bg-black/70 text-white px-6 py-3 rounded-xl shadow-xl backdrop-blur-md z-50 transition-all duration-500";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
  }, 2500);
  setTimeout(() => toast.remove(), 3200);
}

// Instant jump nav links (no smooth scroll for desktop)
document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "auto" }); // instant jump
  });
});

// Optional: mobile menu smooth scroll
document.querySelectorAll('#mobile-menu a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 70,
        behavior: "smooth",
      });
    }
  });
});

// Mobile menu toggle
const burger = document.getElementById("burger-btn");
const mobileMenu = document.getElementById("mobile-menu");
const closeMenu = document.getElementById("close-menu");

burger.addEventListener("click", () => mobileMenu.classList.add("open"));
closeMenu.addEventListener("click", () => mobileMenu.classList.remove("open"));

// Navbar shadow on scroll
window.addEventListener("scroll", () => {
  document
    .querySelector("nav")
    .classList.toggle("shadow-lg", window.scrollY > 50);
});

// Nav link hover & active glow
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  link.addEventListener("mouseenter", () =>
    link.classList.add("text-blue-600", "scale-105")
  );
  link.addEventListener("mouseleave", () =>
    link.classList.remove("text-blue-600", "scale-105")
  );
  link.addEventListener("click", () => {
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active", "text-blue-700");
  });
});

//sparkles

const canvas = document.getElementById("sparkles");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createParticle() {
  const size = Math.random() * 2 + 1;
  const hue = 200 + Math.random() * 100;
  const color = `hsla(${hue}, 100%, 70%, 0.9)`;
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size,
    color,
    alpha: 1,
    speedY: Math.random() * 0.3 - 0.15,
    speedX: Math.random() * 0.3 - 0.15,
    life: Math.random() * 100 + 60,
  };
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    p.x += p.speedX;
    p.y += p.speedY;
    p.life--;
    p.alpha -= 0.008;

    if (p.life <= 0 || p.alpha <= 0) {
      Object.assign(p, createParticle());
    }
  });
}

function animate() {
  drawParticles();
  requestAnimationFrame(animate);
}

for (let i = 0; i < 100; i++) {
  particles.push(createParticle());
}

animate();
//  flying imgs
const swiperBirds = new Swiper(".mySwiper3dBirds", {
  slidesPerView: 1.2,
  spaceBetween: 20,
  centeredSlides: true,
  loop: true,
  grabCursor: true,
  freeMode: true,
  autoplay: { delay: 2000, disableOnInteraction: false },
  breakpoints: {
    640: { slidesPerView: 1.5, spaceBetween: 20 },
    768: { slidesPerView: 2, spaceBetween: 25 },
    1024: { slidesPerView: 3, spaceBetween: 30 },
    1280: { slidesPerView: 3.5, spaceBetween: 35 },
    1536: { slidesPerView: 4, spaceBetween: 40 },
  },
});

// Fly-in on scroll using IntersectionObserver
const slides = document.querySelectorAll(".fly-in");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.setProperty(
          "--fly-x",
          entry.target.dataset.flyX + "px"
        );
        entry.target.style.setProperty(
          "--fly-y",
          entry.target.dataset.flyY + "px"
        );
        entry.target.style.transitionDelay = entry.target.dataset.delay;
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.3 }
);

slides.forEach((slide) => observer.observe(slide));

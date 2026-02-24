import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import "@/styles/eden.css";
import { toast } from "@/hooks/use-toast";


type TabKey = "mare" | "terra";

type GalleryFilter = "all" | "food" | "location" | "events";

type GalleryItem = {
  sizeClass?: "item-large" | "item-wide" | "item-tall";
  category: Exclude<GalleryFilter, "all">;
  src: string;
  alt: string;
  tag: string;
  title: string;
};

// NOTE: For strict 1:1 parity with nuovo_1.html we do not apply adaptive motion changes here.

function useRevealOnScroll(selector: string) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [selector]);
}

function animateCounterInt(el: HTMLElement, target: number, durationMs: number) {
  let start = 0;
  const step = target / Math.max(1, durationMs / 16);
  const timer = window.setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      window.clearInterval(timer);
    }
    el.textContent = String(Math.floor(start));
  }, 16);
  return () => window.clearInterval(timer);
}

function animateCounterStat(el: HTMLElement, target: number) {
  const isDecimal = target < 10;
  let start = 0;
  const duration = 2000;
  const stepTime = 20;
  const steps = duration / stepTime;
  const increment = target / steps;

  const timer = window.setInterval(() => {
    start += increment;
    if (start >= target) {
      start = target;
      window.clearInterval(timer);
    }

    if (isDecimal) {
      el.textContent = start.toFixed(1).replace(".", ",");
      return;
    }

    const format = el.getAttribute("data-format");
    if (format === "plain") {
      el.textContent = `+${Math.floor(start)}`;
      return;
    }

    // legacy "k" format
    el.innerHTML = `+<span data-target="${target}">${Math.floor(start)}</span>k`;
  }, stepTime);

  return () => window.clearInterval(timer);
}

function useHeroCanvas(canvasRef: RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let leaves: Array<any> = [];
    let glows: Array<any> = [];
    let heroWidth = 0;
    let heroHeight = 0;
    let raf = 0;

    const mouse = { x: 0, y: 0, active: false };

    function resizeCanvas() {
      heroWidth = window.innerWidth;
      heroHeight = window.innerHeight;
      canvas.width = heroWidth;
      canvas.height = heroHeight;
      createLeaves();
      createGlows();
    }

    function createLeaves() {
      leaves = [];
      // 1:1 from nuovo_1.html
      const count = Math.floor((heroWidth * heroHeight) / 22000);
      for (let i = 0; i < count; i++) {
        leaves.push({
          x: Math.random() * heroWidth,
          y: Math.random() * heroHeight,
          size: 0.5 + Math.random() * 1.2,
          speedY: 0.25 + Math.random() * 0.5,
          swayAmp: 10 + Math.random() * 18,
          swaySpeed: 0.3 + Math.random() * 0.5,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.01,
          hue: 115 + Math.random() * 30,
          time: Math.random() * 100,
        });
      }
    }

    function createGlows() {
      glows = [];
      // 1:1 from nuovo_1.html
      const count = Math.max(12, Math.floor((heroWidth * heroHeight) / 90000));
      for (let i = 0; i < count; i++) {
        glows.push({
          x: Math.random() * heroWidth,
          y: Math.random() * heroHeight,
          radius: 40 + Math.random() * 80,
          alphaBase: 0.08 + Math.random() * 0.12,
          alphaVar: 0.05 + Math.random() * 0.08,
          speedY: -0.02 - Math.random() * 0.04,
          speedX: (Math.random() - 0.5) * 0.02,
          hue: 130 + Math.random() * 40,
          t: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawLeaf(l: any) {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.angle);
      ctx.scale(l.size, l.size);

      const grad = ctx.createLinearGradient(0, -14, 0, 14);
      grad.addColorStop(0, `hsla(${l.hue},70%,80%,0.3)`);
      grad.addColorStop(1, `hsla(${l.hue + 10},55%,35%,0.7)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.bezierCurveTo(8, -12, 10, 2, 0, 14);
      ctx.bezierCurveTo(-10, 2, -8, -12, 0, -14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `hsla(${l.hue + 20},50%,80%,0.5)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 10);
      ctx.stroke();

      ctx.restore();
    }

    function drawGlow(g: any) {
      const alpha = g.alphaBase + Math.sin(g.t) * g.alphaVar;
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.radius);
      grad.addColorStop(0, `hsla(${g.hue},80%,85%,${alpha})`);
      grad.addColorStop(1, `hsla(${g.hue},80%,40%,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function animate() {
      ctx.clearRect(0, 0, heroWidth, heroHeight);

      for (const g of glows) {
        // 1:1 from nuovo_1.html
        g.t += 0.01;
        g.x += g.speedX;
        g.y += g.speedY;

        if (g.y + g.radius < -40) {
          g.y = heroHeight + g.radius + 20;
          g.x = Math.random() * heroWidth;
        }
        if (g.x < -g.radius) g.x = heroWidth + g.radius;
        if (g.x > heroWidth + g.radius) g.x = -g.radius;

        drawGlow(g);
      }

      for (const l of leaves) {
        l.time += 0.016;
        const sway = Math.sin(l.time * l.swaySpeed) * l.swayAmp;

        let wind = 0;
        if (mouse.active) {
          const dx = l.x - mouse.x;
          const dy = l.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 180) {
            wind = ((180 - dist) / 180) * 10 * (dx > 0 ? 1 : -1);
          }
        }

        l.x += sway * 0.03 + wind * 0.02;
        l.y += l.speedY;
        l.angle += l.rotSpeed;

        if (l.y > heroHeight + 30) {
          l.y = -30;
          l.x = Math.random() * heroWidth;
          l.time = Math.random() * 100;
        }
        if (l.x < -40) l.x = heroWidth + 40;
        if (l.x > heroWidth + 40) l.x = -40;

        drawLeaf(l);
      }

      raf = requestAnimationFrame(animate);
    }

    const onResize = () => resizeCanvas();
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("resize", onResize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    resizeCanvas();
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, [canvasRef]);
}

export default function EdenLanding() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Match html/body globals from nuovo_1.html (smooth scroll, background, color, height)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("eden-html");
    body.classList.add("eden-body");
    return () => {
      html.classList.remove("eden-html");
      body.classList.remove("eden-body");
    };
  }, []);

  const [isNavOpen, setIsNavOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("mare");
  const [tabVisible, setTabVisible] = useState(false);

  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [lightboxCaption, setLightboxCaption] = useState("");

  const [miniToast, setMiniToast] = useState<string | null>(null);

  const [policyOpen, setPolicyOpen] = useState(false);
  const lastPolicyTriggerRef = useRef<HTMLElement | null>(null);

  const eventFormRef = useRef<HTMLFormElement | null>(null);

  useHeroCanvas(canvasRef);
  useRevealOnScroll(".reveal-on-scroll");

  // Stagger reveal (gallery)
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal-stagger"));
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Scroll-driven parallax layers (replaces mousemove 3D)
  useEffect(() => {
    const layers = Array.from(document.querySelectorAll<HTMLElement>(".parallax-layer[data-parallax]"));
    if (!layers.length) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        layers.forEach((el) => {
          const factor = parseFloat(el.dataset.parallax || "0");
          const py = -y * factor;
          el.style.setProperty("--parallaxY", `${py}px`);
        });
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Lock body scroll when overlays are open
  useEffect(() => {
    const body = document.body;
    if (lightboxOpen || policyOpen) body.classList.add("eden-lock");
    else body.classList.remove("eden-lock");
    return () => body.classList.remove("eden-lock");
  }, [lightboxOpen, policyOpen]);

  // ESC to close overlays
  useEffect(() => {
    if (!lightboxOpen && !policyOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (policyOpen) {
        setPolicyOpen(false);
        window.setTimeout(() => lastPolicyTriggerRef.current?.focus(), 0);
      }
      if (lightboxOpen) setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, policyOpen]);

  // Avvia pannello "mare" quando la sezione cucina entra in vista (1:1)
  useEffect(() => {
    const cucinaSection = document.querySelector<HTMLElement>(".cucina-section");
    if (!cucinaSection) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab("mare");
            setTabVisible(true);
            obs.unobserve(cucinaSection);
          }
        });
      },
      { threshold: 0.2 },
    );

    obs.observe(cucinaSection);
    return () => obs.disconnect();
  }, []);

  // Tab reveal + counter price (1:1)
  useEffect(() => {
    setTabVisible(false);
    const panelId = activeTab === "mare" ? "panel-mare" : "panel-terra";
    const panel = document.getElementById(panelId);
    if (!panel) return;

    let cleanupCounter: undefined | (() => void);

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setTabVisible(true);
        const priceEl = panel.querySelector<HTMLElement>(".price-big");
        if (priceEl) {
          priceEl.textContent = "0";
          const target = parseInt(priceEl.dataset.target || "0", 10);
          cleanupCounter = animateCounterInt(priceEl, target, 600);
        }
      });
      (panel as any).__raf2 = raf2;
    });

    return () => {
      cancelAnimationFrame(raf1);
      const raf2 = (panel as any).__raf2;
      if (raf2) cancelAnimationFrame(raf2);
      cleanupCounter?.();
    };
  }, [activeTab]);

  // Floating labels (1:1)
  useEffect(() => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(".ep-input"));
    if (!inputs.length) return;

    inputs.forEach((input) => {
      if (input.value.trim() !== "") input.classList.add("has-value");

      const onInput = () => {
        if (input.value.trim() !== "") input.classList.add("has-value");
        else input.classList.remove("has-value");
      };

      input.addEventListener("input", onInput);
      (input as any).__eden_onInput = onInput;
    });

    return () => {
      inputs.forEach((input) => {
        const onInput = (input as any).__eden_onInput as undefined | (() => void);
        if (onInput) input.removeEventListener("input", onInput);
      });
    };
  }, []);

  // Stats counters (1:1)
  useEffect(() => {
    const statsSection = document.querySelector<HTMLElement>(".reviews-premium");
    if (!statsSection) return;

    const statNums = Array.from(document.querySelectorAll<HTMLElement>(".stat-val"));
    let animated = false;
    let cleanups: Array<() => void> = [];

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            statNums.forEach((num) => {
              const targetStr = num.getAttribute("data-target");
              if (!targetStr) return;
              const target = parseFloat(targetStr);
              cleanups.push(animateCounterStat(num, target));
            });
            obs.unobserve(statsSection);
          }
        });
      },
      { threshold: 0.3 },
    );

    obs.observe(statsSection);
    return () => {
      obs.disconnect();
      cleanups.forEach((c) => c());
    };
  }, []);

  // Close mobile nav when clicking a hash link
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      setIsNavOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  const galleryItems: GalleryItem[] = useMemo(
    () => [
      {
        sizeClass: "item-large",
        category: "food",
        src: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Piatto gourmet (crudo di mare)",
        tag: "Food",
        title: "Crudo di mare",
      },
      {
        sizeClass: "item-tall",
        category: "location",
        src: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Sala interna in pietra",
        tag: "Location",
        title: "Sala in pietra",
      },
      {
        category: "events",
        src: "https://images.pexels.com/photos/5638612/pexels-photo-5638612.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Evento privato, tavola apparecchiata",
        tag: "Eventi",
        title: "Feste private",
      },
      {
        category: "food",
        src: "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Dessert artigianale",
        tag: "Food",
        title: "Dolci artigianali",
      },
      {
        sizeClass: "item-wide",
        category: "location",
        src: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Dettaglio tavola, mise en place",
        tag: "Location",
        title: "Mise en place",
      },
      {
        category: "events",
        src: "https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Brindisi durante evento",
        tag: "Eventi",
        title: "Brindisi speciali",
      },
      {
        category: "food",
        src: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Antipasto mediterraneo",
        tag: "Food",
        title: "Antipasto mediterraneo",
      },
      {
        category: "food",
        src: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Pasta fresca con frutti di mare",
        tag: "Food",
        title: "Pasta fresca",
      },
      {
        category: "food",
        src: "https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Calice di vino rosso",
        tag: "Wine",
        title: "Selezione vini",
      },
      {
        category: "location",
        src: "https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Angolo sala con luci calde",
        tag: "Location",
        title: "Luce soffusa",
      },
      {
        category: "location",
        src: "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Dettaglio interni ristorante",
        tag: "Location",
        title: "Dettagli",
      },
      {
        sizeClass: "item-tall",
        category: "events",
        src: "https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Sala preparata per evento",
        tag: "Eventi",
        title: "Allestimenti",
      },
      {
        category: "events",
        src: "https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Torta e festa",
        tag: "Eventi",
        title: "Compleanni",
      },
      {
        category: "food",
        src: "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Secondo piatto gourmet",
        tag: "Food",
        title: "Secondi",
      },
      {
        sizeClass: "item-wide",
        category: "location",
        src: "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Tavoli e atmosfera",
        tag: "Location",
        title: "Atmosfera",
      },
      {
        category: "food",
        src: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=900",
        alt: "Cocktail o aperitivo",
        tag: "Bar",
        title: "Aperitivi",
      },
    ],
    [],
  );

  function openLightbox(item: GalleryItem) {
    setLightboxSrc(item.src);
    setLightboxCaption(item.title);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function onGalleryFilter(next: GalleryFilter) {
    setGalleryFilter(next);
  }

  function onEventSubmit() {
    const form = eventFormRef.current;
    if (!form) return;

    const getSelectedOccasion = () => {
      const checked = form.querySelector<HTMLInputElement>("input[name='tipo']:checked");
      return checked?.value ?? "";
    };

    const normalizePhone = (p: string) => String(p || "").trim().replace(/\s+/g, " ");

    const payload = {
      tipo: getSelectedOccasion(),
      nome: (form.querySelector<HTMLInputElement>("#ep-nome")?.value ?? "").trim(),
      tel: normalizePhone(form.querySelector<HTMLInputElement>("#ep-tel")?.value ?? ""),
      ospiti: String(form.querySelector<HTMLInputElement>("#ep-ospiti")?.value ?? "").trim(),
      note: (form.querySelector<HTMLTextAreaElement>("#ep-note")?.value ?? "").trim(),
    };

    const validateEvent = (p: typeof payload) => {
      if (!p.tipo) return "Seleziona l'occasione.";
      if (!p.nome) return "Inserisci nome e cognome.";
      if (!p.tel) return "Inserisci un telefono/WhatsApp.";
      if (!p.ospiti) return "Inserisci il numero di ospiti.";
      if (!p.note) return "Inserisci qualche dettaglio (note).";
      return "";
    };

    const err = validateEvent(payload);
    if (err) {
      toast({
        title: "Controlla il form",
        description: err,
        variant: "destructive",
      });
      return;
    }

    const msg = [
      "Richiesta EVENTO · EDEN",
      "",
      `Occasione: ${payload.tipo || "-"}`,
      `Nome: ${payload.nome || "-"}`,
      `Telefono: ${payload.tel || "-"}`,
      `Ospiti: ${payload.ospiti || "-"}`,
      "",
      "Dettagli:",
      payload.note || "-",
    ].join("\n");

    const waUrl = `https://wa.me/393497152524?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank", "noopener");

    toast({
      title: "Richiesta pronta su WhatsApp",
      description: "Si è aperta una nuova scheda con il messaggio precompilato.",
    });
  }

  async function handleCopyAddress() {
    const text = "Via Santa Maria della Stella, 66, 70010 Adelfia (BA)";
    try {
      await navigator.clipboard.writeText(text);
      setMiniToast("Indirizzo copiato");
      window.setTimeout(() => setMiniToast(null), 1400);
    } catch {
      toast({
        title: "Copia non disponibile",
        description: "Non riesco a copiare l'indirizzo. Puoi selezionarlo e copiarlo manualmente.",
        variant: "destructive",
      });
    }
  }

  const filteredGallery = useMemo(() => {
    return galleryItems.filter((item) => galleryFilter === "all" || item.category === galleryFilter);
  }, [galleryItems, galleryFilter]);

  return (
    <div className="eden-theme" data-mood={activeTab}>
      <a className="skip-link" href="#main-content">
        Vai al contenuto
      </a>

      {/* Sfondo continuo: canvas + aurora */}
      <canvas id="eden-hero-canvas" ref={canvasRef} />
      <div className="hero-aurora" />
      <div className="eden-leaves" aria-hidden="true">
        <img className="eden-leaf eden-leaf--a parallax-layer" data-parallax="0.08" src="/eden/leaf.png" alt="" loading="eager" />
        <img className="eden-leaf eden-leaf--b parallax-layer" data-parallax="0.14" src="/eden/leaf-source.png" alt="" loading="eager" />
      </div>
      <div className="eden-led" aria-hidden="true" />

      <div className="page">
        {/* HEADER */}
        <header className="site-header">
          <div className={`header-inner ${isNavOpen ? "nav-open" : ""}`.trim()}>
            <a className="header-logo" href="#eden" aria-label="Vai a EDEN">
              <img className="header-logo-img" src="/eden/eden-logo.jpg" alt="EDEN" loading="eager" />
              <div className="header-logo-copy">
                <div className="header-logo-text">EDEN</div>
                <div className="header-logo-sub">FOOD · WINE · RESTAURANT</div>
              </div>
            </a>

            <button
              className="header-menu-btn"
              type="button"
              aria-expanded={isNavOpen}
              aria-controls="header-nav"
              onClick={() => setIsNavOpen((v) => !v)}
            >
              <span className="menu-lines" aria-hidden="true">
                <span />
                <span />
              </span>
              <span className="menu-label">Menu</span>
            </button>

            <nav id="header-nav" className="header-nav" aria-label="Navigazione EDEN">
              <a href="#eden">Eden</a>
              <a href="#cucina">Cucina</a>
              <a href="#gallery">Gallery</a>
              <a href="#eventi">Eventi</a>
              <a href="#recensioni">Recensioni</a>
              <a href="#contatti">Contatti</a>
              <a className="header-nav-cta" href="tel:+390805248160">
                Prenota
              </a>
            </nav>

            <a className="header-cta" href="tel:+390805248160">
              <span>Prenota</span>
              <strong>080 524 8160</strong>
            </a>
          </div>
        </header>

        <main id="main-content" tabIndex={-1}>
          {/* BLOCCO 1 · HERO */}
          <section className="hero" id="hero">
            <div className="hero-blob-wrap parallax-layer" data-parallax="0.12">
              <div className="hero-blob" />
            </div>

            <div className="hero-inner">
              <div className="hero-content parallax-layer" id="hero-content" data-parallax="0.06">
                <h1 className="hero-title">
                  <img className="hero-logo" src="/eden/eden-hero-logo.png" alt="Eden Food.Wine.Restaurant" loading="eager" />
                </h1>
                <p className="hero-sub">
                  Un giardino di pietra, luce e sapori mediterranei. Un Eden contemporaneo nel cuore della Puglia.
                </p>
                <div className="hero-badge-row">
                  <div className="hero-pill">Adelfia · Puglia</div>
                  <div className="hero-pill">Food · Wine · Eventi</div>
                </div>
              </div>
            </div>

            <div className="hero-scroll parallax-layer" data-parallax="0.18">
              <div className="hero-scroll-indicator">
                <span />
              </div>
              <span>Scorri nel nostro Eden</span>
            </div>
          </section>

          {/* BLOCCO 2 · SEZIONE EDEN */}
          <section id="eden" className="eden-section reveal-on-scroll">
            <div className="eden-shell">
              <div className="eden-tagline">L&rsquo;Eden di pietra</div>
              <h2 className="eden-title">Un giardino di pietra nel cuore di Adelfia.</h2>
              <p className="eden-sub">
                Dietro un ingresso discreto si apre una sala in pietra: volte, luci calde, tavoli curati. È qui che Eden
                diventa il luogo dove portare chi conta davvero, per una cena o per un evento speciale.
              </p>

              <div className="eden-layout">
                <div className="eden-text">
                  <div className="eden-point">
                    <h3>Pietra viva, luce morbida</h3>
                    <p>
                      Le pareti in pietra e le luci soffuse creano un&rsquo;atmosfera raccolta, elegante ma mai fredda: un Eden
                      contemporaneo che nasce dalla Puglia.
                    </p>
                  </div>
                  <div className="eden-point">
                    <h3>Dettagli non scontati</h3>
                    <p>
                      Tratti di verde, toni perlacei, richiami ai trulli e agli ulivi: l&rsquo;ambiente interno parla la stessa
                      lingua dei paesaggi pugliesi.
                    </p>
                  </div>
                  <div className="eden-point">
                    <h3>Spazio per cene ed eventi</h3>
                    <p>
                      La sala si presta tanto alla cena a due quanto alle tavolate per compleanni, lauree e cerimonie:
                      l&rsquo;Eden si modella su ciò che devi festeggiare.
                    </p>
                  </div>
                </div>

                <div className="eden-visual">
                  <div className="eden-window">
                    <div className="eden-window-shape" />
                    <div className="eden-arch-glow" />
                    <div className="eden-label">
                      <span className="dot" />
                      <span>Adelfia · Puglia</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BLOCCO 3 · CUCINA & MENÙ DEGUSTAZIONE (PREMIUM) */}
          <section
            id="cucina"
            className="cucina-section reveal-on-scroll"
            data-reveal="cucina"
            data-mood={activeTab}
          >
            <div className="cucina-atmo-wrap" aria-hidden="true">
              <div className="cucina-atmo cucina-atmo--mare" />
              <div className="cucina-atmo cucina-atmo--terra" />
              <div className="cucina-reveal" />
            </div>

            <div className="cucina-shell">
              <div className="cucina-header">
                <div className="cucina-kicker">La cucina di Miriam</div>
                <h2 className="cucina-title">
                  Il sapore del Mediterraneo,<br />
                  <em>servito come si deve.</em>
                </h2>
                <p className="cucina-sub">
                  Materie prime selezionate, cotture attente, presentazioni eleganti. Due percorsi degustazione che
                  raccontano la Puglia nel piatto.
                </p>
              </div>

              <div className="tab-row" role="tablist" aria-label="Percorsi degustazione">
                <button
                  className={`tab-btn ${activeTab === "mare" ? "active" : ""}`}
                  data-tab="mare"
                  role="tab"
                  aria-selected={activeTab === "mare"}
                  aria-controls="panel-mare"
                  onClick={() => setActiveTab("mare")}
                  type="button"
                >
                  <span className="tab-dot tab-dot-mare" aria-hidden="true" />
                  Percorso Mare
                </button>
                <button
                  className={`tab-btn ${activeTab === "terra" ? "active" : ""}`}
                  data-tab="terra"
                  role="tab"
                  aria-selected={activeTab === "terra"}
                  aria-controls="panel-terra"
                  onClick={() => setActiveTab("terra")}
                  type="button"
                >
                  <span className="tab-dot tab-dot-terra" aria-hidden="true" />
                  Percorso Terra
                </button>
                <div className="tab-line" aria-hidden="true" />
              </div>

              {/* PANNELLO MARE */}
              <div
                className={`tab-panel ${activeTab === "mare" ? "active" : ""} ${tabVisible && activeTab === "mare" ? "visible" : ""}`}
                id="panel-mare"
                role="tabpanel"
                aria-label="Percorso mare"
                style={{ display: activeTab === "mare" ? "block" : "none" }}
              >
                <div className="panel-layout">
                  <div className="panel-visual">
                    <div className="dish-orb">
                      <div className="dish-orb-inner">
                        <div className="dish-orb-shine" />
                        <div className="dish-orb-label">Mare</div>
                      </div>
                      <div className="orb-ring orb-ring-1" />
                      <div className="orb-ring orb-ring-2" />
                      <div className="orb-float-tag orb-tag-1">Antipasto di mare</div>
                      <div className="orb-float-tag orb-tag-2">Crudo del giorno</div>
                      <div className="orb-float-tag orb-tag-3">Pescato fresco</div>
                    </div>
                  </div>

                  <div className="panel-content">
                    <div className="panel-price-badge" aria-label="Prezzo indicativo percorso mare">
                      <span className="price-from">da</span>
                      <span className="price-big" data-target="30">
                        0
                      </span>
                      <span className="price-currency">€</span>
                      <span className="price-person">a persona</span>
                    </div>

                    <div className="course-list">
                      <div className="course-item" style={{ ["--i" as any]: 0 }}>
                        <div className="course-num">01</div>
                        <div className="course-info">
                          <strong>Antipasto di mare</strong>
                          <span>Selezione di crudi, tartare e finger food dal pescato del giorno.</span>
                        </div>
                      </div>
                      <div className="course-item" style={{ ["--i" as any]: 1 }}>
                        <div className="course-num">02</div>
                        <div className="course-info">
                          <strong>Primo di pesce</strong>
                          <span>Pasta fresca, risotto o zuppa con frutti di mare e bisque.</span>
                        </div>
                      </div>
                      <div className="course-item" style={{ ["--i" as any]: 2 }}>
                        <div className="course-num">03</div>
                        <div className="course-info">
                          <strong>Secondo del giorno</strong>
                          <span>Pesce intero al forno o in crosta, con contorni di stagione.</span>
                        </div>
                      </div>
                      <div className="course-item" style={{ ["--i" as any]: 3 }}>
                        <div className="course-num">04</div>
                        <div className="course-info">
                          <strong>Dessert artigianale</strong>
                          <span>Dolce al cucchiaio o monoporzione, preparato in casa.</span>
                        </div>
                      </div>
                    </div>

                    <div className="panel-tags" aria-label="Caratteristiche percorso mare">
                      <span className="ptag">Senza glutine su richiesta</span>
                      <span className="ptag">Vini abbinati disponibili</span>
                      <span className="ptag">Ideale cene romantiche</span>
                    </div>

                    <a href="#contatti" className="panel-cta">
                      Prenota il percorso mare <span className="cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* PANNELLO TERRA */}
              <div
                className={`tab-panel ${activeTab === "terra" ? "active" : ""} ${tabVisible && activeTab === "terra" ? "visible" : ""}`}
                id="panel-terra"
                role="tabpanel"
                aria-label="Percorso terra"
                style={{ display: activeTab === "terra" ? "block" : "none" }}
              >
                <div className="panel-layout">
                  <div className="panel-visual">
                    <div className="dish-orb dish-orb-terra">
                      <div className="dish-orb-inner">
                        <div className="dish-orb-shine" />
                        <div className="dish-orb-label">Terra</div>
                      </div>
                      <div className="orb-ring orb-ring-1" />
                      <div className="orb-ring orb-ring-2" />
                      <div className="orb-float-tag orb-tag-1">Antipasti tipici</div>
                      <div className="orb-float-tag orb-tag-2">Pasta fresca</div>
                      <div className="orb-float-tag orb-tag-3">Carne lenta cottura</div>
                    </div>
                  </div>

                  <div className="panel-content">
                    <div className="panel-price-badge panel-price-badge-terra" aria-label="Prezzo indicativo percorso terra">
                      <span className="price-from">da</span>
                      <span className="price-big" data-target="28">
                        0
                      </span>
                      <span className="price-currency">€</span>
                      <span className="price-person">a persona</span>
                    </div>

                    <div className="course-list">
                      <div className="course-item" style={{ ["--i" as any]: 0 }}>
                        <div className="course-num">01</div>
                        <div className="course-info">
                          <strong>Antipasti tipici pugliesi</strong>
                          <span>Formaggi, salumi, focacce, verdure grigliate e bruschette.</span>
                        </div>
                      </div>
                      <div className="course-item" style={{ ["--i" as any]: 1 }}>
                        <div className="course-num">02</div>
                        <div className="course-info">
                          <strong>Primo di stagione</strong>
                          <span>Pasta fresca, orecchiette o timballo secondo disponibilità.</span>
                        </div>
                      </div>
                      <div className="course-item" style={{ ["--i" as any]: 2 }}>
                        <div className="course-num">03</div>
                        <div className="course-info">
                          <strong>Secondo di carne</strong>
                          <span>Tagli selezionati a lenta cottura, con contorno di stagione.</span>
                        </div>
                      </div>
                      <div className="course-item" style={{ ["--i" as any]: 3 }}>
                        <div className="course-num">04</div>
                        <div className="course-info">
                          <strong>Dolce artigianale</strong>
                          <span>Dolce del giorno preparato in casa.</span>
                        </div>
                      </div>
                    </div>

                    <div className="panel-tags" aria-label="Caratteristiche percorso terra">
                      <span className="ptag">Opzione vegetariana</span>
                      <span className="ptag">Vini pugliesi abbinati</span>
                      <span className="ptag">Perfetto per tavolate</span>
                    </div>

                    <a href="#contatti" className="panel-cta panel-cta-terra">
                      Prenota il percorso terra <span className="cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BLOCCO 4 · GALLERIA VISUAL */}
          <section id="gallery" className="gallery-section reveal-on-scroll">
            <div className="gallery-shell">
              <div className="gallery-header">
                <div className="gallery-kicker">I nostri scatti</div>
                <h2 className="gallery-title">L&rsquo;Eden in ogni dettaglio.</h2>

                <div className="gallery-filters">
                  <button
                    className={`filter-btn ${galleryFilter === "all" ? "active" : ""}`}
                    data-filter="all"
                    type="button"
                    onClick={() => onGalleryFilter("all")}
                  >
                    Tutto
                  </button>
                  <button
                    className={`filter-btn ${galleryFilter === "food" ? "active" : ""}`}
                    data-filter="food"
                    type="button"
                    onClick={() => onGalleryFilter("food")}
                  >
                    Piatti
                  </button>
                  <button
                    className={`filter-btn ${galleryFilter === "location" ? "active" : ""}`}
                    data-filter="location"
                    type="button"
                    onClick={() => onGalleryFilter("location")}
                  >
                    Sala
                  </button>
                  <button
                    className={`filter-btn ${galleryFilter === "events" ? "active" : ""}`}
                    data-filter="events"
                    type="button"
                    onClick={() => onGalleryFilter("events")}
                  >
                    Eventi
                  </button>
                </div>
              </div>

              <div className="gallery-grid reveal-stagger">
                {filteredGallery.map((item, idx) => (
                  <div
                    key={`${item.title}-${idx}`}
                    className={`gallery-item stagger-item ${item.sizeClass ?? ""}`.trim()}
                    data-category={item.category}
                    style={{ ["--i" as any]: idx }}
                    onClick={() => openLightbox(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openLightbox(item);
                    }}
                  >
                    <img src={item.src} alt={item.alt} loading="lazy" />
                    <div className="gallery-overlay">
                      <div className="overlay-content">
                        <span className="overlay-tag">{item.tag}</span>
                        <h3>{item.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lightbox */}
            <div
              id="lightbox"
              className={`lightbox ${lightboxOpen ? "active" : ""}`}
              onClick={(e) => {
                if (e.target === e.currentTarget) closeLightbox();
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Anteprima immagine"
            >
              <button className="lightbox-close" type="button" onClick={closeLightbox} aria-label="Chiudi anteprima">
                &times;
              </button>
              <img src={lightboxSrc} alt={lightboxCaption || "Anteprima"} />
              <div className="lightbox-caption">{lightboxCaption}</div>
            </div>
          </section>

          {/* BLOCCO 5 · EVENTI PREMIUM (Editorial Style) */}
          <section id="eventi" className="ep-section reveal-on-scroll">
            <div className="ep-shell">
              <div className="ep-layout">
                {/* Lato Sinistro: Visual & Copy */}
                <div className="ep-visual">
                  <div className="ep-kicker">Eventi &amp; Private Parties</div>
                  <h2 className="ep-title">
                    Il tuo evento,<br />
                    <em>firmato Eden.</em>
                  </h2>
                  <p className="ep-desc">
                    Dalla mise en place sartoriale al menù degustazione personalizzato, ogni dettaglio è orchestrato con
                    estrema cura. Lascia che la pietra, le volte e la luce soffusa facciano da cornice ai tuoi momenti
                    indimenticabili.
                  </p>
                  <div className="ep-image-wrapper">
                    <img
                      src="https://images.pexels.com/photos/5638612/pexels-photo-5638612.jpeg?auto=compress&cs=tinysrgb&w=900"
                      alt="Dettaglio tavola Eden"
                      loading="lazy"
                    />
                    <div className="ep-image-overlay" />
                  </div>
                </div>

                {/* Lato Destro: Form Elegante */}
                <div className="ep-form-container">
                  <div className="ep-form-header">
                    <h3>Richiedi una consulenza</h3>
                    <p>Raccontaci la tua idea. Il nostro team ti risponderà con una proposta su misura.</p>
                  </div>

                  <form className="ep-form" id="eden-event-form" ref={eventFormRef}>
                    {/* Chips per la selezione evento */}
                    <div className="ep-chips-group">
                      <span className="ep-chips-label">Seleziona l'occasione</span>
                      <div className="ep-chips">
                        <label className="ep-chip">
                          <input type="radio" name="tipo" value="Compleanno" />
                          <span>Compleanno</span>
                        </label>
                        <label className="ep-chip">
                          <input type="radio" name="tipo" value="Laurea" />
                          <span>Laurea</span>
                        </label>
                        <label className="ep-chip">
                          <input type="radio" name="tipo" value="Matrimonio" />
                          <span>Matrimonio</span>
                        </label>
                        <label className="ep-chip">
                          <input type="radio" name="tipo" value="Cerimonia" />
                          <span>Cerimonia</span>
                        </label>
                        <label className="ep-chip">
                          <input type="radio" name="tipo" value="Altro" />
                          <span>Altro</span>
                        </label>
                      </div>
                    </div>

                    {/* Floating Label Inputs */}
                    <div className="ep-input-group">
                      <input type="text" id="ep-nome" className="ep-input" required />
                      <label htmlFor="ep-nome" className="ep-label">
                        Nome e Cognome
                      </label>
                      <div className="ep-line" />
                    </div>

                    <div className="ep-row">
                      <div className="ep-input-group">
                        <input type="tel" id="ep-tel" className="ep-input" required />
                        <label htmlFor="ep-tel" className="ep-label">
                          Telefono / WhatsApp
                        </label>
                        <div className="ep-line" />
                      </div>
                      <div className="ep-input-group">
                        <input type="number" id="ep-ospiti" className="ep-input" required />
                        <label htmlFor="ep-ospiti" className="ep-label">
                          N° Ospiti stimato
                        </label>
                        <div className="ep-line" />
                      </div>
                    </div>

                    <div className="ep-input-group">
                      <textarea id="ep-note" className="ep-input ep-textarea" required />
                      <label htmlFor="ep-note" className="ep-label">
                        Dettagli, desideri, intolleranze...
                      </label>
                      <div className="ep-line" />
                    </div>

                    <button type="button" className="ep-submit-btn" onClick={onEventSubmit}>
                      <span>Invia la richiesta</span>
                      <span className="ep-btn-arrow">→</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* BLOCCO 6 · SOCIAL PROOF & RECENSIONI */}
          <section id="recensioni" className="reviews-premium reveal-on-scroll">
            <div className="reviews-shell">
              <div className="reviews-header">
                <h2 className="reviews-title">
                  L&rsquo;eccellenza,<br />
                  <em>riconosciuta.</em>
                </h2>
                <div className="reviews-stats">
                  <div className="stat-item">
                    <span className="stat-val" data-target="4.5">
                      0
                    </span>
                    <span className="stat-lbl">Google (340+ Recensioni)</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <span className="stat-val" data-target="4.9">
                      0
                    </span>
                    <span className="stat-lbl">Facebook (270+ Recensioni)</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <span className="stat-val" data-target="8000" data-format="plain">
                      0
                    </span>
                    <span className="stat-lbl">Follower sui Social</span>
                  </div>
                </div>
              </div>

              <div className="reviews-grid">
                <div className="review-card">
                  <div className="rc-quote">“</div>
                  <p className="rc-text">
                    Sala elegante, atmosfera calda, servizio sempre presente ma mai invadente. Il posto perfetto per una
                    festa che resta nei ricordi di tutti.
                  </p>
                  <div className="rc-meta" aria-label="Valutazione">
                    <div className="rc-stars" aria-hidden="true">
                      ★★★★★
                    </div>
                    <div className="rc-badge">Cliente verificato</div>
                  </div>
                  <div className="rc-author">
                    <strong>Location da sogno</strong>
                    <span>Evento privato in sala</span>
                  </div>
                </div>
                <div className="review-card">
                  <div className="rc-quote">“</div>
                  <p className="rc-text">
                    Dalla scelta dei piatti al brindisi finale, Miriam e lo staff ci hanno seguito con estrema attenzione.
                    Piatti curati, porzioni giuste, tempi perfetti.
                  </p>
                  <div className="rc-meta" aria-label="Valutazione">
                    <div className="rc-stars" aria-hidden="true">
                      ★★★★★
                    </div>
                    <div className="rc-badge">Cliente verificato</div>
                  </div>
                  <div className="rc-author">
                    <strong>Cucina e accoglienza</strong>
                    <span>Cena tra amici</span>
                  </div>
                </div>
                <div className="review-card">
                  <div className="rc-quote">“</div>
                  <p className="rc-text">
                    Abbiamo gestito tutto in anticipo. La sera dell'evento era già tutto pronto, senza imprevisti e con una
                    magia unica per la nostra laurea.
                  </p>
                  <div className="rc-meta" aria-label="Valutazione">
                    <div className="rc-stars" aria-hidden="true">
                      ★★★★★
                    </div>
                    <div className="rc-badge">Cliente verificato</div>
                  </div>
                  <div className="rc-author">
                    <strong>Festa impeccabile</strong>
                    <span>Festa di Laurea</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BLOCCO 7 · CONTATTI */}
          <section id="contatti" className="contact-premium reveal-on-scroll">
            <div className="contact-shell">
              <div className="contact-grid">
                <div className="contact-info">
                  <h2 className="contact-title">
                    Ti aspettiamo<br />
                    <em>all&rsquo;Eden.</em>
                  </h2>
                  <div className="contact-list">
                    <div className="c-item">
                      <span className="c-lbl">Indirizzo</span>
                      <span className="c-val">
                        Via Santa Maria della Stella, 66
                        <br />
                        70010 Adelfia (BA)
                      </span>
                    </div>
                    <div className="c-item">
                      <span className="c-lbl">Prenotazioni</span>
                      <span className="c-val">
                        <a href="tel:+390805248160">080 524 8160</a>
                        <br />
                        <a href="https://wa.me/393497152524" target="_blank" rel="noreferrer">
                          349 715 2524 (WhatsApp)
                        </a>
                      </span>
                    </div>
                    <div className="c-item">
                      <span className="c-lbl">Orari</span>
                      <span className="c-val">
                        Lunedì - Domenica: 06:30 – 01:00
                        <br />
                        <em className="c-closed">Mercoledì chiuso</em>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="contact-map">
                  <div className="directions-card" aria-label="Indicazioni per EDEN">
                    <div className="directions-top">
                      <div>
                        <div className="directions-kicker">Indicazioni</div>
                        <div className="directions-title">Raggiungi Eden</div>
                      </div>
                      <div className="directions-chip">Adelfia (BA)</div>
                    </div>

                    <div className="directions-address">
                      Via Santa Maria della Stella, 66
                      <span>70010 Adelfia (BA)</span>
                    </div>

                    <div className="directions-actions">
                      <a
                        className="eden-btn eden-btn-primary"
                        href="https://www.google.com/maps/search/?api=1&query=Via%20Santa%20Maria%20della%20Stella%2066%20Adelfia"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Apri Maps
                      </a>
                      <button className="eden-btn eden-btn-ghost" type="button" onClick={handleCopyAddress}>
                        Copia indirizzo
                      </button>
                    </div>

                    <div className="directions-mini">
                      <a className="mini-link" href="tel:+390805248160">
                        Chiama
                      </a>
                      <span className="mini-dot" aria-hidden="true" />
                      <a className="mini-link" href="https://wa.me/393497152524" target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {miniToast ? (
              <div className="mini-toast" role="status">
                {miniToast}
              </div>
            ) : null}
          </section>

          {/* BLOCCO 8 · FOOTER (grid + legal + policy modal) */}
          <footer className="footer-premium">
            <div className="footer-shell">
              <div className="f-grid">
                <div className="f-col">
                  <div className="f-brand">EDEN</div>
                  <p className="f-desc">Food · Wine · Restaurant. Un Eden contemporaneo nel cuore della Puglia.</p>
                </div>

                <div className="f-col">
                  <div className="f-col-title">Sezioni</div>
                  <div className="f-links f-links-col">
                    <a href="#eden">L'esperienza</a>
                    <a href="#cucina">Cucina</a>
                    <a href="#gallery">Galleria</a>
                    <a href="#eventi">Eventi</a>
                    <a href="#recensioni">Recensioni</a>
                    <a href="#contatti">Contatti</a>
                  </div>
                </div>

                <div className="f-col">
                  <div className="f-col-title">Contatti</div>
                  <div className="f-links f-links-col">
                    <a href="tel:+390805248160">080 524 8160</a>
                    <a href="https://wa.me/393497152524" target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Via%20Santa%20Maria%20della%20Stella%2066%20Adelfia"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Indicazioni
                    </a>
                  </div>
                </div>
              </div>

              <div className="f-legal">
                <div>
                  &copy; <span id="current-year">{year}</span> EDEN food.wine.restaurant. Tutti i diritti riservati.
                </div>
                <div className="f-legal-links">
                  <button
                    type="button"
                    className="f-legal-btn"
                    onClick={(e) => {
                      lastPolicyTriggerRef.current = e.currentTarget;
                      setPolicyOpen(true);
                    }}
                  >
                    Privacy &amp; Cookie
                  </button>
                  <span className="f-legal-sep" aria-hidden="true">
                    ·
                  </span>
                  <span>
                    Design by <strong>Giovanni Macina</strong>
                  </span>
                </div>
              </div>
            </div>
          </footer>

          {/* FAB DOCK */}
          <div className="fab-dock" aria-label="Azioni rapide">
            <a className="fab-btn" href="https://wa.me/393497152524" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a className="fab-btn" href="tel:+390805248160">
              Chiama
            </a>
            <a
              className="fab-btn fab-btn-primary"
              href="https://www.google.com/maps/search/?api=1&query=Via%20Santa%20Maria%20della%20Stella%2066%20Adelfia"
              target="_blank"
              rel="noreferrer"
            >
              Indicazioni
            </a>
          </div>

          {/* POLICY MODAL */}
          <div
            className={`policy-modal ${policyOpen ? "open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Privacy e Cookie"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setPolicyOpen(false);
                window.setTimeout(() => lastPolicyTriggerRef.current?.focus(), 0);
              }
            }}
          >
            <div className="policy-card">
              <div className="policy-head">
                <div>
                  <div className="policy-kicker">Policy</div>
                  <div className="policy-title">Privacy &amp; Cookie</div>
                </div>
                <button
                  type="button"
                  className="policy-close"
                  onClick={() => {
                    setPolicyOpen(false);
                    window.setTimeout(() => lastPolicyTriggerRef.current?.focus(), 0);
                  }}
                  aria-label="Chiudi"
                >
                  ×
                </button>
              </div>
              <div className="policy-body">
                <p>
                  Contenuto placeholder (come nel sorgente GitHub). Qui potrai inserire testo completo di Privacy Policy,
                  Cookie Policy e dettagli legali.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

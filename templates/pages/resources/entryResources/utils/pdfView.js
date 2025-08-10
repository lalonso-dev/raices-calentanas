const pdfView = function (ufile = "", container = null) {
  if (!ufile || !container) return;

  const url = atob(ufile);

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

  //const container = document.getElementById("pdf-view;

  const PRELOAD_MARGIN = "800px";
  const MAX_SCALE = 2;
  const WATERMARK_TEXT = "RAÍCES CALENTANAS";
  const pages = new Map();

  const drawWatermark = (ctx, w, h) => {
    if (!WATERMARK_TEXT) return;
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(WATERMARK_TEXT, 0, 0);
    ctx.restore();
  };

  const getTargetScale = (page) => {
    const viewport1 = page.getViewport({ scale: 1 });
    const targetCSSWidth = container.clientWidth || 800;
    const cssScale = targetCSSWidth / viewport1.width;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_SCALE);
    return cssScale * dpr;
  };

  const renderPage = async (pdf, pageNum, force = false) => {
    const slot = document.querySelector(`[data-pdf-page="${pageNum}"]`);
    if (!slot) return;

    const state = pages.get(pageNum) || { rendered: false, scale: 1 };
    if (state.rendered && !force) return;

    const page = await pdf.getPage(pageNum);
    const scale = getTargetScale(page);
    if (!force && state.rendered && Math.abs(state.scale - scale) < 0.05) {
      return;
    }

    slot.innerHTML = "";

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = canvas.width / (window.devicePixelRatio || 1) + "px";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto 16px";

    slot.appendChild(canvas);

    await page.render({ canvasContext: ctx, viewport }).promise;

    drawWatermark(ctx, canvas.width, canvas.height);

    pages.set(pageNum, { rendered: true, scale });
  };

  const createPageSlot = (pageNum) => {
    const slot = document.createElement("div");
    slot.dataset.pdfPage = pageNum;
    slot.setAttribute("role", "img");
    slot.setAttribute("aria-label", "Página " + pageNum);
    slot.style.minHeight = "120px";
    slot.style.marginBottom = "16px";
    return slot;
  };

  const setupObserver = (pdf) => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const pageNum = parseInt(e.target.dataset.pdfPage, 10);
            renderPage(pdf, pageNum);
          }
        });
      },
      { root: null, rootMargin: PRELOAD_MARGIN, threshold: 0.01 },
    );

    document
      .querySelectorAll("[data-pdf-page]")
      .forEach((el) => io.observe(el));

    let rid;
    const onResize = () => {
      cancelAnimationFrame(rid);
      rid = requestAnimationFrame(() => {
        document.querySelectorAll("[data-pdf-page]").forEach(async (el) => {
          const rect = el.getBoundingClientRect();
          const visible =
            rect.bottom > 0 &&
            rect.top <
              (window.innerHeight || document.documentElement.clientHeight);
          if (visible) {
            const pageNum = parseInt(el.dataset.pdfPage, 10);
            renderPage(pdf, pageNum, /*force*/ true);
          }
        });
      });
    };
    window.addEventListener("resize", onResize);
  };

  // Config
  const ZOOM_STEP = 0.15;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2.0;
  let ZOOM_VAL = 1.0;

  // Asegura scroll horizontal si el zoom excede el ancho
  container.style.overflowX = container.style.overflowX || "auto";

  // Aplica zoom visual a todos los canvas ya renderizados
  const applyZoomToCanvases = () => {
    const canvases = container.querySelectorAll("[data-pdf-page] canvas");
    canvases.forEach((cv) => {
      cv.style.transformOrigin = "top left";
      cv.style.transform = `scale(${ZOOM_VAL})`;
    });
  };

  // Observa nuevos canvas que se agreguen para aplicarles zoom de inmediato
  const mo = new MutationObserver((muts) => {
    muts.forEach((m) => {
      m.addedNodes.forEach((n) => {
        if (n.nodeName === "CANVAS") {
          n.style.transformOrigin = "top left";
          n.style.transform = `scale(${ZOOM_VAL})`;
        } else if (n.querySelectorAll) {
          n.querySelectorAll("canvas").forEach((cv) => {
            cv.style.transformOrigin = "top left";
            cv.style.transform = `scale(${ZOOM_VAL})`;
          });
        }
      });
    });
  });
  mo.observe(container, { childList: true, subtree: true });

  // API pública en el contenedor (opcional)
  container.pdfZoomIn = () => {
    ZOOM_VAL = Math.min(ZOOM_MAX, ZOOM_VAL + ZOOM_STEP);
    applyZoomToCanvases();
  };
  container.pdfZoomOut = () => {
    ZOOM_VAL = Math.max(ZOOM_MIN, ZOOM_VAL - ZOOM_STEP);
    applyZoomToCanvases();
  };
  container.pdfZoomReset = () => {
    ZOOM_VAL = 1.0;
    applyZoomToCanvases();
  };
  container.getPdfZoom = () => ZOOM_VAL;
  /* ======== /Zoom (añadido) ======== */

  pdfjsLib.getDocument(url).promise.then(async (pdf) => {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      container.appendChild(createPageSlot(pageNum));
      pages.set(pageNum, { rendered: false, scale: 1 });
    }
    setupObserver(pdf);
  });
};

export default pdfView;

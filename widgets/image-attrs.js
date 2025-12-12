function applyScaledSize(img) {
  const raw = img.getAttribute('data-sbs-scale');
  if (!raw) return;
  const scale = Number.parseFloat(raw);
  if (!Number.isFinite(scale) || scale <= 0) return;

  const setSize = () => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
  };

  if (img.complete) {
    setSize();
    return;
  }

  img.addEventListener('load', setSize, { once: true });
}

function init() {
  document.querySelectorAll('img[data-sbs-scale]').forEach(applyScaledSize);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

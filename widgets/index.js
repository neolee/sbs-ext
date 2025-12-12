const WIDGET_MODULES = [
    { selector: 'sbs-bridge', module: './bridge/index.js' },
    { selector: 'sbs-chess', module: './chess/index.js' },
];

const loaded = new Set();

function maybeLoadWidgets() {
    for (const { selector, module } of WIDGET_MODULES) {
        if (loaded.has(module)) continue;
        if (!document.querySelector(selector)) continue;
        loaded.add(module);
        import(module).catch((error) => {
            loaded.delete(module);
            console.error(`[sbs-ext] Failed to load ${module}`, error);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        maybeLoadWidgets();
    });
} else {
    maybeLoadWidgets();
}

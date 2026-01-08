import { ChessWidget } from './chess-widget.js';
import { createLightDomObserver, extractLightDomPayload } from '../shared/lightdom.js';

const styles = `
:host {
    --chess-bg: var(--sbs-page-bg);
    --chess-border: var(--panel-muted);
    --panel-bg: var(--sbs-page-bg);
    --panel-muted: var(--sbs-muted-color, #708090);
    --panel-heading: var(--sbs-text-color, currentColor);
    --square-light: #f0d9b5;
    --square-dark: #b58863;
    --square-highlight: #f6f669;
    --move-highlight: #2563eb;
    --board-size: 480px;
    display: block;
    font-family: var(--sbs-font-body);
    color: var(--sbs-text-color);
}

:host([hidden]) {
    display: none;
}

:host([data-theme="classic"]) {
    --square-light: #ede0ce;
    --square-dark: #6b4f2f;
}

.widget-container {
    position: relative;
}

.sbs-chess-widget {
    --board-size: var(--board-size, 480px);
    background: var(--panel-bg);
    border: 1px solid var(--chess-border);
    border-radius: 16px;
    padding: 1.25rem;
    display: grid;
    grid-template-columns: auto minmax(220px, 1fr);
    gap: 1.5rem;
    align-items: start;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
    position: relative;
}

.sbs-chess-widget.mini {
    grid-template-columns: 1fr;
    padding: 0.75rem;
    max-width: calc(var(--board-size) + 2.5rem);
}

.sbs-chess-widget.mini .sidebar,
.sbs-chess-widget.mini header,
.sbs-chess-widget.mini .upcoming-note {
    display: none !important;
}

.sbs-chess-widget.mini .board-shell {
    margin: 0 auto;
}

.sbs-chess-widget[data-orientation="black"] .file-labels {
    flex-direction: row-reverse;
}

.sbs-chess-widget header {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid var(--chess-border);
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
}

.sbs-chess-widget header h3 {
    margin: 0;
    font-size: 1.1rem;
}

.header-stack {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.game-summary {
    margin: 0;
    font-size: 0.8rem;
    color: var(--panel-muted);
}

.status-pill {
    font-size: 0.85rem;
    color: #16a34a;
    border: 1px solid rgba(22, 163, 74, 0.3);
    padding: 0.15rem 0.65rem;
    border-radius: 999px;
}

.board-shell {
    display: inline-grid;
    grid-template-columns: auto var(--board-size);
    grid-template-rows: var(--board-size) auto;
    column-gap: 0.35rem;
    row-gap: 0.35rem;
    align-items: center;
    justify-content: center;
    align-self: start;
    position: relative;
}

.board-grid {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    grid-template-rows: repeat(8, minmax(0, 1fr));
    width: var(--board-size);
    height: var(--board-size);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--panel-heading);
}

.board-coords {
    font-size: clamp(0.55rem, calc(var(--board-size) / 24), 1.15rem);
    color: var(--panel-muted);
    letter-spacing: 0.02em;
}

.file-labels {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    display: flex;
    justify-content: space-between;
    width: var(--board-size);
}

.rank-labels {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: var(--board-size);
}

.board-coords span {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
}

.square {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    min-width: 0;
    min-height: 0;
    font-size: calc(var(--board-size) / 8 * 0.78);
    transition: background 120ms ease;
}

.square.interactive {
    cursor: pointer;
}

.square.light { background: var(--square-light); }
.square.dark { background: var(--square-dark); }

.square.changed {
    box-shadow: inset 0 0 0 3px rgba(37, 99, 235, 0.35);
}

.square.selected::after {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    border: 2px solid rgba(59, 130, 246, 0.8);
    pointer-events: none;
}

.square.target::after {
    content: '';
    position: absolute;
    width: 22%;
    height: 22%;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.85);
    pointer-events: none;
}

.square.target-capture::after {
    width: 65%;
    height: 65%;
    border: 3px solid rgba(37, 99, 235, 0.9);
    background: transparent;
}

.square.recent-move {
    box-shadow: inset 0 0 0 3px rgba(16, 185, 129, 0.5);
}

.square .piece {
    pointer-events: none;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.sidebar {
    background: var(--panel-bg);
    border-radius: 12px;
    border: 1px solid var(--chess-border);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.sidebar h4 {
    margin: 0 0 0.35rem;
    font-size: 1rem;
    color: var(--panel-heading);
}

.board-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    font-size: 0.9rem;
}

.meta-item {
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    border: 1px solid var(--chess-border);
    border-radius: 10px;
    background: var(--panel-bg);
}

.meta-label {
    color: var(--panel-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.meta-value {
    font-size: 0.95rem;
    font-weight: 600;
}

.controls {
    display: flex;
    gap: 0.35rem;
}

.controls button {
    flex: 1;
    border: 1px solid var(--chess-border);
    background: var(--panel-bg);
    padding: 0.35rem 0.5rem;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 120ms ease, transform 120ms ease;
}

.controls button:hover:enabled {
    background: rgba(37, 99, 235, 0.08);
}

.controls button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.move-list {
    border: 1px solid var(--chess-border);
    border-radius: 10px;
    background: var(--panel-bg);
    padding: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
}

.move-list ol {
    margin: 0;
    padding-left: 1.2rem;
}

.move-list li {
    margin: 0.25rem 0;
    line-height: 1.4;
}

.move-list li.active {
    color: var(--move-highlight);
    font-weight: 600;
}

.status-block {
    border: 1px solid var(--chess-border);
    border-radius: 10px;
    background: var(--panel-bg);
    padding: 0.85rem;
    font-size: 0.9rem;
    color: var(--panel-heading);
}

.capture-panel {
    border: 1px solid var(--chess-border);
    border-radius: 10px;
    background: var(--panel-bg);
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.capture-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
}

.capture-label {
    color: var(--panel-muted);
    font-size: 0.85rem;
}

.capture-pieces {
    flex: 1;
    text-align: right;
    font-size: 1rem;
}

.notation-panel {
    border: 1px solid var(--chess-border);
    border-radius: 10px;
    background: var(--panel-bg);
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
}

.notation-block {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.notation-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--panel-heading);
    gap: 0.5rem;
}

.copy-button {
    border: 1px solid var(--chess-border);
    border-radius: 8px;
    background: var(--panel-bg);
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 120ms ease;
}

.copy-button:hover:enabled {
    background: rgba(37, 99, 235, 0.12);
}

.copy-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.notation-field {
    margin: 0;
    font-family: monospace;
    font-size: 0.8rem;
    line-height: 1.4;
    border: 1px solid var(--chess-border);
    border-radius: 8px;
    padding: 0.5rem;
    max-height: 110px;
    overflow: auto;
    background: var(--panel-bg);
    white-space: pre-wrap;
    word-break: break-word;
}

.upcoming-note {
    border-top: 1px solid var(--chess-border);
    padding-top: 0.75rem;
    font-size: 0.85rem;
    color: var(--panel-muted);
}

.upcoming-note ul {
    margin: 0.35rem 0 0 1.1rem;
    padding: 0;
    list-style: disc;
}

.sbs-chess-widget.error {
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #f87171;
    background: #fef2f2;
    color: #991b1b;
}

.promotion-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.promotion-dialog {
    background: var(--panel-bg);
    border-radius: 14px;
    padding: 1rem 1.25rem;
    max-width: 260px;
    text-align: center;
    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.3);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.promotion-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
}

.promotion-options button,
.promotion-cancel {
    border: 1px solid var(--chess-border);
    border-radius: 10px;
    padding: 0.45rem 0.5rem;
    background: var(--panel-bg);
    cursor: pointer;
    font-size: 0.9rem;
}

.promotion-options button:hover,
.promotion-cancel:hover {
    background: rgba(37, 99, 235, 0.1);
}

.promotion-cancel {
    margin-top: 0.25rem;
}

@media (max-width: 900px) {
    .sbs-chess-widget {
        grid-template-columns: 1fr;
    }

    .board-shell {
        margin: 0 auto;
    }
}
`;

const template = document.createElement('template');
template.innerHTML = `<style>${styles}</style><div class="widget-container"></div>`;

export class SBSChessDiagram extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'fen', 'pgn', 'interactive', 'orientation', 'size', 'layout', 'coords', 'lang'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._container = this.shadowRoot.querySelector('.widget-container');
        this._widget = null;
        this._explicitConfig = null;
        this._cachedPgn = undefined;
        this._observer = createLightDomObserver(this, {
            shouldHandleMutation: () => !this._explicitConfig || typeof this._explicitConfig.pgn === 'undefined',
            onMutation: () => {
                this._cachedPgn = undefined;
                this._applyConfig();
            }
        });
    }

    connectedCallback() {
        this._observer.connect();
        this._applyConfig();
    }

    disconnectedCallback() {
        this._observer.disconnect();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === 'lang' && this._widget) {
            this._widget.setLanguage(this.lang);
        }
        this._applyConfig();
    }

    set config(value) {
        this._explicitConfig = value ? { ...value } : null;
        this._applyConfig();
    }

    get config() {
        return { ...this._collectAttributeConfig(), ...(this._explicitConfig || {}) };
    }

    updateConfig(patch = {}) {
        this._explicitConfig = { ...(this._explicitConfig || {}), ...patch };
        this._applyConfig();
    }

    setBoardSize(size, options) {
        if (this._widget) {
            this._widget.setBoardSize(size, options);
        }
    }

    get widget() {
        return this._widget;
    }

    get lang() {
        return this.getAttribute('lang') || 'zh';
    }

    _applyConfig() {
        if (!this.isConnected || !this._container) return;
        const config = this._collectConfig();
        if (!this._widget) {
            this._widget = new ChessWidget(this._container, config);
        } else {
            this._widget.applyConfig(config);
        }
        if (config.lang) {
            this._widget.setLanguage(config.lang);
        }
    }

    _collectConfig() {
        const attrConfig = this._collectAttributeConfig();
        const explicit = this._explicitConfig || {};
        const merged = { ...attrConfig, ...explicit };
        if (!merged.lang) {
            merged.lang = this.lang;
        }
        if (typeof merged.pgn === 'undefined') {
            merged.pgn = this._resolvePgn();
        }
        if (typeof merged.fen === 'undefined') {
            const fenAttr = this.getAttribute('fen');
            if (fenAttr) merged.fen = fenAttr;
        }
        return merged;
    }

    _collectAttributeConfig() {
        const config = {};
        const attrMap = {
            title: 'title',
            fen: 'fen',
            layout: 'layout',
            orientation: 'orientation',
            lang: 'lang'
        };

        Object.entries(attrMap).forEach(([key, attr]) => {
            const value = this.getAttribute(attr);
            if (value) {
                config[key] = value;
            }
        });

        const size = this._parseNumberAttr('size');
        if (typeof size === 'number') {
            config.size = size;
        }

        const interactive = this._parseBooleanAttr('interactive');
        if (typeof interactive === 'boolean') {
            config.interactive = interactive;
        }

        const coords = this._parseBooleanAttr('coords');
        if (typeof coords === 'boolean') {
            config.coords = coords;
        }

        const attrPgn = this.getAttribute('pgn') || this.getAttribute('data-pgn');
        if (attrPgn) {
            config.pgn = attrPgn;
        }

        return config;
    }

    _resolvePgn() {
        if (this._explicitConfig && typeof this._explicitConfig.pgn !== 'undefined') {
            return this._explicitConfig.pgn;
        }
        const attrPgn = this.getAttribute('pgn') || this.getAttribute('data-pgn');
        if (attrPgn) {
            return attrPgn;
        }
        if (this._cachedPgn !== undefined) {
            return this._cachedPgn;
        }
        const extracted = this._extractPgnFromLightDom();
        this._cachedPgn = extracted || null;
        return this._cachedPgn;
    }

    _parseBooleanAttr(name) {
        if (!this.hasAttribute(name)) return undefined;
        const value = this.getAttribute(name);
        if (value === null || value === '') return true;
        return !/^(false|0|no)$/i.test(value.trim());
    }

    _parseNumberAttr(name) {
        const raw = this.getAttribute(name);
        if (raw === null) return undefined;
        const value = Number(raw);
        return Number.isNaN(value) ? undefined : value;
    }

    _extractPgnFromLightDom() {
        return extractLightDomPayload(this, {
            scriptType: 'application/x-chess-pgn',
            templateType: 'pgn',
            fallbackToTextContent: false
        });
    }
}

if (!customElements.get('sbs-chess')) {
    customElements.define('sbs-chess', SBSChessDiagram);
}

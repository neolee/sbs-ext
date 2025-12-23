import { GoController } from './go-widget.js';
import { createLightDomObserver, extractLightDomPayload } from '../shared/lightdom.js';

const styles = `
:host {
    --go-bg: var(--sbs-page-bg, #fdfdfd);
    --go-border: var(--sbs-muted-color, #eee);
    --panel-bg: var(--sbs-page-bg, #fdfdfd);
    --panel-muted: var(--sbs-muted-color, #708090);
    --panel-heading: var(--sbs-text-color, currentColor);
    display: inline-block;
    font-family: var(--sbs-font-body, sans-serif);
    color: var(--sbs-text-color, #333);
}

:host([hidden]) {
    display: none;
}

.go-widget-container {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid var(--go-border);
    border-radius: 4px;
    background: var(--go-bg);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.board-container {
    width: 100%;
    max-width: 100%;
}

.go-controls {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 0.25rem;
}

.go-controls:empty {
    display: none;
}

.go-controls button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 1.8rem;
    padding: 0;
    cursor: pointer;
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 4px;
    font-size: 1.1rem;
    line-height: 1;
    transition: all 0.2s;
}

.go-controls button[data-action="prev"],
.go-controls button[data-action="next"] {
    font-size: 0.85rem;
}

.go-controls button:hover {
    background: #f0f0f0;
    border-color: #999;
}

.move-info {
    font-size: 0.85rem;
    color: #666;
    margin-left: 0.75rem;
    font-variant-numeric: tabular-nums;
    min-width: 6rem;
}

/* SVG Styles */
.sbs-go-board {
    width: 100%;
    height: auto;
    display: block;
}

.sbs-go-board .board-bg {
    fill: #f4d0a0;
}

.sbs-go-board .grid line {
    stroke: #333;
    stroke-width: 0.15;
}

.sbs-go-board .star-point {
    fill: #333;
}

.sbs-go-board .coords text {
    fill: #666;
    font-family: var(--sbs-font-body, sans-serif);
}

.sbs-go-board .stone.black {
    fill: #000;
}

.sbs-go-board .stone.white {
    fill: #fff;
    stroke: #ccc;
    stroke-width: 0.1;
}

/* Theme: Book (Print style) */
.sbs-go-board.theme-book .board-bg {
    fill: #fff;
}

.sbs-go-board.theme-book .grid line {
    stroke: #000;
    stroke-width: 0.1;
}

.sbs-go-board.theme-book .stone.white {
    stroke: #000;
    stroke-width: 0.15;
}

/* Theme: Classic */
.sbs-go-board.theme-classic .board-bg {
    fill: #e6b37e;
}

.sbs-go-board.theme-classic .grid line {
    stroke: #443322;
    stroke-width: 0.15;
}

.sbs-go-board.theme-classic .star-point {
    fill: #333333;
}

.sbs-go-board.theme-classic .coords text {
    fill: #443322;
}

.sbs-go-board.theme-classic .stone.black {
    fill: #111111;
    filter: drop-shadow(0.5px 0.5px 0.5px rgba(0,0,0,0.5));
}

.sbs-go-board.theme-classic .stone.white {
    fill: #f0f0f0;
    filter: drop-shadow(0.5px 0.5px 0.5px rgba(0,0,0,0.3));
}

.marker text {
    font-weight: bold;
    pointer-events: none;
}
`;

export class SBSGoDiagram extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._controller = null;
        this._observer = null;
    }

    connectedCallback() {
        this.render();
        this._observer = createLightDomObserver(this, {
            onMutation: () => this.updateFromLightDom()
        });
        this._observer.connect();
        this.updateFromLightDom();
    }

    disconnectedCallback() {
        if (this._observer) {
            this._observer.disconnect();
        }
    }

    render() {
        const styleTag = document.createElement('style');
        styleTag.textContent = styles;

        const container = document.createElement('div');
        container.className = 'go-widget-container';
        container.innerHTML = `
            <div class="board-container"></div>
            <div class="go-controls"></div>
        `;

        this.shadowRoot.replaceChildren(styleTag, container);
    }

    updateFromLightDom() {
        const payload = extractLightDomPayload(this, { scriptType: 'text/sgf' });
        if (!payload) return;

        this.render();
        const container = this.shadowRoot.querySelector('.go-widget-container');
        const initialMoveAttr = this.getAttribute('initial-move') || this.getAttribute('move');
        const options = {
            size: parseInt(this.getAttribute('size')) || 19,
            theme: this.getAttribute('theme') || 'book',
            interactive: this.hasAttribute('interactive'),
            showCoords: this.getAttribute('coords') !== 'false',
            showMoveNumbers: this.parseMoveNumbers(this.getAttribute('show-move-numbers')),
            initialMove: initialMoveAttr !== null ? parseInt(initialMoveAttr) : -1,
            lang: this.getAttribute('lang') || (document.documentElement.lang === 'zh' ? 'zh' : 'en'),
            width: this.getAttribute('width') || null
        };

        if (this._controller) {
            // Re-init if needed or just load new SGF
            // For simplicity, we re-create the controller if options change significantly
            // but here we'll just re-init for now.
        }

        this._controller = new GoController(container, options);
        this._controller.loadSGF(payload);
    }

    parseMoveNumbers(attr) {
        if (attr === null || attr === undefined) return false;
        if (attr === 'true' || attr === '') return true;
        if (attr === 'false') return false;
        const num = parseInt(attr);
        return isNaN(num) ? false : num;
    }
}

if (!customElements.get('sbs-go')) {
    customElements.define('sbs-go', SBSGoDiagram);
}

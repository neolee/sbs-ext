import { BridgeWidget } from './bridge-widget.js';
import { createLightDomObserver, extractLightDomPayload, normalizeAttributeEscapes } from '../shared/lightdom.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
    --bridge-bg-color: var(--sbs-page-bg);
    --bridge-border-color: var(--bridge-muted-color);
    --bridge-text-color: var(--sbs-text-color);
    --bridge-muted-color: var(--sbs-muted-color);
    --suit-spade-color: currentColor;
    --suit-heart-color: #d00;
    --suit-diamond-color: #d60;
    --suit-club-color: currentColor;
    --table-bg-color: #35654d;
    --card-bg-color: var(--sbs-page-bg);
    display: inline-block;
    font-family: var(--sbs-font-body);
    color: var(--bridge-text-color);
}

.sbs-bridge-widget {
    width: fit-content;
    margin: 20px auto;
    border: 1px solid var(--bridge-border-color);
    border-radius: 8px;
    background-color: var(--bridge-bg-color);
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    color: var(--bridge-text-color);
}

.bridge-error {
    font-size: 0.9em;
    color: #b00020;
}

.bridge-meta-header {
    font-size: 0.8em;
    color: var(--bridge-muted-color);
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--bridge-border-color);
    display: flex;
    gap: 15px;
    justify-content: center;
}

.bridge-table {
    --hand-column-width: auto;
    --center-column-width: 160px;
    --hand-block-height: auto;
    display: grid;
    grid-template-columns:
        var(--hand-column-width, auto)
        minmax(var(--center-column-width, 160px), auto)
        var(--hand-column-width, auto);
    grid-auto-rows: auto;
    gap: 10px 16px;
    justify-content: center;
    align-items: center;
    justify-items: center;
}

.hand-slot {
    width: var(--hand-column-width, auto);
    display: flex;
    justify-content: center;
    justify-self: center;
}

.hand-slot-north {
    grid-area: north;
    align-self: end;
}

.hand-slot-south {
    grid-area: south;
    align-self: start;
}

.hand-slot-west {
    grid-area: west;
    align-self: center;
}

.hand-slot-east {
    grid-area: east;
    align-self: center;
}

.hand {
    background: var(--card-bg-color);
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--bridge-border-color);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    font-size: 0.95em;
    width: 100%;
    box-sizing: border-box;
    min-height: var(--hand-block-height, auto);
}

.bidding-section {
    grid-column: 1 / -1;
    background: var(--card-bg-color);
    border: 1px solid var(--bridge-border-color);
    border-radius: 4px;
    padding: 8px;
    font-size: 0.9em;
    box-sizing: border-box;
    width: min(100%, 380px);
    justify-self: center;
}

.hand-label {
    font-weight: bold;
    text-align: center;
    margin-bottom: 4px;
    text-transform: uppercase;
    font-size: 0.75em;
    color: var(--bridge-muted-color);
}

.hand-suits {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 2px;
}

.suit-row {
    display: flex;
    align-items: center;
    line-height: 1.2;
}

.suit-symbol {
    width: 16px;
    font-weight: bold;
    text-align: center;
    margin-right: 4px;
    font-size: 0.9em;
}

.suit-cards {
    font-family: monospace;
    font-size: 1em;
    letter-spacing: 0.5px;
}

.suit-S { color: var(--suit-spade-color); }
.suit-H { color: var(--suit-heart-color); }
.suit-D { color: var(--suit-diamond-color); }
.suit-C { color: var(--suit-club-color); }

.table-center {
    grid-area: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--table-bg-color);
    color: white;
    border-radius: 6px;
    padding: 6px;
    font-size: 0.8em;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
    width: var(--center-column-width, 160px);
    min-height: 110px;
    justify-self: center;
    align-self: center;
}

.center-info-row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 1px;
}

.center-label {
    opacity: 0.8;
    margin-right: 4px;
}

.center-value {
    font-weight: bold;
}

.contract-display {
    font-size: 1.4em;
    font-weight: bold;
    margin: 6px 0;
    padding: 6px 12px;
    background: var(--bridge-bg-color);
    color: var(--bridge-text-color);
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    line-height: 1.1;
    max-width: 110px;
}

.contract-display span {
    font-size: 1.3em;
    vertical-align: -0.03em;
    margin-left: 2px;
}

.bidding-title {
    font-size: 0.9em;
    font-weight: bold;
    margin-bottom: 8px;
    text-align: center;
    color: var(--bridge-text-color);
    text-transform: uppercase;
}

.bidding-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: 0.85em;
}

.bidding-table th {
    background-color: var(--bridge-bg-color);
    padding: 4px;
    border-bottom: 1px solid var(--bridge-border-color);
    color: var(--bridge-muted-color);
    font-weight: 600;
}

.bidding-table td {
    padding: 4px;
    border-bottom: 1px solid var(--bridge-border-color);
}

.bidding-table tbody tr:last-child td {
    border-bottom: none;
}

.lead-block {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    font-size: 0.9em;
    background: none;
    border: none;
    padding: 0;
    box-shadow: none;
}

.lead-section {
    position: relative;
    align-self: center;
    justify-self: center;
    text-align: center;
}

.lead-section[data-align="top"] {
    align-self: start;
    transform: translateY(calc(-1 * var(--hand-block-height, 0px) / 2 + 30px));
}

.lead-value span {
    font-size: 1.3em;
    vertical-align: -0.03em;
    margin-right: 2px;
}

/* Layout variants */
:host([layout="compact"]) .bridge-meta-header,
:host([layout="mini"]) .bridge-meta-header {
    display: none;
}

:host([layout="mini"]) .bidding-section,
:host([layout="mini"]) .lead-section {
    display: none;
}
</style>
<div class="sbs-bridge-widget" part="container"></div>
`;

export class SBSBridgeDiagram extends HTMLElement {
    static get observedAttributes() {
        return ['lang', 'data-pbn', 'layout'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._container = this.shadowRoot.querySelector('.sbs-bridge-widget');
        this._widget = new BridgeWidget(this._container, { lang: this.lang });
        this._explicitData = null;
        this._attributeData = null;
        this._cachedLightDomData = null;
        this._observer = createLightDomObserver(this, {
            shouldHandleMutation: () => !this._explicitData && !this._attributeData,
            onMutation: () => {
                this._cachedLightDomData = null;
                this._render();
            }
        });
    }

    connectedCallback() {
        this._widget.connect?.();
        this._observer.connect();
        this._render();
    }

    disconnectedCallback() {
        this._observer.disconnect();
        this._widget.disconnect?.();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        if (name === 'lang') {
            this._widget.setLanguage(this.lang);
        } else if (name === 'data-pbn') {
            this._attributeData = newValue ? this._normalizeAttributeData(newValue) : null;
            this._render();
        }
    }

    set data(value) {
        this._explicitData = value;
        this._render();
    }

    get data() {
        if (this._explicitData) return this._explicitData;
        if (this._attributeData) return this._attributeData;
        if (!this._cachedLightDomData) {
            this._cachedLightDomData = this._extractLightDomData();
        }
        return this._cachedLightDomData;
    }

    get lang() {
        return this.getAttribute('lang') || 'zh';
    }

    _normalizeAttributeData(attrValue) {
        return normalizeAttributeEscapes(attrValue);
    }

    _extractLightDomData() {
        return extractLightDomPayload(this, {
            scriptType: 'application/pbn',
            templateType: 'pbn',
            fallbackToTextContent: true
        });
    }

    _render() {
        const data = this.data;
        this._widget.setLanguage(this.lang);
        this._widget.load(data || null);
    }
}

if (!customElements.get('sbs-bridge')) {
    customElements.define('sbs-bridge', SBSBridgeDiagram);
}

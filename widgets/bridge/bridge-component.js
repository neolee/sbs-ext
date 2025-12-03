import { BridgeWidget } from './bridge-widget.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
    --bridge-bg-color: #f8f9fa;
    --bridge-border-color: #dee2e6;
    --bridge-text-color: #212529;
    --suit-spade-color: #000;
    --suit-heart-color: #d00;
    --suit-diamond-color: #d60;
    --suit-club-color: #008;
    --table-bg-color: #35654d;
    --card-bg-color: #fff;
    display: inline-block;
}

.sbs-bridge-widget {
    font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
    color: #888;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
    display: flex;
    gap: 15px;
    justify-content: center;
}

.bridge-table {
    display: grid;
    grid-template-areas:
        "bidding north ."
        "west center east"
        ". south .";
    grid-template-columns: minmax(auto, 1fr) 130px minmax(auto, 1fr);
    grid-template-rows: auto auto auto;
    gap: 8px;
    justify-content: center;
}

.bridge-table.no-west {
    grid-template-areas:
        "north ."
        "center east"
        "south .";
    grid-template-columns: 130px auto;
    min-width: auto;
}

.bridge-table.no-east {
    grid-template-areas:
        "bidding north"
        "west center"
        ". south";
    grid-template-columns: auto 130px;
    min-width: auto;
}

.bridge-table.no-west.no-east {
    grid-template-areas:
        "north"
        "center"
        "south";
    grid-template-columns: 130px;
    min-width: auto;
}

.hand {
    background: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid #eee;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1;
    font-size: 0.95em;
    height: fit-content;
    max-width: 100%;
    box-sizing: border-box;
}

.hand-north {
    grid-area: north;
    align-self: end;
    margin-bottom: 2px;
    width: 115px;
    justify-self: center;
}

.hand-south {
    grid-area: south;
    align-self: start;
    margin-top: 2px;
    width: 115px;
    justify-self: center;
}

.hand-west {
    grid-area: west;
    align-self: center;
    width: 100%;
}

.hand-east {
    grid-area: east;
    align-self: center;
    width: 100%;
}

.bidding-section {
    grid-area: bidding;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 8px;
    font-size: 0.9em;
    align-self: start;
    margin-left: 10px;
    min-width: 180px;
}

.hand-label {
    font-weight: bold;
    text-align: center;
    margin-bottom: 4px;
    text-transform: uppercase;
    font-size: 0.75em;
    color: #888;
}

.hand-suits {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: fit-content;
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
    width: 120px;
    height: 100px;
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
    margin: 4px 0;
    padding: 4px 10px;
    background: #f8f9fa;
    color: #212529;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
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
    color: #555;
    text-transform: uppercase;
}

.bidding-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: 0.85em;
}

.bidding-table th {
    background-color: #f8f9fa;
    padding: 4px;
    border-bottom: 1px solid #dee2e6;
    color: #666;
    font-weight: 600;
}

.bidding-table td {
    padding: 4px;
    border-bottom: 1px solid #f1f1f1;
}

.opening-lead-below {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #eee;
    width: 100%;
    text-align: center;
}

.opening-lead-standalone {
    text-align: center;
    font-weight: bold;
}

.hand-lead-only {
    justify-content: center;
    min-height: 60px;
}

.lead-label {
    color: #888;
    font-size: 0.9em;
    margin-right: 4px;
}

.lead-value {
    font-size: 1em;
    font-weight: bold;
}

.lead-value span {
    font-size: 1.3em;
    vertical-align: -0.03em;
    margin-right: 2px;
}
</style>
<div class="sbs-bridge-widget" part="container"></div>
`;

export class SBSBridgeDiagram extends HTMLElement {
    static get observedAttributes() {
        return ['lang', 'data-pbn'];
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
        this._observer = new MutationObserver(() => {
            if (!this._explicitData && !this._attributeData) {
                this._cachedLightDomData = null;
                this._render();
            }
        });
    }

    connectedCallback() {
        this._observer.observe(this, { childList: true, subtree: true, characterData: true });
        this._render();
    }

    disconnectedCallback() {
        this._observer.disconnect();
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
        return attrValue
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');
    }

    _extractLightDomData() {
        const script = this.querySelector('script[type="application/pbn"]');
        if (script) {
            return script.textContent.trim();
        }
        const template = this.querySelector('template[data-type="pbn"]');
        if (template) {
            return template.innerHTML.trim();
        }
        return (this.textContent || '').trim();
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

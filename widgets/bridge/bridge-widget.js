import { PBNParser } from './pbn-parser.js';

const I18N = {
    en: {
        Event: 'Event', Site: 'Site', Date: 'Date', Scoring: 'Scoring',
        Vulnerable: 'Vulnerable', Dealer: 'Dealer', Declarer: 'Declarer', Contract: 'Contract',
        North: 'North', South: 'South', East: 'East', West: 'West',
        N: 'N', S: 'S', E: 'E', W: 'W',
        None: 'None', All: 'All', NS: 'N-S', EW: 'E-W',
        Bidding: 'Bidding',
        Pass: 'Pass',
        Lead: 'Lead',
        MissingData: 'Bridge diagram is missing PBN data.'
    },
    zh: {
        Event: '赛事', Site: '地点', Date: '日期', Scoring: '计分',
        Vulnerable: '局况', Dealer: '发牌', Declarer: '庄家', Contract: '定约',
        North: '北', South: '南', East: '东', West: '西',
        N: '北', S: '南', E: '东', W: '西',
        None: '双方无局', All: '双方有局', NS: '南北有局', EW: '东西有局',
        Bidding: '叫牌过程',
        Pass: 'Pass',
        Lead: '首攻',
        MissingData: '缺少 PBN 数据，无法展示桥牌牌局。'
    }
};

export class BridgeWidget {
    constructor(container, { lang = 'zh' } = {}) {
        if (!container) {
            throw new Error('BridgeWidget requires a container element.');
        }

        this.container = container;
        this.lang = lang;
        this.parser = new PBNParser();
        this.parsedData = null;
        this.pbnData = null;
        this._pendingSyncFrame = null;
    }

    load(pbnData) {
        this.pbnData = pbnData;
        this.parsedData = pbnData ? this.parser.parse(pbnData) : null;
        this.render();
    }

    setLanguage(lang) {
        if (lang && I18N[lang]) {
            this.lang = lang;
            this.render();
        }
    }

    t(key) {
        return (I18N[this.lang] && I18N[this.lang][key]) || key;
    }

    render() {
        if (!this.container) return;

        if (!this.parsedData) {
            const error = document.createElement('div');
            error.className = 'bridge-error';
            error.textContent = this.t('MissingData');
            this.container.replaceChildren(error);
            return;
        }

        const { tags, hands, auction, play } = this.parsedData;
        let openingLead = null;
        if (tags['Lead']) {
            openingLead = tags['Lead'];
        } else if (play && play.length > 0) {
            openingLead = play[0];
        }

        this.container.replaceChildren();

        const metaInfo = [];
        if (tags.Event) metaInfo.push(`${this.t('Event')}: ${tags.Event}`);
        if (tags.Site) metaInfo.push(`${this.t('Site')}: ${tags.Site}`);
        if (tags.Date) metaInfo.push(`${this.t('Date')}: ${tags.Date}`);
        if (tags.Scoring) metaInfo.push(`${this.t('Scoring')}: ${tags.Scoring}`);

        if (metaInfo.length > 0) {
            const header = document.createElement('div');
            header.className = 'bridge-meta-header';
            header.textContent = metaInfo.join(' | ');
            this.container.appendChild(header);
        }

        const table = document.createElement('div');
        table.className = 'bridge-table';

        const hasNorth = this.hasHandData(hands?.N);
        const hasSouth = this.hasHandData(hands?.S);
        const hasWest = this.hasHandData(hands?.W);
        const hasEast = this.hasHandData(hands?.E);
        const hasLead = Boolean(openingLead);
        const hasLeftColumn = hasWest || hasLead;
        const hasRightColumn = hasEast;

        const columnCount = (hasLeftColumn ? 1 : 0) + 1 + (hasRightColumn ? 1 : 0);
        const centerColumnIndex = hasLeftColumn ? 1 : 0;

        const columns = [];
        if (hasLeftColumn) columns.push('var(--hand-column-width, auto)');
        columns.push('minmax(var(--center-column-width, 160px), auto)');
        if (hasRightColumn) columns.push('var(--hand-column-width, auto)');
        table.style.gridTemplateColumns = columns.join(' ');

        const gridRows = [];
        if (hasNorth) {
            const row = new Array(columnCount).fill('.');
            row[centerColumnIndex] = 'north';
            gridRows.push(`"${row.join(' ')}"`);
        }

        {
            const row = new Array(columnCount).fill('.');
            if (hasWest) row[0] = 'west';
            row[centerColumnIndex] = 'center';
            if (hasEast) row[columnCount - 1] = 'east';
            gridRows.push(`"${row.join(' ')}"`);
        }

        if (hasSouth) {
            const row = new Array(columnCount).fill('.');
            row[centerColumnIndex] = 'south';
            gridRows.push(`"${row.join(' ')}"`);
        }

        table.style.gridTemplateAreas = gridRows.join('\n');
        const centerRowNumber = hasNorth ? 2 : 1;

        [['N', hasNorth], ['W', hasWest], ['E', hasEast], ['S', hasSouth]].forEach(([dir, hasHand]) => {
            if (!hasHand) return;

            const hand = hands ? hands[dir] : null;
            const dirKey = this.getDirName(dir, 'en').toLowerCase();
            const slot = document.createElement('div');
            slot.className = `hand-slot hand-slot-${dirKey}`;

            const handDiv = document.createElement('div');
            handDiv.className = 'hand';
            handDiv.appendChild(this.renderHandDom(dir, hand));
            slot.appendChild(handDiv);

            table.appendChild(slot);
        });

        const centerDiv = document.createElement('div');
        centerDiv.className = 'table-center';

        const vulText = this.formatVul(tags.Vulnerable);
        const dealerText = this.getDirName(tags.Dealer) || '-';
        const declarerText = this.getDirName(tags.Declarer) || '-';
        const contractFragment = this.renderContractDom(tags.Contract);

        centerDiv.appendChild(this.renderCenterInfoRowDom(`${this.t('Vulnerable')}:`, vulText));
        centerDiv.appendChild(this.renderCenterInfoRowDom(`${this.t('Dealer')}:`, dealerText));

        const contractDisplay = document.createElement('div');
        contractDisplay.className = 'contract-display';
        contractDisplay.appendChild(contractFragment);
        centerDiv.appendChild(contractDisplay);

        centerDiv.appendChild(this.renderCenterInfoRowDom(`${this.t('Declarer')}:`, declarerText));
        table.appendChild(centerDiv);

        if (hasLead) {
            const leadSection = document.createElement('div');
            leadSection.className = 'lead-section';
            leadSection.appendChild(this.renderLeadDom(openingLead));
            leadSection.dataset.align = hasWest ? 'top' : 'center';
            leadSection.style.gridColumn = '1';
            leadSection.style.gridRow = `${centerRowNumber}`;
            table.appendChild(leadSection);
        }

        if (auction && auction.length > 0) {
            const biddingDiv = document.createElement('div');
            biddingDiv.className = 'bidding-section';
            biddingDiv.appendChild(this.renderAuctionDom(tags.Dealer, auction));
            table.appendChild(biddingDiv);
        }

        this.container.appendChild(table);
        this.syncHandMetrics(table);
    }

    renderSuitTextDom(text) {
        const frag = document.createDocumentFragment();
        const suitSymbols = { S: '♠', H: '♥', D: '♦', C: '♣' };

        let buffer = '';
        const flush = () => {
            if (!buffer) return;
            frag.appendChild(document.createTextNode(buffer));
            buffer = '';
        };

        const raw = String(text ?? '');
        for (const ch of raw) {
            if (ch in suitSymbols) {
                flush();
                const span = document.createElement('span');
                span.className = `suit-${ch}`;
                span.textContent = suitSymbols[ch];
                frag.appendChild(span);
            } else {
                buffer += ch;
            }
        }
        flush();
        return frag;
    }

    renderLeadDom(leadCard) {
        const wrapper = document.createElement('div');
        wrapper.className = 'lead-block';

        const label = document.createElement('span');
        label.className = 'lead-label';
        label.textContent = `${this.t('Lead')}:`;

        const value = document.createElement('span');
        value.className = 'lead-value';
        value.appendChild(this.renderSuitTextDom(leadCard));

        wrapper.appendChild(label);
        wrapper.appendChild(value);
        return wrapper;
    }

    formatVul(vul) {
        if (!vul) return '-';
        const v = vul.toLowerCase();
        if (v === 'none' || v === 'love' || v === '-') return this.t('None');
        if (v === 'both' || v === 'all') return this.t('All');
        if (v === 'ns') return this.t('NS');
        if (v === 'ew') return this.t('EW');
        return vul;
    }

    getDirName(dir, forceLang = null) {
        if (!dir) return '';
        const map = { N: 'North', S: 'South', E: 'East', W: 'West' };
        const key = map[dir];
        if (!key) return dir;
        if (forceLang) {
            return I18N[forceLang][key];
        }
        return this.t(key);
    }

    renderHandDom(dir, hand) {
        const frag = document.createDocumentFragment();

        const label = document.createElement('div');
        label.className = 'hand-label';
        label.textContent = this.getDirName(dir);
        frag.appendChild(label);

        const suits = document.createElement('div');
        suits.className = 'hand-suits';

        const suitsData = hand || {};
        const rows = [
            { symbol: '♠', key: 'S', className: 'suit-S' },
            { symbol: '♥', key: 'H', className: 'suit-H' },
            { symbol: '♦', key: 'D', className: 'suit-D' },
            { symbol: '♣', key: 'C', className: 'suit-C' },
        ];

        for (const suit of rows) {
            const row = document.createElement('div');
            row.className = `suit-row ${suit.className}`;

            const symbol = document.createElement('div');
            symbol.className = 'suit-symbol';
            symbol.textContent = suit.symbol;

            const cards = document.createElement('div');
            cards.className = 'suit-cards';
            const value =
                typeof suitsData[suit.key] === 'string' && suitsData[suit.key].length > 0
                    ? suitsData[suit.key]
                    : '-';
            cards.textContent = value;

            row.appendChild(symbol);
            row.appendChild(cards);
            suits.appendChild(row);
        }

        frag.appendChild(suits);
        return frag;
    }

    renderCenterInfoRowDom(labelText, valueText) {
        const row = document.createElement('div');
        row.className = 'center-info-row';

        const label = document.createElement('span');
        label.className = 'center-label';
        label.textContent = labelText;

        const value = document.createElement('span');
        value.className = 'center-value';
        value.textContent = valueText;

        row.appendChild(label);
        row.appendChild(value);
        return row;
    }

    renderContractDom(contract) {
        if (!contract) {
            return document.createTextNode('-');
        }
        if (contract === 'Pass') {
            return document.createTextNode(this.t('Pass'));
        }
        return this.renderSuitTextDom(contract);
    }

    hasHandData(hand) {
        if (!hand) return false;
        return ['S', 'H', 'D', 'C'].some(key => typeof hand[key] === 'string' && hand[key].trim().length > 0);
    }

    syncHandMetrics(table) {
        if (this._pendingSyncFrame) {
            cancelAnimationFrame(this._pendingSyncFrame);
        }

        this._pendingSyncFrame = requestAnimationFrame(() => {
            this._pendingSyncFrame = null;
            const hands = Array.from(table.querySelectorAll('.hand'));
            if (!hands.length) return;

            let maxWidth = 0;
            let maxHeight = 0;

            hands.forEach(hand => {
                const rect = hand.getBoundingClientRect();
                maxWidth = Math.max(maxWidth, Math.ceil(rect.width));
                maxHeight = Math.max(maxHeight, Math.ceil(rect.height));
            });

            if (maxWidth) {
                table.style.setProperty('--hand-column-width', `${maxWidth}px`);
            }
            if (maxHeight) {
                table.style.setProperty('--hand-block-height', `${maxHeight}px`);
            }
        });
    }

    renderAuctionDom(dealer, auction) {
        const players = ['W', 'N', 'E', 'S'];

        const wrapper = document.createElement('div');

        const title = document.createElement('div');
        title.className = 'bidding-title';
        title.textContent = this.t('Bidding');
        wrapper.appendChild(title);

        const table = document.createElement('table');
        table.className = 'bidding-table';

        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        for (const player of players) {
            const th = document.createElement('th');
            th.textContent = this.t(player);
            headRow.appendChild(th);
        }
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        let row = document.createElement('tr');
        let currentIdx = 0;

        const dealerIdx = players.indexOf(dealer);
        if (dealerIdx !== -1) {
            for (let i = 0; i < dealerIdx; i++) {
                row.appendChild(document.createElement('td'));
                currentIdx++;
            }
        }

        for (const call of auction) {
            if (call === 'AP') continue;

            const td = document.createElement('td');
            if (call === 'Pass') {
                td.textContent = this.t('Pass');
            } else {
                td.appendChild(this.renderSuitTextDom(call));
            }
            row.appendChild(td);
            currentIdx++;

            if (currentIdx % 4 === 0) {
                tbody.appendChild(row);
                row = document.createElement('tr');
            }
        }

        if (currentIdx % 4 !== 0) {
            while (currentIdx % 4 !== 0) {
                row.appendChild(document.createElement('td'));
                currentIdx++;
            }
            tbody.appendChild(row);
        } else if (row.childNodes.length > 0) {
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        wrapper.appendChild(table);
        return wrapper;
    }
}

export { I18N };

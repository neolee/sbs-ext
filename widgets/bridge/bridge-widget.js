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
            this.container.innerHTML = `<div class="bridge-error">${this.t('MissingData')}</div>`;
            return;
        }

        const { tags, hands, auction, play } = this.parsedData;
        let openingLead = null;
        if (tags['Lead']) {
            openingLead = tags['Lead'];
        } else if (play && play.length > 0) {
            openingLead = play[0];
        }

        this.container.innerHTML = '';

        const metaInfo = [];
        if (tags.Event) metaInfo.push(`${this.t('Event')}: ${tags.Event}`);
        if (tags.Site) metaInfo.push(`${this.t('Site')}: ${tags.Site}`);
        if (tags.Date) metaInfo.push(`${this.t('Date')}: ${tags.Date}`);
        if (tags.Scoring) metaInfo.push(`${this.t('Scoring')}: ${tags.Scoring}`);

        if (metaInfo.length > 0) {
            const header = document.createElement('div');
            header.className = 'bridge-meta-header';
            header.innerText = metaInfo.join(' | ');
            this.container.appendChild(header);
        }

        const table = document.createElement('div');
        table.className = 'bridge-table';

        const hasWestHand = Boolean(hands && hands['W']);
        const hasEastHand = Boolean(hands && hands['E']);
        const hasBidding = Boolean(auction && auction.length > 0);
        const hasWestContent = hasWestHand || Boolean(openingLead);

        if (!hasWestContent && !hasBidding) table.classList.add('no-west');
        if (!hasEastHand) table.classList.add('no-east');

        ['N', 'W', 'E', 'S'].forEach(dir => {
            const hand = hands ? hands[dir] : null;

            if (dir === 'W' && !hand && openingLead) {
                const handDiv = document.createElement('div');
                handDiv.className = 'hand hand-west hand-lead-only';
                handDiv.innerHTML = this.renderLeadHTML(openingLead);
                table.appendChild(handDiv);
                return;
            }

            if (!hand && (dir === 'W' || dir === 'E')) {
                return;
            }

            const handDiv = document.createElement('div');
            handDiv.className = `hand hand-${this.getDirName(dir, 'en').toLowerCase()}`;
            let content = this.renderHandHTML(dir, hand);
            if (dir === 'W' && hand && openingLead) {
                content += this.renderLeadHTML(openingLead, true);
            }
            handDiv.innerHTML = content;
            table.appendChild(handDiv);
        });

        const centerDiv = document.createElement('div');
        centerDiv.className = 'table-center';

        const vulText = this.formatVul(tags.Vulnerable);
        const dealerText = this.getDirName(tags.Dealer) || '-';
        const declarerText = this.getDirName(tags.Declarer) || '-';
        const contractText = this.formatContract(tags.Contract) || '-';

        centerDiv.innerHTML = `
            <div class="center-info-row">
                <span class="center-label">${this.t('Vulnerable')}:</span>
                <span class="center-value">${vulText}</span>
            </div>
            <div class="center-info-row">
                <span class="center-label">${this.t('Dealer')}:</span>
                <span class="center-value">${dealerText}</span>
            </div>
            <div class="contract-display">${contractText}</div>
            <div class="center-info-row">
                <span class="center-label">${this.t('Declarer')}:</span>
                <span class="center-value">${declarerText}</span>
            </div>
        `;
        table.appendChild(centerDiv);

        if (auction && auction.length > 0) {
            const biddingDiv = document.createElement('div');
            biddingDiv.className = 'bidding-section';
            biddingDiv.innerHTML = this.renderAuctionHTML(tags.Dealer, auction);
            table.appendChild(biddingDiv);
        }

        this.container.appendChild(table);
    }

    renderLeadHTML(leadCard, isBelowHand = false) {
        const formattedLead = leadCard
            .replace(/S/g, '<span class="suit-S">♠</span>')
            .replace(/H/g, '<span class="suit-H">♥</span>')
            .replace(/D/g, '<span class="suit-D">♦</span>')
            .replace(/C/g, '<span class="suit-C">♣</span>');

        const className = isBelowHand ? 'opening-lead-below' : 'opening-lead-standalone';
        return `<div class="${className}">
            <span class="lead-label">${this.t('Lead')}:</span>
            <span class="lead-value">${formattedLead}</span>
        </div>`;
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

    renderHandHTML(dir, hand) {
        const dirName = this.getDirName(dir);
        if (!hand) {
            return `<div class="hand-label">${dirName}</div>`;
        }

        const suits = [
            { symbol: '♠', key: 'S', class: 'suit-S' },
            { symbol: '♥', key: 'H', class: 'suit-H' },
            { symbol: '♦', key: 'D', class: 'suit-D' },
            { symbol: '♣', key: 'C', class: 'suit-C' }
        ];

        let html = `<div class="hand-label">${dirName}</div>`;
        html += '<div class="hand-suits">';
        suits.forEach(suit => {
            html += `
                <div class="suit-row ${suit.class}">
                    <div class="suit-symbol">${suit.symbol}</div>
                    <div class="suit-cards">${hand[suit.key] || ''}</div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    formatContract(contract) {
        if (!contract || contract === 'Pass') return this.t('Pass');
        return contract
            .replace(/S/g, '<span class="suit-S">♠</span>')
            .replace(/H/g, '<span class="suit-H">♥</span>')
            .replace(/D/g, '<span class="suit-D">♦</span>')
            .replace(/C/g, '<span class="suit-C">♣</span>')
            .replace(/NT/g, 'NT');
    }

    renderAuctionHTML(dealer, auction) {
        const players = ['W', 'N', 'E', 'S'];
        let html = `
            <div class="bidding-title">${this.t('Bidding')}</div>
            <table class="bidding-table">
                <thead>
                    <tr>
                        <th>${this.t('W')}</th>
                        <th>${this.t('N')}</th>
                        <th>${this.t('E')}</th>
                        <th>${this.t('S')}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let rowHtml = '<tr>';
        let currentIdx = 0;
        const dealerIdx = players.indexOf(dealer);
        if (dealerIdx !== -1) {
            for (let i = 0; i < dealerIdx; i++) {
                rowHtml += '<td></td>';
                currentIdx++;
            }
        }

        auction.forEach(call => {
            if (call === 'AP') return;

            let formattedCall = call;
            if (call === 'Pass') {
                formattedCall = this.t('Pass');
            } else {
                formattedCall = call
                    .replace(/S/g, '<span class="suit-S">♠</span>')
                    .replace(/H/g, '<span class="suit-H">♥</span>')
                    .replace(/D/g, '<span class="suit-D">♦</span>')
                    .replace(/C/g, '<span class="suit-C">♣</span>');
            }

            rowHtml += `<td>${formattedCall}</td>`;
            currentIdx++;

            if (currentIdx % 4 === 0) {
                rowHtml += '</tr><tr>';
            }
        });

        while (currentIdx % 4 !== 0) {
            rowHtml += '<td></td>';
            currentIdx++;
        }

        if (rowHtml.endsWith('<tr>')) {
            rowHtml = rowHtml.slice(0, -4);
        } else {
            rowHtml += '</tr>';
        }

        html += rowHtml;
        html += '</tbody></table>';
        return html;
    }
}

export { I18N };

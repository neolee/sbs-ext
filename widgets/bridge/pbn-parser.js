// Portable Bridge Notation (PBN) parser tailored for SBS bridge widgets.
export class PBNParser {
    constructor() {
        this.tags = {};
        this.auction = [];
        this.play = [];
    }

    parse(pbnText) {
        this.tags = {};
        this.auction = [];
        this.play = [];

        if (!pbnText || typeof pbnText !== 'string') {
            return { tags: {}, hands: null, auction: [], play: [] };
        }

        const tagRegex = /\[\s*(\w+)\s+"([^"]*)"\s*\]/g;
        let match;
        let auctionTagEndIndex = -1;
        let playTagEndIndex = -1;

        while ((match = tagRegex.exec(pbnText)) !== null) {
            this.tags[match[1]] = match[2];
            if (match[1] === 'Auction') {
                auctionTagEndIndex = tagRegex.lastIndex;
            }
            if (match[1] === 'Play') {
                playTagEndIndex = tagRegex.lastIndex;
            }
        }

        if (auctionTagEndIndex !== -1) {
            this.auction = this.parseSection(pbnText, auctionTagEndIndex);
        }

        if (playTagEndIndex !== -1) {
            this.play = this.parseSection(pbnText, playTagEndIndex);
        }

        return {
            tags: this.tags,
            hands: this.parseDeal(this.tags['Deal']),
            auction: this.auction,
            play: this.play
        };
    }

    parseSection(pbnText, startIndex) {
        let content = pbnText.substring(startIndex);
        const nextTagIdx = content.indexOf('[');
        if (nextTagIdx !== -1) {
            content = content.substring(0, nextTagIdx);
        }

        return content
            .replace(/\*/g, '')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
    }

    parseDeal(dealStr) {
        if (!dealStr) return null;

        const parts = dealStr.split(':');
        if (parts.length !== 2) return null;

        const first = parts[0].trim().toUpperCase();
        const handsStr = parts[1].trim().split(/\s+/);

        const directions = ['N', 'E', 'S', 'W'];
        const firstIdx = directions.indexOf(first);
        if (firstIdx === -1) return null;

        const hands = {};
        for (let i = 0; i < 4; i++) {
            const currentDir = directions[(firstIdx + i) % 4];
            const handStr = handsStr[i];

            if (handStr && handStr !== '-') {
                const suits = handStr.split('.');
                hands[currentDir] = {
                    S: suits[0] || '',
                    H: suits[1] || '',
                    D: suits[2] || '',
                    C: suits[3] || ''
                };
            } else {
                hands[currentDir] = null;
            }
        }

        return hands;
    }
}

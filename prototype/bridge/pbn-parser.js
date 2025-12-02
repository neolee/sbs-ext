/**
 * Simple PBN Parser for SBS Bridge Widget
 */

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
        
        // 1. Parse Tags and locate Auction/Play tags
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

        // 2. Parse Auction if available
        if (auctionTagEndIndex !== -1) {
            this.auction = this.parseSection(pbnText, auctionTagEndIndex);
        }

        // 3. Parse Play if available
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
        // Get content starting after the tag
        let content = pbnText.substring(startIndex);
        
        // Stop at the next tag (if any)
        const nextTagIdx = content.indexOf('[');
        if (nextTagIdx !== -1) {
            content = content.substring(0, nextTagIdx);
        }

        // Clean and split
        // Remove * (end of record) and AP (All Pass) if present in auction
        const rawCalls = content.replace(/\*/g, '').trim().split(/\s+/);
        
        // Filter out empty strings
        return rawCalls.filter(c => c.length > 0);
    }

    /**
     * Parses the Deal string.
     * Format: "first:hand1 hand2 hand3 hand4"
     * first: N, E, S, W
     * hand: S.H.D.C (cards)
     * Example: "N:AKQ.J.T.98 76.54.32.AK ... ..."
     */
    parseDeal(dealStr) {
        if (!dealStr) return null;

        const parts = dealStr.split(':');
        if (parts.length !== 2) return null;

        const first = parts[0].trim().toUpperCase(); // N, E, S, W
        const handsStr = parts[1].trim().split(/\s+/);

        const directions = ['N', 'E', 'S', 'W'];
        const firstIdx = directions.indexOf(first);
        
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
                hands[currentDir] = null; // Empty or unknown hand
            }
        }

        return hands;
    }
}

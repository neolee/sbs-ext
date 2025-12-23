/**
 * Simple SGF Parser for Go (Weiqi)
 * Supports basic node properties and main branch navigation.
 */

export function parseSGF(sgf) {
    const nodes = [];
    let index = 0;

    // Remove newlines and extra spaces
    sgf = sgf.replace(/\r?\n|\r/g, ' ').trim();

    function parseProperty() {
        const match = sgf.slice(index).match(/^([A-Z]+)((?:\[.*?\])+)/);
        if (match) {
            const key = match[1];
            const values = match[2].slice(1, -1).split('][');
            index += match[0].length;
            return { key, values };
        }
        return null;
    }

    function parseNode() {
        if (sgf[index] === ';') {
            index++;
            const properties = {};
            while (index < sgf.length && sgf[index] !== ';' && sgf[index] !== '(' && sgf[index] !== ')') {
                const prop = parseProperty();
                if (prop) {
                    properties[prop.key] = prop.values.length === 1 ? prop.values[0] : prop.values;
                } else {
                    // Skip unknown characters or handle errors
                    index++;
                }
            }
            return properties;
        }
        return null;
    }

    // Find the start of the first game tree
    const start = sgf.indexOf('(');
    if (start === -1) return [];
    index = start + 1;

    while (index < sgf.length) {
        if (sgf[index] === ';') {
            const node = parseNode();
            if (node) nodes.push(node);
        } else if (sgf[index] === '(') {
            // For now, we only follow the first branch
            index++;
        } else if (sgf[index] === ')') {
            index++;
            // End of current branch
            break;
        } else {
            index++;
        }
    }

    return nodes;
}

/**
 * Converts SGF coordinates (e.g., "pd") to [x, y] (0-indexed)
 */
export function sgfToCoord(sgfCoord) {
    if (!sgfCoord || sgfCoord.length !== 2) return null;
    const x = sgfCoord.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = sgfCoord.charCodeAt(1) - 'a'.charCodeAt(0);
    return [x, y];
}

/**
 * Converts [x, y] to SGF coordinates
 */
export function coordToSgf(x, y) {
    return String.fromCharCode('a'.charCodeAt(0) + x) + String.fromCharCode('a'.charCodeAt(0) + y);
}

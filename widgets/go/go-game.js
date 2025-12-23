/**
 * Go (Weiqi) Game Logic
 * Handles board state, captures, and move history.
 */

export const BLACK = 1;
export const WHITE = 2;
export const EMPTY = 0;

export class GoGame {
    constructor(size = 19) {
        this.size = size;
        this.board = Array(size * size).fill(EMPTY);
        this.history = []; // Array of board states or moves
        this.moves = [];   // Array of {color, x, y}
        this.koSquare = null;
        this.captures = { [BLACK]: 0, [WHITE]: 0 };
    }

    get(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return null;
        return this.board[y * this.size + x];
    }

    set(x, y, color) {
        this.board[y * this.size + x] = color;
    }

    play(x, y, color) {
        if (this.get(x, y) !== EMPTY) return false;

        // Check Ko rule (simplified: can't repeat previous state)
        // For now, just basic move placement and capture logic

        const originalBoard = [...this.board];
        this.set(x, y, color);

        const opponent = color === BLACK ? WHITE : BLACK;
        let capturedAny = false;
        let capturedStones = [];

        // Check neighbors for captures
        const neighbors = this.getNeighbors(x, y);
        for (const [nx, ny] of neighbors) {
            if (this.get(nx, ny) === opponent) {
                const string = this.getString(nx, ny);
                if (this.countLiberties(string) === 0) {
                    capturedAny = true;
                    capturedStones.push(...string);
                    for (const [sx, sy] of string) {
                        this.set(sx, sy, EMPTY);
                        this.captures[color]++;
                    }
                }
            }
        }

        // Check suicide
        const ownString = this.getString(x, y);
        if (this.countLiberties(ownString) === 0 && !capturedAny) {
            this.board = originalBoard; // Undo
            return false;
        }

        // Ko check (very basic: if only one stone was captured and it was the previous Ko square)
        if (capturedStones.length === 1 && this.isSameCoord(capturedStones[0], this.koSquare)) {
             // This is a bit more complex to implement correctly without full state history
             // but for playback it's usually not an issue as SGF is valid.
        }

        this.moves.push({ color, x, y });
        this.history.push(originalBoard);
        
        return true;
    }

    getNeighbors(x, y) {
        const neighbors = [];
        if (x > 0) neighbors.push([x - 1, y]);
        if (x < this.size - 1) neighbors.push([x + 1, y]);
        if (y > 0) neighbors.push([x, y - 1]);
        if (y < this.size - 1) neighbors.push([x, y + 1]);
        return neighbors;
    }

    getString(x, y) {
        const color = this.get(x, y);
        const string = [];
        const visited = new Set();
        const stack = [[x, y]];

        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const key = `${cx},${cy}`;
            if (visited.has(key)) continue;
            visited.add(key);
            string.push([cx, cy]);

            for (const [nx, ny] of this.getNeighbors(cx, cy)) {
                if (this.get(nx, ny) === color) {
                    stack.push([nx, ny]);
                }
            }
        }
        return string;
    }

    countLiberties(string) {
        const liberties = new Set();
        for (const [sx, sy] of string) {
            for (const [nx, ny] of this.getNeighbors(sx, sy)) {
                if (this.get(nx, ny) === EMPTY) {
                    liberties.add(`${nx},${ny}`);
                }
            }
        }
        return liberties.size;
    }

    isSameCoord(c1, c2) {
        return c1 && c2 && c1[0] === c2[0] && c1[1] === c2[1];
    }

    reset(size = this.size) {
        this.size = size;
        this.board = Array(size * size).fill(EMPTY);
        this.history = [];
        this.moves = [];
        this.captures = { [BLACK]: 0, [WHITE]: 0 };
    }
}

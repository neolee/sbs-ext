const PIECE_MAP = {
    p: { type: 'p', color: 'b', glyph: '♟︎' },
    r: { type: 'r', color: 'b', glyph: '♜' },
    n: { type: 'n', color: 'b', glyph: '♞' },
    b: { type: 'b', color: 'b', glyph: '♝' },
    q: { type: 'q', color: 'b', glyph: '♛' },
    k: { type: 'k', color: 'b', glyph: '♚' },
    P: { type: 'p', color: 'w', glyph: '♙' },
    R: { type: 'r', color: 'w', glyph: '♖' },
    N: { type: 'n', color: 'w', glyph: '♘' },
    B: { type: 'b', color: 'w', glyph: '♗' },
    Q: { type: 'q', color: 'w', glyph: '♕' },
    K: { type: 'k', color: 'w', glyph: '♔' }
};

export function getDefaultFEN() {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
}

export function parseFEN(fen) {
    const normalized = (fen && fen.trim() !== 'startpos') ? fen.trim() : getDefaultFEN();
    const parts = normalized.split(/\s+/);
    if (parts.length < 4) {
        throw new Error(`Invalid FEN string: ${fen}`);
    }

    const [boardPart, activeColor, castling, enPassant, halfmove = '0', fullmove = '1'] = parts;
    const rows = boardPart.split('/');
    if (rows.length !== 8) {
        throw new Error(`Invalid FEN board rows: ${boardPart}`);
    }

    const board = rows.map(row => parseFENRow(row));
    return {
        board,
        activeColor,
        castling,
        enPassant: enPassant === '-' ? null : enPassant,
        halfmove: Number(halfmove),
        fullmove: Number(fullmove)
    };
}

function parseFENRow(row) {
    const squares = [];
    for (const char of row) {
        if (/[1-8]/.test(char)) {
            const empty = parseInt(char, 10);
            for (let i = 0; i < empty; i++) {
                squares.push(null);
            }
        } else if (PIECE_MAP[char]) {
            squares.push({ ...PIECE_MAP[char] });
        } else {
            throw new Error(`Unsupported FEN character: ${char}`);
        }
    }

    if (squares.length !== 8) {
        throw new Error(`Invalid FEN row length: ${row}`);
    }
    return squares;
}

export function boardToSquares(board, orientation = 'white') {
    const squares = [];
    const indices = [...Array(8).keys()];
    const rankOrder = orientation === 'white' ? indices : [...indices].reverse();
    const fileOrder = orientation === 'white' ? indices : [...indices].reverse();

    rankOrder.forEach(rankIdx => {
        fileOrder.forEach(fileIdx => {
            const piece = board[rankIdx][fileIdx];
            squares.push({
                coord: coordFromIndex(fileIdx, rankIdx),
                piece,
                matrixRank: rankIdx,
                matrixFile: fileIdx,
                isLight: (rankIdx + fileIdx) % 2 === 0
            });
        });
    });
    return squares;
}

function coordFromIndex(fileIdx, rankIdx) {
    const fileChar = String.fromCharCode('a'.charCodeAt(0) + fileIdx);
    const rank = 8 - rankIdx;
    return `${fileChar}${rank}`;
}

export function buildFileLabels(orientation = 'white') {
    const files = ['a','b','c','d','e','f','g','h'];
    return orientation === 'white' ? files : [...files].reverse();
}

export function buildRankLabels(orientation = 'white') {
    const ranks = ['1','2','3','4','5','6','7','8'];
    return orientation === 'white' ? [...ranks].reverse() : ranks;
}

export function createTimelineStates(baseState, moves) {
    const states = [baseState];
    moves.forEach(move => {
        if (move.fen) {
            states.push(parseFEN(move.fen));
        } else {
            states.push(null);
        }
    });
    return states;
}

export function getStateForIndex(timeline, index) {
    if (!timeline.length) return null;
    const clamped = Math.max(0, Math.min(index, timeline.length - 1));
    for (let i = clamped; i >= 0; i--) {
        if (timeline[i]) {
            return timeline[i];
        }
    }
    return timeline[0];
}

export function diffBoards(prevState, nextState) {
    if (!prevState || !nextState) return new Set();
    const changed = new Set();
    for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
            const prevPiece = prevState.board[r][f]?.glyph || null;
            const nextPiece = nextState.board[r][f]?.glyph || null;
            if (prevPiece !== nextPiece) {
                changed.add(`${r}-${f}`);
            }
        }
    }
    return changed;
}

export function formatMoveLabel(move, idx) {
    if (!move) return '';
    if (move.label) return move.label;
    if (move.san) return move.san;
    return move.ply ? `Move ${move.ply}` : `Move ${idx + 1}`;
}

export function normalizeMoves(input) {
    if (!input) return [];
    if (typeof input === 'string') {
        return input
            .split(/\s+/)
            .filter(Boolean)
            .map((san, idx) => ({ label: san, san, fen: null, ply: idx + 1 }));
    }
    if (Array.isArray(input)) {
        return input.map((entry, idx) => {
            if (typeof entry === 'string') {
                return { label: entry, san: entry, fen: null, ply: idx + 1 };
            }
            return {
                label: entry.label || entry.san || `Move ${idx + 1}`,
                san: entry.san || entry.label,
                fen: entry.fen || null,
                comment: entry.comment || '',
                ply: entry.ply ?? idx + 1
            };
        });
    }
    return [];
}

// chess.js 1.0.0 (MIT) vendored locally to avoid network requirements during prototyping
import { Chess } from './vendor/chess.mjs';
import { getDefaultFEN, parseFEN } from './chess-renderer.js';
import { ECO_LOOKUP as ECO_LOOKUP_SOURCE } from './eco-dictionary.js';

export const PROMOTION_CHOICES = ['q', 'r', 'b', 'n'];

const CAPTURE_GLYPHS = {
    w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
    b: { p: '♟︎', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
};

export function createLogicController() {
    return new ChessController();
}

const PGN_DEFAULT = '';
const PGN_LOAD_OPTIONS = { strict: false };
const PGN_TAG_PATTERN = /^\s*\[([A-Za-z0-9_]+)\s+"([^"]*)"\]\s*$/;
const ECO_LOOKUP = ECO_LOOKUP_SOURCE || {};

function isDefaultStart(fen) {
    return normalizeFen(fen) === getDefaultFEN();
}

function detectOpeningForMoves(moves = [], fen) {
    if (!Array.isArray(moves) || !moves.length) {
        return null;
    }
    if (!isDefaultStart(fen)) {
        return null;
    }
    for (let len = moves.length; len > 0; len -= 1) {
        const key = moves.slice(0, len).join(' ');
        const match = ECO_LOOKUP[key];
        if (match) {
            return {
                eco: match.eco,
                labels: match.labels || { en: match.name || null },
                ply: match.ply
            };
        }
    }
    return null;
}

function normalizeFen(fen) {
    if (!fen || fen.trim() === '' || fen.trim() === 'startpos') {
        return getDefaultFEN();
    }
    return fen.trim();
}

function splitPgnMetadata(pgn) {
    const tags = {};
    if (!pgn) {
        return { tags, body: '' };
    }
    const lines = pgn.split(/\r?\n/);
    const body = [];
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
            return;
        }
        const tagMatch = trimmed.match(PGN_TAG_PATTERN);
        if (tagMatch) {
            const [, key, value] = tagMatch;
            if (key) {
                tags[key] = value || '';
            }
            return;
        }
        body.push(trimmed);
    });
    const sanitized = body.join(' ').replace(/\s+/g, ' ').trim();
    return { tags, body: sanitized };
}

export function extractPgnMetadata(pgn) {
    return splitPgnMetadata(pgn).tags;
}

export function extractSanMovesFromPgn(pgn) {
    if (!pgn || !pgn.trim()) {
        return [];
    }
    const temp = new Chess();
    try {
        const { body: sanitized } = splitPgnMetadata(pgn);
        if (!sanitized) {
            return [];
        }
        temp.loadPgn(sanitized, PGN_LOAD_OPTIONS);
        return temp.history();
    } catch (err) {
        console.warn('[sbs-chess] PGN parse failed', err.message);
        return [];
    }
}

export function buildTimelineFromPgn(fen, pgn) {
    const timeline = [];
    const moves = [];
    const normalizedFen = normalizeFen(fen);
    let chess;
    try {
        chess = new Chess(normalizedFen);
    } catch (err) {
        console.warn('[sbs-chess] Invalid base FEN for timeline', err.message);
        chess = new Chess();
        chess.load(normalizedFen, { strict: false });
    }
    timeline.push(parseFEN(chess.fen()));
    const sanMoves = extractSanMovesFromPgn(pgn);
    sanMoves.forEach((san, idx) => {
        const move = chess.move(san);
        if (!move) return;
        moves.push({
            san: move.san || san,
            label: move.san || san,
            ply: idx + 1
        });
        timeline.push(parseFEN(chess.fen()));
    });
    const classification = detectOpeningForMoves(
        moves.map(entry => entry.san).filter(Boolean),
        normalizedFen
    );
    return { timeline, moves, opening: classification };
}

export function classifyOpening(fen, sanMoves = []) {
    const normalizedFen = normalizeFen(fen);
    const sequence = Array.isArray(sanMoves)
        ? sanMoves.filter(Boolean)
        : [];
    return detectOpeningForMoves(sequence, normalizedFen);
}

class ChessController {
    constructor() {
        this.chess = new Chess();
        this.history = [];
        this.cursor = 0;
        this.initialFen = getDefaultFEN();
        this.openingInfo = null;
        this.cacheState();
    }

    load({ fen, pgn = PGN_DEFAULT } = {}) {
        const normalized = normalizeFen(fen);
        try {
            this.chess = new Chess(normalized);
        } catch (err) {
            throw new Error(`Invalid FEN: ${err.message}`);
        }
        this.initialFen = normalized;
        this.history = [];
        this.cursor = 0;
        const sanMoves = Array.isArray(pgn) ? pgn : extractSanMovesFromPgn(pgn);
        this.applySanMoves(sanMoves);
        this.cacheState();
        return this.getSnapshot();
    }

    applySanMoves(moves = []) {
        moves.forEach(san => {
            if (!san) return;
            try {
                const move = this.chess.move(san);
                if (move) {
                    this.history.push(this.simplifyMove(move));
                    this.cursor = this.history.length;
                }
            } catch (err) {
                console.warn('[sbs-chess] scripted move failed', san, err);
            }
        });
    }

    cacheState() {
        this.currentFen = this.chess.fen();
        this.currentState = parseFEN(this.currentFen);
        this.status = {
            inCheck: this.chess.inCheck(),
            checkmate: this.chess.isCheckmate(),
            stalemate: this.chess.isStalemate(),
            draw: this.chess.isDraw(),
            insufficient: this.chess.isInsufficientMaterial(),
            repetition: this.chess.isThreefoldRepetition(),
            turn: this.chess.turn()
        };
        this.openingInfo = detectOpeningForMoves(
            this.getHistory()
                .map(move => move?.san)
                .filter(Boolean),
            this.initialFen
        );
    }

    getSnapshot() {
        this.cacheState();
        return {
            ...this.currentState,
            fen: this.currentFen,
            status: this.status,
            cursor: this.cursor,
            historyLength: this.history.length,
            lastMove: this.getLastMove(),
            captures: this.getCaptures(),
            opening: this.openingInfo
        };
    }

    getLegalMoves(square) {
        if (!square) return [];
        return this.chess.moves({ square, verbose: true }).map(move => this.simplifyMove(move));
    }

    requiresPromotion(from, to) {
        const legal = this.getLegalMoves(from);
        return legal.some(move => move.to === to && !!move.promotion);
    }

    move({ from, to, promotion }) {
        if (!from || !to) {
            return { ok: false, reason: 'missing-coords' };
        }
        if (this.cursor !== this.history.length) {
            this.history = this.history.slice(0, this.cursor);
        }
        const payload = { from, to };
        if (promotion) {
            payload.promotion = promotion;
        } else if (this.requiresPromotion(from, to)) {
            payload.promotion = 'q';
        }
        const played = this.chess.move(payload);
        if (!played) {
            return { ok: false, reason: 'illegal' };
        }
        const simplified = this.simplifyMove(played);
        this.history.push(simplified);
        this.cursor = this.history.length;
        this.cacheState();
        return { ok: true, move: simplified, snapshot: this.getSnapshot() };
    }

    undo() {
        if (this.cursor === 0) return { ok: false };
        const undone = this.chess.undo();
        if (!undone) return { ok: false };
        this.cursor -= 1;
        this.cacheState();
        return { ok: true, move: this.simplifyMove(undone), snapshot: this.getSnapshot() };
    }

    redo() {
        if (this.cursor >= this.history.length) return { ok: false };
        const move = this.history[this.cursor];
        const replayed = this.chess.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion || undefined
        });
        if (!replayed) return { ok: false };
        this.cursor += 1;
        this.cacheState();
        return { ok: true, move: this.simplifyMove(replayed), snapshot: this.getSnapshot() };
    }

    jumpTo(index) {
        const target = Math.max(0, Math.min(index, this.history.length));
        while (this.cursor > target) {
            if (!this.undo().ok) break;
        }
        while (this.cursor < target) {
            if (!this.redo().ok) break;
        }
        this.cacheState();
        return this.cursor === target;
    }

    simplifyMove(move) {
        if (!move) return null;
        return {
            san: move.san,
            from: move.from,
            to: move.to,
            promotion: move.promotion || null,
            color: move.color,
            piece: move.piece,
            captured: move.captured || null,
            flags: move.flags
        };
    }

    getHistory() {
        return this.history.slice(0, this.cursor);
    }

    getLastMove() {
        if (this.cursor === 0) return null;
        return this.history[this.cursor - 1] || null;
    }

    getCaptures() {
        const captures = { white: [], black: [] };
        this.history.slice(0, this.cursor).forEach(move => {
            if (!move.captured) return;
            const bucket = move.color === 'w' ? captures.white : captures.black;
            bucket.push(this.glyphFor(move.captured, move.color === 'w' ? 'b' : 'w'));
        });
        return captures;
    }

    glyphFor(pieceType, color) {
        const glyphMap = CAPTURE_GLYPHS[color];
        if (!glyphMap) return pieceType;
        return glyphMap[pieceType.toLowerCase()] || pieceType;
    }

    getCursor() {
        return this.cursor;
    }

    getTimelineLength() {
        return this.history.length + 1;
    }

    getPgn() {
        try {
            return this.chess.pgn();
        } catch (err) {
            console.warn('[sbs-chess] PGN export failed', err.message);
            return '';
        }
    }
}

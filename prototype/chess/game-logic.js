// chess.js 1.0.0 (MIT) vendored locally to avoid network requirements during prototyping
import { Chess } from './vendor/chess.mjs';
import { getDefaultFEN, parseFEN } from './chess-renderer.js';

export const PROMOTION_CHOICES = ['q', 'r', 'b', 'n'];

const CAPTURE_GLYPHS = {
    w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
    b: { p: '♟︎', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
};

export function createLogicController() {
    return new ChessController();
}

function normalizeFen(fen) {
    if (!fen || fen.trim() === '' || fen.trim() === 'startpos') {
        return getDefaultFEN();
    }
    return fen.trim();
}

class ChessController {
    constructor() {
        this.chess = new Chess();
        this.history = [];
        this.cursor = 0;
        this.initialFen = getDefaultFEN();
        this.cacheState();
    }

    load({ fen, moves = [] } = {}) {
        const normalized = normalizeFen(fen);
        try {
            this.chess = new Chess(normalized);
        } catch (err) {
            throw new Error(`Invalid FEN: ${err.message}`);
        }
        this.initialFen = normalized;
        this.history = [];
        this.cursor = 0;
        this.applySanMoves(moves);
        this.cacheState();
        return this.getSnapshot();
    }

    applySanMoves(moves = []) {
        moves.forEach(entry => {
            const san = typeof entry === 'string' ? entry : entry?.san || entry?.label;
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
            captures: this.getCaptures()
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
}

const UPCOMING_I18N = {
    zh: [
        '加入多步注解与箭头标注',
        '支持 PGN 上传与导出',
        '集成引擎评估与分数显示',
        '可选的开局库参考提示'
    ],
    en: [
        'Arrow/annotation tooling for study notes',
        'PGN import/export workflow',
        'Engine evaluation overlays and score display',
        'Opening reference suggestions'
    ]
};

export function describeUpcomingFeatures(lang = 'zh') {
    return UPCOMING_I18N[lang] || UPCOMING_I18N.zh;
}

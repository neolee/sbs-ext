import {
    getDefaultFEN,
    parseFEN,
    boardToSquares,
    buildFileLabels,
    buildRankLabels,
    diffBoards,
    formatMoveLabel
} from './chess-renderer.js';
import {
    createLogicController,
    PROMOTION_CHOICES,
    buildTimelineFromPgn,
    classifyOpening
} from './game-logic.js';

const I18N = {
    zh: {
        status_display: '静态展示',
        status_interactive: '互动模式',
        status_wait_piece: '请选择要移动的棋子',
        status_select_target: '请选择 {square} 的落点',
        status_illegal: '该步不合法',
        status_turn_white: '轮到白方',
        status_turn_black: '轮到黑方',
        status_check: '将军',
        status_checkmate: '将死',
        status_stalemate: '逼和',
        status_draw: '和棋',
        status_game_over: '对局结束',
        status_ready: '随时点击棋子开始',
        position: '局面',
        meta_active: '行棋方',
        meta_castling: '王车易位',
        meta_enpassant: '吃过路兵',
        meta_move: '回合',
        meta_opening: '开局',
        meta_orientation: '棋盘朝向',
        meta_size: '棋盘尺寸',
        timeline: '时间轴',
        moves: '着法列表',
        flip: '翻转',
        color_white: '白方',
        color_black: '黑方',
        orientation_white: '白方视角',
        orientation_black: '黑方视角',
        move_fallback: '第 {n} 步',
        upcoming_title: '即将更新',
        opening_unknown: '未识别开局',
        promotion_title: '升变',
        promotion_choose: '选择升变棋子',
        promotion_cancel: '取消',
        promotion_q: '皇后',
        promotion_r: '车',
        promotion_b: '象',
        promotion_n: '马',
        captures: '吃子',
        captures_white: '白方吃掉',
        captures_black: '黑方吃掉',
        notation_fen: 'FEN',
        notation_pgn: 'PGN',
        copy: '复制',
        copied: '已复制'
    },
    en: {
        status_display: 'Display only',
        status_interactive: 'Interactive mode',
        status_wait_piece: 'Select a piece to move',
        status_select_target: 'Choose a destination for {square}',
        status_illegal: 'Illegal move',
        status_turn_white: 'White to move',
        status_turn_black: 'Black to move',
        status_check: 'Check',
        status_checkmate: 'Checkmate',
        status_stalemate: 'Stalemate',
        status_draw: 'Draw',
        status_game_over: 'Game over',
        status_ready: 'Tap any piece to begin',
        position: 'Position',
        meta_active: 'Active',
        meta_castling: 'Castling',
        meta_enpassant: 'En Passant',
        meta_move: 'Move #',
        meta_opening: 'Opening',
        meta_orientation: 'Orientation',
        meta_size: 'Size',
        timeline: 'Timeline',
        moves: 'Moves',
        flip: 'Flip',
        color_white: 'White',
        color_black: 'Black',
        orientation_white: 'White at bottom',
        orientation_black: 'Black at bottom',
        move_fallback: 'Move {n}',
        upcoming_title: 'Future work',
        opening_unknown: 'Unknown opening',
        promotion_title: 'Promotion',
        promotion_choose: 'Pick a promotion piece',
        promotion_cancel: 'Cancel',
        promotion_q: 'Queen',
        promotion_r: 'Rook',
        promotion_b: 'Bishop',
        promotion_n: 'Knight',
        captures: 'Captured pieces',
        captures_white: 'Captured by White',
        captures_black: 'Captured by Black',
        notation_fen: 'FEN',
        notation_pgn: 'PGN',
        copy: 'Copy',
        copied: 'Copied'
    }
};

const DEFAULT_LANG = 'zh';

const LAYOUT_PRESETS = {
    full: {
        header: true,
        sidebar: true,
        meta: true,
        controls: true,
        moveList: true,
        notation: true,
        status: true,
        captures: true,
        boardOnly: false
    },
    compact: {
        header: true,
        sidebar: true,
        meta: true,
        controls: false,
        moveList: true,
        notation: false,
        status: true,
        captures: true,
        boardOnly: false
    },
    minimal: {
        header: true,
        sidebar: true,
        meta: true,
        controls: false,
        moveList: false,
        notation: false,
        status: false,
        captures: false,
        boardOnly: false
    },
    'board-only': {
        header: false,
        sidebar: false,
        meta: false,
        controls: false,
        moveList: false,
        notation: false,
        status: false,
        captures: false,
        boardOnly: true
    }
};

const DEFAULT_CONFIG = {
    title: 'Chess Diagram',
    fen: getDefaultFEN(),
    pgn: '',
    interactive: false,
    orientation: 'white',
    size: 480,
    layout: 'full',
    showAxes: true,
    lockSize: false,
    lang: DEFAULT_LANG
};

export class ChessWidget {
    constructor(container, config = {}) {
        this.container = this.resolveContainer(container);
        if (!this.container) {
            throw new Error('ChessWidget requires a valid container element.');
        }
        this.logic = createLogicController();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.selection = null;
        this.pendingMoves = [];
        this.legalTargets = new Set();
        this.lastMoveSquares = new Set();
        this.statusOverride = null;
        this.statusTimer = null;
        this.notationFields = null;
        this.timeline = [];
        this.staticMoves = [];
        this.layoutPreset = LAYOUT_PRESETS.full;
        this.applyConfig(this.config);
    }

    resolveContainer(container) {
        if (!container) return null;
        if (typeof container === 'string') {
            return document.getElementById(container);
        }
        if (container instanceof HTMLElement) {
            return container;
        }
        return null;
    }

    t(key) {
        const lang = this.config?.lang || DEFAULT_LANG;
        return (I18N[lang] && I18N[lang][key]) || I18N[DEFAULT_LANG][key] || key;
    }

    format(template, values = {}) {
        if (!template) return '';
        return template.replace(/\{(\w+)\}/g, (_, token) => (values[token] ?? `{${token}}`));
    }

    setLanguage(lang) {
        if (!I18N[lang]) return;
        this.config.lang = lang;
        this.render();
    }

    formatMoveFallback(index, ply) {
        const moveNumber = typeof ply === 'number' ? ply : index + 1;
        const template = this.t('move_fallback');
        return template.replace('{n}', moveNumber);
    }

    describeOpening(info) {
        if (!info) {
            return this.t('opening_unknown');
        }
        const tokens = [];
        if (info.eco) tokens.push(info.eco);
        const localized = this.getOpeningLabel(info);
        if (localized) tokens.push(localized);
        return tokens.length ? tokens.join(' · ') : this.t('opening_unknown');
    }

    getOpeningLabel(info) {
        if (!info) return null;
        const labels = info.labels || {};
        const lang = this.config?.lang || DEFAULT_LANG;
        return labels[lang] || labels.en || labels.zh || null;
    }

    getStaticOpeningAt(index = this.currentIndex) {
        if (!Array.isArray(this.staticMoves) || !this.staticMoves.length) {
            return null;
        }
        const ply = Math.max(0, Math.min(index, this.staticMoves.length));
        if (ply === 0) return null;
        const sanSequence = this.staticMoves
            .slice(0, ply)
            .map(move => move?.san)
            .filter(Boolean);
        if (!sanSequence.length) {
            return null;
        }
        return classifyOpening(this.config.fen, sanSequence);
    }

    resolveOpeningInfo(state) {
        if (this.config.interactive) {
            return state?.opening || null;
        }
        return this.getStaticOpeningAt(this.currentIndex);
    }

    getLayoutPreset() {
        const key = this.config?.layout || 'full';
        return LAYOUT_PRESETS[key] || LAYOUT_PRESETS.full;
    }

    applyConfig(config) {
        this.config = { ...this.config, ...config };
        const fenInput = this.config.fen;
        const normalizedFen = (!fenInput || fenInput.trim() === '' || fenInput.trim() === 'startpos')
            ? getDefaultFEN()
            : fenInput.trim();
        try {
            this.baseState = parseFEN(normalizedFen);
            if (this.config.interactive) {
                this.ensureInteractiveController();
                this.timeline = [];
                this.staticMoves = [];
                this.currentIndex = this.logic.getCursor();
            } else {
                const playback = buildTimelineFromPgn(normalizedFen, this.config.pgn);
                this.timeline = playback.timeline?.length ? playback.timeline : [this.baseState];
                this.staticMoves = playback.moves || [];
                if (typeof this.currentIndex !== 'number') {
                    this.currentIndex = this.timeline.length - 1;
                }
                this.currentIndex = Math.min(Math.max(this.currentIndex, 0), this.timeline.length - 1);
            }
        } catch (err) {
            this.showError(err.message);
            return;
        }
        this.render();
    }

    ensureInteractiveController() {
        try {
            this.logic.load({
                fen: this.config.fen,
                pgn: this.config.pgn
            });
            this.currentIndex = this.logic.getCursor();
        } catch (err) {
            this.showError(err.message);
        }
    }

    render() {
        this.layoutPreset = this.getLayoutPreset();
        this.container.innerHTML = '';
        this.root = document.createElement('div');
        this.root.className = 'sbs-chess-widget';
        if (this.layoutPreset.boardOnly) {
            this.root.classList.add('board-only');
        }
        this.root.dataset.orientation = this.config.orientation;
        this.root.style.setProperty('--board-size', this.resolveBoardSize());
        this.container.appendChild(this.root);
        this.resetSelectionState();

        if (this.layoutPreset.header) {
            this.renderHeader();
        }
        this.renderBoard();
        this.renderSidebar();

        this.updateBoard();
        this.updateMeta();
        this.updateControls();
        this.refreshMoveList();
        this.updateMoveHighlight();
        this.updateStatusBlock();
        this.updateCaptures();
        this.updateNotationPanel();
    }

    setBoardSize(size, { force = false } = {}) {
        const parsed = typeof size === 'number' ? size : parseInt(size, 10);
        if (Number.isNaN(parsed)) return;
        if (this.config.lockSize && !force) return;
        this.config.size = parsed;
        this.render();
    }

    renderHeader() {
        const header = document.createElement('header');
        const title = document.createElement('h3');
        title.textContent = this.config.title || 'Chess Diagram';
        const mode = document.createElement('span');
        mode.className = 'status-pill';
        mode.textContent = this.config.interactive ? this.t('status_interactive') : this.t('status_display');
        header.append(title, mode);
        this.root.appendChild(header);
    }

    renderBoard() {
        this.boardShell = document.createElement('div');
        this.boardShell.className = 'board-shell';
        this.boardGrid = document.createElement('div');
        this.boardGrid.className = 'board-grid';
        this.boardShell.appendChild(this.boardGrid);

        const fileLabels = document.createElement('div');
        fileLabels.className = 'board-axis file-labels bottom';
        this.fileLabels = fileLabels;
        this.boardShell.appendChild(fileLabels);

        const rankLabels = document.createElement('div');
        rankLabels.className = 'board-axis rank-labels left';
        this.rankLabels = rankLabels;
        this.boardShell.appendChild(rankLabels);

        this.root.appendChild(this.boardShell);
        this.updateAxes();
    }

    renderSidebar() {
        const layout = this.layoutPreset;
        if (!layout.sidebar) {
            this.metaFields = null;
            this.notationFields = null;
            this.buttons = null;
            this.moveListElement = null;
            this.moveItems = [];
            this.statusBlock = null;
            this.captureRows = null;
            return;
        }

        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';

        if (layout.meta) {
            const positionBlock = document.createElement('div');
            const positionHeading = document.createElement('h4');
            positionHeading.textContent = this.t('position');
            this.metaGrid = document.createElement('div');
            this.metaGrid.className = 'board-meta';
            this.metaFields = {
                moveCount: this.createMetaItem('meta_move'),
                active: this.createMetaItem('meta_active'),
                castling: this.createMetaItem('meta_castling'),
                enPassant: this.createMetaItem('meta_enpassant'),
                size: this.createMetaItem('meta_size'),
                    orientation: this.createMetaItem('meta_orientation')
            };
            Object.values(this.metaFields).forEach(item => this.metaGrid.appendChild(item.element));
            positionBlock.append(positionHeading, this.metaGrid);
            sidebar.appendChild(positionBlock);
        } else {
            this.metaFields = null;
        }

        if (layout.controls) {
            this.controlsWrapper = this.createControls();
            sidebar.appendChild(this.controlsWrapper);
        } else {
            this.controlsWrapper = null;
            this.buttons = null;
        }

        if (this.shouldShowMoveList()) {
            this.moveList = this.createMoveList();
            sidebar.appendChild(this.moveList);
        } else {
            this.moveList = null;
            this.moveListElement = null;
            this.moveItems = [];
        }

        if (layout.status) {
            this.statusBlock = this.createStatusBlock();
            sidebar.appendChild(this.statusBlock);
        } else {
            this.statusBlock = null;
        }

        if (this.config.interactive && layout.captures) {
            this.captureBlock = this.createCaptureBlock();
            sidebar.appendChild(this.captureBlock);
        } else {
            this.captureBlock = null;
            this.captureRows = null;
        }

        if (layout.notation) {
            this.notationPanel = this.createNotationPanel();
            sidebar.appendChild(this.notationPanel);
        } else {
            this.notationPanel = null;
            this.notationFields = null;
        }

        this.root.appendChild(sidebar);
    }

    shouldShowMoveList() {
        if (!this.layoutPreset?.moveList) {
            return false;
        }
        if (this.config.interactive) {
            return true;
        }
        return (this.staticMoves?.length || 0) > 0;
    }

    createMetaItem(labelKey) {
        const wrapper = document.createElement('div');
        wrapper.className = 'meta-item';
        const lbl = document.createElement('span');
        lbl.className = 'meta-label';
        lbl.textContent = this.t(labelKey);
        const val = document.createElement('span');
        val.className = 'meta-value';
        val.textContent = '--';
        wrapper.append(lbl, val);
        return { element: wrapper, set: (text) => { val.textContent = text; } };
    }

    createControls() {
        const wrapper = document.createElement('div');
        const heading = document.createElement('h4');
        heading.textContent = this.t('timeline');
        const controls = document.createElement('div');
        controls.className = 'controls';

        this.buttons = {
            first: this.createButton('⏮'),
            prev: this.createButton('◀'),
            next: this.createButton('▶'),
            last: this.createButton('⏭'),
            flip: this.createButton(this.t('flip'))
        };

        controls.append(
            this.buttons.first,
            this.buttons.prev,
            this.buttons.next,
            this.buttons.last,
            this.buttons.flip
        );

        this.buttons.first.addEventListener('click', () => this.setStep(0));
        this.buttons.prev.addEventListener('click', () => this.setStep(this.currentIndex - 1));
        this.buttons.next.addEventListener('click', () => this.setStep(this.currentIndex + 1));
        this.buttons.last.addEventListener('click', () => this.setStep(this.getMaxIndex()));
        this.buttons.flip.addEventListener('click', () => {
            this.config.orientation = this.config.orientation === 'white' ? 'black' : 'white';
            this.render();
        });

        wrapper.append(heading, controls);
        return wrapper;
    }

    createButton(label) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        return btn;
    }

    createMoveList() {
        const container = document.createElement('div');
        container.className = 'move-list';
        const heading = document.createElement('h4');
        heading.textContent = this.t('moves');
        const list = document.createElement('ol');
        this.moveListElement = list;
        this.moveItems = [];
        this.refreshMoveList();
        container.append(heading, list);
        return container;
    }

    createStatusBlock() {
        const block = document.createElement('div');
        block.className = 'status-block';
        block.textContent = this.t('opening_unknown');
        return block;
    }

    createCaptureBlock() {
        const block = document.createElement('div');
        block.className = 'capture-panel';
        const heading = document.createElement('h4');
        heading.textContent = this.t('captures');
        const whiteRow = document.createElement('div');
        whiteRow.className = 'capture-row';
        const whiteLabel = document.createElement('span');
        whiteLabel.className = 'capture-label';
        whiteLabel.textContent = this.t('captures_white');
        const whitePieces = document.createElement('span');
        whitePieces.className = 'capture-pieces';
        whiteRow.append(whiteLabel, whitePieces);

        const blackRow = document.createElement('div');
        blackRow.className = 'capture-row';
        const blackLabel = document.createElement('span');
        blackLabel.className = 'capture-label';
        blackLabel.textContent = this.t('captures_black');
        const blackPieces = document.createElement('span');
        blackPieces.className = 'capture-pieces';
        blackRow.append(blackLabel, blackPieces);

        this.captureRows = {
            white: whitePieces,
            black: blackPieces
        };

        block.append(heading, whiteRow, blackRow);
        return block;
    }

    createNotationPanel() {
        const panel = document.createElement('div');
        panel.className = 'notation-panel';
        const fenField = this.createNotationField('notation_fen');
        const pgnField = this.createNotationField('notation_pgn');
        this.notationFields = {
            fen: fenField,
            pgn: pgnField
        };
        panel.append(fenField.container, pgnField.container);
        return panel;
    }

    createNotationField(labelKey) {
        const block = document.createElement('div');
        block.className = 'notation-block';
        const header = document.createElement('div');
        header.className = 'notation-header';
        const label = document.createElement('span');
        label.textContent = this.t(labelKey);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-button';
        btn.textContent = this.t('copy');
        header.append(label, btn);

        const content = document.createElement('pre');
        content.className = 'notation-field';
        content.textContent = '—';
        block.append(header, content);

        btn.addEventListener('click', () => this.copyToClipboard(content.textContent, btn));

        return {
            container: block,
            set: (text) => {
                content.textContent = text && text.trim() ? text : '—';
            }
        };
    }

    resolveBoardSize() {
        const { size } = this.config;
        if (typeof size === 'number') {
            return `${size}px`;
        }
        return size || '480px';
    }

    getDisplayState() {
        if (this.config.interactive) {
            return this.logic.getSnapshot();
        }
        return this.getStaticState(this.currentIndex);
    }

    getPreviousState() {
        if (this.config.interactive) return null;
        return this.getStaticState(Math.max(this.currentIndex - 1, 0));
    }

    getStaticState(index) {
        if (!this.timeline || !this.timeline.length) return null;
        const clamped = Math.max(0, Math.min(index, this.timeline.length - 1));
        return this.timeline[clamped];
    }

    resetSelectionState() {
        this.selection = null;
        this.pendingMoves = [];
        this.legalTargets = new Set();
        this.hidePromotionDialog();
        if (this.statusTimer) {
            clearTimeout(this.statusTimer);
            this.statusTimer = null;
        }
        this.statusOverride = null;
    }

    refreshMoveList() {
        if (!this.moveListElement) {
            this.moveItems = [];
            return;
        }
        this.moveItems = [];
        this.moveListElement.innerHTML = '';
        const moves = this.getMoveData();
        moves.forEach((move, idx) => {
            const li = document.createElement('li');
            li.textContent = formatMoveLabel(move, idx, (i, ply) => this.formatMoveFallback(i, ply));
            li.dataset.step = String(idx + 1);
            li.addEventListener('click', () => this.setStep(idx + 1));
            this.moveListElement.appendChild(li);
            this.moveItems.push(li);
        });
    }

    getMoveData() {
        if (this.config.interactive) {
            return this.logic.getHistory().map((move, idx) => ({
                label: move.san,
                san: move.san,
                ply: idx + 1
            }));
        }
        return this.staticMoves || [];
    }

    updateBoard() {
        const current = this.getDisplayState();
        if (!current) return;
        const previous = this.getPreviousState();
        const changed = previous && !this.config.interactive ? diffBoards(previous, current) : new Set();
        const squares = boardToSquares(current.board, this.config.orientation);

        this.boardGrid.innerHTML = '';
        const lastMove = this.config.interactive ? this.logic.getLastMove() : null;
        this.lastMoveSquares = lastMove ? new Set([lastMove.from, lastMove.to]) : new Set();
        squares.forEach(square => {
            const cell = document.createElement('div');
            cell.className = `square ${square.isLight ? 'light' : 'dark'}`;
            if (changed.has(`${square.matrixRank}-${square.matrixFile}`)) {
                cell.classList.add('changed');
            }
            if (this.config.interactive) {
                cell.classList.add('interactive');
                cell.dataset.coord = square.coord;
                cell.tabIndex = 0;
                cell.addEventListener('click', () => this.handleSquareClick(square));
                if (this.selection === square.coord) {
                    cell.classList.add('selected');
                }
                if (this.legalTargets.has(square.coord)) {
                    cell.classList.add('target');
                    if (square.piece) {
                        cell.classList.add('target-capture');
                    }
                }
                if (this.lastMoveSquares.has(square.coord)) {
                    cell.classList.add('recent-move');
                }
            }
            cell.title = square.coord;
            if (square.piece) {
                const span = document.createElement('span');
                span.className = 'piece';
                span.textContent = square.piece.glyph;
                cell.appendChild(span);
            }
            this.boardGrid.appendChild(cell);
        });
    }

    updateAxes() {
        if (!this.fileLabels && !this.rankLabels) return;
        const files = buildFileLabels(this.config.orientation);
        const ranks = buildRankLabels(this.config.orientation);
        if (this.fileLabels) {
            this.fileLabels.style.display = this.config.showAxes ? 'flex' : 'none';
            this.fileLabels.innerHTML = files.map(file => `<span>${file}</span>`).join('');
        }
        if (this.rankLabels) {
            this.rankLabels.style.display = this.config.showAxes ? 'flex' : 'none';
            this.rankLabels.innerHTML = ranks.map(rank => `<span>${rank}</span>`).join('');
        }
    }

    updateMeta() {
        if (!this.metaFields) return;
        const state = this.getDisplayState();
        if (!state) return;
        const activeColor = this.config.interactive && state.status ? state.status.turn : state.activeColor;
        this.metaFields.active.set(activeColor === 'w' ? this.t('color_white') : this.t('color_black'));
        this.metaFields.castling.set(state.castling === '-' ? '—' : state.castling);
        this.metaFields.enPassant.set(state.enPassant || '—');
        this.metaFields.moveCount.set(String(state.fullmove));
        this.metaFields.orientation.set(this.t(`orientation_${this.config.orientation}`));
        this.metaFields.size.set(this.resolveBoardSize());
    }

    updateControls() {
        if (!this.buttons) return;
        const maxIndex = this.getMaxIndex();
        const atStart = this.currentIndex === 0;
        const atEnd = this.currentIndex >= maxIndex;
        this.buttons.first.disabled = atStart;
        this.buttons.prev.disabled = atStart;
        this.buttons.next.disabled = atEnd;
        this.buttons.last.disabled = atEnd;
    }

    updateMoveHighlight() {
        if (!this.moveItems) return;
        this.moveItems.forEach((item, idx) => {
            item.classList.toggle('active', idx + 1 === this.currentIndex);
        });
    }

    getMaxIndex() {
        if (this.config.interactive) {
            return Math.max(this.logic.getTimelineLength() - 1, 0);
        }
        return Math.max(this.timeline.length - 1, 0);
    }

    handleSquareClick(square) {
        if (!this.config.interactive || !square) return;
        if (this.promotionOverlay) return;
        const state = this.logic.getSnapshot();
        const turn = state.status.turn;

        if (this.selection && this.selection === square.coord) {
            this.resetSelectionState();
            this.updateBoard();
            this.updateStatusBlock();
            return;
        }

        if (this.selection && this.legalTargets.has(square.coord)) {
            const meta = this.pendingMoves.find(move => move.to === square.coord);
            if (meta && meta.promotion) {
                this.showPromotionDialog(this.selection, square.coord);
            } else {
                this.commitMove(this.selection, square.coord);
            }
            return;
        }

        if (square.piece && square.piece.color === turn) {
            this.setSelection(square.coord);
            return;
        }

        this.setStatusOverride(this.t('status_wait_piece'));
    }

    setSelection(coord) {
        this.selection = coord;
        this.pendingMoves = this.logic.getLegalMoves(coord);
        this.legalTargets = new Set(this.pendingMoves.map(move => move.to));
        this.setStatusOverride(this.format(this.t('status_select_target'), { square: coord }));
        this.updateBoard();
    }

    commitMove(from, to, promotion) {
        const result = this.logic.move({ from, to, promotion });
        if (!result.ok) {
            this.setStatusOverride(this.t('status_illegal'));
            return;
        }
        this.currentIndex = this.logic.getCursor();
        this.resetSelectionState();
        this.afterInteractiveMutation();
    }

    afterInteractiveMutation() {
        this.updateBoard();
        this.updateMeta();
        this.updateControls();
        this.refreshMoveList();
        this.updateMoveHighlight();
        this.updateStatusBlock();
        this.updateCaptures();
        this.updateNotationPanel();
    }

    updateStatusBlock() {
        if (!this.statusBlock) return;
        if (this.statusOverride) {
            this.statusBlock.textContent = this.statusOverride;
            return;
        }
        const state = this.getDisplayState();
        const openingInfo = this.resolveOpeningInfo(state);
        let lines = [this.describeOpening(openingInfo)];

        if (this.config.interactive && state?.status) {
            const { status } = state;
            if (status.checkmate) {
                lines.push(`${this.t('status_game_over')} · ${this.t('status_checkmate')}`);
            } else if (status.stalemate) {
                lines.push(`${this.t('status_game_over')} · ${this.t('status_stalemate')}`);
            } else if (status.draw || status.repetition) {
                lines.push(`${this.t('status_game_over')} · ${this.t('status_draw')}`);
            } else if (status.inCheck) {
                lines.push(this.t('status_check'));
            }
        }

        this.statusBlock.textContent = lines.filter(Boolean).join('\n');
    }

    updateCaptures() {
        if (!this.captureRows || !this.config.interactive) return;
        const snapshot = this.logic.getSnapshot();
        const { white = [], black = [] } = snapshot.captures || {};
        this.captureRows.white.textContent = white.length ? white.join(' ') : '—';
        this.captureRows.black.textContent = black.length ? black.join(' ') : '—';
    }

    updateNotationPanel() {
        if (!this.notationFields) return;
        const state = this.getDisplayState();
        this.notationFields.fen.set(state?.fen || this.config.fen || '');
        this.notationFields.pgn.set(this.getPgnText());
    }

    setStatusOverride(message, ttl = 1600) {
        if (!this.statusBlock) return;
        this.statusOverride = message;
        this.statusBlock.textContent = message;
        if (this.statusTimer) {
            clearTimeout(this.statusTimer);
        }
        this.statusTimer = setTimeout(() => {
            this.statusOverride = null;
            this.updateStatusBlock();
        }, ttl);
    }

    showPromotionDialog(from, to) {
        this.hidePromotionDialog();
        this.promotionOverlay = document.createElement('div');
        this.promotionOverlay.className = 'promotion-overlay';
        const dialog = document.createElement('div');
        dialog.className = 'promotion-dialog';
        const title = document.createElement('h4');
        title.textContent = this.t('promotion_title');
        const subtitle = document.createElement('p');
        subtitle.textContent = this.t('promotion_choose');
        const options = document.createElement('div');
        options.className = 'promotion-options';

        PROMOTION_CHOICES.forEach(code => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = this.t(`promotion_${code}`);
            btn.addEventListener('click', () => {
                this.commitMove(from, to, code);
                this.hidePromotionDialog();
            });
            options.appendChild(btn);
        });

        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'promotion-cancel';
        cancel.textContent = this.t('promotion_cancel');
        cancel.addEventListener('click', () => {
            this.hidePromotionDialog();
            this.setSelection(from);
        });

        dialog.append(title, subtitle, options, cancel);
        this.promotionOverlay.appendChild(dialog);
        this.boardShell.appendChild(this.promotionOverlay);
    }

    hidePromotionDialog() {
        if (this.promotionOverlay) {
            this.promotionOverlay.remove();
            this.promotionOverlay = null;
        }
    }

    setStep(index) {
        const clamped = Math.max(0, Math.min(index, this.getMaxIndex()));
        if (clamped === this.currentIndex) return;
        if (this.config.interactive) {
            const moved = this.logic.jumpTo(clamped);
            if (!moved) return;
            this.currentIndex = this.logic.getCursor();
            this.resetSelectionState();
            this.afterInteractiveMutation();
            return;
        }
        this.currentIndex = clamped;
        this.updateBoard();
        this.updateMeta();
        this.updateControls();
        this.updateMoveHighlight();
        this.updateNotationPanel();
    }

    getPgnText() {
        if (this.config.interactive) {
            return this.logic.getPgn() || '';
        }
        const moves = this.staticMoves || [];
        const ply = Math.min(Math.max(this.currentIndex, 0), moves.length);
        return this.buildPgnFromMoves(moves.slice(0, ply));
    }

    buildPgnFromMoves(moves = []) {
        if (!moves || !moves.length) return '';
        const tokens = [];
        moves.forEach((move, idx) => {
            const notation = move?.san || move?.label || this.formatMoveFallback(idx, move?.ply);
            if (!notation) return;
            if (idx % 2 === 0) {
                tokens.push(`${Math.floor(idx / 2) + 1}. ${notation}`);
            } else if (tokens.length) {
                tokens[tokens.length - 1] = `${tokens[tokens.length - 1]} ${notation}`;
            } else {
                tokens.push(notation);
            }
        });
        return tokens.join(' ');
    }

    copyToClipboard(text, btn) {
        const value = text && text !== '—' ? text : '';
        if (!value) return;
        const idleLabel = this.t('copy');
        const done = () => {
            btn.textContent = this.t('copied');
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = idleLabel;
                btn.disabled = false;
            }, 1200);
        };
        const hasClipboard = typeof navigator !== 'undefined'
            && navigator.clipboard
            && typeof navigator.clipboard.writeText === 'function';
        if (hasClipboard) {
            navigator.clipboard.writeText(value).then(done).catch(() => {
                this.fallbackCopy(value);
                done();
            });
        } else {
            this.fallbackCopy(value);
            done();
        }
    }

    fallbackCopy(value) {
        if (typeof document === 'undefined') {
            return;
        }
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.warn('[sbs-chess] copy failed', err);
        }
        document.body.removeChild(textarea);
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<div class="sbs-chess-widget error">${message}</div>`;
        }
    }
}

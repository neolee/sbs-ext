import {
    getDefaultFEN,
    parseFEN,
    boardToSquares,
    buildFileLabels,
    buildRankLabels,
    createTimelineStates,
    getStateForIndex,
    diffBoards,
    normalizeMoves,
    formatMoveLabel
} from './chess-renderer.js';
import { createLogicStub, describeUpcomingFeatures } from './game-logic.js';

const I18N = {
    zh: {
        status_display: '静态展示',
        status_interactive: '互动模式（即将上线）',
        position: '局面',
        meta_active: '行棋方',
        meta_castling: '王车易位',
        meta_enpassant: '吃过路兵',
        meta_move: '回合',
        meta_orientation: '棋盘朝向',
        meta_size: '棋盘尺寸',
        timeline: '时间轴',
        moves: '着法列表',
        flip: '翻转',
        color_white: '白方',
        color_black: '黑方',
        orientation_white: '白方在下',
        orientation_black: '黑方在下',
        move_fallback: '第 {n} 步',
        upcoming_title: '即将更新'
    },
    en: {
        status_display: 'Display only',
        status_interactive: 'Interactive (coming soon)',
        position: 'Position',
        meta_active: 'Active',
        meta_castling: 'Castling',
        meta_enpassant: 'En Passant',
        meta_move: 'Move #',
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
        upcoming_title: 'Future work'
    }
};

const DEFAULT_LANG = 'zh';

const DEFAULT_CONFIG = {
    title: 'Chess Diagram',
    fen: getDefaultFEN(),
    moves: [],
    interactive: false,
    orientation: 'white',
    size: 480,
    showControls: true,
    layout: 'full',
    showAxes: true,
    lockSize: false,
    lang: DEFAULT_LANG
};

export class ChessWidget {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container #${containerId} not found.`);
        }
        this.logic = createLogicStub();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.applyConfig(this.config);
    }

    t(key) {
        const lang = this.config?.lang || DEFAULT_LANG;
        return (I18N[lang] && I18N[lang][key]) || I18N[DEFAULT_LANG][key] || key;
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

    applyConfig(config) {
        this.config = { ...this.config, ...config };
        this.moves = normalizeMoves(this.config.moves);
        try {
            this.baseState = parseFEN(this.config.fen);
        } catch (err) {
            this.showError(err.message);
            return;
        }
        this.timeline = createTimelineStates(this.baseState, this.moves);
        if (typeof this.currentIndex !== 'number') {
            this.currentIndex = 0;
        } else {
            this.currentIndex = Math.min(this.currentIndex, this.timeline.length - 1);
        }
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.root = document.createElement('div');
        this.root.className = 'sbs-chess-widget';
        if (this.config.layout === 'board-only') {
            this.root.classList.add('board-only');
        }
        this.root.dataset.orientation = this.config.orientation;
        this.root.style.setProperty('--board-size', this.resolveBoardSize());
        this.container.appendChild(this.root);

        if (this.config.layout !== 'board-only') {
            this.renderHeader();
        }
        this.renderBoard();
        this.renderSidebar();

        this.updateBoard();
        this.updateMeta();
        this.updateControls();
        this.updateMoveHighlight();
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
        if (this.config.layout === 'board-only') {
            this.metaFields = null;
            return;
        }

        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';

        const positionBlock = document.createElement('div');
        const positionHeading = document.createElement('h4');
        positionHeading.textContent = this.t('position');
        this.metaGrid = document.createElement('div');
        this.metaGrid.className = 'board-meta';
        this.metaFields = {
            active: this.createMetaItem('meta_active'),
            castling: this.createMetaItem('meta_castling'),
            enPassant: this.createMetaItem('meta_enpassant'),
            moveCount: this.createMetaItem('meta_move'),
            orientation: this.createMetaItem('meta_orientation'),
            size: this.createMetaItem('meta_size')
        };
        Object.values(this.metaFields).forEach(item => this.metaGrid.appendChild(item.element));
        positionBlock.append(positionHeading, this.metaGrid);
        sidebar.appendChild(positionBlock);

        if (this.config.showControls) {
            this.controlsWrapper = this.createControls();
            sidebar.appendChild(this.controlsWrapper);
        }

        if (this.moves.length) {
            this.moveList = this.createMoveList();
            sidebar.appendChild(this.moveList);
        }

        const upcoming = document.createElement('div');
        upcoming.className = 'upcoming-note';
        upcoming.innerHTML = `${this.t('upcoming_title')}:<ul>${describeUpcomingFeatures(this.config.lang).map(item => `<li>${item}</li>`).join('')}</ul>`;
        sidebar.appendChild(upcoming);

        this.root.appendChild(sidebar);
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
        this.buttons.last.addEventListener('click', () => this.setStep(this.timeline.length - 1));
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
        this.moveItems = [];
        this.moves.forEach((move, idx) => {
            const li = document.createElement('li');
            li.textContent = formatMoveLabel(move, idx, (i, ply) => this.formatMoveFallback(i, ply));
            li.dataset.step = String(idx + 1);
            li.addEventListener('click', () => this.setStep(idx + 1));
            list.appendChild(li);
            this.moveItems.push(li);
        });
        container.append(heading, list);
        return container;
    }

    resolveBoardSize() {
        const { size } = this.config;
        if (typeof size === 'number') {
            return `${size}px`;
        }
        return size || '480px';
    }

    updateBoard() {
        const current = getStateForIndex(this.timeline, this.currentIndex);
        const previous = getStateForIndex(this.timeline, Math.max(this.currentIndex - 1, 0));
        const changed = previous ? diffBoards(previous, current) : new Set();
        const squares = boardToSquares(current.board, this.config.orientation);

        this.boardGrid.innerHTML = '';
        squares.forEach(square => {
            const cell = document.createElement('div');
            cell.className = `square ${square.isLight ? 'light' : 'dark'}`;
            if (changed.has(`${square.matrixRank}-${square.matrixFile}`)) {
                cell.classList.add('changed');
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
        const state = getStateForIndex(this.timeline, this.currentIndex);
        if (!this.metaFields) return;
        this.metaFields.active.set(state.activeColor === 'w' ? this.t('color_white') : this.t('color_black'));
        this.metaFields.castling.set(state.castling === '-' ? '—' : state.castling);
        this.metaFields.enPassant.set(state.enPassant || '—');
        this.metaFields.moveCount.set(String(state.fullmove));
        this.metaFields.orientation.set(this.t(`orientation_${this.config.orientation}`));
        this.metaFields.size.set(this.resolveBoardSize());
    }

    updateControls() {
        if (!this.buttons) return;
        const atStart = this.currentIndex === 0;
        const atEnd = this.currentIndex >= this.timeline.length - 1;
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

    setStep(index) {
        const clamped = Math.max(0, Math.min(index, this.timeline.length - 1));
        if (clamped === this.currentIndex) return;
        this.currentIndex = clamped;
        this.updateBoard();
        this.updateMeta();
        this.updateControls();
        this.updateMoveHighlight();
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<div class="sbs-chess-widget error">${message}</div>`;
        }
    }
}

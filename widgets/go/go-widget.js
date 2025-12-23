import { GoGame, BLACK, WHITE, EMPTY } from './go-game.js';
import { GoBoard } from './go-board.js';
import { parseSGF, sgfToCoord } from './sgf-parser.js';

export const I18N = {
    zh: {
        move: '第{n}手',
        total: '共{total}手',
        start: '回到开始',
        prev: '后退',
        next: '前进',
        end: '回到终局',
        black: '黑方',
        white: '白方',
        captures: '提子'
    },
    en: {
        move: '{n} of {total}',
        start: 'Start',
        prev: 'Prev',
        next: 'Next',
        end: 'End',
        black: 'Black',
        white: 'White',
        captures: 'Captures'
    }
};

export class GoController {
    constructor(container, options = {}) {
        this.container = container;
        this.lang = options.lang || (document.documentElement.lang === 'zh' ? 'zh' : 'en');
        this.width = options.width || null;
        this.game = new GoGame(options.size || 19);
        this.board = new GoBoard(container.querySelector('.board-container'), {
            size: options.size || 19,
            theme: options.theme || 'book',
            showCoords: options.showCoords !== undefined ? options.showCoords : true
        });

        this.rootNode = null;
        this.moves = [];
        this.currentMoveIndex = -1; // -1 means initial state (after root node setup)
        this.initialMove = options.initialMove !== undefined ? options.initialMove : -1;
        this.interactive = options.interactive || false;
        this.showMoveNumbers = options.showMoveNumbers || false; // false, true, or number

        this.init();
    }

    init() {
        if (this.width) {
            const boardContainer = this.container.querySelector('.board-container');
            if (boardContainer) {
                // Handle numeric strings by appending 'px'
                const widthValue = /^\d+$/.test(this.width) ? `${this.width}px` : this.width;
                boardContainer.style.width = widthValue;
            }
        }
        if (this.interactive) {
            this.setupControls();
        }
        this.update();
    }

    loadSGF(sgf) {
        const allNodes = parseSGF(sgf);
        if (allNodes.length === 0) return;

        // First node is usually root
        this.rootNode = allNodes[0];
        this.moves = allNodes.slice(1).filter(n => n.B || n.W);

        // Extract size from root node if present
        if (this.rootNode.SZ) {
            const size = parseInt(this.rootNode.SZ);
            this.game.reset(size);
            this.board.setSize(size);
        } else {
            this.game.reset(this.game.size);
        }

        // Handle setup stones in root node (AB, AW)
        this.applySetup(this.rootNode);

        if (this.initialMove >= 0) {
            this.goToMove(this.initialMove - 1); // SGF moves are 0-indexed in this.moves
        } else {
            this.currentMoveIndex = -1;
            this.update();
        }
    }

    applySetup(node) {
        if (node.AB) {
            const stones = Array.isArray(node.AB) ? node.AB : [node.AB];
            stones.forEach(s => {
                const coord = sgfToCoord(s);
                if (coord) this.game.set(coord[0], coord[1], BLACK);
            });
        }
        if (node.AW) {
            const stones = Array.isArray(node.AW) ? node.AW : [node.AW];
            stones.forEach(s => {
                const coord = sgfToCoord(s);
                if (coord) this.game.set(coord[0], coord[1], WHITE);
            });
        }
    }

    setupControls() {
        const controls = this.container.querySelector('.go-controls');
        if (!controls) return;

        const t = I18N[this.lang];
        controls.innerHTML = `
            <button data-action="start" title="${t.start}">⏮</button>
            <button data-action="prev" title="${t.prev}">◀</button>
            <button data-action="next" title="${t.next}">▶</button>
            <button data-action="end" title="${t.end}">⏭</button>
            <span class="move-info"></span>
        `;

        controls.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'start') this.goToMove(-1);
            else if (action === 'prev') this.goToMove(this.currentMoveIndex - 1);
            else if (action === 'next') this.goToMove(this.currentMoveIndex + 1);
            else if (action === 'end') this.goToMove(this.moves.length - 1);
        });
    }

    goToMove(index) {
        if (index < -1 || index >= this.moves.length) return;

        // Reset to initial state (after root setup)
        this.game.reset(this.game.size);
        if (this.rootNode) {
            this.applySetup(this.rootNode);
        }

        for (let i = 0; i <= index; i++) {
            const node = this.moves[i];
            if (node.B) {
                const coord = sgfToCoord(node.B);
                if (coord) this.game.play(coord[0], coord[1], BLACK);
            } else if (node.W) {
                const coord = sgfToCoord(node.W);
                if (coord) this.game.play(coord[0], coord[1], WHITE);
            }
        }
        this.currentMoveIndex = index;
        this.update();
    }

    update() {
        const markers = {};
        
        // Add move numbers if enabled
        if (this.showMoveNumbers) {
            let start = 0;
            let end = this.currentMoveIndex;

            if (typeof this.showMoveNumbers === 'number') {
                start = Math.max(0, this.currentMoveIndex - this.showMoveNumbers + 1);
            } else if (typeof this.showMoveNumbers === 'object') {
                start = (this.showMoveNumbers.start || 1) - 1;
                if (this.showMoveNumbers.end !== Infinity) {
                    end = Math.min(this.currentMoveIndex, this.showMoveNumbers.end - 1);
                }
            }
            
            for (let i = start; i <= end; i++) {
                const node = this.moves[i];
                if (!node) continue;
                const coordStr = node.B || node.W;
                if (coordStr) {
                    const coord = sgfToCoord(coordStr);
                    if (coord) {
                        const [mx, my] = coord;
                        // Only show number if the stone is still on the board
                        if (this.game.board[my * this.game.size + mx] !== EMPTY) {
                            markers[`${mx},${my}`] = { type: 'number', value: (i + 1).toString() };
                        }
                    }
                }
            }
        }

        // Add last move marker
        if (this.currentMoveIndex >= 0) {
            const lastNode = this.moves[this.currentMoveIndex];
            const coordStr = lastNode.B || lastNode.W;
            if (coordStr) {
                const [lx, ly] = sgfToCoord(coordStr);
                // Only add 'last' marker if no number marker is already there
                if (!markers[`${lx},${ly}`]) {
                    markers[`${lx},${ly}`] = { type: 'last' };
                }
            }
        }

        // Add custom markers from current node if any (LB, TR, SQ, CR)
        if (this.currentMoveIndex >= 0) {
            const node = this.moves[this.currentMoveIndex];
            this.addNodeMarkers(node, markers);
        } else if (this.rootNode) {
            this.addNodeMarkers(this.rootNode, markers);
        }

        this.board.render(this.game.board, markers);
        
        const info = this.container.querySelector('.move-info');
        if (info) {
            const t = I18N[this.lang];
            const n = this.currentMoveIndex + 1;
            const total = this.moves.length;
            if (this.lang === 'zh') {
                info.textContent = `${t.move.replace('{n}', n)} ${t.total.replace('{total}', total)}`;
            } else {
                info.textContent = t.move.replace('{n}', n).replace('{total}', total);
            }
        }
    }

    addNodeMarkers(node, markers) {
        // Labels: LB[pd:A][qc:B]
        if (node.LB) {
            const labels = Array.isArray(node.LB) ? node.LB : [node.LB];
            labels.forEach(l => {
                const [coordStr, text] = l.split(':');
                const coord = sgfToCoord(coordStr);
                if (coord) {
                    markers[`${coord[0]},${coord[1]}`] = { type: 'letter', value: text };
                }
            });
        }
        // Triangles: TR[pd][qc]
        if (node.TR) {
            const coords = Array.isArray(node.TR) ? node.TR : [node.TR];
            coords.forEach(c => {
                const coord = sgfToCoord(c);
                if (coord) markers[`${coord[0]},${coord[1]}`] = { type: 'triangle' };
            });
        }
        // Squares: SQ[pd]
        if (node.SQ) {
            const coords = Array.isArray(node.SQ) ? node.SQ : [node.SQ];
            coords.forEach(c => {
                const coord = sgfToCoord(c);
                if (coord) markers[`${coord[0]},${coord[1]}`] = { type: 'square' };
            });
        }
        // Circles: CR[pd]
        if (node.CR) {
            const coords = Array.isArray(node.CR) ? node.CR : [node.CR];
            coords.forEach(c => {
                const coord = sgfToCoord(c);
                if (coord) markers[`${coord[0]},${coord[1]}`] = { type: 'circle' };
            });
        }
    }
}

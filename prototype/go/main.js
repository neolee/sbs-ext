import { GoGame, BLACK, WHITE, EMPTY } from './go-game.js';
import { GoBoard } from './go-board.js';
import { parseSGF, sgfToCoord } from './sgf-parser.js';

const I18N = {
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

class GoController {
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
        this.interactive = options.interactive || false;
        this.showMoveNumbers = options.showMoveNumbers || false; // false, true, or number

        this.init();
    }

    init() {
        if (this.width) {
            const boardContainer = this.container.querySelector('.board-container');
            if (boardContainer) {
                boardContainer.style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
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

        this.currentMoveIndex = -1;
        this.update();
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
            const start = typeof this.showMoveNumbers === 'number' 
                ? Math.max(0, this.currentMoveIndex - this.showMoveNumbers + 1)
                : 0;
            
            for (let i = start; i <= this.currentMoveIndex; i++) {
                const node = this.moves[i];
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

// Demo initialization
document.addEventListener('DOMContentLoaded', () => {
    const demoSGF = "(;GM[1]FF[4]SZ[19]AP[SmartGo:2.7.1]CA[UTF-8]GN[Demo Game]DT[2025-12-23]PB[Black Player]PW[White Player]BR[1d]WR[1d]KM[6.5]RE[B+R];B[pd];W[dp];B[pp];W[dd];B[pj];W[nc];B[qf];W[pb];B[qc];W[kc];B[fq];W[cn];B[jp];W[dr];B[cq];W[dq];B[cp];W[co];B[br];W[cr];B[bq];W[er];B[fr];W[bs];B[ar];W[do];B[bo];W[bn];B[ap];W[cf];B[ch];W[eg];B[eh];W[fg];B[fh];W[gh];B[gi];W[hi];B[gj];W[hj];B[hk];W[ik];B[hl];W[il];B[im];W[jm];B[in];W[jn];B[jo];W[ko];B[kp];W[lo];B[lp];W[mo];B[mp];W[no];B[np];W[oo];B[po];W[on];B[pn];W[om];B[pm];W[ol];B[pl];W[ok];B[pk];W[oj];B[oi];W[ni];B[oh];W[nh];B[ng];W[mg];B[mf];W[lg];B[lf];W[kf];B[ke];W[je];B[kd];W[jd];B[lc];W[kb];B[lb];W[la];B[ma];W[ka];B[mb];W[nb];B[na];W[oa];B[mc];W[nd];B[ne];W[oe];B[of];W[pe];B[qe];W[pf];B[pg];W[qg];B[qh];W[rg];B[rh];W[rf];B[re];W[se];B[rd];W[sd];B[sc];W[sf];B[rb];W[ra];B[qa];W[pa];B[qb];W[pc];B[pd])";

    const container1 = document.getElementById('go-demo-1');
    const ctrl1 = new GoController(container1, { theme: 'book', interactive: true, lang: 'zh', width: 500 });
    ctrl1.loadSGF(demoSGF);

    const container2 = document.getElementById('go-demo-2');
    const ctrl2 = new GoController(container2, { theme: 'classic', interactive: true, lang: 'en', width: 500 });
    ctrl2.loadSGF(demoSGF);
    
    const container3 = document.getElementById('go-demo-3');
    const ctrl3 = new GoController(container3, { size: 9, theme: 'book', interactive: false, width: 240 });
    // Demo 3: 9x9 with various markers
    // AB: Setup Black, AW: Setup White
    // LB: Labels, TR: Triangles, SQ: Squares, CR: Circles
    // Added more labels on empty intersections: [de:E][ed:F][ff:G]
    ctrl3.loadSGF("(;SZ[9]AB[cc][gc][cg][gg]AW[ee][ge][ec][eg]LB[cc:1][gc:2][cg:3][gg:4][ee:A][ge:B][ec:C][eg:D][df:X][fd:Y][de:E][ed:F][ff:G]TR[df][cc]SQ[fd][gc]CR[cg][ee];B[hh])");

    const container4 = document.getElementById('go-demo-4');
    const ctrl4 = new GoController(container4, { size: 13, theme: 'classic', interactive: true, showMoveNumbers: true, width: 360 });
    ctrl4.loadSGF("(;SZ[13]AB[dd][jj][jd][dj];B[gc];W[cg];B[gg];W[cc];B[dc];W[cb];B[db];W[da];B[ea];W[ca];B[fb];W[ee];B[fe];W[ef];B[ff];W[eg];B[eh];W[dh];B[ei];W[di];B[ej];W[ek];B[fk];W[el];B[fl];W[em];B[fm];W[en];B[fn];W[eo];B[fo];W[ep];B[fp];W[eq];B[fq];W[er];B[fr];W[es];B[fs];W[dr];B[ds];W[cs];B[cr];W[br];B[bs];W[as];B[ar];W[aq];B[ap];W[ao];B[an];W[am];B[al];W[ak];B[aj];W[ai];B[ah];W[ag];B[af];W[ae];B[ad];W[ac];B[ab];W[aa])");

    const container5 = document.getElementById('go-demo-5');
    const ctrl5 = new GoController(container5, { size: 19, theme: 'book', interactive: true, showMoveNumbers: 10, width: 500 });
    ctrl5.loadSGF(demoSGF);

    const container6 = document.getElementById('go-demo-6');
    const ctrl6 = new GoController(container6, { size: 19, theme: 'book', interactive: false, showCoords: false, width: 360 });
    ctrl6.loadSGF(demoSGF);

    const container7 = document.getElementById('go-demo-7');
    const ctrl7 = new GoController(container7, { size: 19, theme: 'classic', interactive: true, width: 1000 });
    ctrl7.loadSGF(demoSGF);
});

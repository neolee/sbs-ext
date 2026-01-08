import './index.js';

const IMMORTAL_PGN = '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4';
const BLACK_VIEW_FEN = 'r1bq1rk1/pp1n1pbp/3p1np1/2pPp3/2P1P3/2N2N2/PPQBBPPP/R3K2R w KQ - 0 11';
const MOVE_LOG_PGN = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6';

const demos = [
    {
        selector: '#chess-demo-1',
        config: {
            title: 'Initial Position',
            fen: 'startpos',
            layout: 'compact'
        }
    },
    {
        selector: '#chess-demo-2',
        config: {
            title: 'Interactive Sandbox',
            fen: 'startpos',
            interactive: true,
            coords: true
        }
    },
    {
        selector: '#chess-demo-3',
        config: {
            title: 'Rich Middlegame · Black Orientation',
            fen: BLACK_VIEW_FEN,
            orientation: 'black',
            size: 360,
            layout: 'compact'
        }
    },
    {
        selector: '#chess-demo-4',
        config: {
            title: 'Move Log Only',
            fen: 'startpos',
            pgn: MOVE_LOG_PGN,
            layout: 'full'
        }
    },
    {
        selector: '#chess-demo-5',
        config: {
            title: 'Minimal Board',
            fen: 'r3k2r/pp1nbppp/2p1pn2/3p4/3P1B2/2N1PN2/PP3PPP/R2QKB1R w KQkq - 0 10',
            layout: 'mini',
            coords: true
        }
    },
    {
        selector: '#chess-demo-6',
        config: {
            title: 'Half-Size Widget',
            fen: 'rnbq1rk1/ppp2ppp/3bpn2/3p4/3P1B2/2N1PN2/PPP2PPP/R2QKB1R w KQ - 0 8',
            size: 240
        }
    },
    {
        selector: '#chess-demo-7',
        config: {
            title: 'Immortal Game Trainer',
            fen: 'startpos',
            interactive: true,
            pgn: IMMORTAL_PGN
        }
    }
];

const widgetElements = [];

function applyLanguage(lang) {
    widgetElements.forEach(el => el.setAttribute('lang', lang));
}

function applyBoardSize(value, options = {}) {
    widgetElements.forEach(el => el.setBoardSize(value, options));
    const valueLabel = document.getElementById('board-size-value');
    if (valueLabel) {
        valueLabel.textContent = `${value}px`;
    }
}

function initPageInteractions() {
    const langRadios = document.querySelectorAll('input[name="chess-lang"]');
    const initialLang = document.querySelector('input[name="chess-lang"]:checked')?.value || 'zh';
    applyLanguage(initialLang);

    langRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            applyLanguage(event.target.value);
        });
    });

    const sizeSlider = document.getElementById('board-size-control');
    const resetButton = document.getElementById('board-size-reset');

    if (sizeSlider) {
        applyBoardSize(Number(sizeSlider.value || 480));
        sizeSlider.addEventListener('input', (event) => {
            applyBoardSize(Number(event.target.value));
        });
    }

    if (resetButton && sizeSlider) {
        resetButton.addEventListener('click', () => {
            sizeSlider.value = '480';
            applyBoardSize(480);
        });
    }
}

function mountDemos() {
    demos.forEach(({ selector, config }) => {
        const element = document.querySelector(selector);
        if (!element) return;
        element.config = config;
        widgetElements.push(element);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    mountDemos();
    initPageInteractions();
});

import { ChessWidget } from './chess-widget.js';

const IMMORTAL_PGN = '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4';

const BLACK_VIEW_FEN = 'r1bq1rk1/pp1n1pbp/3p1np1/2pPp3/2P1P3/2N2N2/PPQBBPPP/R3K2R w KQ - 0 11';
const MOVE_LOG_PGN = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6';

const demos = [
    {
        id: 'chess-demo-1',
        config: {
            title: 'Initial Position',
            fen: 'startpos',
            layout: 'minimal'
        }
    },
    {
        id: 'chess-demo-2',
        config: {
            title: 'Interactive Sandbox',
            fen: 'startpos',
            interactive: true,
            showAxes: true
        }
    },
    {
        id: 'chess-demo-3',
        config: {
            title: 'Rich Middlegame · Black Orientation',
            fen: BLACK_VIEW_FEN,
            orientation: 'black',
            size: 360,
            layout: 'compact'
        }
    },
    {
        id: 'chess-demo-4',
        config: {
            title: 'Move Log Only',
            fen: 'startpos',
            pgn: MOVE_LOG_PGN,
            layout: 'full'
        }
    },
    {
        id: 'chess-demo-5',
        config: {
            title: 'Minimal Board',
            fen: 'r3k2r/pp1nbppp/2p1pn2/3p4/3P1B2/2N1PN2/PP3PPP/R2QKB1R w KQkq - 0 10',
            layout: 'board-only',
            showAxes: true
        }
    },
    {
        id: 'chess-demo-6',
        config: {
            title: 'Half-Size Widget',
            fen: 'rnbq1rk1/ppp2ppp/3bpn2/3p4/3P1B2/2N1PN2/PPP2PPP/R2QKB1R w KQ - 0 8',
            size: 240,
            lockSize: true
        }
    },
    {
        id: 'chess-demo-7',
        config: {
            title: 'Immortal Game Trainer',
            fen: 'startpos',
            interactive: true,
            pgn: IMMORTAL_PGN
        }
    }
];

const widgets = [];

document.addEventListener('DOMContentLoaded', () => {
    demos.forEach(({ id, config }) => {
        const widget = new ChessWidget(id, config);
        widgets.push(widget);
    });

    const langRadios = document.querySelectorAll('input[name="chess-lang"]');
    const getSelectedLang = () => {
        const checked = document.querySelector('input[name="chess-lang"]:checked');
        return checked ? checked.value : 'zh';
    };
    const applyLanguage = (lang) => {
        widgets.forEach(widget => widget.setLanguage(lang));
    };
    applyLanguage(getSelectedLang());
    langRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            applyLanguage(event.target.value);
        });
    });

    const slider = document.getElementById('board-size-control');
    const sliderValue = document.getElementById('board-size-value');
    const resetBtn = document.getElementById('board-size-reset');

    const applySize = (value, opts = {}) => {
        if (!sliderValue) return;
        sliderValue.textContent = `${value}px`;
        widgets.forEach(widget => widget.setBoardSize(value, opts));
    };

    if (slider) {
        applySize(Number(slider.value || 480));
        slider.addEventListener('input', (event) => {
            applySize(Number(event.target.value));
        });
    }

    if (resetBtn && slider) {
        resetBtn.addEventListener('click', () => {
            slider.value = '480';
            applySize(480);
        });
    }
});

if (typeof window !== 'undefined') {
    window.__sbsChessWidgets = widgets;
}

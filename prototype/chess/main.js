import { ChessWidget } from './chess-widget.js';

const IMMORTAL_TIMELINE = [
    {
        label: '1. e4 e5',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2'
    },
    {
        label: '2. Nf3 Nc6',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3'
    },
    {
        label: '3. Bc4 Bc5',
        fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
    },
    {
        label: '4. b4 Bxb4',
        fen: 'r1bqk1nr/pppp1ppp/2n5/4p3/P1B1P3/5N2/1PPP1PPP/RNBQK2R b KQkq - 0 4'
    }
];

const BLACK_VIEW_FEN = 'r1bq1rk1/pp1n1pbp/3p1np1/2pPp3/2P1P3/2N2N2/PPQBBPPP/R3K2R w KQ - 0 11';

const ONLY_MOVES = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6';

const demos = [
    {
        id: 'chess-demo-1',
        config: {
            title: 'Initial Position',
            fen: 'startpos',
            showControls: false
        }
    },
    {
        id: 'chess-demo-2',
        config: {
            title: 'Immortal Game (Opening)',
            fen: 'startpos',
            moves: IMMORTAL_TIMELINE,
            showControls: true
        }
    },
    {
        id: 'chess-demo-3',
        config: {
            title: 'Rich Middlegame · Black Orientation',
            fen: BLACK_VIEW_FEN,
            orientation: 'black',
            size: 360,
            showControls: false
        }
    },
    {
        id: 'chess-demo-4',
        config: {
            title: 'Move Log Only',
            fen: 'rnbqkbnr/pp3ppp/4p3/2pp4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 5',
            moves: ONLY_MOVES,
            showControls: true
        }
    },
    {
        id: 'chess-demo-5',
        config: {
            title: 'Minimal Board',
            fen: 'r3k2r/pp1nbppp/2p1pn2/3p4/3P1B2/2N1PN2/PP3PPP/R2QKB1R w KQkq - 0 10',
            layout: 'board-only',
            showControls: false,
            showAxes: true
        }
    },
    {
        id: 'chess-demo-6',
        config: {
            title: 'Half-Size Widget',
            fen: 'rnbq1rk1/ppp2ppp/3bpn2/3p4/3P1B2/2N1PN2/PPP2PPP/R2QKB1R w KQ - 0 8',
            size: 240,
            lockSize: true,
            moves: IMMORTAL_TIMELINE.slice(0, 2)
        }
    }
];

const widgets = [];

document.addEventListener('DOMContentLoaded', () => {
    demos.forEach(({ id, config }) => {
        const widget = new ChessWidget(id, config);
        widgets.push(widget);
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

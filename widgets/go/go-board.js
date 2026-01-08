/**
 * Go (Weiqi) Board Renderer
 * Renders the board using SVG.
 */

import { BLACK, WHITE, EMPTY } from './go-game.js';

const COORDS = "ABCDEFGHJKLMNOPQRST"; // 'I' is skipped

export class GoBoard {
    constructor(container, options = {}) {
        this.container = container;
        this.size = options.size || 19;
        this.coords = options.coords !== undefined ? options.coords : true;
        this.theme = options.theme || 'book'; // 'book' or 'classic'
        this.markers = options.markers || {}; // { "x,y": { type: 'last' | 'number' | 'letter', value: 'A' } }
        
        this.svg = null;
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 100 100");
        this.svg.classList.add("sbs-go-board");
        if (this.theme) this.svg.classList.add(`theme-${this.theme}`);
        this.container.appendChild(this.svg);
        this.render();
    }

    setSize(size) {
        this.size = size;
        this.render();
    }

    setTheme(theme) {
        this.theme = theme;
        this.svg.className = `sbs-go-board theme-${theme}`;
        this.render();
    }

    setCoords(show) {
        this.coords = show;
        this.render();
    }

    render(board = [], markers = {}) {
        this.svg.innerHTML = '';
        const size = this.size;
        const padding = this.coords ? 6 : 2;
        const cellSize = (100 - 2 * padding) / (size - 1);

        // Draw background
        const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bg.setAttribute("x", "0");
        bg.setAttribute("y", "0");
        bg.setAttribute("width", "100");
        bg.setAttribute("height", "100");
        bg.classList.add("board-bg");
        this.svg.appendChild(bg);

        // Draw grid
        const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gridGroup.classList.add("grid");
        for (let i = 0; i < size; i++) {
            // Horizontal lines
            const hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            hLine.setAttribute("x1", padding);
            hLine.setAttribute("y1", padding + i * cellSize);
            hLine.setAttribute("x2", 100 - padding);
            hLine.setAttribute("y2", padding + i * cellSize);
            gridGroup.appendChild(hLine);

            // Vertical lines
            const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            vLine.setAttribute("x1", padding + i * cellSize);
            vLine.setAttribute("y1", padding);
            vLine.setAttribute("x2", padding + i * cellSize);
            vLine.setAttribute("y2", 100 - padding);
            gridGroup.appendChild(vLine);
        }
        this.svg.appendChild(gridGroup);

        // Draw star points (Hoshi)
        const starPoints = this.getStarPoints(size);
        for (const [sx, sy] of starPoints) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", padding + sx * cellSize);
            circle.setAttribute("cy", padding + sy * cellSize);
            circle.setAttribute("r", 0.8);
            circle.classList.add("star-point");
            this.svg.appendChild(circle);
        }

        // Draw coordinates
        if (this.coords) {
            const coordGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            coordGroup.classList.add("coords");
            const labelPos = padding / 2;
            for (let i = 0; i < size; i++) {
                // Top/Bottom (Letters)
                const label = COORDS[i];
                coordGroup.appendChild(this.createText(padding + i * cellSize, labelPos, label));
                coordGroup.appendChild(this.createText(padding + i * cellSize, 100 - labelPos, label));

                // Left/Right (Numbers)
                const numLabel = (size - i).toString();
                coordGroup.appendChild(this.createText(labelPos, padding + i * cellSize, numLabel));
                coordGroup.appendChild(this.createText(100 - labelPos, padding + i * cellSize, numLabel));
            }
            this.svg.appendChild(coordGroup);
        }

        // Draw stones
        const stoneGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        stoneGroup.classList.add("stones");
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const color = board[y * size + x];
                if (color === BLACK || color === WHITE) {
                    const stone = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    stone.setAttribute("cx", padding + x * cellSize);
                    stone.setAttribute("cy", padding + y * cellSize);
                    stone.setAttribute("r", cellSize * 0.48);
                    stone.classList.add("stone", color === BLACK ? "black" : "white");
                    stoneGroup.appendChild(stone);

                    // Draw marker if any
                    const marker = markers[`${x},${y}`];
                    if (marker) {
                        const m = this.createMarker(padding + x * cellSize, padding + y * cellSize, marker, color, cellSize);
                        stoneGroup.appendChild(m);
                    }
                } else {
                    // Empty spot might have a marker too (e.g. for variations or labels)
                    const marker = markers[`${x},${y}`];
                    if (marker) {
                        const m = this.createMarker(padding + x * cellSize, padding + y * cellSize, marker, EMPTY, cellSize);
                        stoneGroup.appendChild(m);
                    }
                }
            }
        }
        this.svg.appendChild(stoneGroup);
    }

    getStarPoints(size) {
        if (size === 19) {
            return [
                [3, 3], [9, 3], [15, 3],
                [3, 9], [9, 9], [15, 9],
                [3, 15], [9, 15], [15, 15]
            ];
        } else if (size === 13) {
            return [
                [3, 3], [9, 3],
                [6, 6],
                [3, 9], [9, 9]
            ];
        } else if (size === 9) {
            return [
                [2, 2], [6, 2],
                [4, 4],
                [2, 6], [6, 6]
            ];
        }
        return [];
    }

    createText(x, y, text) {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", x);
        t.setAttribute("y", y);
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("dominant-baseline", "central");
        t.setAttribute("font-size", "2.2");
        t.textContent = text;
        return t;
    }

    createMarker(x, y, marker, stoneColor, cellSize) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.classList.add("marker");
        
        if (marker.type === 'last') {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", cellSize * 0.2);
            circle.setAttribute("fill", "none");
            circle.setAttribute("stroke", stoneColor === BLACK ? "white" : "black");
            circle.setAttribute("stroke-width", "0.5");
            g.appendChild(circle);
        } else if (marker.type === 'number' || marker.type === 'letter') {
            if (stoneColor === EMPTY) {
                const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                bg.setAttribute("cx", x);
                bg.setAttribute("cy", y);
                bg.setAttribute("r", cellSize * 0.35);
                bg.setAttribute("fill", "white");
                bg.setAttribute("fill-opacity", "0.8");
                g.appendChild(bg);
            }
            const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
            t.setAttribute("x", x);
            t.setAttribute("y", y);
            t.setAttribute("text-anchor", "middle");
            t.setAttribute("dominant-baseline", "central");
            
            // Adjust font size for 3-digit numbers to avoid crowding
            const valStr = String(marker.value);
            let fontSize = cellSize * 0.5;
            if (valStr.length >= 3) {
                fontSize = cellSize * 0.35; // Slightly smaller for 3 digits
            } else if (valStr.length === 2) {
                fontSize = cellSize * 0.42;
            }
            t.setAttribute("font-size", fontSize);
            
            t.setAttribute("fill", stoneColor === BLACK ? "white" : "black");
            t.textContent = marker.value;
            g.appendChild(t);
        } else if (marker.type === 'circle') {
             if (stoneColor === EMPTY) {
                const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                bg.setAttribute("cx", x);
                bg.setAttribute("cy", y);
                bg.setAttribute("r", cellSize * 0.3);
                bg.setAttribute("fill", "white");
                bg.setAttribute("fill-opacity", "0.8");
                g.appendChild(bg);
            }
             const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", cellSize * 0.25);
            circle.setAttribute("fill", "none");
            circle.setAttribute("stroke", stoneColor === BLACK ? "white" : "black");
            circle.setAttribute("stroke-width", "0.5");
            g.appendChild(circle);
        } else if (marker.type === 'square') {
            if (stoneColor === EMPTY) {
                const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                bg.setAttribute("x", x - cellSize * 0.25);
                bg.setAttribute("y", y - cellSize * 0.25);
                bg.setAttribute("width", cellSize * 0.5);
                bg.setAttribute("height", cellSize * 0.5);
                bg.setAttribute("fill", "white");
                bg.setAttribute("fill-opacity", "0.8");
                g.appendChild(bg);
            }
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x - cellSize * 0.2);
            rect.setAttribute("y", y - cellSize * 0.2);
            rect.setAttribute("width", cellSize * 0.4);
            rect.setAttribute("height", cellSize * 0.4);
            rect.setAttribute("fill", "none");
            rect.setAttribute("stroke", stoneColor === BLACK ? "white" : "black");
            rect.setAttribute("stroke-width", "0.5");
            g.appendChild(rect);
        } else if (marker.type === 'triangle') {
            if (stoneColor === EMPTY) {
                const bg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                bg.setAttribute("cx", x);
                bg.setAttribute("cy", y);
                bg.setAttribute("r", cellSize * 0.3);
                bg.setAttribute("fill", "white");
                bg.setAttribute("fill-opacity", "0.8");
                g.appendChild(bg);
            }
            const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const r = cellSize * 0.25;
            const p1 = `${x},${y - r}`;
            const p2 = `${x - r * 0.866},${y + r * 0.5}`;
            const p3 = `${x + r * 0.866},${y + r * 0.5}`;
            poly.setAttribute("points", `${p1} ${p2} ${p3}`);
            poly.setAttribute("fill", "none");
            poly.setAttribute("stroke", stoneColor === BLACK ? "white" : "black");
            poly.setAttribute("stroke-width", "0.5");
            g.appendChild(poly);
        }
        
        return g;
    }
}

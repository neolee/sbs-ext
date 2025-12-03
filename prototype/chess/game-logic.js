export function createLogicStub() {
    return {
        validateMove() {
            return { ok: false, reason: 'Interactive move validation not yet implemented' };
        },
        applyMove() {
            throw new Error('applyMove is not available in the prototype phase');
        },
        undoMove() {
            throw new Error('undoMove is not available in the prototype phase');
        }
    };
}

export function describeUpcomingFeatures() {
    return [
        'Drag-and-drop or click-to-move interactions',
        'Full legality enforcement with check detection',
        'Undo/redo history stack synchronized with rendered timeline',
        'Annotations such as arrows and highlighted squares'
    ];
}

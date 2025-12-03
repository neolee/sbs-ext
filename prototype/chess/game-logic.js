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

const UPCOMING_I18N = {
    zh: [
        '支持拖拽或点选走棋的互动体验',
        '实现完整合法性校验与将军检测',
        '提供与棋谱时间轴同步的撤销/重做栈',
        '加入箭头与高亮等注解能力'
    ],
    en: [
        'Drag-and-drop or click-to-move interactions',
        'Full legality enforcement with check detection',
        'Undo/redo history stack synchronized with rendered timeline',
        'Annotations such as arrows and highlighted squares'
    ]
};

export function describeUpcomingFeatures(lang = 'zh') {
    return UPCOMING_I18N[lang] || UPCOMING_I18N.zh;
}

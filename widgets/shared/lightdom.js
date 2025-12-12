export function normalizeAttributeEscapes(value) {
    if (typeof value !== 'string') {
        return value;
    }
    return value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

export function extractLightDomPayload(host, { scriptType, templateType, fallbackToTextContent = false } = {}) {
    if (!host) {
        return null;
    }

    if (scriptType) {
        const script = host.querySelector(`script[type="${scriptType}"]`);
        if (script && typeof script.textContent === 'string') {
            const text = script.textContent.trim();
            if (text) {
                return text;
            }
        }
    }

    if (templateType) {
        const template = host.querySelector(`template[data-type="${templateType}"]`);
        if (template) {
            const html = (template.innerHTML || '').trim();
            if (html) {
                return html;
            }
        }
    }

    if (fallbackToTextContent) {
        const text = (host.textContent || '').trim();
        return text || null;
    }

    return null;
}

export function createLightDomObserver(host, { shouldHandleMutation, onMutation } = {}) {
    if (!host) {
        throw new Error('createLightDomObserver requires a host element.');
    }
    if (typeof onMutation !== 'function') {
        throw new Error('createLightDomObserver requires an onMutation callback.');
    }

    const observer = new MutationObserver(() => {
        if (typeof shouldHandleMutation === 'function' && !shouldHandleMutation()) {
            return;
        }
        onMutation();
    });

    return {
        connect() {
            observer.observe(host, { childList: true, subtree: true, characterData: true });
        },
        disconnect() {
            observer.disconnect();
        }
    };
}

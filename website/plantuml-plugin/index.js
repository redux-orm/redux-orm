const encoder = require('plantuml-encoder');

function isUmlToken({ type, params }) {
    return type === 'fence' && params === 'uml';
}

function getTokenTransformer(url, theme) {
    return ({ tokens }) =>
        tokens.filter(isUmlToken).forEach(token =>
            transformToken({
                token,
                url,
                theme,
            }),
        );
}

function transformToken({ token, url, theme }) {
    const themed = token.content.replace('@startuml', `@startuml\n${theme}`);
    const diagramUrl = url + encoder.encode(themed);

    token.type = 'inline';
    token.content = `![](${diagramUrl})`;
    token.children = [];
}

function extractTheme({ theme }) {
    if (typeof theme === 'string') {
        return theme;
    } else if (typeof theme === 'function') {
        return theme();
    } else {
        throw Error(
            'supplied [theme] option is invalid - provide either a plantuml theme string or a function returning one',
        );
    }
}

function plantumlPlugin(opts) {
    return md =>
        md.core.ruler.after(
            'block',
            'uml',
            getTokenTransformer(opts.backendUrl, extractTheme(opts)),
        );
}

module.exports = plantumlPlugin;

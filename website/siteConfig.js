const fs = require('fs');
const plantumlPlugin = require('./plantuml-plugin');
const umlMdPlugin = plantumlPlugin({
    backendUrl: 'http://www.plantuml.com/plantuml/svg/',
    theme: () =>
        fs.readFileSync('../standalone-docs/assets/plantuml-theme.iuml'),
});

const baseUrl = '/redux-orm/';
const siteConfig = {
    title: 'Redux-ORM',
    tagline:
        'A small, simple and immutable ORM to manage relational data in your Redux store',
    url: 'https://github.com/redux-orm/redux-orm',
    baseUrl,
    docsUrl: '',
    // todo: add search once finished
    // algolia: {
    //     apiKey: '',
    //     indexName: 'redux-orm',
    //     algoliaOptions: {},
    // },

    projectName: 'redux-orm',
    organizationName: 'redux-orm',

    headerLinks: [
        { doc: 'introduction/getting-started', label: 'Getting Started' },
        { doc: 'basics/quick-start', label: 'Docs' },
        { doc: 'api/api-reference', label: 'API' },
        //         { doc: 'faq', label: 'FAQ' },
        { href: 'https://github.com/redux-orm/redux-orm', label: 'GitHub' },
    ],

    fonts: {
        logoFont: [
            'https://fonts.googleapis.com/css?family=Lato:900&display=swap',
            'sans-serif',
            '/css/custom.css',
        ],
    },
    usePrism: ['jsx', 'javascript', 'tsx', 'typescript'],
    headerIcon: 'img/redux-orm-white.svg',
    footerIcon: 'img/redux-orm-white.svg',
    favicon: '/redux-orm/img/favicon/favicon.ico',
    customDocsPath: 'standalone-docs',
    colors: {
        primaryColor: '#bc001c',
        secondaryColor: '#56000c',
        accentColor1: '#ffabb0',
        accentColor2: '#F3EAFF',
        accentColor3: '#ffabb0',
    },

    copyright: 'Copyright © 2020 Redux-ORM documentation authors.',

    highlight: {
        theme: 'darcula',
    },

    scripts: [
        `${baseUrl}scripts/sidebarScroll.js`,
        `${baseUrl}scripts/codeblock.js`,
        `${baseUrl}scripts/code-block-buttons.js`,
        'https://buttons.github.io/buttons.js',
        'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    ],
    stylesheets: [`${baseUrl}code-block-buttons.css`],
    enableUpdateTime: true,
    onPageNav: 'separate',
    cleanUrl: true,
    docsSideNavCollapsible: true,
    repoUrl: 'https://github.com/redux-orm/redux-orm',
    markdownPlugins: [umlMdPlugin],
    //todo add tracking id
    gaTrackingId: '',
};

module.exports = siteConfig;

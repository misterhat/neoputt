const h = require('hyperscript');

let indexHtml =
    '<!doctype html>' +
    h('html',
        h('head',
            h('meta', { charset: 'utf8' }),
            h('meta', {
                content: 'width=device-width,initial-scale=1.0',
                name: 'viewport'
            }),
            h('link', {
                href: '/favicon.png',
                rel: 'shortcut icon',
                type: 'image/png'
            }),
            h('link', {
                href: '/style.css',
                media: 'all',
                rel: 'stylesheet'
            }),
            h('title', 'minigolf w/ friends - neoputt')),
        h('body',
            h('script', { src: '/build/browser.bundle.js' }))).outerHTML;

module.exports = indexHtml;

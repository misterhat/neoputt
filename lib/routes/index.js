const bodyParser = require('body-parser');
const dbActions = require('../db-actions');
const indexHtml = require('../index-html');
const sendBody = require('../send-body');
const serverRouter = require('server-router');

function getSecret(req) {
    return (req.session && req.session.secret ? req.session.secret : null);
}

function getRouter(db, tokens, log) {
    const router = serverRouter({ default: '/404' });

    const indexRoute = (req, res) => sendBody.html(req, res, indexHtml);

    router.route('get', '/', indexRoute);
    router.route('get', '/index.html', indexRoute);

    router.route('post', '/course', (req, res) => {
        bodyParser.json()(req, res, () => {
            dbActions.saveCourse(db, {
                course: req.body,
                ip: req.connection.remoteAddress,
                userAgent: req.headers['user-agent']
            }, err => {
                if (err) {
                    res.statusCode = 500;
                    sendBody.json(req, res, false);
                    return;
                }

                return sendBody.json(req, res, true);
            });
        });
    });

    return router;
}

module.exports = getRouter;

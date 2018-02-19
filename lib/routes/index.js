const bodyParser = require('body-parser');
const getDbActions = require('../db-actions');
const indexHtml = require('../index-html');
const sendBody = require('../send-body');
const serverRouter = require('server-router');

function getSecret(req) {
    return (req.session && req.session.secret ? req.session.secret : null);
}

function getRouter(db, tokens, log) {
    const dbActions = getDbActions(db, log);
    const router = serverRouter({ default: '/404' });

    const indexRoute = (req, res) => sendBody.html(req, res, indexHtml);

    router.route('get', '/', indexRoute);
    router.route('get', '/index.html', indexRoute);

    router.route('post', '/course', (req, res) => {
        bodyParser.json()(req, res, () => {
            const course = req.body;

            dbActions.saveCourse(req.body, {
                ip: req.connection.remoteAddress,
                userAgent: req.headers['user-agent']
            }, (err, msg) => {
                if (err) {
                    res.statusCode = 500;
                    sendBody.json(req, res, 'server error.');
                    return;
                }

                res.statusCode = msg.statusCode;
                return sendBody.json(req, res, msg.message);
            });
        });
    });

    return router;
}

module.exports = getRouter;

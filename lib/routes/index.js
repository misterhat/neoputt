const bodyParser = require('body-parser');
const courseRoutes = require('./course');
const getDbActions = require('../db-actions');
const getVerifyToken = require('../verify-token');
const indexHtml = require('../index-html');
const lobbyRoutes = require('./lobby');
const sendBody = require('../send-body');
const serverRouter = require('server-router');
const signalRoutes = require('./signal');
const sumReq = require('../sum-req');

function getSecret(req) {
    const session = req['neoputt-session'];
    return (session && session.secret ? session.secret : null);
}

function getRouter(db, tokens, log) {
    const dbActions = getDbActions(db, log);
    const router = serverRouter();

    const indexRoute = (req, res) => sendBody.html(req, res, indexHtml);
    const verifyToken = getVerifyToken(tokens, log);

    router.route('get', '/', indexRoute);
    router.route('get', '/index.html', indexRoute);

    router.route('get', '/token.json', (req, res) => {
        if (!/^xmlhttprequest$/i.test(req.headers['x-requested-with'])) {
            sendBody.notFound(req, res);
            return;
        }

        const secret = getSecret(req);

        if (!secret) {
            res.statusCode = 401;
            sendBody.json(req, res, 'no "session" cookie');
            return;
        }

        const token = tokens.create(secret);
        sendBody.json(req, res, token);
    });

    courseRoutes(router, dbActions, verifyToken, log);
    lobbyRoutes(router, dbActions, verifyToken, log);
    signalRoutes(router, dbActions, verifyToken, log);

    return router;
}

module.exports = getRouter;

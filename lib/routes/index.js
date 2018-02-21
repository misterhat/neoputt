const Course = require('../course');
const bodyParser = require('body-parser');
const getDbActions = require('../db-actions');
const indexHtml = require('../index-html');
const querystring = require('querystring');
const sendBody = require('../send-body');
const serverRouter = require('server-router');
const sumReq = require('../sum-req');
const validate = require('../validate');

function getSecret(req) {
    const session = req['neoputt-session'];
    return (session && session.secret ? session.secret : null);
}

function getRouter(db, tokens, log) {
    const dbActions = getDbActions(db, log);
    const router = serverRouter({ default: '/404' });

    const indexRoute = (req, res) => sendBody.html(req, res, indexHtml);

    router.route('get', '/', indexRoute);
    router.route('get', '/index.html', indexRoute);

    router.route('get', '/courses.json', (req, res) => {
        const url = req.url;
        const query = querystring.parse(url.slice(url.indexOf('?') + 1));

        dbActions.getCourses({
            name: query.name
        }, (err, courses) => {
            if (err) {
                log.error(sumReq(req), err);
                sendBody.error(req, res);
                return;
            }

            sendBody.json(req, res, courses);
        });
    });

    router.route('get', '/token.json', (req, res) => {
        if (!/^xmlhttprequest$/i.test(req.headers['x-requested-with'])) {
            sendBody.notFound(req, res);
            return;
        }

        const secret = getSecret(req);

        if (!secret) {
            res.statusCode = 401;
            return sendBody.json(req, res, 'no "session" cookie');
        }

        const token = tokens.create(secret);
        sendBody.json(req, res, token);
    });

    router.route('post', '/course', (req, res) => {
        bodyParser.json()(req, res, () => {
            const token = req.body.token;
            delete req.body.token;

            if (!token || !tokens.verify(getSecret(req), token)) {
                log.info(sumReq(req), 'bad csrf token');
                res.statusCode = 401;
                sendBody.json(req, res, 'bad csrf token. resend!');
                return;
            }

            if (!validate.actions(req.body, req.body.actions.actions)) {
                res.statusCode = 409;
                sendBody.json(req, res, 'test and complete your course!');
                return;
            }

            dbActions.saveCourse(req.body, {
                ip: req.connection.remoteAddress,
                userAgent: req.headers['user-agent']
            }, (err, msg) => {
                if (err) {
                    log.error(sumReq(req), err);
                    sendBody.error(req, res);
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

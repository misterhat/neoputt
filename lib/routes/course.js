const bodyParser = require('body-parser');
const querystring = require('querystring');
const sendBody = require('../send-body');
const sumReq = require('../sum-req');
const validate = require('../validate');

function courseRoutes(router, dbActions, verifyToken, log) {
    router.route('get', '/course.json', (req, res, params) => {
        const url = req.url;
        const query = querystring.parse(url.slice(url.indexOf('?') + 1));
        const id = +query.id;

        if (isNaN(id)) {
            sendBody.notFound(req, res);
            return;
        }

        dbActions.getCourse(id, (err, course) => {
            if (err) {
                log.error(sumReq(req), err);
                sendBody.error(req, res);
                return;
            }

            if (!course) {
                sendBody.notFound(req, res);
                return;
            }

            sendBody.json(req, res, course);
        });
    });

    router.route('get', '/courses.json', (req, res) => {
        const url = req.url;
        const query = querystring.parse(url.slice(url.indexOf('?') + 1));

        dbActions.getCourses({
            name: query.name,
            page: query.page
        }, (err, courses) => {
            if (err) {
                log.error(sumReq(req), err);
                sendBody.error(req, res);
                return;
            }

            sendBody.json(req, res, courses);
        });
    });

    router.route('post', '/course', (req, res) => {
        bodyParser.json()(req, res, () => {
            if (!verifyToken(req, res)) {
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

                if (res.statusCode === 429) {
                    res.setHeader('retry-after', msg.headers['retry-after']);
                }

                sendBody.json(req, res, msg.message);
            });
        });
    });
}

module.exports = courseRoutes;

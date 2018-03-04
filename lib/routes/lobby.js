const bodyParser = require('body-parser');
const querystring = require('querystring');
const sendBody = require('../send-body');
const sumReq = require('../sum-req');

function lobbyRoutes(router, dbActions, verifyToken, log) {
    router.route('delete', '/lobby', (req, res) => {
        const url = req.url;
        const query = querystring.parse(url.slice(url.indexOf('?') + 1));
        const lobbyId = +query.id;

        if (isNaN(lobbyId)) {
            sendBody.notFound(req, res);
            return;
        }

        bodyParser.json()(req, res, () => {
            if (!verifyToken(req, res)) {
                return;
            }

            dbActions.deleteLobby(lobbyId, {
                ip: req.connection.remoteAddress
            }, (err) => {
                if (err) {
                    log.error(sumReq(req), err);
                    sendBody.error(req, res);
                    return;
                }

                sendBody.json(req, res, true);
            });
        });
    });

    router.route('get', '/lobbies.json', (req, res) => {
        dbActions.getLobbies((err, lobbies) => {
            if (err) {
                log.error(sumReq(req), err);
                sendBody.error(req, res);
                return;
            }

            sendBody.json(req, res, lobbies);
        });
    });

    router.route('post', '/lobby', (req, res) => {
        bodyParser.json()(req, res, () => {
            if (!verifyToken(req, res)) {
                return;
            }

            dbActions.saveLobby(req.body, {
                ip: req.connection.remoteAddress
            }, (err, id) => {
                if (err) {
                    log.error(sumReq(req), err);
                    sendBody.error(req, res);
                    return;
                }

                sendBody.json(req, res, id);
            });
        });
    });
}

module.exports = lobbyRoutes;

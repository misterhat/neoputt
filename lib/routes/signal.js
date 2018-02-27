const bodyParser = require('body-parser');
const querystring = require('querystring');
const sendBody = require('../send-body');
const sumReq = require('../sum-req');
const validate = require('../validate');

function signalRoutes(router, dbActions, verifyToken, log) {
    router.route('get', '/signal/answer.json', (req, res) => {
        const query = querystring.parse(url.slice(url.indexOf('?') + 1));
        const offerHash = query.offer;

        if (!offerHash) {
            sendBody.notFound(req, res);
            return;
        }

        dbActions.getAnswer(offer, (err, answer) => {
            if (err) {
                log.error(sumReq(req), err);
                sendBody.error(req, res);
                return;
            }

            sendBody.json(req, res, answer);
        });
    });

    router.route('get', '/signal/offer.json', (req, res) => {
        const query = querystring.parse(url.slice(url.indexOf('?') + 1));
        const lobbyId = +query.lobby;

        if (isNaN(lobbyId)) {
            sendBody.notFound(req, res);
            return;
        }

        dbActions.getLatestOffer((err, offer) => {
            if (err) {
                log.error(sumReq(req), err);
                sendBody.error(req, res);
                return;
            }

            sendBody.json(req, res, offer);
        });
    });

    router.route('post', '/signal/answer', (req, res) => {
        const query = querystring.parse(url.slice(url.indexOf('?') + 1));
        const offerHash = query.offer;

        if (!offerHash) {
            sendBody.notFound(req, res);
            return;
        }

        bodyParser.json()(req, res, () => {
            if (!verifyToken(req, res)) {
                return;
            }

            dbActions.saveAnswer(offerHash, req.body, (err) => {
                if (err) {
                    log.error(sumReq(req), err);
                    sendBoddy.error(req, res);
                    return;
                }

                sendBody.json(req, res, true);
            });
        });
    });

    router.route('post', '/signal/offer', (req, res) => {
        const query = querystring.parse(url.slice(url.indexOf('?') + 1));
        const lobbyId = +query.lobby;

        bodyParser.json()(req, res, () => {
            dbActions.saveOffer(lobbyId, req.body, (err) => {
                if (err) {
                    log.error(sumReq(req), err);
                    sendBoddy.error(req, res);
                    return;
                }

                sendBody.json(req, res, true);
            });
        });
    });
}

module.exports = signalRoutes;

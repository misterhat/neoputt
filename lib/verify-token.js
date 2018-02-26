const sumReq = require('./sum-req');
const sendBody = require('./send-body');

function getSecret(req) {
    const session = req['neoputt-session'];
    return (session && session.secret ? session.secret : null);
}

function verifyToken(tokens, log) {
    return (req, res) => {
        const token = req.body.token;
        delete req.body.token;

        if (!token || !tokens.verify(getSecret(req), token)) {
            log.info(sumReq(req), 'bad csrf token');
            res.statusCode = 401;
            sendBody.json(req, res, 'bad csrf token. resend!');
            return false;
        }

        return true;
    };
};

module.exports = verifyToken;

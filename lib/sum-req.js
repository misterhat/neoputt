// provide an object of log-relevant http req info for bunyan
function sumReq(req) {
    return {
        headers: req.headers,
        ip: req.connection.remoteAddress,
        method: req.method,
        url: req.url
    };
}

module.exports = sumReq;

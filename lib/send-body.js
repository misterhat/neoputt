function sendHTML(req, res, str) {
    res.setHeader('content-type', 'text/html');
    res.end(str);
}

function sendJSON(req, res, obj) {
    res.setHeader('content-type', 'application/json');

    let stringified;

    try {
        stringified = JSON.stringify(obj);
    } catch (e) {
        stringified = null;
    }

    res.end(stringified);
}

function sendError(req, res) {
    res.statusCode = 500;
    sendJSON(req, res, 'server error');
}

function sendNotFound(req, res) {
    res.statusCode = 404;
    sendJSON(req, res, 'not found');
}

module.exports.error = sendError;
module.exports.html = sendHTML;
module.exports.json = sendJSON;
module.exports.notFound = sendNotFound;

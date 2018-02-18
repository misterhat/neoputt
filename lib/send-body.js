function sendHTML(req, res, str) {
    res.setHeader('content-type', 'text/html');
    res.end(str);
}

function sendJSON(req, res, obj) {
    res.setHeader('content-type', 'application/javascript;charset=utf-8');

    let stringified;

    try {
        stringified = JSON.stringify(obj);
    } catch (e) {
        stringified = null;
    }

    res.end(stringified);
}

module.exports.html = sendHTML;
module.exports.json = sendJSON;

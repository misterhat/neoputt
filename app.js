const Tokens = require('csrf');
const bunyan = require('bunyan');
const cluster = require('cluster');
const ecstatic = require('ecstatic');
const getRouter = require('./lib/routes');
const http = require('http');
const knex = require('knex');
const knexFile = require('./knexfile');
const os = require('os');
const pkg = require('./package');
const sendBody = require('./lib/send-body');
const sessionSecret = require('./lib/secret');
const sessions = require('client-sessions');
const sumReq = require('./lib/sum-req');
const tcpBind = require('tcp-bind');

const IS_DEV = process.env.NODE_ENV !== 'production';
const ONE_DAY = 60 * 60 * 24;
const ONE_YEAR = ONE_DAY * 365;

const db = knex(knexFile[IS_DEV ? 'development' : 'production' ]);
const log = bunyan({ name: pkg.name });
const staticServe = ecstatic({
  cache: (IS_DEV ? 0 : ONE_YEAR),
  gzip: false,
  handleError: false,
  root: __dirname + '/',
  serverHeader: false,
  showDir: false
});
const session = sessions({
    cookieName: 'neoputt-session',
    duration: ONE_DAY,
    secret: sessionSecret
});
const tokens = new Tokens();
const router = getRouter(db, tokens, log).start();

if (IS_DEV) {
    db.on('query', query => {
        log.info('query:', query.sql, query.bindings || '');
    });
}

function route(req, res) {
    try {
        router(req, res);
    } catch (e) {
        res.statusCode = 404;
        sendBody.json(req, res, 'not found');
    }
}

const server = http.createServer((req, res) => {
    // https://www.owasp.org/index.php/OWASP_Secure_Headers_Project
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1');

    staticServe(req, res, () => {
        session(req, res, () => {
            res.statusCode = 200;

            if (req['neoputt-session'].secret) {
                route(req, res);
                return;
            }

            tokens.secret((err, secret) => {
                if (err) {
                    log.error(sumReq(req), err);
                    res.statusCode = 500;
                    res.end(null);
                    return;
                }

                req['neoputt-session'].secret = secret;
                route(req, res);
            });
        });
    });
});

server.on('error', e => log.fatal(e));
server.listen(1337, () => {
    log.info('listening on port 1337');
});

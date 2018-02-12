#!/usr/bin/env node

const fs = require('fs');
const images = fs.readdirSync('./img/').map(f => `/img/${f}`);
const stringified = JSON.stringify([ ...images ]);

fs.writeFileSync('./assets.json', stringified);

#!/usr/bin/env node

const fs = require('fs');

const images = fs.readdirSync('./img/').map(f => `/img/${f}`);
const sounds = fs.readdirSync('./sound/').map(f => `/sound/${f}`);

const stringified = JSON.stringify([ ...images, ...sounds ]);

fs.writeFileSync('./assets.json', stringified);

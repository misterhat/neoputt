#!/usr/bin/env node
const fs = require('fs');

const images = fs.readdirSync('./assets/img/').map(f => `/img/${f}`);
const sounds = fs.readdirSync('./assets/sound/').map(f => `/sound/${f}`);

const stringified = JSON.stringify([ ...images, ...sounds ]);

fs.writeFileSync('./assets.json', stringified);

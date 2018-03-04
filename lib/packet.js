function packPacket(packet) {
    return JSON.stringify(packet);
}

function parsePacket(packet) {
    return JSON.parse(packet);
}

module.exports.pack = packPacket;
module.exports.parse = parsePacket;

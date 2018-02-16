const config = require('../config');

const MAX_STRENGTH = config.tileSize * config.maxStrength;

class SoundPlayer {
    constructor(assets) {
        this.assets = assets;

        Object.keys(this.assets).forEach(f => {
            if (/^\/sound/.test(f)) {
                this.assets[f].addEventListener('ended', () => {
                    this.assets[f].currentTime = 0;
                });
            }
        });
    }

    playShot(ball) {
        const str = ball.strength / MAX_STRENGTH;

        if (str > 0.5) {
            this.play('drive', str);
        } else {
            this.play('putt', str * 2);
        }
    }

    playBallCollision(ball, e, volume) {
        switch (e.name) {
            case 'bumper':
                return this.play('bumper', volume);
            case 'hole':
                return this.play('hole', volume);
            case 'magnet':
                return this.play('magnet', volume, false);
            case 'portal':
                return this.play('portal', volume);
            case 'wall':
                return this.play(`tap-${+(Math.random() >= 0.5)}`, volume);
        }
    }

    play(sound, volume = 1, override = true) {
        volume = volume > 1 ? 1 : volume;
        const file = this.assets[`/sound/${sound}.ogg`];

        if (!file || (!override && file.currentTime > 0)) {
            return;
        }

        file.currentTime = 0;
        file.volume = volume;
        file.play();
    }
}

module.exports = SoundPlayer;

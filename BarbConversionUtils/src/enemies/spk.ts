/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Spikes extends Enemy {

        static SPK_FALL_LEFT = 0x50 * SCALE;
        static SPK_FALL_RIGHT = 0x98 * SCALE;

        static SPK_FALL_TOP = 0x28 * SCALE;
        static SPK_FALL_BOTTOM = 0x50 * SCALE;

        static SPK_HIT_LEFT = 0x60 * SCALE;
        static SPK_HIT_RIGHT = 0x88 * SCALE;

        static FALL_RATE = 2 * TILE_SIZE;
        static FAST_FALL_RATE = 3 * TILE_SIZE;

        static spike_data = [
            {
                trigger: { left: 0x50 * SCALE, right: 0x98 * SCALE, top: 0x28, bottom: 0x50 * SCALE },
                hit: { left: 0x60 * SCALE, right: 0x88 * SCALE, top: 0x28, bottom: 0x50 * SCALE },
                fall_anim: 1,
                start_hit_frame: 2,
                last_frame: 4,
                fall_rate: [0, 0, Spikes.FALL_RATE, Spikes.FALL_RATE, Spikes.FALL_RATE]
            },
            {
                trigger: { left: 0x70 * SCALE, right: 0xB8 * SCALE, top: 0x78, bottom: 0xA0 * SCALE },
                hit: { left: 0x80 * SCALE, right: 0xA8 * SCALE, top: 0x78, bottom: 0xA0 * SCALE },
                fall_anim: 2,
                start_hit_frame: 7,
                last_frame: 7,
                fall_rate: [0, 0, Spikes.FALL_RATE, Spikes.FALL_RATE, Spikes.FAST_FALL_RATE, Spikes.FAST_FALL_RATE, Spikes.FAST_FALL_RATE, Spikes.FAST_FALL_RATE]
            }
        ];

        update() {

            var data = this.game.roomNum === 0x0A ? Spikes.spike_data[0] : Spikes.spike_data[1];

            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Enemy.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Enemy.FIXED_TIMESTEP; // save remainder

                if ((this.animNum == data['fall_anim'] && this.frame === data['last_frame']) || this.animNum == 3) {
                    this.animNum = 3;
                    this.frame = 0;
                } else if (this.animNum == 0) {
                    if (this.game.hero.x > data['trigger'].left && this.game.hero.x < data['trigger'].right) {
                        if (this.game.hero.y > data['trigger'].top && this.game.hero.y < data['trigger'].bottom) {
                            this.animNum = data['fall_anim'];
                            this.frame = 0;
                        }
                    }
                } else {
                    this.animate();
                    if (this.animNum == data['fall_anim']) {
                        this.y += data['fall_rate'][this.frame];

                        if (this.frame >= data['start_hit_frame']) {
                            if (this.game.hero.x > data['hit'].left && this.game.hero.x < data['hit'].right) {
                                if (this.game.hero.y > data['hit'].top && this.game.hero.y < data['hit'].bottom) {
                                    this.game.hero.fsm.transition('Die');
                                }
                            }
                        }
                    }
                }
            }

            this.drawEnemy();
        }

    }

}
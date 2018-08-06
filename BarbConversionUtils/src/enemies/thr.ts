/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Thr extends Barbarian.GameEntity {

        static ATTACK = 1;

        static KILL_FRAMES = [7, 8, 9, 10, 11];

        static KILL_X_MIN = [
            0x70 * SCALE,
            0x68 * SCALE,
            0x58 * SCALE,
            0x50 * SCALE,
            0x40 * SCALE,
        ];

        static KILL_X_MAX = [
            0x80 * SCALE,
            0x78 * SCALE,
            0x68 * SCALE,
            0x60 * SCALE,
            0x50 * SCALE,
        ];

        constructor(game: Barbarian.Game, x, y, key: string, anim_data) {
            super(game, x, y, key, anim_data);
            this.animations.play(Thr.ATTACK);
        }

        update() {
            if (Thr.KILL_FRAMES.indexOf(this.animations.frameIndex) != -1) {
                var i = this.animations.frameIndex - Thr.KILL_FRAMES[0];
                var xMin = Thr.KILL_X_MIN[i];
                var xMax = Thr.KILL_X_MAX[i];
                if (this.game.hero.x >= xMin && this.game.hero.x < xMax) {
                    this.game.hero.fsm.transition('Die');
                }
            }
        }

    }

}
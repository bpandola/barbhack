/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Thr extends Barbarian.GameEntity {

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

        constructor(game: Barbarian.Game, x = 0, y = 0, key: string, anim_data) {
            super(game, x, y, key, anim_data);
            var attack = this.animations.getAnimation("1");
            attack.loop = true;
            attack.play();
        }

        update() {
            if (this.animations.frameIndex >= 7 && this.animations.frameIndex <= 11) {
                var i = this.animations.frameIndex - 7;
                var xMin = Thr.KILL_X_MIN[i];
                var xMax = Thr.KILL_X_MAX[i];
                if (this.game.hero.x >= xMin && this.game.hero.x < xMax) {
                    this.game.hero.fsm.transition('Die');
                }
            }
        }



    }

}
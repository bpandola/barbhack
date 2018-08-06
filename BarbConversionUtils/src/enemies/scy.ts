/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Scythe extends Barbarian.GameEntity {

        static TRIGGER_DISTANCE = 0x20 * SCALE;
        static HIT_DISTANCE = 0x10 * SCALE;

        static IDLE = 0;
        static ATTACK = 1;
        static IDLE2 = 2;

        constructor(game: Barbarian.Game, x = 0, y = 0, key: string, anim_data) {
            super(game, x, y, key, anim_data);
            var attack = this.animations.getAnimation("1");
            attack.loop = false;
            this.animations.play('0');
        }
        update() {

            if ((this.animations.animNum == Scythe.ATTACK && this.animations.currentAnim.isFinished)) {
                this.animations.play(Scythe.IDLE2);
            } else if (this.animations.animNum == Scythe.IDLE) {
                if (this.game.hero.x - this.x < Scythe.TRIGGER_DISTANCE) {
                    this.animations.play(Scythe.ATTACK);
                }
            } else {
                if (this.animations.animNum == Scythe.ATTACK) {
                    // TODO: Have a function to calculate hero/enemy delta x/y.
                    var delta = this.game.hero.x - this.x;
                    if (delta > 0 && delta < Scythe.HIT_DISTANCE) {
                        // HACK! - This is here because TripFall states assumes
                        // coming from walk/run state and moves Hero back one.
                        //this.game.hero.moveRelative(1, 0);
                        if (this.animations.frameIndex == 1) {
                            this.game.hero.fsm.transition('TripFall', true);
                        }
                    }

                }
            }
            
        }

    }

}
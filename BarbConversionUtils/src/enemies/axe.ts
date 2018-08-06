/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Axe extends Barbarian.GameEntity {

        static TRIGGER_X_MIN = 0x28 * SCALE;
        static TRIGGER_X_MAX = 0x50 * SCALE;

        static IDLE = 0;
        static ATTACK_SLOW = 1;
        static ATTACK_FAST = 2;

        static KILL_FRAMES = [2, 3, 4, 5];  // From 0xA585 in barb.exe

        static KILL_X_MIN = 0x30 * SCALE;
        static KILL_X_MAX = 0x48 * SCALE;

        static KILL_Y_MIN = 0x80 * SCALE;
        static KILL_Y_MAX = 0x90 * SCALE;

        constructor(game: Barbarian.Game, x = 0, y = 0, key: string, anim_data) {
            super(game, x, y, key, anim_data);
            var attack = this.animations.getAnimation("1");
            attack.loop = false;
            attack.onComplete.add(() => this.animations.play(Axe.IDLE));
            this.animations.play('0');
        }

        update() {
            if (this.animations.animNum == Axe.IDLE) {
                if (this.game.hero.x >= Axe.TRIGGER_X_MIN && this.game.hero.x < Axe.TRIGGER_X_MAX) {
                    this.animations.play(Axe.ATTACK_SLOW);
                }

            } else if (this.animations.animNum == Axe.ATTACK_SLOW) {

                var hitBox = new Phaser.Rectangle(Axe.KILL_X_MIN, Axe.KILL_Y_MIN, Axe.KILL_X_MAX - Axe.KILL_X_MIN + 1, Axe.KILL_Y_MAX - Axe.KILL_Y_MIN + 1);
                if (hitBox.contains(this.game.hero.x, this.game.hero.y)) {
                    if (Axe.KILL_FRAMES.indexOf(this.animations.frameIndex) != -1) {
                        this.game.hero.fsm.transition('Die');
                    }
                }
            }
        }

       

    }

}
/// <reference path="enemy.ts" />
namespace Barbarian.Enemies {

    export class Roc extends Barbarian.GameEntity {

        static IDLE = 0;
        static FLY = 1;
        static ATTACK = 2;

        static FRAME_X_MOV = [
            0x00 * SCALE,
            0x10 * SCALE,
            0x20 * SCALE,
            0x20 * SCALE,
            0x20 * SCALE,
            0x20 * SCALE,
            0x20 * SCALE,
            0x10 * SCALE,
            0x00 * SCALE,
            0x00 * SCALE,
        ];

        static FRAME_Y_MOVE = [
            0x00 * SCALE,
            -8 * SCALE,
            -8 * SCALE,
            -8 * SCALE,
            -8 * SCALE,
            -8 * SCALE,
            0x00 * SCALE,
            0x00 * SCALE,
            0x00 * SCALE,
            0x00 * SCALE,
        ];

        
        constructor(game: Barbarian.Game, x, y, key: string, anim_data) {
            super(game, x, y, key, anim_data);

            this.checkWorldBounds = true;
            this.outOfBoundsKill = true;

            let fly = this.animations.getAnimation(Roc.FLY);
            fly.loop = false;
            fly.enableUpdate = true;
            fly.onUpdate.add(() => {
                this.x += Roc.FRAME_X_MOV[this.animations.frameIndex];
                this.y += Roc.FRAME_Y_MOVE[this.animations.frameIndex];
            });
            fly.onComplete.add(() => this.animations.play(Roc.ATTACK));

            let attack = this.animations.getAnimation(Roc.ATTACK);
            attack.enableUpdate = true;
            attack.onUpdate.add(() => { this.y += TILE_SIZE; }); 
   
            this.animations.play(Roc.IDLE);
            let items = this.game.level.getRoomItems();
        }

        update() {
            if (this.animations.animNum == Roc.IDLE) {
                if (this.game.hero.y == 256) {
                    if (this.game.hero.x > 400 && this.game.hero.x < 580) {
                        this.animations.play(Roc.FLY);
                    }
                }
            } else if (this.animations.animNum == Roc.ATTACK) {
                if (this.y > this.game.hero.y - TILE_SIZE * 2 && this.y < this.game.hero.y) {
                    this.game.hero.fsm.transition('Die');
                }
            }

        }

    }

}
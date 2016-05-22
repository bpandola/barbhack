import FSM = BarbConversionUtils.StateMachine;
import Hero = BarbConversionUtils.Hero;

namespace BarbConversionUtils.HeroStates {

    export class Idle implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = 43;
            this.hero.frame = 0;
        }

        onUpdate() {
            //if (this.player.keys.down.isDown && this.player.body.touching.down) {
            //    this.player.fsm.transition('crouch');
            //} else if (this.player.keys.up.isDown && this.player.body.touching.down) {
            //    this.player.fsm.transition('jump');
            //} else if (this.player.keys.left.isDown || this.player.keys.right.isDown) {
            //    this.player.fsm.transition('walk');
            //}

            //if (this.player.keys.A.isDown) {
            //    //this.player.emitter.emit('basic', this.player.x, this.player.y/*, { total: 4 }*/);
            //}
            if (this.hero.direction == Direction.Right) {
                if (this.hero.keys.right.isDown)
                    this.hero.fsm.transition('Walk');
                else if (this.hero.keys.left.isDown)
                    this.hero.fsm.transition('ChangeDirection');
            } else if(this.hero.direction == Direction.Left) {
                if (this.hero.keys.left.isDown)
                    this.hero.fsm.transition('Walk');
                else if (this.hero.keys.right.isDown)
                    this.hero.fsm.transition('ChangeDirection');
            }

        }

        onFrameChange() {
            if (this.hero.frame == 0) {
                this.hero.animNum = this.hero.game.rnd.weightedPick([43, 43, 43, 12, 12, 13, 43])
                this.hero.frame = 0;

            }
        }

        onLeave() {
           
            
        }

    }

    export class Walk implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = 0;
            this.hero.frame = 0;
        }

        onUpdate() {
            if (!this.hero.keys.left.isDown && !this.hero.keys.right.isDown) {
                this.hero.fsm.transition('Idle');
            }
            //if (this.player.keys.down.isDown && this.player.body.touching.down) {
            //    this.player.fsm.transition('crouch');
            //} else if (this.player.keys.up.isDown && this.player.body.touching.down) {
            //    this.player.fsm.transition('jump');
            //} else if (this.player.keys.left.isDown || this.player.keys.right.isDown) {
            //    this.player.fsm.transition('walk');
            //}

            //if (this.player.keys.A.isDown) {
            //    //this.player.emitter.emit('basic', this.player.x, this.player.y/*, { total: 4 }*/);
            //}

        }

        onFrameChange() {
            if (this.hero.direction == Direction.Right)
                this.hero.tilePos.x += 1;
            else
                this.hero.tilePos.x -= 1;
           
        }

        onLeave() {


        }

    }

    export class ChangeDirection implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.ChangeDirection;
            this.hero.frame = 0;
            

            
        }

        onUpdate() {

        }

        onFrameChange() {

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.tilePos.x += (1 *adjust);
                    break;
                case 2:
                    this.hero.tilePos.x -= (1 *adjust);
                    break;
                case 3:
                    this.hero.tilePos.x += (1 * adjust);
                    break;
                case 4:
                    this.hero.tilePos.x += (1 * adjust);
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    this.hero.tilePos.x -= (3 * adjust);
                    this.hero.fsm.transition('Idle');
                    break;
            }
        }

        onLeave() {
           
            if (this.hero.direction == Direction.Left)
                this.hero.direction = Direction.Right;
            else
                this.hero.direction = Direction.Left;
        }

    }
}
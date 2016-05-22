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

            if (this.hero.keys.down.isDown) {
                if ("*+,".indexOf(this.hero.getTile(this.hero.tilePos.x, this.hero.tilePos.y)) != -1) {
                    this.hero.fsm.transition('DownLadder');
                }
            } else if (this.hero.keys.up.isDown) {
                if ("-+.".indexOf(this.hero.getTile(this.hero.tilePos.x, this.hero.tilePos.y)) != -1) {
                    this.hero.fsm.transition('UpLadder');
                }

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
            if (this.hero.direction == Direction.Right)
                this.hero.tilePos.x += 1;
            else
                this.hero.tilePos.x -= 1;
            this.hero.checkMovement();
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

            this.hero.checkMovement();
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

    export class HitWall implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.HitWall;
            this.hero.frame = 0;
        }

        onUpdate() {

        }

        onFrameChange() {

            var adjust = this.hero.direction == Direction.Left ? 1 : -1;

            switch (this.hero.frame) {
               
                case 2:
                    this.hero.tilePos.x += (1 * adjust);
                    break;
                case 5:
                    this.hero.tilePos.x += (1 * adjust);
                    break;
                case 7:
                    this.hero.tilePos.x -= (1 * adjust);
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    //this.hero.tilePos.x -= (3 * adjust);
                    this.hero.fsm.transition('Idle');
                    break;
            }
        }

        onLeave() {

            //if (this.hero.direction == Direction.Left)
            //    this.hero.direction = Direction.Right;
            //else
            //    this.hero.direction = Direction.Left;
        }

    }

    export class UpStairs implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.UpStairs;
            this.hero.frame = 0;
            var adjust = this.hero.direction == Direction.Right ? 1 : -1;
            this.hero.tilePos.x += (2 * adjust);

            var stupidAdjustment = 0;
            if (this.hero.direction == Direction.Left)
                stupidAdjustment = 1;
            this.hero.tilePos.x += stupidAdjustment;
            
        }

        onUpdate() {

        }

        onFrameChange() {
            var stupidAdjustment = 0;
            if (this.hero.direction == Direction.Left)
                stupidAdjustment = -1;
            
            if ('$&'.indexOf(this.hero.getTile(this.hero.tilePos.x+stupidAdjustment, this.hero.tilePos.y - 1)) != -1)
                this.hero.fsm.transition('Walk');

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.tilePos.x += (1 * adjust);
                    this.hero.tilePos.y -= 1;
                    break;
                case 2:
                    this.hero.tilePos.x += (1 * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                case 3:
                    this.hero.tilePos.x += (1 * adjust);
                    this.hero.tilePos.y -= 1;
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    //this.hero.tilePos.x -= (3 * adjust);
                    //this.hero.fsm.transition('Idle');
                    this.hero.tilePos.x += (1 * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                //default:
                //    this.hero.tilePos.x += 1;
                //    this.hero.tilePos.y -= 1;
            }

            
        }

        onLeave() {

            this.hero.tilePos.y -= 1;
        }

    }

    export class DownStairs implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.DownStairs;
            this.hero.frame = 0;
            var adjust = this.hero.direction == Direction.Right ? 1 : -1;
            this.hero.tilePos.x += (2 * adjust);
            var stupidAdjustment = 0;
            if (this.hero.direction == Direction.Left)
                stupidAdjustment = 1;
            this.hero.tilePos.x += stupidAdjustment;
        }

        onUpdate() {

        }

        onFrameChange() {
            var stupidAdjustment =0;
            if (this.hero.direction == Direction.Left)
                stupidAdjustment = -1;
            

            if ('%('.indexOf(this.hero.getTile(this.hero.tilePos.x+stupidAdjustment, this.hero.tilePos.y + 1)) != -1)
                this.hero.fsm.transition('Walk');

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.tilePos.x += (1 * adjust);
                    this.hero.tilePos.y += 1;
                    break;
                case 2:
                    this.hero.tilePos.x += (1 * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                case 3:
                    this.hero.tilePos.x += (1 * adjust);
                    this.hero.tilePos.y += 1;
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    //this.hero.tilePos.x -= (3 * adjust);
                    //this.hero.fsm.transition('Idle');
                    this.hero.tilePos.x += (1 * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                //default:
                //    this.hero.tilePos.x += 1;
                //    this.hero.tilePos.y -= 1;
            }


        }

        onLeave() {

            this.hero.tilePos.y += 1;
        }

    }


    export class DownLadder implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.DownLadder;
            this.hero.frame = 0;

            this.hero.direction = Direction.Down;

            var tile = this.hero.getTile(this.hero.tilePos.x, this.hero.tilePos.y);

            
            var adjust = 0;

            if (tile == '*')
                adjust = 2;
            else if (tile == ',')
                adjust = 0;
            else if (tile == '+')
                adjust = 1;
            else {
                this.hero.fsm.transition('Idle');
                return;
            }

            
            this.hero.tilePos.x += adjust;
           
        }

        onUpdate() {

        }

        onFrameChange() {
            
            if (this.hero.tilePos.y < 20) {
                if (this.hero.getTile(this.hero.tilePos.x, this.hero.tilePos.y + 1) == '.') {
                    this.hero.fsm.transition('Idle');
                    return;
                }
            }

            if (this.hero.frame == 2 || this.hero.frame == 4)
                this.hero.tilePos.y += 1;
            //switch (this.hero.frame) {


            //    default:
                
            //       this.hero.tilePos.y += 1;
            //}


        }

        onLeave() {

            this.hero.tilePos.y += 1;
            this.hero.direction = Direction.Right;
        }

    }


    export class UpLadder implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.UpLadder;
            this.hero.frame = 0;

            this.hero.direction = Direction.Up;

            var tile = this.hero.getTile(this.hero.tilePos.x, this.hero.tilePos.y);


            var adjust = 0;

            if (tile == '-')
                adjust = 2;
            else if (tile == '.')
                adjust = 0;
            else if (tile == '+')
                adjust = 1;
            else {
                this.hero.fsm.transition('Idle');
                return;
            }


            this.hero.tilePos.x += adjust;

        }

        onUpdate() {

        }

        onFrameChange() {

            if (this.hero.tilePos.y >0) {
                if (this.hero.getTile(this.hero.tilePos.x, this.hero.tilePos.y - 1) == ',') {
                    this.hero.fsm.transition('Idle');
                    return;
                }
            }

            if (this.hero.frame == 2 || this.hero.frame == 4)
                this.hero.tilePos.y -= 1;
            //switch (this.hero.frame) {


            //    default:

            //       this.hero.tilePos.y += 1;
            //}


        }

        onLeave() {

            this.hero.tilePos.y -= 1;
            this.hero.direction = Direction.Right;
        }

    }
}
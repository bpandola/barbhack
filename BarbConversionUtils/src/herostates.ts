import FSM = Barbarian.StateMachine;
import Hero = Barbarian.Hero;

namespace Barbarian.HeroStates {

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
            if (this.hero.keys.attack.isDown) {
                this.hero.fsm.transition('Attack');
                return;
            }

            if (this.hero.direction == Direction.Right) {
                if (this.hero.keys.right.isDown) {
                    if (this.hero.keys.shift.isDown) {
                        this.hero.fsm.transition('Run');
                    } else {
                        this.hero.fsm.transition('Walk');
                    }
                } else if (this.hero.keys.left.isDown)
                    this.hero.fsm.transition('ChangeDirection');
            } else if(this.hero.direction == Direction.Left) {
                if (this.hero.keys.left.isDown)
                    this.hero.fsm.transition('Walk');
                else if (this.hero.keys.right.isDown)
                    this.hero.fsm.transition('ChangeDirection');
            }

            if (this.hero.keys.down.isDown) {
                if ("*+,".indexOf(this.hero.getTile()) != -1) {
                    this.hero.fsm.transition('DownLadder');
                }
            } else if (this.hero.keys.up.isDown) {
                if ("-+.".indexOf(this.hero.getTile()) != -1) {
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
            this.hero.animNum = Animations.Walk;
            this.hero.frame = 0;
            if (this.hero.direction == Direction.Right)
                this.hero.x += Hero.TILE_SIZE;
            else
                this.hero.x -= Hero.TILE_SIZE;
            this.hero.checkMovement();
        }

        onUpdate() {
           
            if (this.hero.direction == Direction.Left && this.hero.keys.right.isDown) {
                
                this.hero.fsm.transition('ChangeDirection');
            } else if (this.hero.direction == Direction.Right && this.hero.keys.left.isDown) {
                this.hero.fsm.transition('ChangeDirection');
            } else if (!this.hero.keys.left.isDown && !this.hero.keys.right.isDown) {
                this.hero.fsm.transition('Idle');
            }
           

        }

        onFrameChange() {
            if (this.hero.direction == Direction.Right)
                this.hero.x += Hero.TILE_SIZE;
            else
                this.hero.x -= Hero.TILE_SIZE;

            this.hero.checkMovement();
        }

        onLeave() {


        }

    }

    export class Run implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.Run;
            this.hero.frame = 0;
            if (this.hero.direction == Direction.Right)
                this.hero.x += Hero.TILE_SIZE<<1;
            else
                this.hero.x -= Hero.TILE_SIZE<<1;
            this.hero.checkMovement();
        }

        onUpdate() {
            
            if (this.hero.direction == Direction.Left && this.hero.keys.right.isDown) {
                this.hero.fsm.transition('ChangeDirection');
            } else if (this.hero.direction == Direction.Right && this.hero.keys.left.isDown) {
                this.hero.fsm.transition('ChangeDirection');
            } else if (!this.hero.keys.left.isDown && !this.hero.keys.right.isDown) {
                this.hero.fsm.transition('Idle');
            }


        }

        onFrameChange() {
            if (this.hero.direction == Direction.Right)
                this.hero.x += Hero.TILE_SIZE<<1;
            else
                this.hero.x -= Hero.TILE_SIZE<<1;

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
                    this.hero.x += (Hero.TILE_SIZE *adjust);
                    break;
                case 2:
                    this.hero.x -= (Hero.TILE_SIZE  *adjust);
                    break;
                case 3:
                    this.hero.x += (Hero.TILE_SIZE  * adjust);
                    break;
                case 4:
                    this.hero.x += (Hero.TILE_SIZE  * adjust);
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    this.hero.x -= (3 * adjust * Hero.TILE_SIZE);
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
            //var adjust = this.hero.direction == Direction.Left ? -1 : 1;
            //this.hero.x += (Hero.TILE_SIZE * adjust);
        }

        onUpdate() {

        }

        onFrameChange() {

            var adjust = this.hero.direction == Direction.Left ? 1 : -1;

            switch (this.hero.frame) {
               
                case 1:
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    break;
                case 2:
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    break;
                case 3:
                    this.hero.x -= (Hero.TILE_SIZE * adjust);
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
            //var adjust = this.hero.direction == Direction.Right ? 1 : -1;
            //this.hero.x += (1 * adjust * Hero.TILE_SIZE);

            //var stupidAdjustment = 0;
            //if (this.hero.direction == Direction.Left)
            //    stupidAdjustment = 1;
            //this.hero.tilePos.x += stupidAdjustment;
            
        }

        onUpdate() {

        }

        onFrameChange() {
            //var look = this.hero.direction == Direction.Right ? -1 : 1;
            if ('$&BHE'.indexOf(this.hero.getTile(0,-1)) != -1)
                this.hero.fsm.transition('Idle');

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    this.hero.y -= Hero.TILE_SIZE;
                    break;
                case 2:
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                case 3:
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    this.hero.y -= Hero.TILE_SIZE;
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    //this.hero.tilePos.x -= (3 * adjust);
                    //this.hero.fsm.transition('Idle');
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                //default:
                //    this.hero.tilePos.x += 1;
                //    this.hero.tilePos.y -= 1;
            }

            
        }

        onLeave() {

            this.hero.y -= Hero.TILE_SIZE;
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
            //var adjust = this.hero.direction == Direction.Right ? 1 : -1;
            //this.hero.tilePos.x += (2 * adjust);
            //var stupidAdjustment = 0;
            //if (this.hero.direction == Direction.Left)
            //    stupidAdjustment = 1;
            //this.hero.tilePos.x += stupidAdjustment;
        }

        onUpdate() {

        }

        onFrameChange() {            

            if ('%AGDJ('.indexOf(this.hero.getTile(0,+1)) != -1)
                this.hero.fsm.transition('Idle');

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    this.hero.y += Hero.TILE_SIZE;
                    break;
                case 2:
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                case 3:
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    this.hero.y += Hero.TILE_SIZE;
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    //this.hero.tilePos.x -= (3 * adjust);
                    //this.hero.fsm.transition('Idle');
                    this.hero.x += (Hero.TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                //default:
                //    this.hero.tilePos.x += 1;
                //    this.hero.tilePos.y -= 1;
            }

        }

        onLeave() {

            this.hero.y += Hero.TILE_SIZE;
            var move = this.hero.direction == Direction.Left ? -Hero.TILE_SIZE : Hero.TILE_SIZE;
            this.hero.x += move;
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

           

            var tile = this.hero.getTile();

            
            var adjust = 0;

            if (tile == '*')
                adjust = 1;
            else if (tile == ',')
                adjust = -1;
            else if (tile == '+')
                adjust = 0;
            else {
                this.hero.fsm.transition('Idle');
                return;
            }

            
            this.hero.x += this.hero.direction == Direction.Right ? adjust * Hero.TILE_SIZE: -adjust * Hero.TILE_SIZE;
            this.hero.y += Hero.TILE_SIZE / 2;

            this.hero.direction = Direction.Down;
           
        }

        onUpdate() {

        }

        onFrameChange() {
            
            
                if (this.hero.getTile() == '.') {
                    this.hero.fsm.transition('Idle');
                    return;
                }
            
                switch (this.hero.frame) {
                    case 0:
                    case 1:
                    case 4:
                    case 5:
                        this.hero.y += Hero.TILE_SIZE / 2;
                        break;


                }
            
            //if (this.hero.frame == 2 || this.hero.frame == 4)
             //   this.hero.tilePos.y += 1;
            //switch (this.hero.frame) {


            //    default:
                
            //       this.hero.tilePos.y += 1;
            //}


        }

        onLeave() {

            //this.hero.tilePos.y += 1;
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

            

            var tile = this.hero.getTile();


            var adjust = 0;

            if (tile == '-')
                adjust = 1;
            else if (tile == '.')
                adjust = -1;
            else if (tile == '+')
                adjust = 0;
            else {
                this.hero.fsm.transition('Idle');
                return;
            }


            this.hero.x += this.hero.direction == Direction.Right ? adjust * Hero.TILE_SIZE : -adjust * Hero.TILE_SIZE;
            //this.hero.y -= Hero.TILE_SIZE / 2;
            this.hero.direction = Direction.Up;
        }

        onUpdate() {

        }

        onFrameChange() {

            
            if (this.hero.getTile() == ',') {
                this.hero.fsm.transition('Idle');
                return;
            }

            switch (this.hero.frame) {
                case 2:
                case 3:
                case 6:
                case 7:
                    this.hero.y -= Hero.TILE_SIZE / 2;
                    break;


            }
            //if (this.hero.frame == 2 || this.hero.frame == 4)
            //    this.hero.tilePos.y -= 1;
            //switch (this.hero.frame) {


            //    default:

            //       this.hero.tilePos.y += 1;
            //}


        }

        onLeave() {

            this.hero.y -= Hero.TILE_SIZE/2;
            this.hero.direction = Direction.Right;
        }

    }

    export class Attack implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            if (this.hero.weapon === Weapon.Bow)
                this.hero.animNum = Animations.ShootArrow;
            else
                this.hero.animNum = this.hero.game.rnd.integerInRange(Animations.Attack1, Animations.Attack6);
            this.hero.frame = 0;
        }

        onUpdate() {
            
           

        }

        onFrameChange() {
            if (this.hero.frame == 0) {
                this.hero.fsm.transition('Idle');

            }
        }

        onLeave() {


        }

    }

    export class TripFall implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.TripFall;
            this.hero.frame = 0;
            this.hero.x += Hero.TILE_SIZE;
        }

        onUpdate() {



        }

        onFrameChange() {
            switch (this.hero.frame) {
                case 1:
                    this.hero.x += Hero.TILE_SIZE;
                    break;
                case 2:
                    this.hero.x += Hero.TILE_SIZE;
                    break;
                case 3:
                    this.hero.x += Hero.TILE_SIZE * 2;
                    break;
                case 4: this.hero.y += Hero.TILE_SIZE;
                    break;


            }
            if (this.hero.frame == 0) {
                this.hero.fsm.transition('Fall');



            }
        }

        onLeave() {


        }

    }

    export class Fall implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.animNum = Animations.Falling;
            this.hero.frame = 0;

            this.hero.y += Hero.TILE_SIZE;
        }

        onUpdate() {



        }

        onFrameChange() {
            
            this.hero.y += Hero.TILE_SIZE;

            this.hero.checkMovement();
                  


            



            
        }

        onLeave() {
            this.hero.y -= Hero.TILE_SIZE;

        }

    }
}
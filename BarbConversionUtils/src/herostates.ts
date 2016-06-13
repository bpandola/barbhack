import FSM = Barbarian.StateMachine;
import Hero = Barbarian.Hero;

namespace Barbarian.HeroStates {

    export class Idle implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.setAnimation(Animations.Idle);
        }

        onUpdate() {
            if (this.hero.frame == 0) {
                var newAnim = this.hero.game.rnd.weightedPick([Animations.Idle, Animations.Idle, Animations.Idle, Animations.Idle1, Animations.Idle1, Animations.Idle2, Animations.Idle])
                this.hero.setAnimation(newAnim);
            }
           
        }

        onLeave() {
           
            
        }

    }

    export class Stop implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
           
            this.hero.fsm.transition('Idle');
        }

        onUpdate() {

            


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

            this.hero.setAnimation(Animations.Walk);

            if (this.hero.direction == Direction.Right)
                this.hero.x += TILE_SIZE;
            else
                this.hero.x -= TILE_SIZE;
            this.hero.checkMovement();
        }

        onUpdate() {
           
           
           
            if (this.hero.direction == Direction.Right)
                this.hero.x += TILE_SIZE;
            else
                this.hero.x -= TILE_SIZE;

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
            this.hero.setAnimation(Animations.Run);
            
            if (this.hero.direction == Direction.Right)
                this.hero.x += TILE_SIZE<<1;
            else
                this.hero.x -= TILE_SIZE<<1;
            this.hero.checkMovement();
        }

        onUpdate() {
            
           
            if (this.hero.direction == Direction.Right)
                this.hero.x += TILE_SIZE<<1;
            else
                this.hero.x -= TILE_SIZE<<1;

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
            this.hero.setAnimation(Animations.ChangeDirection);           
        }

        onUpdate() {

       

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.x += (TILE_SIZE *adjust);
                    break;
                case 2:
                    this.hero.x -= (TILE_SIZE  *adjust);
                    break;
                case 3:
                    this.hero.x += (TILE_SIZE  * adjust);
                    break;
                case 4:
                    this.hero.x += (TILE_SIZE  * adjust);
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    this.hero.x -= (3 * adjust * TILE_SIZE);
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
            //this.hero.x += (TILE_SIZE * adjust);
        }

        onUpdate() {

       

            var adjust = this.hero.direction == Direction.Left ? 1 : -1;

            switch (this.hero.frame) {
               
                case 1:
                    this.hero.x += (TILE_SIZE * adjust);
                    break;
                case 2:
                    this.hero.x += (TILE_SIZE * adjust);
                    break;
                case 3:
                    this.hero.x -= (TILE_SIZE * adjust);
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
            //this.hero.x += (1 * adjust * TILE_SIZE);

            //var stupidAdjustment = 0;
            //if (this.hero.direction == Direction.Left)
            //    stupidAdjustment = 1;
            //this.hero.tilePos.x += stupidAdjustment;
            
        }

        onUpdate() {

      
            //var look = this.hero.direction == Direction.Right ? -1 : 1;
            if ('$&BHE'.indexOf(this.hero.getTile(0,-1)) != -1)
                this.hero.fsm.transition('Idle');

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.x += (TILE_SIZE * adjust);
                    this.hero.y -= TILE_SIZE;
                    break;
                case 2:
                    this.hero.x += (TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                case 3:
                    this.hero.x += (TILE_SIZE * adjust);
                    this.hero.y -= TILE_SIZE;
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    //this.hero.tilePos.x -= (3 * adjust);
                    //this.hero.fsm.transition('Idle');
                    this.hero.x += (TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                //default:
                //    this.hero.tilePos.x += 1;
                //    this.hero.tilePos.y -= 1;
            }

            
        }

        onLeave() {

            this.hero.y -= TILE_SIZE;
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

            

            if ('%AGDJ('.indexOf(this.hero.getTile(0,+1)) != -1)
                this.hero.fsm.transition('Idle');

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.x += (TILE_SIZE * adjust);
                    this.hero.y += TILE_SIZE;
                    break;
                case 2:
                    this.hero.x += (TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                case 3:
                    this.hero.x += (TILE_SIZE * adjust);
                    this.hero.y += TILE_SIZE;
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    //this.hero.tilePos.x -= (3 * adjust);
                    //this.hero.fsm.transition('Idle');
                    this.hero.x += (TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                //default:
                //    this.hero.tilePos.x += 1;
                //    this.hero.tilePos.y -= 1;
            }

        }

        onLeave() {

            this.hero.y += TILE_SIZE;
            var move = this.hero.direction == Direction.Left ? -TILE_SIZE : TILE_SIZE;
            this.hero.x += move;
        }

    }

    export class WalkStairs implements FSM.IState {

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

            if ('%AGDJ('.indexOf(this.hero.getTile(0, +1)) != -1)
                this.hero.fsm.transition('Idle');

            var adjust = this.hero.direction == Direction.Right ? 1 : -1;

            switch (this.hero.frame) {
                case 1:
                    this.hero.x += (TILE_SIZE * adjust);
                    this.hero.y += TILE_SIZE;
                    break;
                case 2:
                    this.hero.x += (TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                case 3:
                    this.hero.x += (TILE_SIZE * adjust);
                    this.hero.y += TILE_SIZE;
                    break;
                case 0:
                    // If we hit this we've come to the end and looped back to the first frame, so we're done.
                    //this.hero.tilePos.x -= (3 * adjust);
                    //this.hero.fsm.transition('Idle');
                    this.hero.x += (TILE_SIZE * adjust);
                    //this.hero.tilePos.y -= 1;
                    break;
                //default:
                //    this.hero.tilePos.x += 1;
                //    this.hero.tilePos.y -= 1;
            }

        }

        onLeave() {

            this.hero.y += TILE_SIZE;
            var move = this.hero.direction == Direction.Left ? -TILE_SIZE : TILE_SIZE;
            this.hero.x += move;
        }

    }

    export class UseLadder implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {

            if (this.hero.direction == Direction.Down) {
                this.hero.setAnimation(Animations.DownLadder);
            } else {
                this.hero.setAnimation(Animations.UpLadder);
            }

            var tile = this.hero.getTile();


            var adjust = 0;

            if (tile == '*')
                this.hero.direction == Direction.Right ? adjust = 1 : adjust = 2;
            else if (tile == ',')
                this.hero.direction == Direction.Right ? adjust = -1 : adjust = 0;
            else if (tile == '+')
                this.hero.direction == Direction.Right ? adjust = 0 : adjust = 1;
            else {
                this.hero.fsm.transition('Idle');
                return;
            }

            this.hero.x += adjust * TILE_SIZE;
            this.hero.y += TILE_SIZE / 2;

            this.hero.direction = Direction.Down;

        }

        onUpdate() {




            if (this.hero.getTile() == '.') {
                this.hero.fsm.transition('Idle');
                return;
            }

            switch (this.hero.frame) {
                case 0:
                case 1:
                case 4:
                case 5:
                    this.hero.y += TILE_SIZE / 2;
                    break;


            }

           


        }

        onLeave() {
            this.hero.direction = Direction.Right;
        }

    }
    export class DownLadder implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {

            this.hero.setAnimation(Animations.DownLadder);
           
            var tile = this.hero.getTile();

            
            var adjust = 0;

            if (tile == '*')
                this.hero.direction == Direction.Right ? adjust = 1 : adjust = 2;
            else if (tile == ',')
                this.hero.direction == Direction.Right ? adjust = -1 : adjust = 0;
            else if (tile == '+')
                this.hero.direction == Direction.Right ? adjust = 0 : adjust = 1;
            else {
                this.hero.fsm.transition('Idle');
                return;
            }

            this.hero.x += adjust * TILE_SIZE;
            this.hero.y += TILE_SIZE / 2;

            this.hero.direction = Direction.Down;
           
        }

        onUpdate() {

      
            
            
                if (this.hero.getTile() == '.') {
                    this.hero.fsm.transition('Idle');
                    return;
                }
            
                switch (this.hero.frame) {
                    case 0:
                    case 1:
                    case 4:
                    case 5:
                        this.hero.y += TILE_SIZE / 2;
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
                this.hero.direction == Direction.Right ? adjust = 1 : adjust = 2;
            else if (tile == '.')
                this.hero.direction == Direction.Right ? adjust = -1 : adjust = 0;
            else if (tile == '+')
                this.hero.direction == Direction.Right ? adjust = 0 : adjust = 1;
            else {
                this.hero.fsm.transition('Idle');
                return;
            }

            this.hero.x += adjust * TILE_SIZE;
            //this.hero.x += this.hero.direction == Direction.Right ? adjust * TILE_SIZE : -adjust * TILE_SIZE;
            //this.hero.y -= TILE_SIZE / 2;
            this.hero.direction = Direction.Up;
        }

        onUpdate() {

       
            
            if (this.hero.getTile() == ',') {
                this.hero.fsm.transition('Idle');
                return;
            }

            switch (this.hero.frame) {
                case 2:
                case 3:
                case 6:
                case 7:
                    this.hero.y -= TILE_SIZE / 2;
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

            this.hero.y -= TILE_SIZE/2;
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
            this.hero.x += TILE_SIZE;
        }

        onUpdate() {



       
            switch (this.hero.frame) {
                case 1:
                    this.hero.x += TILE_SIZE;
                    break;
                case 2:
                    this.hero.x += TILE_SIZE;
                    break;
                case 3:
                    this.hero.x += TILE_SIZE * 2;
                    break;
                case 4: this.hero.y += TILE_SIZE;
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

            this.hero.y += TILE_SIZE;
        }

        onUpdate() {



       
            
            this.hero.y += TILE_SIZE;

            this.hero.checkMovement();
                  


            



            
        }

        onLeave() {
            this.hero.y -= TILE_SIZE;

        }

    }
}
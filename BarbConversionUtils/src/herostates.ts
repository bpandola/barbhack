﻿import FSM = Barbarian.StateMachine;
import Hero = Barbarian.Hero;

namespace Barbarian.HeroStates {

    export class Idle implements FSM.IState {

        private hero: Hero;
        // These are weighted so Idle will play the most, followed by Idle1 and Idle less frequently.
        private idleAnims: number[] = [Animations.Idle, Animations.Idle, Animations.Idle, Animations.Idle1, Animations.Idle1, Animations.Idle2, Animations.Idle];

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.setAnimation(Animations.Idle);
        }

        onUpdate() {
            if (this.hero.frame == 0) {
                var newAnim = this.hero.game.rnd.weightedPick(this.idleAnims)
                this.hero.setAnimation(newAnim);
            }
           
        }

        onLeave() {}

    }

    export class Stop implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.fsm.transition('Idle');
        }

        onUpdate() {}

        onLeave() {}

    }

    export class Walk implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.setAnimation(Animations.Walk);
        }

        onUpdate() {
            this.hero.moveRelative(1, 0);
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

        }

        onUpdate() {

            if (!this.hero.keys.shift.isDown) {
                this.hero.fsm.transition('Walk');
                return;
            }

            // Move two tiles, but check movement incrementally to make sure we don't pass over something.
            this.hero.moveRelative(1, 0);

            if (this.hero.checkMovement()) {
                // incremental move was clear, so move forward a second tile.
                this.hero.moveRelative(1, 0);
                this.hero.checkMovement();
            }
        }

        onLeave() {


        }

    }

    export class ChangeDirection implements FSM.IState {

        private hero: Hero;
        private animDone = false;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.setAnimation(Animations.ChangeDirection);
            this.animDone = false;
        }

        onUpdate() {



            var adjust = this.hero.facing == Direction.Right ? 1 : -1;

            if (this.animDone == true) {

                // If we hit this we've come to the end and looped back to the first frame, so we're done.
                this.hero.x -= (3 * adjust * TILE_SIZE);
                this.hero.fsm.transition('Idle');
                return;
            }

            switch (this.hero.frame) {
                case 1:
                    this.hero.x += (TILE_SIZE * adjust);
                    break;
                case 2:
                    this.hero.x -= (TILE_SIZE * adjust);
                    break;
                case 3:
                    this.hero.x += (TILE_SIZE * adjust);
                    break;
                case 4:
                    this.hero.x += (TILE_SIZE * adjust);
                    this.animDone = true;
                    break;

            }
        }

        onLeave() {

            if (this.hero.facing == Direction.Left) {
                this.hero.direction = this.hero.facing = Direction.Right;
            }
            else {
                this.hero.direction = this.hero.facing = Direction.Left;
            }
        }

    }

    export class HitWall implements FSM.IState {

        private hero: Hero;
        private animDone = false;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.setAnimation(Animations.HitWall);
            this.animDone = false;
        }

        onUpdate() {



            var adjust = this.hero.direction == Direction.Left ? 1 : -1;

            if (this.hero.frame == 0 && this.animDone == true) {
                this.hero.fsm.transition('Idle');
                return;
            }

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
                    if (this.animDone == false)
                        this.animDone = true;
                    break;
            }
        }

        onLeave() {


        }

    }

    export class Jump implements FSM.IState {

        private hero: Hero;
        private animDone: boolean = false;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.setAnimation(Animations.Jump);
            this.animDone = false;
        }

        onUpdate() {
            
            if (this.hero.frame == 0 && this.animDone) {
                this.hero.fsm.transition('Idle');
                return;
            }

            switch (this.hero.frame) {
                case 0:
                    this.animDone = true;
                    this.hero.moveRelative(2, 0);
                    break;
                case 2:
                    this.hero.moveRelative(2, -1);
                    break;
                case 3:
                    this.hero.moveRelative(2, -1);
                    break;
                case 4:
                    this.hero.moveRelative(2, -1);
                    break;
                case 5:
                    this.hero.moveRelative(2, 1);
                    break;
                case 6:
                    this.hero.moveRelative(2, 1);
                    break;
                case 7:
                    this.hero.moveRelative(2, 1);
                    break;
                case 8:
                    this.hero.moveRelative(1, 0);
                    break;
                case 9:
                    this.hero.moveRelative(1, 0);
                    break;
                    
            }

            this.hero.checkMovement();
        }

        onLeave() {
        }

    }

    export class TakeStairs implements FSM.IState {

        private hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            if (this.hero.direction == Direction.Up) {
                this.hero.setAnimation(Animations.UpStairs);
            } else {
                this.hero.setAnimation(Animations.DownStairs);
            }
        }

        onUpdate() {
            if (this.hero.frame % 2 == 0) {
                this.hero.moveRelative(1, 0);
            } else {
                this.hero.moveRelative(1, 1);
            }

            if (this.hero.direction == Direction.Up && this.hero.tileMap.isEntityAt(TileMapLocation.StairsTop)) {
                this.hero.fsm.transition('Idle');
            } else if (this.hero.direction == Direction.Down && this.hero.tileMap.isEntityAt(TileMapLocation.StairsBottom)) {
                this.hero.fsm.transition('Idle');
            }
        }

        onLeave() {
            if (this.hero.direction == Direction.Down)
                this.hero.moveRelative(1, 0);

            if (this.hero.facing == Direction.Right)
                this.hero.direction = Direction.Right;
            else
                this.hero.direction = Direction.Left;
        }

    }

    export class UseLadder implements FSM.IState {

        private hero: Hero;
        private downMovementFrames: number[] = [0,1,4,5];
        private upMovementFrames: number[] = [2,3,6,7];

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {

            if (this.hero.tileMap.isEntityAt(TileMapLocation.LadderTop)) {
                this.hero.setAnimation(Animations.DownLadder);
                this.hero.direction = Direction.Down;
            } else if (this.hero.tileMap.isEntityAt(TileMapLocation.LadderBottom)) {
                this.hero.setAnimation(Animations.UpLadder);
                this.hero.direction = Direction.Up;
            } else {
                this.hero.fsm.transition('Idle');
                return;
            }

            // If facing left, need to push the x coord out, so the tile is the same when we manually set facing to the right...
            if (this.hero.facing == Direction.Left)
                this.hero.moveRelative(-1, 0);
            // Ladder animation only supports facing right and it makes it easier to position player on ladder.
            this.hero.facing = Direction.Right;
            this.hero.tileMap.positionOnLadder();     
        }

        onUpdate() {

            if ((this.hero.direction == Direction.Down && this.hero.tileMap.isEntityAt(TileMapLocation.LadderBottom)) ||
                (this.hero.direction == Direction.Up && this.hero.tileMap.isEntityAt(TileMapLocation.LadderTop))) {
                this.hero.fsm.transition('Idle');
                return;
            }

            if ((this.hero.direction == Direction.Down && this.downMovementFrames.indexOf(this.hero.frame) != -1) ||
                (this.hero.direction == Direction.Up && this.upMovementFrames.indexOf(this.hero.frame) != -1)) {

                this.hero.moveRelative(0, 0.5);
            }
           
        }

        onLeave() {

            if (this.hero.direction == Direction.Up) {
                this.hero.moveRelative(0,0.5);
            }
            this.hero.direction = Direction.Right;
        }

    }

    export class Attack implements FSM.IState {

        private hero: Hero;
        private animDone = false;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            if (this.hero.weapon === Weapon.Bow)
                this.hero.setAnimation(Animations.ShootArrow);
            else
                this.hero.setAnimation(this.hero.game.rnd.integerInRange(Animations.Attack1, Animations.Attack6));

            this.animDone = false;
        }

        onUpdate() {
      
            if (this.hero.frame == 0 && this.animDone == true) {
                this.hero.fsm.transition('Idle');

            } else {
                this.animDone = true;
            }
        }

        onLeave() {


        }

    }

    export class TripFall implements FSM.IState {

        private hero: Hero;
        private animDone: boolean = false;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.setAnimation(Animations.TripFall);
           
            //this.hero.x += TILE_SIZE;
            this.hero.moveRelative(1, 0);
            this.animDone = false;

            this.hero.direction == Direction.Down;
        }

        onUpdate() {



       
            switch (this.hero.frame) {
                case 1:
                    //this.hero.x += TILE_SIZE;
                    this.hero.moveRelative(1, 0);
                    break;
                case 2:
                    //this.hero.x += TILE_SIZE;
                    this.hero.moveRelative(1, 0);
                    break;
                case 3:
                    //this.hero.x += TILE_SIZE * 2;
                    this.hero.moveRelative(2, 0);
                    break;
                case 4:
                    //this.hero.y += TILE_SIZE;
                    this.hero.moveRelative(0, 1);
                    break;


            }
            if (this.hero.frame == 0 && this.animDone) {
                this.hero.fsm.transition('Fall');



            } else {
                this.animDone = true;
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
            this.hero.setAnimation(Animations.Falling);
            this.hero.direction = Direction.Down;

            this.hero.y += TILE_SIZE;
        }

        onUpdate() {



       
            
            this.hero.y += TILE_SIZE;

            this.hero.checkMovement();
                  


            



            
        }

        onLeave() {
            this.hero.y -= TILE_SIZE;
            this.hero.direction = Direction.Right;

        }

    }

    export class Die implements FSM.IState {

        private hero: Hero;
        private animDone: boolean;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() {
            this.hero.setAnimation(Animations.HitGround);
            this.hero.direction = Direction.Down;

            this.hero.y += TILE_SIZE;
            this.animDone = false;
        }

        onUpdate() {





            if (this.hero.frame == 0 && this.animDone) {
                this.hero.frame = 3;
            } else {
                this.animDone = true;
            }







        }

        onLeave() {
            //this.hero.y -= TILE_SIZE;
            this.hero.direction = Direction.Right;

        }

    }
}
import FSM = Barbarian.StateMachine;

namespace Barbarian.HeroStates {

    export class HeroBaseState implements FSM.IState {
        protected hero: Hero;

        constructor(hero: Hero) {
            this.hero = hero;
        }

        onEnter() { }

        onUpdate() { }

        onLeave() { }
    }

    export class Idle extends HeroBaseState {

        private hasLooped: boolean;
        // These are weighted so Idle will play the most, followed by Idle1 and Idle2 less frequently.
        private idleAnims: number[] = [Animations.Idle, Animations.Idle, Animations.Idle, Animations.Idle1, Animations.Idle1, Animations.Idle2, Animations.Idle];

        onEnter() {
            // TODO:  Base our start state on the animation we're transitioning from.
            // In the DOS game, Idle1 is used after taking stairs, changing direction, etc.
            this.hero.setAnimation(Animations.Idle1);
           
            this.hasLooped = false;
        }

        onUpdate() {
            if (this.hero.frame == 0 && this.hasLooped == true) {
                var newAnim = this.hero.game.rnd.weightedPick(this.idleAnims)
                this.hero.setAnimation(newAnim);
                this.hasLooped = false;
            } else {
                this.hasLooped = true;
            }
           
        }

    }

    export class Stop extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.Idle);
            this.hero.fsm.transition('Idle', true);
        }

    }

    export class Walk extends HeroBaseState {

       onEnter() {
            this.hero.setAnimation(Animations.Walk);
        }

        onUpdate() {
            this.hero.moveRelative(1, 0);
            this.hero.checkMovement();
        }
    }

    export class Run extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.Run);
        }

        onUpdate() {
            // Move two tiles, but check movement incrementally  
            // to make sure we don't pass over something.
            this.hero.moveRelative(1, 0);

            if (this.hero.checkMovement()) {
                // incremental move was clear, so move forward a second tile.
                this.hero.moveRelative(1, 0);
                this.hero.checkMovement();
            }
        }
    }

    export class ChangeDirection extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.ChangeDirection);
        }

        onUpdate() {
            switch (this.hero.frame) {
                case 0:
                    this.hero.moveRelative(1, 0);
                    break;
                case 1:
                    this.hero.moveRelative(-1, 0);
                    break;
                case 2:
                    this.hero.moveRelative(1, 0);
                    break;
                case 3:
                    this.hero.moveRelative(1, 0);
                    break;
                case 4:
                    this.hero.fsm.transition('Idle');
                    break;
            }
        }

        onLeave() {
            this.hero.moveRelative(-3, 0);
            if (this.hero.facing == Direction.Left) {
                this.hero.direction = this.hero.facing = Direction.Right;
            }
            else {
                this.hero.direction = this.hero.facing = Direction.Left;
            }
        }
    }

    export class HitWall extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.HitWall);
        }

        onUpdate() {
            switch (this.hero.frame) {
                case 0:
                    this.hero.moveRelative(1, 0);
                case 1:
                    this.hero.moveRelative(-1, 0);
                    break;
                case 2:
                    this.hero.moveRelative(-1, 0);
                    break;
                case 3:
                    this.hero.moveRelative(1, 0);
                    break;
                case 8:
                    this.hero.fsm.transition('Idle');
            }
        }
    }

    export class Jump extends HeroBaseState {

        private animDone: boolean = false;

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

    }

    export class TakeStairs extends HeroBaseState {

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
            if (this.hero.direction == Direction.Up) {
                this.hero.moveRelative(1, 1);
            } else if (this.hero.direction == Direction.Down) {
                this.hero.moveRelative(1, 0);
            }
            if (this.hero.facing == Direction.Right)
                this.hero.direction = Direction.Right;
            else
                this.hero.direction = Direction.Left;
        }

    }

    export class UseLadder extends HeroBaseState {

        private downMovementFrames: number[] = [0,1,4,5];
        private upMovementFrames: number[] = [2,3,6,7];

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

    export class Attack extends HeroBaseState {

       
        private animDone = false;

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
    }

    export class TripFall extends HeroBaseState {

        private animDone: boolean = false;

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
                    //this.hero.moveRelative(2, 0);
                    this.hero.moveRelative(0, 1);
                    break;
                case 4:
                    //this.hero.y += TILE_SIZE;
                    //this.hero.moveRelative(0, 1);
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

    export class Fall extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.Falling);
            this.hero.direction = Direction.Down;
            // We have to check movement before and after in case we came from another
            // and/or trip and fell close to the ground (and don't need to fall).
            if (this.hero.checkMovement()) {
                this.hero.moveRelative(0, 1);
                this.hero.checkMovement();
            }
        }

        onUpdate() {
            this.hero.moveRelative(0, 1);
            this.hero.checkMovement();            
        }

        onLeave() {
            this.hero.moveRelative(0, -1);
            // Set direction to whichever way hero was facing before fall.
            this.hero.direction = this.hero.facing;
        }

    }

    export class FallDeath extends HeroBaseState {

        private animDone: boolean;

        onEnter() {
            this.hero.setAnimation(Animations.HitGround);
            this.hero.direction = Direction.Down;
            this.animDone = false;
            // We have to check movement before and after in case we came from another
            // and/or trip and fell close to the ground (and don't need to fall).
            if (this.hero.checkMovement()) {
                this.hero.moveRelative(0, 1);
            }
           
            
        }

        onUpdate() {
            if (this.hero.frame == 0 && this.animDone) {
                this.hero.frame = 3;
                this.hero.onDied.dispatch();
            } else {
                this.animDone = true;
            }
        }

        onLeave() {
            // Set direction to whichever way hero was facing before fall.
            this.hero.direction = this.hero.facing;
        }

    }

    export class Die extends HeroBaseState {

        private animDone: boolean;
        private deathAnims: number[] = [Animations.FallToGround, Animations.FallToGroundFaceFirst];

        onEnter() {
            var anim = this.hero.game.rnd.pick(this.deathAnims)
            this.hero.setAnimation(anim);
            this.animDone = false;
        }

        onUpdate() {
            if (this.hero.frame == 0 && this.animDone) {
                this.hero.frame = this.hero.animData[this.hero.animNum].frames.length-1;
                this.hero.onDied.dispatch();
            } else {
                this.animDone = true;
            }
        }

        onLeave() {
            // Set direction to whichever way hero was facing before fall.
            this.hero.direction = this.hero.facing;
        }

    }
}
﻿import FSM = Barbarian.StateMachine;

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
        // These are weighted so Idle will play the most, 
        // followed by Idle1 and Idle2 less frequently.
        private idleAnims: number[] = [
            Animations.Idle,
            Animations.Idle,
            Animations.Idle,
            Animations.Idle1,
            Animations.Idle1,
            Animations.Idle2,
            Animations.Idle];

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

    export class CarryOrb extends Walk {

        onEnter() {
            this.hero.setAnimation(Animations.CarryOrb);
            this.hero.inventory.switchWeapon(Weapon.Orb);
            this.hero.facing = Facing.Left;
        }

        onUpdate() {
            this.hero.moveRelative(1, 0);
            this.hero.checkMovement();

        }

    }

    export class ThrowOrb extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.ThrowOrb);
        }

        onUpdate() {
            if (this.hero.frame == this.hero.animData[this.hero.animNum].frames.length) {
                this.hero.frame = 0;
            }

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
            this.hero.clearInput();
        }

        onUpdate() {
            var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
            //if (this.hero.frame > 0) {
            //    movement.x = -movement.x;
            //    movement.y = -movement.y;
            //}
            this.hero.moveRelative(movement.x / TILE_SIZE, movement.y / TILE_SIZE);
            if (this.hero.frame == 4) {
                this.hero.fsm.transition('Idle', true);
            }
            //switch (this.hero.frame) {
            //    case 0:
            //        this.hero.moveRelative(1, 0);
            //        if (this.hero.facing == Direction.Left) {
            //            this.hero.facing = Direction.Right;
            //        }
            //        else {
            //            this.hero.facing = Direction.Left;
            //        }
            //        break;
            //    case 1:
            //        this.hero.moveRelative(-1, 0);
            //        break;
            //    case 2:
            //        this.hero.moveRelative(1, 0);
            //        break;
            //    case 3:
            //        this.hero.moveRelative(1, 0);
            //        break;
            //    case 4:
            //        // Need to transition immediately to Idle so OnLeave gets called
            //        // to set the Hero's direction properly.  If we don't do this,
            //        // holding down an arrow key will cause the Hero to just reverse
            //        // direction over and over without walking out of the state.
            //        this.hero.fsm.transition('Idle', true);
            //        break;
            //}
        }

        onLeave() {
            // this.hero.direction = this.hero.facing;
            this.hero.moveRelative(-3, 0);
            // TODO: Get rid of direction, it's redundant with Facing
            // Plus, I just really want to be able to do this.hero.facing ^= 1;
            if (this.hero.facing == Facing.Left) {
                this.hero.direction = Direction.Right;
                    this.hero.facing = Facing.Right;
            }
            else {
                this.hero.direction = Direction.Right;
                this.hero.facing = Facing.Left;
            }
        }
    }

    export class HitWall extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.HitWall);
            this.hero.moveRelative(-1, 0);
        }

        onUpdate() {
            var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
            this.hero.moveRelative(movement.x / TILE_SIZE, movement.y / TILE_SIZE);
            if (this.hero.frame == 8) {
                this.hero.fsm.transition('Idle');
            }
            //switch (this.hero.frame) {
            //    case 0:
            //        this.hero.moveRelative(1, 0);
            //    case 1:
            //        this.hero.moveRelative(-1, 0);
            //        break;
            //    case 2:
            //        this.hero.moveRelative(-1, 0);
            //        break;
            //    case 3:
            //        this.hero.moveRelative(1, 0);
            //        break;
            //    case 8:
            //        this.hero.fsm.transition('Idle');
            //}
        }
    }

    export class Jump extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.Jump);
        }

        onUpdate() {
            var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
            this.hero.moveRelative(movement.x / TILE_SIZE, movement.y / TILE_SIZE);
            if (this.hero.frame == 10) {
                this.hero.fsm.transition('Idle');
            }
            //switch (this.hero.frame) {
            //    case 0:
            //        this.hero.moveRelative(2, 0);
            //        break;
            //    case 2:
            //        this.hero.moveRelative(2, -1);
            //        break;
            //    case 3:
            //        this.hero.moveRelative(2, -1);
            //        break;
            //    case 4:
            //        this.hero.moveRelative(2, -1);
            //        break;
            //    case 5:
            //        this.hero.moveRelative(2, 1);
            //        break;
            //    case 6:
            //        this.hero.moveRelative(2, 1);
            //        break;
            //    case 7:
            //        this.hero.moveRelative(2, 1);
            //        break;
            //    case 8:
            //        this.hero.moveRelative(1, 0);
            //        this.hero.fsm.transition('Idle');
            //        break;                    
            //}

            this.hero.checkMovement();
        }

        onLeave() {
            // There's a tenth animation frame, but the DOS game doesn't
            // use it.  It just pushes the Hero one more tile forward
            // and transitions to the Idle1 animation.
            //this.hero.moveRelative(1, 0);
        }

    }

    export class FrontFlip extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.FrontFlip);
        }

        onUpdate() {
            var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
            this.hero.moveRelative(movement.x / TILE_SIZE, movement.y / TILE_SIZE);
            if (this.hero.frame == 10) {
                this.hero.fsm.transition('Idle');
            }
            //switch (this.hero.frame) {
            //    case 0:
            //        this.hero.moveRelative(0, 0);
            //        break;
            //    case 1:
            //        this.hero.moveRelative(0, 0);
            //        break;
            //    case 2:
            //        this.hero.moveRelative(1, -1);
            //        break;
            //    case 3:
            //        this.hero.moveRelative(2, -1);
            //        break;
            //    case 4:
            //        this.hero.moveRelative(2, -1);
            //        break;
            //    case 5:
            //        this.hero.moveRelative(2, 0);
            //        break;
            //    case 6:
            //        this.hero.moveRelative(2, 1);
            //        break;
            //    case 7:
            //        this.hero.moveRelative(2, 1);
            //        break;
            //    case 8:
            //        this.hero.moveRelative(1, 1);
            //        break;
            //    case 9:
            //        this.hero.moveRelative(0, 0);
            //        break;
            //    case 10:
            //        this.hero.fsm.transition('Idle');
            //        break;
            //}
        }
        
    }

    export class BackFlip extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.BackFlip);
        }

        onUpdate() {
            var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
            this.hero.moveRelative(movement.x / TILE_SIZE, movement.y / TILE_SIZE);
            if (this.hero.frame == 10) {
                this.hero.fsm.transition('Idle');
            }
        }

    }
    export class TakeStairs extends HeroBaseState {

        onEnter() {
            this.hero.clearInput();
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
                this.hero.fsm.transition('Walk');
            } else if (this.hero.direction == Direction.Down && this.hero.tileMap.isEntityAt(TileMapLocation.StairsBottom)) {
                this.hero.fsm.transition('Walk');
            }
        }

        onLeave() {
            if (this.hero.direction == Direction.Up) {
                this.hero.moveRelative(1, 1);
            } else if (this.hero.direction == Direction.Down) {
                this.hero.moveRelative(1, 0);
            }
            if (this.hero.facing == Facing.Right)
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
            if (this.hero.facing == Facing.Left)
                this.hero.moveRelative(-1, 0);
            // Ladder animation only supports facing right and it makes it easier to position player on ladder.
            this.hero.facing = Facing.Right;
            this.hero.tileMap.positionOnLadder();     
        }

        onUpdate() {
            if ((this.hero.direction == Direction.Down && this.downMovementFrames.indexOf(this.hero.frame) != -1) ||
                (this.hero.direction == Direction.Up && this.upMovementFrames.indexOf(this.hero.frame) != -1)) {

                this.hero.moveRelative(0, 0.5);
            }
            if ((this.hero.direction == Direction.Down && this.hero.tileMap.isEntityAt(TileMapLocation.LadderBottom)) ||
                (this.hero.direction == Direction.Up && this.hero.tileMap.isEntityAt(TileMapLocation.LadderTop))) {
                this.hero.fsm.transition('Idle');
                return;
            }

            
           
        }

        onLeave() {

            if (this.hero.direction == Direction.Up) {
                this.hero.moveRelative(0,0.5);
            }
            // Like the DOS version, you always come off a ladder facing right.
            this.hero.direction = Direction.Right;
        }

    }

    export class Attack extends HeroBaseState {

       
        private animDone;
        private arrow;
        private waitForArrow;

        onEnter() {
            if (this.hero.inventory.activeWeapon === Weapon.Bow && this.hero.inventory.numArrows) {
                this.hero.setAnimation(Animations.ShootArrow);
                
            }
            else
                this.hero.setAnimation(this.hero.game.rnd.integerInRange(Animations.Attack1, Animations.Attack6));

            this.animDone = false;
            this.arrow = null;
            this.waitForArrow = false;
        }

        onUpdate() {
            //if (this.hero.animNum == Animations.ShootArrow && this.hero.frame == 0 && this.animDone == true) {
            //    if (this.arrow != null && !this.arrow.alive)
            //        this.hero.fsm.transition('Idle');
            //    else {
            //        this.hero.frame = 0;
            //        return;
            //    }
            //}
            // BAD HACK
            if (this.animDone && !this.waitForArrow) {
                if (this.hero.animNum == Animations.ShootArrow) {
                    //this.hero.setAnimation(Animations.WaitForArrow);
                    //this.arrow = new Arrow(this.hero);
                    //this.hero.game.world.add(this.arrow);
                    //this.hero.inventory.numArrows--;
                    //this.waitForArrow = true;
                    
                } else {
                    this.hero.fsm.transition('Idle');
                }
            } else if (this.hero.frame == this.hero.animData[this.hero.animNum].frames.length - 1) {
                this.animDone = true;
                if (this.hero.animNum == Animations.ShootArrow) {
                    var arrowData = this.hero.animData[Animations.WaitForArrow].frames[0].parts.find(p => p.index == -1);
                    var x = this.hero.facing === Facing.Left ? arrowData.rx : arrowData.x;
                    var y = this.hero.facing === Facing.Left ? arrowData.ry : arrowData.y;
                    this.arrow = new Arrow(this.hero.game, this.hero.x + x, this.hero.y + y, this.hero.facing);
                    this.hero.game.world.add(this.arrow);
                    this.hero.inventory.numArrows--;
                    this.hero.fsm.transition('WaitForArrow', false, this.arrow);
                }
            }

            if (this.waitForArrow) {
                if (!this.arrow || !this.arrow.alive) {
                    this.hero.fsm.transition('Idle');
                }
            }
        }
    }

    export class WaitForArrow extends HeroBaseState {

        private arrow: Arrow;

        onEnter(...args: any[]) {
            this.arrow = args[0][0];
            this.hero.setAnimation(Animations.WaitForArrow);
            
        }

        onUpdate() {
            // Can't transition out of this state until the error has hit something or is off the screen.
            if (!this.arrow || !this.arrow.alive) {
                this.hero.fsm.transition('Idle');

            }
        }
    }

    export class PickUp extends HeroBaseState {
        private animDone = false;
        onEnter() {
            this.hero.setAnimation(Animations.PickUp);
            this.animDone = false;
        }
        onUpdate() {
            if (this.hero.frame == 0 && this.animDone) {
                this.hero.fsm.transition('Idle');
            } else {
                this.animDone = true;
            }
            if (this.hero.frame == 3) {
                var itemType = this.hero.game.level.pickUpItem(this.hero);
                this.hero.inventory.addItem(itemType);
                if (itemType == ItemType.Orb) {
                    this.hero.fsm.transition('CarryOrb');
                }
            }
        }        
    }

    export class DropWeapon extends HeroBaseState {
        private animDone = false;
        onEnter() {
            this.hero.setAnimation(Animations.DropWeapon);
            this.animDone = false;
        }
        onUpdate() {
            if (this.hero.frame == 0 && this.animDone) {
                this.hero.fsm.transition('Idle');
            } else {
                this.animDone = true;
            }
            if (this.hero.frame == 2) {
                this.hero.dropWeapon();
            }
        }
    }

    export class SwitchWeapon extends HeroBaseState {
        
        onEnter(...args: any[]) {
            console.log('SwitchWeapon onEnter');
            var newWeapon: Weapon = args[0][0]; // I think I'm doing something wrong that I have to access it like this...
            this.hero.inventory.switchWeapon(newWeapon);
            this.hero.setAnimation(Animations.SwitchWeapon);
        }

        onUpdate() {
            if (this.hero.frame == this.hero.animData[this.hero.animNum].frames.length-1) {
                this.hero.fsm.transition('Idle');
            }
        }
    }
    export class TripFall extends HeroBaseState {

        private animDone: boolean;

        onEnter() {
            this.hero.clearInput();
            this.hero.setAnimation(Animations.TripFall);
           
            this.animDone = false;

            this.hero.direction = Direction.Down;

            // HACK: Need to get this out of here...this is needed right 
            // now because walk and run checkMovement() after moving forward...
            this.hero.moveRelative(-1, 0);
        }

        onUpdate() {
            var movement = this.hero.animData[this.hero.animNum].frames[this.hero.frame].movement;
            this.hero.moveRelative(movement.x / TILE_SIZE, movement.y / TILE_SIZE);
            if (this.hero.frame == 4) {
                this.animDone = true;
            }
            

            //switch (this.hero.frame) {
            //    case 0:
            //        this.hero.moveRelative(2, 0);
            //        break;
            //    case 1:
            //        this.hero.moveRelative(1, 0);
            //        break;
            //    case 2:
            //        this.hero.moveRelative(1, 1);
            //        break;
            //    case 3:
            //        this.hero.moveRelative(2, 1);
            //        break;
            //    case 4:
            //        this.hero.moveRelative(0, 1);
            //        this.animDone = true;
            //        break;
            //}

            if (!this.hero.checkMovement())
                return;
            if (this.animDone) {
                this.hero.fsm.transition('Fall');
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
            this.hero.direction = this.hero.facing ? Direction.Left : Direction.Right;
        }

    }

    export class FallDeath extends HeroBaseState {

        private animDone: boolean;
        private deathDispatched: boolean;

        onEnter() {
            this.hero.setAnimation(Animations.HitGround);
            this.hero.direction = Direction.Down;
            this.animDone = false;
            this.deathDispatched = false;
            // We have to check movement before and after in case we came from another
            // and/or trip and fell close to the ground (and don't need to fall).
            if (this.hero.checkMovement()) {
                this.hero.moveRelative(0, 1);
            }
           
            
        }

        onUpdate() {
            if (this.hero.frame == 0 && this.animDone && !this.deathDispatched) {
                this.hero.frame = 3;
                this.hero.onDied.dispatch();
                this.deathDispatched = true;
            } else if (this.animDone && this.deathDispatched) {
                this.hero.frame = 3;
            } else {
                this.animDone = true;
            }
        }

        onLeave() {
            // Set direction to whichever way hero was facing before fall.
            this.hero.direction = this.hero.facing ? Direction.Left : Direction.Right;
        }

    }

    export class Die extends HeroBaseState {

        private animDone: boolean;
        private deathDispatched: boolean;
        private deathAnims: number[] = [Animations.FallToGround, Animations.FallToGroundFaceFirst];

        onEnter() {
            var anim = this.hero.game.rnd.pick(this.deathAnims)
            this.hero.setAnimation(anim);
            this.animDone = false;
            this.deathDispatched = false;
        }

        onUpdate() {
            if (this.animDone && this.deathDispatched) {
                this.hero.frame = this.hero.animData[this.hero.animNum].frames.length - 1;
                return;
            }
            if (this.hero.frame == 0 && this.animDone && !this.deathDispatched) {
                this.hero.frame = this.hero.animData[this.hero.animNum].frames.length-1;
                this.hero.onDied.dispatch();
                this.deathDispatched = true;
            } else {
                this.animDone = true;
            }
        }

        onLeave() {
            // Set direction to whichever way hero was facing before fall.
            this.hero.direction = this.hero.facing ? Direction.Left : Direction.Right;
        }

    }

    export class Flee extends HeroBaseState {

        onEnter() {
            this.hero.setAnimation(Animations.Flee);
            if (this.hero.facing == Facing.Left) {
                this.hero.facing = Facing.Right;
                this.hero.direction = Direction.Right;
            } else {
                this.hero.facing = Facing.Left;
                this.hero.direction = Direction.Left;
            }
            this.hero.dropWeapon();
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
}
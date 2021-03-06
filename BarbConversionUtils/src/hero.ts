﻿
namespace Barbarian {

    export enum Animations {
        Walk,
        Run,
        ChangeDirection,
        UpLadder = 4,
        DownLadder = 5,
        UpStairs = 7,
        DownStairs = 8,
        Jump = 9,
        SwitchWeapon = 10,
        Idle1 = 12,
        Idle2 = 13,
        Attack1,
        Attack2,
        Attack3,
        Attack4,
        Attack5,
        Attack6,
        ShootArrow = 22,
        WaitForArrow = 23,
        HitWall = 24,
        Flee = 26,
        FallToGround = 28,
        FallToGroundFaceFirst = 31,
        DropWeapon = 32,
        HitGround = 34,
        Falling = 36,
        TripFall = 37,
        BackFlip = 38,
        FrontFlip = 39,
        PickUp = 42,
        Idle = 43,
        CarryOrb = 44,
        ThrowOrb = 45,
    }

    export enum Weapon {
        None = 1,
        Sword = 2,
        Shield = 3,
        Bow = 4,
        Orb = 5,
    }

    export enum Direction {
        None = -1,
        Left,
        Right,
        Up,
        Down
    }

    export enum Facing {
        Right,
        Left
    }

    export class Inventory {
        numArrows: number;
        activeWeapon: Weapon;
        private availableWeapons: boolean[] = [];

        constructor() {
            this.numArrows = 10;
            this.availableWeapons[Weapon.Bow] = true;
            this.availableWeapons[Weapon.Shield] = true;
            this.availableWeapons[Weapon.Orb] = false;
            // Start with sword.
            this.availableWeapons[Weapon.Sword] = true;
            this.activeWeapon = Weapon.Bow;
        }

        hasWeapon(weapon: Weapon) {
            return this.availableWeapons[weapon];
        }

        addItem(itemType: ItemType) {
            switch (itemType) {
                case ItemType.Arrow:
                    this.numArrows++;
                    break;
                case ItemType.Bow:
                    this.availableWeapons[Weapon.Bow] = true;
                    break;
                case ItemType.Shield:
                    this.availableWeapons[Weapon.Shield] = true;
                    break;
                case ItemType.Sword:
                    this.availableWeapons[Weapon.Sword] = true;
                    break;
                case ItemType.Orb:
                    this.availableWeapons[Weapon.Orb] = true;
                    break;
            }
        }

        canSwitchWeaponTo(newWeapon: Weapon): boolean {
            //console.log(Weapon[this.activeWeapon] === Weapon[newWeapon]);
            // Can't see to get enum comparison to work with just this.activeWeapon == newWeapon ???
            //if (!this.availableWeapons[newWeapon] || Weapon[this.activeWeapon] === Weapon[newWeapon])
            if (!this.availableWeapons[newWeapon] || this.activeWeapon === newWeapon)
                return false;
            return true;
        }

        switchWeapon(newWeapon: Weapon) {
            if (this.canSwitchWeaponTo(newWeapon))
                this.activeWeapon = newWeapon;
        }

        dropWeapon() {
            this.availableWeapons[this.activeWeapon] = false;
            this.activeWeapon = Weapon.None;
        }



    }

    export class Hero extends EntityOld {
        
        tilePos: Phaser.Point = new Phaser.Point();
        public animNum: number;
        frame: number;
        animData: any;
        //weapon: Weapon;
        keys: any;
        fsm: Barbarian.StateMachine.StateMachine;
        game: Barbarian.Game;
        tileMap: TileMap;
        onDied: Phaser.Signal = new Phaser.Signal();
        inventory: Inventory;
        timeStep: number = 0;

        // HACK!!!
        bitmapData: Phaser.BitmapData;
        orb: Phaser.Sprite;
        colorIndex: number = 0;
        orbTimeStep: number = 0;

        constructor(game: Barbarian.Game, tileX: number, tileY: number) {
            super(game, 'hero');

            this.tilePos.setTo(tileX, tileY);

            this.x = tileX << TILE_SHIFT;
            this.y = tileY << TILE_SHIFT;  

            this.animData = this.game.cache.getJSON('hero');

            this.inventory = new Inventory();
            this.direction = Direction.Right;
            this.facing = Facing.Right;

            this.tileMap = new TileMap(this);

            //this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT, 'jump': Phaser.KeyCode.SPACEBAR, 'sword': Phaser.KeyCode.ONE, 'bow': Phaser.KeyCode.TWO, 'shield': Phaser.KeyCode.THREE, 'slow': Phaser.KeyCode.S, 'fast': Phaser.KeyCode.F, 'flee': Phaser.KeyCode.FOUR });
            //this.game.input.keyboard.addKeyCapture([Phaser.KeyCode.UP, Phaser.KeyCode.DOWN, Phaser.KeyCode.LEFT, Phaser.KeyCode.RIGHT, Phaser.KeyCode.SHIFT, Phaser.KeyCode.ALT, Phaser.KeyCode.SPACEBAR]);
            this.fsm = new Barbarian.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new Barbarian.HeroStates.Idle(this), [StateMachine.WILDCARD]);
            this.fsm.add('Walk', new Barbarian.HeroStates.Walk(this), ['Idle','Run', 'Flee', 'TakeStairs']);
            this.fsm.add('Jump', new Barbarian.HeroStates.Jump(this), ['Idle', 'Flee', 'Walk']);
            this.fsm.add('Stop', new Barbarian.HeroStates.Stop(this), ['Walk','Run', 'Flee']);
            this.fsm.add('ChangeDirection', new Barbarian.HeroStates.ChangeDirection(this), ['Idle','Walk','Run','Flee']);
            this.fsm.add('HitWall', new Barbarian.HeroStates.HitWall(this), ['Walk','Run','Flee']);
            this.fsm.add('UseLadder', new Barbarian.HeroStates.UseLadder(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('TakeStairs', new Barbarian.HeroStates.TakeStairs(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('Run', new Barbarian.HeroStates.Run(this), ['Idle','Walk']);
            this.fsm.add('Attack', new Barbarian.HeroStates.Attack(this), ['Idle','Walk','Run', 'Flee']);
            this.fsm.add('TripFall', new Barbarian.HeroStates.TripFall(this), ['Walk','Run','Flee']);
            this.fsm.add('Fall', new Barbarian.HeroStates.Fall(this), [StateMachine.WILDCARD]);
            this.fsm.add('FallDeath', new Barbarian.HeroStates.FallDeath(this), [StateMachine.WILDCARD]);
            this.fsm.add('Die', new Barbarian.HeroStates.Die(this), [StateMachine.WILDCARD]);
            this.fsm.add('FrontFlip', new Barbarian.HeroStates.FrontFlip(this), ['Run']);
            this.fsm.add('BackFlip', new Barbarian.HeroStates.BackFlip(this), ['Idle']);
            this.fsm.add('PickUp', new Barbarian.HeroStates.PickUp(this), ['Idle']);
            this.fsm.add('DropWeapon', new Barbarian.HeroStates.DropWeapon(this), ['Idle']);
            this.fsm.add('SwitchWeapon', new Barbarian.HeroStates.SwitchWeapon(this), ['Idle']);
            this.fsm.add('Flee', new Barbarian.HeroStates.Flee(this), [StateMachine.WILDCARD], true);
            this.fsm.add('CarryOrb', new Barbarian.HeroStates.CarryOrb(this), ['PickUp']);
            this.fsm.add('ThrowOrb', new Barbarian.HeroStates.ThrowOrb(this), ['CarryOrb']);
            this.fsm.add('WaitForArrow', new HeroStates.WaitForArrow(this), ['Attack']);
            this.fsm.transition('Idle');

            // HACKY ORB SHIT
            this.orb = game.make.sprite(0, 0, 'hero', 138);
            this.bitmapData = game.make.bitmapData(this.width, this.height);
            this.bitmapData.load(this.orb);
            this.bitmapData.update()
            var orb = <Phaser.Sprite>this.getChildAt(138);
            orb.setTexture(this.bitmapData.texture);

            

            //this.addChildAt(new Orb2(game, orb.x, orb.y), 138);
            this.render();
        }

        reset(tileX: number, tileY: number) {
            this.tilePos.setTo(tileX, tileY);
            this.x = tileX << TILE_SHIFT;
            this.y = tileY << TILE_SHIFT;  
            this.timeStep = 0;
            this.fsm.transition('Idle', true);
        }

        // Translates x/y coords, facing, and direction into the TileMap coordinate.
        getTileMapPosition(adjustX?: number, adjustY?: number): Phaser.Point {
            if (adjustX == null) { adjustX = 0 }
            if (adjustY == null) { adjustY = 0 }

            var tileX: number = -1;
            var tileY: number = -1;

            if (this.x >= TILE_SIZE && this.x <= 640) {
                tileX = this.facing == Facing.Right ? (this.x >> TILE_SHIFT) - 1 : (this.x >> TILE_SHIFT);
                tileX = tileX + (this.facing == Facing.Right ? adjustX : -adjustX);
            }

            if (this.y >= TILE_SIZE && this.y <= 320) {
                tileY = (this.y >> TILE_SHIFT) - 1;
                tileY = tileY + adjustY;
            }

            return new Phaser.Point(tileX, tileY);
        }

        setAnimation(id: Animations) {
            this.animNum = id;
            this.frame = 0;
            this.render();
        }

        get isDead(): boolean {
            if (this.fsm.getCurrentStateName == 'Die')
                return true;
            else
                return false;
        }

        get currentParts() {
            // For the hero, we return the parts for the animation frame as well as the current 
            // weapon, which is stored in the upper 4 bits of the part flags value.
            var parts: { flags: number, index: number }[] = this.animData[this.animNum].frames[this.frame].parts;
            // There are a couple animations for shooting an arrow that have a -1 as an index in the parts list...
            return parts.filter((part) => { return (part.flags < 5 || (part.flags >> 4) == this.inventory.activeWeapon) && part.index >= 0; });
        }

        get isAttackingWithSword(): boolean {
            // Ignore first frame of attack.  Seems to give more realistic results.
            return this.fsm.getCurrentStateName === 'Attack'
                && this.inventory.activeWeapon === Weapon.Sword
                && this.frame != 0;
        }

        getSwordBounds(): Phaser.Rectangle {
            var sword_indices = [133, 134, 135, 136, 137];
            for (var spr of <Phaser.Sprite[]>this.children.filter((child) => { return child.visible; }) ) {
                if (sword_indices.indexOf(<number>spr.frame) != -1) {
                    return new Phaser.Rectangle().copyFrom(spr.getBounds());
                }
            }
            return new Phaser.Rectangle();  // Empty

        }
        

        // Returns true if movement is ok, otherwise transitions to new state and returns false
        checkMovement(): boolean {
            var input = this.game.inputManager;
            // Current Tile
            switch (this.tileMap.getTile()) {

                case '3':
                    this.fsm.transition('HitWall', true);
                    return false;
                case '/':
                    if (this.direction != Direction.Down) {
                        this.fsm.transition('TripFall', true);
                        return false;
                    }
                    break;
                case '5':
                case '!':
                    if (this.direction == Direction.Down) {
                        this.fsm.transition('FallDeath', true);
                        return false;
                    }
                    break;
                case '8':
                    this.fsm.transition('ThrowOrb');
                    break;
            }

            if (this.tileMap.isEntityAt(TileMapLocation.StairsUp)) {
                this.direction = Direction.Up;
                this.fsm.transition('TakeStairs');
                return false;
            } else if (this.tileMap.isEntityAt(TileMapLocation.StairsDown)) {
                this.direction = Direction.Down;
                this.fsm.transition('TakeStairs');
                return false;
            } else if (this.tileMap.isEntityAt(TileMapLocation.StairsDownOptional)) {
                if (input.buttonsState & Barbarian.Input.Buttons.Down) {
                    this.direction = Direction.Down;
                    this.fsm.transition('TakeStairs');
                    return false;
                }
            } else if (this.tileMap.isEntityAt(TileMapLocation.StairsUpOptional)) {
                if (input.buttonsState & Barbarian.Input.Buttons.Up) {
                    this.direction = Direction.Up;
                    this.fsm.transition('TakeStairs');
                    return false;
                }
            }

            return true;
        }

        animate() {

            var numFrames = this.animData[this.animNum].frames.length;

            this.frame++;

            if (this.frame >= numFrames)
                this.frame = 0;

           
        }

        forEachPixel(pixel): boolean | Phaser.Color {


            /**
            * This callback will be sent a single object with 6 properties: `{ r: number, g: number, b: number, a: number, color: number, rgba: string }`.
            * Where r, g, b and a are integers between 0 and 255 representing the color component values for red, green, blue and alpha.
            * The `color` property is an Int32 of the full color. Note the endianess of this will change per system.
            * The `rgba` property is a CSS style rgba() string which can be used with context.fillStyle calls, among others.
            * The callback must return either `false`, in which case no change will be made to the pixel, or a new color object.
            * If a new color object is returned the pixel will be set to the r, g, b and a color values given within it.
            */
            if (pixel.color.toString(16) == 'ffaa00aa') {
                return Phaser.Color.fromRGBA(EGA_COLORS[this.colorIndex]);
            } else {
                return false;
            }
            //  The incoming pixel values
            //var r = pixel.r;
            //var g = pixel.g;
            //var b = pixel.b;

            ////  And let's mix them up a bit
            //pixel.r = g;
            //pixel.g = b;
            //pixel.b = r;

            //return pixel;
        }

        checkWeaponSwitch(input) {
            var newWeapon: Weapon = this.inventory.activeWeapon;

            if (input.buttonsState & Input.Buttons.Sword) {
                newWeapon = Weapon.Sword;
            } else if (input.buttonsState & Input.Buttons.Bow) {
                newWeapon = Weapon.Bow;
            } else if (input.buttonsState & Input.Buttons.Shield) {
                newWeapon = Weapon.Shield;
            }

            if (this.inventory.canSwitchWeaponTo(newWeapon)) {
                this.fsm.transition('SwitchWeapon', true, newWeapon);
            }

        }

        dropWeapon() {
            var item: ItemType;

            switch (this.inventory.activeWeapon) {
                case Weapon.Bow:
                    item = ItemType.Bow;
                    break;
                case Weapon.Shield:
                    item = ItemType.Shield;
                    break;
                case Weapon.Sword:
                    item = ItemType.Sword;
                    break;
                default:
                    item = ItemType.None;
                    break;
            }

            if (item != ItemType.None) {
                this.inventory.dropWeapon();
                this.game.level.addItem(item, this.x, this.y);
            }

        }

        clearInput() {
            var input = this.game.inputManager;
            input.clearInput();
        }

        update() {

            var input = this.game.inputManager;

            this.checkWeaponSwitch(input);

            if (input.buttonsState & Input.Buttons.Defend) {
                this.fsm.transition('BackFlip');
            }

            if (input.buttonsState & Input.Buttons.Stop) {
                this.fsm.transition('Stop');
            }

            if (input.buttonsState & Input.Buttons.Flee) {
                this.fsm.transition('Flee');
            }

            if (input.buttonsState & Input.Buttons.Run) {
                this.fsm.transition('Run');
            }

            if (input.buttonsState & Barbarian.Input.Buttons.Attack) {
                this.fsm.transition('Attack');              
            }

            if (input.buttonsState & Barbarian.Input.Buttons.Jump) {
                if (this.fsm.getCurrentStateName == 'Run')
                    this.fsm.transition('FrontFlip');
                else
                    this.fsm.transition('Jump');
            //} else if (this.keys.jump.isDown) {
            //    if (this.tileMap.isAbleToJump()) {
            //        if (this.keys.shift.isDown) {
            //            this.fsm.transition('FrontFlip');
            //        } else {
            //            this.fsm.transition('Jump');
            //        }
            //    } else {
            //        this.fsm.transition('Idle');
            //    }
            }
            if (this.facing == Facing.Right) {
                if (input.buttonsState & Barbarian.Input.Buttons.Right) {
                    if (input.buttonsState & Input.Buttons.Run) {
                        this.fsm.transition('Run');
                    } else {
                        this.fsm.transition('Walk');
                    }
                } else if (input.buttonsState & Barbarian.Input.Buttons.Left)
                    this.fsm.transition('ChangeDirection');
            } else if (this.facing == Facing.Left) {
                if (input.buttonsState & Barbarian.Input.Buttons.Left) {
                    if (input.buttonsState & Input.Buttons.Run) {
                        this.fsm.transition('Run');
                    } else {
                        this.fsm.transition('Walk');
                    }
                } else if (input.buttonsState & Barbarian.Input.Buttons.Right)
                    this.fsm.transition('ChangeDirection');
            }

            if (input.buttonsState & Input.Buttons.Drop) {
                this.fsm.transition('DropWeapon');
            }
            if (input.buttonsState & Input.Buttons.Get) {
                this.fsm.transition('PickUp');
            } else if (input.buttonsState & Barbarian.Input.Buttons.Down) {
                if (this.tileMap.isEntityAt(TileMapLocation.LadderTop)) {
                    this.fsm.transition('UseLadder');
                }
            } else if (input.buttonsState & Barbarian.Input.Buttons.Up) {
                if (this.tileMap.isEntityAt(TileMapLocation.LadderBottom)) {
                    this.fsm.transition('UseLadder');
                }

            }
            //if (!this.keys.left.isDown && !this.keys.right.isDown) {
            if (!input.buttonsState) {
                // this.fsm.transition('Stop');
            }
            
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % FIXED_TIMESTEP; // save remainder
                
                this.animate();
                this.fsm.update();

                this.bitmapData.load(this.orb);
                this.bitmapData.update()
                this.bitmapData.processPixelRGB(this.forEachPixel, this);
                this.colorIndex++;
                if (this.colorIndex > 15) {
                    this.colorIndex = 0;
                }
            }

            //this.orbTimeStep += this.game.time.elapsedMS;
            //if (this.orbTimeStep >= (FIXED_TIMESTEP /1.5)) {
            //    this.orbTimeStep = this.timeStep % (FIXED_TIMESTEP / 1.5);
            //    this.bitmapData.load(this.orb);
            //    this.bitmapData.update()
            //    this.bitmapData.processPixelRGB(this.forEachPixel, this);
            //    this.colorIndex++;
            //    if (this.colorIndex > 15) {
            //        this.colorIndex = 0;
            //    }
            //}

            this.render();
                
        }

        getBodyBounds() {

            var bounds: Phaser.Rectangle;

            if (this.facing == Facing.Right) 
                bounds = new Phaser.Rectangle(this.x - 32, this.y - 80, 32, 80);
            else
                bounds = new Phaser.Rectangle(this.x, this.y - 80, 32, 80);
            
            return bounds;


        }

    }

}
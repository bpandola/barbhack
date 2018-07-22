
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
        HitGround = 34,
        Falling = 36,
        TripFall = 37,
        FrontFlip = 39,
        PickUp = 42,
        Idle = 43
    }

    export enum Weapon {
        None = 1,
        Sword = 2,
        Shield = 3,
        Bow = 4
    }

    export enum Direction {
        None = -1,
        Left,
        Right,
        Up,
        Down
    }

    export class Inventory {
        numArrows: number;
        activeWeapon: Weapon;
        private availableWeapons: boolean[] = [];

        constructor() {
            this.numArrows = 10;
            this.availableWeapons[Weapon.Bow] = true;
            this.availableWeapons[Weapon.Shield] = true;
            // Start with sword.
            this.availableWeapons[Weapon.Sword] = true;
            this.activeWeapon = Weapon.Sword;
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

    export class Hero extends Entity {
        
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

        constructor(game: Barbarian.Game, tileX: number, tileY: number) {
            super(game, 'hero');

            this.tilePos.setTo(tileX, tileY);

            this.x = tileX << TILE_SHIFT;
            this.y = tileY << TILE_SHIFT;  

            this.animData = this.game.cache.getJSON('hero');

            this.inventory = new Inventory();
            this.direction = Direction.Right;
            this.facing = Direction.Right;

            this.tileMap = new TileMap(this);

            this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT, 'jump': Phaser.KeyCode.SPACEBAR, 'sword': Phaser.KeyCode.ONE, 'bow': Phaser.KeyCode.TWO, 'shield': Phaser.KeyCode.THREE, 'slow': Phaser.KeyCode.S, 'fast': Phaser.KeyCode.F, 'flee': Phaser.KeyCode.FOUR });
            this.game.input.keyboard.addKeyCapture([Phaser.KeyCode.UP, Phaser.KeyCode.DOWN, Phaser.KeyCode.LEFT, Phaser.KeyCode.RIGHT, Phaser.KeyCode.SHIFT, Phaser.KeyCode.ALT, Phaser.KeyCode.SPACEBAR]);
            this.fsm = new Barbarian.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new Barbarian.HeroStates.Idle(this), [StateMachine.WILDCARD]);
            this.fsm.add('Walk', new Barbarian.HeroStates.Walk(this), ['Idle','Run', 'Flee']);
            this.fsm.add('Jump', new Barbarian.HeroStates.Jump(this), ['Idle']);
            this.fsm.add('Stop', new Barbarian.HeroStates.Stop(this), ['Walk','Run']);
            this.fsm.add('ChangeDirection', new Barbarian.HeroStates.ChangeDirection(this), ['Idle','Walk','Run','Flee']);
            this.fsm.add('HitWall', new Barbarian.HeroStates.HitWall(this), ['Walk','Run','Flee']);
            this.fsm.add('UseLadder', new Barbarian.HeroStates.UseLadder(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('TakeStairs', new Barbarian.HeroStates.TakeStairs(this), ['Walk', 'Run', 'Flee']);
            this.fsm.add('Run', new Barbarian.HeroStates.Run(this), ['Idle','Walk']);
            this.fsm.add('Attack', new Barbarian.HeroStates.Attack(this), ['Idle','Walk','Run']);
            this.fsm.add('TripFall', new Barbarian.HeroStates.TripFall(this), ['Walk','Run','Flee']);
            this.fsm.add('Fall', new Barbarian.HeroStates.Fall(this), [StateMachine.WILDCARD]);
            this.fsm.add('FallDeath', new Barbarian.HeroStates.FallDeath(this), [StateMachine.WILDCARD]);
            this.fsm.add('Die', new Barbarian.HeroStates.Die(this), [StateMachine.WILDCARD]);
            this.fsm.add('FrontFlip', new Barbarian.HeroStates.FrontFlip(this), ['Run']);
            this.fsm.add('PickUp', new Barbarian.HeroStates.PickUp(this), ['Idle']);
            this.fsm.add('SwitchWeapon', new Barbarian.HeroStates.SwitchWeapon(this), ['Idle']);
            this.fsm.add('Flee', new Barbarian.HeroStates.Flee(this), [StateMachine.WILDCARD]);
            this.fsm.transition('Idle');

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
                tileX = this.facing == Direction.Right ? (this.x >> TILE_SHIFT) - 1 : (this.x >> TILE_SHIFT);
                tileX = tileX + (this.facing == Direction.Right ? adjustX : -adjustX);
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
            var parts: { flags: number }[] = this.animData[this.animNum].frames[this.frame].parts;
            return parts.filter((part) => { return part.flags < 5 || (part.flags >> 4) == this.inventory.activeWeapon; });
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
                if (this.keys.down.isDown || input.buttonsState & Barbarian.Input.Buttons.Down) {
                    this.direction = Direction.Down;
                    this.fsm.transition('TakeStairs');
                    return false;
                }
            } else if (this.tileMap.isEntityAt(TileMapLocation.StairsUpOptional)) {
                if (this.keys.up.isDown || input.buttonsState & Barbarian.Input.Buttons.Up) {
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

        checkWeaponSwitch() {
            var newWeapon: Weapon = this.inventory.activeWeapon;

            if (this.keys.sword.isDown) {
                newWeapon = Weapon.Sword;
            } else if (this.keys.bow.isDown) {
                newWeapon = Weapon.Bow;
            } else if (this.keys.shield.isDown) {
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

        update() {

            var input = this.game.inputManager;

            this.checkWeaponSwitch();

            if (input.buttonsState & Barbarian.Input.Buttons.Flee) {
                this.fsm.transition('Flee');
            }
            //if (this.keys.flee.isDown) {
            //    this.fsm.transition('Flee');
            //}

            // if (this.keys.attack.isDown) {
            if (input.buttonsState & Barbarian.Input.Buttons.Attack) {
                this.fsm.transition('Attack');              
            }

            if (input.buttonsState & Barbarian.Input.Buttons.Jump) {
                if (this.fsm.getCurrentStateName == 'Run')
                    this.fsm.transition('FrontFlip');
                else
                    this.fsm.transition('Jump');
            } else if (this.keys.jump.isDown) {
                if (this.tileMap.isAbleToJump()) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('FrontFlip');
                    } else {
                        this.fsm.transition('Jump');
                    }
                } else {
                    this.fsm.transition('Idle');
                }
            }
            if (this.facing == Direction.Right) {
                if (this.keys.right.isDown || input.buttonsState & Barbarian.Input.Buttons.Right) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('Run');
                    } else {
                        this.fsm.transition('Walk');
                    }
                } else if (this.keys.left.isDown || input.buttonsState & Barbarian.Input.Buttons.Left)
                    this.fsm.transition('ChangeDirection');
            } else if (this.facing == Direction.Left) {
                if (this.keys.left.isDown || input.buttonsState & Barbarian.Input.Buttons.Left) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('Run');
                    } else {
                        this.fsm.transition('Walk');
                    }
                } else if (this.keys.right.isDown || input.buttonsState & Barbarian.Input.Buttons.Right)
                    this.fsm.transition('ChangeDirection');
            }

            if (this.keys.down.isDown || input.buttonsState & Barbarian.Input.Buttons.Down) {
                if (this.tileMap.isEntityAt(TileMapLocation.LadderTop)) {
                    this.fsm.transition('UseLadder');
                } else {
                    // TODO: Add if (on top of item)...
                    this.fsm.transition('PickUp');
                }
            } else if (this.keys.up.isDown || input.buttonsState & Barbarian.Input.Buttons.Up) {
                if (this.tileMap.isEntityAt(TileMapLocation.LadderBottom)) {
                    this.fsm.transition('UseLadder');
                }

            }
            //if (!this.keys.left.isDown && !this.keys.right.isDown) {
            if (!input.buttonsState) {
                this.fsm.transition('Stop');
            }
            
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % FIXED_TIMESTEP; // save remainder
                
                this.animate();
                this.fsm.update();
            }

            this.render();
                
        }

        getBodyBounds() {

            var bounds: Phaser.Rectangle;

            if (this.facing == Direction.Right) 
                bounds = new Phaser.Rectangle(this.x - 32, this.y - 80, 32, 80);
            else
                bounds = new Phaser.Rectangle(this.x, this.y - 80, 32, 80);
            
            return bounds;


        }

    }

}

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
            this.availableWeapons[Weapon.Shield] = false;
            // Start with sword.
            this.availableWeapons[Weapon.Sword] = true;
            this.activeWeapon = Weapon.Sword;
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

        switchWeapon(weapon: Weapon): boolean {
            if (!this.availableWeapons[weapon] || weapon == this.activeWeapon)
                return false;

            this.activeWeapon = weapon;
            return true;
        }



    }

    export class Hero extends Entity {

        static FIXED_TIMESTEP: number = FIXED_TIMESTEP; //170;
        
        tilePos: Phaser.Point = new Phaser.Point();
        public animNum: number;
        frame: number;
        animData: any;
        //weapon: Weapon;
        keys: any;
        fsm: Barbarian.StateMachine.StateMachine;
        direction: Direction;
        //facing: Direction;  // left or right
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

            this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT, 'jump': Phaser.KeyCode.SPACEBAR, 'sword': Phaser.KeyCode.ONE, 'bow': Phaser.KeyCode.TWO, 'shield': Phaser.KeyCode.THREE, 'slow': Phaser.KeyCode.S, 'fast': Phaser.KeyCode.F });
            this.game.input.keyboard.addKeyCapture([Phaser.KeyCode.UP, Phaser.KeyCode.DOWN, Phaser.KeyCode.LEFT, Phaser.KeyCode.RIGHT, Phaser.KeyCode.SHIFT, Phaser.KeyCode.ALT, Phaser.KeyCode.SPACEBAR]);
            this.fsm = new Barbarian.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new Barbarian.HeroStates.Idle(this), [StateMachine.WILDCARD]);
            this.fsm.add('Walk', new Barbarian.HeroStates.Walk(this), ['Idle','Run']);
            this.fsm.add('Jump', new Barbarian.HeroStates.Jump(this), ['Idle']);
            this.fsm.add('Stop', new Barbarian.HeroStates.Stop(this), ['Walk','Run']);
            this.fsm.add('ChangeDirection', new Barbarian.HeroStates.ChangeDirection(this), ['Idle','Walk','Run']);
            this.fsm.add('HitWall', new Barbarian.HeroStates.HitWall(this), ['Walk','Run']);
            this.fsm.add('UseLadder', new Barbarian.HeroStates.UseLadder(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('TakeStairs', new Barbarian.HeroStates.TakeStairs(this), ['Walk', 'Run']);
            this.fsm.add('Run', new Barbarian.HeroStates.Run(this), ['Idle','Walk']);
            this.fsm.add('Attack', new Barbarian.HeroStates.Attack(this), ['Idle','Walk','Run']);
            this.fsm.add('TripFall', new Barbarian.HeroStates.TripFall(this), ['Walk','Run']);
            this.fsm.add('Fall', new Barbarian.HeroStates.Fall(this), [StateMachine.WILDCARD]);
            this.fsm.add('FallDeath', new Barbarian.HeroStates.FallDeath(this), [StateMachine.WILDCARD]);
            this.fsm.add('Die', new Barbarian.HeroStates.Die(this), [StateMachine.WILDCARD]);
            this.fsm.add('FrontFlip', new Barbarian.HeroStates.FrontFlip(this), ['Run']);
            this.fsm.add('PickUp', new Barbarian.HeroStates.PickUp(this), ['Idle']);
            this.fsm.add('SwitchWeapon', new Barbarian.HeroStates.SwitchWeapon(this), ['Idle']);
            this.fsm.transition('Idle');

            this.render();
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
        // arguments can be decimals, e.g. 0.5 for a half-tile movement.
        moveRelative(numTilesX: number, numTilesY: number): void {

            var xMovement = this.facing == Direction.Right ? TILE_SIZE : -TILE_SIZE;
            var yMovement = this.direction == Direction.Up ? -TILE_SIZE : TILE_SIZE;

            this.x += xMovement * numTilesX;
            this.y += yMovement * numTilesY;

        }

        // Returns true if movement is ok, otherwise transitions to new state and returns false
        checkMovement(): boolean {

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
                if (this.keys.down.isDown) {
                    this.direction = Direction.Down;
                    this.fsm.transition('TakeStairs');
                    return false;
                }
            } else if (this.tileMap.isEntityAt(TileMapLocation.StairsUpOptional)) {
                if (this.keys.up.isDown) {
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

        update() {
            // If switchWeapon succeeds, we need to transition
            // immediately to avoid having the new weapon display
            // before the switch animation starts.
            if (this.keys.sword.isDown) {
                if (this.inventory.switchWeapon(Weapon.Sword))
                    this.fsm.transition('SwitchWeapon', true);
            } else if (this.keys.bow.isDown) {
                if (this.inventory.switchWeapon(Weapon.Bow))
                    this.fsm.transition('SwitchWeapon', true);
            } else if (this.keys.shield.isDown) {
                if (this.inventory.switchWeapon(Weapon.Shield))
                    this.fsm.transition('SwitchWeapon', true);
            }

            if (this.keys.attack.isDown) {
                this.fsm.transition('Attack');              
            }

            if (this.keys.jump.isDown) {
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
                if (this.keys.right.isDown) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('Run');
                    } else {
                        this.fsm.transition('Walk');
                    }
                } else if (this.keys.left.isDown)
                    this.fsm.transition('ChangeDirection');
            } else if (this.facing == Direction.Left) {
                if (this.keys.left.isDown) {
                    if (this.keys.shift.isDown) {
                        this.fsm.transition('Run');
                    } else {
                        this.fsm.transition('Walk');
                    }
                }else if (this.keys.right.isDown)
                    this.fsm.transition('ChangeDirection');
            }

            if (this.keys.down.isDown) {
                if (this.tileMap.isEntityAt(TileMapLocation.LadderTop)) {
                    this.fsm.transition('UseLadder');
                } else {
                    // TODO: Add if on top of item...
                    this.fsm.transition('PickUp');
                }
            } else if (this.keys.up.isDown) {
                if (this.tileMap.isEntityAt(TileMapLocation.LadderBottom)) {
                    this.fsm.transition('UseLadder');
                }

            }
            if (!this.keys.left.isDown && !this.keys.right.isDown) {
                this.fsm.transition('Stop');
            }
            
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Hero.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Hero.FIXED_TIMESTEP; // save remainder
                
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

        renderOld() {
            // Start from scratch every time.
            this.forEach((child) => { child.visible = false; }, this);

            for (var part of this.animData[this.animNum].frames[this.frame].parts) {
                var weapon = part.flags >> 4;
                if (part.flags < 5 || weapon == this.inventory.activeWeapon) {
                    var spr = <Phaser.Sprite>this.getChildAt(part.index);
                    spr.visible = true;
                    // Have to reset scale every time...
                    spr.scale.setTo(1, 1);
                    spr.x = this.facing == Direction.Left ? part.rx : part.x;
                    spr.y = this.facing == Direction.Left ? part.ry : part.y;
                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);

                    var xScale = part.flags & 1 ? -1 : 1;
                    var yScale = part.flags & 2 ? -1 : 1;

                    // Flip the part horizontally again if Hero is facing left.
                    xScale = this.facing == Direction.Left ? -xScale : xScale
                    spr.scale.setTo(xScale, yScale);
                }
            }


        }

    }

}

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
        Idle1 = 12,
        Idle2 = 13,
        Attack1,
        Attack2,
        Attack3,
        Attack4,
        Attack5,
        Attack6,
        ShootArrow = 22,
        HitWall = 24,
        FallToGround = 28,
        FallToGroundFaceFirst = 31,
        HitGround = 34,
        Falling = 36,
        TripFall = 37,
        FrontFlip = 39,
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

    export class Hero extends Phaser.Group {

        static FIXED_TIMESTEP: number = FIXED_TIMESTEP; //170;
        
        tilePos: Phaser.Point = new Phaser.Point();
        public animNum: number;
        frame: number;
        animData: any;
        weapon: Weapon;
        keys: any;
        fsm: Barbarian.StateMachine.StateMachine;
        direction: Direction;
        facing: Direction;  // left or right
        game: Barbarian.Game;
        tileMap: TileMap;
        onDied: Phaser.Signal = new Phaser.Signal();

        timeStep: number = 0;

        constructor(game: Barbarian.Game, tileX: number, tileY: number) {
            super(game);

            this.tilePos.setTo(tileX, tileY);

            this.x = tileX << TILE_SHIFT;
            this.y = tileY << TILE_SHIFT;  

            this.animData = this.game.cache.getJSON('hero');

            this.weapon = Weapon.Sword;
            this.direction = Direction.Right;
            this.facing = Direction.Right;

            this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT, 'jump': Phaser.KeyCode.SPACEBAR });
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
                        this.fsm.transition('TripFall');
                        return false;
                    }
                    break;
                case '5':
                case '!':
                    if (this.direction == Direction.Down) {
                        this.fsm.transition('FallDeath');
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

        getState

        update() {
            
            if (this.keys.attack.isDown) {
                this.fsm.transition('Attack');              
            }

            if (this.keys.jump.isDown) {
                if (this.keys.shift.isDown) {
                    this.fsm.transition('FrontFlip');
                } else {
                    this.fsm.transition('Jump');
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

        render() {
            // Start from scratch every time.
            this.removeChildren();

            for (var part of this.animData[this.animNum].frames[this.frame].parts) {
                var weapon = part.flags >> 4;
                if (part.flags < 5 || weapon == this.weapon) {
                    var x = this.facing == Direction.Left ? part.rx : part.x;
                    var y = this.facing == Direction.Left ? part.ry : part.y;

                    var spr: Phaser.Sprite = this.create(x, y, 'hero', part.index);

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
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
        HitGround = 34,
        Falling = 36,
        TripFall = 37,
        Idle = 43
        


    }
    export enum Weapon {
        Sword = 2,
        Shield = 3,
        Bow = 4
    }

    export enum Direction {
        Left,
        Right,
        Up,
        Down
    }

    export class Hero extends Phaser.Group {

        static FIXED_TIMESTEP: number = 160; //170;
        
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

        timeStep: number = 0;
        
        currentTile: string = "?";

        constructor(game: Barbarian.Game, tileX: number, tileY: number) {
            super(game);

            this.tilePos.setTo(tileX, tileY);

            this.x = tileX << TILE_SHIFT;
            this.y = tileY << TILE_SHIFT;  

            this.animData = this.game.cache.getJSON('hero');

            this.weapon = Weapon.Bow;
            this.direction = Direction.Right;
            this.facing = Direction.Right;

            this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT, 'jump': Phaser.KeyCode.SPACEBAR });

            this.fsm = new Barbarian.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new Barbarian.HeroStates.Idle(this),['*']);
            this.fsm.add('Walk', new Barbarian.HeroStates.Walk(this), ['Idle']);
            this.fsm.add('Jump', new Barbarian.HeroStates.Jump(this), ['Idle']);
            this.fsm.add('Stop', new Barbarian.HeroStates.Stop(this), ['Walk','Run']);
            this.fsm.add('ChangeDirection', new Barbarian.HeroStates.ChangeDirection(this), ['Idle','Walk','Run']);
            this.fsm.add('HitWall', new Barbarian.HeroStates.HitWall(this), ['Walk','Run']);
            this.fsm.add('UpStairs', new Barbarian.HeroStates.UpStairs(this), ['*']);
            this.fsm.add('DownStairs', new Barbarian.HeroStates.DownStairs(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('DownLadder', new Barbarian.HeroStates.DownLadder(this), ['Idle','Walk','Run']);
            this.fsm.add('UpLadder', new Barbarian.HeroStates.UpLadder(this), ['Idle', 'Walk', 'Run']);
            this.fsm.add('Run', new Barbarian.HeroStates.Run(this), ['Idle','Walk']);
            this.fsm.add('Attack', new Barbarian.HeroStates.Attack(this), ['Idle','Walk','Run']);
            this.fsm.add('TripFall', new Barbarian.HeroStates.TripFall(this), ['*']);
            this.fsm.add('Fall', new Barbarian.HeroStates.Fall(this), ['*']);
            this.fsm.add('Die', new Barbarian.HeroStates.Die(this), ['*']);
            this.fsm.transition('Idle');

            this.drawHero();
        }

        setAnimation(id: Animations) {
            this.animNum = id;
            this.frame = 0;
        }

        moveRelative(relTileX: number, relTileY: number) {

            var xMovement = this.facing == Direction.Right ? TILE_SIZE : -TILE_SIZE;

            this.x += xMovement * relTileX;
            this.y += TILE_SIZE * relTileY;

        }

        getTile(adjustX?: number, adjustY?: number) {
            if (adjustX == null) { adjustX = 0 }
            if (adjustY == null) { adjustY = 0 }

            if (this.x < TILE_SIZE || this.x >= 640 || this.y < TILE_SIZE || this.y >= 320)
                return '?';

            var tileX = this.facing == Direction.Right ? (this.x >> TILE_SHIFT) - 1 : (this.x >> TILE_SHIFT);
            tileX = tileX + (this.facing == Direction.Right ? adjustX : -adjustX);

            var tileY = (this.y >> TILE_SHIFT) - 1;
            tileY = tileY + adjustY;

            this.currentTile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[tileY].rowData
                .substring(tileX, tileX + 1);

            return this.currentTile;
        }

        // Returns true if movement is ok, otherwise transitions to new state and returns false
        checkMovement(): boolean {

            // Current Tile
            switch (this.getTile()) {

                case '3':
                    this.fsm.transition('HitWall');
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
                        this.fsm.transition('Die');
                        return false;
                    }
            }

            // Previous Tile
            switch (this.getTile(-1)) {
                                   
                case 'A':
                case 'G':
                    if (this.getTile(-2) == '%')
                    this.fsm.transition('UpStairs');
                    return false;
                case 'H':
                case 'B':
                    if (this.getTile(-2) == '$')
                    this.fsm.transition('DownStairs');
                    return false;
                case 'E':
                    if (this.direction == Direction.Left && this.keys.down.isDown)
                        this.fsm.transition('DownStairs');
                    return false;
                case 'D':
                    if (this.direction == Direction.Right && this.keys.up.isDown)
                        this.fsm.transition('UpStairs');
                    return false;
                case 'J':
                    if (this.getTile(-2) == '(')
                    if (this.direction == Direction.Left && this.keys.up.isDown)
                        this.fsm.transition('UpStairs');
                    return false;
               
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
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Hero.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Hero.FIXED_TIMESTEP; // save remainder
                this.animate();
                this.fsm.getCurrentState().onUpdate();
            }
            if (this.keys.attack.isDown) {
                this.fsm.transition('Attack');              
            }

            if (this.keys.jump.isDown) {
                this.fsm.transition('Jump');
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
                if ("*+,".indexOf(this.getTile()) != -1) {
                    this.fsm.transition('DownLadder');
                }
            } else if (this.keys.up.isDown) {
                if ("-+.".indexOf(this.getTile()) != -1) {
                    this.fsm.transition('UpLadder');
                }

            }
            if (!this.keys.left.isDown && !this.keys.right.isDown) {
                this.fsm.transition('Stop');
            }

            this.drawHero();
                
        }

        drawHero() {

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

                    // Flip horizontally again if hero is facing left.
                    xScale = this.facing == Direction.Left ? -xScale : xScale
                    //yScale = this.direction == Direction.Right ? yScale : -yScale
                    spr.scale.setTo(xScale, yScale);
                }
            }


        }

    }

}
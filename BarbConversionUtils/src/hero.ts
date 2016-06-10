namespace BarbConversionUtils {

    export enum Animations {
        Walk,
        Run,
        ChangeDirection,
        UpLadder = 4,
        DownLadder = 5,
        UpStairs = 7,
        DownStairs = 8,
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
        HitGround = 28,
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

        static ANIMATION_INTERVAL: number = 100; //170;
        static TILE_SIZE: number = 16;
        tilePos: Phaser.Point = new Phaser.Point();
        public animNum: number;
        frame: number;
        animData: any;
        weapon: Weapon;
        keys: any;
        fsm: BarbConversionUtils.StateMachine.StateMachine;
        direction: Direction;
        animTimer: Phaser.TimerEvent;
        game: BarbConversionUtils.Util;
        
        currentTile: string = "?";

        constructor(game: BarbConversionUtils.Util, tileX: number, tileY: number) {
            super(game);

            this.tilePos.setTo(tileX, tileY);

            this.x = tileX << 4;
            this.y = (tileY ) << 4;  // FIX THIS PLUS ONE!!!

            this.animData = this.game.cache.getJSON('hero');

            this.weapon = Weapon.Sword;
            this.direction = Direction.Right;
           

            //this.animTimer = this.game.time.events.loop(Hero.ANIMATION_INTERVAL, this.animate, this);

            this.keys = this.game.input.keyboard.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT, 'shift': Phaser.KeyCode.SHIFT, 'attack': Phaser.KeyCode.ALT });


            this.fsm = new BarbConversionUtils.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new BarbConversionUtils.HeroStates.Idle(this));
            this.fsm.add('Walk', new BarbConversionUtils.HeroStates.Walk(this));
            this.fsm.add('ChangeDirection', new BarbConversionUtils.HeroStates.ChangeDirection(this));
            this.fsm.add('HitWall', new BarbConversionUtils.HeroStates.HitWall(this));
            this.fsm.add('UpStairs', new BarbConversionUtils.HeroStates.UpStairs(this));
            this.fsm.add('DownStairs', new BarbConversionUtils.HeroStates.DownStairs(this));
            this.fsm.add('DownLadder', new BarbConversionUtils.HeroStates.DownLadder(this));
            this.fsm.add('UpLadder', new BarbConversionUtils.HeroStates.UpLadder(this));
            this.fsm.add('Run', new BarbConversionUtils.HeroStates.Run(this));
            this.fsm.add('Attack', new BarbConversionUtils.HeroStates.Attack(this));
            this.fsm.add('TripFall', new BarbConversionUtils.HeroStates.TripFall(this));
            this.fsm.add('Fall', new BarbConversionUtils.HeroStates.Fall(this));
            this.fsm.transition('Idle');

            this.drawHero();
        }

        previousPreviousTile() {

            if (this.x < 0 || this.x >= 640 || this.y < 0 || this.y >= 320)
                return '?';

            var tileX = this.direction == Direction.Right ? (this.x >> 4) - 3 : (this.x >> 4)+2;
            var tileY = (this.y >> 4) - 1;



            var tile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[tileY].rowData
                .substring(tileX, tileX + 1);


            return tile;
        }

        previousTile() {

            if (this.x < 0 || this.x >= 640 || this.y < 0 || this.y >= 320)
                return '?';

            var tileX = this.direction == Direction.Right ? (this.x >> 4) - 2 : (this.x >> 4)+1;
            var tileY = (this.y >> 4) - 1;

            

            var tile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[tileY].rowData
                .substring(tileX, tileX + 1);

            
            return tile;
        }

        getTile(adjustX?: number, adjustY?: number) {
            if (adjustX == null) { adjustX = 0 }
            if (adjustY == null) { adjustY = 0 }

            if (this.x < Hero.TILE_SIZE || this.x >= 640 || this.y < Hero.TILE_SIZE || this.y >= 320)
                return '?';

            var tileX = this.direction == Direction.Right ? (this.x >> 4) - 1 : (this.x >> 4);
            var tileY = (this.y >> 4) - 1;

            

            this.currentTile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[tileY+adjustY].rowData
                .substring(tileX+adjustX, tileX+adjustX + 1);

            //if (this.currentTile != '"')
              //  console.log(this.currentTile);
            return this.currentTile;
        }

        
        checkMovement() {
            //if (this.tilePos.y >= 20) return;
            var adjust = this.direction == Direction.Right ? -1 : 0;
            var tile = this.getTile(); //this.game.cache.getJSON('rooms')[this.game.roomNum]
                //.layout[this.tilePos.y].rowData
               // .substring(this.tilePos.x, this.tilePos.x + 1); // don't adjust!
            switch (tile) {

                case '3':
                    this.fsm.transition('HitWall');
                    return;
                //case '/':
                //    this.fsm.transition('TripFall');
                //    return;
                //case '5':
                //case '!':
                //    this.fsm.transition('Idle');
                //    return;
                 
            }

            switch (this.previousTile()) {
                case '3':
                    
                case 'A':
                case 'G':
                    if (this.previousPreviousTile() == '%')
                    this.fsm.transition('UpStairs');
                    break;
                case 'H':
                case 'B':
                    if (this.previousPreviousTile() == '$')
                    this.fsm.transition('DownStairs');
                    break;
                case 'E':
                    if (this.direction == Direction.Left && this.keys.down.isDown)
                        this.fsm.transition('DownStairs');
                    break;
                case 'D':
                    if (this.direction == Direction.Right && this.keys.up.isDown)
                        this.fsm.transition('UpStairs');
                    break;
                case 'J':
                    if (this.previousPreviousTile() == '(')
                    if (this.direction == Direction.Left && this.keys.up.isDown)
                        this.fsm.transition('UpStairs');
                    break;
                //case 'B':
                //    this.fsm.transition('Idle');
                //    break;
            }

        }

        animate() {

            var numFrames = this.animData[this.animNum].frames.length;

            this.frame++;

            if (this.frame >= numFrames)
                this.frame = 0;

            this.fsm.getCurrentState().onFrameChange();

            this.drawHero();

        }

        update() {
            this.fsm.getCurrentState().onUpdate();

            //this.x = this.tilePos.x << 4;
            //this.y = (this.tilePos.y ) << 4;

            this.drawHero();
                
        }

        drawHero() {

            

            this.removeChildren();

            for (var part of this.animData[this.animNum].frames[this.frame].parts) {
                var weapon = part.flags >> 4;
                if (part.flags < 5 || weapon == this.weapon) {
                    var x = this.direction == Direction.Left ? part.rx : part.x;
                    var y = this.direction == Direction.Left ? part.ry : part.y;

                    var spr: Phaser.Sprite = this.create(x, y, 'hero', part.index);

                    spr.x += spr.width / 2;
                    spr.y += spr.height / 2;
                    spr.anchor.setTo(0.5);
                    var xScale = part.flags & 1 ? -1 : 1;
                    var yScale = part.flags & 2 ? -1 : 1;

                    xScale = this.direction == Direction.Left ? -xScale : xScale
                    //yScale = this.direction == Direction.Right ? yScale : -yScale
                    spr.scale.setTo(xScale, yScale);


                }
            }


        }

    }

}
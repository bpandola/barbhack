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
        HitWall = 24,
        Idle = 43
        


    }

    export enum Direction {
        Left,
        Right,
        Up,
        Down
    }

    export class Hero extends Phaser.Group {

        static ANIMATION_INTERVAL: number = 150; //170;
        tilePos: Phaser.Point = new Phaser.Point();
        public animNum: number;
        frame: number;
        animData: any;
        weapon: number;
        keys: Phaser.CursorKeys;
        fsm: BarbConversionUtils.StateMachine.StateMachine;
        direction: Direction;
        animTimer: Phaser.TimerEvent;
        game: BarbConversionUtils.Util;

        constructor(game: BarbConversionUtils.Util, tileX: number, tileY: number) {
            super(game);

            this.tilePos.setTo(tileX, tileY);

            this.x = tileX << 4;
            this.y = (tileY + 1) << 4;

            this.animData = this.game.cache.getJSON('hero');

            this.weapon = 2;
            this.direction = Direction.Right;
           

            //this.animTimer = this.game.time.events.loop(Hero.ANIMATION_INTERVAL, this.animate, this);

            this.keys = this.game.input.keyboard.createCursorKeys();

            this.fsm = new BarbConversionUtils.StateMachine.StateMachine(this);
            this.fsm.add('Idle', new BarbConversionUtils.HeroStates.Idle(this));
            this.fsm.add('Walk', new BarbConversionUtils.HeroStates.Walk(this));
            this.fsm.add('ChangeDirection', new BarbConversionUtils.HeroStates.ChangeDirection(this));
            this.fsm.add('HitWall', new BarbConversionUtils.HeroStates.HitWall(this));
            this.fsm.add('UpStairs', new BarbConversionUtils.HeroStates.UpStairs(this));
            this.fsm.add('DownStairs', new BarbConversionUtils.HeroStates.DownStairs(this));
            this.fsm.add('DownLadder', new BarbConversionUtils.HeroStates.DownLadder(this));
            this.fsm.add('UpLadder', new BarbConversionUtils.HeroStates.UpLadder(this));
            this.fsm.transition('Idle');

            this.drawHero();
        }

        getTile(x, y) {
            if (x < 0 || x >= 40 || y < 0 || y >= 20)
                return '?';

            var tile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[y].rowData
                .substring(x, x+1);
            console.log(tile);
            return tile;
        }

        
        checkMovement() {
            if (this.tilePos.y >= 20) return;
            var adjust = this.direction == Direction.Right ? 1 : -1;
            var tile = this.game.cache.getJSON('rooms')[this.game.roomNum]
                .layout[this.tilePos.y].rowData
                .substring(this.tilePos.x, this.tilePos.x + 1); // don't adjust!

            switch (tile) {
                case '3':
                    this.fsm.transition('HitWall');
                    break;
                case 'A':
                case 'G':
                    this.fsm.transition('UpStairs');
                    break;
                case 'H':
                case 'B':
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

            this.x = this.tilePos.x << 4;
            this.y = (this.tilePos.y + 1) << 4;

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
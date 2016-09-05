namespace Barbarian.Enemies {

    export enum EnemyKeys {
        nll,
        axe,
        thr,
        pop,
        dog,
        hop,
        rep,
        aro,
        met,
        ren,
        ver,
        bad,
        roc,
        ape,
        scy,
        rhi,
        mn1,
        mn2,
        mn3,
        mn4,
        mn5,
        mn6,
        mn7,
        mor,
        oc1,
        oc2,
        nt1,
        nt2,
        nt3,
        ac1,
        ac2,
        ac3,
        blk,
        spk,
        stn,
        dra,
        rot,
        vsp
    }

    // Encapsulates Enemy JSON Blob
    export interface EnemyJSON {
        id: number;
        yOff: number;
        xMin: number;
        xMax: number;
        xOff: number[];
        flags: number[];
    }

    export class Enemy extends Phaser.Group {

        static FIXED_TIMESTEP: number = FIXED_TIMESTEP;

        tilePos: Phaser.Point = new Phaser.Point();
        public animNum: number;
        frame: number;
        animData: any;
        direction: Direction;
        game: Barbarian.Game;
        timeStep: number = 0;
        dataBlob: EnemyJSON;
        rotate: number;

        constructor(game: Barbarian.Game, dataBlob: EnemyJSON, direction: Direction) {
            super(game);

            this.dataBlob = dataBlob;
            
            this.x = dataBlob.xOff[direction+1];
            this.y = dataBlob.yOff;

            this.animData = this.game.cache.getJSON('enemies')[dataBlob.id].animations;
            this.animNum = 0;
            this.frame = 0;

            this.direction = direction;
            this.rotate = this.dataBlob.flags[this.direction + 1];

            // Make sure we update right away
            this.timeStep = Enemy.FIXED_TIMESTEP;

            this.drawEnemy();
        }

        /**
        * Factory Method for Enemy Creation
        *  
        * @param game A reference to the currently running game.
        * @param data A structure defining the enemy metadata.
        * @param direction The direction the player entered the current room, which determines enemy placement/facing direction.
        * @return The newly-created Enemy object.
        */
        public static createEnemy(game: Barbarian.Game, data: EnemyJSON, direction: Direction): Enemy {
            switch (data.id) {
                case EnemyKeys.rot:
                    return new Rotate(game, data, direction);
                case EnemyKeys.scy:
                    return new Scythe(game, data, direction);
                case EnemyKeys.blk:
                    return new Block(game, data, direction);
                case EnemyKeys.spk:
                    return new Spikes(game, data, direction);
                default:
                    return new Enemy(game, data, direction);
            }
        }

        get isKillable(): boolean {
            return this.dataBlob.xMin > 0 && this.dataBlob.xMax > 0 && this.children.length > 0;
        }

        animate() {

            if (this.animData.length === 0)
                return;

            var numFrames = this.animData[this.animNum].frames.length;

            this.frame++;

            if (this.frame >= numFrames)
                this.frame = 0;
        }

        update() {

         

            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= Enemy.FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % Enemy.FIXED_TIMESTEP; // save remainder
                

                if (this.dataBlob.xMin > 0 && this.dataBlob.xMax > 0) {
                    //this.x += TILE_SIZE;
                    //if (this.x > this.dataBlob.xMax)
                    //    this.x = this.dataBlob.xMin;

                    if (this.game.hero.y == this.y) {
                        var delta = this.game.hero.x - this.x;
                        if (Math.abs(delta) < 320 && Math.abs(delta) > TILE_SIZE * 2) {
                            if (delta < 0) {
                                this.x -= TILE_SIZE;
                            } else {
                                this.x += TILE_SIZE;
                            }
                            this.animNum = 1;
                        } else if (Math.abs(delta) > 0 && Math.abs(delta) <= TILE_SIZE * 2) {
                            //this.animNum = 2;
                        } else {
                            this.animNum = 0;
                        }
                    
                    } else {
                        this.animNum = 0;
                    }

                    if (this.x < this.game.hero.x)
                        this.rotate = 0;
                    else
                        this.rotate = 1;

                    if (this.x < this.dataBlob.xMin)
                        this.x = this.dataBlob.xMin;
                    if (this.x > this.dataBlob.xMax)
                        this.x = this.dataBlob.xMax;

                    
                }

                if (this.dataBlob.id == EnemyKeys.thr)
                    this.animNum = 1;

                this.animate();
            }

            
            this.drawEnemy();

        }

        drawEnemy() {

            // TODO: Have a proper NLLSPR asset file so I don't have to do this check.
            if (this.dataBlob.id === EnemyKeys.nll)
                return;

            // Start from scratch every time.
            this.removeChildren();

            for (var part of this.animData[this.animNum].frames[this.frame].parts) {

                var x = this.rotate ? part.rx : part.x;
                var y = this.rotate ? part.ry : part.y;

                var spr: Phaser.Sprite = this.create(x, y, EnemyKeys[this.dataBlob.id], part.index);

                spr.x += spr.width / 2;
                spr.y += spr.height / 2;
                spr.anchor.setTo(0.5);
                var xScale = part.flags & 1 ? -1 : 1;
                var yScale = part.flags & 2 ? -1 : 1;

                xScale = this.rotate ? -xScale : xScale
                //yScale = this.direction == Direction.Right ? yScale : -yScale
                spr.scale.setTo(xScale, yScale);
            }
        }

    }

    

}
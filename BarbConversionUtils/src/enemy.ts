namespace Barbarian {
   
    export interface EnemyStruct {
        id: number;
        yOff: number;
        xMin: number;
        xMax: number;
        xOff: number[];
        flags: number[];
    }

    export class Enemy extends Phaser.Group {

        static FIXED_TIMESTEP: number = 120;

        tilePos: Phaser.Point = new Phaser.Point();
        public animNum: number;
        frame: number;
        animData: any;
        direction: Direction;
        game: Barbarian.Game;
        timeStep: number = 0;
        dataBlob: EnemyStruct;
        rotate: number;

        constructor(game: Barbarian.Game, dataBlob: EnemyStruct, direction: Direction) {
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

        

        animate() {

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
                            this.animNum = 2;
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
                    
                }

                if (this.dataBlob.id == EnemyKeys.thr)
                    this.animNum = 1;

                this.animate();
            }

            
           
            this.drawEnemy();

        }

        drawEnemy() {
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
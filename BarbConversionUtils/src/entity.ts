namespace Barbarian {

    export class Entity extends Phaser.Group {

        
        timeStep: number = 0;

        facing: Direction;      // Which way the entity is facing (left or right).
        direction: Direction;   // Which way the entity is moving (up, down, left, right).

        constructor(game: Barbarian.Game, key: string) {
            super(game);
            // Add all parts to the group
            for (var i = 0; i < game.cache.getFrameCount(key); i++) {
                var part = <Phaser.Sprite>this.create(0, 0, key, i);
                // Set default properties.
                part.anchor.setTo(0.5);
            }
        }

        // Should be overridden by subclasses
        get currentParts() {
            return [];
        }

        // arguments can be decimals, e.g. 0.5 for a half-tile movement.
        moveRelative(numTilesX: number, numTilesY: number): void {

            var xMovement = this.facing == Direction.Right ? TILE_SIZE : -TILE_SIZE;
            var yMovement = this.direction == Direction.Up ? -TILE_SIZE : TILE_SIZE;

            this.x += xMovement * numTilesX;
            this.y += yMovement * numTilesY;

        }

        update() {
            // Call derived objects' tick function on a fixed timebase.
            this.timeStep += this.game.time.elapsedMS;
            if (this.timeStep >= FIXED_TIMESTEP) {
                this.timeStep = this.timeStep % FIXED_TIMESTEP;
                this.tick()
            }
        }

        // Should be overridden by subclasses
        tick() { }

        render() {
            // Start from scratch every time.
            this.forEach((part) => { part.visible = false; }, this);
            // For each currently visible part, reset properties and set visible to true.
            for (var i = 0, parts = this.currentParts; i < parts.length; i++) {
                // Get a reference to the sprite for this part.
                var part = parts[i];
                var spr = <Phaser.Sprite>this.getChildAt(part.index);
                // Need to reset the scale here or we may get negative sprite width/height,
                // which will throw off the x/y calculations.
                // {@link https://github.com/photonstorm/phaser/issues/1210 Issue}
                spr.scale.setTo(1, 1);
                // Reset coordinates for this part.
                spr.x = this.facing === Direction.Left ? part.rx : part.x;
                spr.y = this.facing === Direction.Left ? part.ry : part.y;
                // Translate Barbarian x/y data for use with a Phaser middle anchor.
                spr.x += spr.width / 2;
                spr.y += spr.height / 2;
                // Set z relative to when the part was added for proper overlap.
                spr.z = i;
                // Part bit flags specify whether to flip the sprite part horizontally or vertically.
                var xScale = part.flags & 1 ? -1 : 1;
                var yScale = part.flags & 2 ? -1 : 1;
                // Flip the part horizontally again based on which way the *entity* is facing.
                xScale = this.facing === Direction.Left ? -xScale : xScale
                spr.scale.setTo(xScale, yScale);
                // And finally, make sure this sprite part is rendered by Phaser.
                spr.visible = true;
            }
        }

    }


}

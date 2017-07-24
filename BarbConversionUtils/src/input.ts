namespace Barbarian.Input {

    export enum Buttons {
        Up = 1,
        Down = 2,
        Back = 4,
        Forward = 8,
        A = 16,
        B = 32,
        FLEE = 64
    }

    export class ControlCodes {
        // Define array indices for control buttons
        static A: number = 0;
        static B: number = 1;
        static UP: number = 2;
        static DOWN: number = 3;
        static BACK: number = 4;
        static FORWARD: number = 5;
        static F1: number = 6;
        static F2: number = 7;
        static F3: number = 8;
        static F4: number = 9;
        static F5: number = 10;
        static F6: number = 11;
        static F7: number = 12;
        static F8: number = 13;
        static F9: number = 14;
        static F10: number = 15;
    }

    

    export class KeyboardState {

        private controlState: boolean[] = new Array(25);

        static GetState(game: Barbarian.Game): any {
            var keyboardState = new KeyboardState();

            //keyboardState.controlState[ControlCodes.A] = player.keys.A.isDown;
            //keyboardState.controlState[ControlCodes.B] = player.keys.B.isDown;
            //keyboardState.controlState[ControlCodes.UP] = player.keys.up.isDown;
            //keyboardState.controlState[ControlCodes.DOWN] = player.keys.down.isDown;
            //keyboardState.controlState[ControlCodes.BACK] = player.scale.x == 1 ? player.keys.left.isDown : player.keys.right.isDown;
            //keyboardState.controlState[ControlCodes.FORWARD] = player.scale.x == 1 ? player.keys.right.isDown : player.keys.left.isDown;

            keyboardState.controlState[ControlCodes.F1] = game.input.keyboard.isDown(Phaser.KeyCode.F1);
            keyboardState.controlState[ControlCodes.F2] = game.input.keyboard.isDown(Phaser.KeyCode.F2);
            keyboardState.controlState[ControlCodes.F3] = game.input.keyboard.isDown(Phaser.KeyCode.F3);
            keyboardState.controlState[ControlCodes.F4] = game.input.keyboard.isDown(Phaser.KeyCode.F4);
            keyboardState.controlState[ControlCodes.F5] = game.input.keyboard.isDown(Phaser.KeyCode.F5);
            keyboardState.controlState[ControlCodes.F6] = game.input.keyboard.isDown(Phaser.KeyCode.F6);
            keyboardState.controlState[ControlCodes.F7] = game.input.keyboard.isDown(Phaser.KeyCode.F7);
            keyboardState.controlState[ControlCodes.F8] = game.input.keyboard.isDown(Phaser.KeyCode.F8);
            keyboardState.controlState[ControlCodes.F9] = game.input.keyboard.isDown(Phaser.KeyCode.F9);
            keyboardState.controlState[ControlCodes.F10] = game.input.keyboard.isDown(Phaser.KeyCode.F10);
            return keyboardState;
        }

        isKeyUp(key: number): boolean {
            return !this.controlState[key];
        }

        isKeyDown(key: number): boolean {
            return this.controlState[key];
        }
    }

    export class ControlDirection {
        
        static None: Buttons = 0;
        static Up: Buttons = 1;
        static Down: Buttons = 2;
        static Back: Buttons = 4;
        static Forward: Buttons = 8;
        static UpBack: Buttons = ControlDirection.Up | ControlDirection.Back;
        static UpForward: Buttons = ControlDirection.Up | ControlDirection.Forward;
        static DownBack: Buttons = ControlDirection.Down | ControlDirection.Back;
        static DownForward: Buttons = ControlDirection.Down | ControlDirection.Forward;
        static Any: Buttons = ControlDirection.Up | ControlDirection.Down | ControlDirection.Back | ControlDirection.Forward;

        static fromInput(keyboardState: KeyboardState): Buttons {
            var direction: Buttons = ControlDirection.None;
            // Get vertical direction
            if (keyboardState.isKeyDown(ControlCodes.UP)) {
                direction |= ControlDirection.Up;
            } else if (keyboardState.isKeyDown(ControlCodes.DOWN)) {
                direction |= ControlDirection.Down;
            }
            // Combine with horizontal direction
            if (keyboardState.isKeyDown(ControlCodes.BACK)) {
                direction |= ControlDirection.Back;
            } else if (keyboardState.isKeyDown(ControlCodes.FORWARD)) {
                direction |= ControlDirection.Forward;
            }

            return direction;
        }

    }

    
    
   

    export class InputManager {
        game: Barbarian.Game;
        keyboardState: KeyboardState;
        lastKeyboardState: KeyboardState;
        lastInputTime: number = 0;
        buttonBuffer: number[];
        buttonsState: Buttons;

        static bufferTimeOut: number = 500;   // milliseconds
        static mergeInputTime: number = 100;  // milliseconds
        static BUFFER_SIZE: number = 10;
        //static nonDirectionButtons: number[] = [ControlCodes.A, ControlCodes.B];
        nonDirectionButtons: { [key: string]: { button: Buttons, controlKey: number; } } = {};

        constructor(game: Barbarian.Game) {
            this.game = game;

            this.game.input.keyboard.addKeyCapture([
                Phaser.KeyCode.F1,
                Phaser.KeyCode.F2,
                Phaser.KeyCode.F3,
                Phaser.KeyCode.F4,
                Phaser.KeyCode.F5,
                Phaser.KeyCode.F6,
                Phaser.KeyCode.F7,
                Phaser.KeyCode.F8,
                Phaser.KeyCode.F9,
                Phaser.KeyCode.F10
            ]);
           

            this.buttonBuffer = new Array(InputManager.BUFFER_SIZE);
            this.keyboardState = KeyboardState.GetState(this.game);

            this.nonDirectionButtons[Buttons.A.toString()] = { button: Buttons.A, controlKey: ControlCodes.A };
            this.nonDirectionButtons[Buttons.B.toString()] = { button: Buttons.B, controlKey: ControlCodes.B };
            this.nonDirectionButtons[Buttons.FLEE.toString()] = { button: Buttons.FLEE, controlKey: ControlCodes.F10 };

        }

        update(gameTime: Phaser.Time): void {
            // Save keyboard state
            this.lastKeyboardState = this.keyboardState;
            // Get new keyboard state
            this.keyboardState = KeyboardState.GetState(this.game);

            // HACK - TESTING
            if (this.lastKeyboardState.isKeyUp(ControlCodes.F1) && this.keyboardState.isKeyDown(ControlCodes.F1))
                console.log('F1 pressed.');

            // Expire old input
            var time: number = gameTime.time; //gameTime.elapsedMS;
            var timeSinceLast: number = time - this.lastInputTime;
            if (timeSinceLast > InputManager.bufferTimeOut) {
                this.buttonBuffer = [];
                this.buttonBuffer = new Array(InputManager.BUFFER_SIZE);
            }

            // Get all non-direction buttons pressed
            var buttons: number = 0;
            for (var key in this.nonDirectionButtons) {
                var button: Buttons = this.nonDirectionButtons[key].button;
                var controlKey: number = this.nonDirectionButtons[key].controlKey;
                // Check if just pressed
                if (this.lastKeyboardState.isKeyUp(controlKey) && this.keyboardState.isKeyDown(controlKey)) {
                    // Use a bitwise-or to accumulate button presses.
                    buttons |= button;
                }
            }

            // It's hard to press two buttons on the same exact frame, so if they're close
            // enough consider them pressed at the same time.
            var mergeInput: boolean = (this.buttonBuffer.length > 0 && timeSinceLast < InputManager.mergeInputTime);

            // See if the player has changed direction
            var direction: number = ControlDirection.fromInput(this.keyboardState);
            if (ControlDirection.fromInput(this.lastKeyboardState) != direction) {
                // combine direction with buttons
                buttons |= direction;

                // Don't merge two different directions.  This avoids having impossible directions
                // such as Left+Up+Right.  This also has the side effect that the direction needs
                // to be pressed at the same time or slightly before the buttons for merging to work.
                mergeInput = false;
            }

            // If there was any new input on this update, add it to our buffer.
            if (buttons != 0) {
                if (mergeInput) {
                    // Use a bitwise OR to merge with the previous input.
                    // And don't update lastInputTime so we don't extend the merge window.
                    this.buttonBuffer[this.buttonBuffer.length - 1] = this.buttonBuffer[this.buttonBuffer.length - 1] | buttons;
                } else {
                    // Append the input to the buffer, expiring old input as needed
                    if (this.buttonBuffer.length === InputManager.BUFFER_SIZE) {
                        // this will remove the first element
                        this.buttonBuffer.shift();
                    }
                    // Add our new input
                    this.buttonBuffer.push(buttons);

                    // Record time to being merge time window
                    this.lastInputTime = time;
                }
            }
            this.buttonsState = buttons;

            

        }



       








    }


}
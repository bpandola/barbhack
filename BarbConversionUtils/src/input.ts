namespace Barbarian.Input {

    export enum Buttons {
        Up = 1,
        Down = 2,
        Right = 4,
        Left = 8,
        Pickup = 16,
        Drop = 32,
        Flee = 64,
        Attack = 128,
        Jump = 256,
        Stop = 512,
        Get = 1024,
        Run = 2048,
        Defend = 4096,
        Sword = 32768,
        Bow = 8192,
        Shield = 16384
    }

    export enum Icons {
        None = 0,
        Left = 8,
        Up = 1,
        Down = 2,
        Right = 4,
        Stop = 0,
        Jump = 32,
        Run = 64,
        Attack = 16,
        Defend = 128,
        Flee = 256,
        Get = 512,
        Use = 1024,  // It's 'Use' in the manual, but it's really just Stop on the secondary icon menu.
        Drop = 2048,
        Sword = 4096,
        Bow = 8192,
        Shield = 16384
    }

    export enum Icon {
        None,
        // Primary Icon Menu
        Left,
        Up,
        Down,
        Right,
        Stop,
        Jump,
        Run,
        Attack,
        Defend,
        Flee,
        // Secondary Icon Menu
        Pickup,
        Use,  // It's 'Use' in the manual, but it's really just 'Stop' in the DOS game.
        Drop,
        Sword,
        Bow,
        Shield,
    }

    export const ICON_TO_BUTTONS: Buttons[] = [
        0,
        Buttons.Left,
        Buttons.Up,
        Buttons.Down,
        Buttons.Right,
        Buttons.Stop,
        Buttons.Jump,
        Buttons.Run,
        Buttons.Attack,
        Buttons.Defend,
        Buttons.Flee,
        Buttons.Pickup,
        Buttons.Stop,
        Buttons.Drop,
        Buttons.Sword,
        Buttons.Bow,
        Buttons.Shield,
    ];

    export class ControlCodes {
        // Define array indices for control buttons
        static A: number = 0;
        static B: number = 1;
        static UP: number = 2;
        static DOWN: number = 3;
        static LEFT: number = 4;
        static RIGHT: number = 5;
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

    export class IconsState {

        public lastIconSelected: Icon = Icon.None;

        private state: Buttons = 0;

        constructor() {
            this.reset();
        }

        reset() {
            this.lastIconSelected = Icon.None;
            this.state = 0;
        }

        selectIcon(icon: Icon) {
            this.lastIconSelected = icon;
            switch (this.lastIconSelected) {
                case Icon.Left:
                    this.state &= (Buttons.Left | Buttons.Up | Buttons.Down);
                    break;
                case Icon.Up:
                    this.state &= (Buttons.Up | Buttons.Left | Buttons.Right);
                    break;
                case Icon.Down:
                    this.state &= (Buttons.Down | Buttons.Left | Buttons.Right);
                    break;
                case Icon.Right:
                    this.state &= (Buttons.Right | Buttons.Up | Buttons.Down);
                    break;
                case Icon.Jump:
                    this.state &= (Buttons.Jump | Buttons.Run);
                    break;
                default:
                    this.state &= ICON_TO_BUTTONS[icon];
                    break;
            }
        }

        isIconSelected(icon: Icon): boolean {
            return !!(this.state & ICON_TO_BUTTONS[icon]);
        }
    }

    export class IconMenu {

        public static PRIMARY_ICONS: Icon[] = [
            Icon.Left,
            Icon.Up,
            Icon.Down,
            Icon.Right,
            Icon.Stop,
            Icon.Jump,
            Icon.Run,
            Icon.Attack,
            Icon.Defend,
            Icon.Flee,
        ];

        public static SECONDARY_ICONS: Icon[] = [
            Icon.Pickup,
            Icon.Use,
            Icon.Drop,
            Icon.Sword,
            Icon.Bow,
            Icon.Shield,
        ];

        private static ICON_HEIGHT = TILE_SIZE * 5;
        private static ICON_WIDTH = TILE_SIZE * 5;

        private static TOGGLE_MENU_KEY_CODE = Phaser.KeyCode.BACKSPACE;

        private static FUNCTION_KEY_CODES: Phaser.KeyCode[] = [
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
        ]

        public state: IconsState = new IconsState();

        private menuToggled: boolean = false;

        private game: Barbarian.Game;
        
        constructor(game: Barbarian.Game) {
            this.game = game;

            this.game.input.keyboard.addKeyCapture(IconMenu.TOGGLE_MENU_KEY_CODE);
            this.game.input.keyboard.addKeyCapture(IconMenu.FUNCTION_KEY_CODES);

            this.game.input.keyboard.addCallbacks(this, this.keyPressed);

            this.game.input.keyboard.addKey(IconMenu.TOGGLE_MENU_KEY_CODE).onDown.add(() => { this.menuToggled = !this.menuToggled; });

            this.game.input.onDown.add(this.menuClicked, this);
        }

        public get selectedIcon(): Icon {
            return this.state.lastIconSelected;
        }

        public get isMenuToggled(): boolean {
            return this.menuToggled;
        }

        public clearInput() {
            this.state.reset();
        }

        private set iconSelected(icon: Icon) {
            this.state.selectIcon(icon);
        }

        private menuClicked(pointer: Phaser.Pointer) {
            if (pointer.y < this.game.world.height - IconMenu.ICON_HEIGHT) { return; }

            var iconIndex = Math.floor(pointer.x / IconMenu.ICON_WIDTH);
            
            if (!this.menuToggled) {
                // Handle non-standard direction buttons.
                if (iconIndex < 2) {
                    if (pointer.x < IconMenu.ICON_WIDTH / 2) {
                        iconIndex = 0;
                    } else if (pointer.x > IconMenu.ICON_WIDTH * 1.5) {
                        iconIndex = 3;
                    } else if (pointer.y > this.game.world.height - IconMenu.ICON_HEIGHT / 2) {
                        iconIndex = 2;
                    } else {
                        iconIndex = 1;
                    }
                } else {
                    iconIndex += 2;
                }
                this.iconSelected = Icon.Left + iconIndex;
            } else {
                this.iconSelected = Icon.Pickup + iconIndex;
            }
        }

        private keyPressed(event) {
            var iconIndex = IconMenu.FUNCTION_KEY_CODES.indexOf(event.keyCode);
            if (iconIndex !== -1) {
                this.iconSelected = iconIndex + (this.menuToggled ? Icon.Pickup : Icon.Left);
            }
        }

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

            //keyboardState.controlState[ControlCodes.F1] = game.input.keyboard.isDown(Phaser.KeyCode.F1);
            //keyboardState.controlState[ControlCodes.F2] = game.input.keyboard.isDown(Phaser.KeyCode.F2);
            //keyboardState.controlState[ControlCodes.F3] = game.input.keyboard.isDown(Phaser.KeyCode.F3);
            //keyboardState.controlState[ControlCodes.F4] = game.input.keyboard.isDown(Phaser.KeyCode.F4);
            //keyboardState.controlState[ControlCodes.F5] = game.input.keyboard.isDown(Phaser.KeyCode.F5);
            //keyboardState.controlState[ControlCodes.F6] = game.input.keyboard.isDown(Phaser.KeyCode.F6);
            //keyboardState.controlState[ControlCodes.F7] = game.input.keyboard.isDown(Phaser.KeyCode.F7);
            //keyboardState.controlState[ControlCodes.F8] = game.input.keyboard.isDown(Phaser.KeyCode.F8);
            //keyboardState.controlState[ControlCodes.F9] = game.input.keyboard.isDown(Phaser.KeyCode.F9);
            //keyboardState.controlState[ControlCodes.F10] = game.input.keyboard.isDown(Phaser.KeyCode.F10);
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
        
        public static None: Buttons = 0;
        public static Up: Buttons = 1;
        public static Down: Buttons = 2;
        public static Right: Buttons = 4;
        public static Left: Buttons = 8;
        public static UpLeft: Buttons = ControlDirection.Up | ControlDirection.Left;
        public static UpRight: Buttons = ControlDirection.Up | ControlDirection.Right;
        public static DownLeft: Buttons = ControlDirection.Down | ControlDirection.Left;
        public static DownRight: Buttons = ControlDirection.Down | ControlDirection.Right;
        public static Horizontal: Buttons = ControlDirection.Left | ControlDirection.Right;
        public static Vertical: Buttons = ControlDirection.Up | ControlDirection.Down;
        public static Any: Buttons = ControlDirection.Up | ControlDirection.Down | ControlDirection.Left | ControlDirection.Right;

        static fromInput(keyboardState: KeyboardState, iconsState: IconsState): Buttons {
            var direction: Buttons = ControlDirection.None;
            // Get vertical direction
            if (keyboardState.isKeyDown(ControlCodes.UP) || iconsState.isIconSelected(Icon.Up)) {
                direction |= ControlDirection.Up;
            } else if (keyboardState.isKeyDown(ControlCodes.DOWN) || iconsState.isIconSelected(Icon.Down)) {
                direction |= ControlDirection.Down;
            }
            // Combine with horizontal direction
            if (keyboardState.isKeyDown(ControlCodes.LEFT) || iconsState.isIconSelected(Icon.Left)) {
                direction |= ControlDirection.Left;
            } else if (keyboardState.isKeyDown(ControlCodes.RIGHT) || iconsState.isIconSelected(Icon.Right)) {
                direction |= ControlDirection.Right;
            }

            return direction;
        }

        static fromButtons(buttons: Buttons): Buttons {
            // Extract the direction from a full set of buttons using a bit mask.
            return buttons & ControlDirection.Any;
        }

        static fromIconState(iconState: IconsState): Buttons {
            var direction: Buttons = ControlDirection.None;
            // Get vertical direction
            if (iconState.isIconSelected(Icon.Up)) {
                direction |= ControlDirection.Up;
            } else if (iconState.isIconSelected(Icon.Down)) {
                direction |= ControlDirection.Down;
            }
            // Combine with horizontal direction
            if (iconState.isIconSelected(Icon.Left)) {
                direction |= ControlDirection.Left;
            } else if (iconState.isIconSelected(Icon.Right)) {
                direction |= ControlDirection.Right;
            }

            return direction;
        }

    }

    
    
   

    export class InputManager {
        game: Barbarian.Game;
        hud: Hud;
        iconMenu: IconMenu;
        keyboardState: KeyboardState;
        lastKeyboardState: KeyboardState;
        iconsState: IconsState;
        lastIconsState: IconsState;

        lastInputTime: number = 0;
        buttonBuffer: number[];
        buttonsState: Buttons;

        static bufferTimeOut: number = 500;   // milliseconds
        static mergeInputTime: number = 100;  // milliseconds
        static BUFFER_SIZE: number = 10;
        //static nonDirectionButtons: number[] = [ControlCodes.A, ControlCodes.B];

        /// <summary>
        /// Provides the map of non-direction buttons to keyboard keys and hud icons.
        /// </summary>
        private nonDirectionButtons: { [key: string]: { button: Buttons, controlKey: number, icon: Icon; } } = {};

        constructor(game: Barbarian.Game, hud: Hud) {
            this.game = game;
            this.hud = hud;
            this.iconMenu = new IconMenu(game);

            // Debug Toggle
            // this.game.input.keyboard.addKey(Phaser.KeyCode.D).onDown.add(this.game.toggleDebug, this.game);
            this.game.input.keyboard.addKey(Phaser.KeyCode.D).onDown.add(() => { this.game.debugOn = !this.game.debugOn });

            this.buttonBuffer = new Array(InputManager.BUFFER_SIZE);
            this.keyboardState = KeyboardState.GetState(this.game);
            this.iconsState = this.iconMenu.state;

            //this.nonDirectionButtons[Buttons.A.toString()] = { button: Buttons.A, controlKey: ControlCodes.A };
            //this.nonDirectionButtons[Buttons.B.toString()] = { button: Buttons.B, controlKey: ControlCodes.B };
            this.nonDirectionButtons[Buttons.Stop.toString()] = { button: Buttons.Stop, controlKey: ControlCodes.F5, icon: Icon.Stop };
            this.nonDirectionButtons[Buttons.Jump.toString()] = { button: Buttons.Jump, controlKey: ControlCodes.F6, icon: Icon.Jump };
            this.nonDirectionButtons[Buttons.Attack.toString()] = { button: Buttons.Attack, controlKey: ControlCodes.F8, icon: Icon.Attack };
            this.nonDirectionButtons[Buttons.Defend.toString()] = { button: Buttons.Defend, controlKey: ControlCodes.F9, icon: Icon.Defend }
            this.nonDirectionButtons[Buttons.Flee.toString()] = { button: Buttons.Flee, controlKey: ControlCodes.F10, icon: Icon.Flee };
            this.nonDirectionButtons[Buttons.Get.toString()] = { button: Buttons.Get, controlKey: ControlCodes.DOWN, icon: Icon.Pickup };
            this.nonDirectionButtons[Buttons.Run.toString()] = { button: Buttons.Run, controlKey: ControlCodes.F7, icon: Icon.Run };


            // Uh...these are directions, so we need to rename...
            this.nonDirectionButtons[Buttons.Left.toString()] = { button: Buttons.Left, controlKey: ControlCodes.F1, icon: Icon.Left };
            this.nonDirectionButtons[Buttons.Up.toString()] = { button: Buttons.Up, controlKey: ControlCodes.F2, icon: Icon.Up };
            this.nonDirectionButtons[Buttons.Down.toString()] = { button: Buttons.Down, controlKey: ControlCodes.F3, icon: Icon.Down };
            this.nonDirectionButtons[Buttons.Right.toString()] = { button: Buttons.Right, controlKey: ControlCodes.F4, icon: Icon.Right };
        }

        clearInput(): void {
            this.iconMenu.clearInput();
        }

        update(gameTime: Phaser.Time): void {
            // Save keyboard state
            this.lastKeyboardState = this.keyboardState;
            this.lastIconsState = this.iconsState;
            // Get new keyboard state
            this.keyboardState = KeyboardState.GetState(this.game);
            this.iconsState = this.iconMenu.state;

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
                var icon: Icon = this.nonDirectionButtons[key].icon;
                // Check if just pressed
                if ((this.lastKeyboardState.isKeyUp(controlKey) && this.keyboardState.isKeyDown(controlKey))
                    || (this.iconsState.isIconSelected(icon))
                ) {
                    // Use a bitwise-or to accumulate button presses.
                    buttons |= button;
                }
            }

            // It's hard to press two buttons on the same exact frame, so if they're close
            // enough consider them pressed at the same time.
            var mergeInput: boolean = (this.buttonBuffer.length > 0 && timeSinceLast < InputManager.mergeInputTime);

            // See if the player has changed direction
            var direction: number = ControlDirection.fromInput(this.keyboardState, this.iconsState);
            //if (ControlDirection.fromInput(this.lastKeyboardState, this.hudState) != direction) {
                // combine direction with buttons
                buttons |= direction;

                // Don't merge two different directions.  This avoids having impossible directions
                // such as Left+Up+Right.  This also has the side effect that the direction needs
                // to be pressed at the same time or slightly before the buttons for merging to work.
                mergeInput = false;
            //}

            // HACK - Merge previous hud state for up/down and left/right.
                //if (direction & ControlDirection.Horizontal) {
                //    direction |= (ControlDirection.fromIconState(this.lastHudState) & ControlDirection.Vertical)
                //} else if (direction & ControlDirection.Vertical) {
                //    direction |= (ControlDirection.fromIconState(this.lastHudState) & ControlDirection.Horizontal)
                //}
            
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
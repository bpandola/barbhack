namespace Barbarian.StateMachine {

    export const WILDCARD: string = '*';

    export interface IState {
        onEnter(...args: any[]);
        onUpdate();
        onLeave();
    }

    export class StateMachine {

        private states: { id: string, value: IState }[] = [];
        private validFromStates: { id: string, value: string[] }[] = [];
        private currentState: IState = null;
        private pendingState: string = null;
        private pendingStateArgs: any[];
        private currentStateName: string;
        private canTransitionFromSelf: { id: string, value: boolean }[] = [];
        private hero: Barbarian.Hero;

        constructor(hero: Barbarian.Hero) {
            this.hero = hero;
        }

        add(key: string, state: IState, validFromStates: string[], canTransitionFromSelf: boolean = false) {

            this.states[key] = state;
            this.validFromStates[key] = validFromStates;
            this.canTransitionFromSelf[key] = canTransitionFromSelf;
        }

        transition(newState: string, immediately: boolean = false, ...args: any[]) {
            console.log(newState);
            // HACK! - If pending state is Idle, allow it to be overridden
            // by a new (valid) pending state.  This allows things like
            // immediately walking/running after going up stairs without
            // the single frame blip of the intermediate Idle animation.
            if (this.pendingState === 'Idle' && this.isValidFromPending(newState)) {
                this.pendingState = newState;
            } else if (this.currentState != null && !this.isValidFrom(newState))
                return;

            // Set this new state to be our pending state, but it won't
            // be called until the update fires (once per FIXED_TIMESTEP).
            if (this.pendingState == null) {
                this.pendingState = newState;

                // Assigning to arguments properties causes Extreme Deoptimization in Chrome, FF, and IE.
                // Using an array and pushing each element (not a slice!) is _significantly_ faster.
                this.pendingStateArgs = [];
                for (var i = 2; i < arguments.length; i++) {
                    this.pendingStateArgs.push(arguments[i]);
                }
            }
            // If we don't have a current state, we need to transition
            // immediately.
            if (this.currentState == null || immediately == true)
                this.update();
        }

        update() {
            if (this.pendingState) {
                if (this.currentState)
                    this.currentState.onLeave();

                this.currentState = this.states[this.pendingState];
                this.currentStateName = this.pendingState;
                this.pendingState = null;

                this.currentState.onEnter(this.pendingStateArgs);
                
            }
            if (this.currentState)
                this.currentState.onUpdate();
        }

        getCurrentState(): IState {
            return this.currentState;
        }

        get getCurrentStateName(): string {
            return this.currentStateName;
        }

        isValidFrom(newState: string): boolean {
            var isValid = false;
            if (newState != this.currentStateName || this.canTransitionFromSelf[newState]) {
                for (var state of this.validFromStates[newState]) {
                    if (state == this.currentStateName || state == WILDCARD)
                        isValid = true;
                }
            }
            return isValid;
        }

        isValidFromPending(newState: string): boolean {
            var isValid = false;
            if (newState != this.pendingState) {
                for (var state of this.validFromStates[newState] || this.canTransitionFromSelf[newState]) {
                    if (state == this.pendingState || state == WILDCARD)
                        isValid = true;
                }
            }
            return isValid;
        }

    }
}
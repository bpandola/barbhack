namespace Barbarian.StateMachine {

    export const WILDCARD: string = '*';

    export interface IState {
        onEnter();
        onUpdate();
        onLeave();
    }

    export class StateMachine {

        private states: { id: string, value: IState }[] = [];
        private validFromStates: { id: string, value: string[] }[] = [];
        private currentState: IState = null;
        private pendingState: string = null;
        private currentStateName: string;
        private hero: Barbarian.Hero;

        constructor(hero: Barbarian.Hero) {
            this.hero = hero;
        }

        add(key: string, state: IState, validFromStates: string[]) {

            this.states[key] = state;
            this.validFromStates[key] = validFromStates;
        }

        transition(newState: string, immediately:boolean = false) {
            if (this.currentState != null && !this.isValidFrom(newState))
                return;

            // Set this new state to be our pending state, but it won't
            // be called until the update fires (once per FIXED_TIMESTEP).
            if (this.pendingState == null)
                this.pendingState = newState;
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
                this.currentState.onEnter();

                
                
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
            if (newState != this.currentStateName) {
                for (var state of this.validFromStates[newState]) {
                    if (state == this.currentStateName || state == WILDCARD)
                        isValid = true;
                }
            }
            return isValid;
        }

    }
}
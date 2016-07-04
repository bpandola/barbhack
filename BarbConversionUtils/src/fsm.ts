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
        private currentStateName: string;
        private hero: Barbarian.Hero;

        constructor(hero: Barbarian.Hero) {
            this.hero = hero;
        }

        add(key: string, state: IState, validFromStates: string[]) {

            this.states[key] = state;
            this.validFromStates[key] = validFromStates;
        }

        transition(newState: string) {
            if (this.currentState != null && !this.isValidFrom(newState))
                return;

            if (this.currentState)
                this.currentState.onLeave();

            this.currentState = this.states[newState];
            this.currentStateName = newState;
            this.currentState.onEnter();
            this.currentState.onUpdate();

            // HACK?
            this.hero.timeStep = 0;
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
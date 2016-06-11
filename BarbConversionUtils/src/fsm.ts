namespace Barbarian.StateMachine {

    export interface IState {
        onEnter();
        onUpdate();
        onLeave();
        onFrameChange();
    }

    export class StateMachine {

        private states: { id: string, value: IState }[] = [];
        private currentState: IState = null;
        private currentStateName: string;
        private hero: Barbarian.Hero;

        constructor(hero: Barbarian.Hero) {
            this.hero = hero;
        }

        add(key: string, state: IState) {

            this.states[key] = state;
            //this.currentState = this.states[key];
        }

        transition(newState: string) {
            if (this.currentState)
                this.currentState.onLeave();

            this.currentState = this.states[newState];
            this.currentStateName = newState;
            this.currentState.onEnter();

            // Reset timer - HACK!
            this.hero.game.time.events.remove(this.hero.animTimer);
            this.hero.animTimer = this.hero.game.time.events.loop(Barbarian.Hero.ANIMATION_INTERVAL, this.hero.animate, this.hero);
            
        }

        getCurrentState(): IState {
            return this.currentState;
        }

        get getCurrentStateName(): string {
            return this.currentStateName;
        }

    }
}
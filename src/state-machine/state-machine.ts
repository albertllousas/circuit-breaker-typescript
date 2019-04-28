import {LazyPromise, noop, wrapInError} from '../types';
import {CircuitBreakerState, ClosedCircuit, HalfOpenCircuit, OpenCircuit} from './states';

type TransitionResult<T> = {
    result: T | Error;
    newStateMachine: CircuitBreakerStateMachine<T>
};

export default class CircuitBreakerStateMachine<T> {

    constructor(
        readonly currentState: CircuitBreakerState,
        readonly isThresholdReached: (fails: number) => boolean,
        readonly isTimeoutReached: (openCircuit: OpenCircuit) => boolean,
        readonly notifyTransition: (previous: CircuitBreakerState, next: CircuitBreakerState) => any = noop
    ) {
    }

    private transitionTo(nextState: CircuitBreakerState): CircuitBreakerStateMachine<T> {
        if (this.currentState !== nextState) {
            this.notifyTransition(this.currentState, nextState);
        }
        return new CircuitBreakerStateMachine<T>(
            nextState, this.isThresholdReached, this.isTimeoutReached, this.notifyTransition
        );
    }

    private handleClosedState(circuit: ClosedCircuit, call: LazyPromise<T>): Promise<TransitionResult<T>> {
        return call()
            .then(success => ({result: success, newStateMachine: this.transitionTo(circuit.reset())}))
            .catch(error => {
                const nextState: ClosedCircuit | OpenCircuit =
                    this.isThresholdReached(circuit.failCount + 1) ? circuit.trip() : circuit.increaseFails();
                const newStateMachine = this.transitionTo(nextState);
                return {result: wrapInError(error), newStateMachine};
            });
    }

    private handleOpenState(openCircuit: OpenCircuit, call: LazyPromise<T>): Promise<TransitionResult<T>> {
        if (this.isTimeoutReached(openCircuit)) {
            const halfOpenCircuit = openCircuit.tryReset();
            return this.transitionTo(halfOpenCircuit).invoke(call);
        } else {
            return Promise.resolve({result: new Error('circuit-breaker-open'), newStateMachine: this});
        }
    }

    private handleHalfOpenState(halfOpenCircuit: HalfOpenCircuit, call: LazyPromise<T>): Promise<TransitionResult<T>> {
        return call()
            .then(success => ({result: success, newStateMachine: this.transitionTo(halfOpenCircuit.reset())}))
            .catch(error => ({result: wrapInError(error), newStateMachine: this.transitionTo(halfOpenCircuit.trip())}));
    }

    public invoke(call: LazyPromise<T>): Promise<TransitionResult<T>> {
        if (this.currentState instanceof ClosedCircuit) {
            return this.handleClosedState(this.currentState, call);
        } else if (this.currentState instanceof OpenCircuit) {
            return this.handleOpenState(this.currentState, call);
        } else {
            return this.handleHalfOpenState(this.currentState, call);
        }
    }

}

// function fail () {
//     throw new Error('Whoops!');
// }
//
// const promise = new Promise((resolve) => resolve(fail()));
//
// promise
//     .then(s => console.log('yeah'))
//     .catch(e => console.log(e.message));
// https://www.hascode.com/2017/02/resilient-architecture-circuit-breakers-for-java-hystrix-vert-x-javaslang-and-failsafe-examples/
// https://doc.akka.io/docs/akka/current/common/circuitbreaker.html
// https://8thlight.com/blog/micah-martin/2006/11/17/understanding-statemachines-part-1-states-and-transitions.html
// https://monix.io/docs/2x/eval/circuit-breaker.html
// decorateFunction fallBack?
// https://github.com/jike-engineering/circuit-breaker-ts
// https://github.com/robey/profuse
// https://www.baeldung.com/resilience4j
// https://flaviocopes.com/node-event-loop/
// http://dynamicfsm.blogspot.com/
// https://xlinux.nist.gov/dads/HTML/finiteStateMachine.html

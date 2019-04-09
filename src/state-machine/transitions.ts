import {CircuitBreakerState, ClosedCircuit, HalfOpenCircuit, OpenCircuit} from './states';

type Call<T> = () => T;

type CallResult<T> = T | Error;

type InvokeResult<T> = {
    callResult: CallResult<T>;
    newStateMachine: CircuitBreakerStateMachine<T>
};

function executeCall<T>(call: Call<T>): CallResult<T> {
    try {
        return call();
    } catch (e) {
        return e;
    }
}

class CircuitBreakerStateMachine<T> {

    constructor(
        readonly currentState: CircuitBreakerState,
        readonly isThresholdReached: (fails: number) => boolean,
        readonly isTimeoutReached: (openCircuit: OpenCircuit) => boolean,
        readonly notifyTransition: (previous: CircuitBreakerState, next: CircuitBreakerState) => any
    ) {
    }

    private nextState(newState: CircuitBreakerState): CircuitBreakerStateMachine<T> {
        this.notifyTransition(this.currentState, newState);
        return new CircuitBreakerStateMachine<T>(
            newState, this.isThresholdReached, this.isTimeoutReached, this.notifyTransition
        );
    }

    private handleClosedState(closedCircuit: ClosedCircuit, call: Call<T>): InvokeResult<T> {
        const callResult = executeCall(call);
        if (callResult instanceof Error) {
            return {callResult, newStateMachine: this.nextState(closedCircuit.reset())};
        } else {
            const newStateMachine = this.nextState(this.isThresholdReached(closedCircuit.failCount + 1) ?
                closedCircuit.trip() : closedCircuit.increaseFails());
            return {callResult, newStateMachine};
        }
    }

    private handleOpenState(openCircuit: OpenCircuit, call: Call<T>): InvokeResult<T> {
        if (this.isTimeoutReached(openCircuit)) {
            return this.nextState(openCircuit.tryReset()).invoke(call);
        } else {
            return {callResult: new Error('circuit-breaker-open'), newStateMachine: this};
        }
    }

    private handleHalfOpenState(halfOpenCircuit: HalfOpenCircuit, call: Call<T>): InvokeResult<T> {
        const callResult = executeCall(call);
        if (callResult instanceof Error) {
            return {callResult, newStateMachine: this.nextState(halfOpenCircuit.trip())};
        } else {
            return {callResult, newStateMachine: this.nextState(halfOpenCircuit.reset())};
        }
    }

    public invoke(call: Call<T>): InvokeResult<T> {
        if (this.currentState instanceof ClosedCircuit) {
            return this.handleClosedState(this.currentState, call);
        } else if (this.currentState instanceof OpenCircuit) {
            return this.handleOpenState(this.currentState, call);
        } else {
            return this.handleHalfOpenState(this.currentState, call);
        }
    }

}

// https://www.hascode.com/2017/02/resilient-architecture-circuit-breakers-for-java-hystrix-vert-x-javaslang-and-failsafe-examples/
// https://doc.akka.io/docs/akka/current/common/circuitbreaker.html
// https://8thlight.com/blog/micah-martin/2006/11/17/understanding-statemachines-part-1-states-and-transitions.html
// https://monix.io/docs/2x/eval/circuit-breaker.html

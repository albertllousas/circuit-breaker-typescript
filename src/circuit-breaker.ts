import {CircuitBreakerStateMachine} from './state-machine/state-machine';
import {ClosedCircuit, OpenCircuit} from './state-machine/states';

type CircuitBreakerConfig = {
    maxFailures: number,
    resetTimeoutInMillis: number
};

export default class CircuitBreaker {

    private stateMachine: CircuitBreakerStateMachine;
    private inUse: boolean = false;

    constructor(
        readonly config: CircuitBreakerConfig = {
            maxFailures: 5,
            resetTimeoutInMillis: 1000,
        },
        readonly now: () => Date = () => new Date()
    ) {
        this.stateMachine = this.initStateMachine(config, now);
    }

    private initStateMachine(config: CircuitBreakerConfig, now: () => Date) {
        const isThresholdReached: (fails: number) => boolean = fails => fails >= config.maxFailures;
        const isTimeoutReached: (open: OpenCircuit) => boolean =
            open => (open.openedAt.getTime() + config.resetTimeoutInMillis) < now().getTime();
        return new CircuitBreakerStateMachine(new ClosedCircuit(), isThresholdReached, isTimeoutReached);
    }

    // diagram of concerns/ responsibilitites
// https://github.com/resilience4j/resilience4j/blob/3665c70c7e256067597c61f83c22d83523e62e75/
    // resilience4j-circuitbreaker/src/test/java/io/github/resilience4j/circuitbreaker/CircuitBreakerTest.java
    public protectFunction<A, B>(call: ((_: A) => B)): (_: A) => B {
        this.adquireCircuitBreaker(); // preventOverUse
        return (argument: A) => {
            this.preCall();
            this.failFastIfRequired();
            try {
                const result = call(argument);
                this.callSucceed();
                return result;
            } catch (error) {
                this.callFailed();
                throw error;
            }
        };
    }

    // decoratePromise

    private adquireCircuitBreaker() {
        if (this.inUse) {
            throw new Error('CircuitBreaker: already-in-use');
        } else {
            this.inUse = true;
        }
    }

    private failFastIfRequired() {
        if (this.stateMachine.shouldFailFast()) {
            throw new Error('CircuitBreaker: fail-fast');
        }
    }

    private preCall = () => (this.stateMachine = this.stateMachine.transition('BeforeCallSignal'));

    private callSucceed = () => (this.stateMachine = this.stateMachine.transition('CallSucceed'));

    private callFailed = () => (this.stateMachine = this.stateMachine.transition('CallFailed'));
}

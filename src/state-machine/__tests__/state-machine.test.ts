import {CircuitBreakerStateMachine} from '../state-machine';
import {ClosedCircuit, HalfOpenCircuit, OpenCircuit} from '../states';

describe('Circuit breaker state machine', () => {

    const noop = jest.fn();

    describe('closed circuit transitions', () => {

        const closedCircuit = ClosedCircuit.start();

        it('should stay in closed state when a call succeed', () => {
            const stateMachine = new CircuitBreakerStateMachine(closedCircuit, noop, noop);

            const newStateMachine = stateMachine.transition('CallSucceed');

            expect(newStateMachine.currentState).toBeInstanceOf(ClosedCircuit);
        });

        it('should stay in closed state when a call fails but the threshold is not reached', () => {

            const isThresholdReached = () => false;
            const stateMachine = new CircuitBreakerStateMachine(closedCircuit, isThresholdReached, noop);

            const newStateMachine = stateMachine.transition('CallFailed');

            expect(newStateMachine.currentState).toBeInstanceOf(ClosedCircuit);
        });

        it('should reset the circuit when a call succeed', () => {
            const closedCircuitWithFails = new ClosedCircuit(10);
            const stateMachine = new CircuitBreakerStateMachine(closedCircuitWithFails, noop, noop);

            const newStateMachine = stateMachine.transition('CallSucceed');

            expect(newStateMachine.currentState).toBeInstanceOf(ClosedCircuit)
            expect(newStateMachine.currentState).toMatchObject({failCount: 0});
        });

        it('should trip the circuit when threshold is reached', () => {
            const isThresholdReached = () => true;
            const stateMachine = new CircuitBreakerStateMachine(closedCircuit, isThresholdReached, noop);

            const newStateMachine = stateMachine.transition('CallFailed');

            expect(newStateMachine.currentState).toBeInstanceOf(OpenCircuit);
        });
    });

    describe('open circuit transitions', () => {

        const fixedDate = new Date('1995-12-17T03:24:00');

        it('should fail fast when reset timeout has not been exceeded', async () => {
            const isTimeoutReached = () => false;
            const stateMachine = new CircuitBreakerStateMachine(new OpenCircuit(fixedDate), noop, isTimeoutReached);

            const newStateMachine = stateMachine.transition('CallSucceed');

            expect(newStateMachine.currentState).toBeInstanceOf(OpenCircuit);
        });

        it('should enter to half-open state when reset timeout has been exceeded', () => {
            const isTimeoutReached = () => true;
            const stateMachine = new CircuitBreakerStateMachine(new OpenCircuit(fixedDate), noop, isTimeoutReached);

            const newStateMachine = stateMachine.transition('BeforeCallSignal');

            expect(newStateMachine.currentState).toBeInstanceOf(HalfOpenCircuit);
        });
    });

    describe('open-closed circuit transitions', () => {

        const fixedDate = new Date('1995-12-17T03:24:00');

        it('should trip the circuit when try to reset fails', () => {
            const stateMachine = new CircuitBreakerStateMachine(new HalfOpenCircuit(), noop, noop);

            const newStateMachine = stateMachine.transition('CallFailed');

            expect(newStateMachine.currentState).toBeInstanceOf(OpenCircuit);
        });

        it('should reset back to closed state when attempt to reset succeeds', async () => {
            const stateMachine = new CircuitBreakerStateMachine(new HalfOpenCircuit(), noop, noop);

            const newStateMachine = stateMachine.transition('CallSucceed');

            expect(newStateMachine.currentState).toBeInstanceOf(ClosedCircuit);
        });
    });
});

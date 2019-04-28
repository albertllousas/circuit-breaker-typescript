import CircuitBreakerStateMachine from '../state-machine';
import {ClosedCircuit, HalfOpenCircuit, OpenCircuit} from '../states';

describe('Circuit breaker state machine', () => {

    const noop = jest.fn();
    const successCall = () => Promise.resolve('ok');
    const failCall = () => Promise.reject('ko');

    describe('closed circuit transitions', () => {

        const closedCircuit = ClosedCircuit.start();

        it('should stay in closed state when a call succeed', async () => {
            const stateMachine = new CircuitBreakerStateMachine<string>(closedCircuit, noop, noop);

            const transition = await stateMachine.invoke(successCall);

            expect(transition.result).toBe('ok');
            expect(transition.newStateMachine.currentState).toBeInstanceOf(ClosedCircuit);
        });

        it('should stay in closed state when a call fails but the threshold is not reached', async () => {

            const isThresholdReached = () => false;
            const stateMachine = new CircuitBreakerStateMachine<string>(closedCircuit, isThresholdReached, noop);

            const transition = await stateMachine.invoke(failCall);

            expect(transition.result).toEqual(new Error('ko'));
            expect(transition.newStateMachine.currentState).toBeInstanceOf(ClosedCircuit);
        });

        it('should reset the circuit when a call succeed', async () => {
            const closedCircuitWithFails = new ClosedCircuit(10);
            const stateMachine = new CircuitBreakerStateMachine<string>(closedCircuitWithFails, noop, noop);

            const transition = await stateMachine.invoke(successCall);

            expect(transition.newStateMachine.currentState).toBeInstanceOf(ClosedCircuit);
            expect(transition.newStateMachine.currentState).toMatchObject({failCount: 0});
        });

        it('should trip the circuit when threshold is reached', async () => {
            const isThresholdReached = () => true;
            const stateMachine = new CircuitBreakerStateMachine<string>(closedCircuit, isThresholdReached, noop, noop);

            const transition = await stateMachine.invoke(failCall);

            expect(transition.result).toEqual(new Error('ko'));
            expect(transition.newStateMachine.currentState).toBeInstanceOf(OpenCircuit);
        });
    });

    describe('open circuit transitions', () => {

        const fixedDate = new Date('1995-12-17T03:24:00');

        it('should fail fast when reset timeout has not been exceeded', async () => {
            const isTimeoutReached = () => false;
            const stateMachine = new CircuitBreakerStateMachine<string>(
                new OpenCircuit(fixedDate), noop, isTimeoutReached
            );

            const transition = await stateMachine.invoke(successCall);

            expect(transition.result).toEqual(new Error('circuit-breaker-open'));
            expect(transition.newStateMachine.currentState).toBeInstanceOf(OpenCircuit);
        });

        it('should enter to half-open state when reset timeout has been exceeded', async () => {
            const isTimeoutReached = () => true;
            const notify = jest.fn();
            const stateMachine = new CircuitBreakerStateMachine<string>(
                new OpenCircuit(fixedDate), noop, isTimeoutReached, notify
            );

            await stateMachine.invoke(successCall);

            expect(notify).toHaveBeenNthCalledWith(1, expect.any(OpenCircuit), expect.any(HalfOpenCircuit));
        });
    });

    describe('open-closed circuit transitions', () => {

        const fixedDate = new Date('1995-12-17T03:24:00');

        it('should trip the circuit when try to reset fails', async () => {
            const isTimeoutReached = () => true;
            const notify = jest.fn();
            const stateMachine = new CircuitBreakerStateMachine<string>(
                new OpenCircuit(fixedDate), noop, isTimeoutReached, notify
            );

            const transition = await stateMachine.invoke(failCall);

            expect(transition.result).toEqual(new Error('ko'));
            expect(transition.newStateMachine.currentState).toBeInstanceOf(OpenCircuit);
            expect(notify).toHaveBeenNthCalledWith(1, expect.any(OpenCircuit), expect.any(HalfOpenCircuit));
            expect(notify).toHaveBeenNthCalledWith(2, expect.any(HalfOpenCircuit), expect.any(OpenCircuit));
        });

        it('should reset back to closed state when attempt to reset succeeds', async () => {
            const isTimeoutReached = () => true;
            const notify = jest.fn();
            const stateMachine = new CircuitBreakerStateMachine<string>(
                new OpenCircuit(fixedDate), noop, isTimeoutReached, notify
            );

            const transition = await stateMachine.invoke(successCall);

            expect(transition.result).toEqual('ok');
            expect(transition.newStateMachine.currentState).toBeInstanceOf(ClosedCircuit);
            expect(notify).toHaveBeenNthCalledWith(1, expect.any(OpenCircuit), expect.any(HalfOpenCircuit));
            expect(notify).toHaveBeenNthCalledWith(2, expect.any(HalfOpenCircuit), expect.any(ClosedCircuit));
        });
    });
});

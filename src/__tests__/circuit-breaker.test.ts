import CircuitBreaker from '../circuit-breaker';

describe('Circuit breaker', () => {

    const wait = (millis: number) => new Promise(resolve => setTimeout(resolve, millis));

    describe('preventing overuse', () => {

        it('should prevent overusing the circuit breaker in more than one function', () => {
            const circuitBreaker = new CircuitBreaker();
            const firstFunction = jest.fn();
            const secondFunction = jest.fn();

            expect(() => circuitBreaker.protectFunction(firstFunction)).not.toThrowError();
            expect(() => circuitBreaker.protectFunction(secondFunction)).toThrowError('CircuitBreaker: already-in-use');

        });
    });

    describe('protecting a function', () => {

        it('should not fail fast when calls succeed', () => {
            const circuitBreaker = new CircuitBreaker({maxFailures: 1, resetTimeoutInMillis: 10});
            const nonFailingFunction = (_: any) => 'ok';
            const protectedFn = circuitBreaker.protectFunction(nonFailingFunction);

            expect(() => protectedFn('')).not.toThrowError();
            expect(() => protectedFn('')).not.toThrowError();
        });

        it('should fail fast when max failures are reached', () => {
            const circuitBreaker = new CircuitBreaker({maxFailures: 1, resetTimeoutInMillis: 10000}, () => new Date());
            const failingFunction = (_: any) => {
                throw new Error('Boom');
            };
            const protectedFn = circuitBreaker.protectFunction(failingFunction);

            expect(() => protectedFn('')).toThrowError('Boom');
            expect(() => protectedFn('')).toThrowError('CircuitBreaker: fail-fast');

        });

        it('should let the calls go through when timeout is reached after failing fast', async () => {
            const circuitBreaker = new CircuitBreaker({maxFailures: 1, resetTimeoutInMillis: 100});
            const failingFunction = (_: any) => {
                throw new Error('Boom');
            };
            const protectedFn = circuitBreaker.protectFunction(failingFunction);

            expect(() => protectedFn('')).toThrowError('Boom');
            expect(() => protectedFn('')).toThrowError('CircuitBreaker: fail-fast');
            await wait(200);
            expect(() => protectedFn('')).toThrowError('Boom');
        });
    });

    describe('protecting a promise', () => {

        it('should not fail fast when calls succeed', async () => {
            const circuitBreaker = new CircuitBreaker({maxFailures: 1, resetTimeoutInMillis: 10});
            const nonFailingPromise = Promise.resolve('ok');
            const protectedPromise = circuitBreaker.protectPromise(() => nonFailingPromise);

            await expect(protectedPromise()).resolves.toBe('ok');
            await expect(protectedPromise()).resolves.toBe('ok');
        });

        it('should fail fast when max failures are reached', async () => {
            const circuitBreaker = new CircuitBreaker({maxFailures: 1, resetTimeoutInMillis: 10000});
            const failingPromise = Promise.reject('ko');
            const protectedPromise = circuitBreaker.protectPromise(() => failingPromise);

            await expect(protectedPromise()).rejects.toBe('ko');
            await expect(protectedPromise()).rejects.toEqual(new Error('CircuitBreaker: fail-fast'));

        });

        it('should let the calls go through when timeout is reached after failing fast', async () => {
            const circuitBreaker = new CircuitBreaker({maxFailures: 1, resetTimeoutInMillis: 100});
            const failingPromise = Promise.reject('ko');
            const protectedPromise = circuitBreaker.protectPromise(() => failingPromise);

            await expect(protectedPromise()).rejects.toBe('ko');
            await expect(protectedPromise()).rejects.toEqual(new Error('CircuitBreaker: fail-fast'));
            await wait(200);
            await expect(protectedPromise()).rejects.toBe('ko');
        });
    });
});

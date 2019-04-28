import {ClosedCircuit, HalfOpenCircuit, OpenCircuit} from '../states';

describe('Circuit breaker states', () => {

    const now = new Date('1995-12-17T03:24:00');

    describe('closed circuit', () => {
        it('should start the circuit as closed without fails', () => {
            const closed = ClosedCircuit.start();

            expect(closed).toBeInstanceOf(ClosedCircuit);
            expect(closed).toMatchObject({failCount: 0});
        });

        it('should increase the error counter', () => {
            const closed = ClosedCircuit.start();

            const failed = closed.increaseFails();

            expect(failed.failCount).toBe(1);
        });

        it('should reset the circuit', () => {
            const closed = ClosedCircuit.start().increaseFails();

            const reset = closed.reset();

            expect(reset.failCount).toBe(0);
        });

        it('should trip and open the circuit', () => {
            const closed = ClosedCircuit.start();

            const opened = closed.trip(now);

            expect(opened).toBeInstanceOf(OpenCircuit);
            expect(opened.openedAt).toEqual(now);
        });
    });

    describe('open circuit', () => {
        it('should change the state to half-open when try to reset', () => {
            const opened = new OpenCircuit(now);

            const halfOpened = opened.tryReset();

            expect(halfOpened).toBeInstanceOf(HalfOpenCircuit);
        });
    });

    describe('half-open circuit', () => {
        it('should trip and open the circuit', () => {
            const halfOpen = new HalfOpenCircuit();

            const opened = halfOpen.trip(now);

            expect(opened).toBeInstanceOf(OpenCircuit);
            expect(opened.openedAt).toEqual(now);
        });

        it('should reset and close the circuit', () => {
            const halfOpen = new HalfOpenCircuit();

            const closed = halfOpen.reset();

            expect(closed).toBeInstanceOf(ClosedCircuit);
        });
    });
});

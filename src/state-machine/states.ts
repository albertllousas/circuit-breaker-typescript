const nowSupplier = () => new Date();

interface CircuitBreakerState {
    isCallPermitted(): boolean;
}

class ClosedCircuit implements CircuitBreakerState {
    constructor(readonly failCount: number = 0) {
    }

    public static start = () => new ClosedCircuit();
    public reset = () => new ClosedCircuit();
    public increaseFails = () => new ClosedCircuit(this.failCount + 1);
    public trip = (now = nowSupplier()) => new OpenCircuit(now);
    public isCallPermitted = () => true;
}

class OpenCircuit implements CircuitBreakerState {
    constructor(readonly openedAt: Date) {
    }

    public tryReset = () => new HalfOpenCircuit();
    public isCallPermitted = () => false;
}

class HalfOpenCircuit implements CircuitBreakerState {
    public trip = (now = nowSupplier()) => new OpenCircuit(now);
    public reset = () => ClosedCircuit.start();
    public isCallPermitted = () => true;
}

export {CircuitBreakerState, ClosedCircuit, OpenCircuit, HalfOpenCircuit};

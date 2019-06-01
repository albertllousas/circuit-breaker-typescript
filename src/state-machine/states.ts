const nowSupplier = () => new Date();

abstract class CircuitBreakerState {
    public abstract isCallPermitted(): boolean;
}

class ClosedCircuit extends CircuitBreakerState {
    constructor(readonly failCount: number = 0) {
        super();
    }

    public static start = () => new ClosedCircuit();
    public reset = () => new ClosedCircuit();
    public increaseFails = () => new ClosedCircuit(this.failCount + 1);
    public trip = (now = nowSupplier()) => new OpenCircuit(now);
    public isCallPermitted = () => true;
}

class OpenCircuit extends CircuitBreakerState {
    constructor(readonly openedAt: Date) {
        super();
    }

    public tryReset = () => new HalfOpenCircuit();
    public isCallPermitted = () => false;
}

class HalfOpenCircuit extends CircuitBreakerState {
    constructor() {
        super();
    }

    public trip = (now = nowSupplier()) => new OpenCircuit(now);
    public reset = () => ClosedCircuit.start();
    public isCallPermitted = () => true;
}

export {CircuitBreakerState, ClosedCircuit, OpenCircuit, HalfOpenCircuit};

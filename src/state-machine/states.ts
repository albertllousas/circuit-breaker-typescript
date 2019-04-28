const nowSupplier = () => new Date();

class ClosedCircuit {
    constructor(readonly failCount: number = 0) {}

    public static start = () => new ClosedCircuit();
    public reset = () => new ClosedCircuit();
    public increaseFails = () => new ClosedCircuit(this.failCount + 1);
    public trip = (now = nowSupplier()) => new OpenCircuit(now);
}

class OpenCircuit {
    constructor(readonly openedAt: Date) {}

    public tryReset = () => new HalfOpenCircuit();
}

class HalfOpenCircuit {
    public trip = (now = nowSupplier()) => new OpenCircuit(now);
    public reset = () => ClosedCircuit.start();
}

type CircuitBreakerState = ClosedCircuit | OpenCircuit | HalfOpenCircuit;

export {CircuitBreakerState, ClosedCircuit, OpenCircuit, HalfOpenCircuit};

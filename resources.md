promise and fallbacks

https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c
https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html

explain pattern 

resilience failfast

basics estate machine

// protect your promises
// function fail () {
//     throw new Error('Whoops!');
// }
//
// const promise = new Promise((resolve) => resolve(fail()));
//
// promise
//     .then(s => console.log('yeah'))
//     .catch(e => console.log(e.message));
// https://github.com/jhalterman/failsafe#circuit-breakers
// https://particular.net/blog/protect-your-software-with-the-circuit-breaker-design-pattern

// responsibilities
// https://en.wikipedia.org/wiki/Finite-state_machine
// https://blog.markshead.com/869/state-machines-computer-science/
// https://stackabuse.com/theory-of-computation-finite-state-machines/

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
// https://github.com/resilience4j/resilience4j/blob/ab0d8a0c2940f7f8af6f4fc9392cc539662290b8/resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/internal/CircuitBreakerStateMachine.java
https://www.javaworld.com/article/2824163/stability-patterns-applied-in-a-restful-architecture.html?page=2

https://emaxteam.com/circuit-breaker-breakdown/

   // diagram of concerns/ responsibilitites
// https://github.com/resilience4j/resilience4j/blob/3665c70c7e256067597c61f83c22d83523e62e75/
    // resilience4j-circuitbreaker/src/test/java/io/github/resilience4j/circuitbreaker/CircuitBreakerTest.java
    
    
    fallbacks



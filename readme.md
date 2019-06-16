# Circuit breaker for typescript

This project is a lightweight and easy-to-use circuit breaker, designed for typescript and functional programming.

It has two different purposes:
- A production ready circuit breaker for typescript
- A tutorial to understand this useful resilience pattern through typescript

## Getting Started

### Why to use it

If this resilience pattern does not sounds familiar to you, take a look on these resources:
- [Circuit breaker wikipedia](https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern)
- [Circuit breaker - Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Release It!](https://pragprog.com/book/mnee2/release-it-second-edition)

### Install

```bash
npm circuit-breaker-typescript
```

### How to Use It

#### Promises
Let's assume you have an http call that sometimes fail and you want to fail fast gracefully without waiting for TCP 
connection timeout:
```typescript
const unprotectedPromise = () => fetch(someUrl).then(response => response.json());
```

Protecting it is pretty straight forward:
```typescript

const circuitBreaker = new CircuitBreaker();

const protectedPromise = circuitBreaker.protectPromise(unprotectedPromise);

//normal use
protectedPromise().then(...);
```

#### Functions
You have a function that you want to protect:
```typescript
const unprotectedFunction = (params: Params) => { 
    // side effects that can eventually fail recurrently 
    };
```

Protecting it is similar to promises:
```typescript

const circuitBreaker = new CircuitBreaker();

const protectedFunction = circuitBreaker.protectFunction(unprotectedFunction);

//normal use
protectedFunction(params)
```

### API

https://github.com/jike-engineering/circuit-breaker-ts

## Local development

### Prerequisites

### Install 

### Running the tests

## Motivation and project break down

### Circuit breaker diagram

### Components

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc

# Promises-Control

[![license](https://img.shields.io/github/license/cyrillef/promises-all-limit.svg)](LICENSE)

An ECMAScript 2015 Promise is a great way to handle asynchronous operations. The Promise.all() function provides an easy interface to let a bunch of promises settle concurrently. However, it's an all-or-nothing approach: all your promises get created simultaneously. If you have a large number of operations that you want to run with some concurrency, Promise.all() is not good.

Instead, you probably want to limit the maximum number of simultaneous operations, and get results of those which were successful. That's where this module comes in. It provides an easy way of waiting for any number of promises to settle, while imposing an upper bound on the number of simultaneously executing promises.

The promises can be created in a just-in-time fashion. You essentially pass a function that produces a new promise every time it is called. Alternatively, you can pass an ES2015 iterator, meaning you can also use a generator function.

The module will allow to run all in parallel, all with a limit of concurrent operations, or in serie.

## Installation

```bash
npm install --save promise-all-limit
```

## Usage

```javascript
const promiseAllLimit = require('promise-all-limit')

const functionIterator = (index) => {
  // Your code goes here.
  // If there is job to run, return the next job item as a promise.
  // Otherwise, return null to indicate that all promises have been created.
};

const generatePromises = function * () {
  // Your code goes here.
  // If there is job to run, yield the next job item as a promise.
  // Otherwise, return to indicate that all promises have been created.
}

// The number of promises to process simultaneously.
const nbConcurrentJob = 5;

const run = async () => {
  try {
    const results = await promiseAllLimit(
      nbConcurrentJob, // How many ti run concurrently? -1 = all / 1 = run in serie / 2..n = run in parallel with a limit
      iterator, // function or generator to create promises
      true // continue if any promise is rejected
    );
    console.log('done.')
    // Will return Rejected and Fullfilled promises processed (all are processed if the 3rd parameter is true,
    // otherwise will only return results for Rejected and Fullfilled promises which were processed before the 1st Rejected promise).
    console.log(results);  
  } catch (error) {
    console.error(error);
  }
};

console.log('Starting...');
runTests();

```
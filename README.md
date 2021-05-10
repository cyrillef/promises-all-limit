# Promises-All-Limit

[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)

An ECMAScript 2015 Promise is a great way to handle asynchronous operations. The Promise.all() function provides an easy interface to let a bunch of promises settle concurrently. However, it's an all-or-nothing approach: all your promises get created simultaneously. If you have a large number of operations that you want to run with some concurrency, Promise.all() is not good.

Instead, you probably want to limit the maximum number of simultaneous operations, and get results of those which were successful. That's where this module comes in. It provides an easy way of waiting for any number of promises to settle, while imposing an upper bound on the number of simultaneously executing promises.

The promises can be created in a just-in-time fashion. You essentially pass a function that produces a new promise every time it is called. Alternatively, you can pass an ES2015 iterator, meaning you can also use a generator function.

The module will allow to run all in parallel, all with a limit of concurrent operations, or in serie.

## Installation

```bash
npm install --save promises-all-limit
```

## Usage

```javascript
const promisesAllLimit = require('promises-all-limit')

const functionIterator = (index) => {
  // Your code goes here.
  // If there is job to run, return the next job item as a promise.
  // Otherwise, return null to indicate that all promises have been created.

  // for example
  // return (new Promise((fullfil, reject) => setTimeout(() => reject({ error: 'this is an error' }), delay)));
  // or
  // return (new Promise((fullfil, reject) => setTimeout(() => fullfil({ success: 'this is success' }), delay)));
};

const generatePromises = function * () {
  // Your code goes here.
  // If there is job to run, yield the next job item as a promise.
  // Otherwise, return to indicate that all promises have been created.

  // for example
  // for (let index = 0; index < ??? ; index++) {
  //   yield return (new Promise((fullfil, reject) => setTimeout(() => reject({ error: 'this is an error' }), delay)));
  // or
  //   yield return (new Promise((fullfil, reject) => setTimeout(() => fullfil({ success: 'this is success' }), delay)));
  // }
}

// The number of promises to process simultaneously.
const nbConcurrentJob = 5;

const run = async () => {
  try {
    const results = await promisesAllLimit(
      nbConcurrentJob, // How many to run concurrently? -1 = all / 1 = run in serie / 2..n = run in parallel with a limit
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
run();

```

more examples available in /tests folders

# License

This module is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).  
Please see the [LICENSE](LICENSE) file for full details.

## Author

Cyrille Fauvel  
[@FAUVELCyrille](https://twitter.com/FAUVELCyrille),  
[Forge Partner Development](http://forge.autodesk.com)
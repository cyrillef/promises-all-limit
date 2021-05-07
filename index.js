//
// Copyright (c) 2021, Cyrille Fauvel
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/*jshint esversion: 9 */

const promiseStatus = (promise) => {
	// Don't modify any promise that has been already modified.
	if (!promise || promise.isResolved)
		return (promise);

	// Set initial state
	let isPending = true;
	let isRejected = false;
	let isFulfilled = false;
	let value = undefined;

	// Observe the promise, saving the fulfillment in a closure scope.
	let result = promise.then(
		(v) => {
			isFulfilled = true;
			isPending = false;
			value = v;
			return (v);
		},
		(e) => {
			isRejected = true;
			isPending = false;
			value = e;
			throw e;
		}
	);

	result.isFulfilled = () => isFulfilled;
	result.isPending = () => isPending;
	result.isRejected = () => isRejected;
	result.value = () => value;
	return (result);
};

const promisesAllLimit = (limit, iterator, continueOnError) => {

	const isGenerator = (func) => typeof func.constructor === 'function' && func.constructor.name === 'GeneratorFunction';
	const makeIterator = (func) => ({
		next: (index) => {
			const promise = func(index);
			return (promise ? { value: promise } : { done: true });
		}
	});

	limit = (limit < -1 && 1) || limit || 1;
	const data = {
		limit,
		iterator: isGenerator(iterator) ? iterator() : makeIterator(iterator),
		tmp: [],
		itmp: [],
		index: 0,
		continueOnError,
		hasRejected: false,
		results: [],
	};

	// Prepare starting promises
	for (data.index = 0; data.index < data.limit || data.limit === -1; data.index++) {
		//const job = promiseStatus(data.iterator(data.index));
		const item = data.iterator.next(data.index);
		const job = promiseStatus(item.value);
		if (!job || !item || item.done)
			break;
		data.tmp[data.index] = job;
		data.itmp[data.index] = data.index;
	}

	// Launch process
	return (new Promise(async (fulfill, reject) => {

		for (; ; ) {
			try {
				await Promise.race(data.tmp);
			} catch (ex) {
			}
			// Save resolved or Rejected promise(s)
			const nb = [];
			for (let k = 0; k < data.tmp.length; k++) {
				if (!data.tmp[k].isPending()) {
					if (data.tmp[k].isRejected())
						data.hasRejected = true;
					//data.results[data.itmp[k]] = data.tmp[k];
					data.results[data.itmp[k]] = data.tmp[k].value();
					data.itmp[k] = data.tmp[k] = undefined;
					nb.push(k);
					break;
				}
			}
			// Try to stop from there, but finish the one which are already started 
			if (data.hasRejected && !continueOnError) {
				data.tmp = data.tmp.filter((elt) => elt !== undefined);
				data.itmp = data.itmp.filter((elt) => elt !== undefined);
				if (data.tmp.length === 0)
					return (reject(data.results));
				continue;
			}
			// Fill new jobs in if any left
			for (let n = 0; n < nb.length; n++, data.index++) {
				//const job = promiseStatus(data.iterator(data.index));
				const item = data.iterator.next(data.index);
				const job = promiseStatus(item.value);
				if (!job || !item || item.done)
					break;
				data.tmp[nb[n]] = job;
				data.itmp[nb[n]] = data.index;
			}
			// Cleanup arrays
			data.tmp = data.tmp.filter((elt) => elt !== undefined);
			data.itmp = data.itmp.filter((elt) => elt !== undefined);
			if (data.tmp.length === 0)
				break;
		}

		if (data.hasRejected)
			reject(data.results);
		else
			fulfill(data.results);

	}));
};

module.exports = { promisesAllLimit, promiseStatus };
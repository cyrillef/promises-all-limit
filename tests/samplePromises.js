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

const { promiseAllLimit } = require('../index');
const { createJobDefinition, report, createJobWorkers } = require('./common');

const firstOneFails = false;
const noFailed = false;
const nbJobs = 20;
const nbConcurrentJob = 5;


const jobsDefinition = createJobDefinition(nbJobs, firstOneFails, noFailed);
const createJobWorkerFromIndex = (index) => index < jobsDefinition.length ? jobsDefinition[index].job(jobsDefinition[index].delay) : null;


const PromiseAllTest = () => {
	return (new Promise((fulfill, reject) => {
		console.info('using Promise.all');
		const prs = createJobWorkers(jobsDefinition);
		Promise.all(prs)
			.then((data) => report(data, fulfill)) // unlikely to happen in this sample because the way Promise.all() works
			//.catch((error) => reject(error)); // In theory, we would report the error, but in this sample we want to contine the chain
			.catch((err) => report(err, fulfill));
	}));
};

const ParallelLimitStops = () => {
	return (new Promise((fulfill, reject) => {
		console.info(`using promiseAllLimit - running ${nbConcurrentJob} jobs in parallel, stops on first error`);
		promiseAllLimit(nbConcurrentJob, createJobWorkerFromIndex, false)
			.then((prs) => report(prs, fulfill))
			//.catch((error) => reject(error)); // In theory, we would report the error, but in this sample we want to contine the chain
			.catch((err) => report(err, fulfill));
	}));
};

const ParallelLimitContinues = () => {
	return (new Promise((fulfill, reject) => {
		console.info(`using promiseAllLimit - running ${nbConcurrentJob} jobs in parallel, continue on errors`);
		promiseAllLimit(nbConcurrentJob, createJobWorkerFromIndex, true)
			.then((prs) => report(prs, fulfill))
			//.catch((error) => reject(error)); // In theory, we would report the error, but in this sample we want to contine the chain
			.catch((err) => report(err, fulfill));
	}));
};

const SerieStops = () => {
	return (new Promise((fulfill, reject) => {
		console.info('using promiseAllLimit - running jobs in serie, stops on first error');
		promiseAllLimit(1, createJobWorkerFromIndex, false)
			.then((prs) => report(prs, fulfill))
			//.catch((error) => reject(error)); // In theory, we would report the error, but in this sample we want to contine the chain
			.catch((err) => report(err, fulfill));
	}));
};

const SerieContinues = () => {
	return (new Promise((fulfill, reject) => {
		console.info('using promiseAllLimit - running jobs in serie, continue on errors');
		promiseAllLimit(1, createJobWorkerFromIndex, true)
			.then((prs) => report(prs, fulfill))
			//.catch((error) => reject(error)); // In theory, we would report the error, but in this sample we want to contine the chain
			.catch((err) => report(err, fulfill));
	}));
};

console.log('Starting...');
Promise.resolve()
	.then((data) => PromiseAllTest())
	.then((data) => ParallelLimitStops())
	.then((data) => ParallelLimitContinues())
	.then((data) => SerieStops())
	.then((data) => SerieContinues())
	.then((data) => console.log('done.'))
	.catch((error) => console.error(error));
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
const jobWorkersGenerator = function* () {
	for (let index = 0; index < jobsDefinition.length; index++) {
		yield jobsDefinition[index].job(jobsDefinition[index].delay);
	}
};


const PromiseAllTest = async () => {
	console.info('using Promise.all');
	const prs = createJobWorkers(jobsDefinition);
	try {
		const results = await Promise.all(prs);
		report(results); // unlikely to happen in this sample because the way Promise.all() works
	} catch (err) {
		report(err);
	}
};

const ParallelLimitStops = async () => {
	console.info(`using promiseAllLimit - running ${nbConcurrentJob} jobs in parallel, stops on first error`);
	try {
		const results = await promiseAllLimit(nbConcurrentJob, jobWorkersGenerator, false);
		report(results);
	} catch (err) {
		report(err);
	}
};

const ParallelLimitContinues = async () => {
	console.info(`using promiseAllLimit - running ${nbConcurrentJob} jobs in parallel, continue on errors`);
	try {
		const results = await promiseAllLimit(nbConcurrentJob, jobWorkersGenerator, true)
		report(results);
	} catch (err) {
		report(err);
	}
};

const SerieStops = async () => {
	console.info('using promiseAllLimit - running jobs in serie, stops on first error');
	try {
		const results = await promiseAllLimit(1, jobWorkersGenerator, false);
		report(results);
	} catch (err) {
		report(err);
	}
};

const SerieContinues = async () => {
	console.info('using promiseAllLimit - running jobs in serie, continue on errors');
	try {
		const results = await promiseAllLimit(1, jobWorkersGenerator, true);
		report(results);
	} catch (err) {
		report(err);
	}
};

const runTests = async () => {
	try {
		await PromiseAllTest();
		await ParallelLimitStops();
		await ParallelLimitContinues();
		await SerieStops();
		await SerieContinues();
	} catch (error) {
		console.error(error);
	}
	console.log('done.');
};

console.log('Starting...');
runTests();

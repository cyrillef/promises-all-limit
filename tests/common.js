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

// Functions to simulate failure or success
const failed = (delay) => {
	delay = delay || 1;
	return (new Promise((fullfil, reject) => setTimeout(() => reject({ error: delay }), delay)));
};

const success = (delay) => {
	delay = delay || 1;
	return (new Promise((fullfil, reject) => setTimeout(() => fullfil({ success: delay }), delay)));
};

// Prepare data to process (`nbConcurrentJob` jobs), we do not start promises from there, but later
const createJobDefinition = (nbJobs, firstOneFails = false, noFailed = false) => {
	const jobsDefinition = Array.from(
		{ length: nbJobs },
		(value, index) => {
			return ({
				i: index,
				job: Math.random() > 0.9 && noFailed === false ? failed : success, // 10% failures
				delay: Math.floor(Math.random() * 1000)
			});
		}
	);
	firstOneFails && (jobsDefinition[0] = { i: 0, job: failed, delay: 0 });
	return (jobsDefinition);
};

// Function to report success(es) or failure(s)
const report = (obj, prCB) => {
	if (Array.isArray(obj))
		console.table(obj);
	else
		console.log(obj);
	prCB && prCB(obj);
};

// Create promises from job definition
const createJobWorker = (elt, index, arr) => elt.job(elt.delay);
const createJobWorkers = (_jobs) => _jobs.map((elt, index) => createJobWorker(elt, index, _jobs));

module.exports = { failed, success, createJobDefinition, report, createJobWorker, createJobWorkers };
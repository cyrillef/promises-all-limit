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

const { promisesAllLimit } = require('../index');
const unirest = require('unirest');

const CreateJob = (index) => {
	if (index < 10)
		return (
			unirest
				.post('http://mockbin.com/request')
				.headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
				.send({ "parameter": 23, "foo": "bar" })
		);
	return (null);
};

const progress = (error, result) => {
	if ( error )
		return (console.error(JSON.stringify(error, null, 4)));
	//console.log (JSON.stringify(result, null, 4));
	console.log ('success');
};

console.log('Starting...');
Promise.resolve()
	.then((data) => promisesAllLimit(1, CreateJob, true, progress))
	.then((data) => console.log('done.'))
	.catch((error) => console.error(error));
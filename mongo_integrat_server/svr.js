/**
 * The MIT License
 * 
 *  Copyright (c) 2015 Tao P.R. (StarColon Projects)
 * 
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 * 
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 * 
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/**
 * MongoDB integration server for @below maker tool module
 * Created by StarColon Projects*: 2015
 * written in July 2015
 */

var package_json = require('../package.json');
const appVersion = package_json.version;
const appName = package_json.name + ': maker tool';
const portNo = package_json.makerToolServer.port || 7007;
const mongoDbAddr = package_json.makerToolServer['mongo-server'];
const mongoDbDatabase = package_json.makerToolServer['database'];
var serviceUrl = ''; // To be assigned run-time when server starts

// Initialize project dependencies
var app = require('express')();
var colors = require('colors');
var fs = require('fs');
var bodyParser = require('body-parser');
var below = require('../below.js');



(function loop(config){
	// Initialize the server model
	configServer(app,bodyParser);

	// Run the server listen loop
	var server = app.listen(config.port, function(){
		var host = server.address().address;
		var port = server.address().port;
		serviceUrl = 'http://'+host+':'+port+'/';

		console.log('****************************************************'.cyan);
		console.log(('      '+appName.toUpperCase()+' starts!').toString().cyan );
		console.log('      listening carefully at:'.cyan + (host + ':' + port).toString().green );
		console.log('****************************************************'.cyan);
		console.log('');

	});

})({
	port: portNo
});


function configServer(app,bodyParser){
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));

	// Allow cross-origin XHR accesses
	app.all('*', function(req, res, next) {
	  res.header('Access-Control-Allow-Origin', '*');
	  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	  res.header('Access-Control-Allow-Headers', 'Content-Type');
	  next();
	});

	// Map REST parameters
	app.param('collection',function(req,resp,next,collection){
		req.collection = collection || "default";
		return next();
	});
	app.param('grid',function(req,resp,next,grid){
		req.grid = grid || [];
		return next();
	});
 
	// Map REST verbs
	app.get('/list/',httpList);
	app.get('/ls/',httpList);
	app.put('/:collection/',httpPublish); // PUT to save
	app.get('/:collection/',httpFetch); // GET to read
}

/**
 * List the available grids stored in the server database
 */
function httpList(req,resp,next){
	console.log('/list/'.green);
	// List all collections in the database
	below.mongo.init(mongoDbAddr,mongoDbDatabase,null)
		.then(below.mongo.list())
		.catch(function(error){
			console.log('ERROR!');
			console.error(error.toString().red);
			resp.send([]);
		})
		.done(function(collections){
			resp.send(collections);
		});
}


function httpFetch(req,resp,next){
	console.log('GET/'.green + req.collection);
	// Fetch the grid from the specified collection
	below.mongo.init(mongoDbAddr,mongoDbDatabase,req.collection)
		 .then(below.mongo.load())
		 .catch(function(error){
		 	console.error(error.toString().red);
		 	resp.send([]);
		 })
		 .done(function(grid){
		 	if (grid.length==0)
		 		console.log('No grid loaded ...'.yellow);
		 	else
		 		console.log('Grid loaded ...'.yellow);
		 	console.log(grid);
		 	// TAOTOREVIEW: Should we disconnect from the db here?
		 	resp.send(grid);
		 });
}

/**
 * Publish a new or existing grid to the database
 */
function httpPublish(req,resp,next){
	console.log('PUT/'.green + req.collection);
	var grid = JSON.parse(Object.keys(req.body)[0]); // Forgive me ...
	console.log(grid);
	console.log(typeof grid);

	if (grid.length==0){
		console.log('Received empty grid');
		return resp.send([]);
	}
	else{
		below.mongo.init(mongoDbAddr,mongoDbDatabase,req.collection)
			.then(below.mongo.save(grid))
			.then(function(ack){ resp.send([]) })
			.done();
	}

}










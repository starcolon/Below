/** 
 * [below.js]
 * A library for implementing below-surface grid simulation
 * implemented by
 * @TaoPR (StarColon Projects)
 * 2015
 */

"use strict";

// Dependencies
if (typeof(_)=='undefined') var _ = require('underscore');
if (typeof(Promise)=='undefined') var Promise = require('promise');
if (typeof(Grid)=='undefined') var Grid = require('./modules/grid.js').Grid;


// Module definitions
var below = {}

/**
 * Settings namespace
 */
below.settings = {
	/**
	 * below.settings.create()
	 * Create an empty @below settings
	 * @returns {below.settings} object
	 */
	create: function(){
		return {
			offset: {i: 0, j: 0}, // Offset of the coordinate referenced in the real world
			size: {width:0, height:0}, // Positive integers
			entrances: [], // Array of coordinates {i,j}
			exits: [], // Array of coordinates {i,j}
			items: [], // Array of coordinates {i,j,item}
			obstacles: [], // Array of coordinates {i,j,obstacle}
			walls: [], // Array of coordinates {i,j}
			costFunction: function(value,coord){return value} // Cost function of each cell
		}
	}
}

/**
 * Generates a new grid given the configurations
 * @param {below.settings} settings 
 * @returns {Grid} output grid generated with the given configurations
 */
below.generate = function(settings){
	if (settings.size.width*settings.size.height<=0)
		throw 'The size must be properly defined';

	// Create an empty grid, fill each cell with default structure 
	let grid = Grid.create(settings.size.height, settings.size.width, {});
	Grid.eachOf(grid).applyProperty('cost',function(){return 1});
	Grid.eachOf(grid).applyProperty('items',function(){return []});

	// Apply cost function
	Grid.eachOf(grid).applyProperty('cost',settings.costFunction);

	// Apply entrances
	settings.entrances.forEach(function mapEntrance(entrance){
		Grid.cell(entrance.i, entrance.j).applyProperty(grid)('isEntrance',function(){return true});
	});
	// Apply exits
	settings.exits.forEach(function mapExit(exit){
		Grid.cell(exit.i, exit.j).applyProperty(grid)('isExit',function(){return true});
	});

	function applyListToCell(prop){
		return function doEach(elem){
			function pushMe(prev){ prev = prev || []; prev.push(elem[prop]); return prev; };
			Grid.cell(elem.i, elem.j).applyProperty(grid)(prop+'s',pushMe);	
		}
	}

	settings.items.forEach(applyListToCell('item'));
	settings.obstacles.forEach(applyListToCell('obstacle'));
	settings.walls.forEach(function(wall){
		Grid.cell(wall.i, wall.j).applyProperty(grid)('cost',function(){return 0xFFFF})
	});

	return grid;
}

/**
 * Query for the grid entrances
 * @param {grid}
 * @returns {Array} of coordinates representing the entrances
 */
below.entrances = function(grid){
	var entrances = [];
	for (var i in grid)
		for (var j in grid[i]){
			if (Grid.cell(parseInt(i),parseInt(j)).of(grid)['isEntrance']===true)
				entrances.push({i:parseInt(i),j:parseInt(j)});
		}
	return entrances;
}

/**
 * Query for the grid exits
 * @param {grid}
 * @returns {Array} of coordinates representing the exits
 */
below.exits = function(grid){
	var exits = [];
	for (var i in grid)
		for (var j in grid[i]){
			if (Grid.cell(parseInt(i),parseInt(j)).of(grid)['isExit']===true)
				exits.push({i:parseInt(i),j:parseInt(j)});
		}
	return exits;
}

/**
 * Check if a cell is dug
 * @param {Object} cellvalue
 * @param {Coord} coord
 * @returns {Bool}
 */
below.isDug = function(cellvalue,coord){
	return (cellvalue['cost'] || 1) <= 1
}

/**
 * Print the grid structure out to the console
 * @param {grid}
 * @param {Array} route - Array of the coordinates representing 
 */
below.illustrate = function(grid, route){
	let lines = [];
	route = route || [];
	function isPartOfRoute(coord){
		return _.any(route, function(r){
			return r.i==coord.i && r.j==coord.j
		})
	}

	for (var i in grid)
		for (var j in grid[i]){
			let cell = Grid.cell(parseInt(i),parseInt(j)).of(grid);
			let block = '';
			if (cell['isEntrance'])
				block = '￬ '.cyan;
			else if (cell['isExit'])
				block = '￬ '.green;
			else if (cell['cost']>=0xFFFF)
				block = '☒ '.red;
			else if (isPartOfRoute({i:parseInt(i),j:parseInt(j)}))
				block = '★ '.green;
			else
				block = '☐ ';

			if (!(j in lines))
				lines[j] = ''

			lines[j] += block;
		}

	for (var l in lines)
		console.log(lines[l])
}

below.illustrateCost = function(grid,route){
	let lines = [];
	route = route || [];
	function isPartOfRoute(coord){
		return _.any(route, function(r){
			return r.i==coord.i && r.j==coord.j
		})
	}

	function pad(num){
		if (num<10) return ' '+num.toString()+' ';
		else if (num<100) return ' '+num.toString();
		else if (num<1000) return num.toString();
		else return '###'
	}

	for (var i in grid)
		for (var j in grid[i]){
			let cell = Grid.cell(parseInt(i),parseInt(j)).of(grid);
			let block = '';
			if (cell['isEntrance'])
				block = '[ ￬ ]'.cyan;
			else if (cell['isExit'])
				block = '[ ￬ ]'.green;
			else if (cell['cost']>=0xFFFF)
				block = '[ ☒ ]'.red;
			else if (isPartOfRoute({i:parseInt(i),j:parseInt(j)}))
				block = ('['+pad(cell['cost'])+']').green;
			else
				block = ('['+pad(cell['cost'])+']');

			if (!(j in lines))
				lines[j] = ''

			lines[j] += block;
		}

	for (var l in lines)
		console.log(lines[l])
}


/**
 * Given a grid with content, generate a simple route from the source cell to the destination
 * using simple Lee's alogorthm (cost function does not make any differences)
 * @param {grid} 
 * @param {coord} starting point, if omitted, the default is set to the [first entrance]
 * @param {coord} destination point, if omitted, the default is set to the [first exit]
 * @param {bool} verbose
 * @returns {Array} array of coordinates representing the route
 */
below.generateSimpleRoute = function(grid,startCoord,endCoord,verbose){
	// Rewrite the parameters if any of them is omitted
	startCoord = startCoord || _.first(below.entrances(grid));
	endCoord = endCoord || _.first(below.exits(grid));

	var isNotWall = function(value,coord){ return value['cost']!=0xFFFF }
	var route = Grid.routeOf(grid)
		.from(startCoord.i,startCoord.j)
		.to(endCoord.i,endCoord.j)
		.where(isNotWall)
		.lee(verbose);

	return route;
}


/**
 * Given a grid with content, generate possible routes from a source cell to the destination
 * @param {grid} 
 * @param {coord} starting point, if omitted, the default is set to the [first entrance]
 * @param {coord} destination point, if omitted, the default is set to the [first exit]
 * @param {verbose} verbose
 * @returns {Array} array of coordinates representing the route
 */
below.generateBestRoute = function(grid,startCoord,endCoord,verbose){
	// Rewrite the parameters if any of them is omitted
	startCoord = startCoord || _.first(below.entrances(grid));
	endCoord = endCoord || _.first(below.exits(grid));

	var cost = function(value,coord){ return value['cost'] || 0 }
	var isNotWall = function(value,coord){ return value['cost']>=0xFFFF }
	var route = Grid
		.routeOf(grid)
		.from(startCoord.i,startCoord.j)
		.to(endCoord.i,endCoord.j)
		//.where(isNotWall) // NOTE: Do not need this because A* already skip the expensive path
		.astar(cost,verbose); // Enable verbose mode

	return route;
}


/**
 * Sum the total cost it needs to spend moving through the given route
 * @param {Grid}
 * @param {Array} array of cell coordinates 
 * @returns {Float} total cost
 */
below.sumCostOfRoute = function(grid,route){
	var costVector = route.map(function (coord){
		return grid[parseInt(coord.i)][parseInt(coord.j)].cost || 0
	});

	return _.reduce(costVector,function(a,b){return a+b},0)
}


/**
 * Flood fill the grid from the seed coordinate
 * @param {Grid} grid
 * @param {Coordinate} from
 * @returns {Array} list of cells painted by floodfill
 */
below.floodfill = function(grid,from){
	let here = from;
	function isAccessible(cell){ return cell['cost'] <= 1 }
	return Grid.floodfill(grid).from(here.i,here.j).where(isAccessible).commit();
}

/**
 * Check if a specified coordinate in the grid can be accessed
 * @param {Grid}
 * @param {Coord}
 * @returns {Bool}
 */
below.isAccessible = function(grid,from,to){
	let accessibleFromHere = below.floodfill(grid,from);
	return _.any(accessibleFromHere, function(c){ return c.i==to.i && c.j==to.j })
}

/**
 * Check if at least one of the exits are accessible (dug and no obstacles in between)
 * @param {Grid}
 * @returns {Bool}
 */
below.isExitAccessible = function(grid,from){
	let accessibleFromHere = below.floodfill(grid,from);
	return _.any(accessibleFromHere, function(c){ return grid[c.i][c.j]['isExit'] === true } )
}


/**
 * MongoDB connectivity
 */
below.mongo = {

	// DESIGN NOTE: 
	// 	All functions of {below.mongdo} return Promises.
	//	This is specifically a design pattern for asynchronous use.


	/**
	 * Initialize a connection to the mongo db server
	 * @param {string} server address
	 * @param {string} database name to access
	 * @param {string} collection name to access
	 * @returns {Promise} takes the function itself as parameter
	 */
	init: function(server,dbName,collection){
		// Initialize the required modules
		let pp = { db: undefined, collection: collection };

		return new Promise(function(fullfill,reject){
			// Try initializing the database connection
			try {
				server = server || 'mongodb://localhost';
				dbName = dbName || 'test';
				pp.db = require('mongoskin').db(server+'/'+dbName);

				console.log('    initialized a connection to :'.cyan + server );
				console.log('    db : '.cyan + dbName);
				console.log('    collection : '.cyan + collection);

				if (typeof(pp.db)=='undefined'){
					console.error('Unable to initialize mongoskin'.red);
					reject('failed to connect to the database');
				}
				else{
					// TAOTODO: check if the collection we're looking for exists in the database
					function logSaved(n){ console.log( n + ' records saved.') }
					fullfill(pp);
				}
			}
			catch (e){
				// You shall not pass!
				console.error(e.toString().red);
				reject(e);
			}
		});
	},

	/**
	 * Save the grid to the database
	 * @param {Grid}
	 * @param {Function} criteria function which takes a cell value and its coordinate as arguments
	 */
	save: function(grid,criteria){
		return function(pp){
			criteria = criteria || function(whatever){ return true };
			let recordBag = [];

			// Store the record bag for later database serialization
			for (var u of Object.keys(grid)){
				for (var v of Object.keys(grid[u])){
					if (criteria(grid[u][v], {i:parseInt(u), j:parseInt(v)})){
						let crit = {u:parseInt(u), v:parseInt(v)};
						let record = {u:parseInt(u), v:parseInt(v), data: grid[u][v]};
						recordBag.push({criteria: crit, record: record});
					}
				}
			}
			console.log('data collection prepared ... [' + recordBag.length + ' records queued]');


			// Serialize the data		
			let numSaved = 0;
			return new Promise(function(done,err){
				(function saveToDB(){
					if (recordBag.length==0){
						// All done!
						console.log('done!'.green);
						return done(numSaved);
					}
					let options = {upsert: true};
					let nextUp = recordBag.pop(); // Take the next element to save

					if (typeof(nextUp)=='undefined' || nextUp==null){
						// Nothing to pop
						return done(numSaved);
					}

					pp.db.collection(pp.collection).update(nextUp.criteria, nextUp.record, options, function(err,count){
						if (err){
							console.log('unable to save this record');
							err('cell ['+nextUp.record.u+','+nextUp.record.v+'] failed to save :(');
						}
						else{
							numSaved += count;
							// Next record
							saveToDB();
						}
					});
				})(); // end of `saveToDB`
			});
		}
	},

	/**
	 * Load the grid from the database
	 * @param {Object} constraint of loading
	 */
	load: function(constraint){
		constraint = constraint || {i0:0, j0:0, iN:41, jN:41}; // iN and jN represent the max i and j to loaded, respectively
		// Make query conditions from the given constraint
		let scope = {
			u: {'$gte':constraint.i0, '$lte':constraint.iN},
			v: {'$gte':constraint.j0, '$lte':constraint.jN}
		}
		return function(pp){
			let grid = [];
			// Load the record from the db
			return new Promise(function(done,reject){
				pp.db.collection(pp.collection).find(scope).toArray(function(err,records){
					if (err){
						console.err(err.toString().red);
						return reject();
					}
					// Fill the record in the destination grid
					let nLoaded = 0;
					records.forEach(function(r){
						let i = parseInt(r.u); 
						let j = parseInt(r.v);
						Grid.cell(i,j).setTo(grid)(r.data);
						nLoaded ++;
					});
					console.log( nLoaded + ' grid cells loaded');
				});
				return done(grid);
			});
		}
	},

}


/**
 * 2D array utility functions
 */
below.array2d = {

	/**
	 * below.array2d.map(grid,mapper)
	 * Map a grid to another grid using mapper function
	 * @param {Grid}
	 * @param {Function} F - mapper function which takes a value of a cell and returns the output value
	 * @returns {Grid} mapped grid
	 */
	map: function(grid,F){
		var output = grid.slice();
		for (var i in grid){
			output[i] = grid[i].slice();
			output[i] = output[i].map(function(cell){
				return F(cell)
			});
		}
		return output;
	},

	/**
	 * below.array2d.offset(grid,1000,1000)
	 * Shift a grid by offset
	 * @param {Grid}
	 * @param {number} offset i (column) to shift the grid
	 * @param {number} offset j (row) to shift the grid
	 * @returns {Grid} the shifted grid
	 */
	offset: function(grid,offset_i,offset_j){
		var output = [];
		Grid.eachOf(grid).do(function shift(value,coord){
			var new_i = parseInt(parseInt(coord.i) + offset_i);
			var new_j = parseInt(parseInt(coord.j) + offset_j);
			if (new_i * new_j >= 0) {
				if (!(output.hasOwnProperty(new_i))){
					output[new_i] = [];
				}
				output[new_i][new_j] = value;
			}
		});
		return output;
	},

	/* Synnonym function for `offset`
	 */
	shift: function(grid,offset_i,offset_j){ below.array2d.offset(grid,offset_i,offset_j) },

	/**
	 * Merge multiple grids together
	 * If any of them overlaps, the element from the grid at the lesser index has higher priority
	 * @param {grid} accept unlimited number of grids to merge into one
	 * @returns {Grid} single grid, merged.
	 */
	merge: function(){
		let output = [];
		let grids = _.values(arguments); // read grids from the variable arguments

		grids.reverse(); // reverse the list of the grid, so the first becomes the last to process
		for (var grid of grids){
			for (var u of Object.keys(grid)){
				if (!(output.hasOwnProperty(u)))
					output[u] = [];
				for (var v of Object.keys(grid[u])){
					if (!(output[u].hasOwnProperty(v)))
						output[u][v] = grid[u][v];
				}
			}
		}
		return output;
	},


	/**
	 * below.array2d.pluck(grid,'cost')
	 * Works similarly to underscor's pluck function on each cell
	 * @param {Grid}
	 * @param {String} prop - The property to pluck
	 * @returns {Grid} which contains the plucked value
	 */
	pluck: function(grid,prop){
		var output = grid.slice();
		for (var i in grid)
			output[i] = _.pluck(grid[i],prop);
		return output;
	}
}

/**
 * UI sub-library for below rendering and UI stuffs
 */
below.ui = {
	/**
	 * below.ui.render(grid, container)
	 * Renders a grid in the container object (DOM)
	 * @param {Grid}
	 * @param {DOM}
	 */
	render: function(grid, container){
		if ($(container).length == 0)
			throw 'No container inspected';

		$(container).empty();
		$('<div>',{id: 'grid'}).appendTo(container);

		grid.forEach( function (col, i){
			grid.forEach( function (cell, j){
				let c = $('<div>').addClass('cell');

				// Add a new row if it doesn't exist
				if ($('#row'+j).length==0)
					$('<div>',{id: 'row'+j}).addClass('row').appendTo('#grid');

				// Add a new cell to the row
				$(c).appendTo($('#row'+j));
			});
		});
	}
}


if (typeof(module)!='undefined'){
	module.exports = below;
}


/** 
 * [below.js]
 * A library for implementing below-surface grid simulation
 * implemented by
 * @TaoPR (StarColon Projects)
 * 2015
 */

"use strict";

// Dependencies
var _ = require('underscore');
var Grid = require('./modules/grid.js').Grid;



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
	// TAOTODO: Account for {offset}
	let grid = Grid.create(settings.size.height, settings.size.width, {});
	Grid.eachOf(grid).applyProperty('isDug',function(){return false});
	Grid.eachOf(grid).applyProperty('cost',function(){return 0});
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
			let block = ''
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


if (typeof(module)!='undefined'){
	module.exports = below;
}


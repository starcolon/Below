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
	let grid = Grid.create(settings.size.width, settings.size.height, {});
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
 * Given a grid with content, generate possible routes from a source cell to the destination
 * @param {grid} 
 * @param {coord} starting point, if omitted, the default is set to the [first entrance]
 * @param {coord} destination point, if omitted, the default is set to the [first exit]
 * @returns {Array} array of coordinates representing the route
 */
below.generateRoutes = function(grid,startCoord,endCoord){
	
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


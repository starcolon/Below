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
			walls: [] // Array of coordinates {i,j}
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
	let grid = Grid.create(settings.size.width, settings.size.height, {
		isDug: false,
		cost: 0,
		items: []
	});

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
	settings.walls.forEach(applyListToCell('wall'));

	return grid;
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
		var output = [];
		for (var i in grid){
			if (!output.hasOwnProperty(i)) output[i] = [];
			for (var j in grid[i]){
				output[i][j] = F(grid[i][j]);
			}
		}
		return output;
	}
}


if (typeof(module)!='undefined'){
	module.exports = below;
}


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
		Grid.cell(entrance.i, entrance.j)['isEntrace'] = true;
	});
	// Apply exits
	settings.exits.forEach(function mapExit(exit){
		Grid.cell(exit.i, exit.j)['isExit'] = true;
	});

	function applyListToCell(grid,prop){
		return function doEach(elem){
			function pushMe(prev){ prev = prev || []; prev.push(elem[prop]); return prev; };
			Grid.cell(elem.i, elem.j).applyProperty(grid)(prop,pushMe);	
		}
	}

	settings.items.forEach(applyListToCell(grid,'item'));
	settings.obstacles.forEach(applyListToCell(grid,'obstacles'));
	settings.walls.forEach(applyListToCell(grid,'walls'));

	/*
	// Apply items
	settings.items.forEach(function mapItem(item){
		function pushMe(prev){ prev = prev || []; prev.push(item['item']); return prev; };
		Grid.cell(item.i, item.j).applyProperty(grid)('items',pushMe);
	});
	// Apply obstacles
	settings.obstacles.forEach(function mapOb(ob){
		function pushMe(prev){ prev = prev || []; prev.push(ob['obstacle']); return prev; };
		Grid.cell(ob.i,ob.j).applyProperty(grid)('obstacles',pushMe);
	});
	// Apply walls
	settings.walls.forEach(function mapWall(wall){
		function pushMe(prev){ prev = prev || []; prev.push(wall); return prev; };
		Grid.cell(wall.i, wall.j).applyProperty(grid)('walls',pushMe);
	});
	*/

	return grid;
}


if (typeof(module)!='undefined'){
	module.exports = below;
}


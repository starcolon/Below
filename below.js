/** 
 * [below.js]
 * A library for implementing below-surface grid simulation
 * implemented by
 * @TaoPR (StarColon Projects)
 * 2015
 */

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
			size: {width:0, height:0},
			entrances: [],
			exits: [],
			items: [],
			obstacles: [],
			walls: []
		}
	},

	/**
	 * below.settings.size
	 * Getter/Setter of size
	 */
	size: {
		get: function(s){ return s.size.width },
		set: function(s){ return function(w,h){ s.size.width = w; s.size.height = h; return s }}
	},

	/**
	 * below.settings.entraces
	 * Getter/Setter of entrances
	 */
	entrances: {

	},

	/**
	 * below.settings.exits
	 * Getter/Setter of exits
	 */
	exits: {

 	},

 	/**
 	 * below.settings.items
 	 * Getter/Setter of items
 	 */
 	items: {},

 	/**
 	 * below.settings.obstacles
 	 * Getter/Setter of obstacles
 	 */
 	obstacles: {},

 	/**
 	 * below.settings.walls
 	 * Getter/Setter of walls
 	 */
 	walls: {}


}

/**
 * Generates a new grid given the configurations
 * @param {Integer} column - Size of the columns
 * @param {Integer} depth - Size of the rows
 * @param {below.settings} settings 
 * @returns {Grid} output grid generated with the given configurations
 */
below.generate = function(column,depth,settings){
	if (column*depth<=0)
		throw 'The size must be properly defined';

	throw 'NOT IMPLEMENTED';
}


if (typeof(module)!='undefined'){
	module.exports = below;
}


"use strict" // Here we go strict mode *w*

var grid = [];

function takeParameters(){
	function takeAndSplitCoords(value){
		let altered = value.replace(')',''); // remove the closing braces because we don't need em
		let pairs = altered.split('(').filter(function(w){ // split by opening braces we get an array of tuples straightaway
			return w.trim().length > 0
		});
		return pairs.map(function (pair){
			let components = pair.split(':').map(function(m){ return parseInt(m)});
			return { i: components[0], j: components[1] }
		})
	}
	// Take parameters as given from the users
	var gridsize = $('#param-size').val().split('x').map(function(token){ return parseInt(token)});
	var entrances = takeAndSplitCoords( $('#param-entrances').val() );
	var exits = takeAndSplitCoords( $('#param-exits').val() );
	var walls =  takeAndSplitCoords( $('#param-walls').val() );
	var cost = $('#param-cost').val();

	// Encapsulate given parameters 
	var params = below.settings.create();
	params.size = { width: gridsize[0], height: gridsize[1] };
	params.entrances = entrances;
	params.exits = exits;
	params.walls = walls;
	params.costFunction = function(cell, coord){ return 1 };

	return params;
}

function generate(){
	// Take the grid paramters from the users
	let parameters = takeParameters();
	console.log(JSON.stringify(parameters));

	// Create a new grid
	grid = below.generate(parameters);

	// Render the grid 
	below.ui.render(grid,$('#grid-container'));
}




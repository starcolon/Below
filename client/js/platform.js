"use strict" // Here we go strict mode *w*

function takeParameters(){
	function takeAndSplitCoords(value){
		value = value.replace(')',''); // remove the closing braces because we don't need em
		pairs = value.split('(').filter(function(w){ // split by opening braces we get an array of tuples straightaway
			return w.trim().length > 0
		});
		return pairs.map(function (pair){
			components = pair.split(':').map(function(m){ return parseInt(m)});
			return { i: components[0], j: components[1] }
		})
	}
	var gridsize = $('#param-size').val().trim('x').map(function(token){ return parseInt(token)});
	var entrances = takeAndSplitCoords( $('#param-entrances').val() );
	var exits = takeAndSplitCoords( $('#param-exits').val() );
	var walls =  takeAndSplitCoords( $('#param-walls').val() );
	var cost = $('#param-cost').val();

	var params = below.settings.create();
	params.size = { width: gridsize[0], height: gridsize[1] };
	params.entrances = entrances;
	params.exits = exits;
	params.walls = walls;
	params.costFunction = function(cell, coord){ return 1 };

	return params;
}

function generate(){
	let parameters = takeParameters();

	console.log(parameters);
}

console.log(below); // TAOTODO: Ouch! it is undefined ....



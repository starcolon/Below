"use strict" // Here we go strict mode *w*

var grid = [];
function makerToolServer(suffix){ return 'http://localhost:7007/'+suffix }
function listService(){ return 'list/' }
function fetchService(){ return 'fetch/' }

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

function takeParameters(){
	// Take parameters as given from the users
	var gridsize = $('#param-size').val().split('x').map(function(token){ return parseInt(token)});
	var entrances = takeAndSplitCoords( $('#param-entrances').val() );
	var exits = takeAndSplitCoords( $('#param-exits').val() );
	var walls =  takeAndSplitCoords( $('#param-walls').val() );
	var cost = $('#param-cost').val() || '1+coord.j*2';

	// Encapsulate given parameters 
	var params = below.settings.create();
	params.size = { width: gridsize[0], height: gridsize[1] };
	params.entrances = entrances;
	params.exits = exits;
	params.walls = walls;
	params.costFunction = function(cell, coord){ return eval(cost) };

	return params;
}

function generate(onclick){
	console.log('generating a grid ...'); // DEBUG:
	// Take the grid paramters from the users
	let parameters = takeParameters();
	// Create a new grid
	grid = below.generate(parameters);

	// Render the grid 
	below.ui.render(grid,$('#grid-container'),[],true);

	// Bind the cell with onclick event (if supplied)
	if (typeof(onclick) != 'undefined'){
		$('.cell').each(function(i,cell){
			$(cell).click(function (evt){
				onclick(evt.target);
			})
		});
	}

	return grid;
}

function generateWithoutRender(){
	// Take the grid paramters from the users
	let parameters = takeParameters();
	// Create a new grid
	grid = below.generate(parameters);
	return grid;
}

function findRoute(onclick){
	let sourceAndDest = $('#param-route').val().split('->').map(function (s){
		let units = s.replace('(','').replace(')').split(':');
		return { i: parseInt(units[0]), j: parseInt(units[1]) }
	});
	console.log(sourceAndDest);
	let from = sourceAndDest[0];
	let to = sourceAndDest[1];
	var route = below.generateBestRoute(grid,from,to);

	// Render
	below.ui.render(grid, $('#grid-container'), route, true );

	// Bind the cell with onclick event (if supplied)
	if (typeof(onclick) != 'undefined'){
		$('.cell').each(function(i,cell){
			$(cell).click(function (evt){
				onclick(evt.target);
			})
		});
	}
}

function renderFromGrid(grid,onclick){
	if (typeof(grid)=='undefined' || grid==null)
		return false;

	// Clear old parameters
	$('#param-size').val('');
	$('#param-entrances').val('');
	$('#param-exits').val('');
	$('param-walls').val('');
	$('param-cost').val('');

	// Extract parameter from the given grid
	var size = below.array2d.size(grid);
	var entrances = [];
	var exits = [];
	var walls = [];
	grid.forEach(function(col,i){
		col.forEach(function(cell,j){
			// Check the cell status
			if (cell['isEntrance']===true)
				entrances.push({i:i,j:j});
			else if (cell['isExit']===true)
				exits.push({i:i,j:j});
			if (cell['cost']===0xFFFF)
				walls.push({i:i,j:j});
		});
	});


	// Populate the input fields
	function mapToPair(u){
		return '('+u.i+':'+u.j+')'
	}
	console.log('mapping size...'); // DEBUG:
	$('#param-size').val(size.join(' x '));
	console.log('mapping entrances...'); // DEBUG:
	$('#param-entrances').val(entrances.map(mapToPair).join(''));
	console.log('mapping exits...'); // DEBUG:
	$('#param-exits').val(exits.map(mapToPair).join(''));
	$('#param-walls').val(walls.map(mapToPair).join(''));

	// Render the grid on the page
	below.ui.render(grid,$('#grid-container'),[],true);

	// Bind the cell with onclick event (if supplied)
	if (typeof(onclick) != 'undefined'){
		$('.cell').each(function(i,cell){
			$(cell).click(function (evt){
				onclick(evt.target);
			})
		});
	}
}



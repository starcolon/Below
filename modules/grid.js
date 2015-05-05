/*
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
  * [grid.js] 
  * A simple utility to simulate a bounded grid for virtualization purpose.
  * Grid is implemented in a functional way rather than an OOP discipline.
  *
  * Key data structures are:
  * [grid] - A fully-linked cells
  * [cell] - Each cell floats with a loose link to its 4 neighbors
  * @author Tao PR
  */

"use strict";

var _ = require('underscore');

/**
 * Grid namespace, not to be used as a class
 */
var Grid = {}

/**
 * Create a grid object 
 * @param {Integer} numRow
 * @param {Integer} numCol
 * @param {Any} defaultValue
 * @returns {grid}
 */
Grid.create = function(numRow,numCol,defaultValue){
	if (numRow * numCol <= 0) 
		throw "Number of columns and rows must be positive integer." 

	defaultValue = defaultValue || 0;
	let grid = [];

	_(numCol).times(function populateRow(){
		let row = [];
		_(numRow).times(function(){row.push(defaultValue)});
		grid.push(row);	
	});

	return grid;
}

/**
 * Duplicate a grid object (deep copy)
 * @param {grid}
 * @returns {grid}
 */
Grid.duplicate = function(grid){
	let g = [];
	Grid.eachCellOf(grid).do(function (value, coord){
		if (!(coord.i in g))
			g[coord.i] = [];

		g[coord.i][coord.j] = value;
		return value;
	});

	return g;
}


/** 
 * Duplicate only the structure of the grid but replace the values with the specied value
 * @param {grid} grid - source grid to get duplicated
 * @param {Object} value 
 * @returns {grid}
 */
Grid.duplicateStructure = function(grid,newvalue){
	var g = [];
	Grid.eachCellOf(grid).do(function (value, coord){
		if (!(coord.i in g))
			g[coord.i] = [];

		g[coord.i][coord.j] = newvalue;
		return value;
	});

	return g;
}

/**
 * Remove a row from a grid
 * @param {grid}
 * @returns {Closure}
 */
Grid.removeRow = function(grid){
	return function(n){
		// Iterate through each column, remove the n-th row
		grid.forEach(function(col,i){
			if (grid[i].hasOwnProperty(n))
				grid[i].splice(n,1);
		});
	}
}

/**
 * Remove a column from a grid
 * @param {grid}
 * @returns {Closure}
 */
Grid.removeCol = function(grid){
	return function(n){
		grid.splice(n,1);
	}
}


/**
 * Add a row to a grid. This won't insert if already exist.
 * @param {grid}
 * @returns {Closure}
 */
Grid.addRow = function(grid){
	return function(n,len){
		// Iterate through each column, add the n-th row
		grid.forEach(function(col,i){
			if (!grid[i].hasOwnProperty(n))
				grid[i][n] = new Array(len);
		});
	}
}

/**
 * Add a column to a grid. This won't insert if already exist.
 * @param {grid}
 * @returns {Closure}
 */
Grid.addCol = function(grid){
	return function(n,len){
		if (!grid.hasOwnProperty(n))
			grid[n] = new Array(len);
	}
}

/**
 * List sibling coordinates of a specified coordinate
 * @param {grid}
 * @returns {Array} array of a coordinates
 */
Grid.siblings = function(grid){
	return function (i,j){
		var sib = [
			[i-1, j],
			[i+1, j],
			[i, j-1],
			[i, j+1]
		];

		sib = _.filter(sib, function(ij){ return Grid.has(grid,ij[0],ij[1]) });
		return sib;
	}
}


/**
 * Determine if a coordinate (i,j) is in the grid
 * @param {Grid}
 * @param {Integer} i - column coordinate
 * @param {Integer} j - row coordinate
 */
Grid.has = Grid.contains = function(grid,i,j){
	return (i in grid && j in grid[i]);
}

/**
 * Iterate through each cell in the grid and commit an action
 */
Grid.eachCell = function(grid){
	return function(F){
		grid.forEach(function (col,i){
			col.forEach(function(cell,j){
				F(cell,i,j);
			})
		})
	}
}

/**
 * Iterate through each sibling and commit an action on it
 * Usage: Grid.eachSibling(grid)(5,3)(doSomething)
 * @param {grid}
 */
Grid.eachSibling = function(grid){
	return function(i,j){
		return function(F){
			var siblings = Grid.siblings(grid)(i,j);
			siblings.forEach(function(coord){
				var i = coord[0], j = coord[j];
				var value = Grid.cell(i,j).of(grid);
				F(value, i, j);
			});
		}
	}
}


/**
 * Calculate the block distance of a route between two coordinates
 */
Grid.distance = function(coord1, coord2){
	return Math.abs(coord1.i-coord2.i) + Math.abs(coord1.j-coord2.j)
}



/**
 * Flood fill of the grid
 * @param {grid}
 */
Grid.floodfill = function(grid){

	/** 
	 * Define the starting point of the algorithm
	 * @param {Integer} i - Column coordinate
	 * @param {Integer} j - Row coordinate
	 */
	this.from = function(i,j){
		var startAt = [i,j];
		this.isInArea = function(value,coord){return true} // By default, all cells are taken into account

		var self = this;

		/**
		 * Grid.floodfill(grid).from(i,j).where(isInArea)
		 * Assign a condition to the flood fill algorithm
		 * @param {Function} F - A function which tests if a cell is included in an area
		 */
		this.where = function(F){
			self.isInArea = F;
			return self;
		}

		/**
		 * Commit a floodfill and returns an array of the coordinates which 
		 * are filled
		 * @returns {Array} coordinate array
		 */
		this.commit = function(){
			var filled = [];
			var testedGrid = Grid.duplicateStructure(grid,false);

			function fillMe(coord){
				var value = Grid.cell(coord[0],coord[1]).of(grid);
				if (self.isInArea(value,{i:coord[0],j:coord[1]}) && 
					Grid.cell(coord[0],coord[1]).of(testedGrid)==false){
					
					// Add self to the output filled list
					filled.push({i:coord[0],j:coord[1]});
					Grid.cell(coord[0],coord[1]).set(testedGrid)(true);

					// List siblings
					var siblings = Grid.siblings(grid)(coord[0],coord[1]);

					// Recursively fill start from each of the siblings
					siblings.forEach(function(sib){
						// Skip if tested
						if (Grid.cell(sib[0],sib[1]).of(testedGrid)==false){
							fillMe(sib);
							Grid.cell(sib[0],sib[1]).set(testedGrid)(true);
						}
					});
				}
			}

			fillMe(startAt);
			return filled;
		}

		return this;
	}


	return this;
}


/**
 * Grid route finder
 * @param {grid}
 */
Grid.routeOf = Grid.route = Grid.routing = function(grid){

	/** 
	 * Grid.route(grid).from(i,j)
	 * Define the starting point of the algorithm
	 * @param {Integer} i - Column coordinate
	 * @param {Integer} j - Row coordinate
	 */
	this.from = function(i,j){
		var startAt = [i,j];
		var endAt = null;

		/**
		 * Grid.routeOf(grid).from(i,j).to(m,n)
		 * Define the ending point of the route
		 * @param {Integer} i - Column coordinate
		 * @param {Integer} j - Column coordinate
		 */
		this.to = function (i,j){
			endAt = [i,j];
			this.walkable = function(value,coord){ return true } // By default, all paths are walkable
			this.notWalkable = function(value,coord){ return false }
			var self = this;

			/**
			 * Grid.routeOf(grid).from(i,j).to(m,n).where(condition)
			 * Define a walkable constraint
			 * @param {Function} F - A function that takes the value and coordinate and returns TRUE if the cell is walkable
			 * @returns {None}
			 */
			this.where = function(F){
				self.walkable = F;
				self.notWalkable = function(value,coord){return !self.walkable(value,coord)};
				return self;
			}

			/**
			 * Grid.routeOf(grid).from(i,j).to(m,n).where(condition).walkableCellsCount()
			 * Count the number of the cells in the grid
			 * which are walkable 
			 * @returns {Integer} Number of cells which satisfy the 'walkable' condition
			 */
			this.walkableCellsCount = function(){
				return Grid.eachOf(grid).where(self.walkable).count();
			}



			/**
			 * Route.routeOf(grid).from(i,j).to(u,v).lee()
			 * Route from the beginning point to the ending point
			 * using Lee's algorithm 
			 * <a href="http://en.wikipedia.org/wiki/Lee_algorithm">http://en.wikipedia.org/wiki/Lee_algorithm</a>
			 * @returns {Array} of route coordinates
			 */
			this.lee = function(){

				// Step#1 - Initialize the wave grid with all high value (not walkable)
				var waveGrid = Grid.duplicate(grid);

				// Mark walkable cells as zero
				Grid.eachCellOf(waveGrid).where(self.walkable).setValue(0);
				// Otherwise, assign them with very high value
				Grid.eachCellOf(waveGrid).where(self.notWalkable).setValue(0xFF);


				// Step#2 - Wave expansion
				function expandNeighbor(cell,magnitude){
					var siblings = Grid.siblings(waveGrid)(cell[0],cell[1]);
					if (siblings.length==0)
						return;
					var parents = [];
					siblings.forEach(function(sib,n){
						var m=sib[0], n=sib[1];
						if (Grid.cell(m,n).of(waveGrid)==0){
							// Set the value with the current magnitude
							// if it has not been set
							Grid.cell(m,n).set(waveGrid)(magnitude);

							// Add itself to the next parent list
							parents.push([m,n]);
						}
					});

					// Expand each of children
					magnitude ++;
					parents.forEach(function(tuple){
						expandNeighbor(tuple,magnitude);
					})
				}

				// Expand the wave from the beginning point
				// where its value is initially set to 1
				Grid.cell(startAt[0],startAt[1]).set(waveGrid)(1);
				expandNeighbor(startAt,2);

				// Step#3 - Backtrace
				// Start at the ending point, step downwards along
				// the descent of the wave magnitude
				// until it finds the starting point.
				// (Breadth-first search)

				function moveTowardsStart(pos,route){
					route.push({i:pos[0],j:pos[1]});

					if (pos[0]==startAt[0] && pos[1]==startAt[1])
						return route;

					var magnitude = Grid.cell(pos[0],pos[1]).of(waveGrid);

					// List the neighbors
					var neighbors = Grid.siblings(waveGrid)(pos[0],pos[1]);

					if (neighbors.length==0)
						return route;

				 	// Go downwards the magnitude
				 	var routeOptions = [];
				 	for (var n in neighbors){
				 		var n_magnitude = Grid.cell(neighbors[n][0], neighbors[n][1]).of(waveGrid);
				 		// Only consider the descent path
				 		if (n_magnitude < magnitude){
				 			if (routeOptions.length>0 && n_magnitude>=routeOptions[0].magnitude)
				 				continue;
				 			// Add the neighbor to the route options array,
				 			// smaller magnitude comes first
				 			var insert_index = 0;
				 			for (var k=0; k<routeOptions; k++,insert_index++){
				 				if (routeOptions[k].magnitude>n_magnitude)
				 					break;
				 			}
					 		routeOptions.splice(
					 			insert_index,
					 			0,
					 			{n: neighbors[n], magnitude: n_magnitude}
				 			);
				 		}
				 	}

				 	return moveTowardsStart(routeOptions[0].n,route);

				}

				var route = moveTowardsStart(endAt,[]);

				// Reverse the route so it starts from the beginning and 
				// ends at the ending
				route.reverse();
				return route;
			}


			/**
			 * Route.routeOf(grid).from(i,j).to(u,v).astar(costFunction)
			 * @param {Function} cost - Cost function which takes (value, coord) and returns positive number cost value
			 * @returns {Array} Route constructed with the algorithm
			 **/
			this.astar = function(cost){

				// If cost function is not defined,
				// all coordinates make no cost difference
				cost = cost || function(value,coord){
					return 1
				};

				var routes = [
					{G:0, R:[startAt]} // Initial point
				];

				function isEndPoint(coord){ return coord[0]==endAt[0] && coord[1]==endAt[1]}

				function _G(route){return route.G}
				function _F(route){return route.F}

				function expand(current){
					var lastNode = _.last(current.R);
					var siblings = Grid.siblings(grid)(lastNode[0],lastNode[1]);

					// Filter out if not walkable
					// also filter out if the sibling already repeats the 
					// previous path
					function isRepeatInCurrent(sib){
						return _.any(current.R, function(r){
							return r[0]==sib[0] && r[1]==sib[1]
						})
					}
					function isNotWalkable(sib){
						var sib_value = Grid.cell(sib[0],sib[1]).of(grid);
						var sib_coord = {i: sib[0], j: sib[1]};
						return !self.walkable(sib_value, sib_coord )
					}

					siblings = _.reject(siblings, isRepeatInCurrent);
					siblings = _.reject(siblings, isNotWalkable);

					// If the siblings include the ending point,
					// just choose it as a sole outcome
					if (_.any(siblings, isEndPoint)){
						siblings = [endAt];
					}

					// Map each siblings with cost function
					siblings = _.map(siblings, function(sib){
						var sib_value = Grid.cell(sib[0],sib[1]).of(grid);
						var sib_coord = {i: sib[0], j: sib[1]};
						var newroute = current.R.concat([sib]);
						return {F: cost(sib_value, sib_coord), R: newroute}
					});
					return siblings;
				}

				// Keep constructing the route until it reaches the final goal
				while (!isEndPoint(_.last(_.first(routes).R))){
					// Expand the first (least aggegrated cost G)
					var current = _.first(_.sortBy(routes,_F));
					var expanded = expand(current);

					if (expanded.length==0){
						// If expanded but nothing returned,
						// Multiply the aggegrated cost of it and repeat the process
						routes[0].G *= 10;
						routes = _.sortBy(routes, _G);
					}
					else{
						// Remove the first candidate (current) off the list
						routes.splice(0,1);

						// Register all newly expanded routes
						expanded.forEach(function(ex){
							var newroute = {
								G: current.G + ex.F, 
								R: ex.R
							};
							routes.push(newroute);
						});

						// Keep the route list sorted, the best goes first
						routes = _.sortBy(routes, _G);
					}
				}

				// Take and wrap the constructed route
				var route = _.first(routes).R;
				route = route.map(function(r){
					return {i: r[0], j: r[1]}
				});

				return route;
			}


			return this;
		}


		return this;
	}


	return this;
}


/**
 * Traverse through the grid, boundary constraint is taken into account
 * @param {grid}
 */
Grid.traverse = function(grid){


	/** 
	 * Grid.traverse(grid).from(i,j)
	 * Define where to start traversal
	 */
	this.from = function(i,j){

		var startAt = [i,j];
		var route = [{i:i, j:j}];
		
		/**
		 * Grid.traverse(grid).from(i,j).to(m,n)
		 * Walk straight to the coordinate
		 */
		this.to = function(m,n){
			var stopAt = [m,n];
			
			// Construct a route from the beginning point to the target point
			nextStep(startAt, stopAt, 1);

			/**
			 * Get the route array
			 * @returns {Array} Array of coordinates in the route
			 */
			this.route = function(){
				return route;
			}


			/**
			 * Measure how far from begin to end 
			 * @returns {Integer} block distance of the route
			 */
			this.distance = this.len = function(){
				return route.length;
			}


			/**
			 * Translate route into directions
			 * @returns {Array}
			 */
			this.directions = function(){
				var directions = [];
				_.reduce(route, function(previous,next){
					directions.push(direction(previous,next));
					previous = next;
					return previous;
				})
				return directions;
			}

			return this;
		}


		/**
		 * Grid.traverse(grid).from(i,j).go(['RIGHT','LEFT','LEFT'])
		 * Move the coordinate towards a series of directions
		 * If the position go beyond the boundary of the grid,
		 * it throws an exception.
		 * @param {Array} directions e.g. ['UP','UP','LEFT']
		 * @returns {Array} Route
		 */
		this.go = function(directions){
			var pos = {i: i, j: j};
			route = [{i: i, j: j}];
			while (directions.length>0){
				var next = directions.splice(0,1);
				pos = move(pos, next);

				if (!Grid.has(grid,pos.i,pos.j))
					throw 'Move exceeds the boundary of the grid';

				route.push({i: pos.i, j: pos.j});
			}
			return route;
		}


		function deepPosEqual(pos1,pos2){
			return pos1[0]===pos2[0] && pos1[1]===pos2[1]
		}


		/**
		 * Step to the next pos until it reaches the end
		 * Also construct the route as it goes
		 * @param {Array} pos - starting point 
		 * @param {Array} end - ending point
		 * @param {Integer} i - coordinate index (1=row, 0=col)
		 * @returns {Array} the last position
		 */
		function nextStep(pos,end,i){
			if (deepPosEqual(pos,end)){
				return pos;
			}
			else if (pos[i]!==end[i]){
				pos[i] = pos[i]<end[i] ? pos[i]+1 : pos[i]-1;
				addRoute(pos);
				pos = nextStep(pos,end,i);
			}
			else if (i>0)
				pos = nextStep(pos,end,i-1);
			else{
				return pos;
			}
		}

		function addRoute(pos){
			route.push({i:pos[0], j:pos[1]});
		}


		return this;
	}



	return this;
}








/** 
 * Cell metaclass
 * @param {Integer} i
 * @param {Integer} j
 */
Grid.cell = function(i,j){ 
	if ((typeof(i) != 'number') || (typeof(j) != 'number'))
		throw 'Coordinate i, j must be defined as integer';

	// Assign the coordinate reference
	this.i = i; this.j = j; 

	var self = this;

	/**
	 * Grid.cell(i,j).of(grid) - Returns a cell value
	 * If the cell does not belong to the grid, it throws an error
	 * @param {grid}
	 * @returns {Object} any value stored in the cell
	 */
	this.of = function(grid){
		if (this.isNotIn(grid))
			return undefined;
		return grid[i][j];
	}

	/**
	 * Grid.cell(i,j).set(grid)(0xFF) - Set a value of a cell
	 * @param {grid}
	 * @returns {Closure}
	 */
	this.set = function(grid){
		return function(value){
			if (self.isNotIn(grid))
				self.addTo(grid);
			grid[self.i][self.j] = value;
		}
	}

	/**
	 * Grid.cell(i,j).applyProperty(grid)('items',pushItem)
	 * Apply function F on the cell property
	 * @param {grid}
	 * @returns {Closure} // TAOTODO: Test me
	 */
	this.applyProperty = function(grid){
		/*
		 * @param {String} prob - property name
		 * @param {Function} F - mapper function which takes property value as a argument and
		 *                     returns a new value
		 */
		return function (prop,F){
			if (self.isNotIn(grid))
				throw 'Cell is out of bound';
			if (!grid[self.i][self.j].hasOwnProperty(prop)){
				grid[self.i][self.j][prop] = null;
			}
			// Map F now
			grid[self.i][self.j][prop] = F(grid[self.i][self.j][prop]);
		}
	}

	/**
	 * Grid.cell(i,j).coord() - Returns a coordinate JSON object
	 * @returns {JSON}
	 */
	this.coord = function(){
		return {i: self.i, j: self.j}
	}


	/** 
	 * Grid.cell(i,j).isIn(grid) - Check if a cell is in the grid
	 * @param {grid}
	 * @returns {True/False}
	 */
	this.isIn = function(grid){
		return Grid.has(grid,i,j)
	}

	/**
	 * Grid.cell(i,j).isNotIn(grid) - Check if a cell is not in the grid
	 * @param {grid}
	 * @returns {True/False}
	 */
	this.isNotIn = function(grid){
		return !this.isIn(grid)
	}

	/**
	 * Grid.cell(i,j).addTo(grid) - Add a cell to a grid at the specified coordinate
	 * @param {grid}
	 * @returns {True/False} false if the cell is not added
	 */
	this.addTo = function(grid){
		// Grid already contains the cell at the certain coordinate?
		if (this.isIn(grid))
			return false;

		// Register a cell
		if (!grid.hasOwnProperty(this.i))
			grid[this.i] = [];
		if (!grid[i].hasOwnProperty(this.j))
			grid[this.i][this.j] = [];

		return true;
	}

	return this; 
}


/**
 * Iterate through each cell of a grid and do something with it
 * @param {grid}
 */
Grid.eachCellOf = Grid.eachOf = function(grid){

	if (typeof(grid)=='undefined')
		throw 'Grid has not been defined';
	var self = this;

	// Default filter does not filter out any cells (always returns true)
	self.cellFilter = function(value,coord){return true};


	/**
	 * Grid.eachOf(grid).where(a,coord => a.i>0)
	 * Filter the cells by condition
	 * @param {Function} condition - A function which takes (cellvalue, coord) and returns true if the cell matches the criteria
	 */
	this.where = function(condition){
		if (typeof(condition)!='function')
			throw 'Requires a function clause';
		self.cellFilter = condition;
		return self;
	}


	/**
	 * Grid.eachOf(grid).where(a,coord => ).count()
	 * Count the number of cells which satisfy the 'where' condition
	 * @returns {Integer} the number of cells which satisfy the where clause
	 */
	this.count = function(){
		var count = 0;
		for (var i in grid)
			for (var j in grid[i])
				if (self.cellFilter(grid[i][j],{i:i,j:j}))
					++count;
		return count;
	}


	/**
	 * Grid.eachOf(grid).setTo(value)
	 * Set each grid which satisfy the filter condition with the specified value
	 * @param {Object} value
	 * @returns {Integer} Number of cells affected by the function
	 */
	this.setTo = this.setValue = function(value){
		var count=0;
		for (var i in grid)
			for (var j in grid[i])
				if (self.cellFilter(grid[i][j],{i:i,j:j})){
					grid[i][j] = value;
					++count;
				}
		return count;
	}

	/**
	 * Grid.eachOf(grid).applyProperty(prop,F)
	 * Apply function F on the specific property of each cells which 
	 * satisfy the filter condition
	 * @param {String} prop - Property name
	 * @param {Function} F - Mapper function which takes the old property value
	 *                       and returns the new value
	 * @returns {Integer} Number of the affected cells 
	 */
	this.applyProperty = function(prop,F){
		var count=0;
		for (var i in grid)
			for (var j in grid[i])
				if (self.cellFilter(grid[i][j],{i:i,j:j})){
					if (!grid[i][j].hasOwnProperty(prop))
						grid[i][j][prop] = null;
					grid[i][j][prop] = F(grid[i][j][prop]);
					++count;
				}
		return count;
	}

	/**
	 * Grid.eachOf(grid).do(a,coord => a*3)
	 * Trigger a function on each cell which matches the filter condition
	 * everything returned by F(value) will takes place the certain cell rightaway
	 * @param {Function} F - Function that takes (cellvalue, coord) as arguments and returns a new value of the cell
	 * @returns {Integer} Number of cells affected by the function
	 */
	this.do = this.map = function(F){
		var count=0;
		for (var i in grid)
			for (var j in grid[i])
				if (self.cellFilter(grid[i][j],{i:i,j:j})){
					grid[i][j] = F(grid[i][j],{i:i,j:j});
					++count;
				}
		return count;
	}


	return this;
}


/** 
 * Find the direction notation when moving from {from} to {to}
 * @param {coordinate} from
 * @param {coordinate} to
 * @returns {String} One of the 4 directions 'RIGHT','LEFT','UP','DOWN'
 */
function direction(from, to){
	if (from.i<to.i)
		return 'RIGHT';
	else if (from.i>to.i)
		return 'LEFT';
	else if (from.j<to.j)
		return 'DOWN';
	else if (from.j>to.j)
		return 'UP';
	else
		return null;
}

/**
 * Move a point to a sibling block according to the direction
 * @param {Coordinate} from
 * @param {String} direction 
 * returns {Coordinate} the point after movement
 */
function move(from,direction){
	var target = {i: from.i, j: from.j};
	if (direction=='UP') target.j--;
	else if (direction=='DOWN') target.j++;
	else if (direction=='LEFT') target.i--;
	else if (direction=='RIGHT') target.i++;
	return target;
}



// Export the module for node.js app
if (typeof(exports)!='undefined') 
	exports.Grid = Grid;

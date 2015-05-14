# Below 

Below module is a javascript library implementing on top of `Grid` module for spatial routing application. This module is specifically designed for `io.js` and absolutely won't run on the classical node.js.

## Include Below to your project
As simple as getting an F grade in the first semester, you can simply just `require` Below.js file as follows:

```javascript
var below = require('./below.js');
```

## Generating a Grid from settings
As mentioned on the top of this document, Below library does extend functionalities of `Grid` for spatial routing app. You can eaither create a grid data structure using conventional Grid library or create it on the fly with a help of Below library.

To create your first grid from the settings, try this:
```javascript
var settings = below.settings.create(); // create the setting package
settings.size = {width: 50, height:50};
settings.entrances.push({i:25,j:0});
settings.exits.push({i:49,j:49});

var grid = below.generate(settings); // generate a grid according to the settings
```

## Craft your settings
Below allows you to freely customize how your grid is gonna look and behave. Settings consist of these elements:

### Grid size
Grid size can be specified in a JSON object format:
```javascript
settings.size = {width: 1024, height: 768};
```

### Entrances and exits
In order to create a maze grid, you may need to specify entrances and exits. Both are stored in array like this:
```javascript
settings.entrances = [ {i:5,j:25}, {i:0,j:0} ];
settings.exits = [ {i:44, j:44} ];
```

### Walls
For routing, walls are cells which no access is permitted. Walls are also stored in an array:
```javascript
settings.walls = [ {i:0,j:0}, {i:1,j:0}, {i:2,j:0} ];
```

### Cost function
Cost function is essential to routing problem. Below utilizes cost function to evaluate effort it needs to put when walking through a certain cell. The function needs to receive two arguments, `the cell value` and `the coordinate`, then returns a numeric value. Higher return value yields higher price it needs to pay for accessing the cell.
```javascript
settings.costFunction = function(value,coord){
	return value * (coord.i + coord.j)
}
```

## Display the grid graphically
The entire grid content with a route (optional) can be displayed in the console with:
```javascript
below.illustrate(grid); 
below.illustrate(grid,route); // Optional route
```

Below will display each block of the grid on screen, `walls` maked in red, `entrances` and `exits` marked as arrows. If you specify a `route` along, Below will mark each block of the route in green.

## Route lookup
Grid library has implementations of very good routing algorithms like `lee's algorithm` and `A* search`. Thus, Below library inherits this feature and make it easier.

### Find a route without having cost function considered
If you want to find a route from a cell to another without awaring of the cost function - just be aware of walls. You just simply call:
```javascript
var from = {i:5,j:0};
var to = {i:50,j:30};
var route = below.generateSimpleRoute( grid, from, to );
```

### Find a route with awareness of cost function
When you want to generate the cheapest route to the goal, call this:
```javascript
var from = {i:5,j:0};
var to = {i:50,j:30};
var route = below.generateBestRoute( grid, from, to );
```








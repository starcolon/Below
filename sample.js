var below = require('./below');

var setting = below.settings.create();
setting.size = {width:60, height:85};
for (var i=0; i<37; i++)  
	setting.walls.push({i:i, j:8});
for (var i=8; i<45; i++)
	setting.walls.push({i:i, j:15});
for (var i=59,j=20; j<120 && i>7; j++, i-=(j%8)?1:0)
	setting.walls.push({i:i, j:j});
for (var i=40; i<59; i++)
	setting.walls.push({i:i, j:30});
setting.costFunction = function(v,c){
	return 85-c.j // Bottom is cheaper than the top
}

var grid = below.generate(setting);


/*
var route = below.generateBestRoute(grid,{i:0,j:4},{i:53,j:28});
below.illustrate(grid, route);
console.log('Total cost spent for this route: ' + below.sumCostOfRoute(grid,route).toFixed(0).toString() );
*/

//function showSummary(n){ console.log( (n + ' records saved to the database').toString().cyan ) }
//below.mongo.init(null,'test','grid').then(below.mongo.save(grid)).done(showSummary);



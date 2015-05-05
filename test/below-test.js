var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
chai.should();
chai.use(require('chai-things'));
chai.config.includeStack = true;

"use strict";

// Module dependency
var below = require('../below.js');
var Grid = require('../modules/grid.js').Grid;

describe('@below test kit',function(){

	describe('Fundamental tests', function(){

		it('should create a settings object', function(){
			var settings = below.settings.create();

			expect(settings).to.have.property('size');
			expect(settings).to.have.property('entrances');
			expect(settings).to.have.property('exits');
			expect(settings).to.have.property('items');
			expect(settings).to.have.property('obstacles');
			expect(settings).to.have.property('walls');
		})

		it('should create a grid which satisfies the settings', function(){
			var settings = below.settings.create();
			settings.size = {width: 80, height: 80};
			settings.entrances = [{i:0,j:0},{i:0,j:52}];
			settings.exits = [{i:79,j:79}];
			settings.items = [{i:32,j:32,item:'apple'},{i:50,j:64,item:'pencil'}];
			settings.obstacles = [{i:50,j:0,obstacle:25}];
			settings.walls = [{i:6,j:5},{i:7,j:5},{i:8,j:5}];

			var grid = below.generate(settings);

			expect(Grid.has(grid,0,0)).to.be.true;
			expect(Grid.has(grid,79,79)).to.be.true;
			expect(Grid.has(grid,80,80)).to.be.false;

			for (var j in grid[0]){
				expect(grid[0][j]).to.have.property('isDug');
				expect(grid[0][j]).to.have.property('cost');
				expect(grid[0][j]).to.have.property('items');
			}

			settings.entrances.forEach(function (en){
				expect(Grid.cell(en.i,en.j).of(grid)['isEntrance']).to.be.true;
			});

			settings.exits.forEach(function (ex){
				expect(Grid.cell(ex.i,ex.j).of(grid)['isExit']).to.be.true;
			})

			settings.items.forEach(function (it){
				expect(Grid.cell(it.i,it.j).of(grid)['items']).to.equal(it.item);
			})
		})

	})
})
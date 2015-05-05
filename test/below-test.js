var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
chai.should();
chai.use(require('chai-things'));
chai.config.includeStack = true;

"use strict";

// Module dependency
var below = require('../below.js');

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

	})
})
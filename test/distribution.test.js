'use strict';

var assert = require('chai').assert;
var distribution = require('../src/distribution');
var util = require('../src/util');

describe('distribution', function() {
  describe('Normal', function() {
    var n1 = new distribution.Normal();

    it('should have a default constructor mu=0,sigma=1', function() {
      assert.equal(0,(new distribution.Normal()).mu);
      assert.equal(1,(new distribution.Normal()).sigma);
    });
   
    it('should have a values constructor', function() {
      assert.equal(50,(new distribution.Normal(50)).mu);
      assert.equal(1,(new distribution.Normal(50)).sigma);
      assert.equal(50,(new distribution.Normal(50,10)).mu);
      assert.equal(10,(new distribution.Normal(50,10)).sigma);
    });

    it('should evaluate the pdf', function() {
      assert.equal(0.4,util.number(n1.pdf(0).toPrecision(2)));
      assert.equal(0.24,util.number(n1.pdf(-1).toPrecision(2)));
      assert.equal(n1.pdf(5),n1.pdf(-5));
    });

    it('should approximate the cdf', function() {
    //Handles extreme values
      assert.equal(0,n1.cdf(-38));
      assert.equal(1,n1.cdf(38));
    //Handle tails
      assert.equal(1,n1.cdf(8).toPrecision(5));
    //Handle "regular" values
      assert.equal(0.68,(n1.cdf(1)-n1.cdf(-1)).toPrecision(2));
      assert.equal(0.95,(n1.cdf(2)-n1.cdf(-2)).toPrecision(2));
      assert.equal(0.997,(n1.cdf(3)-n1.cdf(-3)).toPrecision(3));
    });

    it('should approximate the inverse cdf',function() {
    //Handle out of domain inputs
      assert.ok(isNaN(n1.icdf(-1)));
      assert.ok(isNaN(n1.icdf(2)));
      assert.ok(isNaN(n1.icdf(0)));
      assert.ok(isNaN(n1.icdf(1)));
    //Handle regular values
      assert.equal(0,n1.icdf(0.5));
      assert.equal(1,n1.icdf(n1.cdf(1)).toPrecision(3));
      assert.equal(-1,n1.icdf(n1.cdf(-1)).toPrecision(3));
    });
  });

});

describe('distribution', function() {
  describe('Uniform', function() {
    var n1 = new distribution.Uniform(-1,1);
   
    it('pdf is 0 outside of the support', function() {
      assert.equal(0,n1.pdf(-2));
      assert.equal(0,n1.pdf(2));
    });
	
    it('should evaluate the pdf', function() {
      assert.equal(0.5,n1.pdf(0));
      assert.equal(n1.pdf(-0.5),n1.pdf(0.5));
      assert.equal(n1.pdf(-1),n1.pdf(1));
    });
	

    it('should evaluate the cdf', function() {
    //Handles extreme values
      assert.equal(0,n1.cdf(-2));
      assert.equal(1,n1.cdf(2));
    //Handle "regular" values
      assert.equal(0.5,n1.cdf(0));
      assert.equal(0.25,n1.cdf(-0.5));
      assert.equal(0.75,n1.cdf(0.5));
    });

    it('icdf is undefined outside of the support', function() {
      assert.ok(isNaN(n1.icdf(-2)));
	  assert.ok(isNaN(n1.icdf(2)));
    });
	
	it('should evaluate the icdf', function() {
    //Handles extreme values
      assert.equal(-1,n1.icdf(0));
      assert.equal(1,n1.icdf(1));
    //Handle "regular" values
      assert.equal(0,n1.icdf(0.5));
      assert.equal(-0.5,n1.icdf(0.25));
      assert.equal(0.5,n1.icdf(0.75));
    });
  });

});

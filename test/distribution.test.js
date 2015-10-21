'use strict';

var assert = require('chai').assert;
var distribution = require('../src/distribution');
var util = require('../src/util');

describe('distribution', function() {

  describe('GammaLn', function() {
    it('should be undefined when z<=0', function() {
      assert.ok(isNaN(distribution.GammaLn(0)));
    });
  });

  describe('Gamma', function() {
    it('should give reasonable approximations for known values', function() {
      assert.equal(1,distribution.Gamma(1));
      assert.equal(1,distribution.Gamma(2));
      assert.equal(5040,distribution.Gamma(8));
    });
  });

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

var util = require("./util");

var distribution = {};
// Each distribution needs a pdf, cdf and icdf

/*
Usage: 
    var foo = new distribution.Normal(0,1);
    var bar = foo.sample();
*/

//Euler Functions and Distributions.

// GammaLn
distribution.GammaLn = function(z){
// Simplified Stirling's Approximation
  var sinPart = z*Math.sinh(1/z)+(1/(810*Math.pow(z,6))),
  twoLn = Math.log(2*Math.PI) - Math.log(z) + z*( (2*Math.log(z))+Math.log(sinPart) - 2);
  return util.number((twoLn/2).toPrecision(6));  
};

distribution.Gamma = function(z){
  return util.number(Math.exp(distribution.GammaLn(z)).toPrecision(4));
};

// Beta
distribution.BetaFn = function(a,b){
  var numerator = Math.exp(distribution.GammaLn(a))*Math.exp(distribution.GammaLn(b));
  return numerator / Math.exp(distribution.GammaLn(a+b));
};

// IncBeta
// A simplified version of DiDonato & Jarnagin (1967) The Efficient Calculation of Incomplete Beta-Function Ratio for Half-Integer Values of the Parameters a,b
distribution.IncBeta = function(x,a,b){
  var ai = function(x,a,i){
    return (distribution.Gamma(a + i - 1)/(distribution.Gamma(a)*distribution.Gamma(i)))*Math.pow(x,a)*Math.pow(1-x,i-1); 
  };

  var bi = function(x,b,i){
    return ( distribution.Gamma(b+i-1)/(distribution.Gamma(b)*distribution.Gamma(i)))*Math.pow(x,i-1)*Math.pow(1-x,b);
  }; 
  //Three cases: a is an integer, b is an integer, or a and b are half-integers.   
 var sum = 0,
     i=1; 
 if(b===parseInt(b,10)){
    sum = 0;
    for(i = 1;i<b;i++){
      sum+= ai(x,a,i);
    }
      return sum;
  }
  else if(a==parseInt(a,10)){
    sum = 0;
    for(i = 1;i<a;i++){
      sum+= bi(x,b,i);
    }
    return 1-sum;
  }
  else{
    var halfI = (2/Math.PI)*Math.atan(Math.sqrt(x/(1-x))),
    halfAI;
    sum = 0;
    for(i = 1;i<Math.floor(a)-1;i++){
      sum+=(distribution.Gamma(i)/(distribution.Gamma(i+0.5)*distribution.Gamma(1/2)))*Math.pow(x,i-1);
    }        
    halfAI = halfI - Math.sqrt(x*(1-x))*sum;
    sum  = 0;
    for(i = 1;i<Math.floor(b)-1;i++){
      sum+=(distribution.Gamma(a+i-0.5)/(distribution.Gamma(a)*distribution.Gamma(i+0.5)))*Math.pow(x,a)*Math.pow(1-x,i-0.5);
    }        
    return halfAI + sum;
  }
};

// Uniform Distribution
distribution.Uniform = function(a,b){
  this.pdf = function(x){
    var pd = (x>=a && x<=b) ? 1/(b-a) : 0;
    return pd; 
  };
  this.cdf = function(x){
    if(x<a){
      return 0;
    }
    else if(x>b){
      return 1;
    }
    else{
      return (x-a) / (b-a);
    }
  };
  this.icdf = function(p){
    var id= (p>0 && p<1) ? a+p(b-a) : NaN;
    return id; 
  };
};

// Normal Distribution
distribution.Normal = function(mu,sigma){
  this.mu = !mu ? 0 : mu;
  this.sigma = !sigma ? 1 : sigma;
  this.pdf = function(x){
    var exponential = Math.exp(-1 * Math.pow(x-this.mu,2) / (2 * Math.pow(this.sigma,2) ) );
    return (1/ (this.sigma * Math.sqrt(2*Math.PI)) ) * exponential; 
  };
  this.cdf = function(x){
  // Approximation from West (2009) Better Approximations to Cumulative Normal Functions
    var cd,
        z = (x - this.mu) / this.sigma,
        Z = Math.abs(z);
    if(Z>37){
      cd = 0;
    }
    else{
      var sum,
          exponential = Math.exp( -1*(Z*Z) / 2); 
      if(Z<7.07106781186547){
        sum = 3.52624965998911e-02*Z + 0.700383064443688;
        sum = sum*Z + 6.37396220353165;
        sum = sum*Z + 33.912866078383;
        sum = sum*Z + 112.079291497871;
        sum = sum*Z + 221.213596169931;
        sum = sum*Z + 220.206867912376;
        cd = exponential * sum;
        sum = 8.83883476483184e-02*Z + 1.75566716318264;
        sum = sum*Z + 16.064177579207;
        sum = sum*Z + 86.7807322029461;
        sum = sum*Z + 296.564248779674;
        sum = sum*Z + 637.333633378831;
        sum = sum*Z + 793.826512519948;
        sum = sum*Z + 440.413735824752;
        cd = cd / sum;
      }
      else{
        sum = Z + 0.65;
        sum = Z + 4 / sum;
        sum = Z + 3 / sum;
        sum = Z + 2 / sum;
        sum = Z + 1 / sum;
        cd = exponential / sum / 2.506628274631;
      }
    }
    if(z>0)
      return 1-cd;
    else
      return cd;
  };
  this.icdf = function(p){
  // Approximation of Probit function using inverse error function.
    if(p<=0 || p>=1){
      return NaN;
    }
    else{
      var ierf = function(x){
        var a = (8*(Math.PI - 3))/(3 * Math.PI * (4-Math.PI)),
            parta = ( 2 / (Math.PI*a) ) + (Math.log(1-Math.pow(x,2))/2),
            partb = Math.log(1 - (x*x))/a;
        return Math.sign(x)*Math.sqrt( Math.sqrt( (parta*parta) - partb) - parta);
      };
      return this.mu + this.sigma*Math.sqrt(2)*ierf(2*p - 1);
    }
  };
};

// Student's T distribution
distribution.StudentsT = function(df){
  this.pdf = function(t){
    var tcomponent = Math.pow(1 + (t*t/df),-( (df+1)/2)),
        g1 = distribution.Gamma( (df+1)/2),
        g2 = Math.exp(distribution.GammaLn( df / 2)),
        gammaComponent = g1/ (g2 * Math.sqrt(df*Math.PI));
    return tcomponent*gammaComponent;
   };
  this.cdf = function(t){
  // Analytic definition of cdf, but errors from the regularized incomplete beta function accumulate.
    var x = df/(Math.pow(t,2) + df),
        value =  1 - (0.5*distribution.IncBeta(x,df/2,1/2)),
        cd;
    if(t===0){
      cd = 0.5;
    }
    else if(t>0){
      cd = value;
    }
    else{
      cd = 1-value;
    }
    return cd;
  };
  this.icdf = function(u){
  // Power series expansion from Shaw (2006) New Methods for Managing Student's T Distribution. I only use the first 6 constants for readability, and the errors from the gamma function approximation accumulate, so consider this a placeholder for now.
    if(u<=0 || u>=1){
      return NaN;
    }
    else if(u==0.5){
      return 0;
    }
        
    var v = (u-0.5)*Math.sqrt(df*Math.PI)*(distribution.Gamma(df/2)/distribution.Gamma((df+1)/2)),
    c = 
    [(1/6) + (1/(6*df)),
     (7/120)+(1/(15*df))+(1/(120*Math.pow(df,2))),
     127/5040 + (3/(112*df)) + (1/(560*Math.pow(df,2))) + (1/(5040*Math.pow(df,3))),
     4369/362880 + 479/(45360*df) - 67/(60480*df*df) + 17/(45360*Math.pow(df,3)) + 1/(362880*Math.pow(df,4)),
     34807/5702400 + 153161/(39916800*df) - 1285/(798336*df*df) + 11867/(19958400*Math.pow(df,3)) - 2503/(39916800*Math.pow(df,4)) + 1/(39916800*Math.pow(df,5)),
     20036983/6227020800 + 70691/(64864800*df) - 870341/(69191200*df*df) + 67217/(97297200*Math.pow(df,3)) - 339929/(2075673600*Math.pow(df,4)) + 37/(2402400*Math.pow(df,5)) + 1/(6227020800*Math.pow(df,6))
     ],
     sum = 0;
     for(var i = 0;i<c.length;i++){
       sum+=c[i]*Math.pow(v,2*(i+1)+1);
     }
     return v + sum;
  };
}; 

/*distribution.BetaDistribution = function(x,a,b){
    var numerator = Math.pow(x,a-1)*(Math.pow(1-x,b-1));
    return numerator/(distribution.BetaFn(a,b));    
};*/

module.exports = distribution;

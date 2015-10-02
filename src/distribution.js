var distribution = {};
//sample, pdf, cdf, ipdf, icdf

/*
Usage: 
	var foo = new distribution.Normal(0,1);
	var bar = foo.sample();
*/
//GammaLn
distribution.GammaLn = function(z){
//Stirling's Approximation
//Only accurate to 8ish decimal places.
	var sinPart = z*Math.sinh(1/z)+(1/(810*Math.pow(z,6)));
	var twoLn = Math.log(2*Math.PI) - Math.log(z) + z*( (2*Math.log(z))+Math.log(sinPart) - 2);
	return twoLn/2;  
};

//Beta
distribution.BetaFn = function(a,b){
	var numerator = Math.exp(distribution.GammaLn(a))*Math.exp(distribution.GammaLn(b));
	return numerator / Math.exp(distribution.GammaLn(a+b));
};

//IncBeta
distribution.IncBeta = function(x,a,b){
	//Need a better approximation for this: a work in progress!
	return NaN;

};

//Uniform Distribution
distribution.Uniform = function(a,b){
	this.sample = function(){
		return Math.random() * (b - a) + a;
	};
	this.pdf = function(x){
		var pd;
		x>=a && x<=b ? pd= 1/(b-a) : pd=0;
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
		var id=0;
		p>0 && p<1 ? id= a+p(b-a) : id= NaN;
		return id; 
	};

};

//Normal Distribution

distribution.Normal = function(mu,sigma){
	this.sample = function(){
	//Box-Muller transform to generate samples
		var x1,x2,w,y1;
		do{
			x1 = 2*Math.random() - 1;
			x2 = 2*Math.random() - 1;
			w = x1*x1 + x2*x2;
		}
		while(w>=1);
		w = Math.sqrt( (-2 * Math.log(w) ) / w);
		y1 = x1*w;
		return(mu + y1 * sigma);
	};
	this.pdf = function(x){
		var exponential = Math.exp(-1 * Math.pow(x-mu,2) / (2 * Math.pow(sigma,2) ) );
		return (1/ (sigma * Math.sqrt(2*Math.PI)) ) * exponential; 
	};
	this.cdf = function(x){
		//Approximation from West (2009) Better Approximations to Cumulative Normal Functions
		//essentially, it's a rational function approximation of the error function, with the extreme tails of the pdf as special cases.
		var cd;
		var z = (x - mu) / sigma ;
		var Z = Math.abs(z);
		if(Z>37){
			cd = 0;
		}
		else{
			var exponential = Math.exp( -1*(Z*Z) / 2);
			var sum; 
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
		if(p<=0 || p>=1){
			return NaN;
		}
		else{
			var ierf = function(x){
			//Abramowitz and Stegun approximation
				var a = (8*(Math.PI - 3))/(3 * Math.PI * (4-Math.PI));
				var parta = ( 2 / (Math.PI*a) ) + (Math.log(1-Math.pow(x,2))/2);
				parta = parta;
				var partb = Math.log(1 - (x*x))/a;
				return Math.sign(x)*Math.sqrt( Math.sqrt( (parta*parta) - partb) - parta);
			};
			return mu + sigma*Math.sqrt(2)*ierf(2*p - 1);
		}
	};
};

//Student's T distribution
distribution.StudentsT = function(df){
	this.pdf = function(t){
		var gammaComponent,tcomponent,g1,g2;
		tcomponent = Math.pow(1 + (t*t/df),-( (df+1)/2));
		g1 = Math.exp(distribution.GammaLn( (df+1)/2));
		g2 = Math.exp(distribution.GammaLn( df / 2));
		gammaComponent = g1/ (g2 * Math.sqrt(df*Math.PI));
		return tcomponent*gammaComponent;
	};

	this.cdf = function(t){
		var x = df/(Math.pow(t,2) + df);
		var value =  1 - (0.5*distribution.IncBeta(x,df/2,1/2));
		var cd;
		if(t==0){
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

	this.sample = function(){
	};
}; 

distribution.Beta = function(a,b){
	this.pdf = function(x){
		var numerator = Math.pow(x,a-1)*(Math.pow(1-x,b-1));
		return numerator/(distribution.BetaFn(a,b));	
	};
};

module.exports = distribution;

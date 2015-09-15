var distribution = {};
//sample, pdf, cdf, ipdf, icdf

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
};

//module.exports = distribution;

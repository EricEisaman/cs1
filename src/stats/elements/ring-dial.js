
const defaults={
  labelText: 'Label Text',
  suffix: '',
  labelColor: '#e23fcf',
  gradientColor1: '#78F8EC',
  gradientColor2: '#6E4AE2',
  max: 100
}

const RingDial = function(custom) {
    this.opts = Object.assign({}, defaults, custom);
    this.size = 2000/9;
    this.strokeWidth = this.size / 8;
    this.radius = (this.size / 2) - (this.strokeWidth / 2);
    this.value = 0;
    this.cachedValue = this.value;
    this.targetValue = false;
    this.isAnimating = false;
    this.direction = 'up';
    this.svg;
    this.defs;
    this.slice;
    this.overlay;
    this.text;
    this.label;
    this.arrow;
    this.create(this.opts.labelColor,this.opts.gradientColor1,this.opts.gradientColor2);
}

RingDial.prototype.create = function(labelColor,gradientColor1,gradientColor2) {
    this.createSvg();
    this.createDefs(gradientColor1,gradientColor2);
    this.createSlice();
    this.createOverlay();
    this.createText(gradientColor2);
    //this.createArrow();
    this.createLabel(labelColor);
    this.opts.container.appendChild(this.svg);
};

RingDial.prototype.createSvg = function() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', this.size + 'px');
    svg.setAttribute('height', this.size + 'px');
    this.svg = svg;
};

RingDial.prototype.createDefs = function(gc1,gc2) {
    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    var linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    linearGradient.setAttribute('id', 'gradient'+this.opts.labelText);
    var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute('stop-color', gc2);
    stop1.setAttribute('offset', '0%');
    linearGradient.appendChild(stop1);
    var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute('stop-color', gc1);
    stop2.setAttribute('offset', '100%');
    linearGradient.appendChild(stop2);
    var linearGradientBackground = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    linearGradientBackground.setAttribute('id', 'gradient-background');
    var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute('stop-color', 'rgba(0, 0, 0, 0.2)');
    stop1.setAttribute('offset', '0%');
    linearGradientBackground.appendChild(stop1);
    var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute('stop-color', 'rgba(0, 0, 0, 0.05)');
    stop2.setAttribute('offset', '100%');
    linearGradientBackground.appendChild(stop2);
    defs.appendChild(linearGradient);
    defs.appendChild(linearGradientBackground);
    this.svg.appendChild(defs);
    this.defs = defs;
};

RingDial.prototype.createSlice = function() {
    var slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
    slice.setAttribute('fill', 'none');
    slice.setAttribute('stroke', `url(#gradient${this.opts.labelText})`);
    slice.setAttribute('stroke-width', this.strokeWidth);
    slice.setAttribute('transform', 'translate(' + this.strokeWidth / 2 + ',' + this.strokeWidth / 2 + ')');
    slice.setAttribute('class', 'animate-draw');
    this.svg.appendChild(slice);
    this.slice = slice;
};

RingDial.prototype.createOverlay = function() {
    var r = this.size - (this.size / 2) - this.strokeWidth / 2;
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('cx', this.size / 2);
    circle.setAttribute('cy', this.size / 2);
    circle.setAttribute('r', r);
    if(navigator.vendor.includes('Apple')){
      circle.setAttribute('fill', 'rgba(0, 0, 0, 0.05)');
    }else
       circle.setAttribute('fill', 'url(#gradient-background)');
    this.svg.appendChild(circle);
    this.overlay = circle;
};

RingDial.prototype.createText = function(c) {
    var fontSize = this.size / 3.5;
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', (this.size / 2) + fontSize / 7.5);
    text.setAttribute('y', (this.size / 2) + fontSize / 4);
    text.setAttribute('font-size', fontSize);
    text.setAttribute('fill', c);
    text.setAttribute('text-anchor', 'middle');
    var tspanSize = fontSize / 3;
    text.innerHTML = 0 + `<tspan font-size=${tspanSize} dy=${-tspanSize * 1.2}>${this.opts.suffix}</tspan>`;
    this.svg.appendChild(text);
    this.text = text;
};

RingDial.prototype.createLabel = function(c) {
    let n=4.5;
    if(this.opts.labelText.length>8)n=7
    var fontSize = this.size / n;
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute('x', this.size / 2);
    text.setAttribute('y', (2*this.size / 3) + fontSize / (n-1));
    text.setAttribute('font-family', 'Century Gothic, Lato');
    text.setAttribute('font-size', fontSize);
    text.setAttribute('fill', c);
    text.setAttribute('text-anchor', 'middle');
    var tspanSize = fontSize / 3;
    text.innerHTML = this.opts.labelText;
    this.svg.appendChild(text);
    this.label = text;
};

RingDial.prototype.createArrow = function() {
    var arrowSize = this.size / 10;
    var arrowYOffset, m;
    if(this.direction === 'up') {
        arrowYOffset = arrowSize / 2;
        m = -1;
    }
    else if(this.direction === 'down') {
        arrowYOffset = 0;
        m = 1;
    }
    var arrowPosX = ((this.size / 2) - arrowSize / 2);
    var arrowPosY = (this.size - this.size / 3) + arrowYOffset;
    var arrowDOffset =  m * (arrowSize / 1.5);
    var arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute('d', 'M 0 0 ' + arrowSize + ' 0 ' + arrowSize / 2 + ' ' + arrowDOffset + ' 0 0 Z');
    arrow.setAttribute('fill', '#97F8F0');
    arrow.setAttribute('opacity', '0.6');
    arrow.setAttribute('transform', 'translate(' + arrowPosX + ',' + arrowPosY + ')');
    this.svg.appendChild(arrow);
    this.arrow = arrow;
};

RingDial.prototype.animateStart = function() {
    var v = 0;
    var self = this;
    var intervalOne = setInterval(function() {
        var p = +(v / self.value).toFixed(2);
        var a = (p < 0.95) ? 2 - (2 * p) : 0.05;
        v += a;
        // Stop
        if(v >= +self.value) {
            v = self.value;
            clearInterval(intervalOne);
        }
        self.setValue(v);
    }, 10);
};

RingDial.prototype.animateTo = function(to,s=3,t=0.1) {
    let m=this.opts.max;
    s*=m/100;
    t*=m/100;
    if(to>m)to=m;
    if(to<0)to=0;
    var v = this.value;
    var self = this;
    this.isAnimating = true;
    var intervalOne = setInterval(function() {
        var p =  (v>to)? +(to /v).toFixed(2)  : +(v / to).toFixed(2);
        var a = (p < 0.95) ? s - (s * p) : t;
        if(to<v){
          v -= a;
            // Stop
            if(v <= -to) {
                self.value = to;
                clearInterval(intervalOne);
                self.cachedValue = self.value;
                self.isAnimating = false;
            }
        }else {
           v += a;
            // Stop
            if(v >= +to) {
                self.value = to;
                if(to>=self.opts.max){
                  self.svg.currentScale=0
                  setTimeout(e=>{
                    self.setValue(self.opts.max);
                    self.svg.currentScale=1;
                  },100);
                }
                clearInterval(intervalOne);
                self.cachedValue = self.value;
                self.isAnimating = false;
            }
        }
        self.setValue(v);
    }, 10);
};

RingDial.prototype.changeBy = function(amt) {
   this.targetValue = this.targetValue?this.targetValue+amt:this.value+amt;
   this.animateTo(this.targetValue);
};

RingDial.prototype.animateReset = function() {
    this.setValue(0);
};

RingDial.prototype.polarToCartesian = function(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

RingDial.prototype.describeArc = function(x, y, radius, startAngle, endAngle){
    var start = this.polarToCartesian(x, y, radius, endAngle);
    var end = this.polarToCartesian(x, y, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;       
}

RingDial.prototype.setValue = function(value) {	
		var c = (value / this.opts.max) * 360;
		if(c === 360)
			c = 359.99;
		var xy = this.size / 2 - this.strokeWidth / 2;
		var d = this.describeArc(xy, xy, xy, 180, 180 + c);
    this.slice.setAttribute('d', d);
    var tspanSize = (this.size / 3.5) / 3;
    this.text.innerHTML = Math.floor(value) + `<tspan font-size=${tspanSize} dy=${-tspanSize * 1.2}>${this.opts.suffix}</tspan>`;
    this.value = value;
};

export default RingDial;
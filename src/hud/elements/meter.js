export default class Meter{

  constructor(container,labelText='label',color='white',value=0,min=0,max=1,low=0.25,high=0.75,optimum=0.8){
    this.widget = document.createElement('div');
    this.widget.style.fontSize = 2000/9/4.5 + 'px';
    this.widget.style.marginTop = 2000/81 + 'px';
    this.widget.style.marginBottom = 2000/81 + 'px';
    this.widget.style.color = color;
    this.value = 0;
    this.min = parseFloat(min);
    this.max = parseFloat(max);
    this.range = max-min;
    this.el = document.createElement('meter');
    this.el.cachedValue = this.value;
    this.el.targetValue = false;
    this.el.isAnimating = false;
    this.el.setAttribute('value',value);
    this.el.setAttribute('min',min);
    this.el.setAttribute('max',max);
    this.el.setAttribute('low',low);
    this.el.setAttribute('high',high);
    this.el.setAttribute('optimum',optimum);
    this.el.style.width = 1250/8 + 'px';
    this.el.style.height = 1250/32 + 'px';
    this.widget.appendChild(this.el);
    this.label = document.createElement('div');
    this.label.style.textAlign = 'center';
    this.label.innerHTML = labelText;
    this.widget.appendChild(this.label);
    container.appendChild(this.widget);
  }
  
  animateTo(to) {
      var v = parseFloat(this.el.getAttribute('value'));
      var self = this.el;
      self.range = this.range;
      self.isAnimating = true;
      var intervalOne = setInterval(function() {
          var p =  (v>to)? +(to /v).toFixed(4)  : +(v / to).toFixed(4);
          var a = (p < 0.95) ? self.range/30 - (self.range/30 * p) : 0.003;
          if(to<v){
            
            v -= a;
              // Stop
              if(v <= -to) {
                  self.value = to
                  if(to<=0)self.setValue(0);
                  clearInterval(intervalOne);
                  self.cachedValue = self.value;
                  self.isAnimating = false;
              }
          }else {
             v += a;
              // Stop
              if(v >= +to) {
                  self.value = to;
                  if(to>=100)self.setValue(100);
                  clearInterval(intervalOne);
                  self.cachedValue = self.value;
                  self.isAnimating = false;
              }
          }
          self.value = v;
          this.value = v;
      }, 10);
  };
  
  changeBy(amt) {
     this.el.targetValue = this.el.targetValue?this.el.targetValue+amt:this.el.cachedValue+amt;
     this.animateTo(this.el.targetValue);
  }
  


}
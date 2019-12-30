export default CS1=>{
  CS1.utils = {
    uid: (()=>{
        const firstItem = {
            value: "0"
        };
        /*length can be increased for lists with more items.*/
        let counter = "123456789".split('')
            .reduce((acc, curValue, curIndex, arr) => {
                const curObj = {};
                curObj.value = curValue;
                curObj.prev = acc;

                return curObj;
            }, firstItem);
        firstItem.prev = counter;

        return function () {
            let now = Date.now();
            if (typeof performance === "object" && typeof performance.now === "function") {
                now = performance.now().toString().replace('.', '');
            }
            counter = counter.prev;
            return `${now}${Math.random().toString(16).substr(2)}${counter.value}`;
        }
    })(),
    
    isEqual : function (value, other) {
      
      function compare(item1, item2) {

        // Get the object type
        var itemType = Object.prototype.toString.call(item1);

        // If the two items are not the same type, return false
        if (itemType !== Object.prototype.toString.call(item2)) return false;

        // If it's a function, convert to a string and compare
        // Otherwise, just compare
        if (itemType === '[object Function]') {
          if (item1.toString() !== item2.toString()) return false;
        } else {
          if (item1 !== item2) return false;
        }
      }
      

      // ...

      // Compare properties
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
            if (compare(value[key], other[key]) === false) return false;
        }
      }

      // If nothing failed, return true
      return true;

    },
    
    toColor: function (num) {
          num >>>= 0;
          var b = num & 0xFF,
              g = (num & 0xFF00) >>> 8,
              r = (num & 0xFF0000) >>> 16,
              a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
          return "rgba(" + [r, g, b, a].join(",") + ")";
      },
    
    randomFromArray: function (array) {
      if(array.length>0){
        return array[Math.floor(Math.random()*array.length)];
      }else{
        return false;
      }
    },
    
    stringToInt: function(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
         hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    } 
       

  }
}
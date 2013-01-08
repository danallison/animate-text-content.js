var animateTextContent = {};

animateTextContent.alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m',
                               'n','o','p','q','r','s','t','u','v','w','x','y','z'];

// animate numerical text between 2 Values, as in animating from, say, 40 to 95 over half a second.
animateTextContent.betweenTwoValues = function(elementID, startValue, endValue, duration){
  var difference = endValue - startValue,
      element = document.getElementById(elementID);
  
  if(difference < 0){
    difference = difference * -1;
  }
  
  var timeIncrement = duration/difference;
  
  for (var i = 1; i <= difference; i++) {
    window.setTimeout(function() {
      if (startValue < endValue) {
        startValue = startValue + 1;
      }else{
        startValue = startValue - 1;
      }
      element.textContent = startValue;
    }, timeIncrement * i);
  }
};
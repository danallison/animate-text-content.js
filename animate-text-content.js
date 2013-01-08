var animateTextContent = {};

animateTextContent.alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
                               'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

// animate numerical text between 2 Values, as in animating from, say, 40 to 95 over half a second.
animateTextContent.betweenTwoValues = function (elementID, startValue, endValue, duration) {
  var difference = endValue - startValue,
      element = document.getElementById(elementID),
      addFrame = 1,
      frameRate,
      nextFrame,
      i;
  
  if(difference < 0){
    difference = difference * -1;
    addFrame = -1;
  }
  
  frameRate = duration / difference;
  
  nextFrame = function() {
    startValue = startValue + addFrame;
    element.textContent = startValue;
  };
  
  for (i = 1; i <= difference; i++) {
    setTimeout(nextFrame, frameRate * i);
  }
};
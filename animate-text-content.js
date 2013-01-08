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
  
  if (difference < 0){
    difference = difference * -1;
    addFrame = -1;
  }
  
  frameRate = duration / difference;
  
  nextFrame = function () {
    startValue = startValue + addFrame;
    element.textContent = startValue;
  };
  
  for (i = 1; i <= difference; i++) {
    setTimeout(nextFrame, frameRate * i);
  }
};

animateTextContent.erase = function (elementID, duration) {
  var element = document.getElementById(elementID),
      originalText = element.textContent,
      textArray = originalText.split(''),
      len = originalText.length,
      frameRate = duration / len,
      nextFrame,
      i;
      
  nextFrame = function () {
    textArray.pop();
    element.textContent = textArray.join('');
  };
  
  for (i = 1; i <= len; i++) {
    setTimeout(nextFrame, frameRate * i);
  }
};

animateTextContent.typing = function (elementID, text, duration) {
  var element = document.getElementById(elementID),
      textArray = text.split(''),
      typingArray = [],
      len = text.length,
      frameRate = duration / len,
      nextFrame,
      i;
      
  nextFrame = function () {
    typingArray.push(textArray.shift());
    element.textContent = typingArray.join('');
  };
  
  for (i = 1; i <= len; i++) {
    setTimeout(nextFrame, frameRate * i);
  }
};

// TODO refactor this function to keep a consistent frame rate, get rid of `halfDuration`
animateTextContent.eraseAndReplace = function (elementID, replacementText, duration) {
  var halfDuration = duration / 2,
      afterPause = function () {
        animateTextContent.typing(elementID, replacementText, halfDuration)
      };
      
  animateTextContent.erase( elementID, halfDuration );
  setTimeout(afterPause, halfDuration);
};
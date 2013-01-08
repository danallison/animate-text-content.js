var animateTextContent = function (elementID) {
  var Animator = function (elementID) {
    this.element = document.getElementById(elementID);
  };
  
  Animator.prototype.betweenTwoValues = function (startValue, endValue, duration) {
    var thiz = this,
        difference = endValue - startValue,
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
      thiz.element.textContent = startValue;
    };

    for (i = 1; i <= difference; i++) {
      setTimeout(nextFrame, frameRate * i);
    }
    
    return thiz;
  };
  
  Animator.prototype.erase = function (duration) {
    var thiz = this,
        originalText = thiz.element.textContent,
        textArray = originalText.split(''),
        len = originalText.length,
        frameRate = duration / len,
        nextFrame,
        i;

    nextFrame = function () {
      textArray.pop();
      thiz.element.textContent = textArray.join('');
    };

    for (i = 1; i <= len; i++) {
      setTimeout(nextFrame, frameRate * i);
    }
    
    return thiz;
  };

  Animator.prototype.typing = function (text, duration) {
    var thiz = this,
        textArray = text.split(''),
        typingArray = [],
        len = text.length,
        frameRate = duration / len,
        nextFrame,
        i;

    nextFrame = function () {
      typingArray.push(textArray.shift());
      thiz.element.textContent = typingArray.join('');
    };

    for (i = 1; i <= len; i++) {
      setTimeout(nextFrame, frameRate * i);
    }
    
    return thiz;
  };

  // TODO refactor this function to keep a consistent frame rate, get rid of `halfDuration`
  Animator.prototype.eraseAndReplace = function (replacementText, duration) {
    var thiz = this,
        halfDuration = duration / 2,
        afterPause = function () {
          thiz.typing(replacementText, halfDuration);
        };

    thiz.erase(halfDuration);
    setTimeout(afterPause, halfDuration);
    
    return thiz;
  };
  
  return new Animator(elementID);
};
var animateTextContent = function (elementID) {
  var Timeline = function (elementID) {
    this.element = document.getElementById(elementID);
    this.frameRate = 1000/60;
    this.queueDelay = 0;
  };
  
  Timeline.prototype.addToQueue = function (funktion, duration) {
    var thiz = this;
    setTimeout(funktion, thiz.queueDelay);
    thiz.queueDelay += duration;
  };
  
  Timeline.prototype.betweenTwoValues = function (startValue, endValue, duration) {
    var thiz = this,
        difference = endValue - startValue,
        addFrame = 1,
        frameRate,
        nextFrame,
        funktion,
        i;

    if (difference < 0){
      difference = difference * -1;
      addFrame = -1;
    }

    frameRate = duration / difference || thiz.frameRate;

    nextFrame = function () {
      startValue = startValue + addFrame;
      thiz.element.textContent = startValue;
    };
    
    funktion = function () {
      for (i = 1; i <= difference; i++) {
        setTimeout(nextFrame, frameRate * i);
      }
    };
    
    duration = duration || thiz.frameRate * difference;
    thiz.addToQueue(funktion, duration);
    
    return thiz;
  };
  
  Timeline.prototype.erase = function (duration) {
    var thiz = this,
        originalText = thiz.element.textContent,
        textArray = originalText.split(''),
        len = originalText.length,
        frameRate = duration / len || thiz.frameRate,
        nextFrame,
        funktion,
        i;

    nextFrame = function () {
      textArray.pop();
      thiz.element.textContent = textArray.join('');
    };
    
    funktion = function () {
      for (i = 1; i <= len; i++) {
        setTimeout(nextFrame, frameRate * i);
      }
    };
    
    duration = duration || thiz.frameRate * len;
    thiz.addToQueue(funktion, duration);
    
    return thiz;
  };

  Timeline.prototype.typing = function (text, duration) {
    var thiz = this,
        textArray = text.split(''),
        typingArray = [],
        len = text.length,
        frameRate = duration / len || thiz.frameRate,
        nextFrame,
        funktion,
        i;
    
    nextFrame = function () {
      typingArray.push(textArray.shift());
      thiz.element.textContent = typingArray.join('');
    };
    
    funktion = function () {
      for (i = 1; i <= len; i++) {
        setTimeout(nextFrame, frameRate * i);
      }
    };
    
    duration = duration || len;
    thiz.addToQueue(funktion, duration);
    
    return thiz;
  };
  
  Timeline.prototype.pause = function (duration) {
    var thiz = this,
    funktion = function () {};
    
    thiz.addToQueue(funktion, duration);
    
    return thiz;
  };
  
  Timeline.prototype.clearQueue = function () {
    this.queueDelay = 0;
  };
  
  return new Timeline(elementID);
};
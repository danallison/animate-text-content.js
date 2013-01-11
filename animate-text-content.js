var animateTextContent = function (elementID) {
  var Timeline = function (elementID) {
    this.element = document.getElementById(elementID);
    this.frameRate = 1000/24;
    this.queue = [];
    this.defaultPause = 2000;
    this.loop = false;
  };
  
  Timeline.prototype.findText = function () {
    var thiz = this,
        text;
    
    try {
      text = thiz.queue[thiz.queue.length - 1].endText;
    } catch (e) {
      text = thiz.element.textContent;
    }
    
    return text;
  };
  
  Timeline.prototype.go = function () {
    var thiz = this,
        len = thiz.queue.length,
        i = 0,
    nextAnimation = function () {
      if (i < len) {
        thiz.queue[i].funktion();
        setTimeout(nextAnimation, thiz.queue[i].duration);
        i += 1;
      } else if (thiz.loop) {
        i = 0;
        nextAnimation();
      }
    };
    
    nextAnimation();
    
    return thiz;
  };
  
  Timeline.prototype.html = function (html) {
    var thiz = this,
    funktion = function () {
      thiz.element.innerHTML = html;
    };
    
    thiz.queue.push({ funktion: funktion, duration: 0, endText: html });
    
    return thiz;
  };
  
  Timeline.prototype.switchElement = function (elementID) {
    var thiz = this,
    funktion = function () {
      thiz.element = document.getElementById(elementID);
    };
    
    thiz.queue.push({ funktion: funktion, duration: 0, endText: thiz.element.textContent });
    
    return thiz;
  };
  
  Timeline.prototype.rollNumbers = function (startValue, endValue, increment, duration) {
    var thiz = this,
        difference = endValue - startValue,
        newValue = startValue,
        addFrame,
        frameRate,
        nextFrame,
        reset,
        funktion,
        i;
    
    increment = increment || 1;
    addFrame = increment;
    
    if (difference < 0) {
      difference = -difference;
      addFrame = -addFrame;
    }

    frameRate = duration / (difference / increment) || thiz.frameRate;
    duration = duration || thiz.frameRate * difference / increment;

    nextFrame = function () {
      newValue += addFrame;
      thiz.element.textContent = newValue;
    };
    
    reset = function () {
      thiz.element.textContent = endValue;
      newValue = startValue;
    };
    
    funktion = function () {
      for (i = 1; i < difference / increment; i++) {
        setTimeout(nextFrame, frameRate * i);
      }
      setTimeout(reset, duration);
    };
    
    thiz.queue.push({ funktion: funktion, duration: duration, endText: endValue });
    
    return thiz;
  };
  
  Timeline.prototype.erase = function (duration) {
    var thiz = this,
        originalText = thiz.findText(),
        textArray = originalText.split(''),
        len = originalText.length,
        frameRate = duration / len || thiz.frameRate,
        nextFrame,
        reset,
        funktion,
        i;
        
    duration = duration || thiz.frameRate * len;

    nextFrame = function () {
      textArray.pop();
      thiz.element.textContent = textArray.join('');
    };
    
    reset = function () {
      textArray = originalText.split('');
    };
    
    funktion = function () {
      for (i = 1; i <= len; i++) {
        setTimeout(nextFrame, frameRate * i);
      }
      setTimeout(reset, duration);
    };
    
    thiz.queue.push({ funktion: funktion, duration: duration, endText: "" });
    
    return thiz;
  };

  Timeline.prototype.typeIn = function (text, duration) {
    var thiz = this,
        textArray = text.split(''),
        displayTextArray = [],
        len = text.length,
        frameRate = duration / len || thiz.frameRate,
        nextFrame,
        reset,
        funktion,
        i;
        
    duration = duration || thiz.frameRate * len;
    
    nextFrame = function () {
      displayTextArray.push(textArray.shift());
      thiz.element.textContent = displayTextArray.join('');
    };
    
    reset = function () {
      textArray = displayTextArray;
      displayTextArray = [];
    };
    
    funktion = function () {
      for (i = 1; i <= len; i++) {
        setTimeout(nextFrame, frameRate * i);
      }
      setTimeout(reset, duration);
    };
    
    thiz.queue.push({ funktion: funktion, duration: duration, endText: text });
    
    return thiz;
  };
  
  Timeline.prototype.pause = function (duration) {
    var thiz = this,
        endText = thiz.findText(),
        funktion = function () {};
        
    duration = duration || thiz.defaultPause;
    thiz.queue.push({ funktion: funktion, duration: duration, endText: endText });
    
    return thiz;
  };
  
  Timeline.prototype.clearTimeline = function () {
    var thiz = this,
    funktion = function () {
      thiz.queue = [];
    };
    
    thiz.queue.push({ funktion: funktion, duration: 0, endText: thiz.findText() });
    
    return thiz;
  };
  
  return new Timeline(elementID);
};
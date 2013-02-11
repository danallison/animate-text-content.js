(function () {
  atc = function (elementID) {
    var Timeline = function (elementID) {
      this.element = document.getElementById(elementID);
      this.queue = [];
      this.queueIndex = 0;
      this.stopped = false;
      this.duration = 0;
      this.endText = "";
      this.defaults = {
        frameRate: atc.defaults.frameRate,
        pauseDuration: atc.defaults.pauseDuration,
        loop: atc.defaults.loop
      };
    };
  
    Timeline.prototype.go = function (timelineObj) {
      var thiz = this, 
          funktion,
          len,
          nextAnimation;
    
      if (timelineObj) {
        funktion = function () {
          timelineObj.go();
        };
      
        this.addToQueue(funktion, timelineObj.duration, timelineObj.endText);
      } else {
        len = this.queue.length;
        this.stopped = false;
        
        nextAnimation = function () {
          if (thiz.queueIndex < len && !thiz.stopped) {
            thiz.queue[thiz.queueIndex].funktion();
            setTimeout(nextAnimation, thiz.queue[thiz.queueIndex].duration);
            thiz.queueIndex += 1;
          } else if (!thiz.stopped) {
            thiz.queueIndex = 0;
            if (thiz.defaults.loop) {
              nextAnimation();
            }
          }
        };
      
        nextAnimation();
      }
    
      return this;
    };
    
    Timeline.prototype.stop = function () {
      var thiz = this,
      funktion = function () {
        thiz.stopped = true;
      };
    
      this.addToQueue(funktion, 0, this.findText());
    
      return this;
    };
    
    Timeline.prototype.frameRate = function (frameRate) {
      this.defaults.frameRate = frameRate || this.defaults.frameRate;
      
      return this;
    };
    
    Timeline.prototype.pauseDuration = function (duration) {
      this.defaults.pauseDuration = duration || this.defaults.pauseDuration;
      
      return this;
    };
    
    Timeline.prototype.loop = function (bool) {
      this.defaults.loop = typeof bool === "undefined" ? true : bool;

      return this;
    };
    
    Timeline.prototype.findText = function () {
      var text;
    
      try {
        text = this.queue[this.queue.length - 1].endText;
      } catch (e) {
        text = this.element.textContent;
      }
    
      return text;
    };
  
    Timeline.prototype.addToQueue = function (funktion, duration, endText) {
      this.duration += duration;
      this.endText = endText;
      this.queue.push({ funktion: funktion, duration: duration, endText: endText });
    };
    
    Timeline.prototype.on = function (eventType, funktion, useCapture) {
      useCapture = useCapture || false;
      this.element.addEventListener(eventType, funktion, useCapture);
      
      return this;
    };
    
    Timeline.prototype.text = function (text) {
      if (text) {
        var thiz = this,
            funktion;
    
        funktion = function () {
          thiz.element.textContent = text;
        };
    
        this.addToQueue(funktion, 0, text);
    
        return this;
      } else {
        return this.element.textContent;
      }
    };
    
    Timeline.prototype.html = function (html) {
      var thiz = this,
      funktion = function () {
        thiz.element.innerHTML = html;
      };
    
      this.addToQueue(funktion, 0, html);
    
      return this;
    };
  
    Timeline.prototype.switchElement = function (elementID) {
      var thiz = this,
      funktion = function () {
        thiz.element = document.getElementById(elementID);
      };
    
      this.addToQueue(funktion, 0, this.element.textContent); // TODO fix endText value
    
      return this;
    };
  
    Timeline.prototype.custom = function (funktion, duration, endText) {
      duration = duration || 0;
      endText = endText || this.findText();
    
      this.addToQueue(funktion, duration, endText);
    
      return this;
    };
    
    Timeline.prototype.frameByFrame = function (frames, loops, duration) {
      var thiz = this,
          len = frames.length,
          lastFrame = frames[len - 1],
          totalFrames,
          frameRate,
          nextFrame,
          reset,
          funktion,
          i,
          j,
          k = 1,
          l = 0;
          
      loops = loops || 1;
      totalFrames = len * loops;
      duration = duration || totalFrames * this.defaults.frameRate;
      frameRate = duration / totalFrames;
      
      nextFrame = function () {
        thiz.element.textContent = frames[l];
        if (l < len - 1) {
          l += 1;
        } else {
          l = 0;
        }
      };
      
      reset = function () {
        k = 1;
      };
      
      funktion = function () {
        for (i = 0; i < loops; i++) {
          for (j = 0; j < len; j++) {
            setTimeout(nextFrame, frameRate * k);
            k += 1;
          }
        }
        setTimeout(reset, duration);
      };
      
      this.addToQueue(funktion, duration, lastFrame);
      
      return this;
    };
  
    Timeline.prototype.rollNumbers = function (startValue, endValue, increment, duration) {
      var thiz = this,
          difference = endValue - startValue,
          newValue = startValue,
          addFrame,
          totalFrames,
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

      totalFrames = difference / increment;
      frameRate = duration / totalFrames || this.defaults.frameRate;
      duration = duration || this.defaults.frameRate * totalFrames;

      nextFrame = function () {
        newValue += addFrame;
        thiz.element.textContent = newValue;
      };
    
      reset = function () {
        thiz.element.textContent = endValue;
        newValue = startValue;
      };
    
      funktion = function () {
        for (i = 1; i < totalFrames; i++) {
          setTimeout(nextFrame, frameRate * i);
        }
        setTimeout(reset, duration);
      };
    
      this.addToQueue(funktion, duration, endValue);
    
      return this;
    };
  
    Timeline.prototype.erase = function (duration) {
      var thiz = this,
          originalText = this.findText(),
          textArray = originalText.split(''),
          len = originalText.length,
          frameRate = duration / len || this.defaults.frameRate,
          nextFrame,
          reset,
          funktion,
          i;
        
      duration = duration || this.defaults.frameRate * len;

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
    
      this.addToQueue(funktion, duration, "");
    
      return this;
    };

    Timeline.prototype.typeIn = function (text, duration) {
      var thiz = this,
          textArray = text.split(''),
          displayTextArray = [],
          len = text.length,
          frameRate = duration / len || this.defaults.frameRate,
          nextFrame,
          reset,
          funktion,
          i;
        
      duration = duration || this.defaults.frameRate * len;
    
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
    
      this.addToQueue(funktion, duration, text);
    
      return this;
    };
  
    Timeline.prototype.pause = function (duration) {
      var endText = this.findText(),
          funktion = function () {};
        
      duration = duration || this.defaults.pauseDuration;
      this.addToQueue(funktion, duration, endText);
    
      return this;
    };
  
    Timeline.prototype.clearTimeline = function () {
      this.queue = [];
      this.duration = 0;
      this.endText = "";
    
      return this;
    };
  
    return new Timeline(elementID);
  };
  
  atc.defaults = {
    frameRate: 1000/24,
    pauseDuration: 2000,
    loop: false
  };
  
  atc.frameRate = function (frameRate) {
    atc.defaults.frameRate = frameRate || atc.defaults.frameRate;
    
    return atc;
  };
  
  atc.pauseDuration = function (duration) {
    atc.defaults.pauseDuration = duration || atc.defaults.pauseDuration;
    
    return atc;
  };
  
  atc.loop = function (bool) {
    atc.defaults.loop = typeof bool === "undefined" ? true : bool;
    
    return atc;
  };
}());
(function () {
  var Timeline = function (elementID) {
    var thiz = this;
    
    thiz.element = typeof elementID === "string" ? document.getElementById(elementID) : elementID || {};
    
    thiz.defaults = {
      frameRate: atc.defaults.frameRate,
      pauseDuration: atc.defaults.pauseDuration,
      loop: atc.defaults.loop
    };
    
    thiz._ = {
      queue: [],
      queueIndex: 0,
      stopped: true,
      duration: 0,
      endText: ""
    };
  },
  
  helpers = {
    addToQueue: function (methodName, funktion, duration, endText) {
      this._.duration += duration;
      this._.endText = endText;
      this._.queue.push({ methodName: methodName, funktion: funktion, duration: duration, endText: endText });
    },
    findText: function () {
      var text;
  
      try {
        text = this._.queue[this._.queue.length - 1].endText;
      } catch (e) {
        text = this.element.textContent;
      }
  
      return text;
    },
    nextFrame: function (frameRate) {
      var now = new Date().getTime(),
          expected = helpers.expected || now,
          difference = now - expected;

      helpers.expected = expected + frameRate;
      return Math.max(0, frameRate - difference);
    },
    nextAnimation: function () {
      var thiz = this;
      delete helpers.expected;
      
      if (thiz._.queueIndex < thiz._.queue.length && !thiz._.stopped) {
        thiz._.queueIndex += 1;
        thiz._.queue[thiz._.queueIndex - 1].funktion();
      } else if (!thiz._.stopped) {
        thiz._.queueIndex = 0;
        if (thiz.defaults.loop) {
          thiz._.queueIndex += 1;
          thiz._.queue[thiz._.queueIndex - 1].funktion();
        } else {
          thiz._.stopped = true;
        }
      }
    }
  };
  
  Timeline.prototype.go = function (timelineObj) {
    var thiz = this,
        len = thiz._.queue.length,
        funktion;
  
    if (timelineObj) {
      funktion = function () {
        timelineObj.go();
        helpers.timeout = setTimeout(function () { helpers.nextAnimation.call(thiz); }, timelineObj._.duration);
      };
    
      helpers.addToQueue.call(thiz, "go", funktion, timelineObj.duration, timelineObj.endText);
    } else if (len > 0) {
      thiz._.stopped = false;
      helpers.nextAnimation.call(thiz);
    }
  
    return thiz;
  };
  
  Timeline.prototype.stop = function (now) {
    var thiz = this;
    if (now) {
      thiz._.stopped = true;
      clearTimeout(helpers.timeout);
      delete helpers.expected;
    } else {
      var funktion = function () {
            thiz._.stopped = true;
          };
  
      helpers.addToQueue.call(thiz, "stop", funktion, 0, helpers.findText.call(thiz));
    }
  
    return thiz;
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
        helpers.nextAnimation.call(thiz);
      };
  
      helpers.addToQueue.call(thiz, "text", funktion, 0, text);
  
      return thiz;
    } else {
      return thiz.element.textContent;
    }
  };
  
  Timeline.prototype.html = function (html) {
    var thiz = this,
    funktion = function () {
      thiz.element.innerHTML = html;
      helpers.nextAnimation.call(thiz);
    };
  
    helpers.addToQueue.call(thiz, "html", funktion, 0, html);
  
    return thiz;
  };

  Timeline.prototype.switchElement = function (elementID) {
    var thiz = this,
    funktion = function () {
      thiz.element = typeof elementID === "string" ? document.getElementById(elementID) : elementID;
      helpers.nextAnimation.call(thiz);
    };
  
    helpers.addToQueue.call(thiz, "switchElement", funktion, 0, thiz.element.textContent); // TODO fix endText value
  
    return thiz;
  };

  Timeline.prototype.custom = function (customFunktion, options) {
    options = options || {};
    
    var thiz = this,
        duration = options.duration || 0,
        endText = options.endText || helpers.findText.call(thiz),
        funktion = function () {
          customFunktion();
          helpers.timeout = setTimeout(function () { helpers.nextAnimation.call(thiz); }, duration);
        };
  
    helpers.addToQueue.call(thiz, "custom", funktion, duration, endText);
  
    return thiz;
  };
  
  Timeline.prototype.frameByFrame = function (frames, options) {
    options = options || {};
    
    var thiz = this,
        len = frames.length,
        lastFrame = frames[len - 1],
        loops = options.loops || 1,
        totalFrames = len * loops,
        duration = options.duration || totalFrames * thiz.defaults.frameRate,
        frameRate = duration / totalFrames,
        i = 0,
        funktion = function () {
          if (i < totalFrames && !thiz._.stopped) {
            thiz.element.textContent = frames[i % len];
        
            helpers.timeout = setTimeout(funktion, helpers.nextFrame(frameRate));
            i++;
          } else {
            i = 0;
            helpers.nextAnimation.call(thiz);
          }
        };
    
    helpers.addToQueue.call(thiz, "frameByFrame", funktion, duration, lastFrame);
    
    return thiz;
  };

  Timeline.prototype.rollNumbers = function (startValue, endValue, options) {
    options = options || {};
    
    var thiz = this,
        difference = endValue - startValue,
        newValue = startValue,
        increment = options.increment || 1,
        addFrame = increment,
        totalFrames,
        frameRate,
        duration,
        funktion,
        i = 0;
  
    if (difference < 0) {
      difference = -difference;
      addFrame = -addFrame;
    }

    totalFrames = difference / increment;
    frameRate = options.duration / totalFrames || thiz.defaults.frameRate;
    duration = options.duration || thiz.defaults.frameRate * totalFrames;
  
    funktion = function () {
      if (i < totalFrames && !thiz._.stopped) {
        newValue += addFrame;
        thiz.element.textContent = newValue;
        
        helpers.timeout = setTimeout(funktion, helpers.nextFrame(frameRate));
        i++;
      } else {
        thiz.element.textContent = endValue;
        newValue = startValue;
        i = 0;
        helpers.nextAnimation.call(thiz);
      }
    };
  
    helpers.addToQueue.call(thiz, "rollNumbers", funktion, duration, endValue);
  
    return thiz;
  };

  Timeline.prototype.erase = function (duration) {
    var thiz = this,
        originalText = helpers.findText.call(thiz),
        textArray = originalText.split(''),
        len = originalText.length,
        frameRate = duration / len || thiz.defaults.frameRate,
        funktion,
        i = 0;
      
    duration = duration || thiz.defaults.frameRate * len;
  
    funktion = function () {
      if (i < len && !thiz._.stopped) {
        textArray.pop();
        thiz.element.textContent = textArray.join('');
        
        helpers.timeout = setTimeout(funktion, helpers.nextFrame(frameRate));
        i++;
      } else {
        textArray = originalText.split('');
        i = 0;
        helpers.nextAnimation.call(thiz);
      }
    };
  
    helpers.addToQueue.call(thiz, "erase", funktion, duration, "");
  
    return thiz;
  };

  Timeline.prototype.typeIn = function (text, options) {
    options = options || {};
    
    var thiz = this,
        textArray = text.split(''),
        displayTextArray = [],
        len = text.length,
        frameRate = options.duration / len || thiz.defaults.frameRate,
        duration = options.duration || thiz.defaults.frameRate * len,
        funktion,
        i = 0;
    
    funktion = function () {
      if (i < len && !thiz._.stopped) {
        displayTextArray.push(textArray.shift());
        thiz.element.textContent = displayTextArray.join('');
        helpers.timeout = setTimeout(funktion, helpers.nextFrame(frameRate));
        i++;
      } else {
        textArray = displayTextArray;
        displayTextArray = [];
        i = 0;
        
        helpers.nextAnimation.call(thiz);
      }
    };
  
    helpers.addToQueue.call(thiz, "typeIn", funktion, duration, text);
  
    return thiz;
  };
  
  Timeline.prototype.pause = function (duration) {
    duration = duration || this.defaults.pauseDuration;
    
    var thiz = this,
        endText = helpers.findText.call(thiz),
        funktion = function () {
          helpers.timeout = setTimeout(function () { helpers.nextAnimation.call(thiz); }, duration);
        };
      
    helpers.addToQueue.call(thiz, "pause", funktion, duration, endText);
  
    return thiz;
  };
  
  Timeline.prototype.clearTimeline = function () {
    this._.queue = [];
    this._.duration = 0;
    this._.endText = "";
  
    return this.stop(true);
  };
  
  atc = function (elementID) {  
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
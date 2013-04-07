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
  addToQueue = function (thiz, methodName, funktion, duration, endText) {
    thiz._.duration += duration;
    thiz._.endText = endText;
    thiz._.queue.push({ methodName: methodName, funktion: funktion, duration: duration, endText: endText });
  },
  findText = function (thiz) {
    var text,
        len = thiz._.queue.length;

    if (len) {
      text = thiz._.queue[len - 1].endText;
    } else {
      text = thiz.element.textContent;
    }

    return text;
  },
  nextFrame = function (frameRate) {
    var now, difference;
    
    now = new Date().getTime();
    expected = expected || now;
    difference = now - expected;

    expected += frameRate;
    return Math.max(0, frameRate - difference);
  },
  nextAnimation = function (thiz) {
    expected = null;
    
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
  },
  expected,
  timeout;
  
  Timeline.prototype.go = function (timelineObj) {
    var thiz = this,
        len = thiz._.queue.length,
        funktion;
  
    if (timelineObj) {
      funktion = function () {
        timelineObj.go();
        timeout = setTimeout(function () { nextAnimation(thiz); }, timelineObj._.duration);
      };
    
      addToQueue(thiz, "go", funktion, timelineObj.duration, timelineObj.endText);
    } else if (len > 0) {
      thiz._.stopped = false;
      nextAnimation(thiz);
    }
  
    return thiz;
  };
  
  Timeline.prototype.stop = function (now) {
    var thiz = this;
    if (now) {
      thiz._.stopped = true;
      clearTimeout(timeout);
      expected = null;
    } else {
      var funktion = function () {
            thiz._.stopped = true;
          };
  
      addToQueue(thiz, "stop", funktion, 0, findText(thiz));
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
    var thiz = this,
        funktion;
        
    if (text) {
      funktion = function () {
        thiz.element.textContent = text;
        nextAnimation(thiz);
      };
  
      addToQueue(thiz, "text", funktion, 0, text);
  
      return thiz;
    }
    return thiz.element.textContent;
  };
  
  Timeline.prototype.html = function (html) {
    var thiz = this,
    funktion = function () {
      thiz.element.innerHTML = html;
      nextAnimation(thiz);
    };
  
    addToQueue(thiz, "html", funktion, 0, html);
  
    return thiz;
  };

  Timeline.prototype.switchElement = function (elementID) {
    var thiz = this,
    funktion = function () {
      thiz.element = typeof elementID === "string" ? document.getElementById(elementID) : elementID;
      nextAnimation(thiz);
    };
  
    addToQueue(thiz, "switchElement", funktion, 0, thiz.element.textContent); // TODO fix endText value
  
    return thiz;
  };

  Timeline.prototype.custom = function (customFunktion, options) {
    options = options || {};
    
    var thiz = this,
        duration = options.duration || 0,
        endText = options.endText || findText(thiz),
        funktion = function () {
          customFunktion();
          timeout = setTimeout(function () { nextAnimation(thiz); }, duration);
        };
  
    addToQueue(thiz, "custom", funktion, duration, endText);
  
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
        
            timeout = setTimeout(funktion, nextFrame(frameRate));
            i++;
          } else {
            i = 0;
            nextAnimation(thiz);
          }
        };
    
    addToQueue(thiz, "frameByFrame", funktion, duration, lastFrame);
    
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
        
        timeout = setTimeout(funktion, nextFrame(frameRate));
        i++;
      } else {
        thiz.element.textContent = endValue;
        newValue = startValue;
        i = 0;
        nextAnimation(thiz);
      }
    };
  
    addToQueue(thiz, "rollNumbers", funktion, duration, endValue);
  
    return thiz;
  };

  Timeline.prototype.erase = function (duration) {
    var thiz = this,
        originalText = findText(thiz),
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
        
        timeout = setTimeout(funktion, nextFrame(frameRate));
        i++;
      } else {
        textArray = originalText.split('');
        i = 0;
        nextAnimation(thiz);
      }
    };
  
    addToQueue(thiz, "erase", funktion, duration, "");
  
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
        timeout = setTimeout(funktion, nextFrame(frameRate));
        i++;
      } else {
        textArray = displayTextArray;
        displayTextArray = [];
        i = 0;
        
        nextAnimation(thiz);
      }
    };
  
    addToQueue(thiz, "typeIn", funktion, duration, text);
  
    return thiz;
  };
  
  Timeline.prototype.pause = function (duration) {
    duration = duration || this.defaults.pauseDuration;
    
    var thiz = this,
        endText = findText(thiz),
        funktion = function () {
          timeout = setTimeout(function () { nextAnimation(thiz); }, duration);
        };
      
    addToQueue(thiz, "pause", funktion, duration, endText);
  
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
})();
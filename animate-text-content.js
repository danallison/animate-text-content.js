(function (glob) {
  "use strict";
  var atc,
  $ = glob.$ || function (selector) {
    var el = typeof selector === "string" ? document.getElementById(selector.replace(/#/, "")) : selector || {},
    arr = [el];
    arr.on = function (eventType, funktion, useCapture) {
      useCapture = useCapture || false;
      el.addEventListener(eventType, funktion, useCapture);
    };
    return arr;
  },
  TextAnimator = function (selector) {
    var thiz = this;

    thiz.element = $(selector)[0];
    
    thiz.defaults = {
      frameRate: atc.defaults.frameRate,
      pauseDuration: atc.defaults.pauseDuration,
      loop: atc.defaults.loop
    };
    
    thiz._queue = [];
    thiz._queueIndex = 0;
    thiz._stopped = true;
    thiz._duration = 0;
    thiz._endText = "";
  },
  // Private methods
  addToQueue = function (thiz, methodName, funktion, duration, endText) {
    thiz._duration += duration;
    thiz._endText = endText;
    thiz._queue.push({ methodName: methodName, funktion: funktion, duration: duration, endText: endText });
  },
  findText = function (thiz) {
    var text,
        thiz_queue = thiz._queue,
        len = thiz_queue.length;

    if (len) {
      text = thiz_queue[len - 1].endText;
    } else {
      text = thiz.element.textContent;
    }

    return text;
  },
  nextAnimation = function (thiz) {
    expected = null;
    var thiz_queue = thiz._queue;
    
    if (thiz._queueIndex < thiz_queue.length && !thiz._stopped) {
      thiz._queueIndex += 1;
      thiz_queue[thiz._queueIndex - 1].funktion();
    } else if (!thiz._stopped) {
      thiz._queueIndex = 0;
      if (thiz.defaults.loop) {
        thiz._queueIndex += 1;
        thiz_queue[thiz._queueIndex - 1].funktion();
      } else {
        thiz._stopped = true;
      }
    }
  },
  // Helper methods and vars
  isDefined = function (thing) {
    return thing !== void 0;
  },
  nextFrame = function (frameRate) {
    var now, difference;
    
    now = new Date().getTime();
    expected = expected || now;
    difference = now - expected;

    expected += frameRate;
    return Math.max(0, frameRate - difference);
  },
  expected,
  timeout;
  
  TextAnimator.prototype = {

    // Queued methods. These methods add callbacks to the queue that execute in sequence only when .go() is called
    text: function (text) {
      var thiz = this,
          funktion;

      if (isDefined(text)) {
        funktion = function () {
          thiz.element.textContent = text;
          nextAnimation(thiz);
        };

        addToQueue(thiz, "text", funktion, 0, text);

        return thiz;
      }
      return thiz.element.textContent;
    },

    html: function (html) {
      var thiz = this,
      funktion = function () {
        thiz.element.innerHTML = html;
        nextAnimation(thiz);
      };

      addToQueue(thiz, "html", funktion, 0, html.replace(/(<([^>]+)>)/ig,""));

      return thiz;
    },

    switchElement: function (selector, endText) {
      var thiz = this,
      funktion = function () {
        thiz.element = $(selector)[0];
        nextAnimation(thiz);
      };

      addToQueue(thiz, "switchElement", funktion, 0, endText || "");

      return thiz;
    },

    custom: function (customFunktion, options) {
      options || (options = {});

      var thiz = this,
          duration = options.duration || 0,
          endText = options.endText || findText(thiz),
          funktion = function () {
            customFunktion();
            timeout = setTimeout(function () { nextAnimation(thiz); }, duration);
          };

      addToQueue(thiz, "custom", funktion, duration, endText);

      return thiz;
    },

    frameByFrame: function (frames, options) {
      options || (options = {});

      var thiz = this,
          len = frames.length,
          lastFrame = frames[len - 1],
          loops = options.loops || 1,
          totalFrames = len * loops,
          duration = options.duration || totalFrames * thiz.defaults.frameRate,
          frameRate = duration / totalFrames,
          i = 0,
          funktion = function () {
            if (i < totalFrames && !thiz._stopped) {
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
    },

    rollNumbers: function (startValue, endValue, options) {
      options || (options = {});

      var thiz = this,
          defaults = thiz.defaults,
          difference = endValue - startValue,
          newValue = startValue,
          increment = options.increment || 1,
          duration = options.duration,
          addFrame = increment,
          totalFrames,
          frameRate,
          funktion,
          i = 0;

      if (difference < 0) {
        difference = -difference;
        addFrame = -addFrame;
      }

      totalFrames = difference / increment;
      frameRate = duration / totalFrames || defaults.frameRate;
      duration = duration || defaults.frameRate * totalFrames;

      funktion = function () {
        if (i < totalFrames && !thiz._stopped) {
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
    },

    erase: function (options) {
      options || (options = {});

      var thiz = this,
          text = findText(thiz),
          textArray = options.byWord ? text.match(/\S+\s*/g) : text.split(""),
          len = textArray.length,
          duration = options.duration || thiz.defaults.frameRate * len,
          frameRate = duration / len,
          funktion,
          i = 0;

      funktion = function () {
        if (i < len && !thiz._stopped) {
          textArray.pop();
          thiz.element.textContent = textArray.join("");

          timeout = setTimeout(funktion, nextFrame(frameRate));
          i++;
        } else {
          textArray = options.byWord ? text.match(/\S+\s*/g) : text.split("");
          i = 0;
          nextAnimation(thiz);
        }
      };

      addToQueue(thiz, "erase", funktion, duration, "");

      return thiz;
    },

    typeIn: function (text, options) {
      options || (options = {});

      var thiz = this,
          preceedingText = options.typeOn ? findText(thiz) : (options.preceedingText || ""),
          textArray = options.byWord ? text.match(/\S+\s*/g) : text.split(""),
          displayTextArray = [],
          len = textArray.length,
          duration = options.duration || thiz.defaults.frameRate * len,
          frameRate = duration / len,
          funktion,
          i = 0;

      funktion = function () {
        if (i < len && !thiz._stopped) {
          displayTextArray.push(textArray.shift());
          thiz.element.textContent = preceedingText + displayTextArray.join("");
          timeout = setTimeout(funktion, nextFrame(frameRate));
          i++;
        } else {
          textArray = displayTextArray;
          displayTextArray = [];
          i = 0;

          nextAnimation(thiz);
        }
      };

      addToQueue(thiz, "typeIn", funktion, duration, preceedingText + text);

      return thiz;
    },

    typeOn: function (text, options) {
      (options || (options = {})).typeOn = true;
      return this.typeIn(text, options);
    },

    typeOver: function (text, options) {
      options || (options = {});

      var thiz = this,
          existingText = options.existingText || findText(thiz),
          existingTextArray = options.byWord ? existingText.match(/\S+\s*/g) : existingText.split(""),
          textArray = options.byWord ? text.match(/\S+\s*/g) : text.split(""),
          displayTextArray = existingTextArray.slice(),
          len = Math.max(textArray.length, existingTextArray.length),
          duration = options.duration || thiz.defaults.frameRate * len,
          frameRate = duration / len,
          funktion,
          i = 0;

      funktion = function () {
        if (i < len && !thiz._stopped) {
          displayTextArray[i] = textArray[i] || "";
          thiz.element.textContent = displayTextArray.join("");
          timeout = setTimeout(funktion, nextFrame(frameRate));
          i++;
        } else {
          textArray = displayTextArray;
          displayTextArray = existingTextArray.slice();
          i = 0;

          nextAnimation(thiz);
        }
      };

      addToQueue(thiz, "typeIn", funktion, duration, text);

      return thiz;
    },

    pause: function (duration) {
      duration = duration || this.defaults.pauseDuration;

      var thiz = this,
          endText = findText(thiz),
          funktion = function () {
            timeout = setTimeout(function () { nextAnimation(thiz); }, duration);
          };

      addToQueue(thiz, "pause", funktion, duration, endText);

      return thiz;
    },

    // If a truthy value is passed to this method, the queue is bypassed and any animation in progress stops immediately
    stop: function (now) {
      var thiz = this;
      if (now) {
        thiz._stopped = true;
        clearTimeout(timeout);
        expected = null;
      } else {
        var funktion = function () {
              thiz._stopped = true;
            };

        addToQueue(thiz, "stop", funktion, 0, findText(thiz));
      }

      return thiz;
    },

    // Without arguments, .go() initiates the animation. If a textAnimator object is passed in, its queue is placed into the queue of this.
    go: function (textAnimatorObj, options) {
      options || (options = {});

      var thiz = this,
          len = thiz._queue.length,
          funktion;

      if (textAnimatorObj) {
        funktion = function () {
          textAnimatorObj.go();
          if (options.delay) {
            timeout = setTimeout(function () { nextAnimation(thiz); }, textAnimatorObj._duration);
          } else {
            nextAnimation(thiz);
          }
        };

        addToQueue(thiz, "go", funktion, textAnimatorObj.duration, textAnimatorObj.endText);
      } else if (len > 0) {
        thiz._stopped = false;
        nextAnimation(thiz);
      }

      return thiz;
    },

    // Default setters. These methods set defaults for a given TextAnimator instance.
    frameRate: function (frameRate) {
      this.defaults.frameRate = frameRate || this.defaults.frameRate;

      return this;
    },

    pauseDuration: function (duration) {
      this.defaults.pauseDuration = isDefined(duration) ? duration : this.defaults.pauseDuration;

      return this;
    },

    loop: function (bool) {
      this.defaults.loop = isDefined(bool) ? bool : true;

      return this;
    },

    // Other methods
    on: function (eventType, funktion, useCapture) {
      $(this.element).on(eventType, funktion, useCapture);

      return this;
    },

    clearTimeline: function () {
      this._queue = [];
      this._queueIndex = 0;
      this._duration = 0;
      this._endText = "";

      return this.stop(true);
    }

  };

  var originalAtc = glob.atc;

  glob.atc = atc = function (selector) {
    return new TextAnimator(selector);
  };

  atc.noConflict = function () {
    glob.atc = originalAtc;
    return atc;
  };
  
  // Global defaults and setters
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
    atc.defaults.pauseDuration = isDefined(duration) ? duration : atc.defaults.pauseDuration;
    
    return atc;
  };
  
  atc.loop = function (bool) {
    atc.defaults.loop = isDefined(bool) ? bool : true;
    
    return atc;
  };
})(this);
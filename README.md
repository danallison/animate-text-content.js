animate-text-content.js
=======================

This JS micro-library allows you to animate the text content of elements in the DOM. It employs the method chaining pattern to construct a timeline of sequential animations.

See documentation [here](https://github.com/danallison/animate-text-content.js/wiki/API-Reference).

Example
=======

To start, you create a Timeline object by calling `atc`, passing in a DOM element by its ID to act as the stage for the animation:

HTML

        <div id="exampleDiv"></div>
        
JS

        var timeline = atc("exampleDiv");
        
Then, you construct a series of animations, which are placed in a queue in the order they are given.

        timeline
          .typeIn("I like to eat ")
          .html("I like to eat <span id='fruit'></span>")
          .switchElement("fruit")
          .typeIn("apples")
          .pause()
          .erase()
          .typeIn("bananas")
          .pause()
          .erase()
          .typeIn("oranges");
          
When you want the animations to play, you use `.go()`. 

        timeline.go();

Caution
=======
Current build state is incomplete. Bugs are likely.
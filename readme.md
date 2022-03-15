# 3D DICE ROLLER

My goal here is to make a truly satisfying dice roller; One that's the next best thing to rolling real dice. This library animates polyhedrons with numbers on each face that are visible while rolling, and includes a sound effect. Supports d4, d6, d8, d10, d12, d20, and d100 plus modifiers. Can be used to create stand-alone dice roller apps, or to integrate dice rolling into your javascript-based game. Visit https://sarahrosannabusch.ca/#diceRoller to see a demo of how it works.

# Usage

Clone this repo and open index.html in a web browser. (Note that the index.html, main.js, and styles.css files included here are intended as a demo and should be replaced with your own application.)

## dice.js

Create a new dice_box and pass it the dom element you want to contain it. (The dice box canvas will fill to the size of the container element.)

```javascript
    var box = new DICE.dice_box(elem);
```

Set the dice to be rolled by passing a string in the format "1d4+2d6+3".

```javascript
    box.setDice(string);
```

Call start_throw() to roll the current set of dice.

```javascript
    box.start_throw();
```

Or bind throw to a swipe event on the element passed into bind_swipe()

```javascript
    box.bind_swipe(elem);
```

Optional callback functions can be passed into both start_throw() and bind_swipe().

```javascript
    box.start_throw(before_roll, after_roll);
    box.bind_swipe(elem, before_roll, after_roll);

    // @brief callback function called when dice roll event starts
    // @param notation indicates which dice are going to roll
    // @return null for random result || array of desired results
    function before_roll(notation) {
        console.log('before_roll notation: ' + JSON.stringify(notation));
        //do some stuff before roll starts        
        return null;
    }

    // @brief callback function called once dice stop moving
    // @param notation now includes results
    function after_roll(notation) {
        console.log('after_roll notation: ' + JSON.stringify(notation));
        //do something with the results
    }
```

Dice notation object structured as follows:

```javascript
    {
        "set":["d100","d10","d4","d6","d8","d12","d20"],
        "constant":0,
        "result":[10,9,1,5,2,8,18],
        "resultTotal":53,
        "resultString":"10 9 1 5 2 8 18 = 53",
        "error":false
    }
```


# CREDITS

This project is derived from the work of Anton Natarov (aka Teal) found at http://www.teall.info/2014/01/online-3d-dice-roller.html and uses [three.js](https://github.com/mrdoob/three.js/) and [canon.js](https://github.com/schteppe/cannon.js) for the geometry and physics.

Sound Effect courtesy of http://commons.nicovideo.jp/material/nc93322 and https://github.com/chukwumaijem/roll-a-die.



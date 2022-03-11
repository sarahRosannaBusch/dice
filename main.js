"use strict";

/** @brief 3d dice roller web app
 *  @author Sarah Rosanna Busch
 *  @date 8 March 2022
 */

 var main = (function() {
    var that = {}; 
    var vars = {}; 
    var elem = {}; 

    that.init = function() {
        elem.container = $t.id('diceRoller');
        elem.canvas = $t.id('canvas');
        elem.result = $t.id('result');
        elem.textInput = $t.id('textInput'); 
        elem.instructions = $t.id('instructions');
        elem.center_div = $t.id('center_div');

        elem.textInput.size = elem.textInput.value.length; //so input field is only as wide as its contents
        $t.bind(elem.textInput, 'change', function(ev) { show_instructions(); }); //shows instructions
        $t.bind(elem.textInput, 'input', function(ev) { 
            let size = elem.textInput.value.length;
            elem.textInput.size = size > 0 ? size : 1;
        });

        var box = new $t.dice.dice_box(elem.canvas);

        $t.bind(window, 'resize', function() {
            //todo: this doesn't work :(
            box.reinit(elem.canvas);
        });

        //binds swipe to center_div
        $t.bind(elem.center_div, ['mouseup', 'touchend'], function(ev) {
            if (box.rolling) return;
            box.start_throw(notation_getter, before_roll, after_roll);
        });

        show_instructions();
    }

    // show 'Roll Dice' button
    function show_instructions() {
        elem.instructions.style.display = 'inline-block';
    }

    function notation_getter() {
        let diceToRoll = textInput.value;
        let result = $t.dice.parse_notation(diceToRoll);
        console.log('notation_getter got: ' + JSON.stringify(result));
        return result;
    }

    function before_roll(notation, callback) {
        elem.instructions.style.display = 'none';
        elem.result.innerHTML = '';
        elem.result.style.display = 'none';
        let numDice = notation.set.length;
        numDice = numDice > 10 ? 10 : numDice;
        for(let i = 0; i < numDice; i++) {
            let volume = i/10;
            if(volume <= 0) volume = 0.1;
            if(volume > 1) volume = 1;
            playSound(elem.container, volume);
        }
        
        //pass in array of results, when desired
        callback(); 
    }

    function after_roll(notation, result) {
        console.log('after_roll result: ' + JSON.stringify(result));
        console.log('after_roll notation: ' + JSON.stringify(notation));
        var res = result.join(' ');
        if (notation.constant) {
            if (notation.constant > 0) res += ' +' + notation.constant;
            else res += ' -' + Math.abs(notation.constant);
        }
        if (result.length > 1 || notation.constant) res += ' = ' + 
                (result.reduce(function(s, a) { return s + a; }) + notation.constant);
        if(result[0] < 0) {
            elem.result.innerHTML = "Oops, your dice fell off the table. Refresh and roll again."
        } else {
            elem.result.innerHTML = res;
        }
        elem.result.style.display = 'block';
        console.log('result: ' + res);
    }

    //playSound function and audio file copied from 
    //https://github.com/chukwumaijem/roll-a-die
    function playSound(outerContainer, soundVolume) {
        if (soundVolume === 0) return;
        const audio = document.createElement('audio');
        outerContainer.appendChild(audio);
        audio.src = 'assets/nc93322.mp3';
        audio.volume = soundVolume;
        audio.play();
        audio.onended = () => {
          audio.remove();
        };
    }

    return that;
}());

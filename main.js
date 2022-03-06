"use strict";

function dice_initialize() {
    let container = $t.id('diceRoller');
    var canvas = $t.id('canvas');
    var label = $t.id('label');
    var set = $t.id('set'); //input field
    var selector_div = $t.id('selector_div');
    var center_div = $t.id('center_div');

    set.size = set.value.length; //so input field is only as wide as its contents
    $t.bind(set, 'change', function(ev) { show_selector(); }); //shows instructions
    $t.bind(set, 'input', function(ev) { 
        let size = set.value.length;
        set.size = size > 0 ? size : 1;
    });

    var box = new $t.dice.dice_box(canvas);

    $t.bind(window, 'resize', function() {
        //todo: this doesn't work :(
        box.reinit(canvas);
    });

    box.bind_mouse(center_div, notation_getter, before_roll, after_roll);

    $t.bind(container, ['mouseup', 'touchend'], function(ev) {
        //ev.stopPropagation();
        if (selector_div.style.display == 'none') {
            if (!box.rolling) show_selector();
            //box.rolling = false;
            return;
        }
    });

    show_selector();

    // show 'Roll Dice' button
    function show_selector() {
        selector_div.style.display = 'inline-block';
    }

    function notation_getter() {
        let diceToRoll = set.value;
        let result = $t.dice.parse_notation(diceToRoll);
        console.log('notation_getter got: ' + JSON.stringify(result));
        return result;
    }

    function before_roll(vectors, notation, callback) {
        selector_div.style.display = 'none';
        label.innerHTML = '';
        label.style.display = 'none';
        let numDice = notation.set.length;
        numDice = numDice > 10 ? 10 : numDice;
        for(let i = 0; i < numDice; i++) {
            let volume = i/10;
            if(volume <= 0) volume = 0.1;
            if(volume > 1) volume = 1;
            playSound(container, volume);
        }
        // do here rpc call or whatever to get your own result of throw.
        // then callback with array of your result, example:
        // callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
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
            label.innerHTML = "Oops, your dice fell off the table. Refresh and roll again."
        } else {
            label.innerHTML = res;
        }
        label.style.display = 'block';
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
}

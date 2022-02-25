"use strict";

function dice_initialize() {
    let container = $t.id('diceRoller');
    var canvas = $t.id('canvas');
    canvas.style.width = container.offsetWidth - 1 + 'px';
    canvas.style.height = container.offsetHeight - 1 + 'px';
    var label = $t.id('label');
    var set = $t.id('set'); //input field
    var selector_div = $t.id('selector_div');
    var center_div = $t.id('center_div');

    $t.dice.use_true_random = false; //set to false for local dev

    $t.bind(set, 'input', function(ev) { show_selector(); });
    $t.bind(set, 'blur', function(ev) { show_selector(); });

    var box = new $t.dice.dice_box(canvas);
    box.animate_selector = false;

    $t.bind(window, 'resize', function() {
        canvas.style.width = container.offsetWidth - 1 + 'px';
        canvas.style.height = container.offsetHeight - 1 + 'px';
        box.reinit(canvas);
    });

    box.bind_mouse(center_div, notation_getter, before_roll, after_roll);
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);

    $t.bind(container, ['mouseup', 'touchend'], function(ev) {
        ev.stopPropagation();
        if (selector_div.style.display == 'none') {
            if (!box.rolling) show_selector();
            box.rolling = false;
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
        //console.log('notation_getter got: ' + JSON.stringify(result));
        return result;
    }

    function before_roll(vectors, notation, callback) {
        selector_div.style.display = 'none';
        let numDice = notation.set.length;
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
        var res = result.join(' ');
        if (notation.constant) {
            if (notation.constant > 0) res += ' +' + notation.constant;
            else res += ' -' + Math.abs(notation.constant);
        }
        if (result.length > 1) res += ' = ' + 
                (result.reduce(function(s, a) { return s + a; }) + notation.constant);
        label.innerHTML = res;
        //console.log('result: ' + res);
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

"use strict";

/** @brief 3d dice roller web app
 *  @author Sarah Rosanna Busch
 *  @date 15 March 2022
 */

 var main = (function() {
    var that = {}; 
    var elem = {}; 
    var box = null;

    that.init = function() {
        elem.container = $t.id('diceRoller');
        elem.result = $t.id('result');
        elem.textInput = $t.id('textInput'); 
        elem.numPad = $t.id('numPad');
        elem.instructions = $t.id('instructions');
        elem.center_div = $t.id('center_div');

        box = new DICE.dice_box(elem.container);
        box.bind_swipe(elem.center_div, before_roll, after_roll);

        elem.textInput.size = elem.textInput.value.length; //so input field is only as wide as its contents
        $t.bind(elem.textInput, 'change', function(ev) { //shows instructions
            show_instructions(); 
        }); 
        $t.bind(elem.textInput, 'input', function(ev) { 
            let size = elem.textInput.value.length;
            elem.textInput.size = size > 0 ? size : 1;
            box.setDice(textInput.value);
        });
        $t.bind(elem.textInput, 'focus', function(ev) {
            ev.preventDefault();
            show_instructions(false);
            show_numPad(true);
        });
        box.setDice(textInput.value);
        //box.start_throw(); //start by throwing all the dice on the table

        show_instructions(true);
    }

    that.setInput = function() {
        box.setDice(elem.textInput.value);
        show_numPad(false);
        show_instructions(true);
    }

    that.clearInput = function() {
        elem.textInput.value = '';
    }

    that.input = function(value) {
        let text = elem.textInput.value;
        let selectedText = window.getSelection().toString();
        let caretPos = elem.textInput.selectionStart;
        let selectionEnd = elem.textInput.selectionEnd;
        if(value === "del") {
            if(selectedText) {
                deleteText();
            } else {
                text = text.substring(0, caretPos) + text.substring(caretPos+1, text.length);
            }
        } else if(value === "bksp") {
            if(selectedText) {
                deleteText();
            } else {
                text = text.substring(0, caretPos-1) + text.substring(caretPos, text.length);
            }
        } else {
            deleteText();
            text = text.substring(0, caretPos) + value + text.substring(caretPos, text.length);
        }
        elem.textInput.value = text;
        caretPos++;
        elem.textInput.selectionStart = caretPos;
        elem.textInput.selectionEnd = caretPos;

        function deleteText() {
            text = text.substring(0, caretPos) + text.substring(selectionEnd, text.length);
            elem.textInput.selectionStart = caretPos;
            elem.textInput.selectionEnd = caretPos;
        }
    }

    // show 'Roll Dice' swipe instructions
    // param show = bool
    function show_instructions(show) {
        if(show) {
            elem.instructions.style.display = 'inline-block';
        } else {
            elem.instructions.style.display = 'none';
        }
    }

    // show input options
    // param show = bool
    function show_numPad(show) {
        let focusInput = function(ev) {
            elem.textInput.focus();
        }

        if(show) {
            elem.numPad.style.display = 'inline-block';
            $t.bind(elem.textInput, 'blur', focusInput);
        } else {
            elem.numPad.style.display = 'none';
            $t.unbind(elem.textInput, 'blur', focusInput);
        }
    }

    // @brief callback function called when dice roll event starts
    // @param notation indicates which dice are going to roll
    // @return null for random result || array of desired results
    function before_roll(notation) {
        console.log('before_roll notation: ' + JSON.stringify(notation));
        show_instructions(false);
        elem.result.innerHTML = '';
        elem.result.style.display = 'none';        
        return null;
    }

    // @brief callback function called once dice stop moving
    // @param notation now includes results
    function after_roll(notation) {
        console.log('after_roll notation: ' + JSON.stringify(notation));
        if(notation.result[0] < 0) {
            elem.result.innerHTML = "Oops, your dice fell off the table. Refresh and roll again."
        } else {
            elem.result.innerHTML = notation.resultString;
        }
        elem.result.style.display = 'block';
    }

    return that;
}());

"use strict";

/** @brief 3d dice roller web app
 *  @author Sarah Rosanna Busch
 *  @date 15 March 2022
 */

 var main = (function() {
    var that = {}; 
    var elem = {}; 

    that.init = function() {
        elem.container = $t.id('diceRoller');
        elem.result = $t.id('result');
        elem.textInput = $t.id('textInput'); 
        elem.instructions = $t.id('instructions');
        elem.center_div = $t.id('center_div');

        var box = new DICE.dice_box(elem.container);
        box.bind_swipe(elem.center_div, before_roll, after_roll);

        elem.textInput.size = elem.textInput.value.length; //so input field is only as wide as its contents
        $t.bind(elem.textInput, 'change', function(ev) { show_instructions(); }); //shows instructions
        $t.bind(elem.textInput, 'input', function(ev) { 
            let size = elem.textInput.value.length;
            elem.textInput.size = size > 0 ? size : 1;
            box.setDice(textInput.value);
        });
        box.setDice(textInput.value);
        //box.start_throw(); //start by throwing all the dice on the table

        show_instructions();
    }

    // show 'Roll Dice' button
    function show_instructions() {
        elem.instructions.style.display = 'inline-block';
    }

    // @brief callback function called when dice roll event starts
    // @param notation indicates which dice are going to roll
    // @return null for random result || array of desired results
    function before_roll(notation) {
        console.log('before_roll notation: ' + JSON.stringify(notation));
        elem.instructions.style.display = 'none';
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

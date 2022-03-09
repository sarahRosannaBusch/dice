'use strict';
/// @filename   framework.js
/// @brief      simple es6/html5/css3 framework of common functions
/// @author     Sarah Rosanna Busch
/// @version    1.0
/// @date       12 Nov 2021

var f = (function(){
    var that = {};

    that.html = (function(){
        var that = {};

        that.getElem = function(query, parent = document){
            return parent.querySelector(query);
        }

        that.getElems = function(query, parent = document){
            return parent.querySelectorAll(query);
        }

        that.spawn = function(parentElem, childType, id) {
            var child = document.createElement(childType);
            if(id !== undefined) {
                child.id = id;
            }
            parentElem.appendChild(child);
            return child;
        }

        that.empty = function(elem) {
            if(elem.hasChildNodes) {
                var numChildren = elem.childNodes.length;
                for(var i = numChildren - 1; i >= 0; i--) {
                    elem.removeChild(elem.childNodes[i]);
                }
            }
        }

        return that;
    }());

    that.http = (function(){
        var that = {};

        that.get = function(file, callback) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if(this.readyState === 4) { //request finished and response is ready
                    if(this.status === 200) { //ok
                        callback(this.responseText);
                    }
                }
            };
            xhr.open("GET", file, true);
            xhr.send();
        }

        that.post = function(file, data) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", file, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }

        return that;
    }());

    return that;
}());
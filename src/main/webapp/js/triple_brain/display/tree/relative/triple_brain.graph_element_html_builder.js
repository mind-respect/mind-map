/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery"
], function ($) {
    "use strict";
    var enterKeyCode = 13,
        api = {};
    api.setUpLabel = function(label){
        label.blur(function(){
            nonEditMode($(this));
        }).keydown(function(event){
            if(enterKeyCode === event.which){
                event.preventDefault();
                $(this).blur();
            }
        });
    };
    return api;

    function nonEditMode(label){
        label.attr(
            "contenteditable",
            "false"
        );
        label.closest(".graph-element").removeClass("edit");
    }

});
/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
], function($){
    var keyNumberForCtrl = 17;
    var api = {};
    api.isCtrlPressed = function(){
        return $("body").data(
            "isPressingCtrl"
        );
    };
    initIfApplicable();
    $(window).keydown(function(event){
        if(keyNumberForCtrl === event.which){
            setIsPressingCtrl(true);
        }
    });
    $(window).keyup(function(event){
        if(keyNumberForCtrl === event.which){
            setIsPressingCtrl(false);
        }
    });
    return api;
    function initIfApplicable(){
        if(api.isCtrlPressed() === undefined){
            setIsPressingCtrl(false);
        }
    }
    function setIsPressingCtrl(isPressingCtrl){
        $("body").data(
            "isPressingCtrl", isPressingCtrl
        );
    }
});
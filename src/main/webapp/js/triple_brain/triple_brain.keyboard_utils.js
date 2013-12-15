/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
], function($){
    var ctrlKeyNumber = 17;
    var api = {};
    api.isCtrlPressed = function(){
        return $("body").data(
            "isPressingCtrl"
        );
    };
    initIfApplicable();
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
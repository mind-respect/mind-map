/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "jquery.colorbox"
],
    function(){
        var api = {};
        api.showLinearFlowWithOptions = function(configuration){
            console.log("adfasdf " + configuration.href);
            configuration.overlayClose = false;
            configuration.escKey = false;
            configuration.scrolling = false;
            configuration.onLoad = hideCloseButton;
            $.colorbox(configuration);
        }
        api.close = function(){
            $.colorbox.close();
        }
        api.adjustSize = function(){
            $.colorbox.resize();
        }
        return api;
        function hideCloseButton() {
            $("#cboxClose").hide();
        }
    }
)
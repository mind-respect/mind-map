/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
    ],
    function($) {
        return {
            addHTML : function(html){
                $("#left-panel").append(html);
            }
        };
    }
);
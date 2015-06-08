
/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(
    [],
    function() {
        "use strict";
        return {
            withName : function(name){
                new Error(name, "");
            },
            withNameAndMessage : function(name, message){
                new Error(name, message);
            }
        };

        function Error(name, message){
            log();
            this.name = function(){
                return name;
            };
            this.message = function(){
                return message;
            };
            function log(){
                console.log('error name : ' + name + " message : " + message);
            }
        }

    }
);

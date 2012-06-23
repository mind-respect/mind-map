
/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.error == undefined) {
    (function($) {
        triple_brain.error = {
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
            }
            this.message = function(){
                return message;
            }
            function log(){
                console.log('error name : ' + name + " message : " + message);
            }
        }

    })(jQuery);
}
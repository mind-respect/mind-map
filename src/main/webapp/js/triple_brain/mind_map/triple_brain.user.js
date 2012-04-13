/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.user == undefined) {

    (function($) {
        triple_brain.user = {
            register : function(userObject){
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/users/',
                    data: $.toJSON(userObject),
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8'
                }).success(function(user) {
                        triple_brain.bus.local.topic('/event/ui/user/registration/success').publish(userObject);
                    }).error(function(xhr) {
                        triple_brain.bus.local.topic('/event/ui/users/registration/errors').publish($.parseJSON(xhr.responseText));
                    })
            }
        }

    })(jQuery);

}
/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.user == undefined) {

    (function($) {
        var eventBus = triple_brain.event_bus;
        triple_brain.user = {
            register : function(userObject){
                $.ajax({
                    type: 'POST',
                    url: options.ws.app + '/service/users/',
                    data: $.toJSON(userObject),
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8'
                }).success(function(user) {
                        eventBus.publish(
                            '/event/ui/user/registration/success',
                            userObject
                        );
                    }).error(function(xhr) {
                        eventBus.publish(
                            '/event/ui/users/registration/errors',
                            [$.parseJSON(xhr.responseText)]
                        );
                    })
            },
            authenticatedUser : function(callback){
                $.ajax({
                    type: 'GET',
                    url: options.ws.app + '/service/users/'
                }).success(function(authenticatedUser) {
                        if(callback != undefined){
                            callback.call(this, authenticatedUser);
                        }
                        eventBus.publish(
                            '/event/ui/user/get_authenticated/success',
                            authenticatedUser
                        );
                    }).error(function() {
                        eventBus.publish(
                            '/event/ui/users/get_authenticated/errors'
                        );
                    })
            }
        }
    })(jQuery);
}
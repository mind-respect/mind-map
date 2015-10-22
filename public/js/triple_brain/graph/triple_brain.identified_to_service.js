/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service"
], function ($, UserService) {
    "use strict";
    var api = {};
    api.getForIdentification = function(identification, callback){
        return $.ajax({
            type:'GET',
            url: getUri() + identification.getUri(),
            callback:callback
        });
    };
    return api;
    function getUri(){
        return UserService.currentUserUri() + "/identification/";
    }
});
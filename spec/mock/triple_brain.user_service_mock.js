/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'triple_brain.user_service'
    ],
    function (UserService) {
        "use strict";
        var api = {};
        var spies = {};
        api.applyDefaultMocks = function(){
            spies["authenticatedUserInCache"] = api.authenticatedUserInCache();
            return spies;
        };
        api.authenticatedUserInCache = function (userName) {
            return spyOn(UserService, "authenticatedUserInCache").and.callFake(function () {
                return {
                    user_name: userName || window.usernameForBublGuru
                };
            });
        };
        return api;
    }
);
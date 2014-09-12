/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.user"
], function (UserService) {
    "use strict";
    UserService.authenticatedUserInCache = function(){
        return {
            user_name : "foo"
        }
    };
    return {};
});
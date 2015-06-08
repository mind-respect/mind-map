/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
], function($){
    "use strict";
    var api = {};
    api.makeChildInheritParent = function(childApi, parentApi){
        return $.extend(
            {},
            parentApi,
            childApi
        );
    };
    return api;
});
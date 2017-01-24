/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery"
], function($){
    "use strict";
    var api = {};
    String.prototype.capitalizeFirstLetter = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
    api.makeChildInheritParent = function(childApi, parentApi){
        return $.extend(
            {},
            parentApi,
            childApi
        );
    };
    return api;
});
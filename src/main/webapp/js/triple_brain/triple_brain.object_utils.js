/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
], function(){
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
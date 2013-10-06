/*
 * Copyright Mozilla Public License 1.1
 */
define([
], function(){
    var api = {};
    api.extendedApiForChildUsingParent = function(childApi, parentApi){
        return $.extend(
            {},
            parentApi,
            childApi
        );
    };
    return api;
});
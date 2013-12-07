/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
], function($){
    var api = {};
    api.forSingle = function(){
        var subApi = {};
        subApi.remove = function(){

        };
        return subApi;
    };
    api.forGroup  = function(){
        var subApi = {};
        return subApi;
    };
    return api;
});
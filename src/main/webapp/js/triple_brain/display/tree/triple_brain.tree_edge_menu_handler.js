/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
], function($){
    var api = {};
    api.forSingle = function(){
        var subApi = {};
        subApi.identify = function(){

        };
        subApi.remove = function(){

        };
        subApi.reverseToRight = function(){

        };
        subApi.reverseToLeft = function(){

        };
        subApi.reverseToRightCanDo = function(edge){
            var isToTheLeft = edge.isLeftOfCenterVertex();
            var isInverse = edge.isInverse();
            return  (isToTheLeft && !isInverse) ||
                    (!isToTheLeft && isInverse);

        };
        subApi.reverseToLeftCanDo = function(edge){
            return !subApi.reverseToRightCanDo(edge);
        };
        return subApi;
    };
    api.forGroup  = function(){
        var subApi = {};
        subApi.remove = function(){

        };
        return subApi;
    };
    return api;
});
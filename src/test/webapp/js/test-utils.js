/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
], function () {
    "use strict";
    var api = {};
    api.generateVertexUri = function(){
        return "\/service\/users\/foo\/graph\/vertex\/" + generateUuid();
    };
    api.generateEdgeUri = function(){
        return "\/service\/users\/foo\/graph\/edge\/" + generateUuid();
    };
    return api;

    function generateUuid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
    }
});
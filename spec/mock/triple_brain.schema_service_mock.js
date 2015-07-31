/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.schema_service"
], function (SchemaService) {
    "use strict";
    var api = {};
    api.getMock = function(schemaToReturn){
        return spyOn(SchemaService, "get").and.callFake(function(uri, callback){
            callback(schemaToReturn);
        });
    };
    return api;
});
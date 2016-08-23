/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-utils",
    "triple_brain.graph_element_service"
], function (TestUtils, GraphElementService) {
    "use strict";
    var api = {};
    api.addIdentification = function () {
        return spyOn(GraphElementService, "addIdentification").and.callFake(function(graphElement, identification, callback){
            var identifications = {};
            identification.setUri(
                TestUtils.generateIdentificationUri()
            );
            identifications[identification.getExternalResourceUri()] = identification.getServerFormat();
            GraphElementService._addIdentificationsCallback(
                graphElement,
                identification,
                identifications,
                callback
            );
        });
    };
    api.removeIdentification = function () {
        return spyOn(GraphElementService, "removeIdentification").and.callFake(function(graphElement, identification, callback){
            GraphElementService._removeIdentificationCallback(
                graphElement,
                identification,
                callback
            );
        });
    };
    return api;
});
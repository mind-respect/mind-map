/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_element_service"
], function (GraphElementService) {
    "use strict";
    var api = {};
    api.addIdentificationMock = function () {
        return spyOn(GraphElementService, "addIdentification").and.callFake(function(graphElement, identification, callback){
            var identifications = {};
            identifications[identification.getExternalResourceUri()] = identification.getServerFormat();
            GraphElementService._addIdentificationsCallback(
                graphElement,
                identification,
                identifications,
                callback
            );
        });
    };
    return api;
})
;
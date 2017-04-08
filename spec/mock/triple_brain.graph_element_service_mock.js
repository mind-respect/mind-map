/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "test/test-utils",
    "triple_brain.graph_element_service"
], function ($, TestUtils, GraphElementService) {
    "use strict";
    var api = {};
    api.applyDefaultMocks = function(){
        var spies = {};
        spies["addIdentification"] = api.addIdentification();
        spies["removeIdentifier"] = api.removeIdentifier();
        spies["changeSortDate"] = api.changeSortDate();
        return spies;
    };
    api.addIdentification = function () {
        return spyOn(GraphElementService, "addIdentification").and.callFake(function(graphElement, identification){
            var identifications = {};
            identification.setUri(
                TestUtils.generateIdentificationUri()
            );
            identifications[identification.getExternalResourceUri()] = identification;
            return $.Deferred().resolve(identifications);
        });
    };
    api.removeIdentifier = function () {
        return spyOn(GraphElementService, "removeIdentifier").and.callFake(function(){
            return $.Deferred().resolve();
        });
    };
    api.changeSortDate = function(){
        spyOn(
            GraphElementService,
            "changeSortDate"
        ).and.callFake(function () {
            return $.Deferred().resolve();
        });
    };
    return api;
});
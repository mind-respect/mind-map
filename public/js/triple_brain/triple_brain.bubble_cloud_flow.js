/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.center_graph_element_service",
    "triple_brain.center_graph_elements",
    "triple_brain.visited_elements_cloud"
], function ($, CenterGraphElementService, CenterGraphElements, VisitedElementsCloud) {
    "use strict";
    var api = {};
    api.enter = function () {
        CenterGraphElementService.get(function (elements) {
            $("body").removeClass("hidden");
            VisitedElementsCloud.buildFromElementsInContainer(
                CenterGraphElements.fromServerFormat(elements),
                getContainer()
            );
        });
    };
    return api;
    function getContainer() {
        return $("#word-cloud");
    }
});
/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.id_uri",
    "triple_brain.center_graph_element_service",
    "triple_brain.center_graph_elements",
    "triple_brain.visited_elements_cloud",
    "triple_brain.user_service",
    "triple_brain.ui.graph"
], function ($, IdUri, CenterGraphElementService, CenterGraphElements, VisitedElementsCloud, UserService, GraphUi) {
    "use strict";
    var api = {};
    api.enter = function () {
        CenterGraphElementService.get(function (elements) {
            GraphUi.getDrawnGraph().addClass("hidden");
            $("body").removeClass("hidden");
            getSectionContainer().removeClass("hidden");
            var centerGraphElements = CenterGraphElements.fromServerFormat(elements);
            if(centerGraphElements.length === 0){
                UserService.getDefaultVertexUri(UserService.authenticatedUserInCache().user_name, function(uri){
                    window.location = IdUri.htmlUrlForBubbleUri(uri);
                });
                return;
            }
            if(centerGraphElements.length === 1){
                window.location = IdUri.htmlUrlForBubbleUri(centerGraphElements[0].getUri());
                return;
            }
            VisitedElementsCloud.buildFromElementsInContainer(
                centerGraphElements,
                getWordsContainer()
            );
        });
    };
    return api;
    function getSectionContainer(){
        return $("#word-cloud-container");
    }
    function getWordsContainer() {
        return $("#word-cloud");
    }
});
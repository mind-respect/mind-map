/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_modal_menu",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.graph_service",
    "triple_brain.graph_compare",
    "triple_brain.id_uri",
    "triple_brain.sub_graph",
    "triple_brain.graph_element_ui",
    "jquery.triple_brain.search"
], function ($, GraphModalMenu, EventBus, GraphDisplayer, UserMapAutocompleteProvider, GraphService, GraphCompare, IdUri, SubGraph, GraphElementUi) {
    "use strict";
    var api = {};
    var compareModal;
    api.enter = function () {
        compareModal = GraphModalMenu.forModalId(
            "compare-modal"
        ).show();
        getSearchInput().empty();
    };
    api._enterComparisonWithGraph = function (graph) {
        getCompareFlowWarning().removeClass("hidden");
        getLoadingSection().addClass("hidden");
        var comparison = GraphCompare.withOtherGraph(
            graph
        );
        comparison.show();
        compareModal.hide();
        var username = IdUri.usernameFromUri(
            graph.getAnyUri()
        );
        getUserAllCentralAnchor().text(
            username
        ).attr(
            "href",
            IdUri.allCentralUrlForUsername(username)
        );
        getQuitFlowButton().click(function (event) {
            event.preventDefault();
            api._quit();
        });
    };
    api._quit = function(){
        getCompareFlowWarning().addClass("hidden");
        GraphElementUi.visitAll(function(graphElementUi){
            graphElementUi.quitComparison();
        });
    };
    EventBus.subscribe("/event/ui/graph/drawn", setupSearch);
    EventBus.subscribe(
        '/event/ui/graph/vertex_and_relation/added/',
        function(event, triple){
            triple.edge().setAsComparisonSuggestionToRemove();
            triple.destinationVertex().setAsComparisonSuggestionToRemove();
        }
    );
    function setupSearch() {
        getSearchInput().tripleBrainAutocomplete({
            select: function (event, ui) {
                GraphService.getForCentralVertexUriAtDepth(
                    ui.item.uri,
                    GraphDisplayer.getVertexSelector().centralVertex().getDeepestChildDistance()
                ).then(function (otherGraph) {
                    api._enterComparisonWithGraph(
                        SubGraph.fromServerFormat(otherGraph)
                    );
                });
                getLoadingSection().removeClass("hidden");
            },
            resultsProviders: [
                UserMapAutocompleteProvider.toFetchPublicAndUserVerticesExcept(
                    GraphDisplayer.getVertexSelector().centralVertex()
                )
            ]
        });
    }

    function getLoadingSection() {
        return $("#compare-loading");
    }

    function getSearchInput() {
        return $("#compare-search-input");
    }

    function getCompareFlowWarning() {
        return $("#compare-flow-warning");
    }

    function getUserAllCentralAnchor() {
        return getCompareFlowWarning().find(
            ".user"
        );
    }

    function getQuitFlowButton() {
        return getCompareFlowWarning().find(
            ".quit-flow"
        );
    }

    return api;
});
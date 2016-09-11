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
    "triple_brain.mind_map_info",
    "jquery.triple_brain.search"
], function ($, GraphModalMenu, EventBus, GraphDisplayer, UserMapAutocompleteProvider, GraphService, GraphCompare, IdUri, SubGraph, GraphElementUi, MindMapInfo) {
    "use strict";
    var api = {};
    var compareModal;
    api.enter = function () {
        compareModal = GraphModalMenu.forModalId(
            "compare-modal"
        ).show();
        getSearchInput().empty();
    };
    api._enterComparisonWithBubbleUri = function (uri) {
        GraphService.getForCentralVertexUriAtDepth(
            uri,
            GraphElementUi.getCenterBubble().getDeepestChildDistance()
        ).then(function (otherGraph) {
            api._enterComparisonWithGraphAndCenterUri(
                SubGraph.fromServerFormat(otherGraph),
                uri
            );
        });
        getLoadingSection().removeClass("hidden");
    };
    api._enterComparisonWithGraphAndCenterUri = function (graph, centerUri) {
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
        getOtherUserBubbleLink().attr(
            "href",
            IdUri.htmlUrlForBubbleUri(
                centerUri
            )
        );
        getUserProfileLink().text(
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
    api._quit = function () {
        GraphElementUi.visitAll(function (graphElementUi) {
            graphElementUi.quitComparison();
        });
        getCompareFlowWarning().addClass("hidden");
    };
    EventBus.subscribe("/event/ui/graph/drawn", setup);
    EventBus.subscribe(
        '/event/ui/graph/vertex_and_relation/added/',
        function (event, triple) {
            if (!MindMapInfo.isInCompareMode()) {
                return;
            }
            triple.edge().setAsComparisonSuggestionToRemove();
            triple.destinationVertex().setAsComparisonSuggestionToRemove();
        }
    );
    function setup() {
        setupDefaultCompare();
        setupSearch();
    }

    function setupDefaultCompare() {
        var centerVertex = GraphElementUi.getCenterVertexOrSchema();
        var centerVertexGraphElementIdentifier = centerVertex.getModel().getFirstIdentificationToAGraphElement();
        if (!centerVertexGraphElementIdentifier) {
            return;
        }
        getCompareWithDefaultButton().click(function (event) {
            event.preventDefault();
            api._enterComparisonWithBubbleUri(
                centerVertexGraphElementIdentifier.getExternalResourceUri()
            );
        });
        getDefaultCompareUserContainer().text(
            IdUri.usernameFromUri(
                centerVertexGraphElementIdentifier.getExternalResourceUri()
            )
        );
        getDefaultLabelContainer().text(
            centerVertexGraphElementIdentifier.getLabel()
        );
        getCompareWithDefaultSection().removeClass(
            "hidden"
        );
    }

    function setupSearch() {
        getSearchInput().tripleBrainAutocomplete({
            select: function (event, ui) {
                api._enterComparisonWithBubbleUri(ui.item.uri);
            },
            resultsProviders: [
                UserMapAutocompleteProvider.toFetchPublicAndUserVerticesExcept(
                    GraphElementUi.getCenterVertexOrSchema()
                )
            ]
        });
    }

    function getCompareWithDefaultSection() {
        return $("#compare-with-default-section");
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

    function getUserProfileLink() {
        return getCompareFlowWarning().find(
            ".user"
        );
    }

    function getOtherUserBubbleLink() {
        return getCompareFlowWarning().find(
            ".other-user-bubble"
        );
    }

    function getQuitFlowButton() {
        return getCompareFlowWarning().find(
            ".quit-flow"
        );
    }

    function getCompareWithDefaultButton() {
        return getCompareWithDefaultSection().find("> a");
    }

    function getDefaultLabelContainer() {
        return getCompareWithDefaultSection().find(
            ".default-compare-label"
        );
    }

    function getDefaultCompareUserContainer() {
        return getCompareWithDefaultSection().find(
            ".default-compare-user"
        );
    }


    return api;
});
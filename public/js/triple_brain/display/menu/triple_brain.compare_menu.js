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
    "triple_brain.sub_graph",
    "diff_match_patch",
    "jquery.triple_brain.search"
], function ($, GraphModalMenu, EventBus, GraphDisplayer, UserMapAutocompleteProvider, GraphService, SubGraph) {
    "use strict";
    var api = {};
    var compareModal;
    api.enter = function () {
        compareModal = GraphModalMenu.forModalId(
            "compare-modal"
        ).show();
        getSearchInput().empty();
    };
    EventBus.subscribe("/event/ui/graph/drawn", setupSearch);
    function setupSearch() {
        getSearchInput().tripleBrainAutocomplete({
            select: function (event, ui) {
                GraphService.getForCentralVertexUriAtDepth(
                    ui.item.uri,
                    GraphDisplayer.getVertexSelector().centralVertex().getDeepestChildDistance()
                ).then(function (graph) {
                    api._compareWithGraph(graph);
                    compareModal.hide();
                    getLoadingSection().addClass("hidden");
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

    api._compareWithGraph = function (otherGraph) {
        new GraphCompare(
            SubGraph.fromServerFormat(otherGraph)
        ).doIt();
    };

    function getLoadingSection() {
        return $("#compare-loading");
    }

    function getSearchInput() {
        return $("#compare-search-input");
    }

    function GraphCompare(otherGraph) {
        this.otherGraph = otherGraph;
        this.diffMatchPatch = new diff_match_patch();
    }

    GraphCompare.prototype.doIt = function () {
        var self = this;
        GraphDisplayer.getVertexSelector().visitAllVertices(function (vertexUi) {
            if (vertexUi.hasIdentifications()) {
                var identification = vertexUi.getIdentifications()[0];
                var related = self.otherGraph.getVertexRelatedToIdentification(
                    identification
                );
                if (related) {
                    self.compareLabel(vertexUi, related);
                }
            }
        });
        GraphDisplayer.getEdgeSelector().visitAllEdges(function (edgeUi) {
            if (edgeUi.hasIdentifications()) {
                var identification = edgeUi.getIdentifications()[0];
                var related = self.otherGraph.getEdgeRelatedToIdentification(
                    identification
                );
                if (related) {
                    self.compareLabel(edgeUi, related);
                }
            }
        });
    };
    GraphCompare.prototype.compareLabel = function (originalUi, compared) {
        var difference = this.diffMatchPatch.diff_main(
            originalUi.text(),
            compared.getLabel()
        );
        this.diffMatchPatch.diff_cleanupSemantic(difference);
        this.diffMatchPatch.diff_cleanupEfficiency(difference);
        var textHtml = this.diffMatchPatch.diff_prettyHtml(difference);
        originalUi.setText(textHtml);
    };
    return api;
});
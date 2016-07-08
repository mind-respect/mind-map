/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.mind-map_template",
    "triple_brain.graph_ui",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.edge_service",
    "triple_brain.edge_ui",
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_menu"
], function ($, MindMapTemplate, GraphUi, UserMapAutocompleteProvider, EdgeService, EdgeUi, GraphDisplayer, GraphElementMenu) {
    "use strict";
    var api = {};
    api.ofVertex = function (vertex) {
        return new LinkToFarVertexMenu(
            vertex
        );
    };
    function LinkToFarVertexMenu(vertex) {
        this.sourceVertex = vertex;
    }

    LinkToFarVertexMenu.prototype.create = function () {
        this.html = $(
            MindMapTemplate['link_to_far_vertex_menu'].merge()
        );
        GraphUi.addHtml(this.html);
        var searchBox = this._addSearchBox();
        GraphElementMenu.makeForMenuContentAndGraphElement(
            this.html,
            this.sourceVertex,
            {},
            $.t("vertex.menu.link_to_far_vertex.title_prefix")
        );
        GraphElementMenu.setupAutoCompleteSuggestionZIndex(
            searchBox
        );
        return this;
    };
    LinkToFarVertexMenu.prototype._addSearchBox = function () {
        var searchBox = $(
            "<input type='text' class='link_to_far_vertex_menu form-control'>"
        ).attr(
            "data-i18n",
            "[placeholder]vertex.menu.link_to_far_vertex.title"
        );
        var self = this;
        searchBox.tripleBrainAutocomplete({
            select: function (event, ui) {
                self._selectElementWithUri(ui.item.uri);
            },
            resultsProviders: [
                UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesExcept(
                    this.sourceVertex
                )
            ]
        });
        this.html.append(
            searchBox
        );
        return searchBox.focus();
    };
    LinkToFarVertexMenu.prototype._selectElementWithUri = function (farVertexUri) {
        if(this.sourceVertex.isConnectedToAVertexWithUri(farVertexUri)){
            return;
        }
        this.html.find("input").blur();
        this.html.remove();
        var self = this;
        EdgeService.addToFarVertex(this.sourceVertex, farVertexUri, function () {
            GraphDisplayer.connectVertexToVertexWithUri(
                self.sourceVertex,
                farVertexUri
            );
        });
    };
    return api;
});
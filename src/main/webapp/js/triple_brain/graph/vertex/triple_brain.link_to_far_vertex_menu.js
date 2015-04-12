/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.mind-map_template",
    "triple_brain.ui.graph",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.edge_service",
    "triple_brain.edge_ui",
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_menu"
], function($, MindMapTemplate, GraphUi, UserMapAutocompleteProvider, EdgeService, EdgeUi, GraphDisplayer, GraphElementMenu){
    var api = {};
    api.ofVertex = function(vertex){
        return new LinkToFarVertexMenu(
            vertex
        );
    };
    return api;
    function LinkToFarVertexMenu(vertex){
        var self = this;
        var html;
        this.create = function () {
            html = $(
                MindMapTemplate['link_to_far_vertex_menu'].merge()
            );
            html.data(
                "vertex",
                vertex
            );
            GraphUi.addHtml(html);
            addTitle();
            addSearchBox();
            GraphElementMenu.makeForMenuContentAndGraphElement(
                html,
                vertex
            );
            return self;
        };
        function addTitle(){
            html.append(
                "<h2 data-i18n='vertex.menu.link_to_far_vertex.title'></h2>"
            );
        }
        function addSearchBox(){
            var searchBox = $("<input type='text'>");
            searchBox.tripleBrainAutocomplete({
                select:function (event, ui) {
                    var menu = $(this).closest(
                        '.link-to-far-vertex-menu'
                    );
                    var parentVertex = menu.data(
                        "vertex"
                    );
                    html.find("input").blur();
                    html.remove();
                    var farVertexUri = ui.item.uri;
                    EdgeService.addToFarVertex(parentVertex, farVertexUri, function(){
                            GraphDisplayer.connectVertexToVertexWithUri(
                                parentVertex,
                                farVertexUri
                            );
                    });
                },
                resultsProviders : [
                    UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesExcept(
                        vertex
                    )
                ]
            });
            html.append(
                searchBox
            );
            searchBox.focus();
        }
    }
});
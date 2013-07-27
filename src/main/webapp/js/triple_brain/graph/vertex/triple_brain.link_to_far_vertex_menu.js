/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.mind-map_template",
    "triple_brain.ui.graph",
    "triple_brain.peripheral_menu",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.edge",
    "triple_brain.ui.edge",
    "triple_brain.graph_displayer",
    "triple_brain.ui.vertex"
], function($, MindMapTemplate, GraphUi, PeripheralMenu, UserMapAutocompleteProvider, EdgeService, Edge, GraphDisplayer, Vertex){
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
        var peripheralMenu;
        this.create = function () {
            html = $(
                MindMapTemplate['link_to_far_vertex_menu'].merge()
            );
            html.data(
                "vertex",
                vertex
            );
            GraphUi.addHTML(html);
            addTitle();
            addSearchBox();
            peripheralMenu = PeripheralMenu.peripheralMenuForMenuHtmlAndVertex(
                html,
                vertex
            ).init();
            html.i18n();
            return self;
        };
        this.reEvaluatePosition = function () {
            peripheralMenu.position();
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
                    var menu = $(this).closest('.peripheral-menu');
                    var parentVertex = $(menu).data("vertex");
                    html.find("input").blur();
                    html.remove();
                    var farVertexUri = ui.item.uri;
                    GraphDisplayer.connectVertexToVertexWithUri(
                        parentVertex,
                        farVertexUri,
                        function(drawnTree, farVertex){
                            EdgeService.add(
                                parentVertex,
                                farVertex,
                                function(edgeServerFormatted){
                                    var edge = GraphDisplayer.addEdge(
                                        edgeServerFormatted,
                                        parentVertex,
                                        farVertex
                                    );
                                    GraphDisplayer.integrateEdgesOfServerGraph(
                                        drawnTree
                                    );
                                    Edge.redrawAllEdges();
                                    edge.focus();
                                }
                            );
                        }
                    );

                },
                resultsProviders : [
                    UserMapAutocompleteProvider.toFetchOnlyCurrentUserVertices()
                ]
            });
            html.append(
                searchBox
            );
            searchBox.focus();
        }
    }
});
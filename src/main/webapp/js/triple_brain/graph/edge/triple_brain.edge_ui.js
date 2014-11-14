/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
        "jquery",
        "triple_brain.ui.graph",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer",
        "triple_brain.identified_bubble",
        "triple_brain.edge_service",
        "triple_brain.graph_element_button",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_ui"
    ],
    function ($, GraphUi, EventBus, GraphDisplayer, IdentifiedBubble, EdgeService, GraphElementButton, SelectionHandler, GraphElementUi) {
        "use strict";
        var api = {},
            cache = {};
        api.getWhenEmptyLabel = function () {
            return $.t("edge.default");
        };
        api.withHtml = function (html) {
            var id = html.prop('id');
            var cachedObject = cache[id];
            if (cachedObject === undefined) {
                cachedObject = new api.Object(html);
                cache[id] = cachedObject;
            }
            return cachedObject;
        };
        api.allEdges = function () {
            var edges = [];
            GraphUi.getDrawnGraph().find(".relation").each(function () {
                edges.push(api.withHtml(
                    $(this)
                ));
            });
            return edges;
        };
        api.visitAllEdges = function (visitor) {
            GraphUi.getDrawnGraph().find(".relation").each(function () {
                visitor(
                    api.withHtml(
                        $(this)
                    )
                )
            });
        };
        api.connectedToVertex = function (vertex) {
            var edgesConnectedToVertex = [];
            var vertexId = vertex.getId();
            api.visitAllEdges(function (edge) {
                var sourceVertexId = $(edge.getHtml()).data(
                    "source_vertex_id"
                );
                var destinationVertexId = $(edge.getHtml()).data(
                    "destination_vertex_id"
                );
                if (vertexId === sourceVertexId || vertexId === destinationVertexId) {
                    edgesConnectedToVertex.push(
                        edge
                    );
                }
            });
            return edgesConnectedToVertex;
        };

        api.Object = function (html) {
            this.html = html;
            IdentifiedBubble.Object.apply(this, [html]);
        };
        api.Object.prototype = new IdentifiedBubble.Object;

        api.Object.prototype.getMenuHtml = function () {
            return this.html.find('.relation-menu');
        };
        api.Object.prototype.getGraphElementType = function () {
            return GraphElementUi.Types.Relation;
        };
        api.Object.prototype.serverFacade = function () {
            return EdgeService;
        };
        api.Object.prototype.getDestinationVertex = function () {
            return GraphDisplayer.getVertexSelector().withId(
                this.html.data('destination_vertex_id')
            );
        };
        api.Object.prototype.getSourceVertex = function () {
            return GraphDisplayer.getVertexSelector().withId(
                this.html.data("source_vertex_id")
            );
        };
        api.Object.prototype.inverseAbstract = function () {
            var sourceVertexUri = this.html.data("source_vertex_id");
            var destinationVertexUri = this.html.data("destination_vertex_id");
            this.html.data(
                "source_vertex_id",
                destinationVertexUri
            );
            this.html.data(
                "destination_vertex_id",
                sourceVertexUri
            );
        };
        api.Object.prototype.impactOnRemovedIdentification = function () {
        };
        api.Object.prototype.integrateIdentification = function () {
        };
        api.Object.prototype.serverFacade = function () {
            return EdgeService;
        };

        api.Object.prototype.remove = function () {
            SelectionHandler.removeRelation(this);
            this.html.remove();
        };
        api.Object.prototype.showMenu = function () {
            this.getMenuHtml().show();
        };
        api.Object.prototype.hideMenu = function () {
            this.getMenuHtml().hide();
        };
        api.Object.prototype.getHtml = function () {
            return this.html;
        };

        api.Object.prototype.select = function () {
            this.html.addClass("selected");
        };
        api.Object.prototype.makeSingleSelected = function () {
            this.showMenu();
        };
        api.Object.prototype.deselect = function () {
            this.html.removeClass("selected");
            this.hideMenu();
        };
        api.Object.prototype.isSelected = function () {
            return this.html.hasClass("selected");
        };
        return api;
    }
);

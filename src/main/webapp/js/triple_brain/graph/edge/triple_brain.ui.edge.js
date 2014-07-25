/**
 * Copyright Mozilla Public License 1.1
 */

define([
        "jquery",
        "triple_brain.ui.graph",
        "triple_brain.ui.vertex_and_edge_common",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer",
        "triple_brain.ui.graph_element",
        "triple_brain.edge",
        "triple_brain.graph_element_button",
        "triple_brain.selection_handler"
    ],
    function ($, GraphUi, VertexAndEdgeCommon, EventBus, GraphDisplayer, GraphElementUi, EdgeService, GraphElementButton, SelectionHandler) {
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
            GraphElementUi.Object.apply(this, [html]);
            this.getMenu = function () {
                return html.find('.relation-menu');
            };
            this.getMenuButtonsHtml = function () {
                return this.getMenu().find(
                    ">button"
                );
            };
        };
        api.Object.prototype = new GraphElementUi.Object;
        api.Object.prototype.setUri = function (uri) {
            this.html.data(
                "uri",
                uri
            );
        };
        api.Object.prototype.getUri = function () {
            return this.html.data(
                "uri"
            );
        };
        api.Object.prototype.getGraphElementType = function () {
            return GraphElementUi.types.RELATION;
        };
        api.Object.prototype.serverFacade = function () {
            return EdgeService;
        };
        api.Object.prototype.destinationVertex = function () {
            return GraphDisplayer.getVertexSelector().withId(
                this.html.data('destination_vertex_id')
            );
        };
        api.Object.prototype.sourceVertex = function () {
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
        api.Object.prototype.removeIdentificationCommonBehavior = function () {
            //do nothing
        };
        api.Object.prototype.applyCommonBehaviorForAddedIdentification = function () {
            //do nothing
        };
        api.Object.prototype.serverFacade = function () {
            return EdgeService;
        };
        api.Object.prototype.equalsEdge = function (otherEdge) {
            return this.getId() == otherEdge.getId();
        };
        api.Object.prototype.hasDefaultText = function () {
            return this.getLabel().val() == api.getWhenEmptyLabel();
        };
        api.Object.prototype.applyStyleOfDefaultText = function () {
            this.getLabel().addClass('when-default-graph-element-text');
        };
        api.Object.prototype.removeStyleOfDefaultText = function () {
            this.getLabel().removeClass('when-default-graph-element-text');
        };
        api.Object.prototype.isMouseOver = function () {
            var edgeThatIsMouseOver = GraphUi.getEdgeMouseOver();
            return  edgeThatIsMouseOver !== undefined &&
                edgeThatIsMouseOver.equalsEdge(self);
        };
        api.Object.prototype.remove = function () {
            SelectionHandler.removeRelation(self);
            this.html.remove();
        };
        api.Object.prototype.showMenu = function () {
            this.getMenu().show();
        };
        api.Object.prototype.hideMenu = function () {
            this.getMenu().hide();
        };
        api.Object.prototype.getHtml = function () {
            return this.html;
        };
        api.Object.prototype.visitMenuButtons = function (visitor) {
            $.each(this.getMenuButtonsHtml(), function () {
                visitor(
                    GraphElementButton.fromHtml(
                        $(this)
                    )
                );
            });
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


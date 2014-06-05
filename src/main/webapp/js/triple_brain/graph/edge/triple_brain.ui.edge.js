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
    function ($, GraphUi, VertexAndEdgeCommon, EventBus, GraphDisplayer, GraphElement, EdgeService, GraphElementButton, SelectionHandler) {
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
                ;
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
            $.each(api.allEdges(), function () {
                var edge = this;
                return visitor(edge);
            });
        };
        api.drawAllEdges = function () {
            drawEdges(false);
        };
        api.redrawAllEdges = function () {
            drawEdges(true);
            EventBus.publish(
                "/event/ui/graph/edges/redrawn"
            );
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

        function drawEdges(recalculate) {
            var edges = api.allEdges();
            for (var i = 0; i < edges.length; i++) {
                edges[i].redraw(
                    recalculate
                );
            }
        }

        api.Object = function (html) {
            var self = this;
            GraphElement.Object.apply(self, [html]);
            this.id = function () {
                return $(html).attr('id');
            };
            this.setUri = function (uri) {
                html.data(
                    "uri",
                    uri
                );
            };
            this.getUri = function () {
                return html.data(
                    "uri"
                );
            };
            this.redraw = function (recalculate) {
                var arrowLine;
                if (recalculate) {
                    self.arrowLine().remove();
                    arrowLine = GraphDisplayer.getEdgeDrawer().ofEdge(
                        GraphDisplayer.getEdgeSelector().ofEdge(
                            self
                        )
                    );
                    self.setArrowLine(arrowLine);
                }
                self.arrowLine().drawInBlackWithSmallLineWidth();
                self.centerOnArrowLine();
            };
            this.getGraphElementType = function () {
                return GraphElement.types.RELATION;
            };
            this.serverFacade = function () {
                return EdgeService;
            };
            this.destinationVertex = function () {
                return GraphDisplayer.getVertexSelector().withId(
                    html.data('destination_vertex_id')
                );
            };
            this.sourceVertex = function () {
                return GraphDisplayer.getVertexSelector().withId(
                    html.data("source_vertex_id")
                );
            };
            this.inverseAbstract = function () {
                var sourceVertexUri = html.data("source_vertex_id");
                var destinationVertexUri = html.data("destination_vertex_id");
                html.data(
                    "source_vertex_id",
                    destinationVertexUri
                );
                html.data(
                    "destination_vertex_id",
                    sourceVertexUri
                );
                self.redraw(true);
            };
            this.arrowLine = function () {
                return html.data("arrowLine");
            };
            this.setArrowLine = function (arrowLine) {
                html.data("arrowLine", arrowLine);
            };
            this.removeIdentificationCommonBehavior = function () {
                //do nothing
            };
            this.applyCommonBehaviorForAddedIdentification = function () {
                //do nothing
            };
            this.serverFacade = function () {
                return EdgeService;
            };
            this.centerOnArrowLine = function () {
                self.positionAt(
                    this.arrowLine().middlePoint()
                );
            };
            this.positionAt = function (position) {
                html.css('left', position.x);
                html.css('top', position.y);
            };
            this.equalsEdge = function (otherEdge) {
                return self.getId() == otherEdge.getId();
            };
            this.hasDefaultText = function () {
                return self.getLabel().val() == api.getWhenEmptyLabel();
            };
            this.applyStyleOfDefaultText = function () {
                self.getLabel().addClass('when-default-graph-element-text');
            };
            this.removeStyleOfDefaultText = function () {
                self.getLabel().removeClass('when-default-graph-element-text');
            };
            this.isMouseOver = function () {
                var edgeThatIsMouseOver = GraphUi.getEdgeMouseOver();
                return  edgeThatIsMouseOver !== undefined &&
                    edgeThatIsMouseOver.equalsEdge(self);
            };
            this.remove = function () {
                SelectionHandler.removeRelation(self);
                self.arrowLine().remove();
                html.remove();
            };
            this.showMenu = function () {
                getMenu().show();
            };
            this.hideMenu = function () {
                getMenu().hide();
            };
            this.getHtml = function () {
                return html;
            };
            this.visitMenuButtons = function (visitor) {
                $.each(getMenuButtonsHtml(), function () {
                    visitor(
                        GraphElementButton.fromHtml(
                            $(this)
                        )
                    );
                });
            };
            this.select = function () {
                html.addClass("selected");
            };
            this.makeSingleSelected = function(){
                self.showMenu();
            };
            this.deselect = function () {
                html.removeClass("selected");
                self.hideMenu();
            };
            this.isSelected = function () {
                return html.hasClass("selected");
            };
            function getMenu() {
                return html.find('.relation-menu');
            }

            function getMenuButtonsHtml() {
                return getMenu().find(
                    ">button"
                );
            }
        };
        return api;
    }
)
;


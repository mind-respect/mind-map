/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain/mind_map/desktop/triple_brain.ui.graph",
    "triple_brain/mind_map/desktop/triple_brain.ui.vertex_and_edge_common",
    "triple_brain/triple_brain.event_bus",
    "triple_brain/mind_map/desktop/edge/triple_brain.ui.edge_creator"
],
    function (require, $, Graph, VertexAndEdgeCommon, EventBus, EdgeCreator) {
        var api = {};

        api.EMPTY_LABEL = "a property";

        api.withHtml = function (Html) {
            return new Edge(Html);
        };
        api.allEdges = function () {
            var edges = new Array();
            $(".edge").each(function () {
                edges.push(api.withHtml(this));
            });
            return edges;
        };
        api.redrawAllEdges = function () {
            Graph.removeAllArrowLines();
            var edges = api.allEdges();
            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                var graphCanvasContext = Graph.canvasContext();
                var black = "#000000";
                graphCanvasContext.strokeStyle = black;
                edge.arrowLine().drawInContext(graphCanvasContext);
                edge.centerOnArrowLine();
            }
        };
        api.onMouseOver = function () {
            var edge = api.withHtml(this);
            edge.highlight();
            edge.showMenu();
        };
        api.onMouseOut = function () {
            var edge = api.withHtml(this);
            if (!edge.isTextFieldInFocus()) {
                edge.unhighlight();
            }
            edge.hideMenu();
        };

        function Edge(html) {
            var Vertex = require("triple_brain/mind_map/desktop/vertex/triple_brain.ui.vertex");
            var thisEdge = this;

            this.id = function () {
                return $(html).attr('id');
            }
            this.destinationVertex = function () {
                return Vertex.withId($(html).attr('destination-vertex-id'));
            }
            this.sourceVertex = function () {
                return Vertex.withId($(html).attr('source-vertex-id'));
            }
            this.arrowLine = function () {
                return $(html).data("arrowLine");
            }
            this.setArrowLine = function (arrowLine) {
                $(html).data("arrowLine", arrowLine);
            }
            this.highlight = function () {
                $(html).addClass('highlighted-edge');
                this.addEdgeSurroundColor("#FFFF00", 4);
            }
                this.unhighlight = function () {
                    $(html).removeClass('highlighted-edge');
                    this.addEdgeSurroundColor("#FFFFFF", 5);
                }
                this.addEdgeSurroundColor = function (color, width) {
                    var graphCanvasContext = Graph.canvasContext();
                    graphCanvasContext.lineWidth = width;
                    graphCanvasContext.strokeStyle = color;
                    this.arrowLine().drawInContext(graphCanvasContext);
                    graphCanvasContext.lineWidth = 1;
                    graphCanvasContext.strokeStyle = "#333";
                    this.arrowLine().drawInContext(graphCanvasContext);
                }
                this.isTextFieldInFocus = function () {
                    return $(label()).is(":focus")
                }
            this.focus = function () {
                $(label()).focus();
            }
            this.setText = function (text) {
                $(label()).val(text);
            }
            this.text = function () {
                return $(label()).val();
            }
            this.centerOnArrowLine = function () {
                var arrowLineMiddlePoint = this.arrowLine().middlePoint();
                $(html).css('left', arrowLineMiddlePoint.x);
                $(html).css('top', arrowLineMiddlePoint.y);
            }
            this.isConnectedWithVertex = function (vertex) {
                return isSourceVertex(vertex) ||
                    isDestinationVertex(vertex);
            }
            this.hasDefaultText = function () {
                return $(label()).val() == api.EMPTY_LABEL;
            }
            this.applyStyleOfDefaultText = function () {
                $(label()).addClass('when-default-graph-element-text');
            }
            this.removeStyleOfDefaultText = function () {
                $(label()).removeClass('when-default-graph-element-text');
            }
            this.readjustLabelWidth = function () {
                VertexAndEdgeCommon.adjustTextFieldWidthToNumberOfChars(
                    label()
                );
                this.adjustWidth();
            }
            this.adjustWidth = function () {
                var intuitiveWidthBuffer = 14;
                $(html).css(
                    "width",
                    $(menu()).width()
                        + $(label()).width()
                        + intuitiveWidthBuffer +
                        "px"
                );
            }
            this.isMouseOver = function () {
                return $("#" + thisEdge.id() + ":hover").size() > 0;
            }
            this.remove = function () {
                $(html).remove();
            }
            this.showMenu = function () {
                $(menu()).show();
            }
            this.hideMenu = function () {
                $(menu()).hide();
            }
            function menu() {
                return $(html).find('.remove');
            }

            function label() {
                return $(html).find("input[type='text']");
            }

            function isSourceVertex(vertex) {
                return thisEdge.sourceVertex().getId() == vertex.getId()
            }

            function isDestinationVertex(vertex) {
                return thisEdge.destinationVertex().getId() == vertex.getId()
            }
        }

        EventBus.subscribe(
            '/event/ui/graph/relation/deleted',
            function (event, edge) {
                edge.remove();
                api.redrawAllEdges();
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/relation/added/',
            function (event, newEdgeJSON) {
                var edgeCreator = EdgeCreator.withArrayOfJsonHavingAbsolutePosition(newEdgeJSON);
                var edge = edgeCreator.create();
                edge.focus();
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/edge/label/updated',
            function (event, edge) {
                VertexAndEdgeCommon.highlightLabel(edge.id());
            }
        );
        return api;
    }
)
;


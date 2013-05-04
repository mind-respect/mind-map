/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.event_bus",
    "triple_brain.ui.arrow_line"
],
    function (require, $, GraphUi, VertexAndEdgeCommon, EventBus, ArrowLine) {
        var api = {};
        api.EMPTY_LABEL = "a property";
        api.withHtml = function (Html) {
            return new api.Object(Html);
        };
        api.allEdges = function () {
            var edges = new Array();
            $(".relation").each(function () {
                edges.push(api.withHtml(this));
            });
            return edges;
        };
        api.visitAllEdges = function (visitor) {
            $.each(api.allEdges(), function(){
                var edge = this;
                return visitor(edge);
            });
        };
        api.drawAllEdges = function () {
            drawEdges(false);
        };
        api.redrawAllEdges = function(){
            drawEdges(true);
        };
        api.connectedToVertex = function(vertex){
            var edgesConnectedToVertex = [];
            var vertexId = vertex.getId();
            api.visitAllEdges(function(edge){
                var sourceVertexId = $(edge.getHtml()).data(
                    "source_vertex_id"
                );
                var destinationVertexId = $(edge.getHtml()).data(
                    "destination_vertex_id"
                );
                if(vertexId === sourceVertexId || vertexId === destinationVertexId){
                    edgesConnectedToVertex.push(
                        edge
                    );
                }
            });
            return edgesConnectedToVertex;
        };

        function drawEdges(recalculate){
            var edges = api.allEdges();
            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                var arrowLine;
                if(recalculate){
                    edge.arrowLine().remove();
                    arrowLine = ArrowLine.ofSourceAndDestinationVertex(
                        edge.sourceVertex(),
                        edge.destinationVertex()
                    );
                    edge.setArrowLine(arrowLine);
                }
                edge.arrowLine().drawInBlackWithSmallLineWidth();
                edge.centerOnArrowLine();
            }
        }

        api.Object = function (html) {
            var Vertex;
            var thisEdge = this;

            this.id = function () {
                return $(html).attr('id');
            };
            this.setUri = function(uri){
                $(html).data(
                    "uri",
                    uri
                );
            };
            this.getUri = function(){
                return $(html).data(
                    "uri"
                );
            }
            this.destinationVertex = function () {
                return getVertex().withId(
                    $(html).data('destination_vertex_id')
                );
            };
            this.sourceVertex = function () {
                return getVertex().withId(
                    $(html).data("source_vertex_id")
                );
            };
            this.arrowLine = function () {
                return $(html).data("arrowLine");
            };
            this.setArrowLine = function (arrowLine) {
                $(html).data("arrowLine", arrowLine);
            };
            this.highlight = function () {
                $(html).addClass('highlighted-edge');
                this.addEdgeSurroundColor("#FFFF00", 4);
            };
            this.unhighlight = function () {
                $(html).removeClass('highlighted-edge');
                this.arrowLine().remove();
                this.arrowLine().drawInBlackWithSmallLineWidth();
            };
            this.addEdgeSurroundColor = function (color, width) {
                this.arrowLine().drawInYellowWithBigLineWidth();
                this.arrowLine().drawInBlackWithSmallLineWidth();
            };
            this.isTextFieldInFocus = function () {
                return $(label()).is(":focus")
            };
            this.focus = function () {
                $(label()).focus();
            };
            this.centerOnArrowLine = function () {
                thisEdge.positionAt(
                    this.arrowLine().middlePoint()
                );
            };
            this.positionAt = function(position){
                $(html).css('left', position.x);
                $(html).css('top', position.y);
            };
            this.isConnectedWithVertex = function (vertex) {
                return isSourceVertex(vertex) ||
                    isDestinationVertex(vertex);
            };
            this.equalsEdge = function (otherEdge) {
                return thisEdge.getId() == otherEdge.getId();
            };
            this.hasDefaultText = function () {
                return $(label()).val() == api.EMPTY_LABEL;
            };
            this.applyStyleOfDefaultText = function () {
                $(label()).addClass('when-default-graph-element-text');
            };
            this.removeStyleOfDefaultText = function () {
                $(label()).removeClass('when-default-graph-element-text');
            };
            this.readjustLabelWidth = function () {
                VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                    label()
                );
                this.adjustWidth();
            };
            this.adjustWidth = function () {
                var intuitiveWidthBuffer = 14;
                $(html).css(
                    "width",
                    $(menu()).width()
                        + $(label()).width()
                        + intuitiveWidthBuffer +
                        "px"
                );
            };
            this.isMouseOver = function () {
                var edgeThatIsMouseOver = GraphUi.getEdgeMouseOver();
                return  edgeThatIsMouseOver !== undefined &&
                    edgeThatIsMouseOver.equalsEdge(thisEdge);
            };
            this.remove = function () {
                thisEdge.arrowLine().remove();
                $(html).remove();
            };
            this.showMenu = function () {
                $(menu()).show();
            };
            this.hideMenu = function () {
                $(menu()).hide();
            };
            this.getHtml = function(){
                return html;
            };
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

            function getVertex(){
                if(Vertex === undefined){
                    Vertex = require("triple_brain.ui.vertex");
                }
                return Vertex;
            }
        }

        EventBus.subscribe(
            '/event/ui/graph/relation/deleted',
            function (event, edge) {
                edge.remove();
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


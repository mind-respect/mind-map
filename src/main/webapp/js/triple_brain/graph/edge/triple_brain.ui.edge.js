/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.event_bus",
    "triple_brain.ui.arrow_line",
    "triple_brain.ui.graph_element",
    "triple_brain.edge"
],
    function (require, $, GraphUi, VertexAndEdgeCommon, EventBus, ArrowLine, GraphElement, EdgeService) {
        var api = {};
        api.getWhenEmptyLabel = function(){
            return $.t("edge.default");
        };
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
        api.removeAllArrowLines = function(){
            api.visitAllEdges(function(edge){
                edge.arrowLine().remove();
            });
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
            var self = this;
            html = $(html);
            GraphElement.Object.apply(self, [html]);
            this.id = function () {
                return $(html).attr('id');
            };
            this.setUri = function(uri){
                html.data(
                    "uri",
                    uri
                );
            };
            this.getUri = function(){
                return html.data(
                    "uri"
                );
            };
            this.getGraphElementType = function(){
                return GraphElement.types.RELATION;
            };
            this.serverFacade = function(){
                return EdgeService;
            };
            this.destinationVertex = function () {
                return getVertex().withId(
                    html.data('destination_vertex_id')
                );
            };
            this.sourceVertex = function () {
                return getVertex().withId(
                    html.data("source_vertex_id")
                );
            };
            this.arrowLine = function () {
                return html.data("arrowLine");
            };
            this.setArrowLine = function (arrowLine) {
                html.data("arrowLine", arrowLine);
            };
            this.removeIdentificationCommonBehavior = function(){
                //do nothing
            };
            this.applyCommonBehaviorForAddedIdentification = function(){
                //do nothingt
            };
            this.serverFacade = function(){
                return EdgeService;
            };
            this.highlight = function () {
                html.addClass('highlighted-edge');
                this.addEdgeSurroundColor("#FFFF00", 4);
            };
            this.unhighlight = function () {
                html.removeClass('highlighted-edge');
                this.arrowLine().remove();
                this.arrowLine().drawInBlackWithSmallLineWidth();
            };
            this.addEdgeSurroundColor = function (color, width) {
                this.arrowLine().drawInYellowWithBigLineWidth();
                this.arrowLine().drawInBlackWithSmallLineWidth();
            };
            this.isTextFieldInFocus = function () {
                return self.getLabel().is(":focus")
            };
            this.centerOnArrowLine = function () {
                self.positionAt(
                    this.arrowLine().middlePoint()
                );
            };
            this.positionAt = function(position){
                html.css('left', position.x);
                html.css('top', position.y);
            };
            this.isConnectedWithVertex = function (vertex) {
                return isSourceVertex(vertex) ||
                    isDestinationVertex(vertex);
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
            this.adjustWidth = function () {
                var intuitiveWidthBuffer = 14;
                html.css(
                    "width",
                    $(menu()).width()
                        + self.getLabel().width()
                        + intuitiveWidthBuffer +
                        "px"
                );
            };
            this.isMouseOver = function () {
                var edgeThatIsMouseOver = GraphUi.getEdgeMouseOver();
                return  edgeThatIsMouseOver !== undefined &&
                    edgeThatIsMouseOver.equalsEdge(self);
            };
            this.remove = function () {
                self.arrowLine().remove();
                html.remove();
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
                return html.find('.remove');
            }

            function isSourceVertex(vertex) {
                return self.sourceVertex().getId() == vertex.getId()
            }

            function isDestinationVertex(vertex) {
                return self.destinationVertex().getId() == vertex.getId()
            }

            function getVertex(){
                if(Vertex === undefined){
                    Vertex = require("triple_brain.ui.vertex");
                }
                return Vertex;
            }
        };

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


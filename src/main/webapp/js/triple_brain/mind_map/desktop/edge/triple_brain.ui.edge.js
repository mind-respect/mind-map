/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.edge == undefined) {

    triple_brain.ui.edge = {

        EMPTY_LABEL: "a property",

        withHtml : function(Html){
            return new Edge(Html);
        },
        allEdges : function(){
            var edges = new Array();
            $(".edge").each(function() {
                edges.push(triple_brain.ui.edge.withHtml(this));
            });
            return edges;
        },
        redrawAllEdges : function(){
            triple_brain.ui.graph.clear();
            var edges = triple_brain.ui.edge.allEdges();
            for(var i = 0 ; i < edges.length; i++){
                var edge = edges[i];
                var graphCanvasContext = triple_brain.ui.graph.canvasContext();
                var black = "#000000";
                graphCanvasContext.strokeStyle = black;
                edge.arrowLine().drawInContext(graphCanvasContext);
                edge.centerOnArrowLine();
            }
        },
        onMouseOver : function(){
            var edge = triple_brain.ui.edge.withHtml(this);
            edge.highlight();
        },
        onMouseOut: function(){
            var edge = triple_brain.ui.edge.withHtml(this);
            if(!edge.isTextFieldInFocus()){
                edge.unhighlight();
            }
        }
    }

    function Edge(html){
        var thisEdge = this;

        this.id = function(){
            return $(html).attr('id');
        }
        this.destinationVertex = function(){
            return triple_brain.ui.vertex.withId($(html).attr('destination-vertex-id'));
        }
        this.sourceVertex = function(){
            return triple_brain.ui.vertex.withId($(html).attr('source-vertex-id'));
        }
        this.arrowLine = function(){
            return $(html).data("arrowLine");
        }
        this.setArrowLine = function(arrowLine){
            $(html).data("arrowLine", arrowLine);
        }
        this.highlight = function(){
            $(html).addClass('highlighted-edge');
            this.addEdgeSurroundColor("#FFFF00", 4);
        },
        this.unhighlight = function(){
            $(html).removeClass('highlighted-edge');
            this.addEdgeSurroundColor("#FFFFFF", 5);
        },
        this.addEdgeSurroundColor = function (color, width) {
            var graphCanvasContext = triple_brain.ui.graph.canvasContext();
            graphCanvasContext.lineWidth = width;
            graphCanvasContext.strokeStyle = color;
            this.arrowLine().drawInContext(graphCanvasContext);
            graphCanvasContext.lineWidth = 1;
            graphCanvasContext.strokeStyle = "#333";
            this.arrowLine().drawInContext(graphCanvasContext);
        },
        this.isTextFieldInFocus = function(){
            return $(label()).is(":focus")
        }
        this.focus = function(){
            $(label()).focus();
        }
        this.setText = function(text){
            $(label()).val(text);
        }
        this.text = function(){
            return $(label()).val();
        }
        this.centerOnArrowLine = function(){
            var arrowLineMiddlePoint = this.arrowLine().middlePoint();
            $(html).css('left', arrowLineMiddlePoint.x);
            $(html).css('top', arrowLineMiddlePoint.y);
        }
        this.isConnectedWithVertex = function(vertex){
            return isSourceVertex(vertex) ||
                isDestinationVertex(vertex);
        }
        this.hasDefaultText = function(){
            return $(label()).val() == triple_brain.ui.edge.EMPTY_LABEL;
        }
        this.applyStyleOfDefaultText = function(){
            $(label()).addClass('when-default-graph-element-text');
        }
        this.removeStyleOfDefaultText = function(){
            $(label()).removeClass('when-default-graph-element-text');
        }
        this.readjustLabelWidth = function(){
            triple_brain.ui.vertex_and_edge_common.adjustTextFieldWidthToNumberOfChars(
                label()
            );
        }
        this.isMouseOver = function(){
            return $("#" + thisEdge.id() + ":hover").size() > 0;
        }
        this.remove = function(){
            $(html).remove();
        }
        function label(){
            return $(html).find("input[type='text']");
        }
        function isSourceVertex(vertex){
            return thisEdge.sourceVertex().id() == vertex.id()
        }
        function isDestinationVertex(vertex){
            return thisEdge.destinationVertex().id() == vertex.id()
        }
    }

    var eventBus = triple_brain.event_bus;

    eventBus.subscribe(
        '/event/ui/graph/relation/deleted',
        function(event, edge) {
            edge.remove();
            triple_brain.ui.edge.redrawAllEdges();
        }
    );

    eventBus.subscribe(
        '/event/ui/graph/relation/added/',
        function(event, newEdgeJSON) {
            var edgeCreator = triple_brain.ui.edge_creator.withArrayOfJsonHavingAbsolutePosition(newEdgeJSON)
            var edge = edgeCreator.create();
            edge.focus();
        }
    );

    eventBus.subscribe(
        '/event/ui/graph/edge/label/updated',
        function(event, edge) {
            triple_brain.ui.vertex_and_edge_common.highlightLabel(edge.id());
        }
    );
}
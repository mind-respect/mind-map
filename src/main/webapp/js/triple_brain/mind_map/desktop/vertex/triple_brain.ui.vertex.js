/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.vertex == undefined) {
    triple_brain.ui.vertex = {
        EMPTY_LABEL: "a concept",

        withHtml : function(html){
            return new Vertex(html);
        },
        withId : function(id) {
            return triple_brain.ui.vertex.withHtml($("#" + id));
        },
        withUri : function(uri){
            return triple_brain.ui.vertex.withId(
                triple_brain.id_uri.idFromUri(uri)
            );
        },
        centralVertex : function(){
            return triple_brain.ui.vertex.withHtml(
                $('.center-vertex')
            );
        },
        allVertices : function(){
            var vertices = new Array();
            $(".vertex").each(function() {
                vertices.push(triple_brain.ui.vertex.withHtml(this));
            });
            return vertices;
        }
    }

    function Vertex(html){

        var thisVertex = this;

        var segments = triple_brain.ui.vertex_segments.withHTMLVertex(html);
        this.position = function(){
            return triple_brain.point.fromCoordinates(
                $(html).offset().left,
                $(html).offset().top
            );
        };
        this.intersectsWithSegment = function(segment){
            return segments.intersectsWithSegment(segment);
        }
        this.intersectionPointWithSegment = function(segmentToCompare){
            if(!this.intersectsWithSegment(segmentToCompare)){
                throw(
                    triple_brain.error.withName(
                        "no_intersection"
                    )
                );
            }
            return segments.intersectionPointWithSegment(segmentToCompare);
        };
        this.sideClosestToEdge = function(){
            return segments.sideThatIntersectsWithAnotherSegmentUsingMarginOfError(10);
        }
        this.setAsNonCentral = function(){
            $(html).removeClass('center-vertex');
            this.showCenterButton();
        }
        this.setAsCentral = function(){
            var centralVertex = triple_brain.ui.vertex.centralVertex();
            centralVertex.setAsNonCentral()
            $(html).addClass('center-vertex');
            this.hideCenterButton();
        }
        this.buildHiddenNeighborPropertiesIndicator = function(){
          propertiesIndicator = triple_brain.ui.vertex_hidden_neighbor_properties_indicator.withVertex(this);
          propertiesIndicator.build();
        }
        this.width = function(){
            return $(html).width();
        }
        this.height = function(){
            return $(html).height();
        }
        this.centerPoint = function(){
            return triple_brain.point.fromCoordinates(
                $(html).offset().left + $(html).width() / 2,
                $(html).offset().top + $(html).height() / 2
            )
        }
        this.numberOfHiddenConnectedVertices = function(){
            return $(html).data('numberOfHiddenConnectedVertices');
        }
        this.nameOfHiddenProperties = function(){
            return $(html).data('nameOfHiddenProperties');
        }
        this.id = function(){
            return $(html).attr('id');
        }
        this.isMouseOver = function(){
            return $("#"+this.id()+":hover").size() > 0;
        }
        this.hideMenu = function(){
            $(menu()).css("visibility", "hidden");
//            $(menu()).hide();
        }
        this.showMenu = function(){
            $(menu()).css("visibility", "visible");
//            $(menu()).show();
        }
        this.showCenterButton = function(){
            $(centerButton()).hide();
        }
        this.hideCenterButton = function(){
            $(centerButton()).hide();
        }
        this.highlight = function(){
            $(html).addClass('highlighted-vertex');
        }
        this.unhighlight = function(){
            $(html).removeClass('highlighted-vertex');
        }
        this.connectedEdges = function(){
            var connectedHTMLEdges = $(".edge[source-vertex-id="+ thisVertex.id() +"],[destination-vertex-id="+ thisVertex.id() +"]");
            var connectedEdges = new Array();
            for(var i = 0; i < connectedHTMLEdges.length; i++){
                connectedEdges.push(triple_brain.ui.edge.withHtml(connectedHTMLEdges[i]));
            }
            return connectedEdges;
        }
        this.isLabelInFocus = function(){
            return $(this.label()).is(":focus");
        }
        this.focus = function(){
            $(this.label()).focus();
        }
        this.readjustLabelWidth = function(){
            triple_brain.ui.vertex_and_edge_common.adjustTextFieldWidthToNumberOfChars(
                this.label()
            );
            thisVertex.adjustWidth();
        }
        this.text = function(){
            return $(this.label()).val();
        }
        this.hasDefaultText = function(){
            return $(this.label()).val() == triple_brain.ui.vertex.EMPTY_LABEL;
        }
        this.applyStyleOfDefaultText = function(){
            $(this.label()).addClass('when-default-graph-element-text');
        }
        this.removeStyleOfDefaultText = function(){
            $(this.label()).removeClass('when-default-graph-element-text');
        }
        this.isMouseOverLabel = function(){
            return $(html).find("input[type='text']:hover").size() > 0;
        }
        this.isMouseOverMoveButton= function(){
            return $(html).find(".move:hover").size() > 0;
        }
        this.isCenterVertex = function(){
            return $(html).hasClass("center-vertex");
        }
        this.removeConnectedEdges = function(){
            var connectedEdges = this.connectedEdges();
            for(var i = 0 ; i < connectedEdges.length; i++){
                connectedEdges[i].remove();
            }
            triple_brain.ui.edge.redrawAllEdges();
        },
        this.remove = function(){
            $(html).remove();
        }
        this.suggestions = function(){
            return $(html).data('suggestions');
        }
        this.setSuggestions = function(suggestions){
            $(html).data('suggestions', suggestions);
        }
        this.showSuggestionButton = function(){
            $(suggestionButton()).show();
        }
        this.label = function(){
            return $(html).find(".label");
        }
        this.equalsVertex = function(otherVertex){
            return thisVertex.id() == otherVertex.id();
        }
        this.setNumberOfHiddenConnectedVertices = function(numberOfHiddenConnectedVertices){
            $(html).data('numberOfHiddenConnectedVertices', numberOfHiddenConnectedVertices);
        }
        this.setNameOfHiddenProperties = function(nameOfHiddenProperties){
            $(html).data('nameOfHiddenProperties', nameOfHiddenProperties);
        }
        this.numberOfEdgesFromCentralVertex = function(){
            return $(html).data('numberOfEdgesFromCentralVertex');
        }
        this.setNumberOfEdgesFromCentralVertex = function(numberOfEdgesFromCentralVertex){
            $(html).data('numberOfEdgesFromCentralVertex', numberOfEdgesFromCentralVertex);
        }
        this.scrollTo = function(){
            var position = thisVertex.position();
            window.scroll(
                position.x - screen.width / 2,
                position.y - screen.height / 4
            );
        }
        this.adjustWidth = function(){
            var intuitiveWeightBuffer = 7;
            $(html).css(
                "width",
                $(menu()).width()
                    + $(this.label()).width()
                    + intuitiveWeightBuffer+
                    "px"
            );
        }
        function suggestionButton(){
            return $(html).find('.suggestion');
        }
        function moveButton(){
            return $(html).find('.move');
        }
        function menu(){
            return $(html).find('.menu');
        }
        function centerButton(){
            return $(html).find('.center');
        }
    }

    var eventBus = triple_brain.event_bus;

    eventBus.subscribe(
        '/event/ui/graph/vertex/label/updated',
        function(event, vertex) {
            triple_brain.ui.vertex_and_edge_common.highlightLabel(
                vertex.id()
            );
        }
    );

    eventBus.subscribe(
        '/event/ui/graph/vertex/deleted/',
        function(event, vertex) {
            vertex.removeConnectedEdges();
            vertex.remove();
        }
    );

    eventBus.subscribe(
        '/event/ui/graph/vertex_and_relation/added/',
        function(event, statementNewRelation, newVertexPosition) {
            var sourceVertex = triple_brain.ui.vertex.withId(
                triple_brain.id_uri.idFromUri(
                    statementNewRelation.subject_id
                )
            );
            var destinationVertexId = statementNewRelation.object_id;
            var edgeId = statementNewRelation.predicate_id;

            var vertexJSON = {};
            vertexJSON.id = destinationVertexId;
            vertexJSON.label = triple_brain.ui.vertex.EMPTY_LABEL;
            vertexJSON.position= {};
            vertexJSON.position.x = newVertexPosition.x;
            vertexJSON.position.y = newVertexPosition.y;

            vertexJSON.min_number_of_edges_from_center_vertex = sourceVertex.numberOfEdgesFromCentralVertex() + 1;

            var destinationVertex = triple_brain.ui.vertex_creator.withArrayOfJsonHavingAbsolutePosition(vertexJSON).create();

            var typeUri = statementNewRelation.object_type_uri;
            if(typeUri != undefined){
                triple_brain.vertex.updateType(destinationVertex, typeUri);
            }

            var edgeJSON = {};
            edgeJSON.id = edgeId;
            var arrowLine = triple_brain.ui.arrow_line.ofSourceAndDestinationVertex(
                sourceVertex,
                destinationVertex
            );
            edgeJSON.arrowLineStartPoint = arrowLine.segment().startPoint;
            edgeJSON.arrowLineEndPoint = arrowLine.segment().endPoint;
            edgeJSON.source_vertex_id = statementNewRelation.subject_id;
            edgeJSON.destination_vertex_id = statementNewRelation.object_id;
            edgeJSON.label = triple_brain.ui.edge.EMPTY_LABEL;
            var edge = triple_brain.ui.edge_creator.withArrayOfJsonHavingAbsolutePosition(edgeJSON).create();
            if(statementNewRelation.predicate_label != undefined){
                edge.setText(statementNewRelation.predicate_label);
                triple_brain.edge.updateLabel(edge, edge.text());
            }
            destinationVertex.focus();
        }
    );
}
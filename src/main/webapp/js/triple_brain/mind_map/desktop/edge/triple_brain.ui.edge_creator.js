/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain/mind_map/desktop/triple_brain.ui.graph",
    "triple_brain/mind_map/desktop/triple_brain.template",
    "triple_brain/triple_brain.id_uri",
    "triple_brain/mind_map/desktop/triple_brain.ui.vertex_and_edge_common",
    "triple_brain/mind_map/triple_brain.edge",
    "triple_brain/mind_map/desktop/edge/triple_brain.ui.arrow_line",
    "triple_brain/triple_brain.event_bus",
    "triple_brain/mind_map/triple_brain.segment"
],
    function(require, $, Graph, Template, IdUriUtils, VertexAndEdgeCommon, EdgeService, ArrowLine, EventBus, Segment){
        var api = {};
        api.createWithArrayOfJsonHavingRelativePosition = function(jsonArray){
            $.each(jsonArray, function(){
                var json = this;
                json.arrowLineStartPoint = json.arrow_line_bezier_points[0];
                json.arrowLineEndPoint = json.arrow_line_bezier_points[3];
                api.withArrayOfJsonHavingRelativePosition(
                    json
                ).create();
            });
        };
        api.withArrayOfJsonHavingAbsolutePosition = function(json){
            return new EdgeCreator(json);
        };
        api.withArrayOfJsonHavingRelativePosition = function(json){
            api.addGraphOffsetToJsonPosition(json);
            return new EdgeCreator(json);
        };
        api.addGraphOffsetToJsonPosition = function(json){
            var graphOffset = Graph.offset();
            json.arrowLineStartPoint.x += graphOffset.x;
            json.arrowLineStartPoint.y += graphOffset.y ;
            json.arrowLineEndPoint.x += graphOffset.x;
            json.arrowLineEndPoint.y += graphOffset.y;
        };

        function EdgeCreator(json){
            var Edge = require("triple_brain/mind_map/desktop/edge/triple_brain.ui.edge");
            json.id = IdUriUtils.graphElementIdFromUri(json.id);
            json.source_vertex_id = IdUriUtils.graphElementIdFromUri(json.source_vertex_id);
            json.destination_vertex_id = IdUriUtils.graphElementIdFromUri(json.destination_vertex_id);
            var html = Template['edge'].merge(json);
            this.create = function(){
                Graph.addHTML(
                    html
                );
                $(html).hover(
                    Edge.onMouseOver,
                    Edge.onMouseOut
                );
                createLabel();
                createMenu();
                drawArrowLine();
                var edge = edgeFacade();
                edge.centerOnArrowLine();
                edge.hideMenu();
                edge.adjustWidth();
                EventBus.publish(
                    '/event/ui/html/edge/created/',
                    edge
                );
                return edge;
            }
            function createLabel(){
                var label = Template['edge_label'].merge(json);
                $(html).append(label);
                VertexAndEdgeCommon.adjustTextFieldWidthToNumberOfChars(
                    label
                );
                label.focus(function(e) {
                    var edge = edgeOfSubHtmlComponent(this);
                    edge.highlight();
                    edge.removeStyleOfDefaultText();
                    if(edge.hasDefaultText()){
                        $(this).val("");
                        edge.readjustLabelWidth();
                    }
                });
                label.blur(function(e) {
                    var edge = edgeOfSubHtmlComponent(this);
                    if(!edge.isMouseOver()){
                        edge.unhighlight();
                    }
                    if($(this).val() == ""){
                        $(this).val(Edge.EMPTY_LABEL);
                        edge.applyStyleOfDefaultText();
                        edge.readjustLabelWidth()
                    }else{
                        edge.removeStyleOfDefaultText();
                    }
                });

                //save the label when the user changes it
                label.change(function(e) {
                    var edge = edgeOfSubHtmlComponent(this);
                    EdgeService.updateLabel(edge, edge.text());

                });

                label.keydown(function(e) {
                    edgeOfSubHtmlComponent(this).readjustLabelWidth();
                });
                label.keyup(function(e) {
                    edgeOfSubHtmlComponent(this).readjustLabelWidth();
                });
            }

            function createMenu(){
                var removeButton = Template['edge_remove_button'].merge();
                $(html).append(removeButton);

                removeButton.click(function() {
                    var edge = edgeOfSubHtmlComponent(this);
                    EdgeService.remove(edge);
                });
            }

            function edgeOfSubHtmlComponent(htmlOfSubComponent){
                return Edge.withHtml(
                    $(htmlOfSubComponent).closest('.edge')
                );
            }

            function drawArrowLine(){
                var edge = edgeFacade();
                edge.setArrowLine(
                    ArrowLine.withSegment(
                        Segment.withStartAndEndPoint(
                            json.arrowLineStartPoint,
                            json.arrowLineEndPoint
                        )
                    )
                );
                edge.arrowLine().drawInContextWithDefaultStyle(
                    Graph.canvasContext()
                );
            }

            function edgeFacade(){
                return Edge.withHtml(html);
            }
        }
        return api;
    }
);
/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.mind-map_template",
    "triple_brain.id_uri",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.edge",
    "triple_brain.ui.arrow_line",
    "triple_brain.event_bus",
    "triple_brain.segment"
],
    function(require, $, Graph, MindMapTemplate, IdUriUtils, VertexAndEdgeCommon, EdgeService, ArrowLine, EventBus, Segment){
        var api = {};
        api.arrayFromServerFormatArray = function(jsonArray){
            $.each(jsonArray, function(){
                var json = this;
                api.fromServerFormat(
                    json
                ).create();
            });
        };
        api.fromServerFormat = function(json){
            return new EdgeCreator(json);
        };

        function EdgeCreator(json){
            var Edge = require("triple_brain.ui.edge");
            json.id = IdUriUtils.graphElementIdFromUri(json.id);
            json.source_vertex_id = IdUriUtils.graphElementIdFromUri(json.source_vertex_id);
            json.destination_vertex_id = IdUriUtils.graphElementIdFromUri(json.destination_vertex_id);
            var html = MindMapTemplate['edge'].merge(json);
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
                var label = MindMapTemplate['edge_label'].merge(json);
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
                var removeButton = MindMapTemplate['edge_remove_button'].merge();
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
                    ArrowLine.ofEdgeHavingUndefinedArrowLine(
                        edge
                    )
                );
                edge.arrowLine().drawInWithDefaultStyle();
            }

            function edgeFacade(){
                return Edge.withHtml(html);
            }
        }
        return api;
    }
);
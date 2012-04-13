/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.edge_creator == undefined) {

    triple_brain.ui.edge_creator = {
        createWithArrayOfJsonHavingRelativePosition : function(jsonArray){
            for (var i in jsonArray) {
                var json = jsonArray[i];
                json.arrowLineStartPoint = json.arrow_line_bezier_points[0];
                json.arrowLineEndPoint = json.arrow_line_bezier_points[3];
                triple_brain.ui.edge_creator.withArrayOfJsonHavingRelativePosition(
                    json
                ).create();
            }
        },
        withArrayOfJsonHavingAbsolutePosition : function(json){
            return new EdgeCreator(json);
        },
        withArrayOfJsonHavingRelativePosition : function(json){
            triple_brain.ui.edge_creator.addGraphOffsetToJsonPosition(json);
            return new EdgeCreator(json);
        },
        addGraphOffsetToJsonPosition : function(json){
            json.arrowLineStartPoint.x += triple_brain.ui.mind_map.offset().left;
            json.arrowLineStartPoint.y += triple_brain.ui.mind_map.offset().top ;
            json.arrowLineEndPoint.x += triple_brain.ui.mind_map.offset().left;
            json.arrowLineEndPoint.y += triple_brain.ui.mind_map.offset().top;
        }
    }

    function EdgeCreator(json){
        json.id = triple_brain.id_uri.idFromUri(json.id);
        json.source_vertex_id = triple_brain.id_uri.idFromUri(json.source_vertex_id);
        json.destination_vertex_id = triple_brain.id_uri.idFromUri(json.destination_vertex_id);
        var html = triple_brain.template['edge'].merge(json);
        this.create = function(){
            triple_brain.ui.graph.addHTML(
                html
            );
            $(html).hover(
                triple_brain.ui.edge.onMouseOver,
                triple_brain.ui.edge.onMouseOut
            );
            createLabel();
            createMenu();
            drawArrowLine();
            edgeFacade().centerOnArrowLine();
            return edgeFacade();
        }
        function createLabel(){
            var label = triple_brain.template['edge_label'].merge(json);
            $(html).append(label);
            triple_brain.ui.vertex_and_edge_common.adjustTextFieldWidthToNumberOfChars(
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
                    $(this).val(triple_brain.ui.edge.EMPTY_LABEL);
                    edge.applyStyleOfDefaultText();
                    edge.readjustLabelWidth()
                }else{
                    edge.removeStyleOfDefaultText();
                }
            });

            //save the label when the user changes it
            label.change(function(e) {
                var edge = edgeOfSubHtmlComponent(this);
                triple_brain.edge.updateLabel(edge, edge.text());

            });

            label.keydown(function(e) {
                edgeOfSubHtmlComponent(this).readjustLabelWidth();
            });
            label.keyup(function(e) {
                edgeOfSubHtmlComponent(this).readjustLabelWidth();
            });
        }

        function createMenu(){
            var removeButton = triple_brain.template['edge_remove_button'].merge();
            $(html).append(removeButton);

            removeButton.click(function() {
                var edge = edgeOfSubHtmlComponent(this);
                triple_brain.edge.remove(edge);
            });
        }

        function edgeOfSubHtmlComponent(htmlOfSubComponent){
            return triple_brain.ui.edge.withHtml(
                $(htmlOfSubComponent).closest('.edge')
            );
        }

        function drawArrowLine(){
            var edge = edgeFacade();
            edge.setArrowLine(
                triple_brain.ui.arrow_line.withSegment(
                    triple_brain.segment.withStartAndEndPoint(
                        json.arrowLineStartPoint,
                        json.arrowLineEndPoint
                    )
                )
            );
            edge.arrowLine().drawInContextWithDefaultStyle(
                triple_brain.ui.graph.canvasContext()
            );
        }

        function edgeFacade(){
            return triple_brain.ui.edge.withHtml(html);
        }
    }
}
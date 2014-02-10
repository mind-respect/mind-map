/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.mind-map_template",
    "triple_brain.relative_tree_vertex",
    "triple_brain.graph_displayer"
], function(MindMapTemplate, RelativeTreeVertex, GraphDisplayer){
    var api = {};
    api.withServerFacade = function (serverVertex) {
        return new VertexCreator(serverVertex);
    };
    api.addDuplicateVerticesButtonIfApplicable = function(){

    };
    function VertexCreator(serverFormatFacade){
        var html;
        this.create = function () {
            html = $(
                MindMapTemplate['relative_vertex'].merge()
            ).data(
                "uri",
                serverFormatFacade.getUri()
            ).uniqueId().addClass(
                "view-only"
            ).on(
                "click",
                handleClickToDisplayVertexAsCentralVertex
            );
            var vertex = vertexFacade();
            createLabel();
            vertex.setOriginalServerObject(
                serverFormatFacade
            );
            return vertex;
            function createLabel() {
                var labelContainer = $(MindMapTemplate['vertex_label_container'].merge({
                    label:serverFormatFacade.getLabel().trim() === "" ?
                        RelativeTreeVertex.getWhenEmptyLabel() :
                        serverFormatFacade.getLabel()
                })).appendTo(html).on(
                    "click",
                    handleClickToDisplayVertexAsCentralVertex
                );
                vertex.readjustLabelWidth();
                if (vertex.hasDefaultText()) {
                    vertex.applyStyleOfDefaultText();
                }
                var label = labelContainer.find("input[type='text']:first");
                label.prop('disabled', true).on(
                    "click",
                    handleClickToDisplayVertexAsCentralVertex
                );
                return labelContainer;
            }
            function vertexFacade() {
                return RelativeTreeVertex.withHtml(html);
            }
        };
        function vertexOfSubHtmlComponent(htmlOfSubComponent) {
            return RelativeTreeVertex.withHtml(
                $(htmlOfSubComponent).closest('.vertex')
            );
        }
        function handleClickToDisplayVertexAsCentralVertex(){
            GraphDisplayer.displayUsingNewCentralVertex(
                vertexOfSubHtmlComponent($(this))
            );
            $(".ui-dialog-content").dialog("close").remove();
        }
    }
    return api;
});
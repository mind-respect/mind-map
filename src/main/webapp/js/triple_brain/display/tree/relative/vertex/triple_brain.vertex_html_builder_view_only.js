/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
        //not applicable
    };
    function VertexCreator(serverFormatFacade){
        var html,
            vertex;
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
            vertex = new RelativeTreeVertex.Object().init(
                html
            );
            RelativeTreeVertex.initCache(vertex);
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
                var label = labelContainer.find("input[type='text']:first");
                label.prop('disabled', true).on(
                    "click",
                    handleClickToDisplayVertexAsCentralVertex
                );
                return labelContainer;
            }
        };
        function vertexOfSubHtmlComponent(htmlOfSubComponent) {
            return RelativeTreeVertex.withHtml(
                htmlOfSubComponent.closest('.vertex')
            );
        }
        function handleClickToDisplayVertexAsCentralVertex(){
            GraphDisplayer.displayUsingCentralVertex(
                vertexOfSubHtmlComponent($(this))
            );
            $(".ui-dialog-content").dialog("close").remove();
        }
    }
    return api;
});
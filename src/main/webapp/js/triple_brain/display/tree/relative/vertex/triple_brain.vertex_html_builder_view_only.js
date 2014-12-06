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
            var bubbleContent = $("<div class='in-bubble-content'>").appendTo(html);
            createLabel(bubbleContent);
            html.append("<span class='arrow'>");
            vertex.setOriginalServerObject(
                serverFormatFacade
            );
            return vertex;
            function createLabel(container) {
                return $(
                    "<div class='bubble-label'>"
                ).text(
                    serverFormatFacade.getLabel().trim()
                ).attr(
                    "placeholder",
                    RelativeTreeVertex.getWhenEmptyLabel()
                ).prop(
                    'disabled',
                    true
                ).on(
                    "click",
                    handleClickToDisplayVertexAsCentralVertex
                ).appendTo(container);
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
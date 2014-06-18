/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.tree_edge",
    "triple_brain.graph_displayer"
], function(TreeEdge, GraphDisplayer){
    var api = {};
    api.get = function (edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade) {
        return new EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade);
    };
    return api;
    function EdgeCreator(edgeServerFormat, parentVertexHtmlFacade, childVertexHtmlFacade){
        var html;
        this.create = function(){
            html = $(
                "<span>"
            ).addClass(
                "relation"
            ).css("display", "inline").append(
                buildInnerHtml()
            );
            var isInverse = edgeServerFormat.getSourceVertex().getUri() !== parentVertexHtmlFacade.getUri();
            if (isInverse) {
                childVertexHtmlFacade.getHtml().addClass("inverse");
            }
            html.data(
                "source_vertex_id",
                isInverse ? childVertexHtmlFacade.getId() : parentVertexHtmlFacade.getId()
            ).data(
                "destination_vertex_id",
                isInverse ? parentVertexHtmlFacade.getId() : childVertexHtmlFacade.getId()
            );
            var textContainer = childVertexHtmlFacade.getInBubbleContainer();
            var isToTheLeft = childVertexHtmlFacade.isToTheLeft();
            if (isToTheLeft) {
                textContainer.append(html);
            } else {
                textContainer.prepend(html);
            }
            var edge = edgeFacade();
            edge.setUri(
                edgeServerFormat.getUri()
            );
            function buildInnerHtml(){
                var label = edgeServerFormat.getLabel();
                return $(
                    "<span>"
                ).addClass(
                    "label label-info"
                ).text(
                    label.trim() === "" ?
                        TreeEdge.getWhenEmptyLabel() :
                        label
                );
            }
            function edgeFacade() {
                return TreeEdge.withHtml(html);
            }
        };
    }
});
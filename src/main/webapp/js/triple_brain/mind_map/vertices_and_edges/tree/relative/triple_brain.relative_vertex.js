/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery"
],function($){
    var api = {};
    api.withVertex = function(vertex){
        return new RelativeVertex(vertex.getHtml());
    };
    api.withVertexHtml = function(vertexHtml){
        return new RelativeVertex(vertexHtml);
    };
    return api;
    function RelativeVertex(html){
        html = $(html);
        this.isToTheLeft = function(){
            return html.parents(".left-oriented").length > 0;
        };
        this.adjustPosition = function(parentVertexHtml){
            var width = html.width();
            if(parentVertexHtml === undefined){
                parentVertexHtml = getParentVertex();
            }
            var parentWidth = $(parentVertexHtml).width();
            html.closest(".vertex-tree-container").css(
                "margin-left", "-" + (parentWidth + width + 125) + "px"
            );
        };
        function getParentVertex(){
            return html.closest(".vertices-children-container")
                .siblings(".vertex-container");
        }
    }
});
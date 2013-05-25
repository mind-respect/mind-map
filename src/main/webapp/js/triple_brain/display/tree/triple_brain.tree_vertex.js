/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex"
],
    function($, Vertex){
        var api = {};
        api.withHtml = function(html){
            return new Object(
                $(html)
            );
        };
        api.ofVertex = function(vertex){
            return api.withHtml(
                vertex.getHtml()
            );
        };
        function Object(html){
            var otherInstancesKey = "otherInstances";
            this.getOtherInstances = function(){
                var vertex = Vertex.withHtml(html);
                if(html.data(otherInstancesKey) === undefined){
                    var verticesWithSameUri = Vertex.withUri(
                        vertex.getUri()
                    );
                    var otherInstances = [];
                    $.each(verticesWithSameUri, function(){
                        var vertexWithSameUri = this;
                        if(vertexWithSameUri.getId() !== vertex.getId()){
                            otherInstances.push(
                                vertexWithSameUri
                            );
                        }
                    });
                    html.data(
                        otherInstancesKey,
                        otherInstances
                    );
                }
                return html.data(otherInstancesKey);
            };
            Vertex.Object.apply(this, [html]);
        }
        Object.prototype = new Vertex.Object();
        return api;
    }
);
/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex"
],
    function($, Vertex) {
        var api = {
            withHtml : function(html){
                return new VerticesListElement(html);
            },
            withVertex : function(vertex){
                var htmlOfVertexListElement = $('.vertices-list-element').filter(function() {
                    return $(this).data("vertexId") == vertex.getId();
                });
                return new VerticesListElement(htmlOfVertexListElement);
            }
        };
        function VerticesListElement(html){

            this.associatedVertex = function(){
                return Vertex.withId(
                    $(html).data('vertexId')
                );
            }

            this.setDistanceFromCentralVertex= function(distanceFromCentralVertex){
                $(containerWithDistanceFromCentralVertex()).html(
                    distanceFromCentralVertex
                )
            }

            this.setLabel = function(label){
                $(labelInput()).val(
                    label
                )
            }

            this.remove = function(){
                $(html).remove();
            }

            function containerWithDistanceFromCentralVertex(){
                return $(html).find('.min-number-of-edges-from-center-vertex');
            }
            function labelInput(){
                return $(html).find('.label');
            }
            this.applyStyleOfDefaultText = function(){
                $(labelInput()).addClass('when-default-graph-element-text');
            }

            this.removeStyleOfDefaultText = function(){
                $(labelInput()).removeClass('when-default-graph-element-text');
            }
        }
        return api;
    }
);
/**
 * @author Vincent Blouin
 */
if (triple_brain.module.vertices_list_element == undefined) {
    (function($) {
        triple_brain.module.vertices_list_element = {
            withHtml : function(html){
                return new VerticesListElement(html);
            },
            withVertex : function(vertex){
                var htmlOfVertexListElement = $('.vertices-list-element').filter(function() {
                    return $(this).data("vertexId") == vertex.id();
                });
                return new VerticesListElement(htmlOfVertexListElement);
            }
        };

        function VerticesListElement(html){

            this.associatedVertex = function(vertex){
                return triple_brain.ui.vertex.withId(
                    $(html).data('vertexId')
                );
            }

            this.setDistanceFromCentralVertex= function(distanceFromCentralVertex){
                $(containerWithDistanceFromCentralVertex()).html(
                    distanceFromCentralVertex
                )
            }

            this.setLabel = function(label){
                $(containerWithLabel()).html(
                    label
                )
            }

            this.remove = function(){
                $(html).remove();
            }

            function containerWithDistanceFromCentralVertex(){
                return $(html).find('.min-number-of-edges-from-center-vertex');
            }
            function containerWithLabel(){
                return $(html).find('.label');
            }
            this.applyStyleOfDefaultText = function(){
                $(containerWithLabel()).addClass('when-default-graph-element-text');
            }

            this.removeStyleOfDefaultText = function(){
                $(containerWithLabel()).removeClass('when-default-graph-element-text');
            }
        }

    })(jQuery);
}
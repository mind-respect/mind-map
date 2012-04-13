/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.module.vertices_list_element_creator == undefined) {
    (function($) {
        triple_brain.module.vertices_list_element_creator = {
            withVertex : function(vertex){
                return new VerticesListElementCreator(vertex);
            }
        };

        function VerticesListElementCreator(vertex){
            var html = triple_brain.template.vertices_list['list_element'].merge();
            var verticesListElement = triple_brain.module.vertices_list_element.withHtml(html);
            this.create = function(){
                triple_brain.module.vertices_list.get().addHtml(html);
                $(html).data('vertexId', vertex.id());
                verticesListElement.setDistanceFromCentralVertex(
                    vertex.numberOfEdgesFromCentralVertex()
                );
                verticesListElement.setLabel(vertex.text());
                $(html).click(function(){
                    var verticesListElement = triple_brain.module.vertices_list_element.withHtml(this);
                    var vertex = verticesListElement.associatedVertex();
                    vertex.focus();
                });
                return verticesListElement;
            }
        }

    })(jQuery);
}
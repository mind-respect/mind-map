/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.module.vertices_list_element_creator == undefined) {
    (function($) {
        var graphStatic = triple_brain.ui.graph;
        var vertexStatic = triple_brain.ui.vertex;
        triple_brain.module.vertices_list_element_creator = {
            withVertexAndCentralVertex : function(vertex, centralVertex){
                return new VerticesListElementCreator(vertex, centralVertex);
            }
        };

        function VerticesListElementCreator(vertex, centralVertex){
            var html = triple_brain.template.vertices_list['list_element'].merge();
            var verticesListElement = triple_brain.module.vertices_list_element.withHtml(html);
            this.create = function(){
                triple_brain.module.vertices_list.get().addHtml(html);
                $(html).data('vertexId', vertex.getId());
                verticesListElement.setDistanceFromCentralVertex(
                    graphStatic.numberOfEdgesBetween(
                        vertex,
                        centralVertex
                    )
                );
                verticesListElement.setLabel(vertex.text());
                $(html).click(function(){
                    var verticesListElement = triple_brain.module.vertices_list_element.withHtml(this);
                    var vertex = verticesListElement.associatedVertex();
                    vertex.focus();
                    vertex.scrollTo();
                });
                return verticesListElement;
            }
        }

    })(jQuery);
}
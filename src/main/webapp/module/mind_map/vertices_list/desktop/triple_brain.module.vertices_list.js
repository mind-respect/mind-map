/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.module.vertices_list == undefined) {
    (function($) {
        var SORT_TYPE_LABEL = 1;
        var SORT_TYPE_DISTANCE_FROM_CENTRAL_VERTEX = 2;

        triple_brain.module.vertices_list = {
            get : function(){
                return new VerticesList(
                    $("#vertices-list")
                );
            },
            exists : function(){
                return $("#vertices-list-panel").length > 0;
            }
        };
        function VerticesList(html){

            this.addHtml = function(htmlToAdd){
                $(html).append(htmlToAdd);
            }

            this.sort = function(){
                if(sortType() == SORT_TYPE_LABEL){
                    sortByLabel();
                }else{
                    sortByDistanceFromCentralVertex();
                }
            }

            this.sortByLabel = function(){
                sortByLabel();
                setSortType(SORT_TYPE_LABEL);
            }

            this.sortByDistanceFromCentralVertex = function(){
                sortByDistanceFromCentralVertex();
                setSortType(SORT_TYPE_DISTANCE_FROM_CENTRAL_VERTEX);
            }

            this.empty = function(){
                $(verticesList()).empty();
            }

            this.rebuild = function(){
                this.empty();
                var vertices = triple_brain.ui.vertex.allVertices();
                var l = vertices.length;
                while(l--){
                    triple_brain.module.vertices_list_element_creator.withVertex(
                        vertices[l]
                    ).create();
                }
            }

            function sortType(){
                return $(html).data('sort_type');
            }

            function setSortType(sortType){
                $(html).data('sort_type', sortType);
            }

            function verticesList(){
                return $('#vertices-list');
            }

            function sortByLabel(){
                sortVerticesWithCriteria(labelSortCriteria());
            }

            function sortByDistanceFromCentralVertex(){
                sortVerticesWithCriteria(distanceFromCentralVertexSortCriteria());
            }

            function labelSortCriteria(){
                return '.label';
            }

            function distanceFromCentralVertexSortCriteria(){
                return '.min-number-of-edges-from-center-vertex';
            }

            function sortVerticesWithCriteria(criteria){
                $(verticesList()).find('li').tsort(criteria);
            }
        }

        triple_brain.bus.local.topics('/event/ui/graph/drawing_info/updated/').subscribe(function () {
            var verticesList = triple_brain.module.vertices_list.exists() ?
                triple_brain.module.vertices_list.get() :
                triple_brain.module.vertices_list_creator.create();
            verticesList.rebuild();
        });

        triple_brain.bus.local.topic('/event/ui/graph/drawn/').subscribe(function() {
            var verticesList = triple_brain.module.vertices_list.get();
            verticesList.sort();
        });

        triple_brain.bus.local.topic('/event/ui/html/vertex/created/').subscribe(function(vertex) {
            var verticesListElementCreator = triple_brain.module.vertices_list_element_creator.withVertex(vertex);
            verticesListElementCreator.create();
            var verticesList = triple_brain.module.vertices_list.get();
            verticesList.sort();
            $(vertex.label()).on("keyup blur focus", function(){
                var vertex = triple_brain.ui.vertex.withHtml(
                    $(this).closest(".vertex")
                );
                var verticesListElement = triple_brain.module.vertices_list_element.withVertex(vertex);
                verticesListElement.setLabel(vertex.text());
                if($(this).val() == "" || vertex.hasDefaultText()){
                    verticesListElement.applyStyleOfDefaultText();
                }else{
                    verticesListElement.removeStyleOfDefaultText();
                }
            });
        });
        triple_brain.bus.local.topic('/event/ui/graph/vertex/deleted/').subscribe(function(vertex) {
            var verticesListElement = triple_brain.module.vertices_list_element.withVertex(vertex);
            verticesListElement.remove();
            var verticesList = triple_brain.module.vertices_list.get();
            verticesList.sort();
        });

    })(jQuery);
}
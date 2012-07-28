/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.module.vertices_list == undefined) {
    (function ($) {
        var vertexStatic = triple_brain.ui.vertex;
        var verticesListStatic = triple_brain.module.vertices_list = {};
        var SORT_TYPE_LABEL = 1;
        var SORT_TYPE_DISTANCE_FROM_CENTRAL_VERTEX = 2;
        verticesListStatic.get = function () {
            return new VerticesList(
                $("#vertices-list")
            );
        };
        verticesListStatic.ifExistsRebuild = function(){
            if(verticesListStatic.exists()){
                verticesListStatic.get().rebuild();
            }
        }
        verticesListStatic.exists = function () {
            return $("#vertices-list-panel").length > 0;
        };
        function VerticesList(html) {
            var thisVerticesList = this;
            this.addHtml = function (htmlToAdd) {
                $(html).append(htmlToAdd);
            }

            this.sort = function () {
                if (sortType() == SORT_TYPE_LABEL) {
                    sortByLabel();
                } else {
                    sortByDistanceFromCentralVertex();
                }
            }

            this.sortByLabel = function () {
                sortByLabel();
                setSortType(SORT_TYPE_LABEL);
            }

            this.sortByDistanceFromCentralVertex = function () {
                sortByDistanceFromCentralVertex();
                setSortType(SORT_TYPE_DISTANCE_FROM_CENTRAL_VERTEX);
            }

            this.empty = function () {
                $(verticesList()).empty();
            }

            this.rebuild = function () {
                this.empty();
                $.each(vertexStatic.allVertices(), function () {
                    thisVerticesList.buildForAVertex(
                        this
                    );
                });
                var verticesList = verticesListStatic.get();
                verticesList.sort();
            }

            this.buildForAVertex = function (vertex) {
                triple_brain.module.vertices_list_element_creator.withVertexAndCentralVertex(
                    vertex,
                    vertexStatic.centralVertex()
                ).create();
            }

            this.containsVertex = function(vertex){
                var vertexFound = false;
                $.each(getVerticesListElement(), function(){
                    var vertexListElement = this;
                    if(vertexListElement.associatedVertex().getId() == vertex.getId()){
                        vertexFound = true;
                        return false;
                    }
                });
                return vertexFound;
            }

            function getVerticesListElement(){
                var verticesListElement = [];
                $.each($(html).find(".vertices-list-element"),function(){
                    verticesListElement.push(
                        triple_brain.module.vertices_list_element.withHtml(
                            this
                        )
                    );
                })
                return verticesListElement;
            }

            function sortType() {
                return $(html).data('sort_type');
            }

            function setSortType(sortType) {
                $(html).data('sort_type', sortType);
            }

            function verticesList() {
                return $('#vertices-list');
            }

            function sortByLabel() {
                sortVerticesWithCriteria(labelSortCriteria());
            }

            function sortByDistanceFromCentralVertex() {
                sortVerticesWithCriteria(distanceFromCentralVertexSortCriteria());
            }

            function labelSortCriteria() {
                return '.label';
            }

            function distanceFromCentralVertexSortCriteria() {
                return '.min-number-of-edges-from-center-vertex';
            }

            function sortVerticesWithCriteria(criteria) {
                $(verticesList()).find('li').tsort(criteria);
            }
        }

        var eventBus = triple_brain.event_bus;
        eventBus.subscribe(
            '/event/ui/graph/drawing_info/about_to/update',
            function(){
                if(triple_brain.module.vertices_list.exists()){
                    triple_brain.module.vertices_list.get().empty();
                }
                eventBus.unsubscribe(
                    "/event/graph_traversal/edge_added",
                    verticesListStatic.ifExistsRebuild
                );
            }
        )

        eventBus.subscribe(
            '/event/ui/html/vertex/created/',
            function (event, vertex) {
                $(vertex.label()).on("keyup blur focus", function () {
                    var vertex = vertexStatic.withHtml(
                        $(this).closest(".vertex")
                    );
                    var verticesListElement = triple_brain.module.vertices_list_element.withVertex(
                        vertex
                    );
                    verticesListElement.setLabel(vertex.text());
                    if ($(this).val() == "" || vertex.hasDefaultText()) {
                        verticesListElement.applyStyleOfDefaultText();
                    } else {
                        verticesListElement.removeStyleOfDefaultText();
                    }
                });
            }
        );

        eventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function () {
                var verticesList = triple_brain.module.vertices_list.exists() ?
                    triple_brain.module.vertices_list.get() :
                    triple_brain.module.vertices_list_creator.create();
                verticesList.rebuild();
                eventBus.subscribe(
                    "/event/graph_traversal/edge_added",
                    verticesListStatic.ifExistsRebuild
                );
            }
        );

        eventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function (event, vertex) {
                var verticesListElement = triple_brain.module.vertices_list_element.withVertex(vertex);
                verticesListElement.remove();
                var verticesList = triple_brain.module.vertices_list.get();
                verticesList.rebuild();
            }
        );

    })(jQuery);
}
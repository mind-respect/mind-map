/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex",
    "./triple_brain.module.vertices_list_creator.js",
    "./triple_brain.module.vertices_list_element_creator.js",
    "./triple_brain.module.vertices_list_element.js",
    "triple_brain.event_bus",
    "triple_brain.graph_displayer",
    "triple_brain.tree_vertex",
    "jquery.tinysort.min"
],
    function ($, Vertex, VerticesListCreator, VerticesListElementCreator, VerticesListElement, EventBus, GraphDisplayer, TreeVertex) {
        var api = {};
        var SORT_TYPE_LABEL = 1;
        var SORT_TYPE_DISTANCE_FROM_CENTRAL_VERTEX = 2;
        api.get = function () {
            return new VerticesList(
                $("#vertices-list")
            );
        };
        api.ifExistsRebuild = function(){
            if(api.exists()){
                api.get().rebuild();
            }
        }
        api.exists = function () {
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
                Vertex.visitAllVertices(function(vertex){
                    thisVerticesList.buildForAVertex(
                        vertex
                    );
                });
                var verticesList = api.get();
                verticesList.sort();
            }

            this.buildForAVertex = function (vertex) {
                VerticesListElementCreator.withVertexAndCentralVertex(
                    vertex,
                    Vertex.centralVertex()
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
                        VerticesListElement.withHtml(
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
                $(verticesList()).find('li').tsort(
                    labelSortCriteria(),
                    {useVal : true}
                );
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

        EventBus.subscribe(
            '/event/ui/graph/drawing_info/about_to/update',
            function(){
                if(api.exists()){
                    api.get().empty();
                }
                EventBus.unsubscribe(
                    "/event/graph_traversal/edge_added",
                    api.ifExistsRebuild
                );
            }
        )

        EventBus.subscribe(
            '/event/ui/html/vertex/created/',
            function (event, vertex) {
                $(vertex.label()).on("keyup blur focus", function () {
                    var vertex = Vertex.withHtml(
                        $(this).closest(".vertex")
                    );
                    updateLabelInListForVertex(
                        vertex
                    );
                    if(GraphDisplayer.couldHaveDuplicates()){
                        var otherInstances = TreeVertex.withHtml(
                            vertex.getHtml()
                        ).getOtherInstances();
                        $.each(otherInstances, function(){
                            updateLabelInListForVertex(
                                this
                            );
                        });
                    }
                    function updateLabelInListForVertex(vertex){
                        var verticesListElement = VerticesListElement.withVertex(
                            vertex
                        );
                        verticesListElement.setLabel(vertex.text());
                        if (vertex.label().val() == "" || vertex.hasDefaultText()) {
                            verticesListElement.applyStyleOfDefaultText();
                        } else {
                            verticesListElement.removeStyleOfDefaultText();
                        }
                    }
                });
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/drawn',
            function () {
                var verticesList = api.exists() ?
                    api.get() :
                    VerticesListCreator.create();
                verticesList.rebuild();
                EventBus.subscribe(
                    "/event/graph_traversal/edge_added",
                    api.ifExistsRebuild
                );
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function (event, vertexUri) {
                var verticesListElement = VerticesListElement.withVertexUri(
                    vertexUri
                );
                verticesListElement.remove();
                var verticesList = api.get();
                verticesList.rebuild();
            }
        );
        EventBus.subscribe(
            "/event/graph_traversal/edge/removed",
            function(){
                api.get().rebuild();
            }
        );
        return api;
    }
);
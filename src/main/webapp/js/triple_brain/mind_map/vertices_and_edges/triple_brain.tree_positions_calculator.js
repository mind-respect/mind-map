/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.config",
    "triple_brain.mind_map_info",
    "triple_brain.id_uri"
],
    function ($, Config, MindMapInfo, IdUriUtils) {
        var HORIZONTAL_DISTANCE_OF_VERTICES = 300;
        var VERTICAL_DISTANCE_OF_VERTICES = 100;
        var api = {};
        api.calculateUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
            var centralVertexEncodedUri = IdUriUtils.encodeUri(centralVertexUri);
            $.ajax({
                type:'GET',
                url:Config.links.app + '/service/graph/' + MindMapInfo.uri() + "/" + depth + '/' + centralVertexEncodedUri,
                dataType:'json'
            }).success(function (graph) {
                    var drawnTree = new TreeMakerFromServerGraph(
                        centralVertexUri,
                        graph
                    ).make();
                    callback(drawnTree);
                });
        };
        return api;
        function TreeMakerFromServerGraph(centralVertexUri, serverGraph) {
            var vertices = serverGraph.vertices;
            this.make = function () {
                var sourceId;
                var destinationId;
                var edges = serverGraph.edges;
                initChildrenOfVertex(
                    vertexWithId(centralVertexUri)
                );
                defineChildrenInVertices();
                definePositionsInVertices();
                return serverGraph;

                function defineChildrenInVertices(){
                    $.each(
                        edges, function(){
                            updateVerticesChildrenWithEdge(this);
                        }
                    );
                }

                function definePositionsInVertices(){
                    var centralVertex = vertices[centralVertexUri];
                    centralVertex.position = {
                        x : 0,
                        y : 0
                    };
                    definePositionsOfVerticesFromRoot(centralVertex);
                    function definePositionsOfVerticesFromRoot(rootVertex){
                        var childrenOfRoot = rootVertex.children;
                        var numberOfChildren = childrenOfRoot.length;
                        if(numberOfChildren === 0){
                            return;
                        }
                        var middleIndex = Math.floor(numberOfChildren / 2);
                        var rootVertexPosition = rootVertex.position;
                        var middleVertexPosition = {
                            x : rootVertexPosition.x + HORIZONTAL_DISTANCE_OF_VERTICES,
                            y : rootVertexPosition.y
                        };
                        var middleVertex = vertexWithId(childrenOfRoot[middleIndex]);
                        middleVertex.position = middleVertexPosition;
                        definePositionsOfVerticesFromRoot(middleVertex);

                        for(var i = middleIndex - 1 ; i >= 0 ; i--){
                            var currentVertex = vertexWithId(childrenOfRoot[i]);
                            definePositionOfVertexAbovePrevious(
                                currentVertex,
                                vertexWithId(childrenOfRoot[i + 1])
                            );
                            definePositionsOfVerticesFromRoot(currentVertex);
                        }
                        for(var i = middleIndex + 1 ; i < numberOfChildren; i++){
                            var currentVertex = vertexWithId(childrenOfRoot[i]);
                            definePositionOfVertexUnderPrevious(
                                currentVertex,
                                vertexWithId(childrenOfRoot[i - 1])
                            );
                            definePositionsOfVerticesFromRoot(currentVertex);
                        }
                    }

                    function definePositionOfVertexAbovePrevious(currentVertex, previousVertex){
                        return definePositionOfVertex(currentVertex, previousVertex, true);
                    }

                    function definePositionOfVertexUnderPrevious(currentVertex, previousVertex){
                        return definePositionOfVertex(currentVertex, previousVertex, false);
                    }

                    function definePositionOfVertex(currentVertex, previousVertex, isPositioningAbovePrevious){
                        var previousVertexPosition = previousVertex.position;
                        var heightOfPreviousSiblingTree = heightOfTreeInVertices(
                            previousVertex
                        ) * VERTICAL_DISTANCE_OF_VERTICES;
                        var yOffsetFromPrevious = heightOfPreviousSiblingTree + VERTICAL_DISTANCE_OF_VERTICES;
                        if(isPositioningAbovePrevious){
                            yOffsetFromPrevious *= -1;
                        }
                        var position = {
                            x: previousVertexPosition.x,
                            y : previousVertexPosition.y + yOffsetFromPrevious
                        }
                        currentVertex.position = position;
                    }

                    function heightOfTreeInVertices(rootVertexOfGreaterTree){
                        var numberOfSignificantChild = 0;
                        compileHeightOfTree(rootVertexOfGreaterTree);
                        function compileHeightOfTree(rootVertex){
                            var numberOfChildren = rootVertex.children.length;
                            if(numberOfChildren === 0){
                                return;
                            }
                            numberOfSignificantChild += numberOfChildren - 1;
                            for(var i = 0; i < rootVertex.children.length ; i++){
                                compileHeightOfTree(vertexWithId(rootVertex.children[i]));
                            }
                        }
                        return numberOfSignificantChild;
                    }

                    function setPositionOfVertexWithId(vertexId, position){
                        vertexWithId(vertexId).position = position;
                    }
                }

                function updateVerticesChildrenWithEdge(edge) {
                    sourceId = edge.source_vertex_id;
                    destinationId = edge.destination_vertex_id;
                    applyToBoth([
                        initVertexInTreeInfoIfNecessary
                    ]);
                    var parentId,
                        childId;
                    if(isCentralVertex(destinationId)){
                        parentId = destinationId;
                        childId = sourceId
                    }else{
                        parentId = sourceId;
                        childId = destinationId;
                    }
                    addChild(parentId, childId);
                }

                function initVertexInTreeInfoIfNecessary(vertexId) {
                    var vertex = vertices[vertexId];
                    if(vertex.children === undefined){
                        initChildrenOfVertex(vertex);
                    }
                }

                function initChildrenOfVertex(vertex){
                    vertex.children = [];
                }

                function isCentralVertex(vertexId){
                    return vertexId === centralVertexUri;
                }

                function vertexWithId(vertexId){
                    return vertices[vertexId]
                }

                function addChild(vertexId, childrenId) {
                    vertices[vertexId].children.push(
                        childrenId
                    );
                }

                function applyToBoth(functions) {
                    $.each(functions, function () {
                        var func = this;
                        func(sourceId);
                        func(destinationId);
                    });
                }
            };
        }
    }
);
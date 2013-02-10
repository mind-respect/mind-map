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
        var api = {};
        api.calculateUsingCentralVertexEncodedUriAndDepth = function (centralVertexUri, depth, callback) {
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
            var verticesTreeInfo = {};
            this.make = function () {
                var sourceShortId;
                var destinationShortId;
                var edges = serverGraph.edges;
                for (var i = 0; i < edges.length; i++) {
                    updateVerticesTreeInfoWithEdge(
                        edges[i]
                    );
                }

                function updateVerticesTreeInfoWithEdge(edge) {
                    sourceShortId = IdUriUtils.graphElementIdFromUri(edge.source_vertex_id);
                    destinationShortId = IdUriUtils.graphElementIdFromUri(edge.destination_vertex_id);
                    applyToBoth([
                        initVertexInTreeInfoIfNecessary
                    ]);
                    var parentId,
                        childId;
                    if(isCentralVertex(destinationShortId)){
                        parentId = destinationShortId;
                        childId = sourceShortId
                    }else{
                        parentId = sourceShortId;
                        childId = destinationShortId;
                    }
                    addChild(parentId, childId);
                }


                function initVertexInTreeInfoIfNecessary(shortId) {
                    if (verticesTreeInfo[shortId] === undefined) {
                        verticesTreeInfo[shortId] = {
                            children:[]
                        };
                    }
                }

                function setCentralVertex(shortId){
                    verticesTreeInfo.centralVertexShortId = shortId;
                }

                function isCentralVertex(shortId){
                    return shortId === IdUriUtils.graphElementIdFromUri(centralVertexUri);
                }

                function addChild(shortId, childrenShortId) {
                    verticesTreeInfo[shortId].children.push(
                        childrenShortId
                    );
                }

                function isRelationDefined() {
                    return vertexHasChild(sourceShortId, destinationShortId) ||
                        vertexHasChild(destinationShortId, sourceShortId);
                }

                function vertexHasChild(shortId, otherShortId){
                    var children = verticesTreeInfo[shortId].children;
                    var hasChild = false;
                    $.each(children, function(){
                        var childId = this;
                        if(childId === otherShortId){
                            hasChild = true;
                            return -1;
                        }
                    });
                    return hasChild;
                }

                function applyToBoth(functions) {
                    $.each(functions, function () {
                        var func = this;
                        func(sourceShortId);
                        func(destinationShortId);
                    });
                }

                function setDepth(shortId, depth) {
                    verticesTreeInfo[shortId].depth = depth;
                }

                function getDepth(shortId) {
                    return verticesTreeInfo[shortId].depth;
                }

            };
        }
    }
);
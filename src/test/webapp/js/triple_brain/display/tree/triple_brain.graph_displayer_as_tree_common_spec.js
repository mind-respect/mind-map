/*
 * Copyright Mozilla Public License 1.1
 */
define([
    'triple_brain.graph_displayer_as_tree_common'
], function (TreeDisplayerCommon) {
    var vertexA;
    var vertexB;
    var vertexC;
    var abcGraph;
    describe("graph_displayer_as_tree_common", function () {
        it("adds_vertices_if_graph_is_not_a_tree", function () {
            abcGraph = initLinearAbcGraph();
            TreeDisplayerCommon.defineChildrenInVertices(
                abcGraph,
                vertexA.id
            );
            expect(numberOfVertices()).toBe(3);
            abcGraph = initLinearAbcGraph();
            addEdge(
                makeEdgeBetween(vertexC, vertexA)
            );
            TreeDisplayerCommon.defineChildrenInVertices(
                abcGraph,
                vertexA.id
            );
            expect(numberOfVertices()).toBe(4);
        });
    });
    function centerVertex(){
        return vertexInGraphWithId(vertexA.id);
    }
    function vertexInGraphWithId(vertexId){
        return abcGraph.vertices[vertexId];
    }
    function numberOfVertices(){
        return 1 + getNumberOfChildren(centerVertex());
        function getNumberOfChildren(vertex){
            var numberOfChildren = 0;
            $.each(vertex.children, function(){
                var child = this;
                numberOfChildren++;
                numberOfChildren += getNumberOfChildren(vertexInGraphWithId(
                    child.vertexUri
                ));
            });
            return numberOfChildren;
        }
    }
    function initLinearAbcGraph() {
        vertexA = makeVertex("vertex a");
        vertexB = makeVertex("vertex b");
        vertexC = makeVertex("vertex c");
        var vertices = {};
        vertices[vertexA.id] = vertexA;
        vertices[vertexB.id] = vertexB;
        vertices[vertexC.id] = vertexC;
        var edges = [
            makeEdgeBetween(vertexA, vertexB),
            makeEdgeBetween(vertexB, vertexC)
        ];
        return {
            vertices: vertices,
            edges:edges
        };
    }
    function addEdge(edge){
        abcGraph.edges.push(
            edge
        );
    }
    function makeEdgeBetween(sourceVertex, destinationVertex){
        return {
            id :  generateEdgeUri(),
            source_vertex_id : sourceVertex.id,
            destination_vertex_id : destinationVertex.id,
            label : "between " + sourceVertex.label + " and " + destinationVertex.label
        }
    }

    function makeVertex(label){
        return  {
            id : generateVertexUri(),
            label : label,
            same_as : [],
            suggestions : [],
            types : []
        };
    }
    function generateVertexUri(){
        return baseUri() + "/vertex/" + generateUuid();
    }

    function generateEdgeUri(){
        return baseUri() + "/edge/" + generateUuid();
    }

    function baseUri(){
        return "/service/users/some-user/graph";
    }

    function generateUuid(){
        //taken from http://stackoverflow.com/a/2117523/600313
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
});



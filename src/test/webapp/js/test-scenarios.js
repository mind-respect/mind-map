/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        'triple_brain.vertex',
        'triple_brain.edge'
    ],
    function (Vertex, Edge) {
        var api = {};
        api.GraphWithAnInverseRelationScenario = function(){
            this.getGraph = function(){
                return {"vertices":{"\/service\/users\/avasdv\/graph\/vertex\/7c92d7a4-ad89-4225-bfbc-1a19063f1d74":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/vertex\/7c92d7a4-ad89-4225-bfbc-1a19063f1d74","label":"straight bubble","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:37 PM","lastModificationDate":"Jul 16, 2014 4:16:46 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false},"minDistanceFromCenterVertex":1},"\/service\/users\/avasdv\/graph\/vertex\/default":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/vertex\/default","label":"me","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:13 PM","lastModificationDate":"Jul 16, 2014 4:16:13 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":2,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false},"minDistanceFromCenterVertex":0},"\/service\/users\/avasdv\/graph\/vertex\/8eabf15e-8f6f-4ede-805d-5ed0896051e2":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/vertex\/8eabf15e-8f6f-4ede-805d-5ed0896051e2","label":"inverse bubble","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:16 PM","lastModificationDate":"Jul 16, 2014 4:16:33 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false},"minDistanceFromCenterVertex":1}},"edges":{"\/service\/users\/avasdv\/graph\/edge\/ebdd7aaf-cc15-4680-a104-b28cf6be8582":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/edge\/ebdd7aaf-cc15-4680-a104-b28cf6be8582","label":"going straight","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:37 PM","lastModificationDate":"Jul 16, 2014 4:16:42 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/vertex\/default","label":"me","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:13 PM","lastModificationDate":"Jul 16, 2014 4:16:13 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":2,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false},"minDistanceFromCenterVertex":0},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/vertex\/7c92d7a4-ad89-4225-bfbc-1a19063f1d74","label":"straight bubble","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:37 PM","lastModificationDate":"Jul 16, 2014 4:16:46 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false},"minDistanceFromCenterVertex":1}},"\/service\/users\/avasdv\/graph\/edge\/daa55852-3476-401b-a21a-6d6a70a0c86e":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/edge\/daa55852-3476-401b-a21a-6d6a70a0c86e","label":"going inverse","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:16 PM","lastModificationDate":"Jul 16, 2014 4:16:35 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/vertex\/8eabf15e-8f6f-4ede-805d-5ed0896051e2","label":"inverse bubble","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:16 PM","lastModificationDate":"Jul 16, 2014 4:16:33 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false},"minDistanceFromCenterVertex":1},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/avasdv\/graph\/vertex\/default","label":"me","comment":"","images":[],"creationDate":"Jul 16, 2014 4:16:13 PM","lastModificationDate":"Jul 16, 2014 4:16:13 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":2,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false},"minDistanceFromCenterVertex":0}}}};
            };
            this.getCenterVertex = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "me")
                        ]
                );
            };
            var graph = this.getGraph();
        };
        api.GraphWithSimilarRelationsScenario = function () {
            this.getGraph = function () {
                return {"vertices": {"\/service\/users\/asvasv\/graph\/vertex\/9dad055a-b69c-4d08-8ffa-66892e69fc44": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/9dad055a-b69c-4d08-8ffa-66892e69fc44", "label": "book 3", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:31:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:40 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}, "\/service\/users\/asvasv\/graph\/vertex\/dfae47e6-1538-4db7-b8af-b4cb8fcf9ac0": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/dfae47e6-1538-4db7-b8af-b4cb8fcf9ac0", "label": "book 1", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:43 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}, "\/service\/users\/asvasv\/graph\/vertex\/default": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:08 PM", "lastModificationDate": "Jul 15, 2014 3:30:08 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 3, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "\/service\/users\/asvasv\/graph\/vertex\/e7a9cca6-2e0f-47db-a9e8-2b2190bc6fe9": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/e7a9cca6-2e0f-47db-a9e8-2b2190bc6fe9", "label": "book 2", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:39 PM", "lastModificationDate": "Jul 15, 2014 3:32:37 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}, "edges": {"\/service\/users\/asvasv\/graph\/edge\/ecd69b8b-8d92-4686-aeee-f34ea18630b2": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/edge\/ecd69b8b-8d92-4686-aeee-f34ea18630b2", "label": "Possession", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:39 PM", "lastModificationDate": "Jul 15, 2014 3:31:03 PM"}, "genericIdentifications": {}, "sameAs": {"in_path_node_same_as.uri": {"externalResourceUri": "http:\/\/rdf.freebase.com\/rdf\/m\/0613q", "friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/identification\/5b0be7f0-c002-41d6-8775-78e2929e6e26", "label": "Possession", "comment": "In law, possession is the control a person intentionally exercises toward a thing. In all cases, to possess something, a person must have an intention to possess it. A person may be in possession of some property. Like ownership, the possession of things is commonly regulated by states under property law.", "images": [], "creationDate": "Jul 15, 2014 3:30:20 PM", "lastModificationDate": "Jul 15, 2014 3:30:22 PM"}}}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:08 PM", "lastModificationDate": "Jul 15, 2014 3:30:08 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 3, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/e7a9cca6-2e0f-47db-a9e8-2b2190bc6fe9", "label": "book 2", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:39 PM", "lastModificationDate": "Jul 15, 2014 3:32:37 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}, "\/service\/users\/asvasv\/graph\/edge\/7aeaaf8f-c9fb-4707-929d-eb206a9027b5": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/edge\/7aeaaf8f-c9fb-4707-929d-eb206a9027b5", "label": "Possession", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:11 PM", "lastModificationDate": "Jul 15, 2014 3:30:20 PM"}, "genericIdentifications": {}, "sameAs": {"in_path_node_same_as.uri": {"externalResourceUri": "http:\/\/rdf.freebase.com\/rdf\/m\/0613q", "friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/identification\/5b0be7f0-c002-41d6-8775-78e2929e6e26", "label": "Possession", "comment": "In law, possession is the control a person intentionally exercises toward a thing. In all cases, to possess something, a person must have an intention to possess it. A person may be in possession of some property. Like ownership, the possession of things is commonly regulated by states under property law.", "images": [], "creationDate": "Jul 15, 2014 3:30:20 PM", "lastModificationDate": "Jul 15, 2014 3:30:22 PM"}}}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:08 PM", "lastModificationDate": "Jul 15, 2014 3:30:08 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 3, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/dfae47e6-1538-4db7-b8af-b4cb8fcf9ac0", "label": "book 1", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:43 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}, "\/service\/users\/asvasv\/graph\/edge\/abc764a7-3b9d-49b8-8f78-04ce64aba4b1": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/edge\/abc764a7-3b9d-49b8-8f78-04ce64aba4b1", "label": "other relation", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:31:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:33 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:08 PM", "lastModificationDate": "Jul 15, 2014 3:30:08 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 3, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/9dad055a-b69c-4d08-8ffa-66892e69fc44", "label": "book 3", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:31:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:40 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}}}
            };
            var graph = this.getGraph();
            this.getCenterVertex = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "me")
                        ]
                );
            };
            this.getPossession = function () {
                return relationIdentificationWithLabel(
                    graph, "Possession"
                );
            };
            this.getBook1 = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "book 1")
                        ]
                );
            };
            this.getBook2 = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "book 2")
                        ]
                );
            };
            this.getOtherRelation = function () {
                return relationWithLabel(graph, "other relation");
            };
        };
        return api;
        function uriOfVertexWithLabel(graph, label) {
            var uri;
            $.each(graph.vertices, function (key, value) {
                var vertex = Vertex.fromServerFormat(value);
                if (vertex.getLabel() === label) {
                    uri = vertex.getUri();
                    return -1;
                }
            });
            return uri;
        }

        function relationWithLabel(graph, label) {
            var foundRelation;
            $.each(graph.edges, function (key, value) {
                var relation = Edge.fromServerFormat(value);
                if (relation.getLabel() === label) {
                    foundRelation = relation;
                    return -1;
                }
            });
            return foundRelation;
        }

        function relationIdentificationWithLabel(graph, label) {
            var foundIdentification;
            $.each(graph.edges, function (key, value) {
                var edge = Edge.fromServerFormat(value);
                $.each(edge.getIdentifications(), function () {
                    var identification = this;
                    if (identification.getLabel() === label) {
                        foundIdentification = identification;
                        return -1;
                    }
                });
                if (foundIdentification !== undefined) {
                    return -1;
                }
            });
            return foundIdentification;
        }
    }
);


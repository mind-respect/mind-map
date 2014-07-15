/*
 * Copyright Mozilla Public License 1.1
 */
define([
    'triple_brain.graph_displayer_as_tree_common'
], function (TreeDisplayerCommon) {
    describe("graph_displayer_as_tree_common", function () {
        it("has neighbors", function () {
            var twoVerticesGraph = getTwoVerticesGraph(),
                vertexAUri = uriWithForVertexWithLabel(
                    twoVerticesGraph, "vertex A"
                ),
                vertexBUri = uriWithForVertexWithLabel(
                    twoVerticesGraph, "vertex B"
                );
            TreeDisplayerCommon.enhancedVerticesInfo(
                twoVerticesGraph,
                vertexAUri
            );
            var vertexA = twoVerticesGraph.vertices[vertexAUri];
            expect(vertexA.neighbors.length).toBe(1);
            var vertexB = twoVerticesGraph.vertices[vertexBUri];
            expect(vertexB.neighbors.length).toBe(1);
        });
        it("has similar relations grouped", function(){

        });
    });

    function uriWithForVertexWithLabel(graph, label) {
        var uri;
        $.each(graph.vertices, function (key, value) {
            if (value.vertex.graphElement.friendlyResource.label === label) {
                uri = value.vertex.graphElement.friendlyResource.uri;
                return -1;
            }
        });
        return uri;
    }

    function getTwoVerticesGraph() {
        twoVerticesGraph = {
            "vertices": {
                "\/service\/users\/some_user\/graph\/vertex\/2366f329-9a54-4df6-869d-954c3cf689b0": {
                    "vertex": {
                        "graphElement": {
                            "friendlyResource": {
                                "uri": "\/service\/users\/some_user\/graph\/vertex\/2366f329-9a54-4df6-869d-954c3cf689b0",
                                "label": "vertex B",
                                "comment": "",
                                "images": [],
                                "creationDate": "Jul 15, 2014 2:55:15 PM",
                                "lastModificationDate": "Jul 15, 2014 3:00:42 PM"
                            },
                            "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}
                        }, "numberOfConnectedEdges": 2, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false
                    }, "minDistanceFromCenterVertex": 1},
                "\/service\/users\/some_user\/graph\/vertex\/default": {
                    "vertex": {
                        "graphElement": {
                            "friendlyResource": {
                                "uri": "\/service\/users\/some_user\/graph\/vertex\/default",
                                "label": "vertex A",
                                "comment": "",
                                "images": [],
                                "creationDate": "Jul 15, 2014 2:44:07 PM",
                                "lastModificationDate": "Jul 15, 2014 3:00:38 PM"
                            },
                            "genericIdentifications": {},
                            "sameAs": {},
                            "additionalTypes": {}
                        },
                        "numberOfConnectedEdges": 1,
                        "includedVertices": {},
                        "includedEdges": {},
                        "suggestions": [],
                        "isPublic": false
                    }, "minDistanceFromCenterVertex": 0}
            }, "edges": {"\/service\/users\/some_user\/graph\/edge\/ff845695-a978-4ff5-bdd8-475029edcbb6": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/some_user\/graph\/edge\/ff845695-a978-4ff5-bdd8-475029edcbb6", "label": "entre A et B", "comment": "", "images": [], "creationDate": "Jul 15, 2014 2:55:15 PM", "lastModificationDate": "Jul 15, 2014 2:55:24 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/some_user\/graph\/vertex\/default", "label": "vertex A", "comment": "", "images": [], "creationDate": "Jul 15, 2014 2:44:07 PM", "lastModificationDate": "Jul 15, 2014 3:00:38 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/some_user\/graph\/vertex\/2366f329-9a54-4df6-869d-954c3cf689b0", "label": "vertex B", "comment": "", "images": [], "creationDate": "Jul 15, 2014 2:55:15 PM", "lastModificationDate": "Jul 15, 2014 3:00:42 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 2, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}}};
        return twoVerticesGraph;
    }

    function getGraphWithTwoRelationsHavingSameId() {
        return {"vertices": {"\/service\/users\/asvasv\/graph\/vertex\/9dad055a-b69c-4d08-8ffa-66892e69fc44": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/9dad055a-b69c-4d08-8ffa-66892e69fc44", "label": "book 3", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:31:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:40 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}, "\/service\/users\/asvasv\/graph\/vertex\/dfae47e6-1538-4db7-b8af-b4cb8fcf9ac0": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/dfae47e6-1538-4db7-b8af-b4cb8fcf9ac0", "label": "book 1", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:43 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}, "\/service\/users\/asvasv\/graph\/vertex\/default": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:08 PM", "lastModificationDate": "Jul 15, 2014 3:30:08 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 3, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "\/service\/users\/asvasv\/graph\/vertex\/e7a9cca6-2e0f-47db-a9e8-2b2190bc6fe9": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/e7a9cca6-2e0f-47db-a9e8-2b2190bc6fe9", "label": "book 2", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:39 PM", "lastModificationDate": "Jul 15, 2014 3:32:37 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}, "edges": {"\/service\/users\/asvasv\/graph\/edge\/ecd69b8b-8d92-4686-aeee-f34ea18630b2": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/edge\/ecd69b8b-8d92-4686-aeee-f34ea18630b2", "label": "Possession", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:39 PM", "lastModificationDate": "Jul 15, 2014 3:31:03 PM"}, "genericIdentifications": {}, "sameAs": {"in_path_node_same_as.uri": {"externalResourceUri": "http:\/\/rdf.freebase.com\/rdf\/m\/0613q", "friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/identification\/5b0be7f0-c002-41d6-8775-78e2929e6e26", "label": "Possession", "comment": "In law, possession is the control a person intentionally exercises toward a thing. In all cases, to possess something, a person must have an intention to possess it. A person may be in possession of some property. Like ownership, the possession of things is commonly regulated by states under property law.", "images": [], "creationDate": "Jul 15, 2014 3:30:20 PM", "lastModificationDate": "Jul 15, 2014 3:30:22 PM"}}}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:08 PM", "lastModificationDate": "Jul 15, 2014 3:30:08 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 3, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/e7a9cca6-2e0f-47db-a9e8-2b2190bc6fe9", "label": "book 2", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:39 PM", "lastModificationDate": "Jul 15, 2014 3:32:37 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}, "\/service\/users\/asvasv\/graph\/edge\/7aeaaf8f-c9fb-4707-929d-eb206a9027b5": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/edge\/7aeaaf8f-c9fb-4707-929d-eb206a9027b5", "label": "Possession", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:11 PM", "lastModificationDate": "Jul 15, 2014 3:30:20 PM"}, "genericIdentifications": {}, "sameAs": {"in_path_node_same_as.uri": {"externalResourceUri": "http:\/\/rdf.freebase.com\/rdf\/m\/0613q", "friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/identification\/5b0be7f0-c002-41d6-8775-78e2929e6e26", "label": "Possession", "comment": "In law, possession is the control a person intentionally exercises toward a thing. In all cases, to possess something, a person must have an intention to possess it. A person may be in possession of some property. Like ownership, the possession of things is commonly regulated by states under property law.", "images": [], "creationDate": "Jul 15, 2014 3:30:20 PM", "lastModificationDate": "Jul 15, 2014 3:30:22 PM"}}}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:08 PM", "lastModificationDate": "Jul 15, 2014 3:30:08 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 3, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/dfae47e6-1538-4db7-b8af-b4cb8fcf9ac0", "label": "book 1", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:43 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}, "\/service\/users\/asvasv\/graph\/edge\/abc764a7-3b9d-49b8-8f78-04ce64aba4b1": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/edge\/abc764a7-3b9d-49b8-8f78-04ce64aba4b1", "label": "other relation", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:31:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:33 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:30:08 PM", "lastModificationDate": "Jul 15, 2014 3:30:08 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 3, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvasv\/graph\/vertex\/9dad055a-b69c-4d08-8ffa-66892e69fc44", "label": "book 3", "comment": "", "images": [], "creationDate": "Jul 15, 2014 3:31:11 PM", "lastModificationDate": "Jul 15, 2014 3:32:40 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}}}
    }

});



/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        'triple_brain.vertex',
        'triple_brain.edge',
        'triple_brain.schema',
        "triple_brain.vertex_html_builder",
        "triple_brain.edge_html_builder",
        "triple_brain.group_relation_html_builder",
        "triple_brain.suggestion_bubble_html_builder",
        "triple_brain.suggestion_relation_builder",
        "triple_brain.schema_html_builder",
        "triple_brain.property_html_builder",
        'test/webapp/js/mock',
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        'triple_brain.graph_displayer_as_tree_common'
    ],
    function (Vertex, Edge, Schema, VertexHtmlBuilder, EdgeHtmlBuilder, GroupRelationHtmlBuilder, SuggestionBubbleHtmlBuilder, SuggestionRelationBuilder, SchemaHtmlBuilder, PropertyHtmlBuilder, Mock, GraphDisplayer, GraphDisplayerFactory, TreeDisplayerCommon) {
        var api = {};
        api.threeBubblesGraph = function () {
            this.getGraph = function () {
                return {"vertices": {"\/service\/users\/asvas\/graph\/vertex\/66af347b-bf7a-4081-b4da-dfc016f699a5": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/vertex\/66af347b-bf7a-4081-b4da-dfc016f699a5", "label": "b1", "comment": "", "images": [], "creationDate": "Oct 24, 2014 11:03:38 AM", "lastModificationDate": "Oct 24, 2014 11:03:51 AM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}}, "\/service\/users\/asvas\/graph\/vertex\/622caec8-42ed-4847-99df-82726ca0dc99": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/vertex\/622caec8-42ed-4847-99df-82726ca0dc99", "label": "b3", "comment": "", "images": [], "creationDate": "Oct 24, 2014 11:01:15 AM", "lastModificationDate": "Oct 24, 2014 11:04:04 AM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}}, "\/service\/users\/asvas\/graph\/vertex\/8b9d9a88-4ac3-4755-9d81-64a6e1773b67": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/vertex\/8b9d9a88-4ac3-4755-9d81-64a6e1773b67", "label": "b2", "comment": "", "images": [], "creationDate": "Oct 24, 2014 11:01:12 AM", "lastModificationDate": "Oct 24, 2014 11:03:57 AM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 2, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}}}, "edges": {"\/service\/users\/asvas\/graph\/edge\/5030df9c-07f6-4212-8e9b-a2b7f7b61376": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/edge\/5030df9c-07f6-4212-8e9b-a2b7f7b61376", "label": "r1", "comment": "", "images": [], "creationDate": "Oct 24, 2014 11:03:38 AM", "lastModificationDate": "Oct 24, 2014 11:04:10 AM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/vertex\/66af347b-bf7a-4081-b4da-dfc016f699a5"}}}}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/vertex\/8b9d9a88-4ac3-4755-9d81-64a6e1773b67"}}}}}, "\/service\/users\/asvas\/graph\/edge\/8fd8ee09-4c3c-4adf-bbb9-e6eb9131e658": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/edge\/8fd8ee09-4c3c-4adf-bbb9-e6eb9131e658", "label": "r2", "comment": "", "images": [], "creationDate": "Oct 24, 2014 11:01:15 AM", "lastModificationDate": "Oct 24, 2014 11:04:00 AM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/vertex\/8b9d9a88-4ac3-4755-9d81-64a6e1773b67"}}}}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asvas\/graph\/vertex\/622caec8-42ed-4847-99df-82726ca0dc99"}}}}}}};
            };
            this.getBubble1 = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "b1")
                        ]
                );
            };
            this.getBubble1Ui = function(){
                return VertexHtmlBuilder.withServerFacade(
                    this.getBubble1()
                ).create();
            };
            this.getBubble2 = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "b2")
                        ]
                );
            };
            this.getBubble2Ui = function(){
                return VertexHtmlBuilder.withServerFacade(
                    this.getBubble2()
                ).create();
            };
            this.getRelation1 = function () {
                return relationWithLabel(graph, "r1");
            };
            this.getRelation1Ui = function () {
                return EdgeHtmlBuilder.get(
                    this.getRelation1(),
                    this.getBubble1Ui(),
                    this.getBubble2Ui()
                ).create();
            };
            var graph = this.getGraph();
            Mock.setCenterVertexUriInUrl(this.getBubble1().getUri());
        };
        api.GraphWithAnInverseRelationScenario = function () {
            this.getGraph = function () {
                return {"vertices": {"\/service\/users\/avasdv\/graph\/vertex\/7c92d7a4-ad89-4225-bfbc-1a19063f1d74": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/vertex\/7c92d7a4-ad89-4225-bfbc-1a19063f1d74", "label": "straight bubble", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:37 PM", "lastModificationDate": "Jul 16, 2014 4:16:46 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}, "\/service\/users\/avasdv\/graph\/vertex\/default": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:13 PM", "lastModificationDate": "Jul 16, 2014 4:16:13 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 2, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "\/service\/users\/avasdv\/graph\/vertex\/8eabf15e-8f6f-4ede-805d-5ed0896051e2": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/vertex\/8eabf15e-8f6f-4ede-805d-5ed0896051e2", "label": "inverse bubble", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:16 PM", "lastModificationDate": "Jul 16, 2014 4:16:33 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}, "edges": {"\/service\/users\/avasdv\/graph\/edge\/ebdd7aaf-cc15-4680-a104-b28cf6be8582": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/edge\/ebdd7aaf-cc15-4680-a104-b28cf6be8582", "label": "going straight", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:37 PM", "lastModificationDate": "Jul 16, 2014 4:16:42 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:13 PM", "lastModificationDate": "Jul 16, 2014 4:16:13 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 2, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/vertex\/7c92d7a4-ad89-4225-bfbc-1a19063f1d74", "label": "straight bubble", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:37 PM", "lastModificationDate": "Jul 16, 2014 4:16:46 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}}, "\/service\/users\/avasdv\/graph\/edge\/daa55852-3476-401b-a21a-6d6a70a0c86e": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/edge\/daa55852-3476-401b-a21a-6d6a70a0c86e", "label": "going inverse", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:16 PM", "lastModificationDate": "Jul 16, 2014 4:16:35 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "sourceVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/vertex\/8eabf15e-8f6f-4ede-805d-5ed0896051e2", "label": "inverse bubble", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:16 PM", "lastModificationDate": "Jul 16, 2014 4:16:33 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 1, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 1}, "destinationVertex": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/avasdv\/graph\/vertex\/default", "label": "me", "comment": "", "images": [], "creationDate": "Jul 16, 2014 4:16:13 PM", "lastModificationDate": "Jul 16, 2014 4:16:13 PM"}, "genericIdentifications": {}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 2, "includedVertices": {}, "includedEdges": {}, "suggestions": [], "isPublic": false}, "minDistanceFromCenterVertex": 0}}}};
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
            this.getPossessionAsGroupRelation = function () {
                var centerVertexUri = this.getCenterVertex().getUri(),
                    possessionUri = this.getPossession().getUri();
                TreeDisplayerCommon.enhancedVerticesInfo(
                    graph,
                    centerVertexUri
                );
                var centerVertex = graph.vertices[centerVertexUri];
                return centerVertex.similarRelations[
                    possessionUri
                    ];
            };
            this.getPossessionAsGroupRelationUi = function(){
                return GroupRelationHtmlBuilder.withServerFacade(
                    this.getPossessionAsGroupRelation()
                ).create();
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
        api.oneBubbleHavingSuggestionsGraph = function () {
            this.getGraph = function () {
                return {"vertices": {"\/service\/users\/asdvo\/graph\/vertex\/b530624e-f52a-4745-9d28-8d879b602f5b": {"vertex": {"graphElement": {"friendlyResource": {"uri": "\/service\/users\/asdvo\/graph\/vertex\/b530624e-f52a-4745-9d28-8d879b602f5b", "label": "Event", "comment": "", "images": [], "creationDate": "Oct 28, 2014 8:17:51 AM", "lastModificationDate": "Oct 28, 2014 8:17:56 AM"}, "genericIdentifications": {"\/service\/users\/asdvo\/graph\/identification\/65888d01-06f7-4035-a168-2c9faf2e9f37": {"externalResourceUri": "http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t", "friendlyResource": {"uri": "\/service\/users\/asdvo\/graph\/identification\/65888d01-06f7-4035-a168-2c9faf2e9f37", "label": "Event", "comment": "An event is a topic that can be described by the time or date at which it happened. Long-lasting events may be described as occurring between two dates. It is sometimes appropriate to create abstract events, as collections of other events -- like World War II, or Opposition to the Vietnam War, but use your best judgment here, as some topics are surely too abstract to be considered a collection of events, like 'democracy'.", "images": [], "creationDate": "Oct 28, 2014 8:17:56 AM", "lastModificationDate": "Oct 28, 2014 8:17:56 AM"}}}, "sameAs": {}, "additionalTypes": {}}, "numberOfConnectedEdges": 0, "includedVertices": {}, "includedEdges": {}, "suggestions": [
                    {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/ea2983ad-70a0-6781-7a67-6edcc58c6761", "label": "Start date", "comment": ""}, "sameAs": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event\/start_date", "label": "Start date", "comment": "when it began"}, "type": {"uri": "http:\/\/rdf.freebase.com\/rdf\/type\/datetime", "label": "Date\/Time", "comment": "the concept type of dates."}, "origins": [
                        {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/ea2983ad-70a0-6781-7a67-6edcc58c6761\/origin\/41ad8766-841c-7318-fee5-0418c025fb1c", "label": "", "comment": ""}, "origin": "identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}
                    ]},
                    {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/bfac19bc-bc18-b67c-d546-331726bf540f", "label": "End date", "comment": ""}, "sameAs": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event\/end_date", "label": "End date", "comment": "when it ended. leave blank if it continues"}, "type": {"uri": "http:\/\/rdf.freebase.com\/rdf\/type\/datetime", "label": "Date\/Time", "comment": "the concept type of dates."}, "origins": [
                        {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/bfac19bc-bc18-b67c-d546-331726bf540f\/origin\/a33a97aa-6829-17b8-ec20-7a9f8027dc34", "label": "", "comment": ""}, "origin": "identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}
                    ]},
                    {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/5c543e7e-68f5-9911-fc45-728b42247685", "label": "Location(s)", "comment": ""}, "sameAs": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event\/locations", "label": "Location(s)", "comment": "Where this event happened; this can be in multiple locations. When deciding which location to list, it is best to use the most specific location that makes sense.  E.g., for the event \"Assassination of Abraham Lincoln,\" the best location to use would be \"Ford's Theatre;\" \"Washington, DC\" would be okay, and \"United States,\" while strictly accurate, would be a poorer choice. However, for an event like the the Chinese Civil War, \"China\" would be the best location, since the event occurred throughout China."}, "type": {"uri": "http:\/\/rdf.freebase.com\/rdf\/location\/location", "label": "Location", "comment": "The Location type is used for any topic with a fixed location on the planet Earth. It includes geographic features such as oceans and mountains, political entities like cities and man-made objects like buildings.Guidelines for filling in location properties:geolocation: the longitude and latitude (in decimal notation) of the feature, or of the geographical center (centroid) fo the feature.contains and contained by: these properties can be used to show spatial relationships between different locations, such as an island contained by a body of water (which is equivalent to saying the body of water contains the island), a state contained by a country, a mountain within the borders of a national park, etc. For geopolitical locations,   containment two levels up and down is the ideal minimum. For example, the next two levels up for the city of Detroit are Wayne County and the state of Michigan.adjoins: also used to show spatial relations, in this case between locations that share a border.USBG Name: A unique name given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. More information can be found on their website. GNIS ID: A unique id given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. GNIS stands for Geographic Names Information System. More information can be found on their website.GEOnet Feature ID: The UFI (Unique Feature ID) used by GeoNet for features outside of the United States. More information can be found on their website."}, "origins": [
                        {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/5c543e7e-68f5-9911-fc45-728b42247685\/origin\/2c066867-f2d0-2385-330f-0e6c2f3ddba1", "label": "", "comment": ""}, "origin": "identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}
                    ]},
                    {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/1d0c35b6-f9d0-cf81-7eab-4ba72ae3d14a", "label": "People involved", "comment": ""}, "sameAs": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event\/people_involved", "label": "People involved", "comment": ""}, "type": {"uri": "http:\/\/rdf.freebase.com\/rdf\/people\/person", "label": "Person", "comment": "A person is a human being (man, woman or child) known to have actually existed. Living persons, celebrities and politicians are persons, as are deceased persons.\n\nNote: A person topic is distinct from a user in Metaweb. Users have profiles that can only be edited by the users themselves. A person topic can be edited by anyone and is intended as a factual representation of details about a person.\n\nFor more information, please see the Freebase wiki page on person."}, "origins": [
                        {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/1d0c35b6-f9d0-cf81-7eab-4ba72ae3d14a\/origin\/69263669-f6e9-97a0-9bcf-21b8b5d17ad4", "label": "", "comment": ""}, "origin": "identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}
                    ]},
                    {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/04acaf64-3186-710a-0f3e-4540adfe36dc", "label": "Included in event", "comment": ""}, "sameAs": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event\/included_in_event", "label": "Included in event", "comment": "if it is part of a larger event, like 'battle of vimy ridge' is part of 'ww1'"}, "type": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event", "label": "Event", "comment": "An event is a topic that can be described by the time or date at which it happened. Long-lasting events may be described as occurring between two dates. It is sometimes appropriate to create abstract events, as collections of other events -- like World War II, or Opposition to the Vietnam War, but use your best judgment here, as some topics are surely too abstract to be considered a collection of events, like 'democracy'."}, "origins": [
                        {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/04acaf64-3186-710a-0f3e-4540adfe36dc\/origin\/f8ced775-f684-b104-af0b-0e7cd44b9d8f", "label": "", "comment": ""}, "origin": "identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}
                    ]},
                    {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/6c861065-fe2f-0711-6370-a80941579376", "label": "Includes event", "comment": ""}, "sameAs": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event\/includes_event", "label": "Includes event", "comment": "if this event has parts, that are documented in freebase. for shorter sub-events that are documented more closely. like how 'WW1' includes  'battle of vimy ridge'"}, "type": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event", "label": "Event", "comment": "An event is a topic that can be described by the time or date at which it happened. Long-lasting events may be described as occurring between two dates. It is sometimes appropriate to create abstract events, as collections of other events -- like World War II, or Opposition to the Vietnam War, but use your best judgment here, as some topics are surely too abstract to be considered a collection of events, like 'democracy'."}, "origins": [
                        {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/6c861065-fe2f-0711-6370-a80941579376\/origin\/19f058bc-b5f6-1269-a8ae-985f9acf7f96", "label": "", "comment": ""}, "origin": "identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}
                    ]},
                    {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/bb665b8e-dd08-95d3-72f2-5d4c7325a48e", "label": "Instance of recurring event", "comment": ""}, "sameAs": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event\/instance_of_recurring_event", "label": "Instance of recurring event", "comment": "If this event is one in a series of recurring events, enter the general name of the recurring event."}, "type": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/recurring_event", "label": "Recurring event", "comment": "A Recurring Event represents a series of individual related events. An example is a film festival -- the Berlin Film Festival is a recurring event; individual festivals, such as 1952 Berlin Film Festival, would then be typed as Events, and linked in using the \"instances\" property of Recurring Event.  Other examples of recurring events include conferences, conventions, sports championships, other types of festivals, many contests, etc."}, "origins": [
                        {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/bb665b8e-dd08-95d3-72f2-5d4c7325a48e\/origin\/f9ac8bfb-436a-01ce-8e39-5eb44bcd5861", "label": "", "comment": ""}, "origin": "identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}
                    ]},
                    {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/f928a028-045f-b18d-6da2-5073bc7c295d", "label": "Comment", "comment": ""}, "sameAs": {"uri": "http:\/\/rdf.freebase.com\/rdf\/time\/event\/comment", "label": "Comment", "comment": "Comments, disclaimers or notes about this event."}, "type": {"uri": "http:\/\/rdf.freebase.com\/rdf\/type\/text", "label": "Text", "comment": "the concept type of language-specific text. note that text looks like a string in the json representation unless someone asks for the type and\/or language. language choices will be handled very specially by the middle tier, based on external data like the HTTP Accept-Language header."}, "origins": [
                        {"friendlyResource": {"uri": "\/service\/users\/asdvo\/suggestion\/f928a028-045f-b18d-6da2-5073bc7c295d\/origin\/06a0d1f0-2b2b-bb68-c693-a4e62a85919a", "label": "", "comment": ""}, "origin": "identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}
                    ]}
                ], "isPublic": false}}}, "edges": {}};
            };
            var graph = this.getGraph();
            this.getVertex = function(){
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "Event")
                        ]
                );
            };
            this.getOneSuggestion = function () {
                return this.getVertex().getSuggestions()[0];
            };
            this.getAVertexSuggestionUi = function(){
                return SuggestionBubbleHtmlBuilder.withServerFacade(
                    this.getOneSuggestion()
                ).create();
            };
            this.getARelationSuggestionUi = function(){
                return SuggestionRelationBuilder.get(
                    this.getOneSuggestion(),
                    this.getVertex(),
                    this.getAVertexSuggestionUi()
                ).create();
            };
            Mock.setCenterVertexUriInUrl(this.getVertex().getUri());
        };
        api.getKaraokeSchemaGraph = function(){
            this.getGraph = function () {
                return {"friendlyResource":{"uri":"\/service\/users\/asdvo\/graph\/schema\/20694222-6d18-4e2b-ac22-7aac89ddb2a1","label":"karaoke","comment":"","images":[],"creationDate":"Oct 28, 2014 9:55:11 AM","lastModificationDate":"Oct 28, 2014 9:55:16 AM"},"properties":{"\/service\/users\/asdvo\/graph\/schema\/20694222-6d18-4e2b-ac22-7aac89ddb2a1\/property\/08366e60-a42a-492c-9dd5-abaa1fbaf301":{"friendlyResource":{"uri":"\/service\/users\/asdvo\/graph\/schema\/20694222-6d18-4e2b-ac22-7aac89ddb2a1\/property\/08366e60-a42a-492c-9dd5-abaa1fbaf301","label":"location","comment":"","images":[],"creationDate":"Oct 28, 2014 9:55:26 AM","lastModificationDate":"Oct 28, 2014 9:56:08 AM"},"genericIdentifications":{},"sameAs":{"\/service\/users\/asdvo\/graph\/identification\/6629f102-8dbb-415d-8c77-784b9add7df9":{"externalResourceUri":"http:\/\/rdf.freebase.com\/rdf\/m\/01n7","friendlyResource":{"uri":"\/service\/users\/asdvo\/graph\/identification\/6629f102-8dbb-415d-8c77-784b9add7df9","label":"Location","comment":"The Location type is used for any topic with a fixed location on the planet Earth. It includes geographic features such as oceans and mountains, political entities like cities and man-made objects like buildings.Guidelines for filling in location properties:geolocation: the longitude and latitude (in decimal notation) of the feature, or of the geographical center (centroid) fo the feature.contains and contained by: these properties can be used to show spatial relationships between different locations, such as an island contained by a body of water (which is equivalent to saying the body of water contains the island), a state contained by a country, a mountain within the borders of a national park, etc. For geopolitical locations,   containment two levels up and down is the ideal minimum. For example, the next two levels up for the city of Detroit are Wayne County and the state of Michigan.adjoins: also used to show spatial relations, in this case between locations that share a border.USBG Name: A unique name given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. More information can be found on their website. GNIS ID: A unique id given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. GNIS stands for Geographic Names Information System. More information can be found on their website.GEOnet Feature ID: The UFI (Unique Feature ID) used by GeoNet for features outside of the United States. More information can be found on their website.","images":[],"creationDate":"Oct 28, 2014 9:56:08 AM","lastModificationDate":"Oct 28, 2014 9:56:08 AM"}}},"additionalTypes":{}},"\/service\/users\/asdvo\/graph\/schema\/20694222-6d18-4e2b-ac22-7aac89ddb2a1\/property\/4a6ab1da-3610-4638-82e6-2b292e181cdf":{"friendlyResource":{"uri":"\/service\/users\/asdvo\/graph\/schema\/20694222-6d18-4e2b-ac22-7aac89ddb2a1\/property\/4a6ab1da-3610-4638-82e6-2b292e181cdf","label":"repertoire","comment":"","images":[],"creationDate":"Oct 28, 2014 9:55:30 AM","lastModificationDate":"Oct 28, 2014 9:55:34 AM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"\/service\/users\/asdvo\/graph\/schema\/20694222-6d18-4e2b-ac22-7aac89ddb2a1\/property\/a5e32250-b553-47a9-93f6-14ec58158ae0":{"friendlyResource":{"uri":"\/service\/users\/asdvo\/graph\/schema\/20694222-6d18-4e2b-ac22-7aac89ddb2a1\/property\/a5e32250-b553-47a9-93f6-14ec58158ae0","label":"invitees","comment":"","images":[],"creationDate":"Oct 28, 2014 9:55:16 AM","lastModificationDate":"Oct 28, 2014 9:55:24 AM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}}}}
            };
            var graph = this.getGraph();
            this.getSchema = function(){
                return Schema.fromServerFormat(
                    graph
                );
            };
            this.getSchemaUi = function(){
                return SchemaHtmlBuilder.withServerFacade(
                    this.getSchema()
                ).create();
            };
            this.getInviteesPropertyUi = function(){
                return PropertyHtmlBuilder.withServerFacade(
                    this.getInviteesProperty()
                ).create();
            };
            this.getInviteesProperty = function(){
                return schemaPropertyWithLabel(
                    this.getSchema(),
                    "invitees"
                );
            };
            Mock.setCenterVertexUriInUrl(
                this.getSchema().getUri()
            );
        };
        GraphDisplayer.setImplementation(
            GraphDisplayerFactory.getByName(
                "relative_tree"
            )
        );
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

        function schemaPropertyWithLabel(schema, label) {
            var foundProperty;
            $.each(schema.getProperties(), function (key, property) {
                if (property.getLabel() === label) {
                    foundProperty = property;
                    return -1;
                }
            });
            return foundProperty;
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


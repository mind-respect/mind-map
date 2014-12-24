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
        "triple_brain.graph_displayer_as_relative_tree",
        'test/webapp/js/mock',
        "triple_brain.bubble_factory",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        'triple_brain.graph_displayer_as_tree_common',
        "triple_brain.vertex_server_format_builder",
        "triple_brain.event_bus",
        "triple_brain.suggestion"
    ],
    function (Vertex, Edge, Schema, VertexHtmlBuilder, EdgeHtmlBuilder, GroupRelationHtmlBuilder, SuggestionBubbleHtmlBuilder, SuggestionRelationBuilder, SchemaHtmlBuilder, PropertyHtmlBuilder, GraphDisplayerAsRelativeTree, Mock, BubbleFactory, GraphDisplayer, GraphDisplayerFactory, TreeDisplayerCommon, VertexServerFormatBuilder, EventBus, Suggestion) {
        var api = {};
        api.addTriple = function (bubble) {
            var destinationVertex = generateVertex(),
                edge = generateEdge(
                    bubble.getUri,
                    destinationVertex.getUri()
                );
            return GraphDisplayer.addEdgeAndVertex(
                bubble,
                edge,
                destinationVertex
            );
        };

        api.deepGraph = function () {
            this.getGraph = function () {
                /*
                 b1-r1->b2
                 b2-r2->b3
                 b2<-r3-b4
                 b1<-r4-b5
                 */
                return {"vertices":{"\/service\/users\/advioja\/graph\/vertex\/b1ffbff0-08f2-4119-a424-6c0f1560a54b":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/b1ffbff0-08f2-4119-a424-6c0f1560a54b","label":"b2","comment":"","images":[],"creationDate":"Dec 6, 2014 4:33:43 PM","lastModificationDate":"Dec 6, 2014 4:33:48 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":3,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/advioja\/graph\/vertex\/98d3f6b8-3eed-47d3-b2e6-6e13a0fd8c42":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/98d3f6b8-3eed-47d3-b2e6-6e13a0fd8c42","label":"b1","comment":"","images":[],"creationDate":"Dec 6, 2014 4:33:38 PM","lastModificationDate":"Dec 6, 2014 4:33:40 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":2,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/advioja\/graph\/vertex\/69d7b871-8552-41db-898f-44aa1bdad4aa":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/69d7b871-8552-41db-898f-44aa1bdad4aa","label":"b5","comment":"","images":[],"creationDate":"Dec 6, 2014 4:34:22 PM","lastModificationDate":"Dec 6, 2014 4:34:28 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/advioja\/graph\/vertex\/6789a1bf-b677-494a-a7ee-e8c1db8071f8":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/6789a1bf-b677-494a-a7ee-e8c1db8071f8","label":"b4","comment":"","images":[],"creationDate":"Dec 6, 2014 4:34:12 PM","lastModificationDate":"Dec 6, 2014 4:34:18 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/advioja\/graph\/vertex\/6942235d-84fd-413b-8df9-9582e7a2b171":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/6942235d-84fd-413b-8df9-9582e7a2b171","label":"b3","comment":"","images":[],"creationDate":"Dec 6, 2014 4:33:52 PM","lastModificationDate":"Dec 6, 2014 4:34:08 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}}},"edges":{"\/service\/users\/advioja\/graph\/edge\/291ee699-07c4-4559-b8b2-077d9a40529e":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/edge\/291ee699-07c4-4559-b8b2-077d9a40529e","label":"r3","comment":"","images":[],"creationDate":"Dec 6, 2014 4:34:12 PM","lastModificationDate":"Dec 6, 2014 4:34:16 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/6789a1bf-b677-494a-a7ee-e8c1db8071f8"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/b1ffbff0-08f2-4119-a424-6c0f1560a54b"}}}}},"\/service\/users\/advioja\/graph\/edge\/25524cdc-7bc1-4909-a006-c8fad2c61046":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/edge\/25524cdc-7bc1-4909-a006-c8fad2c61046","label":"r4","comment":"","images":[],"creationDate":"Dec 6, 2014 4:34:22 PM","lastModificationDate":"Dec 6, 2014 4:34:24 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/98d3f6b8-3eed-47d3-b2e6-6e13a0fd8c42"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/69d7b871-8552-41db-898f-44aa1bdad4aa"}}}}},"\/service\/users\/advioja\/graph\/edge\/60784790-c6de-468a-997f-b0f436fcf2d2":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/edge\/60784790-c6de-468a-997f-b0f436fcf2d2","label":"r2","comment":"","images":[],"creationDate":"Dec 6, 2014 4:33:52 PM","lastModificationDate":"Dec 6, 2014 4:33:58 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/b1ffbff0-08f2-4119-a424-6c0f1560a54b"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/6942235d-84fd-413b-8df9-9582e7a2b171"}}}}},"\/service\/users\/advioja\/graph\/edge\/54729ec4-05f4-44ef-8ad5-c2fc2929e851":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/edge\/54729ec4-05f4-44ef-8ad5-c2fc2929e851","label":"r1","comment":"","images":[],"creationDate":"Dec 6, 2014 4:33:43 PM","lastModificationDate":"Dec 6, 2014 4:33:45 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/98d3f6b8-3eed-47d3-b2e6-6e13a0fd8c42"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/advioja\/graph\/vertex\/b1ffbff0-08f2-4119-a424-6c0f1560a54b"}}}}}}};
            };
            this.getCenterVertex = function(){
                var graph = this.getGraph();
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "b1")
                        ]
                );
            };
            this.getBubble2 = function(){
                var graph = this.getGraph();
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "b2")
                        ]
                );
            };
        };

        api.mergeBubbleGraph = function () {
            var treeBuilder = new TreeBuilder(this),
                includedElementsTree,
                self = this;
            this.getGraph = function () {
                /*
                 one bubble labeled merge
                 merge contains bubbles
                 b1-r1->b2
                 b2-r2->b3
                 b1<-r4-b4
                 */
                return {"vertices":{"\/service\/users\/asodi\/graph\/vertex\/0e68a93c-9c62-4a7a-93ad-90ce45b54cbc":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/0e68a93c-9c62-4a7a-93ad-90ce45b54cbc","label":"merge","comment":"","images":[],"creationDate":"Dec 6, 2014 7:00:01 PM","lastModificationDate":"Dec 6, 2014 7:00:04 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":0,"includedVertices":{"\/service\/users\/asodi\/graph\/vertex\/c8d256d2-c173-43e8-8169-a66d2eb8a90d":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/c8d256d2-c173-43e8-8169-a66d2eb8a90d","label":"b1"}}}},"\/service\/users\/asodi\/graph\/vertex\/129b61cf-1175-45dd-88e6-fa1af9f03ff9":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/129b61cf-1175-45dd-88e6-fa1af9f03ff9","label":"b2"}}}},"\/service\/users\/asodi\/graph\/vertex\/29159f97-7340-4b1e-9ef5-9951298083c9":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/29159f97-7340-4b1e-9ef5-9951298083c9","label":"b4"}}}},"\/service\/users\/asodi\/graph\/vertex\/8d379453-dcdc-4d13-a621-cd449c754674":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/8d379453-dcdc-4d13-a621-cd449c754674","label":"b3"}}}}},"includedEdges":{"\/service\/users\/asodi\/graph\/edge\/2c780bbe-6d02-462c-96b5-4869334832f2":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/edge\/2c780bbe-6d02-462c-96b5-4869334832f2","label":"r4"}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/29159f97-7340-4b1e-9ef5-9951298083c9","label":""}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/c8d256d2-c173-43e8-8169-a66d2eb8a90d","label":""}}}}},"\/service\/users\/asodi\/graph\/edge\/509bc16e-9d0f-40e0-8b84-4bc6a9669dfe":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/edge\/509bc16e-9d0f-40e0-8b84-4bc6a9669dfe","label":"r2"}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/129b61cf-1175-45dd-88e6-fa1af9f03ff9","label":""}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/8d379453-dcdc-4d13-a621-cd449c754674","label":""}}}}},"\/service\/users\/asodi\/graph\/edge\/0db3718b-a45e-44bb-af95-97fe5c5ce4bc":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/edge\/0db3718b-a45e-44bb-af95-97fe5c5ce4bc","label":"r1"}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/c8d256d2-c173-43e8-8169-a66d2eb8a90d","label":""}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/asodi\/graph\/vertex\/129b61cf-1175-45dd-88e6-fa1af9f03ff9","label":""}}}}}},"suggestions":[],"isPublic":false}}},"edges":{}};
            };

            this.getMergeBubble = function(){
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "merge")
                        ]
                );
            };

            this.getBubble1 = function(){
                return new TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b1"
                )
            };

            this.getBubble2 = function(){
                return new TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b2"
                )
            };

            this.getBubble3 = function(){
                return new TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b3"
                )
            };

            this.getBubble4 = function(){
                return new TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b4"
                )
            };

            this.getBubble1 = function(){
                return new TreeQuerier(
                    getIncludedElementsTree()
                ).getBubbleWithLabelInTree(
                    "b1"
                )
            };

            this.getRelation1 = function(){
                return new TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r1"
                )
            };

            this.getRelation2 = function(){
                return new TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r2"
                )
            };

            this.getRelation4 = function(){
                return new TreeQuerier(
                    getIncludedElementsTree()
                ).getRelationWithLabelInTree(
                    "r4"
                )
            };

            this.getCenterBubbleUri = function(){
                return uriOfVertexWithLabel(this.getGraph(), "merge")
            };

            this.getMergeBubbleInTree = function(){
                return treeBuilder.getBubbleWithLabelInTree("merge");
            };
            Mock.setCenterVertexUriInUrl(this.getMergeBubble().getUri());
            function buildIncludedGraphElementsOfBubble(bubble){
                return GraphDisplayerAsRelativeTree.buildIncludedGraphElementsView(
                    bubble,
                    $("<div>")
                );
            }
            function getIncludedElementsTree(){
                if(undefined === includedElementsTree){
                    includedElementsTree = buildIncludedGraphElementsOfBubble(
                        self.getMergeBubbleInTree()
                    );
                }
                return includedElementsTree;
            }
        };

        api.threeBubblesGraph = function () {
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                /*
                 b1-r1->b2
                 b1-r2->b3
                 b3 has two hidden relations
                 */
                return {"vertices":{"\/service\/users\/aosdiv\/graph\/vertex\/c5cd4102-2c9c-4fbc-9340-add553e97b6d":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/c5cd4102-2c9c-4fbc-9340-add553e97b6d","label":"b1","comment":"","images":[],"creationDate":"Nov 23, 2014 2:17:07 PM","lastModificationDate":"Nov 23, 2014 2:17:09 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":2,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aosdiv\/graph\/vertex\/f9031a6f-e5c4-4999-a9e8-7a2392cd7eff":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/f9031a6f-e5c4-4999-a9e8-7a2392cd7eff","label":"b2","comment":"","images":[],"creationDate":"Nov 23, 2014 2:17:10 PM","lastModificationDate":"Nov 23, 2014 2:17:13 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aosdiv\/graph\/vertex\/dd9aeddc-78de-4823-91e1-2fb08e5d327b":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/dd9aeddc-78de-4823-91e1-2fb08e5d327b","label":"b3","comment":"","images":[],"creationDate":"Nov 23, 2014 2:17:13 PM","lastModificationDate":"Nov 23, 2014 2:17:46 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":3,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}}},"edges":{"\/service\/users\/aosdiv\/graph\/edge\/0b243a99-0a15-4896-aa20-d28bf4fb5045":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/edge\/0b243a99-0a15-4896-aa20-d28bf4fb5045","label":"r1","comment":"","images":[],"creationDate":"Nov 23, 2014 2:17:10 PM","lastModificationDate":"Nov 23, 2014 2:17:11 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/c5cd4102-2c9c-4fbc-9340-add553e97b6d"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/f9031a6f-e5c4-4999-a9e8-7a2392cd7eff"}}}}},"\/service\/users\/aosdiv\/graph\/edge\/ec2b2602-29b8-49be-af14-3c23705b9171":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/edge\/ec2b2602-29b8-49be-af14-3c23705b9171","label":"r2","comment":"","images":[],"creationDate":"Nov 23, 2014 2:17:13 PM","lastModificationDate":"Nov 23, 2014 2:17:44 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/c5cd4102-2c9c-4fbc-9340-add553e97b6d"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/dd9aeddc-78de-4823-91e1-2fb08e5d327b"}}}}}}};
            };

            this.reset = function () {
                treeBuilder = new TreeBuilder(this);
            };
            this.expandBubble3 = function(bubble3){
                return GraphDisplayerAsRelativeTree.addChildTreeUsingGraph(
                    bubble3,
                    getSurroundBubble3Graph()
                );
            };
            this.getBubble4InTree = function(){
                return treeBuilder.getBubbleWithLabelInTree("b4");
            };
            function getSurroundBubble3Graph(){
                /*
                    b3<-r2-b1
                    b3->r3-b4
                    b3-r4->b5
                    b4 has hidden relations
                 */
                return {"vertices":{"\/service\/users\/aosdiv\/graph\/vertex\/c5cd4102-2c9c-4fbc-9340-add553e97b6d":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/c5cd4102-2c9c-4fbc-9340-add553e97b6d","label":"b1","comment":"","images":[],"creationDate":"Nov 23, 2014 2:17:07 PM","lastModificationDate":"Nov 23, 2014 2:17:09 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":2,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aosdiv\/graph\/vertex\/f9050a7e-b442-4b5c-9e8c-d2674412e359":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/f9050a7e-b442-4b5c-9e8c-d2674412e359","label":"b5","comment":"","images":[],"creationDate":"Nov 23, 2014 2:18:20 PM","lastModificationDate":"Nov 23, 2014 2:18:24 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aosdiv\/graph\/vertex\/f2dd15f4-dbfd-40dc-a9be-2ba0ee173b69":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/f2dd15f4-dbfd-40dc-a9be-2ba0ee173b69","label":"b4","comment":"","images":[],"creationDate":"Nov 23, 2014 2:18:07 PM","lastModificationDate":"Nov 23, 2014 2:18:18 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":3,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aosdiv\/graph\/vertex\/dd9aeddc-78de-4823-91e1-2fb08e5d327b":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/dd9aeddc-78de-4823-91e1-2fb08e5d327b","label":"b3","comment":"","images":[],"creationDate":"Nov 23, 2014 2:17:13 PM","lastModificationDate":"Nov 23, 2014 2:17:46 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"numberOfConnectedEdges":3,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}}},"edges":{"\/service\/users\/aosdiv\/graph\/edge\/ec2b2602-29b8-49be-af14-3c23705b9171":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/edge\/ec2b2602-29b8-49be-af14-3c23705b9171","label":"r2","comment":"","images":[],"creationDate":"Nov 23, 2014 2:17:13 PM","lastModificationDate":"Nov 23, 2014 2:17:44 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/c5cd4102-2c9c-4fbc-9340-add553e97b6d"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/dd9aeddc-78de-4823-91e1-2fb08e5d327b"}}}}},"\/service\/users\/aosdiv\/graph\/edge\/843e9a8e-9ee0-491f-b0db-12bcaa380e34":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/edge\/843e9a8e-9ee0-491f-b0db-12bcaa380e34","label":"r4","comment":"","images":[],"creationDate":"Nov 23, 2014 2:18:07 PM","lastModificationDate":"Nov 23, 2014 2:18:09 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/dd9aeddc-78de-4823-91e1-2fb08e5d327b"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/f2dd15f4-dbfd-40dc-a9be-2ba0ee173b69"}}}}},"\/service\/users\/aosdiv\/graph\/edge\/46cdb7b3-4e29-49de-9e11-a924a625dd47":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/edge\/46cdb7b3-4e29-49de-9e11-a924a625dd47","label":"r5","comment":"","images":[],"creationDate":"Nov 23, 2014 2:18:20 PM","lastModificationDate":"Nov 23, 2014 2:18:23 PM"},"genericIdentifications":{},"sameAs":{},"additionalTypes":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/dd9aeddc-78de-4823-91e1-2fb08e5d327b"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aosdiv\/graph\/vertex\/f9050a7e-b442-4b5c-9e8c-d2674412e359"}}}}}}};
            }
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "b1")
            };
            this.getBubble1 = function () {
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "b1")
                        ]
                );
            };
            this.getBubble2InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b2");
            };
            this.getBubble3InTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b3");
            };
            this.getRelation1InTree = function () {
                return treeBuilder.getRelationWithLabelInTree(
                    "r1"
                );
            };
            this.getBubble1Ui = function () {
                return VertexHtmlBuilder.withServerFacade(
                    this.getBubble1()
                ).create();
            };
            this.getBubble2 = function () {
                return Vertex.fromServerFormat(this.getGraph().vertices[
                        uriOfVertexWithLabel(this.getGraph(), "b2")
                        ]
                );
            };
            this.getBubble2Ui = function () {
                return VertexHtmlBuilder.withServerFacade(
                    this.getBubble2()
                ).create();
            };
            this.getCenterBubbleInTree = function () {
                return treeBuilder.getBubbleWithLabelInTree("b1");
            };
            this.getRelation1 = function () {
                return relationWithLabel(this.getGraph(), "r1");
            };
            this.getRelation1Ui = function () {
                var edge = EdgeHtmlBuilder.withServerFacade(
                    this.getRelation1()
                ).create();
                EdgeHtmlBuilder.afterChildBuilt(
                    edge,
                    this.getBubble1Ui(),
                    this.getBubble2Ui()
                );
                return edge;
            };
            this.getRelation2 = function () {
                return relationWithLabel(this.getGraph(), "r2");
            };
            var graph = this.getGraph();
            Mock.setCenterVertexUriInUrl(this.getBubble2().getUri());
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
            var treeBuilder = new TreeBuilder(this);
            this.getGraph = function () {
                /*
                 me-Possession of book 1->book 1
                 me<-Possessed by book 2-book 2
                 me-Possession of book 3->book 3
                 me-other relation->other bubble
                 me-original relation->b1
                 me-same as original relation->b2
                 */
                return {"vertices":{"\/service\/users\/aovsd\/graph\/vertex\/ec9c245f-3534-479b-b2fb-676ea8d95e44":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/ec9c245f-3534-479b-b2fb-676ea8d95e44","label":"book 1","comment":"","images":[],"creationDate":"Dec 24, 2014 2:13:32 PM","lastModificationDate":"Dec 24, 2014 2:15:00 PM"},"identifications":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aovsd\/graph\/vertex\/6c08199d-4f2f-4e27-a3cc-673ae87ca187":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/6c08199d-4f2f-4e27-a3cc-673ae87ca187","label":"book 2","comment":"","images":[],"creationDate":"Dec 24, 2014 2:13:33 PM","lastModificationDate":"Dec 24, 2014 2:15:05 PM"},"identifications":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aovsd\/graph\/vertex\/c1fc9c9a-ce5e-42c2-8c9d-d2fc49297bff":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/c1fc9c9a-ce5e-42c2-8c9d-d2fc49297bff","label":"b2","comment":"","images":[],"creationDate":"Dec 24, 2014 2:15:48 PM","lastModificationDate":"Dec 24, 2014 2:15:59 PM"},"identifications":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aovsd\/graph\/vertex\/9b2906f9-3394-4e01-bb68-58e494d66c61":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/9b2906f9-3394-4e01-bb68-58e494d66c61","label":"b1","comment":"","images":[],"creationDate":"Dec 24, 2014 2:15:32 PM","lastModificationDate":"Dec 24, 2014 2:15:46 PM"},"identifications":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aovsd\/graph\/vertex\/a1589408-55b7-418d-80cf-ebd7eff4a722":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/a1589408-55b7-418d-80cf-ebd7eff4a722","label":"other bubble","comment":"","images":[],"creationDate":"Dec 24, 2014 2:15:10 PM","lastModificationDate":"Dec 24, 2014 2:15:21 PM"},"identifications":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aovsd\/graph\/vertex\/eb4a368a-235b-4c95-bd98-2223481c2dee":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/eb4a368a-235b-4c95-bd98-2223481c2dee","label":"book 3","comment":"","images":[],"creationDate":"Dec 24, 2014 2:14:48 PM","lastModificationDate":"Dec 24, 2014 2:15:02 PM"},"identifications":{}},"numberOfConnectedEdges":1,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}},"\/service\/users\/aovsd\/graph\/vertex\/679aeafb-f63f-404b-a8bf-ae29cd205e34":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/679aeafb-f63f-404b-a8bf-ae29cd205e34","label":"me","comment":"","images":[],"creationDate":"Dec 24, 2014 2:13:29 PM","lastModificationDate":"Dec 24, 2014 2:13:32 PM"},"identifications":{}},"numberOfConnectedEdges":6,"includedVertices":{},"includedEdges":{},"suggestions":[],"isPublic":false}}},"edges":{"\/service\/users\/aovsd\/graph\/edge\/540ad668-0cbf-4172-9126-d95f05042740":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/edge\/540ad668-0cbf-4172-9126-d95f05042740","label":"original relation","comment":"","images":[],"creationDate":"Dec 24, 2014 2:15:32 PM","lastModificationDate":"Dec 24, 2014 2:15:37 PM"},"identifications":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/679aeafb-f63f-404b-a8bf-ae29cd205e34"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/9b2906f9-3394-4e01-bb68-58e494d66c61"}}}}},"\/service\/users\/aovsd\/graph\/edge\/070ef2c9-6d1b-4ef5-af2a-ead808aa2f53":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/edge\/070ef2c9-6d1b-4ef5-af2a-ead808aa2f53","label":"Possessed by book 2","comment":"","images":[],"creationDate":"Dec 24, 2014 2:13:33 PM","lastModificationDate":"Dec 24, 2014 2:14:43 PM"},"identifications":{"http:\/\/rdf.freebase.com\/rdf\/m\/0613q":{"externalResourceUri":"http:\/\/rdf.freebase.com\/rdf\/m\/0613q","friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/identification\/2d0e67c1-ba0a-4761-888c-8c69c1fd0699","label":"Possession","comment":"In law, possession is the control a person intentionally exercises toward a thing. In all cases, to possess something, a person must have an intention to possess it. A person may be in possession of some property. Like ownership, the possession of things is commonly regulated by states under property law.","images":[],"creationDate":"Dec 24, 2014 2:17:05 PM","lastModificationDate":"Dec 24, 2014 2:17:05 PM"},"identificationType":"same_as"}}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/6c08199d-4f2f-4e27-a3cc-673ae87ca187"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/679aeafb-f63f-404b-a8bf-ae29cd205e34"}}}}},"\/service\/users\/aovsd\/graph\/edge\/0a668097-67a4-493d-a09a-a12aaaf4b718":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/edge\/0a668097-67a4-493d-a09a-a12aaaf4b718","label":"same as original relation","comment":"","images":[],"creationDate":"Dec 24, 2014 2:15:48 PM","lastModificationDate":"Dec 24, 2014 2:16:02 PM"},"identifications":{"\/service\/users\/aovsd\/graph\/edge\/540ad668-0cbf-4172-9126-d95f05042740":{"externalResourceUri":"\/service\/users\/aovsd\/graph\/edge\/540ad668-0cbf-4172-9126-d95f05042740","friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/identification\/2b76378d-ee38-403d-a028-c0bfb766d40f","label":"original relation","comment":"","images":[],"creationDate":"Dec 24, 2014 2:16:05 PM","lastModificationDate":"Dec 24, 2014 2:16:05 PM"},"identificationType":"same_as"}}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/679aeafb-f63f-404b-a8bf-ae29cd205e34"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/c1fc9c9a-ce5e-42c2-8c9d-d2fc49297bff"}}}}},"\/service\/users\/aovsd\/graph\/edge\/30823991-20a7-481e-8a41-fe9b40a10ac9":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/edge\/30823991-20a7-481e-8a41-fe9b40a10ac9","label":"other relation","comment":"","images":[],"creationDate":"Dec 24, 2014 2:15:10 PM","lastModificationDate":"Dec 24, 2014 2:15:16 PM"},"identifications":{}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/679aeafb-f63f-404b-a8bf-ae29cd205e34"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/a1589408-55b7-418d-80cf-ebd7eff4a722"}}}}},"\/service\/users\/aovsd\/graph\/edge\/5a7f93fc-9fd7-4820-a687-6bb10c35bba0":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/edge\/5a7f93fc-9fd7-4820-a687-6bb10c35bba0","label":"Possession of book 3","comment":"","images":[],"creationDate":"Dec 24, 2014 2:14:48 PM","lastModificationDate":"Dec 24, 2014 2:14:53 PM"},"identifications":{"http:\/\/rdf.freebase.com\/rdf\/m\/0613q":{"externalResourceUri":"http:\/\/rdf.freebase.com\/rdf\/m\/0613q","friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/identification\/2722a9a0-2d4e-476d-b745-be5677a9a45e","label":"Possession","comment":"In law, possession is the control a person intentionally exercises toward a thing. In all cases, to possess something, a person must have an intention to possess it. A person may be in possession of some property. Like ownership, the possession of things is commonly regulated by states under property law.","images":[],"creationDate":"Dec 24, 2014 2:17:19 PM","lastModificationDate":"Dec 24, 2014 2:17:19 PM"},"identificationType":"same_as"}}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/679aeafb-f63f-404b-a8bf-ae29cd205e34"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/eb4a368a-235b-4c95-bd98-2223481c2dee"}}}}},"\/service\/users\/aovsd\/graph\/edge\/fad86595-b6ee-4b8d-bb04-75e331537189":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/edge\/fad86595-b6ee-4b8d-bb04-75e331537189","label":"Possession of book 1","comment":"","images":[],"creationDate":"Dec 24, 2014 2:13:32 PM","lastModificationDate":"Dec 24, 2014 2:13:44 PM"},"identifications":{"http:\/\/rdf.freebase.com\/rdf\/m\/0613q":{"externalResourceUri":"http:\/\/rdf.freebase.com\/rdf\/m\/0613q","friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/identification\/26f15fd5-3f50-4585-968c-3547df140681","label":"Possession","comment":"In law, possession is the control a person intentionally exercises toward a thing. In all cases, to possess something, a person must have an intention to possess it. A person may be in possession of some property. Like ownership, the possession of things is commonly regulated by states under property law.","images":[],"creationDate":"Dec 24, 2014 2:16:53 PM","lastModificationDate":"Dec 24, 2014 2:16:53 PM"},"identificationType":"same_as"}}},"sourceVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/679aeafb-f63f-404b-a8bf-ae29cd205e34"}}}},"destinationVertex":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/ec9c245f-3534-479b-b2fb-676ea8d95e44"}}}}}}};
            };
            this.getCenterBubbleUri = function () {
                return uriOfVertexWithLabel(this.getGraph(), "me")
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
                    possessionExternalUri = this.getPossession().getExternalResourceUri();
                TreeDisplayerCommon.enhancedVerticesInfo(
                    graph,
                    centerVertexUri
                );
                var centerVertex = graph.vertices[centerVertexUri];
                return centerVertex.similarRelations[
                    possessionExternalUri
                    ];
            };
            this.getPossessionAsGroupRelationUi = function () {
                return GroupRelationHtmlBuilder.withServerFacade(
                    this.getPossessionAsGroupRelation()
                ).create();
            };
            this.getPossessionAsGroupRelationInTree = function () {
                return treeBuilder.getRelationWithLabelInTree("Possession");
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
            this.getRelationWithBook1InTree = function () {
                return treeBuilder.getRelationWithLabelInTree(
                    "Possession of book 1"
                );
            };
            this.getRelationWithBook2InTree = function () {
                return treeBuilder.getRelationWithLabelInTree(
                    "Possessed by book 2"
                );
            };
            this.getOtherRelation = function () {
                return relationWithLabel(graph, "other relation");
            };
            Mock.setCenterVertexUriInUrl(this.getCenterVertex().getUri());
        };
        api.oneBubbleHavingSuggestionsGraph = function () {
            this.getGraph = function () {
                return {"vertices":{"\/service\/users\/aovsd\/graph\/vertex\/9a4b7b00-6679-4003-9f19-e6d647964c58":{"vertex":{"graphElement":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/vertex\/9a4b7b00-6679-4003-9f19-e6d647964c58","label":"Event","comment":"","images":[],"creationDate":"Dec 24, 2014 2:19:08 PM","lastModificationDate":"Dec 24, 2014 2:19:10 PM"},"identifications":{"http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t":{"externalResourceUri":"http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t","friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/identification\/18989e81-820c-446d-8c0f-7b2db8a38e01","label":"Event","comment":"An event is a topic that can be described by the time or date at which it happened. Long-lasting events may be described as occurring between two dates. It is sometimes appropriate to create abstract events, as collections of other events -- like World War II, or Opposition to the Vietnam War, but use your best judgment here, as some topics are surely too abstract to be considered a collection of events, like 'democracy'.","images":[],"creationDate":"Dec 24, 2014 2:19:26 PM","lastModificationDate":"Dec 24, 2014 2:19:26 PM"},"identificationType":"generic"}}},"numberOfConnectedEdges":0,"includedVertices":{},"includedEdges":{},"suggestions":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/02e7633b-b324-0bca-90ef-4574d4c21f55","label":"Start date","comment":""},"sameAs":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event\/start_date","label":"Start date","comment":"when it began"},"type":{"uri":"http:\/\/rdf.freebase.com\/rdf\/type\/datetime","label":"Date\/Time","comment":"the concept type of dates."},"origins":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/02e7633b-b324-0bca-90ef-4574d4c21f55\/origin\/777e516f-4de1-78fe-6bb5-e5d24e320728","label":"","comment":""},"origin":"identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}]},{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/d2c3ee5e-eb94-4c8c-ff96-d81c3a5aab14","label":"End date","comment":""},"sameAs":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event\/end_date","label":"End date","comment":"when it ended. leave blank if it continues"},"type":{"uri":"http:\/\/rdf.freebase.com\/rdf\/type\/datetime","label":"Date\/Time","comment":"the concept type of dates."},"origins":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/d2c3ee5e-eb94-4c8c-ff96-d81c3a5aab14\/origin\/a0d3c518-a27e-f096-7e8b-3cf0342f4765","label":"","comment":""},"origin":"identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}]},{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/1bc88c55-88e2-6f7d-3f3d-7715ac51d592","label":"Location(s)","comment":""},"sameAs":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event\/locations","label":"Location(s)","comment":"Where this event happened; this can be in multiple locations. When deciding which location to list, it is best to use the most specific location that makes sense.  E.g., for the event \"Assassination of Abraham Lincoln,\" the best location to use would be \"Ford's Theatre;\" \"Washington, DC\" would be okay, and \"United States,\" while strictly accurate, would be a poorer choice. However, for an event like the the Chinese Civil War, \"China\" would be the best location, since the event occurred throughout China."},"type":{"uri":"http:\/\/rdf.freebase.com\/rdf\/location\/location","label":"Location","comment":"The Location type is used for any topic with a fixed location on the planet Earth. It includes geographic features such as oceans and mountains, political entities like cities and man-made objects like buildings.Guidelines for filling in location properties:geolocation: the longitude and latitude (in decimal notation) of the feature, or of the geographical center (centroid) fo the feature.contains and contained by: these properties can be used to show spatial relationships between different locations, such as an island contained by a body of water (which is equivalent to saying the body of water contains the island), a state contained by a country, a mountain within the borders of a national park, etc. For geopolitical locations,   containment two levels up and down is the ideal minimum. For example, the next two levels up for the city of Detroit are Wayne County and the state of Michigan.adjoins: also used to show spatial relations, in this case between locations that share a border.USBG Name: A unique name given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. More information can be found on their website. GNIS ID: A unique id given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. GNIS stands for Geographic Names Information System. More information can be found on their website.GEOnet Feature ID: The UFI (Unique Feature ID) used by GeoNet for features outside of the United States. More information can be found on their website."},"origins":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/1bc88c55-88e2-6f7d-3f3d-7715ac51d592\/origin\/f4da240d-f403-3415-4d2b-7a8a48971e2b","label":"","comment":""},"origin":"identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}]},{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/db784895-d9f1-d8cb-8c5f-f32979ce36f6","label":"People involved","comment":""},"sameAs":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event\/people_involved","label":"People involved","comment":""},"type":{"uri":"http:\/\/rdf.freebase.com\/rdf\/people\/person","label":"Person","comment":"A person is a human being (man, woman or child) known to have actually existed. Living persons, celebrities and politicians are persons, as are deceased persons.\n\nNote: A person topic is distinct from a user in Metaweb. Users have profiles that can only be edited by the users themselves. A person topic can be edited by anyone and is intended as a factual representation of details about a person.\n\nFor more information, please see the Freebase wiki page on person."},"origins":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/db784895-d9f1-d8cb-8c5f-f32979ce36f6\/origin\/95cead13-affa-d7ef-eb24-761fcf7d10ac","label":"","comment":""},"origin":"identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}]},{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/90266c8d-fedb-ea82-744e-f6f7765a6303","label":"Included in event","comment":""},"sameAs":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event\/included_in_event","label":"Included in event","comment":"if it is part of a larger event, like 'battle of vimy ridge' is part of 'ww1'"},"type":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event","label":"Event","comment":"An event is a topic that can be described by the time or date at which it happened. Long-lasting events may be described as occurring between two dates. It is sometimes appropriate to create abstract events, as collections of other events -- like World War II, or Opposition to the Vietnam War, but use your best judgment here, as some topics are surely too abstract to be considered a collection of events, like 'democracy'."},"origins":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/90266c8d-fedb-ea82-744e-f6f7765a6303\/origin\/861ea1b7-321b-56a1-4b2f-20ef9a0afda9","label":"","comment":""},"origin":"identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}]},{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/e365ecf8-29fe-8b79-f461-499731a0eb2d","label":"Includes event","comment":""},"sameAs":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event\/includes_event","label":"Includes event","comment":"if this event has parts, that are documented in freebase. for shorter sub-events that are documented more closely. like how 'WW1' includes  'battle of vimy ridge'"},"type":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event","label":"Event","comment":"An event is a topic that can be described by the time or date at which it happened. Long-lasting events may be described as occurring between two dates. It is sometimes appropriate to create abstract events, as collections of other events -- like World War II, or Opposition to the Vietnam War, but use your best judgment here, as some topics are surely too abstract to be considered a collection of events, like 'democracy'."},"origins":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/e365ecf8-29fe-8b79-f461-499731a0eb2d\/origin\/3dc471fe-a325-3fb4-4aac-8713c4376d38","label":"","comment":""},"origin":"identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}]},{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/fd96ab05-413f-0e78-810f-9d953258dd53","label":"Instance of recurring event","comment":""},"sameAs":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event\/instance_of_recurring_event","label":"Instance of recurring event","comment":"If this event is one in a series of recurring events, enter the general name of the recurring event."},"type":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/recurring_event","label":"Recurring event","comment":"A Recurring Event represents a series of individual related events. An example is a film festival -- the Berlin Film Festival is a recurring event; individual festivals, such as 1952 Berlin Film Festival, would then be typed as Events, and linked in using the \"instances\" property of Recurring Event.  Other examples of recurring events include conferences, conventions, sports championships, other types of festivals, many contests, etc."},"origins":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/fd96ab05-413f-0e78-810f-9d953258dd53\/origin\/1f6caa1d-b5f7-8a74-c33b-c7b95fbfcda4","label":"","comment":""},"origin":"identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}]},{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/ad095be1-0db7-5478-a157-c9251c9fc09a","label":"Comment","comment":""},"sameAs":{"uri":"http:\/\/rdf.freebase.com\/rdf\/time\/event\/comment","label":"Comment","comment":"Comments, disclaimers or notes about this event."},"type":{"uri":"http:\/\/rdf.freebase.com\/rdf\/type\/text","label":"Text","comment":"the concept type of language-specific text. note that text looks like a string in the json representation unless someone asks for the type and\/or language. language choices will be handled very specially by the middle tier, based on external data like the HTTP Accept-Language header."},"origins":[{"friendlyResource":{"uri":"\/service\/users\/aovsd\/suggestion\/ad095be1-0db7-5478-a157-c9251c9fc09a\/origin\/84207b13-48b8-85e4-73d4-889b7d6233ac","label":"","comment":""},"origin":"identification_http:\/\/rdf.freebase.com\/rdf\/m\/02xm94t"}]}],"isPublic":false}}},"edges":{}};
            };
            var graph = this.getGraph();
            this.getVertex = function () {
                return Vertex.fromServerFormat(graph.vertices[
                        uriOfVertexWithLabel(graph, "Event")
                        ]
                );
            };
            this.getOneSuggestion = function () {
                return this.getVertex().getSuggestions()[0];
            };
            this.getAVertexSuggestionUi = function () {
                return SuggestionBubbleHtmlBuilder.withServerFacade(
                    this.getOneSuggestion()
                ).create();
            };
            this.getARelationSuggestionUi = function () {
                return SuggestionRelationBuilder.withServerFacade(
                    this.getOneSuggestion()
                ).create();
            };
            Mock.setCenterVertexUriInUrl(this.getVertex().getUri());
        };
        api.getKaraokeSchemaGraph = function () {
            /*
                karaoke->invitees
                karaoke->repertoire
                karaoke->location
                location identified to Freebase Location
             */
            this.getGraph = function () {
                return {"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/schema\/cd67eeab-6de9-425d-822e-6c05b7493c85","label":"karaoke","comment":"","images":[],"creationDate":"Dec 24, 2014 2:23:49 PM","lastModificationDate":"Dec 24, 2014 2:24:01 PM"},"properties":{"\/service\/users\/aovsd\/graph\/schema\/cd67eeab-6de9-425d-822e-6c05b7493c85\/property\/fb4714c5-cce7-43a7-9146-eabdb784cd1d":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/schema\/cd67eeab-6de9-425d-822e-6c05b7493c85\/property\/fb4714c5-cce7-43a7-9146-eabdb784cd1d","label":"repertoire","comment":"","images":[],"creationDate":"Dec 24, 2014 2:24:07 PM","lastModificationDate":"Dec 24, 2014 2:24:10 PM"},"identifications":{}},"\/service\/users\/aovsd\/graph\/schema\/cd67eeab-6de9-425d-822e-6c05b7493c85\/property\/8fbfebcf-861d-48ce-82d1-93a8715bda95":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/schema\/cd67eeab-6de9-425d-822e-6c05b7493c85\/property\/8fbfebcf-861d-48ce-82d1-93a8715bda95","label":"location","comment":"","images":[],"creationDate":"Dec 24, 2014 2:24:11 PM","lastModificationDate":"Dec 24, 2014 2:24:15 PM"},"identifications":{"http:\/\/rdf.freebase.com\/rdf\/m\/01n7":{"externalResourceUri":"http:\/\/rdf.freebase.com\/rdf\/m\/01n7","friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/identification\/e03aefcd-83a8-4fc3-898f-8803e352f4bf","label":"Location","comment":"The Location type is used for any topic with a fixed location on the planet Earth. It includes geographic features such as oceans and mountains, political entities like cities and man-made objects like buildings.Guidelines for filling in location properties:geolocation: the longitude and latitude (in decimal notation) of the feature, or of the geographical center (centroid) fo the feature.contains and contained by: these properties can be used to show spatial relationships between different locations, such as an island contained by a body of water (which is equivalent to saying the body of water contains the island), a state contained by a country, a mountain within the borders of a national park, etc. For geopolitical locations,   containment two levels up and down is the ideal minimum. For example, the next two levels up for the city of Detroit are Wayne County and the state of Michigan.adjoins: also used to show spatial relations, in this case between locations that share a border.USBG Name: A unique name given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. More information can be found on their website. GNIS ID: A unique id given to geographic features within the U.S. and its territories by the United States Board on Geographic Names. GNIS stands for Geographic Names Information System. More information can be found on their website.GEOnet Feature ID: The UFI (Unique Feature ID) used by GeoNet for features outside of the United States. More information can be found on their website.","images":[],"creationDate":"Dec 24, 2014 2:24:37 PM","lastModificationDate":"Dec 24, 2014 2:24:37 PM"},"identificationType":"same_as"}}},"\/service\/users\/aovsd\/graph\/schema\/cd67eeab-6de9-425d-822e-6c05b7493c85\/property\/ee24ba1e-01a7-4745-ae8d-bc220cd2cfd9":{"friendlyResource":{"uri":"\/service\/users\/aovsd\/graph\/schema\/cd67eeab-6de9-425d-822e-6c05b7493c85\/property\/ee24ba1e-01a7-4745-ae8d-bc220cd2cfd9","label":"invitees","comment":"","images":[],"creationDate":"Dec 24, 2014 2:24:01 PM","lastModificationDate":"Dec 24, 2014 2:24:06 PM"},"identifications":{}}}};
            };
            var graph = this.getGraph();
            this.getSchema = function () {
                return Schema.fromServerFormat(
                    graph
                );
            };
            this.getProperties = function(){
                return this.getSchema().getProperties();
            };
            this.getSchemaUi = function () {
                return SchemaHtmlBuilder.withServerFacade(
                    this.getSchema()
                ).create();
            };
            this.getInviteesPropertyUi = function () {
                return PropertyHtmlBuilder.withServerFacade(
                    this.getInviteesProperty()
                ).create();
            };
            this.getLocationProperty = function () {
                return schemaPropertyWithLabel(
                    this.getSchema(),
                    "location"
                );
            };
            this.getLocationPropertyAsSuggestion = function(){
                return Suggestion.fromSchemaPropertyAndOriginUri(
                    this.getLocationProperty(),
                    this.getSchema().getUri()
                );
            };
            this.getInviteesProperty = function () {
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

        function makeTree(graph, centralVertexUri) {
            GraphDisplayer.reset();
            var tree = new GraphDisplayerAsRelativeTree.TreeMaker()
                .makeForCenterVertex(
                graph,
                centralVertexUri
            );

            GraphDisplayer.getVertexSelector().visitAllVertices(function (vertex) {
                EventBus.publish(
                    '/event/ui/vertex/visit_after_graph_drawn',
                    vertex
                );
            });
            GraphDisplayer.getGroupRelationSelector().visitAll(function (groupRelationUi) {
                EventBus.publish(
                    '/event/ui/group_relation/visit_after_graph_drawn',
                    groupRelationUi
                );
            });
            return tree;
        }

        function TreeBuilder(context) {
            this.build = function () {
                if (this._tree === undefined) {
                    this._tree = makeTree(
                        context.getGraph(),
                        context.getCenterBubbleUri()
                    );
                }
                return this._tree;
           };
            this.getBubbleWithLabelInTree = function (label) {
                return new TreeQuerier(
                    this.build()
                ).getBubbleWithLabelInTree(label);
            };
            this.getRelationWithLabelInTree = function (label) {
                return new TreeQuerier(
                    this.build()
                ).getRelationWithLabelInTree(label);
            };
        }

        function TreeQuerier(tree){
            this.getBubbleWithLabelInTree = function (label) {
                return BubbleFactory.fromHtml(
                    tree.find(".bubble").has(".bubble-label:contains(" + label + ")")
                );
            };
            this.getRelationWithLabelInTree = function (label) {
                return BubbleFactory.fromHtml(
                    tree.find(".relation").has(".label:contains(" + label + ")")
                );
            };
        }

        function generateVertex() {
            return Vertex.fromServerFormat(
                VertexServerFormatBuilder.buildWithUri(
                    generateVertexUri()
                )
            );
        }

        function generateEdge(sourceVertexUri, destinationVertexUri) {
            return Edge.fromServerFormat(
                Edge.buildObjectWithUriOfSelfSourceAndDestinationVertex(
                    generateEdgeUri(),
                    sourceVertexUri,
                    destinationVertexUri
                )
            );
        }

        function generateVertexUri() {
            return "\/service\/users\/foo\/graph\/vertex\/" + generateUuid();
        }

        function generateEdgeUri() {
            return "\/service\/users\/foo\/graph\/edge\/" + generateUuid();
        }

        function generateUuid() {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
        }
    }
);


/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'triple_brain.graph_displayer_as_tree_common',
    'triple_brain.graph_displayer_as_relative_tree'
], function (Scenarios, TestUtils, TreeDisplayerCommon, GraphDisplayerAsRelativeTree) {
    "use strict";
    describe("graph_displayer_as_tree_common", function () {
        var similarRelationsScenario,
            graph,
            centerVertex,
            possession;
        it("groups similar relations", function () {
            defineSimilarRelationsScenarioVariables();
            expect(centerVertex.similarRelations).toBeUndefined();
            TreeDisplayerCommon.enhancedVerticesInfo(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            expect(centerVertex.similarRelations).toBeDefined();
            expect(centerVertex.similarRelations[possession.getExternalResourceUri()]).toBeDefined();
            var numberOfRelations = Object.keys(graph.edges);
            expect(numberOfRelations.length).toBe(7);
            var numberOfGroupedRelations = Object.keys(centerVertex.similarRelations);
            expect(numberOfGroupedRelations.length).toBe(4);
        });
        it("creates only one group relation when different relations have multiple identifiers that are the same", function(){
            defineSimilarRelationsScenarioVariables();
            var relationWithMultipleIdentifiersScenario = new Scenarios.relationWithMultipleIdentifiers();
            var graph = relationWithMultipleIdentifiersScenario.getGraph();
            var centerVertexUri = relationWithMultipleIdentifiersScenario.getCenterBubbleUri();
            TreeDisplayerCommon.enhancedVerticesInfo(
                graph,
                centerVertexUri
            );
            var teamVertex = graph.vertices[centerVertexUri];
            var numberOfSimilarRelations = Object.keys(teamVertex.similarRelations).length;
            expect(
                numberOfSimilarRelations
            ).toBe(2);
        });
        it("relations with no identifications are grouped by relation uri", function () {
            defineSimilarRelationsScenarioVariables();
            TreeDisplayerCommon.enhancedVerticesInfo(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            var otherRelation = similarRelationsScenario.getOtherRelation();
            expect(centerVertex.similarRelations[otherRelation.getUri()]).toBeDefined();
        });
        it("vertices include inverse relations", function(){
            var inverseRelationsScenario = new Scenarios.GraphWithAnInverseRelationScenario(),
                graph = inverseRelationsScenario.getGraph(),
                centerVertex = inverseRelationsScenario.getCenterVertex();
            TreeDisplayerCommon.enhancedVerticesInfo(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            var objectKeys = Object.keys(centerVertex.similarRelations);
            expect(objectKeys.length).toBe(2);
        });
        it("relations are set even when graph is deep", function(){
            var deepGraphScenario = new Scenarios.deepGraph();
            var graph = deepGraphScenario.getGraph(),
                centerVertex = deepGraphScenario.getCenterVertex();
            TreeDisplayerCommon.enhancedVerticesInfo(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            var numberOfGroupedRelations = Object.keys(
                centerVertex.similarRelations
            ).length;
            expect(numberOfGroupedRelations).toBe(
                2
            );
        });
        it("inverse relations are set even when graph is deep", function(){
            var deepGraphScenario = new Scenarios.deepGraph();
            var graph = deepGraphScenario.getGraph();
            TreeDisplayerCommon.enhancedVerticesInfo(
                graph,
                deepGraphScenario.getCenterVertex().getUri()
            );
            var bubble2 = graph.vertices[
                deepGraphScenario.getBubble2().getUri()
            ];
            var numberOfGroupedRelations = Object.keys(
                bubble2.similarRelations
            ).length;
            expect(numberOfGroupedRelations).toBe(
                2
            );
        });
        it("handles relations that are in 2 groups", function(){
            var scenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup();
            var centerBubble = scenario.getSomeProjectInTree();
            expect(
                TestUtils.hasChildWithLabel(
                    centerBubble,
                    "impact 3"
                )
            ).toBeTruthy();
            var groupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Impact on society"
            );
            expect(
                groupRelation.isGroupRelation()
            ).toBeTruthy();
            GraphDisplayerAsRelativeTree.expandGroupRelation(groupRelation);
            expect(
                TestUtils.hasChildWithLabel(
                    groupRelation,
                    "impact 3"
                )
            ).toBeTruthy();
        });
        function defineSimilarRelationsScenarioVariables(){
            similarRelationsScenario = new Scenarios.GraphWithSimilarRelationsScenario();
            graph = similarRelationsScenario.getGraph();
            centerVertex = similarRelationsScenario.getCenterVertex();
            possession = similarRelationsScenario.getPossession();
        }
    });
});



/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'triple_brain.graph_displayer_as_tree_common',
    'triple_brain.graph_displayer_as_relative_tree',
    'triple_brain.identification'
], function (Scenarios, TestUtils, Mock, TreeDisplayerCommon, GraphDisplayerAsRelativeTree, Identification) {
    "use strict";
    describe("graph_displayer_as_tree_common", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        var similarRelationsScenario,
            graph,
            centerVertex,
            possession;
        it("groups similar relations", function () {
            defineSimilarRelationsScenarioVariables();
            expect(centerVertex.groupRelationRoots).toBeUndefined();
            TreeDisplayerCommon.setUiTreeInfoToVertices(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            expect(centerVertex.groupRelationRoots).toBeDefined();
            expect(
                groupRelationsHaveIdentifier(
                    centerVertex.groupRelationRoots,
                    possession
                )
            ).toBeTruthy();
            var numberOfRelations = Object.keys(graph.edges);
            expect(numberOfRelations.length).toBe(8);
            var numberOfGroupedRelations = Object.keys(centerVertex.groupRelationRoots);
            expect(numberOfGroupedRelations.length).toBe(4);
        });
        it("creates only one group relation when different relations have multiple identifiers that are the same", function () {
            defineSimilarRelationsScenarioVariables();
            var relationWithMultipleIdentifiersScenario = new Scenarios.relationWithMultipleIdentifiers();
            var graph = relationWithMultipleIdentifiersScenario.getGraph();
            var centerVertexUri = relationWithMultipleIdentifiersScenario.getCenterBubbleUri();
            TreeDisplayerCommon.setUiTreeInfoToVertices(
                graph,
                centerVertexUri
            );
            var teamVertex = graph.vertices[centerVertexUri];
            var numberOfSimilarRelations = Object.keys(teamVertex.groupRelationRoots).length;
            expect(
                numberOfSimilarRelations
            ).toBe(3);
        });
        it("relations with no identifications are grouped by relation uri", function () {
            defineSimilarRelationsScenarioVariables();
            TreeDisplayerCommon.setUiTreeInfoToVertices(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            var otherRelation = similarRelationsScenario.getOtherRelation();
            expect(
                groupRelationsHaveIdentifier(
                    centerVertex.groupRelationRoots,
                    Identification.fromFriendlyResource(
                        otherRelation
                    )
                )
            ).toBeTruthy();
        });

        it("vertices include inverse relations", function () {
            var inverseRelationsScenario = new Scenarios.GraphWithAnInverseRelationScenario(),
                graph = inverseRelationsScenario.getGraph(),
                centerVertex = inverseRelationsScenario.getCenterVertex();
            TreeDisplayerCommon.setUiTreeInfoToVertices(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            var objectKeys = Object.keys(centerVertex.groupRelationRoots);
            expect(objectKeys.length).toBe(2);
        });
        it("relations are set even when graph is deep", function () {
            var deepGraphScenario = new Scenarios.deepGraph();
            var graph = deepGraphScenario.getGraph(),
                centerVertex = deepGraphScenario.getCenterVertex();
            TreeDisplayerCommon.setUiTreeInfoToVertices(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            var numberOfGroupedRelations = Object.keys(
                centerVertex.groupRelationRoots
            ).length;
            expect(numberOfGroupedRelations).toBe(
                2
            );
        });
        it("inverse relations are set even when graph is deep", function () {
            var deepGraphScenario = new Scenarios.deepGraph();
            var graph = deepGraphScenario.getGraph();
            TreeDisplayerCommon.setUiTreeInfoToVertices(
                graph,
                deepGraphScenario.getCenterVertex().getUri()
            );
            var bubble2 = graph.vertices[
                deepGraphScenario.getBubble2().getUri()
                ];
            var numberOfGroupedRelations = Object.keys(
                bubble2.groupRelationRoots
            ).length;
            expect(numberOfGroupedRelations).toBe(
                2
            );
        });
        it("handles relations that are in 2 groups", function () {
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
        it("can handle a special case", function(){
            var scenario = new Scenarios.groupRelationSpecialCase();
            scenario.getCenterBubbleInTree();
            //testing true to be truthy to test if there is no js error at this point
            expect(true).toBeTruthy();
        });

        it("does not duplicate relations on the same level sharing more than one common meta", function(){
            var scenario = new Scenarios.sameLevelRelationsWithMoreThanOneCommonMetaScenario();
            var centerBubble = scenario.getCenterBubbleInTree();
            var groupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Creator"
            );
            expect(
                groupRelation.isGroupRelation()
            ).toBeTruthy();
            expect(
                groupRelation.getNumberOfChild()
            ).toBe(2);
        });
        function defineSimilarRelationsScenarioVariables() {
            similarRelationsScenario = new Scenarios.GraphWithSimilarRelationsScenario();
            graph = similarRelationsScenario.getGraph();
            centerVertex = similarRelationsScenario.getCenterVertex();
            possession = similarRelationsScenario.getPossession();
        }

        function groupRelationsHaveIdentifier(groupRelations, identifier) {
            var hasPossessionIdentification = false;
            groupRelations.forEach(function (groupRelation) {
                if (groupRelation.hasIdentification(identifier)) {
                    hasPossessionIdentification = true;
                }
            });
            return hasPossessionIdentification;
        }
    });
});



/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.graph_displayer_as_tree_common'
], function (Scenarios, TreeDisplayerCommon) {
    describe("graph_displayer_as_tree_common", function () {
        var similarRelationsScenario,
            graph,
            centerVertex,
            possession,
            deepGraphScenario;
        beforeEach(function () {
            similarRelationsScenario = new Scenarios.GraphWithSimilarRelationsScenario();
            graph = similarRelationsScenario.getGraph();
            centerVertex = similarRelationsScenario.getCenterVertex();
            possession = similarRelationsScenario.getPossession();
            deepGraphScenario = new Scenarios.deepGraph();
        });
        it("groups similar relations", function () {
            expect(centerVertex.similarRelations).toBeUndefined();
            TreeDisplayerCommon.enhancedVerticesInfo(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            expect(centerVertex.similarRelations).toBeDefined();
            expect(centerVertex.similarRelations[possession.getExternalResourceUri()]).toBeDefined();
            var numberOfRelations = Object.keys(graph.edges);
            expect(numberOfRelations.length).toBe(6);
            var numberOfGroupedRelations = Object.keys(centerVertex.similarRelations);
            expect(numberOfGroupedRelations.length).toBe(3);
        });
        it("relations with no identifications are grouped by relation uri", function () {
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
    });
});



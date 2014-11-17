/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    'test/webapp/js/test-scenarios',
    'triple_brain.graph_displayer_as_tree_common'
], function (Scenarios, TreeDisplayerCommon) {
    describe("graph_displayer_as_tree_common", function () {
        var similarRelationsScenario, graph, centerVertex, possession;
        beforeEach(function () {
            similarRelationsScenario = new Scenarios.GraphWithSimilarRelationsScenario();
            graph = similarRelationsScenario.getGraph();
            centerVertex = similarRelationsScenario.getCenterVertex();
            possession = similarRelationsScenario.getPossession();
        });
        it("groups similar relations", function () {
            expect(centerVertex.similarRelations).toBeUndefined();
            TreeDisplayerCommon.enhancedVerticesInfo(
                graph,
                centerVertex.getUri()
            );
            centerVertex = graph.vertices[centerVertex.getUri()];
            expect(centerVertex.similarRelations).toBeDefined();
            expect(centerVertex.similarRelations[possession.getUri()]).toBeDefined();
            var numberOfRelations = Object.keys(graph.edges);
            expect(numberOfRelations.length).toBe(4);
            var numberOfGroupedRelations = Object.keys(centerVertex.similarRelations);
            expect(numberOfGroupedRelations.length).toBe(2);
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
    });
});



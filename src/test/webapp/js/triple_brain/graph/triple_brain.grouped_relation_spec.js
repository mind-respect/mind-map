/*
 * Copyright Mozilla Public License 1.1
 */
define([
    'test/webapp/js/test-scenarios',
    'triple_brain.grouped_relation'
], function (Scenarios, GroupedRelation) {
    describe("grouped_relation", function () {
        var scenario, graph, centerVertex, possession, groupedRelation;
        beforeEach(function () {
            scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            graph = scenario.getGraph();
            centerVertex = scenario.getCenterVertex();
            possession = scenario.getPossession();
            groupedRelation = GroupedRelation.usingIdentification(possession);
        });
        it("has identification", function () {
            expect(groupedRelation.getIdentification().getUri()).toBe(
                possession.getUri()
            );
        });
        it("generates vertex html id", function () {
            var book1 = scenario.getBook1();
            groupedRelation.addVertex(book1);
            var objectKeys = Object.keys(groupedRelation.getVertices()[book1.getUri()]);
            expect(
                    objectKeys[0].indexOf("vertex-ui-id-") !== -1
            ).toBeTruthy();
        });
    })
});
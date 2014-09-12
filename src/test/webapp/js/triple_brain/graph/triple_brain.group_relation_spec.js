/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    'test/webapp/js/test-scenarios',
    'triple_brain.group_relation'
], function (Scenarios, GroupRelation) {
    describe("grouped_relation", function () {
        var scenario, graph, centerVertex, possession, groupRelation;
        beforeEach(function () {
            scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            graph = scenario.getGraph();
            centerVertex = scenario.getCenterVertex();
            possession = scenario.getPossession();
            groupRelation = GroupRelation.usingIdentification(possession);
        });
        it("has identification", function () {
            expect(groupRelation.getIdentification().getUri()).toBe(
                possession.getUri()
            );
        });
        it("generates vertex html id", function () {
            var book1 = scenario.getBook1();
            groupRelation.addVertex(book1);
            var objectKeys = Object.keys(groupRelation.getVertices()[book1.getUri()]);
            expect(
                    objectKeys[0].indexOf("bubble-ui-id-") !== -1
            ).toBeTruthy();
        });
        it("can tell if it has multiple vertices", function(){
            groupRelation.addVertex(scenario.getBook1());
            expect(
                groupRelation.hasMultipleVertices()
            ).toBeFalsy();
            groupRelation.addVertex(scenario.getBook2());
            expect(
                groupRelation.hasMultipleVertices()
            ).toBeTruthy();
        });
        it("can return the number of vertices", function(){
            groupRelation.addVertex(scenario.getBook1());
            expect(
                groupRelation.getNumberOfVertices()
            ).toBe(1);
            groupRelation.addVertex(scenario.getBook2());
            expect(
                groupRelation.getNumberOfVertices()
            ).toBe(2);
        });
    })
});
/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'triple_brain.group_relation'
], function (Scenarios, TestUtils, GroupRelation) {
    "use strict";
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
            groupRelation.addTuple({
                vertex:book1,
                edge:undefined
            });
            var objectKeys = Object.keys(groupRelation.getVertices()[book1.getUri()]);
            expect(
                    objectKeys[0].indexOf("bubble-ui-id-") !== -1
            ).toBeTruthy();
        });
        it("can tell if it has multiple vertices", function(){
            groupRelation.addTuple({
                vertex:scenario.getBook1(),
                edge:undefined
            });
            expect(
                groupRelation.hasMultipleVertices()
            ).toBeFalsy();
            groupRelation.addTuple({
                vertex:scenario.getBook2(),
                edge:undefined
            });
            expect(
                groupRelation.hasMultipleVertices()
            ).toBeTruthy();
        });
        it("can return the number of vertices", function(){
            groupRelation.addTuple({
                vertex:scenario.getBook1(),
                edge:undefined
            });
            expect(
                groupRelation.getNumberOfVertices()
            ).toBe(1);
            groupRelation.addTuple({
                vertex:scenario.getBook2(),
                edge:undefined
            });
            expect(
                groupRelation.getNumberOfVertices()
            ).toBe(2);
        });
        it("can have multiple identifiers", function(){
            var relationWithMultipleIdentifiers = new Scenarios.relationWithMultipleIdentifiers().getComputerScientistRelation();
            var groupRelation = GroupRelation.usingIdentifiers(
                relationWithMultipleIdentifiers.getIdentifiers()
            );
            expect(
                groupRelation.getIdentifiers().length
            ).toBe(2);
        });
        it("can integrate a group relation to a greater depth than 1", function(){
            var possessionGroupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
            possessionGroupRelation.expand();
            var possessionOfBook3Relation = TestUtils.getChildWithLabel(
                possessionGroupRelation,
                "Possession of book 3"
            );
            expect(
                possessionOfBook3Relation.isGroupRelation()
            ).toBeTruthy();
            possessionOfBook3Relation.expand();
            expect(
                possessionOfBook3Relation.getNumberOfChild()
            ).toBe(2);
        });
        it("sets the right label for a group relation at a greater depth than 1", function(){
            var possessionGroupRelation = new Scenarios.GraphWithSimilarRelationsScenario().getPossessionAsGroupRelationInTree();
            possessionGroupRelation.expand();
            var possessionOfBook3Relation = TestUtils.getChildWithLabel(
                possessionGroupRelation,
                "Possession of book 3"
            );
            expect(
                possessionOfBook3Relation.isGroupRelation()
            ).toBeTruthy();
            expect(
                possessionOfBook3Relation.text()
            ).toBe("Possession of book 3");
        });
        xit("sets the right label for a relation duplicate", function(){
            var twoSimilarGroupRelationsScenario = new Scenarios.graphWithARelationInTwoSimilarRelationsGroup();
            var impactOnTheIndividualRelation = twoSimilarGroupRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext();
            expect(
                impactOnTheIndividualRelation.text()
            ).toBe(
                "Impact on the individual"
            );
            var impactOnSocietyGroupRelation = twoSimilarGroupRelationsScenario.getImpact3RelationInTheImpactOnTheIndividualContext();
            expect(
                impactOnSocietyGroupRelation.text()
            ).toBe(
                "Impact on society"
            );
        });
    });
});
/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    "test/mock/triple_brain.graph_service_mock",
], function (Scenarios, TestUtils, Mock, GraphServiceMock) {
    "use strict";
    describe("group_relation_controller", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });

        it("can identify", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            expect(
                possessionInTree.getController().identifyCanDo()
            ).toBeTruthy();
        });
        it("gives all it's identifiers to the new relation when adding a child", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            possessionInTree.getModel().addIdentification(
                TestUtils.dummyIdentifier()
            );
            var testWasMade = false;
            possessionInTree.getController().addChild().then(function (triple) {
                expect(
                    triple.edge().getModel().getIdentifiers().length
                ).toBe(2);
                testWasMade = true;
            });
            expect(
                testWasMade
            ).toBeTruthy();
        });

        it("makes new child public if parent vertex is public", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var possessionInTree = scenario.getPossessionAsGroupRelationInTree();
            possessionInTree.getParentVertex().getModel().makePublic();
            possessionInTree.getModel().addIdentification(
                TestUtils.dummyIdentifier()
            );
            var testWasMade = false;
            possessionInTree.getController().addChild().then(function (triple) {
                expect(
                    triple.destinationVertex().getModel().isPublic()
                ).toBeTruthy();
                testWasMade = true;
            });
            expect(
                testWasMade
            ).toBeTruthy();
        });

        describe("expand", function () {
            it("also expands child bubbles having only one child", function () {
                var scenario = new Scenarios.graphWithGroupRelationHavingAVertexChildWithOneHiddenRelation();
                var tshirtGroupRelation = scenario.getTshirtGroupRelationInTree();
                GraphServiceMock.getForCentralBubbleUriAndGraph(
                    scenario.getShirt2VertexUri(),
                    scenario.getShirt2Graph()
                );
                tshirtGroupRelation.getController().expand();
                var shirt2 = TestUtils.getChildWithLabel(
                    tshirtGroupRelation,
                    "shirt2"
                ).getTopMostChildBubble();
                expect(
                    shirt2.isVertex()
                ).toBeTruthy();
                expect(
                    shirt2.getNumberOfChild()
                ).toBe(1);
            });
        });
        describe("becomeParent", function () {
            it("can become parent of an edge", function () {
                var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
                var center = scenario.getCenterVertexInTree();
                var groupRelation = scenario.getPossessionAsGroupRelationInTree();
                var otherRelation = TestUtils.getChildWithLabel(
                    center,
                    "other relation"
                );
                groupRelation.expand();
                expect(
                    TestUtils.hasChildWithLabel(
                        groupRelation,
                        "other relation"
                    )
                ).toBeFalsy();
                otherRelation.getController().moveUnderParent(groupRelation);
                expect(
                    TestUtils.hasChildWithLabel(
                        groupRelation,
                        "other relation"
                    )
                ).toBeTruthy();
            });
            it("can become parent of a group relation", function () {
                var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
                var center = scenario.getCenterVertexInTree();
                var groupRelation = scenario.getPossessionAsGroupRelationInTree();
                var otherGroupRelation = TestUtils.getChildWithLabel(
                    center,
                    "original relation"
                );
                groupRelation.expand();
                expect(
                    TestUtils.hasChildWithLabel(
                        groupRelation,
                        "original relation"
                    )
                ).toBeFalsy();
                otherGroupRelation.getController().moveUnderParent(groupRelation);
                expect(
                    TestUtils.hasChildWithLabel(
                        groupRelation,
                        "original relation"
                    )
                ).toBeTruthy();
            });
        });
    });
});
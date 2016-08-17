/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'test/test-utils',
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.graph_displayer",
    "triple_brain.edge",
    "triple_brain.vertex",
    "triple_brain.selection_handler"
], function (Scenarios, TestUtils, GraphServiceMock, GraphDisplayer, Edge, Vertex, SelectionHandler) {
    "use strict";
    describe("bubble", function () {
        var centerBubble,
            bubble2,
            bubble3,
            threeBubbleScenario;
        beforeEach(function () {
            threeBubbleScenario = new Scenarios.threeBubblesGraph();
            bubble2 = threeBubbleScenario.getBubble2InTree();
            bubble3 = threeBubbleScenario.getBubble3InTree();
            centerBubble = threeBubbleScenario.getCenterBubbleInTree();
        });
        it("can return parent bubble", function () {
            var parentBubble = bubble2.getParentBubble();
            expect(
                parentBubble.text()
            ).toBe("r1");
        });
        it("returns center when getting parent bubble of center vertex", function () {
            var parentBubble = centerBubble.getParentBubble();
            expect(
                parentBubble.getUri()
            ).toBe(centerBubble.getUri());
        });
        it("can return parent vertex", function () {
            var parentVertex = bubble2.getParentVertex();
            expect(
                parentVertex.text()
            ).toBe("b1");
        });
        it("returns grand parent if parent is not a vertex", function () {
            var newVertex = TestUtils.addTriple(bubble2).destinationVertex();
            expect(
                newVertex.getParentVertex().getUri()
            ).toBe(bubble2.getUri());
        });
        it("can get parent vertex of a vertex under a group relation", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerBubble = scenario.getCenterVertexInTree();
            var groupRelation = scenario.getPossessionAsGroupRelationInTree();
            groupRelation.expand();
            var bubbleUnderGroupRelation = groupRelation.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                bubbleUnderGroupRelation.getParentVertex().getUri()
            ).toBe(centerBubble.getUri());
        });
        it("can return top most child bubble", function () {
            var newEdge = TestUtils.addTriple(
                bubble2
            ).edge();
            expect(
                bubble2.getTopMostChildBubble().getUri()
            ).toBe(newEdge.getUri());
        });

        it("returns self when getting child of leaf", function () {
            expect(
                bubble2.getTopMostChildBubble().getUri()
            ).toBe(bubble2.getUri());
        });

        it("can get bubble above an edge", function () {
            var newEdge1 = TestUtils.addTriple(bubble2).edge(),
                newEdge2 = TestUtils.addTriple(bubble2).edge();
            expect(
                newEdge2.getBubbleAbove().getId()
            ).toBe(newEdge1.getId());
        });

        it("can get bubble above a vertex", function () {
            var newVertex1 = TestUtils.addTriple(bubble2).destinationVertex(),
                newVertex2 = TestUtils.addTriple(
                    bubble2
                ).destinationVertex();
            expect(
                newVertex2.getBubbleAbove().getId()
            ).toBe(newVertex1.getId());
        });

        it("returns itself when getting bubble above center vertex", function () {
            expect(
                centerBubble.getBubbleAbove().getId()
            ).toBe(centerBubble.getId());
        });

        it("returns itself when no bubble above", function () {
            expect(
                bubble2.getBubbleAbove().getId()
            ).toBe(bubble2.getId());
        });

        it("can get bubble below", function () {
            var newEdge1 = TestUtils.addTriple(bubble2).edge(),
                newEdge2 = TestUtils.addTriple(bubble2).edge();
            expect(
                newEdge1.getBubbleUnder().getId()
            ).toBe(newEdge2.getId());
        });

        it("can get bubble below even if both bubbles only share grand-parent", function () {
            var newVertex1 = TestUtils.addTriple(bubble2).destinationVertex(),
                newVertex2 = TestUtils.addTriple(
                    bubble2
                ).destinationVertex();
            expect(
                newVertex1.getBubbleUnder().getId()
            ).toBe(newVertex2.getId());
        });

        it("can get closest bubble below even if common parent is further away than grand-parent", function () {
            var newVertex1 = TestUtils.addTriple(bubble2).destinationVertex(),
                newVertex2 = TestUtils.addTriple(
                    bubble2
                ).destinationVertex(),
                childOfNewVertex1 = TestUtils.addTriple(
                    newVertex1
                ).destinationVertex();
            expect(
                childOfNewVertex1.getBubbleUnder().getId()
            ).toBe(newVertex2.getId());
        });
        it("returns bubbles below and not it's child when it has one", function () {
            var newVertex1 = TestUtils.addTriple(bubble2).destinationVertex(),
                newVertex2 = TestUtils.addTriple(
                    bubble2
                ).destinationVertex();
            TestUtils.addTriple(
                newVertex2
            ).destinationVertex();
            expect(
                newVertex1.getBubbleUnder().getId()
            ).toBe(newVertex2.getId());
        });
        it("returns itself when getting bubble under center vertex", function () {
            expect(
                centerBubble.getBubbleUnder().getId()
            ).toBe(centerBubble.getId());
        });

        it("returns itself when no bubble under", function () {
            expect(
                bubble2.getBubbleUnder().getId()
            ).toBe(bubble2.getId());
        });

        it("can tell if it has children", function () {
            expect(
                centerBubble.hasChildren()
            ).toBeTruthy();
            expect(
                bubble2.hasChildren()
            ).toBeFalsy();
        });

        it("shows hidden relation container when has some", function () {
            var b2 = new Scenarios.publicPrivate().getBubble2();
            expect(
                b2.hasHiddenRelations()
            ).toBeFalsy();
            expect(
                b2.hasVisibleHiddenRelationsContainer()
            ).toBeFalsy();
            expect(
                bubble3.hasHiddenRelations()
            ).toBeTruthy();
            expect(
                bubble3.hasVisibleHiddenRelationsContainer()
            ).toBeTruthy();
        });

        it("hides hidden relations container after expand", function () {
            expect(
                bubble3.hasVisibleHiddenRelationsContainer()
            ).toBeTruthy();
            threeBubbleScenario.expandBubble3(
                bubble3
            );
            expect(
                bubble3.hasVisibleHiddenRelationsContainer()
            ).toBeFalsy();
        });

        it("shows hidden relations container of bubbles from expanded bubble", function () {
            threeBubbleScenario.expandBubble3(
                bubble3
            );
            var bubble4 = threeBubbleScenario.getBubble4InTree();
            expect(
                bubble4.hasHiddenRelations()
            ).toBeTruthy();
            expect(
                bubble4.hasHiddenRelationsContainer()
            ).toBeTruthy();
        });

        it("doesn't integrate an identification's image if the identification is related to the parent group relation", function () {
            var scenario = new Scenarios.groupRelationWithImage();
            var someProject = scenario.getSomeProject();
            var idea = TestUtils.getChildWithLabel(someProject, "idea");
            expect(
                idea.hasImages()
            ).toBeTruthy();
            idea.getController().expand();
            var ideaFor1 = TestUtils.getChildWithLabel(idea, "idea for 1");
            var ideaFor2 = TestUtils.getChildWithLabel(idea, "idea for 2");
            expect(
                ideaFor1.hasImages()
            ).toBeFalsy();
            expect(
                ideaFor2.hasImages()
            ).toBeFalsy();
        });
        it("can move to another parent", function () {
            var centerBubble = threeBubbleScenario.getBubble1InTree();
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(2);
            var bubble3 = threeBubbleScenario.getBubble3InTree();
            expect(
                bubble3.getNumberOfChild()
            ).toBe(0);
            var relation1 = threeBubbleScenario.getRelation1InTree();
            relation1.moveToParent(bubble3);
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(1);
            expect(
                bubble3.getNumberOfChild()
            ).toBe(1);
        });
        it("also moves a vertex's parent relation when moving a vertex", function () {
            var bubble3 = threeBubbleScenario.getBubble3InTree();
            expect(
                bubble3.getNumberOfChild()
            ).toBe(0);
            var bubble2 = threeBubbleScenario.getBubble2InTree();
            bubble2.moveToParent(bubble3);
            expect(
                bubble3.getTopMostChildBubble().text()
            ).toBe("r1");
        });
        it("expands a closed group relation when moving a graph element to it", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerBubble = scenario.getCenterVertexInTree();
            var possessionGroupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Possession"
            );
            expect(
                possessionGroupRelation.isExpanded()
            ).toBeFalsy();
            var otherRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            otherRelation.moveToParent(
                possessionGroupRelation
            );
            expect(
                possessionGroupRelation.isExpanded()
            ).toBeTruthy();
        });
        it("selects the moved bubble after it moved", function () {
            var relation1 = threeBubbleScenario.getRelation1InTree();
            var bubble3 = threeBubbleScenario.getBubble3InTree();
            expect(
                SelectionHandler.getNbSelected()
            ).toBe(0);
            relation1.moveToParent(bubble3);
            expect(
                SelectionHandler.getNbSelected()
            ).toBe(1);
            expect(
                SelectionHandler.getSingleElement().getUri()
            ).toBe(relation1.getUri());
        });
        it("removes image related to an identification when a relation moved to a group relation that shares that identification", function () {
            var scenario = new Scenarios.groupRelationWithImage();
            var centerBubble = scenario.getSomeProject();
            var otherRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "other relation"
            );
            var idea = scenario.getIdeaGroupRelationInTree();
            expect(
                idea.hasImages()
            ).toBeTruthy();
            otherRelation.addGenericIdentification(
                idea.getGroupRelation().getIdentification()
            );
            expect(
                otherRelation.hasImages()
            ).toBeTruthy();
            otherRelation.moveToParent(idea);
            expect(
                otherRelation.hasImages()
            ).toBeFalsy();
        });
        it("doesn't create a duplicate when moving a bubble to the center vertex", function () {
            var scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            var centerBubble = scenario.getCenterVertexInTree();
            var possessionGroupRelation = TestUtils.getChildWithLabel(
                centerBubble,
                "Possession"
            );
            possessionGroupRelation.expand();
            var possessionRelation = possessionGroupRelation.getTopMostChildBubble();
            var centerBubbleNumberOfChild = centerBubble.getNumberOfChild();
            possessionRelation.moveToParent(centerBubble);
            expect(
                centerBubble.getNumberOfChild()
            ).toBe(centerBubbleNumberOfChild + 1);
        });
        it("can move a bubble above another", function () {
            var scenario = new Scenarios.creationDateScenario();
            var b1 = scenario.getBubble1InTree();
            var b7 = TestUtils.getChildWithLabel(
                b1,
                "r6"
            ).getTopMostChildBubble();
            scenario.expandBubble7(
                b7
            );
            var b73 = TestUtils.getChildWithLabel(
                b7,
                "r73"
            ).getTopMostChildBubble();
            var b72 = TestUtils.getChildWithLabel(
                b7,
                "r72"
            ).getTopMostChildBubble();
            expect(
                b73.getBubbleAbove().text()
            ).not.toBe("b71");
            expect(
                b73.getBubbleUnder().text()
            ).not.toBe("b72");
            b73.moveAbove(
                b72
            );
            expect(
                b73.getBubbleAbove().text()
            ).toBe("b71");
            expect(
                b73.getBubbleUnder().text()
            ).toBe("b72");
        });
        it("can move a bubble under another", function () {
            var scenario = new Scenarios.creationDateScenario();
            var b1 = scenario.getBubble1InTree();
            var b7 = TestUtils.getChildWithLabel(
                b1,
                "r6"
            ).getTopMostChildBubble();
            scenario.expandBubble7(
                b7
            );
            var b72 = TestUtils.getChildWithLabel(
                b7,
                "r72"
            ).getTopMostChildBubble();
            var b73 = TestUtils.getChildWithLabel(
                b7,
                "r73"
            ).getTopMostChildBubble();
            expect(
                b72.getBubbleAbove().text()
            ).not.toBe("b73");
            expect(
                b72.getBubbleUnder().text()
            ).not.toBe("b74");
            b72.moveUnder(
                b73
            );
            expect(
                b72.getBubbleAbove().text()
            ).toBe("b73");
            expect(
                b72.getBubbleUnder().text()
            ).toBe("b74");
        });
        it("can tell if one it has descendants with hidden relations", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b1 = scenario.getBubble1InTree();
            expect(
                b1.hasDescendantsWithHiddenRelations()
            ).toBeTruthy();
            scenario.expandBubble2(
                TestUtils.getChildWithLabel(
                    b1,
                    "r1"
                ).getTopMostChildBubble()
            );
            var b3 = TestUtils.getChildWithLabel(
                b1,
                "r2"
            ).getTopMostChildBubble();
            scenario.expandBubble3(
                b3
            );
            expect(
                b1.hasDescendantsWithHiddenRelations()
            ).toBeTruthy();
            var b4 = TestUtils.getChildWithLabel(
                b3,
                "r3"
            ).getTopMostChildBubble();
            b4.remove();
            expect(
                b1.hasDescendantsWithHiddenRelations()
            ).toBeFalsy();
        });
        it("displays the hidden relations container after collapse", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            expect(
                b2.getHiddenRelationsContainer().isVisible()
            ).toBeTruthy();
            GraphServiceMock.getForCentralBubbleUri(
                scenario.getSubGraphForB2()
            );
            b2.getHiddenRelationsContainer().getHtml().click();
            expect(
                b2.getHiddenRelationsContainer().isVisible()
            ).toBeFalsy();
            b2.collapse();
            expect(
                b2.getHiddenRelationsContainer().isVisible()
            ).toBeTruthy();
        });
        it("hides the collapse button right away after collapse and shows the expand button", function () {
            loadFixtures('graph-element-menu.html');
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            scenario.expandBubble2(b2);
            SelectionHandler.setToSingleVertex(b2);
            var collapseButton = b2.getButtonHtmlHavingAction("collapse");
            expect(
                collapseButton
            ).not.toHaveClass("hidden");
            var expandButton = b2.getButtonHtmlHavingAction("expand");
            expect(
                expandButton
            ).toHaveClass("hidden");
            b2.collapse();
            collapseButton = b2.getButtonHtmlHavingAction("collapse");
            expect(
                collapseButton
            ).toHaveClass("hidden");
            expandButton = b2.getButtonHtmlHavingAction("expand");
            expect(
                expandButton
            ).not.toHaveClass("hidden");
        });
        it("hides the hidden relation container after expand", function () {
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            scenario.expandBubble2(b2);
            b2.collapse();
            expect(
                b2.getHiddenRelationsContainer().isVisible()
            ).toBeTruthy();
            b2.expand();
            expect(
                b2.getHiddenRelationsContainer().isVisible()
            ).toBeFalsy();
        });
        it("hides the expand button right away after expand and shows the collapse button", function () {
            loadFixtures('graph-element-menu.html');
            var scenario = new Scenarios.threeBubblesGraph();
            var b2 = scenario.getBubble2InTree();
            scenario.expandBubble2(b2);
            SelectionHandler.setToSingleVertex(b2);
            var collapseButton = b2.getButtonHtmlHavingAction("collapse");
            var expandButton = b2.getButtonHtmlHavingAction("expand");
            b2.collapse();
            expect(
                collapseButton
            ).toHaveClass("hidden");
            expect(
                expandButton
            ).not.toHaveClass("hidden");
            b2.expand();
            collapseButton = b2.getButtonHtmlHavingAction("collapse");
            expect(
                collapseButton
            ).not.toHaveClass("hidden");
            expandButton = b2.getButtonHtmlHavingAction("expand");
            expect(
                expandButton
            ).toHaveClass("hidden");
        });
        // it("displays the hidden relations container after collapse", function () {
        //     var scenario = new Scenarios.threeBubblesGraph();
        //     var b2 = scenario.getBubble2InTree();
        //
        // });
    });
});
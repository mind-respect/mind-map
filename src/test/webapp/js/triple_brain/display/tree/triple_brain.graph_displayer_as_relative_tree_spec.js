/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.graph_displayer_as_relative_tree",
    "triple_brain.center_bubble",
    'test/webapp/js/test-scenarios',
    "jquery"
], function (GraphDisplayerAsRelativeTree, CenterBubble, Scenarios, $) {
    "use strict";
    describe("graph_displayer_as_relative_tree_spec", function () {
        var bubble1,
            groupRelation,
            graphWithSimilarRelationsScenario,
            mergeBubble;
        beforeEach(function () {
            bubble1 = new Scenarios.threeBubblesGraph().getCenterBubbleInTree();
            mergeBubble = new Scenarios.mergeBubbleGraph().getMergeBubbleInTree();
            graphWithSimilarRelationsScenario = new Scenarios.GraphWithSimilarRelationsScenario();
            groupRelation = graphWithSimilarRelationsScenario.getPossessionAsGroupRelationInTree();
        });

        it("distributes triples evenly to the right and left", function () {
            var centerBubble = CenterBubble.usingBubble(bubble1);
            expect(
                centerBubble._getNumberOfImmediateBubblesToLeft()
            ).toBe(1);
            expect(
                centerBubble._getNumberOfImmediateBubblesToRight()
            ).toBe(1);
        });

        it("distributes new triples evenly to the right and left", function () {
            var firstAddedEdge = Scenarios.addTriple(bubble1).edge(),
                secondAddedEdge = Scenarios.addTriple(bubble1).edge();
            expect(
                firstAddedEdge.isToTheLeft()
            ).toBeFalsy();
            expect(
                secondAddedEdge.isToTheLeft()
            ).toBeTruthy();
        });

        it("appends to group relation when expanding",function(){
            expect(
                groupRelation.hasChildren()
            ).toBeFalsy();
            GraphDisplayerAsRelativeTree.expandGroupRelation(
                groupRelation
            );
            expect(
                groupRelation.hasChildren()
            ).toBeTruthy();
        });

        it("preserves direction with parent vertex for expanded group relations",function(){
            GraphDisplayerAsRelativeTree.expandGroupRelation(
                groupRelation
            );
            expect(
                graphWithSimilarRelationsScenario.getRelationWithBook1InTree().isInverse()
            ).toBeFalsy();
            expect(
                graphWithSimilarRelationsScenario.getRelationWithBook2InTree().isInverse()
            ).toBeTruthy();
        });
        it("can build included graph elements view", function(){
            var builtTree = buildIncludedGraphElementsOfBubble(mergeBubble);
            debugger;
        });
        function buildIncludedGraphElementsOfBubble(bubble){
            return GraphDisplayerAsRelativeTree.buildIncludedGraphElementsView(
                bubble,
                $("<div>")
            );
        }
    });
});
/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    'triple_brain.event_bus',
    'triple_brain.bubble_distance_calculator'
], function (Scenarios, EventBus, BubbleDistanceCalculator) {
    "use strict";
    describe("bubble_distance_calculator", function () {
        it("can remove all elements after there was more than one", function () {
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            BubbleDistanceCalculator._reset();
            var bubble1 = threeBubblesScenario.getBubble1InTree();
            var bubble2 = threeBubblesScenario.getBubble2InTree();
            var bubble3 = threeBubblesScenario.getBubble3InTree();
            BubbleDistanceCalculator._addVertexToGraphTraversal(bubble1);
            BubbleDistanceCalculator._addVertexToGraphTraversal(bubble2);
            BubbleDistanceCalculator._addVertexToGraphTraversal(bubble3);
            $.each(
                bubble1.connectedEdges(),function(){
                    BubbleDistanceCalculator._connectVerticesOfEdgeForTraversal(this);
                }
            );
            bubble3.remove();
            BubbleDistanceCalculator._removeVertexInGraphForTraversal(
                bubble3.getId()
            );
            bubble2.remove();
            BubbleDistanceCalculator._removeVertexInGraphForTraversal(
                bubble2.getId()
            );
            bubble1.remove();
            BubbleDistanceCalculator._removeVertexInGraphForTraversal(
                bubble1.getId()
            );
        });

    });
});
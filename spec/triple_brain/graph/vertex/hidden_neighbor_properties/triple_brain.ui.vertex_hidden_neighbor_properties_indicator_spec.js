/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.graph_service"
], function (Scenarios, GraphServiceMock, GraphService) {
    "use strict";
    describe("vertex hidden neighbor properties indicator", function () {
        it("hides the flag instantly on click in order to avoid to handle the click twice", function(){
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var b3 = threeBubblesScenario.getBubble3InTree();
            b3.getHiddenRelationsContainer();
            GraphService.getForCentralBubbleUri = function(){
                //disable callback to be able to test
            };
            expect(
                b3.getHiddenRelationsContainer().isVisible()
            ).toBeTruthy();
            b3.getHiddenRelationsContainer().getHtml().click();
            expect(
                b3.getHiddenRelationsContainer().isVisible()
            ).toBeFalsy();
        });
        it("shows child tree when clicking", function(){
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var b3 = threeBubblesScenario.getBubble3InTree();
            b3.getHiddenRelationsContainer();
            GraphServiceMock.getForCentralBubbleUri(
                threeBubblesScenario.getSubGraphForB3()
            );
            expect(
                b3.getNumberOfChild()
            ).toBe(0);
            b3.getHiddenRelationsContainer().getHtml().click();
            expect(
                b3.getNumberOfChild()
            ).toBe(2);
        });
    });
});
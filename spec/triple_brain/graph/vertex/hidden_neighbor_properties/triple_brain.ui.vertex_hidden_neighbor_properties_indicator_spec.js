/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    "triple_brain.graph_service"
], function (Scenarios, GraphService) {
    "use strict";
    describe("vertex hidden neighbor properties indicator", function () {
        it("removes the flag instantly on click in order to avoid to handle the click twice", function(){
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var b3 = threeBubblesScenario.getBubble3InTree();
            var flagHtml = b3.getHiddenRelationsContainer().getHtml();
            GraphService.getForCentralVertexUri = function(){
                //disable callback to be able to test
            };
            expect(
                flagHtml.parent().length
            ).not.toBe(0);
            flagHtml.click();
            expect(
                flagHtml.parent().length
            ).toBe(0);
        });
    });
});
/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "test/test-scenarios",
    'test/mock',
    "test/mock/triple_brain.graph_service_mock",
    "triple_brain.graph_service"
], function (Scenarios, Mock, GraphServiceMock, GraphService) {
    "use strict";
    describe("vertex hidden neighbor properties indicator", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("hides the flag instantly on click in order to avoid to handle the click twice", function(){
            var threeBubblesScenario = new Scenarios.threeBubblesGraph();
            var b3 = threeBubblesScenario.getBubble3InTree();
            b3.getHiddenRelationsContainer();
            GraphService.getForCentralBubbleUri = function(){
                //disable callback to be able to test
            };
            expect(
                b3.getHiddenRelationsContainer()._getContent().hasClass("hidden")
            ).toBeFalsy();
            b3.getHiddenRelationsContainer().getHtml().click();
            expect(
                b3.getHiddenRelationsContainer()._getContent().hasClass("hidden")
            ).toBeTruthy();
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
        describe("show", function(){
            it("refreshes number of connected relations", function(){
                var b1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
                var newVertex;
                b1.getController().addChild().then(function(triple){
                    newVertex = triple.destinationVertex();
                    return newVertex.getController().addChild();
                }).then(function(){
                    return newVertex.getController().addChild();
                }).then(function(){
                    newVertex.collapse();
                    newVertex.getHiddenRelationsContainer().getHtml();
                    var hiddenRelationsText = newVertex.getHiddenRelationsContainer().getHtml().find(
                        ".hidden-properties-content"
                    ).text();
                    expect(
                        hiddenRelationsText
                    ).toBe("+ 2");
                });
            });
        });
    });
});
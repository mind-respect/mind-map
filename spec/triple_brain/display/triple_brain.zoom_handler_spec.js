/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "test/test-scenarios",
        "test/test-utils",
        "test/mock/triple_brain.vertex_service_mock",
        "triple_brain.zoom_handler",
        "triple_brain.relative_tree_vertex_menu_handler",
        "triple_brain.mind_map_info"

    ], function (Scenarios, TestUtils, VertexServiceMock, ZoomHandler, RelativeTreeVertexMenuHandler, MindMapInfo) {
        "use strict";
        describe("zoom_handler", function () {
            it("changes zoom when adding a second bubble", function () {
                mockZoomHandlerStartingAtLevel(1);
                expect(
                    ZoomHandler.getLevel()
                ).toBe(1);
                var singleBubble = new Scenarios.oneBubbleHavingSuggestionsGraph().getVertexUi();
                VertexServiceMock.addRelationAndVertexToVertexMock();
                RelativeTreeVertexMenuHandler.forSingle().addChildAction(singleBubble);
                expect(
                    ZoomHandler.getLevel()
                ).toBe(2);
            });
        });

        it("changes zoom when removing a bubble", function () {
            MindMapInfo._setIsViewOnly(false);
            mockZoomHandlerStartingAtLevel(2);
            var threeVerticesScenario = new Scenarios.threeBubblesGraph();
            VertexServiceMock.removeVertex();
            RelativeTreeVertexMenuHandler.forSingle().removeAction(
                threeVerticesScenario.getBubble2InTree(),
                true
            );
            expect(
                ZoomHandler.getLevel()
            ).toBe(2);
            RelativeTreeVertexMenuHandler.forSingle().removeAction(
                threeVerticesScenario.getBubble3InTree(),
                true
            );
            expect(
                ZoomHandler.getLevel()
            ).toBe(1);
        });

        function mockZoomHandlerStartingAtLevel(level) {
            spyOn(ZoomHandler, "getLevel").and.callFake(function () {
                return level;
            });
            spyOn(ZoomHandler, "_setLevel").and.callFake(function (newLevel) {
                return level = newLevel;
            });
        }
    }
);

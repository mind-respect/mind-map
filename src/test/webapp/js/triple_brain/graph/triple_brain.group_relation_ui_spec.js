/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'test/webapp/js/test-scenarios',
    'triple_brain.selection_handler'
], function (Scenarios, SelectionHandler) {
    "use strict";
    describe("grouped_relation_ui", function () {
        var scenario, possessionUi;
        beforeEach(function () {
            scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            possessionUi = scenario.getPossessionAsGroupRelationUi();
        });
        it("shows description upon selection", function () {
            var showDescriptionSpy = spyOn(possessionUi, "_showDescription");
            SelectionHandler.setToSingleGraphElement(possessionUi);
            expect(
                showDescriptionSpy
            ).toHaveBeenCalled();
        });
    });
});
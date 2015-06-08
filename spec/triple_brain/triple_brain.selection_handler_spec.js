/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    'triple_brain.selection_handler',
    'triple_brain.group_relation',
    'triple_brain.vertex_html_builder'
], function (Scenarios, SelectionHandler, GroupRelation, VertexHtmlBuilder) {
    "use strict";
    describe("selection_handler", function () {
        var scenario, graph, book1, book2, possession, groupRelation;
        beforeEach(function () {
            scenario = new Scenarios.GraphWithSimilarRelationsScenario();
            graph = scenario.getGraph();
            book1 = VertexHtmlBuilder.withServerFacade(scenario.getBook1()).create();
            book2 = VertexHtmlBuilder.withServerFacade(scenario.getBook2()).create();
            possession = scenario.getPossession();
            groupRelation = GroupRelation.usingIdentification(possession);
        });

        it("can tell if only one vertex is selected", function(){
            expect(
                SelectionHandler.isOnlyASingleBubbleSelected()
            ).toBeFalsy();
            SelectionHandler.addVertex(book1);
            expect(
                SelectionHandler.isOnlyASingleBubbleSelected()
            ).toBeTruthy();
        });
    });
});
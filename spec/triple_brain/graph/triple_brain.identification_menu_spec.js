/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/test-scenarios',
    "test/mock/triple_brain.graph_element_service_mock",
    'triple_brain.identification_menu',
    'triple_brain.user_map_autocomplete_provider',
    'triple_brain.mind_map_info'
], function (Scenarios, GraphElementServiceMock, IdentificationMenu, UserMapAutocompleteProvider, MindMapInfo) {
    "use strict";
    describe("identification_menu", function () {
        beforeEach(function () {
        });
        it("does not integrate identification if it already exists for graph element", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas();
            var projectSchemaSearchResult = searchProvider.formatResults(
                new Scenarios.getSearchResultsForProject().get()
            )[0];
            MindMapInfo._setIsViewOnly(false);
            var identificationMenu = IdentificationMenu.ofGraphElement(bubble1).create();
            GraphElementServiceMock.addIdentificationMock();
            var hasIntegratedIdentification = identificationMenu._handleSelectIdentification(
                projectSchemaSearchResult,
                bubble1
            );
            expect(
                hasIntegratedIdentification
            ).toBeTruthy();
            hasIntegratedIdentification = identificationMenu._handleSelectIdentification(
                projectSchemaSearchResult,
                bubble1
            );
            expect(
                hasIntegratedIdentification
            ).toBeFalsy();
        });
    });
});
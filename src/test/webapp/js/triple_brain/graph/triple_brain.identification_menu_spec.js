/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    'test/webapp/js/mock',
    'triple_brain.identification_menu',
    'triple_brain.user_map_autocomplete_provider'
], function (Scenarios, Mock, IdentificationMenu, UserMapAutocompleteProvider) {
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
            var identificationMenu = IdentificationMenu.ofGraphElement(bubble1).create();
            Mock.mockAddIdentification();
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
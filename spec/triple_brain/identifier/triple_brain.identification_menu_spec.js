/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'jquery',
    'test/test-scenarios',
    'test/test-utils',
    "test/mock/triple_brain.graph_element_service_mock",
    "triple_brain.graph_element_service",
    'triple_brain.identification_menu',
    'triple_brain.user_map_autocomplete_provider',
    'triple_brain.mind_map_info'
], function ($, Scenarios, TestUtils, GraphElementServiceMock, GraphElementService, IdentificationMenu, UserMapAutocompleteProvider, MindMapInfo) {
    "use strict";
    describe("identification_menu", function () {
        it("does not integrate identification if it already exists for graph element", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas();
            var projectSchemaSearchResult = searchProvider.formatResults(
                new Scenarios.getSearchResultsForProject().get()
            )[0];
            MindMapInfo._setIsViewOnly(false);
            var identificationMenu = IdentificationMenu.ofGraphElement(bubble1).create();
            GraphElementServiceMock.addIdentification();
            var identifier = identificationMenu._handleSelectIdentification(
                projectSchemaSearchResult,
                bubble1
            );
            expect(
                identifier
            ).not.toBeFalsy();
            identifier = identificationMenu._handleSelectIdentification(
                projectSchemaSearchResult,
                bubble1
            );
            expect(
                identifier
            ).toBeFalsy();
        });
        it("sets an identifier type to a new identifier", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var searchProvider = UserMapAutocompleteProvider.toFetchOnlyCurrentUserVerticesAndSchemas();
            var projectSchemaSearchResult = searchProvider.formatResults(
                new Scenarios.getSearchResultsForProject().get()
            )[0];
            MindMapInfo._setIsViewOnly(false);
            var identificationMenu = IdentificationMenu.ofGraphElement(bubble1).create();
            var testIsMade = false;
            spyOn(GraphElementService, "addIdentification").and.callFake(function(graphElement, identification){
                expect(
                    identification.getType()
                ).toBe("generic");
                testIsMade = true;
                var identifications = {};
                identification.setUri(
                    TestUtils.generateIdentificationUri()
                );
                identifications[identification.getExternalResourceUri()] = identification;
                return $.Deferred().resolve(identifications);
            });
            identificationMenu._handleSelectIdentification(
                projectSchemaSearchResult,
                bubble1
            );
            expect(
                testIsMade
            ).toBeTruthy();
        });
    });
});
/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.identification_menu",
    "triple_brain.relative_tree_vertex_menu_handler",
    "triple_brain.suggestion_service"
], function (IdentificationMenu, VertexMenuHandler, SuggestionService) {
    "use strict";
    var api = {},
        forSingle = {},
        forSingleNotOwned = {},
        forGroup = {};
    api.forSingle = function () {
        return forSingle;
    };
    forSingleNotOwned.identify = forSingle.identify = function (event, property) {
        event.stopPropagation();
        IdentificationMenu.ofGraphElement(
            property
        ).create();
    };
    forSingle.accept = function(event, suggestionUi){
        SuggestionService.accept(suggestionUi);
    };

    forSingle.addChild = function (event, suggestionUi) {
        forSingle.addChildAction(suggestionUi);
    };
    forSingle.addChildAction = function (suggestionUi) {
        SuggestionService.accept(suggestionUi, function(newVertex){
            VertexMenuHandler.forSingle().addChildAction(
                newVertex
            );
        });
    };
    return api;
});
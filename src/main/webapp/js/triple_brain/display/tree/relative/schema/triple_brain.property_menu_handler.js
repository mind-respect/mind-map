/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.mind_map_info",
    "triple_brain.graph_element_menu_handler",
    "triple_brain.identification_menu",
    "triple_brain.friendly_resource_service"
], function(MindMapInfo, GraphElementMenuHandler, IdentificationMenu, FriendlyResourceService){
   "use strict";
    var api = {},
        forSingle = {},
        forSingleNotOwned = {},
        forGroup = {},
        forGroupNotOwned = {};
        forGroupNotOwned = {};
    api.forSingle = function(){
        return MindMapInfo.isViewOnly() ?
            forSingleNotOwned:
            forSingle;
    };

    forSingleNotOwned.note = forSingle.note = function (event, vertex) {
        GraphElementMenuHandler.forSingle().note(
            event, vertex
        );
    };

    forSingleNotOwned.identify = forSingle.identify = function (event, property) {
        event.stopPropagation();
        IdentificationMenu.ofGraphElement(
            property
        ).create();
    };
    forSingleNotOwned.identifyCanDo = function(property){
        return property.hasIdentifications();
    };
    forSingle.remove = function(event, property){
        forSingle.removeAction(property)
    };
    forSingle.removeAction = function(property){
        FriendlyResourceService.remove(property, function(){
            property.remove();
        });
    };
    return api;
});
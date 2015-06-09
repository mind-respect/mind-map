/*
 * Copyright Vincent Blouin under the GPL License version 3
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

    forSingleNotOwned.note = forSingle.note = function (event, element) {
        forSingle.noteAction(element);
    };
    forSingleNotOwned.noteAction = forSingle.noteAction = GraphElementMenuHandler.forSingle().noteAction;

    forSingleNotOwned.identify = forSingle.identify = function (event, property) {
        event.stopPropagation();
        forSingle.identifyAction(property);
    };
    forSingle.identifyAction = function(property){
        IdentificationMenu.ofGraphElement(
            property
        ).create();
    };
    forSingleNotOwned.identifyCanDo = function(property){
        return property.hasIdentifications();
    };
    forSingle.remove = function(event, property){
        forSingle.removeAction(property);
    };
    forSingle.removeAction = function(property){
        FriendlyResourceService.remove(property, function(){
            property.remove();
        });
    };

    forSingle.addSibling = function(event, property){
        forSingle.addSiblingAction(property);
    };

    forSingle.addSiblingAction = function(property){
        var schema = property.getParentBubble();
        schema.getMenuHandler().forSingle().addChildAction(
            schema
        );
    };

    return api;
});
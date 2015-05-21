/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "triple_brain.schema_service",
        "triple_brain.graph_displayer",
        "triple_brain.graph_element",
        "triple_brain.graph_element_menu_handler",
        "triple_brain.mind_map_info",
        "triple_brain.identification_menu"
    ],
    function (SchemaService, GraphDisplayer, GraphElement, GraphElementMenuHandler, MindMapInfo, IdentificationMenu) {
        "use strict";
        var api = {},
            forSingle = {},
            forSingleNotOwned = {},
            forGroup = {};
        api.forSingle = function () {
            return MindMapInfo.isViewOnly() ?
                forSingleNotOwned :
                forSingle;
        };
        api.forGroup = function () {
            return forGroup;
        };
        forSingle.addChild = function (event, schema) {
            forSingle.addChildAction(schema);
        };
        forSingle.addChildAction = function (schema) {
            SchemaService.createProperty(
                schema,
                function(propertyUri){
                    GraphDisplayer.addProperty(
                        GraphElement.withUri(
                            propertyUri
                        ),
                        schema
                    );
                }
            );
        };
        forSingleNotOwned.identify = forSingle.identify = function (event, vertex) {
            event.stopPropagation();
            forSingle.identifyAction(vertex);
        };
        forSingle.identifyAction = function(vertex){
            IdentificationMenu.ofGraphElement(
                vertex
            ).create();
        };
        forSingleNotOwned.note = forSingle.note = function (event, vertex) {
            forSingle.noteAction(vertex);
        };
        forSingleNotOwned.noteAction = forSingle.noteAction = GraphElementMenuHandler.forSingle().noteAction;
        forSingleNotOwned.noteCanDo = function(vertex){
            return vertex.hasNote();
        };
        return api;
    }
);

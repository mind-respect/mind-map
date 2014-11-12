/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "triple_brain.schema_service",
        "triple_brain.graph_displayer",
        "triple_brain.graph_element",
        "triple_brain.vertex_menu_handler_common",
        "triple_brain.mind_map_info"
    ],
    function (SchemaService, GraphDisplayer, GraphElement, VertexMenuHandlerCommon, MindMapInfo) {
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
        forSingleNotOwned.note = forSingle.note = function (event, vertex) {
            VertexMenuHandlerCommon.forSingle().note(
                event, vertex
            );
        };
        forSingleNotOwned.noteCanDo = function(vertex){
            return vertex.hasNote();
        };
        return api;
    }
);

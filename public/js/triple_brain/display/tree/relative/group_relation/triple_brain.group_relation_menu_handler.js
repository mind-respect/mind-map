/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "triple_brain.vertex_service",
        "triple_brain.edge_service",
        "triple_brain.mind_map_info"
    ],
    function (VertexService, EdgeService, MindMapInfo) {
        "use strict";
        var api = {},
            forSingle = {},
            forSingleNotOwned = {};
        api.forSingle = function () {
            return MindMapInfo.isViewOnly() ?
                forSingleNotOwned :
                forSingle;
        };
        forSingle.addChild = function (event, groupRelation) {
            forSingle.addChildAction(groupRelation);
        };
        forSingle.addChildAction = function (groupRelation) {
            groupRelation.hideDescription();
            VertexService.addRelationAndVertexToVertex(
                groupRelation.getParentVertex(),
                groupRelation,
                function (triple) {
                    if (groupRelation.hasHiddenRelationsContainer()) {
                        groupRelation.addChildTree();
                    }
                    var identification = groupRelation.getGroupRelation().getIdentification();
                    EdgeService.addSameAs(
                        triple.edge(),
                        identification
                    );
                    EdgeService.updateLabel(
                        triple.edge(),
                        identification.getLabel(),
                        function (edge) {
                            edge.setText(identification.getLabel());
                            triple.edge().reviewEditButtonDisplay();
                        }
                    );
                }
            );
        };
        return api;
    }
);
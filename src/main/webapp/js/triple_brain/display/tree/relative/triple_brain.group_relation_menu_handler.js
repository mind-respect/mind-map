/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.vertex",
        "triple_brain.edge",
        "triple_brain.mind_map_info"
    ],
    function (VertexService, EdgeService, MindMapInfo) {
        var api = {},
            forSingle = {},
            forSingleNotOwned = {};
        api.forSingle = function(){
            return MindMapInfo.isViewOnly() ?
                forSingleNotOwned:
                forSingle;
        };
        forSingle.addChild = function (event, groupRelation) {
            forSingle.addChildAction(groupRelation);
        };
        forSingle.addChildAction = function (groupRelation) {
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
                        }
                    );
                    triple.destinationVertex().focus();
                }
            );
        };
        return api;
    }
);
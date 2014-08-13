/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "triple_brain.vertex",
        "triple_brain.edge"
    ],
    function (VertexService, EdgeService) {
        var api = {};
        api.forSingle = function () {
            var subApi = {};
            subApi.addChild = function (event, groupRelation) {
                subApi.addChildAction(groupRelation);
            };
            subApi.addChildAction = function(groupRelation){
                VertexService.addRelationAndVertexToVertex(
                    groupRelation.getParentVertex(),
                    groupRelation,
                    function (triple) {
                        if(groupRelation.hasHiddenRelationsContainer()){
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
                            function(edge){
                                edge.setText(identification.getLabel());
                            }
                        );
                        triple.destinationVertex().focus();
                    }
                );
            };
            return subApi;
        };
        return api;
    }
);
/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.vertex_service",
        "triple_brain.edge_service",
        "triple_brain.graph_element_controller",
        "triple_brain.selection_handler"
    ],
    function ($, VertexService, EdgeService, GraphElementController, SelectionHandler) {
        "use strict";
        var api = {};
        api.Self = GroupRelationController;

        function GroupRelationController(groupRelationUi) {
            this.groupRelationsUi = groupRelationUi;
            GraphElementController.Self.prototype.init.call(
                this,
                this.groupRelationsUi
            );
        }

        GroupRelationController.prototype = new GraphElementController.Self();
        GroupRelationController.prototype.addChildCanDo = function () {
            return this.isSingleAndOwned();
        };
        GroupRelationController.prototype.centerCanDo = function () {
            return false;
        };
        GroupRelationController.prototype.addChild = function () {
            var deferred = $.Deferred();
            this.groupRelationsUi.hideDescription();
            var self = this;
            VertexService.addRelationAndVertexToVertex(
                this.groupRelationsUi.getParentVertex(),
                this.groupRelationsUi,
                function (triple) {
                    if (self.groupRelationsUi.hasHiddenRelationsContainer()) {
                        self.groupRelationsUi.addChildTree();
                    }
                    var identification = self.groupRelationsUi.getGroupRelation().getIdentification();
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
                    SelectionHandler.setToSingleVertex(
                        triple.destinationVertex()
                    );
                    deferred.resolve(triple);
                }
            );
            return deferred.promise();
        };
        return api;
    }
);
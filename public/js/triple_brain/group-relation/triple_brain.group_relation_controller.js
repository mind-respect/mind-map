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
        api.GroupRelationController = GroupRelationController;

        function GroupRelationController(groupRelationUi) {
            this.groupRelationsUi = groupRelationUi;
            GraphElementController.GraphElementController.prototype.init.call(
                this,
                this.groupRelationsUi
            );
        }

        GroupRelationController.prototype = new GraphElementController.GraphElementController();

        GroupRelationController.prototype.cutCanDo = function () {
            return false;
        };

        GroupRelationController.prototype.addChildCanDo = function () {
            return this.isSingleAndOwned();
        };

        GroupRelationController.prototype.centerCanDo = function () {
            return false;
        };

        GroupRelationController.prototype.addChild = function () {
            var deferred = $.Deferred();
            this.getUi().hideDescription();
            var self = this;
            VertexService.addRelationAndVertexToVertex(
                this.getUi().getParentVertex(),
                this.getUi(),
                function (triple) {
                    if (self.getUi().hasVisibleHiddenRelationsContainer()) {
                        self.expand();
                    }
                    $.each(self.getModel().getIdentifiers(), function(){
                        var identifier = this;
                        identifier.makeSameAs();
                        triple.edge().getController().addIdentification(
                            identifier
                        );
                    });
                    EdgeService.updateLabel(
                        triple.edge(),
                        self.getModel().getIdentification().getLabel(),
                        function (edge) {
                            edge.setText(self.getModel().getIdentification().getLabel());
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
/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.vertex_service",
        "triple_brain.edge_service",
        "triple_brain.graph_element_controller",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_type",
        "triple_brain.graph_element_service"
    ],
    function ($, VertexService, EdgeService, GraphElementController, SelectionHandler, GraphElementType, GraphElementService) {
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

        GroupRelationController.prototype.addChild = function (edgeOver) {
            var parentVertex = this.getUi().getParentVertex();
            var triple;
            return VertexService.addRelationAndVertexToVertex(
                parentVertex,
                this.getUi(),
                edgeOver
            ).then(function (_triple) {
                triple = _triple;
                if (this.getUi().hasVisibleHiddenRelationsContainer()) {
                    this.expand();
                }
                this.getModel().addTuple({
                    edge: triple.edge().getModel(),
                    vertex: triple.destinationVertex().getModel()
                });
                this.getModel().getIdentifiers().forEach(function (identifier) {
                    identifier.makeSameAs();
                    triple.edge().getController().addIdentification(
                        identifier
                    );
                });
                var promises = [
                    EdgeService.updateLabel(
                        triple.edge(),
                        this.getModel().getIdentification().getLabel()
                    ).then(function () {
                        triple.edge().setText(this.getModel().getIdentification().getLabel());
                        triple.edge().reviewIsSameAsGroupRelation();
                    }.bind(this))
                ];
                if (parentVertex.getModel().isPublic()) {
                    promises.push(
                        triple.destinationVertex().getController().makePublic()
                    );
                }
                return $.when.apply($, promises);
            }.bind(this)).then(function () {
                if (edgeOver) {
                    triple.edge().moveBelow(edgeOver);
                }
                triple.sourceVertex().tripleAdded(triple);
                return GraphElementService.changeChildrenIndex(
                    triple.sourceVertex()
                );
            }).then(function () {
                return triple;
            });
        };

        GroupRelationController.prototype.becomeParent = function (graphElementUi) {
            var uiChild;
            var promises = [];
            if (graphElementUi.isGroupRelation()) {
                graphElementUi.expand();
                graphElementUi.visitClosestChildOfType(
                    GraphElementType.Relation,
                    moveEdge.bind(this)
                );
                uiChild = graphElementUi;
            } else {
                uiChild = graphElementUi.isVertex() ? graphElementUi.getParentBubble() : graphElementUi;
                moveEdge.bind(this)(
                    uiChild
                );
            }
            uiChild.moveToParent(this.getUi());
            return $.when.apply($, promises);

            function moveEdge(movedEdge) {
                var parentGroupRelation = this.getUi();
                promises.push(
                    movedEdge.getController().changeEndVertex(
                        this.getUi().getParentVertex()
                    )
                );
                do {
                    promises.push(
                        movedEdge.getController().addIdentifiers(
                            parentGroupRelation.getModel().getIdentifiers()
                        )
                    );
                    parentGroupRelation = parentGroupRelation.getParentBubble();
                } while (parentGroupRelation.isGroupRelation());
            }
        };

        GroupRelationController.prototype.becomeExParent = function (movedEdge) {
            var promises = [];
            var previousParentGroupRelation = this.getUi().getGreatestGroupRelationAncestor();
            previousParentGroupRelation.getModel().getIdentifiersAtAnyDepth().forEach(function (identifier) {
                identifier = movedEdge.getModel().getIdentifierHavingExternalUri(
                    identifier.getExternalResourceUri()
                );
                if (identifier) {
                    promises.push(
                        movedEdge.getController().removeIdentifier(
                            identifier
                        )
                    );
                }
            });
            return $.when.apply($, promises);
        };
        return api;
    }
);

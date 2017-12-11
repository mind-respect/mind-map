/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_controller",
    "triple_brain.edge_service",
    "triple_brain.identification",
    "triple_brain.graph_displayer",
    "mr.bubble_delete_menu",
    "triple_brain.graph_element_type",
    "triple_brain.selection_handler"
], function ($, GraphElementController, EdgeService, Identification, GraphDisplayer, BubbleDeleteMenu, GraphElementType, SelectionHandler) {
    "use strict";
    var api = {};
    api.RelationController = EdgeController;

    function EdgeController(edges) {
        this.edges = edges;
        GraphElementController.GraphElementController.prototype.init.call(
            this,
            this.edges
        );
    }

    EdgeController.prototype = new GraphElementController.GraphElementController();

    EdgeController.prototype.addChildCanDo = function () {
        return this.isSingleAndOwned();
    };

    EdgeController.prototype.addChild = function () {
        var deferred = $.Deferred();
        var newGroupRelation = this._convertToGroupRelation();
        newGroupRelation.getController().addChild().then(function (triple) {
            triple.edge().getController().addIdentifiers(
                this.getModel().getIdentifiers()
            ).then(function () {
                deferred.resolve(triple);
            });
        }.bind(this));
        return deferred.promise();
    };

    EdgeController.prototype.addSibling = function () {
        return this.getUi().getTopMostChildBubble().getController().addSibling().then(function(triple){
            SelectionHandler.setToSingleGraphElement(
                triple.edge()
            );
        });
    };

    EdgeController.prototype.addSiblingCanDo = function () {
        var controller = this.getUi().getTopMostChildBubble().getController();
        if(controller.addSiblingCanDo){
            return controller.addSiblingCanDo();
        }
    };

    EdgeController.prototype.becomeParent = function (graphElementUi) {
        var promises = [];
        var newGroupRelation = this._convertToGroupRelation();
        graphElementUi.moveToParent(
            newGroupRelation
        );
        if(graphElementUi.isGroupRelation()){
            graphElementUi.expand();
            graphElementUi.visitClosestChildOfType(
                GraphElementType.Relation,
                moveEdge.bind(this)
            );
        }else if(graphElementUi.isVertex()){
            moveEdge.bind(this)(graphElementUi.getParentBubble());
        }else{
            moveEdge.bind(this)(graphElementUi);
        }
        return $.when.apply($, promises);
        function moveEdge(movedEdge){
            var identifiers = this.getModel().hasIdentifications() ?
                this.getModel().getIdentifiers() :
                this.getModel().getIdentifiersIncludingSelf();
            promises.push(
                movedEdge.getController().addIdentifiers(
                    identifiers
                )
            );
            promises.push(
                movedEdge.getController().changeEndVertex(
                    this.getUi().getParentVertex()
                )
            );
        }
    };

    EdgeController.prototype._convertToGroupRelation = function () {
        var tuple = {
            edge: this.getModel(),
            vertex: this.getModel().getDestinationVertex()
        };
        var parentBubble = this.getUi().getParentBubble();
        var groupRelationIdentifiers;
        if(parentBubble.isGroupRelation()){
            if(parentBubble.getModel().hasIdentification(this.getModel().buildSelfIdentifier())){
                groupRelationIdentifiers = [
                    this.getModel().buildTwiceSelfIdentifier()
                ];
            }else{
                groupRelationIdentifiers = [
                    this.getModel().buildSelfIdentifier()
                ];
            }
        } else{
            groupRelationIdentifiers = this.getModel().hasIdentifications() ?
                this.getModel().getIdentifiers() :
                this.getModel().getIdentifiersIncludingSelf();
        }
        var newGroupRelation = GraphDisplayer.addNewGroupRelation(
            groupRelationIdentifiers,
            parentBubble,
            this.getUi().isToTheLeft()
        );
        newGroupRelation.getModel().addTuple(tuple);
        this.getUi().convertToGroupRelation(newGroupRelation);
        return newGroupRelation;
    };

    EdgeController.prototype.removeCanDo = function () {
        return this.isSingleAndOwned();
    };

    EdgeController.prototype.remove = function (skipConfirmation) {
        if (skipConfirmation) {
            return deleteAfterConfirmationBehavior.bind(this)();
        }
        return BubbleDeleteMenu.forRelation(
            this.getUi()
        ).ask().then(
            deleteAfterConfirmationBehavior.bind(this)
        );

        function deleteAfterConfirmationBehavior() {
            return EdgeService.remove(this.getUi(), function () {
                var parentBubble = this.getUi().getParentBubble();
                var childVertex = this.getUi().getTopMostChildBubble();
                this.getUi().applyToOtherInstances(function (otherInstance) {
                    var childVertex = otherInstance.getTopMostChildBubble();
                    childVertex.remove(false);
                });
                childVertex.remove(false);
                parentBubble.getModel().decrementNumberOfConnectedEdges();
                parentBubble.sideCenterOnScreenWithAnimation();
            }.bind(this));
        }
    };
    EdgeController.prototype.reverseToRightCanDo = function () {
        if (!this.isSingleAndOwned()) {
            return false;
        }
        var isToTheLeft = this.edges.isToTheLeft();
        var isInverse = this.edges.isInverse();
        return (isToTheLeft && !isInverse) ||
            (!isToTheLeft && isInverse);

    };
    EdgeController.prototype.reverseToRight = function () {
        this.reverse();
    };

    EdgeController.prototype.reverseToLeftCanDo = function () {
        if (!this.isSingleAndOwned()) {
            return false;
        }
        return !this.reverseToRightCanDo();
    };

    EdgeController.prototype.reverseToLeft = function () {
        this.reverse();
    };

    EdgeController.prototype.reverse = function () {
        var self = this;
        EdgeService.inverse(
            this.getUi()
        ).then(function () {
            self.getUi().inverse();
        });
    };
    EdgeController.prototype.sourceVertex = function (sourceVertex) {
        var self = this;
        if (!sourceVertex.isExpanded()) {
            return sourceVertex.getController().expand().then(doIt);
        } else {
            return doIt();
        }

        function doIt() {
            if (self.getUi().isInverse()) {
                return EdgeService.changeSourceVertex(
                    sourceVertex,
                    self.getUi()
                );
            }
            return EdgeService.changeDestinationVertex(
                sourceVertex,
                self.getUi()
            );
        }
    };
    EdgeController.prototype.changeEndVertex = function (endVertex) {
        var self = this;
        if (!endVertex.isExpanded()) {
            return endVertex.getController().expand().then(doIt);
        } else {
            return doIt();
        }

        function doIt() {
            if (self.getUi().isInverse()) {
                return EdgeService.changeDestinationVertex(
                    endVertex,
                    self.getUi()
                );
            }
            return EdgeService.changeSourceVertex(
                endVertex,
                self.getUi()
            );
        }
    };
    return api;
});
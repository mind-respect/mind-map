/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_controller",
    "triple_brain.edge_service",
    "triple_brain.identification",
    "triple_brain.graph_displayer",
    "triple_brain.vertex_service",
    "triple_brain.group_relation_controller"
], function ($, GraphElementController, EdgeService, Identification, GraphDisplayer, VertexService, GroupRelationController) {
    "use strict";
    var api = {};
    api.Self = EdgeController;

    function EdgeController(edges) {
        this.edges = edges;
        GraphElementController.Self.prototype.init.call(
            this,
            this.edges
        );
    }

    EdgeController.prototype = new GraphElementController.Self();

    EdgeController.prototype.addChildCanDo = function () {
        return this.isSingleAndOwned();
    };

    EdgeController.prototype.addChild = function () {
        var parentVertex = this.edges.getParentVertex();
        var newGroupRelation = GraphDisplayer.addNewGroupRelation(
            this._getAppropriateIdentificationForNewGroupRelation(),
            parentVertex,
            this.getUi().isToTheLeft()
        );
        newGroupRelation.getController().addChild();
        this.getUi().moveToParent(
            newGroupRelation
        );
    };
    EdgeController.prototype._getAppropriateIdentificationForNewGroupRelation = function () {
        if (this.getUi().getModel().hasIdentifications()) {
            return this.getUi().getModel().getIdentifications()[0];
        } else {
            var identification = Identification.fromFriendlyResource(
                this.getUi().getModel()
            );
            identification.setLabel(
                this.getUi().text()
            );
            identification.setComment(
                this.getUi().getNote()
            );
            return identification;
        }
    };

    EdgeController.prototype.removeCanDo = function () {
        return this.isSingleAndOwned();
    };

    EdgeController.prototype.remove = function () {
        var self = this;
        EdgeService.remove(this.getUi(), function () {
            var parentBubble = self.getUi().getParentBubble();
            var childVertex = self.getUi().getTopMostChildBubble();
            self.getUi().applyToOtherInstances(function (otherInstance) {
                var childVertex = otherInstance.getTopMostChildBubble();
                childVertex.remove(false);
            });
            childVertex.remove(false);
            parentBubble.centerOnScreenWithAnimation();
        });
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
        ).then(function(){
            self.getUi().inverse();
        });
    };
    EdgeController.prototype.changeEndVertex = function (endVertex) {
        var self = this;
        if (!endVertex.isExpanded()) {
            return endVertex.getController().expand().then(doIt);
        } else {
            return doIt();
        }
        function doIt() {
            if(self.getUi().isInverse()){
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
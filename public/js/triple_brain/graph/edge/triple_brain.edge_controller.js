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
            parentVertex
        );
        newGroupRelation.getController().addChild();
        this.edges.moveToParent(newGroupRelation);
    };
    EdgeController.prototype._getAppropriateIdentificationForNewGroupRelation = function () {
        var identification;
        if (this.edges.hasIdentifications()) {
            identification = this.edges.getIdentifications()[0];
        } else {
            identification = Identification.fromFriendlyResource(
                this.edges.getModel()
            );
            identification.setLabel(
                this.edges.text()
            );
            identification.setComment(
                this.edges.getNote()
            );
        }
        return identification;
    };

    EdgeController.prototype.removeCanDo = function () {
        return this.isSingleAndOwned();
    };

    EdgeController.prototype.remove = function () {
        var self = this;
        EdgeService.remove(this.getElements(), function () {
            var childVertex = self.getElements().getTopMostChildBubble();
            self.getElements().applyToOtherInstances(function (otherInstance) {
                var childVertex = otherInstance.getTopMostChildBubble();
                childVertex.remove(false);
            });
            childVertex.remove(false);
        });
    };
    EdgeController.prototype.reverseToRightCanDo = function () {
        if (!this.isSingle()) {
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
        if (!this.isSingle()) {
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
            this.edges,
            function () {
                self.edges.inverse();
            }
        );
    };
    return api;
});
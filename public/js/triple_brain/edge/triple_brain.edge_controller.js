/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element_controller",
    "triple_brain.edge_service",
    "triple_brain.identification",
    "triple_brain.graph_displayer",
], function ($, GraphElementController, EdgeService, Identification, GraphDisplayer) {
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

    EdgeController.prototype.becomeParent = function (vertexUi) {
        var newGroupRelation = this._convertToGroupRelation();
        vertexUi.moveToParent(
            newGroupRelation
        );
        var promises = [];
        var movedEdge = vertexUi.getParentBubble();
        promises.push(
            movedEdge.getController().addIdentifiers(
                this.getModel().getIdentifiers()
            )
        );
        promises.push(
            movedEdge.getController().changeEndVertex(
                this.getUi()
            )
        );
        return $.when.apply($, promises);
    };

    EdgeController.prototype._convertToGroupRelation = function () {
        var parentBubble = this.getUi().getParentBubble();
        if (parentBubble.isGroupRelation()) {
            if (parentBubble.getModel().hasIdentification(this.getModel().buildSelfIdentifier())) {
                return parentBubble;
            }
        }
        var groupRelationIdentifiers = parentBubble.isGroupRelation() ?
            this.getModel().buildSelfIdentifier() :
            this.getModel().getIdentifiersIncludingSelf();
        var newGroupRelation = GraphDisplayer.addNewGroupRelation(
            groupRelationIdentifiers,
            parentBubble,
            this.getUi().isToTheLeft()
        );
        this.getUi().convertToGroupRelation(newGroupRelation);
        return newGroupRelation;
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
            parentBubble.sideCenterOnScreenWithAnimation();
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
        ).then(function () {
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
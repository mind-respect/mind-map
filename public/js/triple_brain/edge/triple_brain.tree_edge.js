/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.edge_ui",
        "triple_brain.bubble",
        "triple_brain.object_utils",
        "triple_brain.graph_element_ui"
    ],
    function ($, EdgeUi, Bubble, ObjectUtils, GraphElementUi) {
        "use strict";
        var api = {};

        EdgeUi.buildCommonConstructors(api);

        api.createFromHtml = function (html) {
            var treeEdge = new api.TreeEdge().init(
                html
            );
            api.initCache(treeEdge);
            EdgeUi.initCache(
                treeEdge
            );
            return treeEdge;
        };

        api.getWhenEmptyLabel = function () {
            return EdgeUi.getWhenEmptyLabel();
        };
        api.ofEdge = function (edge) {
            return api.withHtml(
                edge.getHtml()
            );
        };
        api = ObjectUtils.makeChildInheritParent(
            api,
            EdgeUi
        );
        api.TreeEdge = function () {
        };
        api.TreeEdge.prototype = new EdgeUi.EdgeUi();
        api.TreeEdge.prototype.init = function (html) {
            this.html = html;
            EdgeUi.EdgeUi.apply(this, [html]);
            return this;
        };
        api.TreeEdge.prototype.text = function () {
            return this.getLabel().text();
        };

        api.TreeEdge.prototype.textHtml = function () {
            return this.getLabel().html();
        };

        api.TreeEdge.prototype.childVertexInDisplay = function () {
            return this.getTopMostChildBubble();
        };
        api.TreeEdge.prototype.serverFormat = function () {
            return {
                label: this.text(),
                source_vertex_id: this.getSourceVertex().getId(),
                destination_vertex_id: this.getDestinationVertex().getId()
            };
        };

        api.TreeEdge.prototype.inverse = function () {
            var isInverse = this.isInverse();
            this.html[
                isInverse ?
                    "removeClass" :
                    "addClass"
                ]("inverse");
            this.getHtml().closest(
                ".vertex-tree-container"
            ).find("> .vertical-border")[
                isInverse ?
                    "addClass" :
                    "removeClass"
                ]("small");
            this.childVertexInDisplay().inverse();
            this.inverseAbstract();
        };
        api.TreeEdge.prototype.removeFromCache = function () {
            api.removeFromCache(
                this.getUri(),
                this.getId()
            );
            EdgeUi.removeFromCache(
                this.getUri(),
                this.getId()
            );
        };
        api.TreeEdge.prototype.getLabelAndButtonsContainer = function () {
            return this.html.find(
                ".label-and-buttons"
            );
        };
        api.TreeEdge.prototype.reviewIsSameAsGroupRelation = function () {
            var parentBubble = this.getParentBubble();
            if (!parentBubble.isGroupRelation()) {
                this.setAsNotSameAsGroupRelation();
                return;
            }
            if (parentBubble.text().trim() !== this.text().trim() && "" !== this.text().trim()) {
                this.setAsNotSameAsGroupRelation();
                return;
            }
            this.setAsSameAsGroupRelation();
        };

        api.TreeEdge.prototype.removeIdentifier = function (identifier) {
            Bubble.Bubble.prototype.removeIdentifier.call(
                this,
                identifier
            );
            this.reviewIsSameAsGroupRelation();
        };

        api.TreeEdge.prototype.setText = function (text) {
            Bubble.Bubble.prototype.setText.call(
                this,
                text
            );
            this.reviewIsSameAsGroupRelation();
        };

        api.TreeEdge.prototype.remove = function () {
            var parentBubble = this.getParentBubble();
            Bubble.Bubble.prototype.remove.call(
                this,
                parentBubble
            );
            this._removeParentGroupRelationIfItsALeaf(parentBubble);
        };

        api.TreeEdge.prototype.collateralRemove = function () {
            var parentBubble = this.getParentBubble();
            Bubble.Bubble.prototype.remove.call(
                this
            );
            this._removeParentGroupRelationIfItsALeaf(parentBubble);
        };

        api.TreeEdge.prototype._removeParentGroupRelationIfItsALeaf = function (parentBubble) {
            if (parentBubble.isGroupRelation() && parentBubble.isALeaf()) {
                parentBubble.remove();
            }
        };

        api.TreeEdge.prototype.moveTo = function (otherBubble, relation) {
            var previousParentBubble = this.getParentBubble();
            Bubble.Bubble.prototype.moveTo.call(
                this,
                otherBubble,
                relation
            );
            this._removeParentGroupRelationIfItsALeaf(previousParentBubble);
            this.reviewIsSameAsGroupRelation();
        };

        api.TreeEdge.prototype.convertToGroupRelation = function (newGroupRelation) {
            newGroupRelation.moveAbove(this);
            this.moveToParent(
                newGroupRelation
            );
        };

        api.TreeEdge.prototype.leaveEditMode = function () {
            if (this.isSetAsSameAsGroupRelation()) {
                this.getHtml().addClass("empty-label");
            } else {
                this.getHtml().removeClass("empty-label");
            }
            GraphElementUi.GraphElementUi.prototype.leaveEditMode.call(
                this
            );
        };

        return api;
    }
);

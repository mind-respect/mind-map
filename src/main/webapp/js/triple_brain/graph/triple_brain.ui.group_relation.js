/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_displayer",
    "triple_brain.event_bus",
    "triple_brain.ui.vertex_hidden_neighbor_properties_indicator",
    "triple_brain.bubble",
    "twitter_bootstrap"
], function (GraphDisplayer, EventBus, HiddenPropertiesIndicator, Bubble) {
    "use strict";
    var api = {};
    api.withHtml = function (html) {
        return new Self(html);
    };
    api.visitAll = function (visitor) {
        $(".group-relation").each(function () {
            visitor(
                api.withHtml(
                    $(this)
                )
            );
        });
    };
    function Self(html) {
        this.html = html;
        this.bubble = Bubble.withHtml(html);
    }

    Self.prototype.getHtml = function () {
        return this.html;
    };
    Self.prototype.readjustLabelWidth = function () {
        //do nothing
    };
    Self.prototype.getNumberOfRelationsToFlag = function () {
        return this.getGroupRelation().getNumberOfVertices();
    };
    Self.prototype.expand = function () {
        this.getGroupRelation().getVertices();
    };
    Self.prototype.getGroupRelation = function () {
        return this.html.data(
            "group_relation"
        );
    };
    Self.prototype.isToTheLeft = function () {
        if (this._isToTheLeft === undefined) {
            this._isToTheLeft = this.html.parents(".left-oriented").length > 0;
        }
        return this._isToTheLeft;
    };
    Self.prototype.getHtml = function () {
        return this.html;
    };
    Self.prototype.addChildTree = function () {
        GraphDisplayer.expandGroupRelation(
            this
        );
    };
    Self.prototype.getParentBubble = function () {
        return this.bubble.getParentBubble();
    };
    Self.prototype.getParentVertex = function () {
        return this.bubble.getParentVertex();
    };
    Self.prototype.hasChildren = function () {
        return this.bubble.hasChildren();
    };
    Self.prototype.getTopMostChild = function () {
        return this.bubble.getTopMostChild();
    };
    Self.prototype.hasBubbleAbove = function () {
        return this.bubble.hasBubbleAbove();
    };
    Self.prototype.getBubbleAbove = function () {
        return this.bubble.getBubbleAbove();
    };
    Self.prototype.hasBubbleUnder = function () {
        return this.bubble.hasBubbleUnder();
    };
    Self.prototype.getBubbleUnder = function () {
        return this.bubble.getBubbleUnder();
    };
    Self.prototype.select = function () {
        this.html.addClass("selected");
    };
    Self.prototype.deselect = function () {
        this.html.removeClass("selected");
    };
    Self.prototype.isVertex = function () {
        return false;
    };
    Self.prototype.isRelation = function () {
        return false;
    };
    Self.prototype.isGroupRelation = function () {
        return true;
    };

    Self.prototype.getOriginalServerObject = Self.prototype.getGroupRelation;

    EventBus.subscribe(
        "/event/ui/group_relation/visit_after_graph_drawn",
        function (event, groupRelationUi) {
            HiddenPropertiesIndicator.withVertex(
                groupRelationUi
            ).build();
        }
    );
    return api;
});

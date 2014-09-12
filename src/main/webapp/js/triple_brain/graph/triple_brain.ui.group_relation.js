/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_displayer",
    "triple_brain.event_bus",
    "triple_brain.ui.vertex_hidden_neighbor_properties_indicator",
    "triple_brain.bubble",
    "triple_brain.ui.graph_element",
    "twitter_bootstrap"
], function (GraphDisplayer, EventBus, PropertiesIndicator, Bubble, GraphElementUi) {
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
        this.bubble = Bubble.withHtmlFacade(this);
    }
    Self.prototype = new GraphElementUi.Self;
    Self.prototype.getHtml = function () {
        return this.html;
    };
    Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.GroupRelation;
    };
    Self.prototype.readjustLabelWidth = function () {
        //do nothing
    };
    Self.prototype.getNumberOfRelationsToFlag = function () {
        return this.getGroupRelation().getNumberOfVertices();
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
        this.hideButtons();
        this._hideDescription();
    };

    Self.prototype.makeSingleSelected = function () {
        this.showButtons();
        this._showDescription();
    };

    Self.prototype.showButtons = function(){
        this.getMenuHtml().show();
    };

    Self.prototype.hideButtons = function(){
        this.getMenuHtml().hide();
    };

    Self.prototype.getMenuHtml = function () {
        return this.html.find('> .menu');
    };

    Self.prototype._showDescription = function () {
        this._getLabelHtml().popover('show');
    };

    Self.prototype._hideDescription = function () {
        this._getLabelHtml().popover('hide');
    };

    Self.prototype._getLabelHtml = function () {
        return this.html.find('> .label');
    };

    Self.prototype.hasHiddenRelationsContainer = function(){
        return this.bubble.hasHiddenRelationsContainer();
    };

    Self.prototype.setHiddenRelationsContainer = function(hiddenRelationsContainer){
        this.bubble.setHiddenRelationsContainer(
            hiddenRelationsContainer
        );
    };

    Self.prototype.getHiddenRelationsContainer = function(){
        return this.bubble.getHiddenRelationsContainer();
    };

    Self.prototype.removeHiddenRelationsContainer = function(){
        this.bubble.removeHiddenRelationsContainer();
    };

    Self.prototype.getOriginalServerObject = Self.prototype.getGroupRelation;

    EventBus.subscribe(
        "/event/ui/group_relation/visit_after_graph_drawn",
        function (event, groupRelationUi) {
            var indicator = PropertiesIndicator.withVertex(
                groupRelationUi
            );
            groupRelationUi.setHiddenRelationsContainer(
                indicator
            );
            indicator.build();
        }
    );
    return api;
});

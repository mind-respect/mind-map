/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_displayer",
    "triple_brain.event_bus",
    "triple_brain.ui.vertex_hidden_neighbor_properties_indicator",
    "triple_brain.graph_element_ui",
    "triple_brain.bubble",
    "twitter_bootstrap"
], function (GraphDisplayer, EventBus, PropertiesIndicator, GraphElementUi, Bubble) {
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
        Bubble.Self.apply(this, [this.html]);
    }
    Self.prototype = new Bubble.Self;
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
        return this.html.find('.menu');
    };

    Self.prototype._showDescription = function () {
        this.getLabel().popover('show');
    };

    Self.prototype._hideDescription = function () {
        this.getLabel().popover('hide');
    };

    Self.prototype.getLabel = function () {
        return this.html.find('.label');
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

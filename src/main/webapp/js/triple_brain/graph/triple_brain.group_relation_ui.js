/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_ui",
    "triple_brain.tree_edge",
    "bootstrap"
], function (GraphDisplayer, GraphElementUi, TreeEdge) {
    "use strict";
    var api = {};
    api.withHtml = function (html) {
        return new Self(html);
    };
    api.visitAll = function (visitor, container) {
        if(container === undefined){
            container = $("html");
        }
        container.find(".group-relation").each(function () {
            visitor(
                api.withHtml(
                    $(this)
                )
            );
        });
    };
    function Self(html) {
        this.html = html;
        TreeEdge.Self.prototype.init.call(
            this,
            html
        );
    }
    Self.prototype = new TreeEdge.Self;
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
        this.hideDescription();
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

    Self.prototype.hideDescription = function () {
        this.getLabel().popover('hide');
    };

    Self.prototype.getLabel = function () {
        return this.html.find('.label');
    };

    Self.prototype.getOriginalServerObject = Self.prototype.getGroupRelation;

    return api;
});

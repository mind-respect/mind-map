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
    TreeEdge.buildCommonConstructors(api);
    api.visitAllGroupRelations = function (visitor) {
        api.visitAll(function(element){
            if(element.isGroupRelation()){
                visitor(element);
            }
        });
    };
    api.Self = function(html) {
        this.html = html;
        TreeEdge.Self.prototype.init.call(
            this,
            html
        );
    };
    api.Self.prototype = new TreeEdge.Self;
    api.Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.GroupRelation;
    };

    api.Self.prototype.getNumberOfRelationsToFlag = function () {
        return this.getGroupRelation().getNumberOfVertices();
    };

    api.Self.prototype.getGroupRelation = function () {
        return this.html.data(
            "group_relation"
        );
    };

    api.Self.prototype.isToTheLeft = function () {
        if (this._isToTheLeft === undefined) {
            this._isToTheLeft = this.html.parents(".left-oriented").length > 0;
        }
        return this._isToTheLeft;
    };
    api.Self.prototype.getHtml = function () {
        return this.html;
    };
    api.Self.prototype.addChildTree = function () {
        GraphDisplayer.expandGroupRelation(
            this
        );
    };
    api.Self.prototype.select = function () {
        this.html.addClass("selected");
    };
    api.Self.prototype.deselect = function () {
        this.html.removeClass("selected");
        this.hideButtons();
        this.hideDescription();
    };

    api.Self.prototype.makeSingleSelected = function () {
        this.showButtons();
        this._showDescription();
    };

    api.Self.prototype.showButtons = function(){
        this.getMenuHtml().show();
    };

    api.Self.prototype.hideButtons = function(){
        this.getMenuHtml().hide();
    };

    api.Self.prototype.getMenuHtml = function () {
        return this.html.find('.menu');
    };

    api.Self.prototype._showDescription = function () {
        this.getLabel().popover('show');
    };

    api.Self.prototype.hideDescription = function () {
        this.getLabel().popover('hide');
    };

    api.Self.prototype.getLabel = function () {
        return this.html.find('.label');
    };

    api.Self.prototype.getOriginalServerObject = api.Self.prototype.getGroupRelation;

    return api;
});

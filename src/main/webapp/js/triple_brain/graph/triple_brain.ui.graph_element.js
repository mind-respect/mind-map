/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.graph_displayer",
    "jquery.cursor-at-end"
], function (GraphDisplayer) {
    var api = {};
    api.Types = {
        Vertex: "vertex",
        Relation: "relation",
        GroupRelation: "group_relation",
        Schema: "schema",
        Property: "property"
    };
    var menuHandlerGetters = {},
        selectors = {};
    initMenuHandlerGetters();
    initSelectors();
    api.Self = function () {
    };
    api.Self.prototype.getId = function(){
        return this.getHtml().attr("id");
    };
    api.Self.prototype.isVertex = function () {
        return this.getGraphElementType() === api.Types.Vertex;
    };
    api.Self.prototype.isSchema = function () {
        return this.getGraphElementType() === api.Types.Schema;
    };
    api.Self.prototype.isRelation = function () {
        return this.getGraphElementType() === api.Types.Relation;
    };
    api.Self.prototype.isGroupRelation = function () {
        return this.getGraphElementType() === api.Types.GroupRelation;
    };
    api.Self.prototype.isProperty = function () {
        return this.getGraphElementType() === api.Types.Property;
    };
    api.Self.prototype.isBubble = function () {
        return !this.isRelation();
    };
    api.Self.prototype.getSimilarButtonHtml = function (button) {
        return this.getMenuHtml().find(
                "[data-action=" + button.getAction() + "]"
        );
    };
    api.Self.prototype.getMenuHandler = function () {
        return menuHandlerGetters[
            this.getGraphElementType()
            ]();
    };
    api.Self.prototype.getTextOrDefault = function () {
        var text = this.text();
        return "" === text.trim() ?
            this.getSelector().getWhenEmptyLabel() :
            text;
    };
    api.Self.prototype.getSelector = function () {
        return selectors[
            this.getGraphElementType()
            ]();
    };
    api.Self.prototype.adjustWidthToNumberOfChars = function(){
        var text = this.text().trim(),
            label = this.getLabel();
        if(!label.is("input")){
            return;
        }
        if(text.length === 0){
            text = label.attr("placeholder");
        }
        var nbCharacter = text.length;
        label.css(
            'width',
                (nbCharacter / 1.62) + 1 + "em"
        );
    };
    api.Self.prototype.rightActionForType = function(vertexAction, edgeAction, groupRelationAction, schemaAction, propertyAction){
        switch(this.getGraphElementType()){
            case api.Types.Vertex :
                return vertexAction;
            case api.Types.Relation :
                return edgeAction;
            case api.Types.GroupRelation :
                return groupRelationAction;
            case api.Types.Schema :
                return schemaAction;
            case api.Types.Property :
                return propertyAction;
        }
    };
    api.Self.prototype.focus = function () {
        this.getLabel().focus().setCursorToEndOfText();
    };
    api.Self.prototype.centerOnScreen = function () {
        this.getHtml().centerOnScreen();
    };
    return api;
    function initMenuHandlerGetters() {
        menuHandlerGetters[api.Types.Vertex] = GraphDisplayer.getVertexMenuHandler;
        menuHandlerGetters[api.Types.Relation] = GraphDisplayer.getRelationMenuHandler;
        menuHandlerGetters[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationMenuHandler;
        menuHandlerGetters[api.Types.Schema] = GraphDisplayer.getSchemaMenuHandler;
        menuHandlerGetters[api.Types.Property] = GraphDisplayer.getPropertyMenuHandler;
    }
    function initSelectors() {
        selectors[api.Types.Vertex] = GraphDisplayer.getVertexSelector;
        selectors[api.Types.Relation] = GraphDisplayer.getEdgeSelector;
        selectors[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationSelector;
        selectors[api.Types.Schema] = GraphDisplayer.getSchemaSelector;
        selectors[api.Types.Property] = GraphDisplayer.getPropertySelector;
    }
});

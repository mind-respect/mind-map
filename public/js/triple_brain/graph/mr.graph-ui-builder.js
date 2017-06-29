/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.center_bubble",
    "mr.vertex-ui-builder",
    "mr.group-relation-ui-builder",
    "mr.edge-ui-builder",
    "triple_brain.graph_ui",
    "triple_brain.identification",
    "triple_brain.graph_element",
    "triple_brain.mind_map_info",
    "mr.suggestion-ui-builder",
    "mr.suggestion-relation-ui-builder",
    "triple_brain.triple_ui"
], function ($, RelativeTreeTemplates, CenterBubble, VertexUiBuilder, GroupRelationUiBuilder, EdgeUiBuilder, GraphUi, Identification, GraphElement, MindMapInfo, SuggestionUiBuilder, SuggestionRelationUiBuilder, TripleUi) {
    "use strict";
    var api = {};
    api.withDefaultHtmlBuilders = function(){
        return api.usingVertexAndEdgeHtmlBuilder();
    };
    api.usingVertexUiBuilder = function(vertexUiBuilder){
        return api.usingVertexAndEdgeHtmlBuilder(
            vertexUiBuilder
        );
    };
    api.usingEdgeUiBuilder = function(edgeUiBuilder){
        return api.usingVertexAndEdgeHtmlBuilder(
            null,
            edgeUiBuilder
        );
    };
    api.usingVertexAndEdgeHtmlBuilder = function(vertexUiBuilder, edgeHtmlBuilder){
        return new api.GraphUiBuilder(
            vertexUiBuilder || new VertexUiBuilder.VertexUiBuilder(),
            edgeHtmlBuilder || new EdgeUiBuilder.EdgeUiBuilder()
        );
    };
    api.GraphUiBuilder = function(htmlUiBuilder, edgeUiBuilder){
        this.vertexUiBuilder = htmlUiBuilder;
        this.edgeUiBuilder = edgeUiBuilder;
    };
    api.GraphUiBuilder.prototype.setDirectionAroundCenter = function (isToTheLeft) {
        this.forceToTheLeft = isToTheLeft;
    };

    api.GraphUiBuilder.prototype.getEdgeUiBuilder = function(){
        return this.edgeUiBuilder;
    };

    api.GraphUiBuilder.prototype.buildBubbleHtmlIntoContainer = function (serverFormat, parentBubble, builder, htmlId) {
        api.flagSuggestionsToNotDisplayGivenParentAndChildVertex(
            parentBubble.getModel(),
            serverFormat
        );
        var childTreeContainer = RelativeTreeTemplates[
                "vertex_tree_container"
                ].merge(),
            container;
        if (parentBubble.isCenterBubble()) {
            var centerBubble = CenterBubble.usingBubble(parentBubble);
            var addLeft = undefined === this.forceToTheLeft ?
                centerBubble.shouldAddLeft() :
                this.forceToTheLeft;
            container = addLeft ?
                centerBubble.getLeftContainer() :
                centerBubble.getRightContainer();
            serverFormat.isLeftOriented = addLeft;
        } else {
            container = this.childContainer(parentBubble);
            serverFormat.isLeftOriented = parentBubble.getModel().isLeftOriented;
        }
        var childVertexHtmlFacade = builder.create(
            serverFormat,
            htmlId
        );
        childVertexHtmlFacade.setModel(serverFormat);
        container.append(
            childTreeContainer
        ).append("<span class='clear-fix'>");
        var vertexContainer = RelativeTreeTemplates[
            "vertex_container"
            ].merge();
        childTreeContainer.append(
            vertexContainer
        );
        childTreeContainer[
            serverFormat.isLeftOriented ? "append" : "prepend"
            ](
            RelativeTreeTemplates[
                "vertical_border"
                ].merge()
        );
        vertexContainer.append(
            childVertexHtmlFacade.getHtml()
        );
        this.addChildrenContainerToBubble(childVertexHtmlFacade, serverFormat.isLeftOriented);
        return childVertexHtmlFacade;
    };
    api.GraphUiBuilder.prototype.addChildrenContainerToBubble = function (vertexHtmlFacade, toLeft) {
        var childrenContainer = $(RelativeTreeTemplates[
            "vertices_children_container"
            ].merge());
        vertexHtmlFacade.getHtml().closest(
            ".vertex-tree-container, .root-vertex-super-container"
        )[
            toLeft && vertexHtmlFacade ? "prepend" : "append"
            ](childrenContainer);
        return childrenContainer;
    };
    api.GraphUiBuilder.prototype.childContainer = function (bubbleUi) {
        return bubbleUi.getHtml().closest(".vertex-container"
        ).siblings(".vertices-children-container");
    };

    api.GraphUiBuilder.prototype.buildChildrenHtmlTreeRecursivelyEvenIfGrandParentAndIncludingDuplicates = function (parentVertexHtmlFacade, vertices) {
        return this._buildChildrenHtmlTreeRecursively(
            parentVertexHtmlFacade,
            vertices
        );
    };
    api.GraphUiBuilder.prototype.buildChildrenHtmlTreeRecursively = function (parentVertexHtmlFacade, vertices) {
        this._buildChildrenHtmlTreeRecursively(
            parentVertexHtmlFacade,
            vertices
        );
    };
    api.GraphUiBuilder.prototype._buildChildrenHtmlTreeRecursively = function (parentBubbleUi) {
        this.buildGroupRelations(
            parentBubbleUi.getModel(),
            parentBubbleUi
        );
    };

    api.GraphUiBuilder.prototype.buildGroupRelation = function (groupRelation, parentVertexUi) {
        this.buildGroupRelationToExpandOrNot(
            groupRelation,
            parentVertexUi,
            false
        );
    };
    api.GraphUiBuilder.prototype.buildGroupRelationToExpand = function (groupRelation, parentBubbleUi) {
        this.buildGroupRelationToExpandOrNot(
            groupRelation,
            parentBubbleUi,
            true
        );
    };
    api.GraphUiBuilder.prototype.buildGroupRelations = function (parentModel, parentUi) {
        sortGroupRelationRootsByIsGroupRelationOrCreationDate(parentModel.groupRelationRoots).forEach(function (groupRelation) {
            this.buildGroupRelationToExpandOrNot(
                groupRelation,
                parentUi,
                false
            );
        }.bind(this));
    };
    api.GraphUiBuilder.prototype.buildGroupRelationToExpandOrNot = function (groupRelation, parentBubbleUi, isToExpand) {
        if (!isToExpand && groupRelation.isTrulyAGroupRelation()) {
            return this.buildBubbleHtmlIntoContainer(
                groupRelation,
                parentBubbleUi,
                new GroupRelationUiBuilder.GroupRelationUiBuilder()
            );
        }
        var relationUi;
        groupRelation.getChildGroupRelations().forEach(function (childGroupRelation) {
            var childGroupRelationUi = this.buildGroupRelationToExpandOrNot(
                childGroupRelation,
                parentBubbleUi,
                false
            );
            if(childGroupRelationUi.isGroupRelation()){
                GroupRelationUiBuilder.completeBuild(
                    childGroupRelationUi
                );
            }
        }.bind(this));
        $.each(groupRelation.getSortedVertices(), function (key, verticesWithSameUri) {
            $.each(verticesWithSameUri, function (vertexHtmlId, vertexAndEdge) {
                var vertex = vertexAndEdge.vertex,
                    edge = vertexAndEdge.edge;
                relationUi = this.buildBubbleHtmlIntoContainer(
                    edge,
                    parentBubbleUi,
                    this.edgeUiBuilder
                );
                var childVertexHtmlFacade = this.buildBubbleHtmlIntoContainer(
                    vertex,
                    relationUi,
                    this.vertexUiBuilder,
                    vertexHtmlId
                );
                this.edgeUiBuilder.getClass().afterChildBuilt(
                    relationUi,
                    parentBubbleUi,
                    childVertexHtmlFacade
                );
                var treeContainer = childVertexHtmlFacade.getHtml().closest(
                    ".vertex-tree-container"
                );
                treeContainer[vertex.isLeftOriented ? "prepend" : "append"](
                    this._buildChildrenHtmlTreeRecursively(
                        childVertexHtmlFacade
                    )
                );
                if (childVertexHtmlFacade.isVertex() && childVertexHtmlFacade.hasSuggestions() && !childVertexHtmlFacade.hasHiddenRelations()) {
                    api.addSuggestionsToVertex(
                        childVertexHtmlFacade.getSuggestions(),
                        childVertexHtmlFacade
                    );
                }
            }.bind(this));
        }.bind(this));
        return relationUi;
    };

    api.GraphUiBuilder.prototype.buildRootBubble = function (serverFacade, bubblesContainer) {
        this.rootBubble = this.vertexUiBuilder.create(
            serverFacade,
            GraphUi.generateBubbleHtmlId()
        );
        this.rootBubble.setModel(serverFacade);
        this.rootBubble.getHtml().addClass("center-vertex");
        var bubbleContainer = $(
            RelativeTreeTemplates["vertex_container"].merge()
        );
        bubblesContainer.append(bubbleContainer);
        bubbleContainer.append(this.rootBubble.getHtml());
        this.leftChildrenContainer = this.addChildrenContainerToBubble(
            this.rootBubble,
            true
        ).addClass("left-oriented");
        this.rightChildrenContainer = this.addChildrenContainerToBubble(
            this.rootBubble,
            false
        ).addClass("right-oriented");
        return this.rootBubble;
    };

    api.GraphUiBuilder.prototype.addVertex = function(newVertex, parentBubble) {
        newVertex.groupRelationRoots = [];
        return this.buildBubbleHtmlIntoContainer(
            newVertex,
            parentBubble,
            this.vertexUiBuilder,
            GraphUi.generateBubbleHtmlId()
        );
    };

    api.GraphUiBuilder.prototype.addEdge = function(serverEdge, sourceVertexUi){
        return this.buildBubbleHtmlIntoContainer(
            serverEdge,
            sourceVertexUi,
            this.edgeUiBuilder
        );
    };

    api.GraphUiBuilder.prototype.setVertexUiBuilder = function(vertexUiBuilder){
        this.vertexUiBuilder = vertexUiBuilder;
    };

    api.GraphUiBuilder.prototype.setEdgeUiBuilder = function(edgeUiBuilder){
        this.edgeUiBuilder = edgeUiBuilder;
    };

    function sortGroupRelationRootsByIsGroupRelationOrCreationDate(groupRelationRoots) {
        return groupRelationRoots.sort(function (groupRelationA, groupRelationB) {
                var vertexA = groupRelationA.getFirstVertex();
                var vertexB = groupRelationB.getFirstVertex();
                return GraphElement.sortCompare(
                    vertexA,
                    vertexB
                );
            }
        );
    }
    api.buildRootBubbleContainer = function() {
        var verticesContainer = RelativeTreeTemplates[
            "root_vertex_super_container"
            ].merge();
        GraphUi.addHtml(
            verticesContainer
        );
        return verticesContainer;
    };

    api.addSuggestionsToVertex = function(suggestions, vertex){
        if (MindMapInfo.isViewOnly()) {
            return;
        }
        $.each(suggestions, function () {
            api.addSuggestionToVertex(
                this,
                vertex
            );
        });
    };

    api.addSuggestionToVertex = function (suggestion, vertex) {
        if (MindMapInfo.isViewOnly() || !suggestion.shouldDisplay()) {
            return;
        }
        var graphUiBuilder = api.usingVertexAndEdgeHtmlBuilder(
            new SuggestionUiBuilder.SuggestionUiBuilder(),
            new SuggestionRelationUiBuilder.SuggestionRelationUiBuilder()
        );
        var suggestionRelation = graphUiBuilder.addEdge(
            suggestion,
            vertex
        );
        suggestionRelation.getModel().isLeftOriented = suggestionRelation.getSuggestion().isLeftOriented;
        var suggestionBubble = graphUiBuilder.addVertex(
            suggestion,
            suggestionRelation
        );
        suggestionBubble.getModel().isLeftOriented = suggestionBubble.getSuggestion().isLeftOriented;
        SuggestionUiBuilder.completeBuild(
            suggestionBubble
        );
        SuggestionRelationUiBuilder.afterChildBuilt(suggestionRelation);
        return new TripleUi.TripleUi(
            suggestionRelation,
            vertex,
            suggestionBubble
        );
    };

    api.flagSuggestionsToNotDisplayGivenParentAndChildVertex = function(parentVertex, childVertex) {
        if (!parentVertex.getSuggestions) {
            return;
        }
        var hasFlagged = false;
        $.each(parentVertex.getSuggestions(), function () {
            var suggestion = this;
            if (childVertex.getIdentification) {
                if (suggestion.isRelatedToIdentifier(childVertex.getIdentification())) {
                    suggestion.shouldNotDisplay();
                    hasFlagged = true;
                }
            } else if (childVertex.hasIdentification) {
                var suggestionAsIdentification = Identification.withUri(
                    suggestion.getSameAs().getUri()
                );
                if (childVertex.hasIdentification(suggestionAsIdentification)) {
                    suggestion.shouldNotDisplay();
                    hasFlagged = true;
                }
            }
        });
        return hasFlagged;
    };
    return api;
});
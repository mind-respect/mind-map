/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.vertex_ui",
        "triple_brain.event_bus",
        "triple_brain.tree_edge",
        "triple_brain.object_utils",
        "triple_brain.triple_ui_builder",
        "triple_brain.selection_handler",
        "triple_brain.bubble_factory",
        "triple_brain.mind_map_info",
        "clipboard",
        "triple_brain.bubble",
        "triple_brain.graph_element_ui"
    ],
    function ($, VertexUi, EventBus, TreeEdge, ObjectUtils, TripleUiBuilder, SelectionHandler, BubbleFactory, MindMapInfo, Clipboard, Bubble, GraphElementUi) {
        "use strict";
        var api = {};
        VertexUi.buildCommonConstructors(api);
        api.createFromHtml = function (html) {
            var vertex = new api.RelativeTreeVertex().init(
                html
            );
            api.initCache(
                vertex
            );
            VertexUi.initCache(
                vertex
            );
            return vertex;
        };
        api.ofVertex = function (vertex) {
            return api.withHtml(
                vertex.getHtml()
            );
        };
        api.VerticesToHtmlLists = function (vertices) {
            var integratedVerticesId = {};
            var lists = $("<div>");
            Bubble.sortBubblesByNumberOfParentVerticesAscending(vertices).forEach(function (vertex) {
                if (integratedVerticesId[vertex.getId()]) {
                    return;
                }
                lists.append(
                    integrateVertex(vertex, true)
                );
            });
            return lists;
            function integrateVertex(vertex, isARoot) {
                var html = $(
                    isARoot ? "<div>" : "<li>"
                ).append(vertex.text());
                var ul = $("<ul>");
                var hasChildInList = false;
                vertices.forEach(function (otherVertex) {
                    if (vertex.isVertexAChild(otherVertex)) {
                        ul.append(
                            integrateVertex(otherVertex, false)
                        );
                        hasChildInList = true;
                    }
                });
                if(hasChildInList){
                    html.append(ul);
                }
                integratedVerticesId[vertex.getId()] = true;
                return html;
            }
        };
        api = ObjectUtils.makeChildInheritParent(
            api,
            VertexUi
        );
        api.RelativeTreeVertex = function () {
        };

        api.RelativeTreeVertex.prototype = new VertexUi.VertexUi();

        api.RelativeTreeVertex.prototype.init = function (html) {
            this.html = html;
            VertexUi.VertexUi.apply(this, [html]);
            VertexUi.VertexUi.prototype.init.call(
                this
            );
            return this;
        };

        api.RelativeTreeVertex.prototype.visitVerticesChildren = function (visitor) {
            var children = this.getChildrenBubblesHtml();
            $.each(children, function () {
                var bubble = BubbleFactory.fromHtml($(this));
                if (bubble.isRelation()) {
                    var relationChild = bubble.getTopMostChildBubble();
                    if (relationChild.isVertex()) {
                        visitor(relationChild);
                    }
                }
            });
        };
        api.RelativeTreeVertex.prototype.remove = function (applyToOthers) {
            if (applyToOthers === undefined) {
                applyToOthers = true;
            }
            if (this._hasBeenCalledToRemove() || this._isRemoved()) {
                return;
            }
            this._setHasBeenCalledToRemove();
            if (applyToOthers) {
                this.applyToOtherInstances(function (otherInstance) {
                    otherInstance.remove();
                });
            }
            if (this._isRemoved()) {
                return;
            }
            this.visitVerticesChildren(function (childVertex) {
                childVertex.remove();
            });
            if (this._isRemoved()) {
                return;
            }
            this.removeFromCache();
            VertexUi.VertexUi.prototype.remove.call(
                this
            );
        };
        api.RelativeTreeVertex.prototype._setHasBeenCalledToRemove = function () {
            this.getHtml().data(
                "hasBeenCalledToRemove",
                true
            );
        };
        api.RelativeTreeVertex.prototype._hasBeenCalledToRemove = function () {
            return this.getHtml().data("hasBeenCalledToRemove") === true;
        };
        api.RelativeTreeVertex.prototype.removeFromCache = function () {
            api.removeFromCache(
                this.getUri(),
                this.getId()
            );
            VertexUi.removeFromCache(
                this.getUri(),
                this.getId()
            );
        };
        api.RelativeTreeVertex.prototype._isRemoved = function () {
            return $.isEmptyObject(
                this.getHtml().data()
            );
        };
        api.RelativeTreeVertex.prototype.getRelationWithUiParent = function () {
            return this.getParentBubble();
        };
        api.RelativeTreeVertex.prototype.isALeaf = function () {
            return !this.hasChildren();
        };

        api.RelativeTreeVertex.prototype.hasHiddenRelations = function () {
            return !this.isCenterBubble() && MindMapInfo.isViewOnly() ?
                        this._hasPublicHiddenRelations() :
                        this.getNumberOfHiddenRelations() > 0;

        };
        api.RelativeTreeVertex.prototype.getNumberOfHiddenRelations = function(){
            if(this.isALeaf()){
                if(this.getParentBubble().isMetaRelation()){
                    return this.getModel().getNumberOfConnectedEdges();
                }
                return this.getModel().getNumberOfConnectedEdges() - 1;
            }
            return 0;
        };
        api.RelativeTreeVertex.prototype._hasPublicHiddenRelations = function () {
            return this.getModel().getNbPublicNeighbors() > (
                    this.getParentVertex().getModel().isPublic() ? 1 : 0
                );
        };
        api.RelativeTreeVertex.prototype.isVertexAChild = function (otherVertex) {
            return !otherVertex.isCenterBubble() &&
                !otherVertex.isSameBubble(this) &&
                otherVertex.getParentVertex().isSameBubble(this);
        };

        api.setupVertexCopyButton = function(vertex){
            var button = vertex.getButtonHtmlHavingAction("copy");
            if(button.length === 0){
                return;
            }
            api.setupCopyButton(
                button[0]
            );
        };

        api.setupCopyButton = function(button){
            var clipboard = new Clipboard(
                button, {
                    target: function () {
                        var treeListCopyDump = $("#tree-list-copy-dump");
                        treeListCopyDump.html(
                            api.VerticesToHtmlLists(
                                SelectionHandler.getSelectedVertices()
                            )
                        );
                        return treeListCopyDump[0];
                    }
                }
            );
            clipboard.on("success", function(){
                $("#tree-list-copy-dump").empty();
            });
        };

        EventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            vertexAndRelationAddedHandler
        );
        EventBus.subscribe('/event/ui/graph/drawn', function () {
            var expandCalls = [];
            api.visitAllVertices(function(vertexUi){
                if(vertexUi.getModel().hasOnlyOneHiddenChild() && !vertexUi.isExpanded()){
                    expandCalls.push(
                        vertexUi.getController().expand(true)
                    );
                }
            });
            $.when.apply($, expandCalls).then(function(){
                GraphElementUi.getCenterVertexOrSchema().sideCenterOnScreenWithAnimation();
            });
            setupCopyButtons();
        });

        function setupCopyButtons(){
            var copyButton = $('.clipboard-copy-button')[0];
            if (!copyButton) {
                return;
            }
            $.each($('.clipboard-copy-button'), function(){
               api.setupCopyButton(this);
            });
        }
        function vertexAndRelationAddedHandler(event, triple, tripleJson) {
            var sourceBubble = triple.sourceVertex();
            if (!sourceBubble.isVertex()) {
                return;
            }
            triple.destinationVertex().resetOtherInstances();
            sourceBubble.applyToOtherInstances(function (otherInstance) {
                TripleUiBuilder.createUsingServerTriple(
                    otherInstance,
                    tripleJson
                );
                otherInstance.resetOtherInstances();
            });
        }

        return api;
    }
);
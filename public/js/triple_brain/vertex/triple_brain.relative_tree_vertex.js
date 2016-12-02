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
        "triple_brain.mind_map_info"
    ],
    function ($, VertexUi, EventBus, TreeEdge, ObjectUtils, TripleUiBuilder, SelectionHandler, BubbleFactory, MindMapInfo) {
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
            return this.isALeaf() && (
                    MindMapInfo.isViewOnly() ?
                        this._hasPublicHiddenRelations() :
                    this.getModel().getNumberOfConnectedEdges() > 1
                );
        };
        api.RelativeTreeVertex.prototype._hasPublicHiddenRelations = function () {
            return this.getModel().getNbPublicNeighbors() > (
                    this.getParentVertex().getModel().isPublic() ? 1 : 0
                );
        };
        api.RelativeTreeVertex.prototype.selectTree = function () {
            SelectionHandler.setToSingleVertex(
                this
            );
            this.visitDescendants(function (bubble) {
                if (bubble.isVertex()) {
                    SelectionHandler.addVertex(
                        bubble
                    );
                }
            });
        };
        EventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            vertexAndRelationAddedHandler
        );
        function vertexAndRelationAddedHandler(event, triple, tripleServerFormat) {
            var sourceBubble = triple.sourceVertex();
            if (!sourceBubble.isVertex()) {
                return;
            }
            triple.destinationVertex().resetOtherInstances();
            sourceBubble.applyToOtherInstances(function (otherInstance) {
                TripleUiBuilder.createUsingServerTriple(
                    otherInstance,
                    tripleServerFormat
                );
                otherInstance.resetOtherInstances();
            });
        }

        return api;
    }
);
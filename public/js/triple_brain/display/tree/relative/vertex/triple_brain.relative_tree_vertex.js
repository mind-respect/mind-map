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
        "triple_brain.ui.vertex_hidden_neighbor_properties_indicator",
        "triple_brain.bubble_factory"
    ],
    function ($, VertexUi, EventBus, TreeEdge, ObjectUtils, TripleUiBuilder, SelectionHandler, PropertiesIndicator, BubbleFactory) {
        "use strict";
        var api = {};
        VertexUi.buildCommonConstructors(api);
        api.setDraggedVertex = function(vertex){
            $("body").data(
                "dragged-vertex",
                vertex
            );
        };
        api.getDraggedVertex = function(){
            return $("body").data(
                "dragged-vertex"
            );
        };
        api.createFromHtml = function (html) {
            var vertex = new api.Object().init(
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
        api.Object = function () {
        };

        api.Object.prototype = new VertexUi.Object();

        api.Object.prototype.init = function (html) {
            this.html = html;
            VertexUi.Object.apply(this, [html]);
            VertexUi.Object.prototype.init.call(
                this
            );
            return this;
        };
        api.Object.prototype.visitVerticesChildren = function (visitor) {
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
        api.Object.prototype.remove = function () {
            if (this._hasBeenCalledToRemove() || this._isRemoved()) {
                return;
            }
            this._setHasBeenCalledToRemove();
            this.applyToOtherInstances(function (otherInstance) {
                otherInstance.remove();
            });
            if (this._isRemoved()) {
                return;
            }
            this.visitVerticesChildren(function (childVertex) {
                childVertex.remove();
            });
            if (this._isRemoved()) {
                return;
            }
            api.removeFromCache(
                this.getUri(),
                this.getId()
            );
            VertexUi.Object.prototype.remove.call(
                this
            );
        };
        api.Object.prototype._setHasBeenCalledToRemove = function () {
            this.getHtml().data(
                "hasBeenCalledToRemove",
                true
            );
        };
        api.Object.prototype._hasBeenCalledToRemove = function () {
            return this.getHtml().data("hasBeenCalledToRemove") === true;
        };
        api.Object.prototype._isRemoved = function () {
            return $.isEmptyObject(
                this.getHtml().data()
            );
        };
        api.Object.prototype.getRelationWithUiParent = function () {
            return this.getParentBubble();
        };
        api.Object.prototype.isALeaf = function () {
            return !this.hasChildren();
        };
        api.Object.prototype.buildHiddenNeighborPropertiesIndicator = function () {
            var propertiesIndicator = PropertiesIndicator.withVertex(
                this
            );
            this.setHiddenRelationsContainer(
                propertiesIndicator
            );
            propertiesIndicator.build();
        };
        api.Object.prototype.hasHiddenRelations = function () {
            return this.isALeaf() && this.getTotalNumberOfEdges() > 1;
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
            sourceBubble.applyToOtherInstances(function (vertex) {
                TripleUiBuilder.createUsingServerTriple(
                    vertex,
                    tripleServerFormat
                );
            });
        }

        return api;
    }
);
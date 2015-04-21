/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
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
        var api = {};
        VertexUi.buildCommonConstructors(api);
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
        api.Object.prototype = new VertexUi.Object;
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
            this.applyToOtherInstances(function (otherInstance) {
                otherInstance.remove();
            });
            this.visitVerticesChildren(function (childVertex) {
                childVertex.remove();
            });
            api.removeFromCache(
                this.getUri(),
                this.getId()
            );
            VertexUi.Object.prototype.remove.call(
                this
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
            '/event/ui/graph/identification/added',
            identificationAddedHandler
        );
        function identificationAddedHandler(event, graphElement, identification) {
            if (!graphElement.isVertex()) {
                return;
            }
            var treeVertex = api.ofVertex(graphElement);
            treeVertex.applyToOtherInstances(function (vertex) {
                var addAction = identification.rightActionForType(
                    graphElement.addType,
                    graphElement.addSameAs,
                    graphElement.addGenericIdentification
                );
                addAction.call(
                    vertex,
                    identification
                );
            });
        }

        EventBus.subscribe(
            '/event/ui/graph/identification/removed',
            identificationRemovedHandler
        );
        function identificationRemovedHandler(event, graphElement, identification) {
            if (!graphElement.isVertex()) {
                return;
            }
            var treeVertex = api.ofVertex(graphElement);
            treeVertex.applyToOtherInstances(function (vertex) {
                var removeAction = identification.rightActionForType(
                    graphElement.removeType,
                    graphElement.removeSameAs,
                    graphElement.removeGenericIdentification
                );
                removeAction.call(
                    vertex,
                    identification
                );
            });
        }

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
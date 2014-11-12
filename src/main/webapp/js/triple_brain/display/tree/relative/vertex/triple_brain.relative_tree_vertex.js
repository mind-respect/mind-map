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
        "triple_brain.ui.vertex_hidden_neighbor_properties_indicator"
    ],
    function ($, VertexUi, EventBus, TreeEdge, ObjectUtils, TripleUiBuilder, SelectionHandler, PropertiesIndicator) {
        var api = {},
            otherInstancesKey = "otherInstances";
        api.ofVertex = function (vertex) {
            return api.withHtml(
                vertex.getHtml()
            );
        };
        api = ObjectUtils.makeChildInheritParent(
            api,
            VertexUi
        );
        api.Object = function () {};
        api.Object.prototype = new VertexUi.Object;
        api.Object.prototype.init = function(html){
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
                var html = $(this);
                if(html.hasClass("vertex")){
                    var vertex = api.withHtml(
                        html
                    );
                    visitor(vertex);
                }
            });
        };
        api.Object.prototype.getRelationWithParent = function () {
            return TreeEdge.withHtml(
                this.getRelationWithParentHtml()
            );
        };
        api.Object.prototype.getRelationWithParentHtml = function () {
            return this.html.find("> .relation");
        };
        api.Object.prototype.applyToOtherInstances = function (apply) {
            $.each(this.getOtherInstances(), function () {
                var vertex = this;
                apply(vertex);
            });
        };
        api.Object.prototype.getOtherInstances = function () {
            var vertex = api.withHtml(this.html);
            if (this.html.data(otherInstancesKey) === undefined) {
                var verticesWithSameUri = api.withUri(
                    vertex.getUri()
                );
                var otherInstances = [];
                $.each(verticesWithSameUri, function () {
                    var vertexWithSameUri = this;
                    if (vertexWithSameUri.getId() !== vertex.getId()) {
                        otherInstances.push(
                            vertexWithSameUri
                        );
                    }
                });
                this.html.data(
                    otherInstancesKey,
                    otherInstances
                );
            }
            return this.html.data(otherInstancesKey);
        };
        api.Object.prototype.resetOtherInstances = function () {
            this.html.removeData(otherInstancesKey);
        };

        api.Object.prototype.isALeaf = function () {
            return !this.hasChildren();
        };
        api.Object.prototype.hasTheDuplicateButton = function () {
            return this.getInBubbleContainer().find(
                "button.duplicate"
            ).length > 0;
        };

        api.Object.prototype.buildHiddenNeighborPropertiesIndicator = function () {
            var propertiesIndicator = PropertiesIndicator.withVertex(
                this
            );
            this.html.data(
                "hidden_properties_indicator",
                propertiesIndicator
            );
            propertiesIndicator.build();
        };

        api.Object.prototype.hasHiddenRelations = function () {
            return this.isALeaf() && this.getTotalNumberOfEdges() > 1;
        };

        api.Object.prototype.remove = function () {
            SelectionHandler.removeVertex(this);
            this.removeHiddenRelationsContainer();
            if (this.isCenterVertex()) {
                this.html.closest(".vertex-container").remove();
            } else {
                var treeContainer = this.html.closest(".vertex-tree-container"),
                    clearFix = treeContainer.next(".clear-fix");
                clearFix.remove();
                treeContainer.remove();
            }
        };

        VertexUi.buildCommonConstructors(api);
        EventBus.subscribe(
            '/event/ui/graph/identification/added',
            identificationAddedHandler
        );
        function identificationAddedHandler(event, graphElement, identification){
            if(!graphElement.isVertex()){
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
        function identificationRemovedHandler(event, graphElement, identification){
            if(!graphElement.isVertex()){
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
        function vertexAndRelationAddedHandler(event, triple, tripleServerFormat){
            var sourceBubble = triple.sourceVertex();
            if(!sourceBubble.isVertex()){
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
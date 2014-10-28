/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.vertex_ui",
        "triple_brain.event_bus",
        "triple_brain.tree_edge",
        "triple_brain.object_utils",
        "triple_brain.bubble",
        "triple_brain.ui.triple",
        "triple_brain.selection_handler",
        "triple_brain.ui.vertex_hidden_neighbor_properties_indicator"
    ],
    function ($, VertexUi, EventBus, TreeEdge, ObjectUtils, Bubble, Triple, SelectionHandler, PropertiesIndicator) {
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
            this.bubble = Bubble.withHtmlFacade(this);
            VertexUi.Object.apply(this, [html]);
            VertexUi.Object.prototype.init.call(
                this
            );
            return this;
        };
        api.Object.prototype.isToTheLeft = function () {
            if (this._isToTheLeft === undefined) {
                this._isToTheLeft = this.html.parents(".left-oriented").length > 0;
            }
            return this._isToTheLeft;
        };

        api.Object.prototype.visitVerticesChildren = function (visitor) {
            var children = this.bubble.getChildrenBubblesHtml();
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
        api.Object.prototype.hasChildren = function () {
            return this.bubble.hasChildren();
        };
        api.Object.prototype.getParentBubble = function () {
            return this.bubble.getParentBubble();
        };
        api.Object.prototype.getParentVertex = function () {
            return this.bubble.getParentVertex();
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
            return !this.bubble.hasChildren();
        };
        api.Object.prototype.hasTheDuplicateButton = function () {
            return this.getInBubbleContainer().find(
                "button.duplicate"
            ).length > 0;
        };

        api.Object.prototype.getTopMostChild = function () {
            return this.bubble.getTopMostChild();
        };
        api.Object.prototype.hasBubbleAbove = function () {
            return this.bubble.hasBubbleAbove();
        };
        api.Object.prototype.getBubbleAbove = function () {
            return this.bubble.getBubbleAbove();
        };
        api.Object.prototype.hasBubbleUnder = function () {
            return this.bubble.hasBubbleUnder();
        };
        api.Object.prototype.getBubbleUnder = function () {
            return this.bubble.getBubbleUnder();
        };
        api.Object.prototype.getBubble = function () {
            return this.bubble;
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
        api.Object.prototype.hasHiddenRelationsContainer = function(){
            return this.bubble.hasHiddenRelationsContainer();
        };

        api.Object.prototype.setHiddenRelationsContainer = function(hiddenRelationsContainer){
            this.bubble.setHiddenRelationsContainer(
                hiddenRelationsContainer
            );
        };

        api.Object.prototype.getHiddenRelationsContainer = function(){
            return this.bubble.getHiddenRelationsContainer();
        };

        api.Object.prototype.removeHiddenRelationsContainer = function(){
            this.bubble.removeHiddenRelationsContainer();
        };

        api.Object.prototype.remove = function () {
            SelectionHandler.removeVertex(this);
            this.bubble.removeHiddenRelationsContainer();
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
                Triple.createUsingServerTriple(
                    vertex,
                    tripleServerFormat
                );
            });
        }
        return api;
    }
);
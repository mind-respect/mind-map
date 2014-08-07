/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.ui.vertex",
        "triple_brain.event_bus",
        "triple_brain.ui.edge",
        "triple_brain.object_utils",
        "triple_brain.bubble"
    ],
    function ($, VertexUi, EventBus, EdgeUi, ObjectUtils, Bubble) {
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
        api.Object = function (html) {
            this.html = html;
            this.bubble = Bubble.withHtml(html);
            VertexUi.Object.apply(this, [html]);
            this.init();
        };
        api.Object.prototype = new VertexUi.Object;
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
            return EdgeUi.withHtml(
                this.html.find("> .in-bubble-content > .relation")
            );
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
        VertexUi.buildCommonConstructors(api);
        EventBus.subscribe(
            '/event/ui/graph/vertex/same_as/added',
            function (event, vertex, sameAs) {
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function (vertex) {
                    vertex.addSameAs(sameAs);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/generic_identification/added',
            function (event, vertex, genericIdentification) {
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function (vertex) {
                    vertex.addGenericIdentification(genericIdentification);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/type/added',
            function (event, vertex, type) {
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function (vertex) {
                    vertex.addType(type);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/type/removed',
            function (event, vertex, typeToRemove) {
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function (vertex) {
                    vertex.removeType(typeToRemove);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/generic_identification/removed',
            function (event, vertex, genericIdentification) {
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function (vertex) {
                    vertex.removeGenericIdentification(genericIdentification);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/same_as/removed',
            function (event, vertex, sameAs) {
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function (vertex) {
                    vertex.removeSameAs(sameAs);
                });
            }
        );
        return api;
    }
);
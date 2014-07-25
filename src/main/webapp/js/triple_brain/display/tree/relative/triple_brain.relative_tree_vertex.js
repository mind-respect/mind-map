/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex",
    "triple_brain.event_bus",
    "triple_brain.ui.edge",
    "triple_brain.object_utils",
    "triple_brain.ui.graph_element"
],
    function ($, VertexUi, EventBus, EdgeUi, ObjectUtils, GraphElementUi) {
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
            this.getBubbleAboveHtml = function(){
                return html.closest(
                    ".vertex-tree-container"
                ).prevAll(
                    ".vertex-tree-container:first"
                ).find("> .vertex-container").find("> .vertex")
            };
            this.getBubbleUnderHtml = function(){
                return html.closest(
                    ".vertex-tree-container"
                ).nextAll(
                    ".vertex-tree-container:first"
                ).find("> .vertex-container").find("> .vertex")
            };
            this.getChildren = function() {
                return html.closest(".vertex-container").siblings(
                    ".vertices-children-container"
                ).find(".vertex");
            };
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

        api.Object.prototype.visitChildren = function (visitor) {
            var children = this.getChildren();
            $.each(children, function () {
                var vertex = api.withHtml(
                    $(this)
                );
                visitor(vertex);
            });
        };
        api.Object.prototype.hasChildren = function () {
            return this.getChildren().length > 0;
        };
        api.Object.prototype.getParentVertex = function () {
            return api.withHtml(
                this.getParentVertexHtml().find("> .vertex")
            );
        };
        api.Object.prototype.getRelationWithParent = function(){
            return EdgeUi.withHtml(
                this.html.find("> .in-bubble-content > .relation")
            );
        };
        api.Object.prototype.getParentVertexHtml = function () {
            return this.html.closest(".vertices-children-container")
                .siblings(".vertex-container");
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
        api.Object.prototype.getChildrenOrientation = function () {
            return this.isToTheLeft() ?
                "left" :
                "right"
        };
        api.Object.prototype.isALeaf = function () {
            return this.getChildren().length === 0;
        };
        api.Object.prototype.hasTheDuplicateButton = function () {
            return this.getInBubbleContainer().find(
                "button.duplicate"
            ).length > 0;
        };
        api.Object.prototype.getChildren = function () {
            return this.getChildren();
        };
        api.Object.prototype.getTopMostChild = function () {
            return api.withHtml(
                $(this.getChildren()[0])
            );
        };
        api.Object.prototype.hasBubbleAbove = function () {
            return this.getBubbleAboveHtml().length > 0;
        };
        api.Object.prototype.getBubbleAbove = function () {
            return api.withHtml(
                this.getBubbleAboveHtml()
            );
        };
        api.Object.prototype.hasBubbleUnder = function () {
            return this.getBubbleUnderHtml().length > 0;
        };
        api.Object.prototype.getBubbleUnder = function () {
            return api.withHtml(
                this.getBubbleUnderHtml()
            );
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
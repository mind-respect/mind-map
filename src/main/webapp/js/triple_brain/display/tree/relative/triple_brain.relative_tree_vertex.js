/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex",
    "triple_brain.event_bus",
    "triple_brain.ui.edge",
    "triple_brain.object_utils"
],
    function ($, VertexUi, EventBus, EdgeUi, ObjectUtils) {
        var api = {};
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
            var self = this;
            var otherInstancesKey = "otherInstances";
            var _isToTheLeft;
            this.isToTheLeft = function () {
                if (_isToTheLeft === undefined) {
                    _isToTheLeft = html.parents(".left-oriented").length > 0;
                }
                return _isToTheLeft;
            };

            this.visitChildren = function (visitor) {
                var children = getChildren();
                $.each(children, function () {
                    var vertex = api.withHtml(
                        $(this)
                    );
                    visitor(vertex);
                });
            };
            this.hasChildren = function () {
                return getChildren().length > 0;
            };
            this.getParentVertex = function () {
                return api.withHtml(
                    self.getParentVertexHtml().find("> .vertex")
                );
            };
            this.getRelationWithParent = function(){
                return EdgeUi.withHtml(
                    html.find("> .in-bubble-content > .relation")
                );
            };
            this.getParentVertexHtml = function () {
                return html.closest(".vertices-children-container")
                    .siblings(".vertex-container");
            };
            this.applyToOtherInstances = function (apply) {
                $.each(self.getOtherInstances(), function () {
                    var vertex = this;
                    apply(vertex);
                });
            };
            this.getOtherInstances = function () {
                var vertex = api.withHtml(html);
                if (html.data(otherInstancesKey) === undefined) {
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
                    html.data(
                        otherInstancesKey,
                        otherInstances
                    );
                }
                return html.data(otherInstancesKey);
            };
            this.resetOtherInstances = function () {
                html.removeData(otherInstancesKey)
            };
            this.getChildrenOrientation = function () {
                return self.isToTheLeft() ?
                    "left" :
                    "right"
            };
            this.isALeaf = function () {
                return getChildren().length === 0;
            };
            this.hasTheDuplicateButton = function () {
                return self.getInBubbleContainer().find(
                    "button.duplicate"
                ).length > 0;
            };
            this.getChildren = function () {
                return getChildren();
            };
            this.getTopMostChild = function () {
                return api.withHtml(
                    $(self.getChildren()[0])
                );
            };
            this.hasBubbleAbove = function () {
                return getBubbleAboveHtml().length > 0;
            };
            this.getBubbleAbove = function () {
                return api.withHtml(
                    getBubbleAboveHtml()
                );
            };
            this.hasBubbleUnder = function () {
                return getBubbleUnderHtml().length > 0;
            };
            this.getBubbleUnder = function () {
                return api.withHtml(
                    getBubbleUnderHtml()
                );
            };
            function getBubbleAboveHtml(){
                return html.closest(
                    ".vertex-tree-container"
                ).prev(
                    ".vertex-tree-container"
                ).find("> .vertex-container").find("> .vertex")
            }
            function getBubbleUnderHtml(){
                return html.closest(
                    ".vertex-tree-container"
                ).next(
                    ".vertex-tree-container"
                ).find("> .vertex-container").find("> .vertex")
            }
            VertexUi.Object.apply(self, [html]);
            this.initCrow();
            function getChildren() {
                return html.closest(".vertex-container").siblings(
                    ".vertices-children-container"
                ).find(".vertex");
            }
        };
        api.Object.prototype = new crow.ConnectedNode;
        api.Object.prototype = new VertexUi.Object;

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
        VertexUi.buildCommonConstructors(api);
        return api;
    }
);
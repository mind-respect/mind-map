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
    function($, VertexUi, EventBus, EdgeUi, ObjectUtils){
        var api = {};
        api.withHtml = function(html){
            return new api.Object(
                $(html)
            );
        };
        api.ofVertex = function(vertex){
            return api.withHtml(
                vertex.getHtml()
            );
        };
        api = ObjectUtils.extendedApiForChildUsingParent(
            api,
            VertexUi
        );
        api.Object = function(html){
            var self = this;
            var otherInstancesKey = "otherInstances";
            var _isToTheLeft;
            this.isToTheLeft = function () {
                if (_isToTheLeft === undefined) {
                    _isToTheLeft = html.parents(".left-oriented").length > 0;
                }
                return _isToTheLeft;
            };
            this.adjustPositionIfApplicable = function () {
                if (self.isToTheLeft()) {
                    self.adjustPosition();
                }
            };
            this.adjustAllChildrenPositionIfApplicable = function () {
                var vertex = api.withHtml(html);
                if (self.isToTheLeft() || vertex.isCenterVertex()) {
                    var visit = vertex.isCenterVertex() ?
                        self.visitCenterVertexLeftVertices :
                        self.visitChildren;
                    visit(function (vertex) {
                        var relativeVertex = api.ofVertex(vertex);
                        relativeVertex.adjustPosition();
                    });
                }
            };
            this.adjustPosition = function (parentVertexHtml) {
                var width = html.width();
                var vertex = api.withHtml(html);
                if (parentVertexHtml === undefined) {
                    parentVertexHtml = self.getParentVertexHtml();
                }
                var parentWidth = $(parentVertexHtml).width();
                html.closest(".vertex-tree-container").css(
                    "margin-left", "-" + (parentWidth + width + 40) + "px"
                );
                EventBus.publish(
                    "/event/ui/graph/vertex/position-changed",
                    vertex
                );
            };
            this.visitChildren = function (visitor) {
                var children = getChildren();
                $.each(children, function () {
                    var vertex = api.withHtml(this);
                    visitor(vertex);
                });
            };
            this.visitCenterVertexLeftVertices = function (visitor) {
                var children = html.closest(".vertex-container").siblings(
                    ".vertices-children-container.left-oriented"
                ).find(".vertex");
                $.each(children, function () {
                    var vertex = api.withHtml(this);
                    visitor(vertex);
                });
            };
            this.getParentVertex = function(){
                return api.withHtml(
                    self.getParentVertexHtml().find("> .vertex")
                );
            };
            this.getParentVertexHtml = function(){
                return html.closest(".vertices-children-container")
                    .siblings(".vertex-container");
            };
            this.applyToOtherInstances = function(apply){
                $.each(self.getOtherInstances(), function(){
                    var vertex = this;
                    apply(vertex);
                });
            };
            this.hasOtherInstances = function(){
                return self.getOtherInstances().length > 0;
            };
            this.getOtherInstances = function(){
                var vertex = VertexUi.withHtml(html);
                if(html.data(otherInstancesKey) === undefined){
                    var verticesWithSameUri = VertexUi.withUri(
                        vertex.getUri()
                    );
                    var otherInstances = [];
                    $.each(verticesWithSameUri, function(){
                        var vertexWithSameUri = this;
                        if(vertexWithSameUri.getId() !== vertex.getId()){
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
            this.resetOtherInstances = function(){
                html.removeData(otherInstancesKey)
            };
            this.getChildrenOrientation = function(){
                return self.isToTheLeft() ?
                    "left" :
                    "right"
            };
            this.isALeaf = function(){
                return getChildren().length === 0;
            };
            this.hasTheDuplicateButton = function(){
                return self.getTextContainer().find(
                    "button.duplicate"
                ).length > 0 ;
            };
            VertexUi.Object.apply(this, [html]);
            function getChildren(){
                return html.closest(".vertex-container").siblings(
                    ".vertices-children-container"
                ).find(".vertex");
            }
        }
        Object.prototype = new VertexUi.Object();
        EventBus.subscribe(
            '/event/ui/graph/vertex/same_as/added',
            function(event, vertex, sameAs){
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function(vertex){
                    vertex.addSameAs(sameAs);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/generic_identification/added',
            function(event, vertex, genericIdentification){
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function(vertex){
                    vertex.addGenericIdentification(genericIdentification);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/type/added',
            function(event, vertex, type){
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function(vertex){
                    vertex.addType(type);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/type/removed',
            function(event, vertex, typeToRemove){
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function(vertex){
                    vertex.removeType(typeToRemove);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/generic_identification/removed',
            function(event, vertex, genericIdentification){
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function(vertex){
                    vertex.removeGenericIdentification(genericIdentification);
                });
            }
        );
        EventBus.subscribe(
            '/event/ui/graph/vertex/same_as/removed',
            function(event, vertex, sameAs){
                var treeVertex = api.ofVertex(vertex);
                treeVertex.applyToOtherInstances(function(vertex){
                    vertex.removeSameAs(sameAs);
                });
            }
        );
        EventBus.subscribe(
            "/event/ui/graph/vertex/image/about_to_load",
            function(){
                api.numberImagesToLoad = api.numberImagesToLoad === undefined ?
                    1 :
                    api.numberImagesToLoad++;
            }
        );
        EventBus.subscribe(
            "/event/ui/graph/vertex/image/updated",
            function(event, vertex){
                api.numberImagesToLoad--;
                var relativeVertex = api.ofVertex(vertex);
                api.withHtml(
                    relativeVertex.getParentVertexHtml()
                ).adjustAllChildrenPositionIfApplicable();
                relativeVertex.adjustPositionIfApplicable();
                if(api.numberImagesToLoad === 0){
                    EdgeUi.redrawAllEdges();
                }
            }
        );
        return api;
    }
);
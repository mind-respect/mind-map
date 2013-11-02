/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.ui.vertex_hidden_neighbor_properties_indicator",
    "triple_brain.vertex",
    "triple_brain.id_uri",
    "triple_brain.point",
    "triple_brain.error",
    "triple_brain.ui.vertex_segments",
    "triple_brain.ui.edge",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.event_bus",
    "triple_brain.server_subscriber",
    "triple_brain.image_displayer",
    "triple_brain.ui.graph_element",
    "jquery.center-on-screen"
],
    function ($, GraphDisplayer, PropertiesIndicator, VertexService, IdUriUtils, Point, Error, VertexSegments, EdgeUi, VertexAndEdgeCommon, EventBus, ServerSubscriber, ImageDisplayer, GraphElement) {
        var api = {};
        api.getWhenEmptyLabel = function(){
            return $.t("vertex.default");
        };
        api.withHtml = function (html) {
            return new api.Object(html);
        };
        api.withId = function (id) {
            return getGraphDisplayer().getVertexSelector().withHtml($("#" + id));
        };
        api.withUri = function (uri) {
            var verticesWithUri = [];
            api.visitAllVertices(function (vertex) {
                if (vertex.getUri() === uri) {
                    verticesWithUri.push(
                        vertex
                    );
                }
            });
            return verticesWithUri;
        };
        api.centralVertex = function () {
            return getGraphDisplayer().getVertexSelector().withHtml(
                $('.center-vertex')
            );
        };
        api.visitAllVertices = function (visitor) {
            $(".vertex").each(function () {
                return visitor(
                    getGraphDisplayer().getVertexSelector().withHtml(this)
                );
            });
        };
        api.resetSelection = function(){
            $(".vertex.selected").removeClass(
                "selected"
            );
        };
        api.visitSelected = function(visitor){
            $(".vertex.selected").each(function () {
                return visitor(
                    getGraphDisplayer().getVertexSelector().withHtml(this)
                );
            });
        };
        api.getVertexMouseOver = function () {
            return $("body").data("vertex_mouse_over");
        };
        api.setVertexMouseOver = function (vertex) {
            $("body").data("vertex_mouse_over", vertex);
        };
        api.unsetVertexMouseOver = function(){
            $("body").removeData("vertex_mouse_over");
        };
        api.Object = function (html) {
            var self = this;
            html = $(html);
            this._initialize = function () {
            };
            GraphElement.Object.apply(self, [html]);

            this.getGraphElementType = function(){
                return GraphElement.types.CONCEPT;
            };

            this.position = function () {
                return Point.fromCoordinates(
                    html.offset().left,
                    html.offset().top
                );
            };
            this.intersectsWithSegment = function (segment) {
                return getSegments().intersectsWithSegment(
                    segment
                );
            };
            this.closestPointToSegment = function (segment) {
                return getSegments().closestPointToSegment(
                    segment
                );
            };
            this.intersectionPointWithSegment = function (segmentToCompare) {
                if (!self.intersectsWithSegment(segmentToCompare)) {
                    throw(
                        Error.withName(
                            "no_intersection"
                        )
                        );
                }
                return getSegments().intersectionPointWithSegment(segmentToCompare);
            };
            this.sideClosestToEdge = function () {
                return getSegments().sideThatIntersectsWithAnotherSegmentUsingMarginOfError(10);
            };
            this.setAsNonCentral = function () {
                $(html).removeClass('center-vertex');
                this.showCenterButton();
            };
            this.setAsCentral = function () {
                var centralVertex = api.centralVertex();
                centralVertex.setAsNonCentral();
                $(html).addClass('center-vertex');
                self.hideCenterButton();
            };
            this.setTotalNumberOfEdges = function (totalNumberOfEdges) {
                html.data(
                    "totalNumberOfEdges",
                    totalNumberOfEdges
                );
            };
            this.getTotalNumberOfEdges = function () {
                return html.data(
                    "totalNumberOfEdges"
                );
            };
            this.buildHiddenNeighborPropertiesIndicator = function () {
                var propertiesIndicator = PropertiesIndicator.withVertex(
                    self
                );
                $(html).data(
                    "hidden_properties_indicator",
                    propertiesIndicator
                );
                propertiesIndicator.build();
            };
            this.removeHiddenPropertiesIndicator = function () {
                var propertiesIndicator = $(html).data(
                    "hidden_properties_indicator"
                );
                propertiesIndicator.remove();
                $(html).removeData(
                    "hidden_properties_indicator"
                );
            };
            this.hasHiddenRelations = function () {
                return self.isALeaf() && self.getTotalNumberOfEdges() > 1;
            };
            this.hasHiddenRelationsContainer = function () {
                return undefined !== self.getHiddenRelationsContainer();
            };
            this.getHiddenRelationsContainer = function(){
                return html.data(
                    "hidden_properties_indicator"
                );
            };
            this.width = function () {
                return $(html).width();
            };
            this.height = function () {
                return $(html).height();
            };
            this.getHtml = function () {
                return html;
            };
            this.labelCenterPoint = function () {
                var textContainer = self.getTextContainer();
                return Point.fromCoordinates(
                    $(textContainer).offset().left + self.textContainerWidth() / 2,
                    $(textContainer).offset().top + $(textContainer).height() / 2
                )
            };

            this.getId = function () {
                return $(html).attr('id');
            };

            this.getUri = function () {
                return $(html).data(
                    "uri"
                );
            };

            this.setUri = function (uri) {
                $(html).data(
                    "uri",
                    uri
                );
            };

            this.isMouseOver = function () {
                var vertexThatIsMouseOver = api.getVertexMouseOver();
                return  vertexThatIsMouseOver !== undefined &&
                    vertexThatIsMouseOver.equalsVertex(self);
            };
            this.makeItLowProfile = function () {
                if (!self.isLabelInFocus()) {
                    self.unhighlight();
                }
                self.hideButtons();
            };
            this.makeItHighProfile = function () {
                self.highlight();
                self.showButtons();
            };
            this.hideButtons = function () {
                self.hideMenu();
                self.hideMoveButton();
            };
            this.showButtons = function () {
                self.showMenu();
                self.showMoveButton();
            };
            this.hideMenu = function () {
                $(menu()).css("visibility", "hidden");
            };
            this.showMenu = function () {
                $(menu()).css("visibility", "visible");
            };
            this.hideMoveButton = function () {
                self.moveButton().css("visibility", "hidden");
            };
            this.showMoveButton = function () {
                self.moveButton().css("visibility", "visible");
            };
            this.showCenterButton = function () {
                $(centerButton()).hide();
            };
            this.hideCenterButton = function () {
                $(centerButton()).hide();
            };
            this.highlight = function () {
                $(html).addClass(
                    'highlighted'
                );
            };
            this.unhighlight = function () {
                $(html).removeClass(
                    'highlighted'
                );
            };
            this.connectedEdges = function () {
                return EdgeUi.connectedToVertex(
                    self
                );
            };
            this.redrawConnectedEdgesArrowLine = function () {
                $.each(self.connectedEdges(), function () {
                    var edge = this;
                    edge.arrowLine().remove();
                    edge.setArrowLine(
                        getGraphDisplayer().getEdgeDrawer().ofEdge(
                            edge
                        )
                    );
                    edge.centerOnArrowLine();
                    edge.arrowLine().drawInWithDefaultStyle();
                });
            };
            this.isLabelInFocus = function () {
                return $(self.label()).is(":focus");
            };
            this.focus = function () {
                $(self.label()).focus();
            };
            this.readjustLabelWidth = function () {
                VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                    this.label()
                );
                self.adjustWidth();
            };
            this.text = function () {
                return $(this.label()).val();
            };
            this.setText = function (label) {
                return $(self.label()).val(
                    label
                );
            };
            this.setNote = function(note){
                html.data("note", note);
            };
            this.getNote = function(){
                return html.data("note");
            };
            this.getTextContainer = function () {
                return $(this.label()).closest(".textfield-container");
            };
            this.textContainerWidth = function () {
                var width = 0;
                $.each(self.getTextContainer().children(), function () {
                    var child = this;
                    width += $(child).width();
                });
                return width;
            };
            this.hasDefaultText = function () {
                return $(this.label()).val() == api.getWhenEmptyLabel();
            };
            this.applyStyleOfDefaultText = function () {
                $(this.label()).addClass('when-default-graph-element-text');
            };
            this.removeStyleOfDefaultText = function () {
                $(this.label()).removeClass('when-default-graph-element-text');
            };
            this.isCenterVertex = function () {
                return $(html).hasClass("center-vertex");
            };
            this.removeConnectedEdges = function () {
                var connectedEdges = this.connectedEdges();
                for (var i = 0; i < connectedEdges.length; i++) {
                    connectedEdges[i].remove();
                }
                EdgeUi.drawAllEdges();
            };
            this.remove = function () {
                if(self.hasHiddenRelationsContainer()){
                    self.getHiddenRelationsContainer().remove();
                }
                html.remove();
            };
            this.suggestions = function () {
                return $(html).data('suggestions');
            };
            this.addSuggestions = function (suggestions) {
                var existingSuggestions = $(html).data('suggestions');
                existingSuggestions = existingSuggestions === undefined ?
                    [] :
                    existingSuggestions;
                var mergedSuggestions = existingSuggestions.concat(suggestions);
                $(html).data('suggestions', mergedSuggestions);
                mergedSuggestions.length > 0 ?
                    self.showSuggestionButton() :
                    self.hideSuggestionButton();
            };
            this.setSuggestions = function (suggestions) {
                $(html).data('suggestions', suggestions);
                suggestions.length > 0 ?
                    self.showSuggestionButton() :
                    self.hideSuggestionButton();
            };

            this.applyCommonBehaviorForAddedIdentification = function(externalResource) {
                self.addImages(
                    externalResource.images()
                );
            };

            this.addImages = function (images) {
                var existingImages = self.getImages();
                $(html).data("images", existingImages.concat(
                    images
                ));
                var imageMenu =
                    self.hasImagesMenu() ?
                        self.getImageMenu() :
                        createImageMenu();
                imageMenu.refreshImages();
            };
            this.removeImage = function (imageToRemove) {
                var images = [];
                $.each(self.getImages(), function () {
                    var image = this;
                    if (image.getUrlForSmall() !== imageToRemove.getUrlForSmall()) {
                        images.push(image);
                    }
                });
                $(html).data(
                    "images",
                    images
                );
            };
            this.getImages = function () {
                return $(html).data("images") === undefined ?
                    [] :
                    $(html).data("images");
            };

            this.serverFacade = function(){
                return VertexService;
            };

            function createImageMenu() {
                var imageMenu = ImageDisplayer.ofVertex(self).create();
                $(html).data("images_menu", imageMenu);
                return imageMenu;
            }

            this.hasImagesMenu = function () {
                return $(html).data("images_menu") !== undefined;
            };

            this.hasImages = function () {
                return self.getImages().length > 0;
            };

            this.getImageMenu = function () {
                return html.data("images_menu");
            };

            this.removeIdentificationCommonBehavior = function(externalResource) {
                $.each(externalResource.images(), function () {
                    var image = this;
                    self.removeImage(image);
                });
                self.getImageMenu().refreshImages();
                VertexService.getSuggestions(
                    self
                );
            };

            this.showSuggestionButton = function () {
                $(suggestionButton()).show();
            };
            this.hideSuggestionButton = function () {
                $(suggestionButton()).hide();
            };
            this.triggerChange = function () {
                $(html).trigger("change");
            };
            this.label = function () {
                return $(html).find("input.label");
            };
            this.equalsVertex = function (otherVertex) {
                return self.getId() == otherVertex.getId();
            };
            this.scrollTo = function () {
                html.centerOnScreen();
            };
            this.adjustWidth = function () {
                var intuitiveWidthBuffer = 70;
                var textContainerWidth = self.textContainerWidth();
                var imageWidth = self.hasImagesMenu() ?
                    self.getImageMenu().width() :
                    0;

                var width =
                    Math.max(
                        menuWidth(),
                        textContainerWidth
                    ) +
                        self.moveButton().width() +
                        imageWidth
                        + intuitiveWidthBuffer;
                $(html).css(
                    "width",
                    width + "px"
                );
                EventBus.publish(
                    "/event/ui/graph/vertex/width-modified",
                    self
                );
            };

            this.setOriginalServerObject = function (serverJson) {
                $(html).data(
                    "originalServerObject",
                    serverJson
                );
            };
            this.getOriginalServerObject = function () {
                return $(html).data(
                    "originalServerObject"
                );
            };

            this.hasMoveButton = function () {
                return self.moveButton().length > 0;
            };

            this.moveButton = function () {
                return $(html).find('.move');
            };

            this.serverFormat = function () {
                return {
                    label:self.text(),
                    suggestions:self.suggestions(),
                    types:getCollectionAsServerFormat(self.getTypes()),
                    same_as:getCollectionAsServerFormat(self.getSameAs())
                };
                function getCollectionAsServerFormat(collection) {
                    var serverFormat = [];
                    $.each(collection, function () {
                        var item = this;
                        serverFormat.push(
                            item.jsonFormat()
                        );
                    });
                    return serverFormat;
                }
            };
            this.makePrivate = function(){
                html.removeClass("public");
                setIsPublic(false);
            };
            this.makePublic = function(){
                html.addClass("public");
                setIsPublic(true);
            };
            this.isPublic = function(){
                return html.data("isPublic");
            };
            this.select = function(){
                html.addClass("selected");
            };
            this.setIncludedVertices = function(includedVertices){
                html.data(
                    "includedVertices",
                    includedVertices
                );
            };
            this.getIncludedVertices = function(){
                return html.data("includedVertices");
            };

            this.isAbsoluteDefaultVertex = function(){
                return self.getUri().indexOf("default") !== -1;
            };

            function setIsPublic(isPublic){
                html.data(
                    "isPublic",
                    isPublic
                );
            }

            function suggestionButton() {
                return $(html).find('.suggestion');
            }

            function menu() {
                return $(html).find('.menu');
            }

            function menuWidth() {
                return $(menu()).find("ul").width() * 4;
            }

            function centerButton() {
                return $(html).find('.center');
            }

            function getSegments() {
                return VertexSegments.withHtmlVertex(
                    self.getTextContainer()
                );
            }

            crow.ConnectedNode.apply(this, [self.getUri()]);
        }

        api.Object.prototype = new crow.ConnectedNode();

        EventBus.subscribe(
            '/event/ui/graph/vertex/label/updated',
            function (event, vertex) {
                VertexAndEdgeCommon.highlightLabel(
                    vertex.getId()
                );
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/reset',
            function(){
                api.visitAllVertices(function(vertex){
                    vertex.remove();
                });
            }
        );

        return api;
        function getGraphDisplayer(){
            if(GraphDisplayer === undefined){
                GraphDisplayer = require("triple_brain.graph_displayer");
            }
            return GraphDisplayer;
        }
    }
);

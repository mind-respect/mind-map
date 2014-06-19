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
        "triple_brain.selection_handler",
        "triple_brain.graph_element_button",
        "triple_brain.ui.graph",
        "jquery.center-on-screen"
    ],
    function ($, GraphDisplayer, PropertiesIndicator, VertexService, IdUriUtils, Point, Error, VertexSegments, EdgeUi, VertexAndEdgeCommon, EventBus, ServerSubscriber, ImageDisplayer, GraphElement, SelectionHandler, GraphElementButton, GraphUi) {
        var api = {};
        api.getWhenEmptyLabel = function () {
            return $.t("vertex.default");
        };
        api.buildCommonConstructors = function (api) {
            var cacheWithIdAsKey = {},
                cacheWithUriAsKey = {};
            api.withHtml = function (html) {
                var id = html.prop('id');
                var cachedObject = cacheWithIdAsKey[id];
                if (cachedObject === undefined) {
                    cachedObject = new api.Object(html);
                    cacheWithIdAsKey[id] = cachedObject;
                    updateUriCache(
                        html.data("uri"),
                        cachedObject
                    );
                }
                return cachedObject;
            };

            function updateUriCache(uri, vertex) {
                if (undefined === cacheWithUriAsKey[uri]) {
                    cacheWithUriAsKey[uri] = [];
                }
                cacheWithUriAsKey[uri].push(vertex);
            }

            api.withId = function (id) {
                return cacheWithIdAsKey[id];
            };
            api.withUri = function (uri) {
                return cacheWithUriAsKey[uri];
            };
            EventBus.subscribe('/event/ui/graph/reset', emptyCache);
            function emptyCache() {
                cacheWithIdAsKey = {};
                cacheWithUriAsKey = {};
            }
        };
        api.centralVertex = function () {
            return GraphDisplayer.getVertexSelector().withHtml(
                $('.center-vertex')
            );
        };
        api.visitAllVertices = function (visitor) {
            GraphUi.getDrawnGraph().find(".vertex").each(function () {
                return visitor(
                    GraphDisplayer.getVertexSelector().withHtml(
                        $(this)
                    )
                );
            });
        };
        api.getVertexMouseOver = function () {
            return $("body").data("vertex_mouse_over");
        };
        api.setVertexMouseOver = function (vertex) {
            $("body").data("vertex_mouse_over", vertex);
        };
        api.unsetVertexMouseOver = function () {
            $("body").removeData("vertex_mouse_over");
        };
        api.Object = function (html) {
            var self = this;
            this._initialize = function () {
            };
            GraphElement.Object.apply(self, [html]);
            this.getGraphElementType = function () {
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
            this.setAsNonCentral = function () {
                html.removeClass('center-vertex');
                this.showCenterButton();
            };
            this.setAsCentral = function () {
                var centralVertex = api.centralVertex();
                centralVertex.setAsNonCentral();
                html.addClass('center-vertex');
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
                html.data(
                    "hidden_properties_indicator",
                    propertiesIndicator
                );
                propertiesIndicator.build();
            };
            this.hasHiddenRelations = function () {
                return self.isALeaf() && self.getTotalNumberOfEdges() > 1;
            };
            this.hasHiddenRelationsContainer = function () {
                return undefined !== self.getHiddenRelationsContainer();
            };
            this.getHiddenRelationsContainer = function () {
                return html.data(
                    "hidden_properties_indicator"
                );
            };
            this.width = function () {
                return html.width();
            };
            this.height = function () {
                return html.height();
            };
            this.getHtml = function () {
                return html;
            };
            this.getId = function () {
                return html.attr('id');
            };

            this.getUri = function () {
                return html.data(
                    "uri"
                );
            };

            this.setUri = function (uri) {
                html.data(
                    "uri",
                    uri
                );
            };

            this.isMouseOver = function () {
                var vertexThatIsMouseOver = api.getVertexMouseOver();
                return vertexThatIsMouseOver !== undefined &&
                    vertexThatIsMouseOver.equalsVertex(self);
            };
            this.makeItLowProfile = function () {
                if (!self.isLabelInFocus()) {
                    self.unhighlight();
                }
            };
            this.makeItHighProfile = function () {
                self.highlight();
            };
            this.hideButtons = function () {
                self.hideMenu();
            };
            this.showButtons = function () {
                self.showMenu();
            };
            this.hideMenu = function () {
                self.getMenuHtml().hide();
            };
            this.showMenu = function () {
                self.getMenuHtml().show();
            };
            this.showCenterButton = function () {
                centerButton().hide();
            };
            this.hideCenterButton = function () {
                centerButton().hide();
            };
            this.highlight = function () {
                html.addClass(
                    'highlighted'
                );
            };
            this.unhighlight = function () {
                html.removeClass(
                    'highlighted'
                );
            };
            this.connectedEdges = function () {
                return EdgeUi.connectedToVertex(
                    self
                );
            };
            this.isLabelInFocus = function () {
                return self.getLabel().is(":focus");
            };
            this.focus = function () {
                self.getLabel().focus();
            };
            this.readjustLabelWidth = function () {
                VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                    self.getLabel()
                );
            };
            this.text = function () {
                return self.getLabel().val();
            };
            this.setText = function (label) {
                return self.getLabel().val(
                    label
                );
            };
            this.setNote = function (note) {
                html.data("note", note);
            };
            this.getNote = function () {
                return html.data("note");
            };
            this.hasNote = function () {
                return self.getNote().trim().length > 0;
            };
            this.getNoteButtonInBubbleContent = function () {
                return self.getInBubbleContainer().find(
                    ".note-button"
                );
            };
            this.getNoteButtonInMenu = function () {
                return self.getMenuHtml().find("> .note-button");
            };
            this.getInBubbleContainer = function () {
                return html.find(
                    "> .in-bubble-content"
                );
            };

            this.getInBubbleContentWidth = function () {
                var width = 0;
                $.each(self.getInBubbleContainer().children(), function () {
                    var child = this;
                    width += $(child).width();
                });
                return width;
            };
            this.hasDefaultText = function () {
                return self.getLabel().val() == api.getWhenEmptyLabel();
            };
            this.applyStyleOfDefaultText = function () {
                self.getLabel().addClass('when-default-graph-element-text');
            };
            this.removeStyleOfDefaultText = function () {
                self.getLabel().removeClass('when-default-graph-element-text');
            };
            this.isCenterVertex = function () {
                return html.hasClass("center-vertex");
            };
            this.removeConnectedEdges = function () {
                var connectedEdges = this.connectedEdges();
                for (var i = 0; i < connectedEdges.length; i++) {
                    connectedEdges[i].remove();
                }
            };
            this.remove = function () {
                SelectionHandler.removeBubble(self);
                if (self.hasHiddenRelationsContainer()) {
                    self.getHiddenRelationsContainer().remove();
                }
                html.closest(".vertex-tree-container").remove();
            };
            this.suggestions = function () {
                return html.data('suggestions');
            };
            this.hasSuggestions = function () {
                return self.suggestions().length > 0;
            };
            this.addSuggestions = function (suggestions) {
                var existingSuggestions = html.data('suggestions');
                existingSuggestions = existingSuggestions === undefined ?
                    [] :
                    existingSuggestions;
                var mergedSuggestions = existingSuggestions.concat(suggestions);
                html.data('suggestions', mergedSuggestions);
                mergedSuggestions.length > 0 ?
                    self.showSuggestionButton() :
                    self.hideSuggestionButton();
            };
            this.setSuggestions = function (suggestions) {
                html.data('suggestions', suggestions);
                suggestions.length > 0 ?
                    self.showSuggestionButton() :
                    self.hideSuggestionButton();
            };

            this.applyCommonBehaviorForAddedIdentification = function (externalResource) {
                self.addImages(
                    externalResource.images()
                );
            };

            this.addImages = function (images) {
                var existingImages = self.getImages();
                html.data("images", existingImages.concat(
                    images
                ));
            };

            this.refreshImages = function () {
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
                    if (image.getBase64ForSmall() !== imageToRemove.getBase64ForSmall()) {
                        images.push(image);
                    }
                });
                html.data(
                    "images",
                    images
                );
            };
            this.getImages = function () {
                return html.data("images") === undefined ?
                    [] :
                    html.data("images");
            };

            this.serverFacade = function () {
                return VertexService;
            };

            function createImageMenu() {
                var imageMenu = ImageDisplayer.ofVertex(self).create();
                html.data("images_menu", imageMenu);
                return imageMenu;
            }
            this.hasImagesMenu = function () {
                return html.data("images_menu") !== undefined;
            };
            this.getImageMenu = function () {
                return html.data("images_menu");
            };
            this.removeIdentificationCommonBehavior = function (externalResource) {
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
                suggestionButton().show();
            };
            this.hideSuggestionButton = function () {
                suggestionButton().hide();
            };
            this.triggerChange = function () {
                html.trigger("change");
            };
            this.getLabel = function () {
                return html.find("input.label");
            };
            this.equalsVertex = function (otherVertex) {
                return self.getId() == otherVertex.getId();
            };
            this.scrollTo = function () {
                html.centerOnScreen();
            };

            this.setOriginalServerObject = function (serverJson) {
                html.data(
                    "originalServerObject",
                    serverJson
                );
            };
            this.getOriginalServerObject = function () {
                return html.data(
                    "originalServerObject"
                );
            };

            this.serverFormat = function () {
                return {
                    label: self.text(),
                    suggestions: self.suggestions(),
                    types: getCollectionAsServerFormat(self.getTypes()),
                    same_as: getCollectionAsServerFormat(self.getSameAs())
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
            this.makePrivate = function () {
                html.removeClass("public");
                setIsPublic(false);
            };
            this.makePublic = function () {
                html.addClass("public");
                setIsPublic(true);
            };
            this.isPublic = function () {
                return html.data("isPublic");
            };
            this.deselect = function () {
                html.removeClass("selected");
                self.hideButtons();
            };
            this.select = function () {
                html.addClass("selected");
            };
            this.makeSingleSelected = function () {
                self.showButtons();
            };
            this.isSelected = function () {
                return html.hasClass("selected");
            };
            this.setIncludedVertices = function (includedVertices) {
                html.data(
                    "includedVertices",
                    includedVertices
                );
            };
            this.hasIncludedGraphElements = function () {
                return Object.keys(self.getIncludedVertices()).length > 0;
            };
            this.getIncludedVertices = function () {
                return html.data("includedVertices");
            };
            this.setIncludedEdges = function (includedEdges) {
                html.data(
                    "includedEdges",
                    includedEdges
                );
            };
            this.getIncludedEdges = function () {
                return html.data("includedEdges");
            };
            this.isAbsoluteDefaultVertex = function () {
                return self.getUri().indexOf("default") !== -1;
            };
            this.getMenuHtml = function () {
                return html.find('> .menu');
            };
            this.visitMenuButtons = function (visitor) {
                $.each(getMenuButtonsHtml(), function () {
                    visitor(
                        GraphElementButton.fromHtml(
                            $(this)
                        )
                    );
                });
            };
            function setIsPublic(isPublic) {
                html.data(
                    "isPublic",
                    isPublic
                );
            }

            function suggestionButton() {
                return html.find('.suggestion');
            }

            function centerButton() {
                return html.find('.center');
            }

            function getSegments() {
                return VertexSegments.withHtmlVertex(
                    self.getInBubbleContainer()
                );
            }

            function getMenuButtonsHtml() {
                return self.getMenuHtml().find(
                    "> button"
                );
            }

            crow.ConnectedNode.apply(this, [self.getId()]);
        };
        api.Object.prototype = new crow.ConnectedNode();

        api.buildCommonConstructors(api);
        return api;
    }
);

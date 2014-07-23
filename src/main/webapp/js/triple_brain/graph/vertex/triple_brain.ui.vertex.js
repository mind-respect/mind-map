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
        "triple_brain.image_displayer",
        "triple_brain.ui.graph_element",
        "triple_brain.selection_handler",
        "triple_brain.graph_element_button",
        "jquery.center-on-screen"
    ],
    function ($, GraphDisplayer, PropertiesIndicator, VertexService, IdUriUtils, Point, Error, VertexSegments, EdgeUi, VertexAndEdgeCommon, EventBus, ImageDisplayer, GraphElement, SelectionHandler, GraphElementButton) {
        var api = {};
        api.getWhenEmptyLabel = function () {
            return $.t("vertex.default");
        };
        api.buildCommonConstructors = function (api) {
            var cacheWithIdAsKey = {},
                cacheWithUriAsKey = {};
            api.initCache = function (vertex) {
                cacheWithIdAsKey[vertex.getId()] = vertex;
                updateUriCache(vertex.getUri(), vertex);
            };
            api.withHtml = function (html) {
                return cacheWithIdAsKey[
                    html.prop('id')
                    ];
            };
            api.withId = function (id) {
                return cacheWithIdAsKey[id];
            };
            api.withUri = function (uri) {
                return cacheWithUriAsKey[uri];
            };
            api.lastAddedWithUri = function (uri) {
                return cacheWithUriAsKey[uri][
                    cacheWithUriAsKey[uri].length - 1
                    ];
            };
            api.visitAllVertices = function (visitor) {
                $.each(cacheWithIdAsKey, function () {
                    return visitor(
                        this
                    );
                });
            };

            EventBus.subscribe('/event/ui/graph/reset', emptyCache);
            function emptyCache() {
                cacheWithIdAsKey = {};
                cacheWithUriAsKey = {};
            }

            api.removeVertexFromCache = function (uri, id) {
                var len = cacheWithUriAsKey[uri].length;
                while (len--) {
                    var vertex = cacheWithUriAsKey[uri][len];
                    if (vertex.getId() === uri) {
                        cacheWithUriAsKey.splice(len, 1);
                    }
                }
                delete cacheWithIdAsKey[id];
            };

            function updateUriCache(uri, vertex) {
                if (undefined === cacheWithUriAsKey[uri]) {
                    cacheWithUriAsKey[uri] = [];
                }
                cacheWithUriAsKey[uri].push(vertex);
            }
        };
        api.centralVertex = function () {
            return GraphDisplayer.getVertexSelector().withHtml(
                $('.center-vertex')
            );
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
            this.html = html;
            this._initialize = function(){};
            GraphElement.Object.apply(this, [html]);
            this.setIsPublic = function (isPublic){
                html.data(
                    "isPublic",
                    isPublic
                );
            };
            this.suggestionButton = function() {
                return html.find('.suggestion');
            };

            this.centerButton = function() {
                return html.find('.center');
            };

            this.getSegments = function(){
                return VertexSegments.withHtmlVertex(
                    this.getInBubbleContainer()
                );
            };
            this.getMenuButtonsHtml = function(){
                return this.getMenuHtml().find(
                    "> button"
                );
            };
            this.createImageMenu = function() {
                var imageMenu = ImageDisplayer.ofVertex(this).create();
                html.data("images_menu", imageMenu);
                return imageMenu;
            };
        };
        api.Object.prototype = new crow.ConnectedNode;
        api.Object.prototype.initCrow = function(){
            crow.ConnectedNode.apply(this, [this.html.attr("id")]);
        };
        api.Object.prototype.getGraphElementType = function () {
            return GraphElement.types.CONCEPT;
        };
        api.Object.prototype.position = function () {
            return Point.fromCoordinates(
                this.html.offset().left,
                this.html.offset().top
            );
        };
        api.Object.prototype.intersectsWithSegment = function (segment) {
            return this.getSegments().intersectsWithSegment(
                segment
            );
        };
        api.Object.prototype.closestPointToSegment = function (segment) {
            return this.getSegments().closestPointToSegment(
                segment
            );
        };
        api.Object.prototype.intersectionPointWithSegment = function (segmentToCompare) {
            if (!this.intersectsWithSegment(segmentToCompare)) {
                throw(
                    Error.withName(
                        "no_intersection"
                    )
                    );
            }
            return this.getSegments().intersectionPointWithSegment(segmentToCompare);
        };
        api.Object.prototype.setAsNonCentral = function () {
            this.html.removeClass('center-vertex');
            this.showCenterButton();
        };
        api.Object.prototype.setAsCentral = function () {
            var previousCentralVertex = api.centralVertex();
            if (previousCentralVertex !== undefined) {
                previousCentralVertex.setAsNonCentral();
            }
            this.html.addClass('center-vertex');
            this.hideCenterButton();
        };
        api.Object.prototype.setTotalNumberOfEdges = function (totalNumberOfEdges) {
            this.html.data(
                "totalNumberOfEdges",
                totalNumberOfEdges
            );
        };
        api.Object.prototype.getTotalNumberOfEdges = function () {
            return this.html.data(
                "totalNumberOfEdges"
            );
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
        api.Object.prototype.hasHiddenRelationsContainer = function () {
            return undefined !== this.getHiddenRelationsContainer();
        };
        api.Object.prototype.getHiddenRelationsContainer = function () {
            return this.html.data(
                "hidden_properties_indicator"
            );
        };
        api.Object.prototype.width = function () {
            return this.html.width();
        };
        api.Object.prototype.height = function () {
            return this.html.height();
        };
        api.Object.prototype.getHtml = function () {
            return this.html;
        };
        api.Object.prototype.getId = function () {
            return this.html.attr('id');
        };
        api.Object.prototype.getUri = function () {
            return this.html.data(
                "uri"
            );
        };
        api.Object.prototype.setUri = function (uri) {
            this.html.data(
                "uri",
                uri
            );
        };
        api.Object.prototype.isMouseOver = function () {
            var vertexThatIsMouseOver = api.getVertexMouseOver();
            return vertexThatIsMouseOver !== undefined &&
                vertexThatIsMouseOver.equalsVertex(this);
        };
        api.Object.prototype.makeItLowProfile = function () {
            if (!this.isLabelInFocus()) {
                this.unhighlight();
            }
        };
        api.Object.prototype.makeItHighProfile = function () {
            this.highlight();
        };
        api.Object.prototype.hideButtons = function () {
            this.hideMenu();
        };
        api.Object.prototype.showButtons = function () {
            this.showMenu();
        };
        api.Object.prototype.hideMenu = function () {
            this.getMenuHtml().hide();
        };
        api.Object.prototype.showMenu = function () {
            this.getMenuHtml().show();
        };
        api.Object.prototype.showCenterButton = function () {
            this.centerButton().hide();
        };
        api.Object.prototype.hideCenterButton = function () {
            this.centerButton().hide();
        };
        api.Object.prototype.highlight = function () {
            this.html.addClass(
                'highlighted'
            );
        };
        api.Object.prototype.unhighlight = function () {
            this.html.removeClass(
                'highlighted'
            );
        };
        api.Object.prototype.connectedEdges = function () {
            return EdgeUi.connectedToVertex(
                this
            );
        };
        api.Object.prototype.isLabelInFocus = function () {
            return this.getLabel().is(":focus");
        };
        api.Object.prototype.focus = function () {
            this.getLabel().focus();
        };
        api.Object.prototype.readjustLabelWidth = function () {
            VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                this.getLabel()
            );
        };
        api.Object.prototype.text = function () {
            return this.getLabel().val();
        };
        api.Object.prototype.setText = function (label) {
            return this.getLabel().val(
                label
            );
        };
        api.Object.prototype.setNote = function (note) {
            this.html.data("note", note);
        };
        api.Object.prototype.getNote = function () {
            return this.html.data("note");
        };
        api.Object.prototype.hasNote = function () {
            return this.getNote().trim().length > 0;
        };
        api.Object.prototype.getNoteButtonInBubbleContent = function () {
            return this.getInBubbleContainer().find(
                ".note-button"
            );
        };
        api.Object.prototype.getNoteButtonInMenu = function () {
            return this.getMenuHtml().find("> .note-button");
        };
        api.Object.prototype.getInBubbleContainer = function () {
            return this.html.find(
                "> .in-bubble-content"
            );
        };
        api.Object.prototype.hasDefaultText = function () {
            return this.getLabel().val() == api.getWhenEmptyLabel();
        };
        api.Object.prototype.applyStyleOfDefaultText = function () {
            this.getLabel().addClass('when-default-graph-element-text');
        };
        api.Object.prototype.removeStyleOfDefaultText = function () {
            this.getLabel().removeClass('when-default-graph-element-text');
        };
        api.Object.prototype.isCenterVertex = function () {
            return this.html.hasClass("center-vertex");
        };
        api.Object.prototype.removeConnectedEdges = function () {
            var connectedEdges = this.connectedEdges();
            for (var i = 0; i < connectedEdges.length; i++) {
                connectedEdges[i].remove();
            }
        };
        api.Object.prototype.remove = function () {
            SelectionHandler.removeBubble(this);
            if (this.hasHiddenRelationsContainer()) {
                this.getHiddenRelationsContainer().remove();
            }
            if (this.isCenterVertex()) {
                this.html.closest(".vertex-container").remove();
            } else {
                this.html.closest(".vertex-tree-container").remove();
            }

        };
        api.Object.prototype.suggestions = function () {
            return this.html.data('suggestions');
        };
        api.Object.prototype.hasSuggestions = function () {
            return this.suggestions().length > 0;
        };
        api.Object.prototype.addSuggestions = function (suggestions) {
            var existingSuggestions = this.html.data('suggestions');
            existingSuggestions = existingSuggestions === undefined ?
                [] :
                existingSuggestions;
            var mergedSuggestions = existingSuggestions.concat(suggestions);
            this.html.data('suggestions', mergedSuggestions);
            mergedSuggestions.length > 0 ?
                this.showSuggestionButton() :
                this.hideSuggestionButton();
        };
        api.Object.prototype.setSuggestions = function (suggestions) {
            this.html.data('suggestions', suggestions);
            suggestions.length > 0 ?
                this.showSuggestionButton() :
                this.hideSuggestionButton();
        };

        api.Object.prototype.applyCommonBehaviorForAddedIdentification = function (identification) {
            this.addImages(
                identification.getImages()
            );
        };

        api.Object.prototype.addImages = function (images) {
            var existingImages = this.getImages();
            this.html.data(
                "images",
                existingImages.concat(
                    images
                )
            );
        };

        api.Object.prototype.refreshImages = function () {
            var imageMenu =
                this.hasImagesMenu() ?
                    this.getImageMenu() :
                    this.createImageMenu();
            imageMenu.refreshImages();
        };

        api.Object.prototype.removeImage = function (imageToRemove) {
            var images = [];
            $.each(this.getImages(), function () {
                var image = this;
                if (image.getBase64ForSmall() !== imageToRemove.getBase64ForSmall()) {
                    images.push(image);
                }
            });
            this.html.data(
                "images",
                images
            );
        };
        api.Object.prototype.getImages = function () {
            return this.html.data("images") === undefined ?
                [] :
                this.html.data("images");
        };

        api.Object.prototype.serverFacade = function () {
            return VertexService;
        };

        api.Object.prototype.hasImagesMenu = function () {
            return this.html.data("images_menu") !== undefined;
        };
        api.Object.prototype.getImageMenu = function () {
            return this.html.data("images_menu");
        };
        api.Object.prototype.removeIdentificationCommonBehavior = function (identification) {
            var self = this;
            $.each(identification.getImages(), function () {
                var image = this;
                self.removeImage(image);
            });
            self.getImageMenu().refreshImages();
            VertexService.getSuggestions(
                self
            );
        };

        api.Object.prototype.showSuggestionButton = function () {
            this.suggestionButton().show();
        };
        api.Object.prototype.hideSuggestionButton = function () {
            this.suggestionButton().hide();
        };
        api.Object.prototype.triggerChange = function () {
            this.html.trigger("change");
        };
        api.Object.prototype.getLabel = function () {
            return this.html.find("input.label");
        };
        api.Object.prototype.equalsVertex = function (otherVertex) {
            return this.getId() == otherVertex.getId();
        };
        api.Object.prototype.scrollTo = function () {
            this.html.centerOnScreen();
        };

        api.Object.prototype.setOriginalServerObject = function (serverJson) {
            this.html.data(
                "originalServerObject",
                serverJson
            );
        };
        api.Object.prototype.getOriginalServerObject = function () {
            return this.html.data(
                "originalServerObject"
            );
        };

        api.Object.prototype.serverFormat = function () {
            return {
                label: this.text(),
                suggestions: this.suggestions(),
                types: getCollectionAsServerFormat(this.getTypes()),
                same_as: getCollectionAsServerFormat(this.getSameAs())
            };
            function getCollectionAsServerFormat(collection) {
                var serverFormat = [];
                $.each(collection, function () {
                    var item = this;
                    serverFormat.push(
                        item.getJsonFormat()
                    );
                });
                return serverFormat;
            }
        };
        api.Object.prototype.makePrivate = function () {
            this.html.removeClass("public");
            this.setIsPublic(false);
        };
        api.Object.prototype.makePublic = function () {
            this.html.addClass("public");
            this.setIsPublic(true);
        };
        api.Object.prototype.isPublic = function () {
            return this.html.data("isPublic");
        };
        api.Object.prototype.deselect = function () {
            this.html.removeClass("selected");
            this.hideButtons();
        };
        api.Object.prototype.select = function () {
            this.html.addClass("selected");
        };
        api.Object.prototype.makeSingleSelected = function () {
            this.showButtons();
        };
        api.Object.prototype.isSelected = function () {
            return this.html.hasClass("selected");
        };
        api.Object.prototype.setIncludedVertices = function (includedVertices) {
            this.html.data(
                "includedVertices",
                includedVertices
            );
        };
        api.Object.prototype.hasIncludedGraphElements = function () {
            return Object.keys(this.getIncludedVertices()).length > 0;
        };
        api.Object.prototype.getIncludedVertices = function () {
            return this.html.data("includedVertices");
        };
        api.Object.prototype.setIncludedEdges = function (includedEdges) {
            this.html.data(
                "includedEdges",
                includedEdges
            );
        };
        api.Object.prototype.getIncludedEdges = function () {
            return this.html.data("includedEdges");
        };
        api.Object.prototype.isAbsoluteDefaultVertex = function () {
            return this.getUri().indexOf("default") !== -1;
        };
        api.Object.prototype.getMenuHtml = function () {
            return this.html.find('> .menu');
        };
        api.Object.prototype.visitMenuButtons = function (visitor) {
            $.each(this.getMenuButtonsHtml(), function () {
                visitor(
                    GraphElementButton.fromHtml(
                        $(this)
                    )
                );
            });
        };
        api.buildCommonConstructors(api);
        return api;
    }
);

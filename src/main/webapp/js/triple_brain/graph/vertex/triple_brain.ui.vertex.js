/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex_hidden_neighbor_properties_indicator",
    "triple_brain.vertex",
    "triple_brain.id_uri",
    "triple_brain.point",
    "triple_brain.error",
    "triple_brain.ui.vertex_segments",
    "triple_brain.ui.edge",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.event_bus",
    "triple_brain.ui.graph",
    "triple_brain.ui.arrow_line",
    "triple_brain.server_subscriber",
    "triple_brain.ui.image_menu",
    "triple_brain.freebase"
],
    function ($, PropertiesIndicator, VertexService, IdUriUtils, Point, Error, VertexSegments, EdgeUi, VertexAndEdgeCommon, EventBus, GraphUi, ArrowLine, ServerSubscriber, ImageMenu, Freebase) {
        var api = {};

        api.EMPTY_LABEL = "concept";

        api.withHtml = function (html) {
            return new api.Object(html);
        };
        api.withId = function (id) {
            return api.withHtml($("#" + id));
        };
        api.withUri = function (uri) {
            var verticesWithUri = [];
            api.visitAllVertices(function(vertex){
                if(vertex.getUri() === uri){
                    verticesWithUri.push(
                        vertex
                    );
                }
            });
            return verticesWithUri;
        };
        api.centralVertex = function () {
            return api.withHtml(
                $('.center-vertex')
            );
        };
        api.visitAllVertices = function(visitor){
            $(".vertex").each(function () {
                 return visitor(
                    api.withHtml(this)
                );
            });
        };
        api.Object = function(html){
            var self = this;
            this._initialize = function () {
            };
            this.position = function () {
                return Point.fromCoordinates(
                    $(html).offset().left,
                    $(html).offset().top
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
            this.setNameOfHiddenProperties = function (nameOfHiddenProperties) {
                $(html).data('nameOfHiddenProperties', nameOfHiddenProperties);
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
            this.removeHiddenPropertiesIndicator = function(){
                var propertiesIndicator = $(html).data(
                    "hidden_properties_indicator"
                );
                propertiesIndicator.remove();
                $(html).removeData(
                    "hidden_properties_indicator"
                    );
            };
            this.hasHiddenProperties = function(){
                return self.numberOfHiddenConnectedVertices() > 0;
            };
            this.numberOfHiddenConnectedVertices = function () {
                return self.nameOfHiddenProperties().length;
            };
            this.nameOfHiddenProperties = function () {
                return $(html).data('nameOfHiddenProperties');
            };
            this.width = function () {
                return $(html).width();
            };
            this.height = function () {
                return $(html).height();
            };
            this.getHtml = function(){
                return html;
            };
            this.labelCenterPoint = function () {
                var textContainer = self.textContainer();
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
                var vertexThatIsMouseOver = GraphUi.getVertexMouseOver();
                return  vertexThatIsMouseOver !== undefined &&
                    vertexThatIsMouseOver.equalsVertex(self);
            };
            this.makeItLowProfile = function(){
                if (!self.isLabelInFocus()) {
                    self.unhighlight();
                }
                self.hideButtons();
            };
            this.makeItHighProfile = function(){
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
            this.redrawConnectedEdgesArrowLine = function(){
                $.each(self.connectedEdges(), function(){
                    var edge = this;
                    edge.arrowLine().remove();
                    edge.setArrowLine(
                        ArrowLine.ofSourceAndDestinationVertex(
                            edge.sourceVertex(),
                            edge.destinationVertex()
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
            this.textContainer = function(){
                return $(this.label()).closest(".textfield-container");
            };
            this.textContainerWidth = function(){
                var width = 0;
                $.each(self.textContainer().children(), function(){
                    var child = this;
                    width += $(child).width();
                });
                return width;
            };
            this.hasDefaultText = function () {
                return $(this.label()).val() == api.EMPTY_LABEL;
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
                $(html).remove();
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
            this.removeType = function (type) {
                var types = self.removeIdenficationInArray(
                    type,
                    self.getTypes()
                );
                $(self).data("types", types);
                removeIdentificationCommonBehavior(type);
                VertexService.getSuggestions(
                    self
                );
            };

            this.removeIdenficationInArray = function (identificationToRemove, array) {
                var i = 0;
                $.each(array, function () {
                    var identification = this;
                    if (identification.uri() === identificationToRemove.uri()) {
                        array.splice(i, 1);
                        return false;
                    }
                    i++;
                });
                return array;
            };

            this.getTypes = function () {
                return $(html).data('types');
            };
            this.getIdentifications = function(){
                return self.getTypes().concat(
                    self.getSameAs()
                );
            };
            this.setTypes = function (types) {
                return $(html).data('types', types);
            };
            this.addType = function (type) {
                type.setType("type");
                var types = self.getTypes();
                types.push(type);
                self.setTypes(types);
                applyCommonBehaviorForAddedIdentification(type);
            };
            this.addSameAs = function (sameAs) {
                sameAs.setType("same_as");
                var sameAsCollection = self.getSameAs()
                sameAsCollection.push(sameAs);
                self.setSameAs(sameAsCollection);
                applyCommonBehaviorForAddedIdentification(sameAs);
            };
            function applyCommonBehaviorForAddedIdentification(externalResource){
                self.addImages(
                    externalResource.images()
                );
            }
            this.addImages = function(images){
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
            this.removeImage = function(imageToRemove){
                var images = [];
                $.each(self.getImages(), function(){
                    var image = this;
                    if(image.getUrlForSmall() !== imageToRemove.getUrlForSmall()){
                        images.push(image);
                    }
                });
                $(html).data(
                    "images",
                    images
                );
            };
            this.getImages = function(){
                return $(html).data("images") === undefined ?
                    [] :
                    $(html).data("images");
            };

            function createImageMenu(){
                var imageMenu = ImageMenu.ofVertex(self).create();
                $(html).data("images_menu", imageMenu);
                return imageMenu;
            }

            this.hasImagesMenu = function(){
                return $(html).data("images_menu") !== undefined;
            };

            this.hasImages = function(){
                return self.getImages().length > 0;
            };

            this.getImageMenu = function(){
                return $(html).data("images_menu");
            };

            this.setSameAs = function (sameAsCollection) {
                $(html).data('sameAs', sameAsCollection);
            };
            this.removeSameAs = function (sameAsToRemove) {
                var sameAs = self.removeIdenficationInArray(
                    sameAsToRemove,
                    self.getSameAs()
                );
                $(self).data("sameAs", sameAs);
                removeIdentificationCommonBehavior(sameAsToRemove);
                VertexService.getSuggestions(
                    self
                );
            };
            function removeIdentificationCommonBehavior(externalResource){
                $.each(externalResource.images(), function(){
                    var image = this;
                    self.removeImage(image);
                });
                self.getImageMenu().refreshImages();
            }
            this.getSameAs = function () {
                return $(html).data('sameAs');
            };
            this.showSuggestionButton = function () {
                $(suggestionButton()).show();
            };
            this.hideSuggestionButton = function () {
                $(suggestionButton()).hide();
            };
            this.triggerChange = function(){
                $(html).trigger("change");
            }
            this.label = function () {
                return $(html).find("input.label");
            };
            this.equalsVertex = function (otherVertex) {
                return self.getId() == otherVertex.getId();
            };
            this.scrollTo = function () {
                var position = self.position();
                window.scroll(
                    position.x - screen.width / 2,
                    position.y - screen.height / 4
                );
            };
            this.adjustWidth = function () {
                var intuitiveWidthBuffer = 70;
                var textContainerWidth = self.textContainerWidth();
                var imageWidth = self.hasImagesMenu() ?
                    self.getImageMenu().width():
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
            };
            this.hasIdentificationMenu = function () {
                return self.getIdentificationMenu() != undefined;
            };
            this.hasSuggestionMenu = function () {
                return self.getSuggestionMenu() != undefined;
            };
            this.setIdentificationMenu = function (identificationMenu) {
                $(html).data("identification_menu", identificationMenu);
            };
            this.getIdentificationMenu = function () {
                return $(html).data("identification_menu");
            };
            this.setSuggestionMenu = function (suggestionMenu) {
                $(html).data("suggestion_menu", suggestionMenu);
            };
            this.getSuggestionMenu = function () {
                return $(html).data("suggestion_menu");
            };
            this.setOriginalServerObject = function(serverJson){
                $(html).data(
                    "originalServerObject",
                    serverJson
                );
            };
            this.getOriginalServerObject = function(){
                return $(html).data(
                    "originalServerObject"
                );
            };
            this.prepareAsYouTypeSuggestions = function(){
                var vertexTypes = self.getTypes();
                if(vertexTypes.length == 0){
                    return;
                }
                var filterValue = "(all ";
                $.each(vertexTypes, function(){
                    var identification = this;
                    if(Freebase.isFreebaseUri(identification.uri())){
                        filterValue += "type:" + Freebase.idInFreebaseURI(identification.uri());
                    }
                });
                filterValue += ")";
                $(self.label()).suggest({
                    key:"AIzaSyBHOqdqbswxnNmNb4k59ARSx-RWokLZhPA",
                    filter : filterValue,
                    "zIndex":20,
                    scoring:"schema",
                    lang: "en"
                });
            };
            this.hasMoveButton = function(){
                return self.moveButton().length > 0;
            };

            this.moveButton = function(){
                return $(html).find('.move');
            };

            this.serverFormat = function(){
                return {
                    label : self.text(),
                    suggestions : self.suggestions(),
                    is_frontier_vertex_with_hidden_vertices : self.hasHiddenProperties(),
                    name_of_hidden_properties : self.nameOfHiddenProperties(),
                    types : getCollectionAsServerFormat(self.getTypes()),
                    same_as : getCollectionAsServerFormat(self.getSameAs())
                };
                function getCollectionAsServerFormat(collection){
                    var serverFormat = [];
                    $.each(collection, function(){
                        var item = this;
                        serverFormat.push(
                            item.jsonFormat()
                        );
                    });
                    return serverFormat;
                }
            };

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

            function getSegments(){
                return VertexSegments.withHtmlVertex(
                    self.textContainer()
                );
            }

            crow.ConnectedNode.apply(this, [self.getId()]);
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
        return api;
    }
);

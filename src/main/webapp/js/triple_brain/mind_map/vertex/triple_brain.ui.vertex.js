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

        api.EMPTY_LABEL = "a concept";

        api.withHtml = function (html) {
            return new TripleBrainVertex(html);
        };
        api.withId = function (id) {
            return api.withHtml($("#" + id));
        };
        api.withUri = function (uri) {
            return api.withId(
                IdUriUtils.graphElementIdFromUri(uri)
            );
        };
        api.centralVertex = function () {
            return api.withHtml(
                $('.center-vertex')
            );
        };
        api.visitAllVertices = function(visitor){
            $(".vertex").each(function () {
                visitor(
                    api.withHtml(this)
                );
            });
        };
        api.allVertices = function () {
            var vertices = new Array();
            $(".vertex").each(function () {
                vertices.push(api.withHtml(this));
            });
            return vertices;
        };
        function TripleBrainVertex(html) {
            var thisVertex = this;
            var segments = VertexSegments.withHTMLVertex(html);
            this._initialize = function () {
            };
            this.position = function () {
                return Point.fromCoordinates(
                    $(html).offset().left,
                    $(html).offset().top
                );
            };
            this.intersectsWithSegment = function (segment) {
                return segments.intersectsWithSegment(segment);
            };
            this.intersectionPointWithSegment = function (segmentToCompare) {
                if (!this.intersectsWithSegment(segmentToCompare)) {
                    throw(
                        Error.withName(
                            "no_intersection"
                        )
                        );
                }
                return segments.intersectionPointWithSegment(segmentToCompare);
            };
            this.sideClosestToEdge = function () {
                return segments.sideThatIntersectsWithAnotherSegmentUsingMarginOfError(10);
            };
            this.setAsNonCentral = function () {
                $(html).removeClass('center-vertex');
                this.showCenterButton();
            };
            this.setAsCentral = function () {
                var centralVertex = api.centralVertex();
                centralVertex.setAsNonCentral();
                $(html).addClass('center-vertex');
                thisVertex.hideCenterButton();
                if(thisVertex.hasImages()){
                    thisVertex.getImageMenu().positionNextToVertex();
                }
            };
            this.setNameOfHiddenProperties = function (nameOfHiddenProperties) {
                $(html).data('nameOfHiddenProperties', nameOfHiddenProperties);
            };
            this.buildHiddenNeighborPropertiesIndicator = function () {
                var propertiesIndicator = PropertiesIndicator.withVertex(
                    thisVertex
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
                return thisVertex.numberOfHiddenConnectedVertices() > 0;
            };
            this.numberOfHiddenConnectedVertices = function () {
                return thisVertex.nameOfHiddenProperties().length;
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
            this.centerPoint = function () {
                return Point.fromCoordinates(
                    $(html).offset().left + $(html).width() / 2,
                    $(html).offset().top + $(html).height() / 2
                )
            };

            this.getId = function () {
                return $(html).attr('id');
            };

            this.getUri = function () {
                return IdUriUtils.uriFromGraphElementId(
                    thisVertex.getId()
                );
            };

            this.isMouseOver = function () {
                var vertexThatIsMouseOver = GraphUi.getVertexMouseOver();
                return  vertexThatIsMouseOver !== undefined &&
                    vertexThatIsMouseOver.equalsVertex(thisVertex);
            };
            this.makeItLowProfile = function(){
                if (!thisVertex.isLabelInFocus()) {
                    thisVertex.unhighlight();
                }
                thisVertex.hideButtons();
                if(thisVertex.hasImages()){
                    var positioningFunction = thisVertex.isCenterVertex() ?
                        thisVertex.getImageMenu().positionNextToVertex:
                        thisVertex.getImageMenu().positionNextToText
                    positioningFunction();
                }
            };
            this.makeItHighProfile = function(){
                thisVertex.highlight();
                thisVertex.showButtons();
                if(thisVertex.hasImages()){
                    thisVertex.getImageMenu().positionNextToVertex();
                }
            };
            this.hideButtons = function () {
                thisVertex.hideMenu();
                thisVertex.hideMoveButton();
            };
            this.showButtons = function () {
                thisVertex.showMenu();
                thisVertex.showMoveButton();
            };
            this.hideMenu = function () {
                $(menu()).css("visibility", "hidden");
            };
            this.showMenu = function () {
                $(menu()).css("visibility", "visible");
            };
            this.hideMoveButton = function () {
                $(moveButton()).css("visibility", "hidden");
            };
            this.showMoveButton = function () {
                $(moveButton()).css("visibility", "visible");
            };
            this.showCenterButton = function () {
                $(centerButton()).hide();
            };
            this.hideCenterButton = function () {
                $(centerButton()).hide();
            };
            this.highlight = function () {
                $(html).addClass('highlighted-vertex');
            };
            this.unhighlight = function () {
                $(html).removeClass('highlighted-vertex');
            };
            this.connectedEdges = function () {
                var connectedHTMLEdges = $(".edge[source-vertex-id=" + thisVertex.getId() + "],[destination-vertex-id=" + thisVertex.getId() + "]");
                var connectedEdges = new Array();
                for (var i = 0; i < connectedHTMLEdges.length; i++) {
                    connectedEdges.push(EdgeUi.withHtml(connectedHTMLEdges[i]));
                }
                return connectedEdges;
            };
            this.redrawConnectedEdgesArrowLine = function(){
                $.each(thisVertex.connectedEdges(), function(){
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
                return $(thisVertex.label()).is(":focus");
            };
            this.focus = function () {
                $(thisVertex.label()).focus();
            };
            this.readjustLabelWidth = function () {
                VertexAndEdgeCommon.adjustTextFieldWidthToNumberOfChars(
                    this.label()
                );
                thisVertex.adjustWidth();
            };
            this.text = function () {
                return $(this.label()).val();
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
                    thisVertex.showSuggestionButton() :
                    thisVertex.hideSuggestionButton();
            };
            this.setSuggestions = function (suggestions) {
                $(html).data('suggestions', suggestions);
                suggestions.length > 0 ?
                    thisVertex.showSuggestionButton() :
                    thisVertex.hideSuggestionButton();
            };
            this.removeType = function (type) {
                var types = thisVertex.removeIdenficationInArray(
                    type,
                    thisVertex.getTypes()
                );
                $(thisVertex).data("types", types);
                removeIdentificationCommonBehavior(type);
                VertexService.getSuggestions(
                    thisVertex
                );
            };

            this.removeIdenficationInArray = function (identificationToRemove, array) {
                var i = 0;
                $.each(array, function () {
                    var identification = this;
                    if (identification.uri() == identificationToRemove.uri()) {
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
                return thisVertex.getTypes().concat(
                    thisVertex.getSameAs()
                );
            };
            this.setTypes = function (types) {
                return $(html).data('types', types);
            };
            this.addType = function (type) {
                type.setType("type");
                var types = thisVertex.getTypes();
                types.push(type);
                thisVertex.setTypes(types);
                applyCommonBehaviorForAddedIdentification(type);
            };
            this.addSameAs = function (sameAs) {
                sameAs.setType("same_as");
                var sameAsCollection = thisVertex.getSameAs()
                sameAsCollection.push(sameAs);
                thisVertex.setSameAs(sameAsCollection);
                applyCommonBehaviorForAddedIdentification(sameAs);
            };

            function applyCommonBehaviorForAddedIdentification(externalResource){
                thisVertex.addImages(
                    externalResource.images()
                );
            }
            this.addImages = function(images){
                var existingImages = thisVertex.getImages();
                $(html).data("images", existingImages.concat(
                    images
                ));
                var imageMenu =
                    thisVertex.hasImagesMenu() ?
                        thisVertex.getImageMenu() :
                        createImageMenu();
                imageMenu.refreshImages();
            };

            this.getImages = function(){
                return $(html).data("images") === undefined ?
                    [] :
                    $(html).data("images");
            };

            function createImageMenu(){
                var imageMenu = ImageMenu.ofVertex(thisVertex).create();
                $(html).data("images_menu", imageMenu);
                return imageMenu;
            }

            this.hasImagesMenu = function(){
                return $(html).data("images_menu") !== undefined;
            };

            this.hasImages = function(){
                return thisVertex.getImages().length > 0;
            };

            this.getImageMenu = function(){
                return $(html).data("images_menu");
            };

            this.setSameAs = function (sameAsCollection) {
                $(html).data('sameAs', sameAsCollection);
            };
            this.removeSameAs = function (sameAsToRemove) {
                var sameAs = thisVertex.removeIdenficationInArray(
                    sameAsToRemove,
                    thisVertex.getSameAs()
                );
                $(thisVertex).data("sameAs", sameAs);
                removeIdentificationCommonBehavior(sameAsToRemove);
                VertexService.getSuggestions(
                    thisVertex
                );
            };
            function removeIdentificationCommonBehavior(externalResource){
                //todo should remove vertex related images
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
            this.label = function () {
                return $(html).find(".label");
            };
            this.equalsVertex = function (otherVertex) {
                return thisVertex.getId() == otherVertex.getId();
            };
            this.scrollTo = function () {
                var position = thisVertex.position();
                window.scroll(
                    position.x - screen.width / 2,
                    position.y - screen.height / 4
                );
            };
            this.adjustWidth = function () {
                var intuitiveWidthBuffer = 7;
                $(html).css(
                    "width",
                    menuWidth()
                        + $(this.label()).width()
                        + intuitiveWidthBuffer +
                        "px"
                );
            };
            this.hasIdentificationMenu = function () {
                return thisVertex.getIdentificationMenu() != undefined;
            };
            this.hasSuggestionMenu = function () {
                return thisVertex.getSuggestionMenu() != undefined;
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
            this.prepareAsYouTypeSuggestions = function(){
                var vertexTypes = thisVertex.getTypes();
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
                $(thisVertex.label()).suggest({
                    key:"AIzaSyBHOqdqbswxnNmNb4k59ARSx-RWokLZhPA",
                    filter : filterValue,
                    "zIndex":20,
                    scoring:"schema",
                    lang: "en"
                });
            };

            function suggestionButton() {
                return $(html).find('.suggestion');
            }

            function moveButton() {
                return $(html).find('.move');
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

            crow.ConnectedNode.apply(this, [thisVertex.getId()]);
        }

        TripleBrainVertex.prototype = new crow.ConnectedNode();

        EventBus.subscribe(
            '/event/ui/graph/vertex/label/updated',
            function (event, vertex) {
                VertexAndEdgeCommon.highlightLabel(
                    vertex.getId()
                );
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function (event, vertex) {
                vertex.removeConnectedEdges();
                vertex.remove();
            }
        );

        EventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            function (event, triple) {
                triple.destinationVertex().focus();
            }
        );
        return api;
    }
);

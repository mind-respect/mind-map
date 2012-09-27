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
    "triple_brain.ui.arrow_line"
],
    function ($, PropertiesIndicator, VertexService, IdUriUtils, Point, Error, VertexSegments, Edge, VertexAndEdgeCommon, EventBus, Graph, ArrowLine) {
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
            }
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
            }
            this.setAsNonCentral = function () {
                $(html).removeClass('center-vertex');
                this.showCenterButton();
            }
            this.setAsCentral = function () {
                var centralVertex = api.centralVertex();
                centralVertex.setAsNonCentral()
                $(html).addClass('center-vertex');
                this.hideCenterButton();
            }
            this.setNameOfHiddenProperties = function (nameOfHiddenProperties) {
                $(html).data('nameOfHiddenProperties', nameOfHiddenProperties);
            }
            this.buildHiddenNeighborPropertiesIndicator = function () {
                var propertiesIndicator = PropertiesIndicator.withVertex(
                    thisVertex
                );
                $(html).data(
                    "hidden_properties_indicator",
                    propertiesIndicator
                );
                propertiesIndicator.build();
            }
            this.removeHiddenPropertiesIndicator = function(){
                var propertiesIndicator = $(html).data(
                    "hidden_properties_indicator"
                );
                propertiesIndicator.remove();
                $(html).removeData(
                    "hidden_properties_indicator"
                    );
            }
            this.hasHiddenProperties = function(){
                return thisVertex.numberOfHiddenConnectedVertices() > 0;
            }
            this.numberOfHiddenConnectedVertices = function () {
                return thisVertex.nameOfHiddenProperties().length;
            }
            this.nameOfHiddenProperties = function () {
                return $(html).data('nameOfHiddenProperties');
            }
            this.width = function () {
                return $(html).width();
            }
            this.height = function () {
                return $(html).height();
            }
            this.centerPoint = function () {
                return Point.fromCoordinates(
                    $(html).offset().left + $(html).width() / 2,
                    $(html).offset().top + $(html).height() / 2
                )
            }

            this.getId = function () {
                return $(html).attr('id');
            }
            this.isMouseOver = function () {
                var vertexThatIsMouseOver = Graph.getVertexMouseOver();
                return  vertexThatIsMouseOver !== undefined &&
                    vertexThatIsMouseOver.equalsVertex(thisVertex);
            }
            this.hideButtons = function () {
                thisVertex.hideMenu();
                thisVertex.hideMoveButton();
            }
            this.showButtons = function () {
                thisVertex.showMenu();
                thisVertex.showMoveButton();
            }
            this.hideMenu = function () {
                $(menu()).css("visibility", "hidden");
            }
            this.showMenu = function () {
                $(menu()).css("visibility", "visible");
            }
            this.hideMoveButton = function () {
                $(moveButton()).css("visibility", "hidden");
            }
            this.showMoveButton = function () {
                $(moveButton()).css("visibility", "visible");
            }
            this.showCenterButton = function () {
                $(centerButton()).hide();
            }
            this.hideCenterButton = function () {
                $(centerButton()).hide();
            }
            this.highlight = function () {
                $(html).addClass('highlighted-vertex');
            }
            this.unhighlight = function () {
                $(html).removeClass('highlighted-vertex');
            }
            this.connectedEdges = function () {
                var connectedHTMLEdges = $(".edge[source-vertex-id=" + thisVertex.getId() + "],[destination-vertex-id=" + thisVertex.getId() + "]");
                var connectedEdges = new Array();
                for (var i = 0; i < connectedHTMLEdges.length; i++) {
                    connectedEdges.push(Edge.withHtml(connectedHTMLEdges[i]));
                }
                return connectedEdges;
            }
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
            }
            this.isLabelInFocus = function () {
                return $(this.label()).is(":focus");
            }
            this.focus = function () {
                $(this.label()).focus();
            }
            this.readjustLabelWidth = function () {
                VertexAndEdgeCommon.adjustTextFieldWidthToNumberOfChars(
                    this.label()
                );
                thisVertex.adjustWidth();
            }
            this.text = function () {
                return $(this.label()).val();
            }
            this.hasDefaultText = function () {
                return $(this.label()).val() == api.EMPTY_LABEL;
            }
            this.applyStyleOfDefaultText = function () {
                $(this.label()).addClass('when-default-graph-element-text');
            }
            this.removeStyleOfDefaultText = function () {
                $(this.label()).removeClass('when-default-graph-element-text');
            }
            this.isCenterVertex = function () {
                return $(html).hasClass("center-vertex");
            }
            this.removeConnectedEdges = function () {
                var connectedEdges = this.connectedEdges();
                for (var i = 0; i < connectedEdges.length; i++) {
                    connectedEdges[i].remove();
                }
                Edge.drawAllEdges();
            },
                this.remove = function () {
                    $(html).remove();
                }
            this.suggestions = function () {
                return $(html).data('suggestions');
            }
            this.setSuggestions = function (suggestions) {
                $(html).data('suggestions', suggestions);
                suggestions.length > 0 ?
                    thisVertex.showSuggestionButton() :
                    thisVertex.hideSuggestionButton();
            }
            this.removeType = function (type) {
                var types = thisVertex.removeIdenficationInArray(
                    type,
                    thisVertex.getTypes()
                );
                $(thisVertex).data("types", types);
                VertexService.setSuggestions(
                    thisVertex,
                    []
                );
            }

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
            }

            this.getTypes = function () {
                return $(html).data('types');
            }
            this.setTypes = function (types) {
                return $(html).data('types', types);
            }
            this.addType = function (type) {
                type.setType("type");
                var types = thisVertex.getTypes();
                types.push(type);
                thisVertex.setTypes(types);
            }
            this.addSameAs = function (sameAs) {
                sameAs.setType("same_as");
                var sameAsCollection = thisVertex.getSameAs()
                sameAsCollection.push(sameAs);
                thisVertex.setSameAs(sameAsCollection);
            }
            this.setSameAs = function (sameAsCollection) {
                $(html).data('sameAs', sameAsCollection);
            }
            this.removeSameAs = function (sameAsToRemove) {
                var sameAs = thisVertex.removeIdenficationInArray(
                    sameAsToRemove,
                    thisVertex.getTypes()
                );
                $(thisVertex).data("sameAs", sameAs);
                VertexService.setSuggestions(
                    thisVertex,
                    []
                );
            }
            this.getSameAs = function () {
                return $(html).data('sameAs');
            }
            this.showSuggestionButton = function () {
                $(suggestionButton()).show();
            }
            this.hideSuggestionButton = function () {
                $(suggestionButton()).hide();
            }
            this.label = function () {
                return $(html).find(".label");
            }
            this.equalsVertex = function (otherVertex) {
                return thisVertex.getId() == otherVertex.getId();
            }

            this.scrollTo = function () {
                var position = thisVertex.position();
                window.scroll(
                    position.x - screen.width / 2,
                    position.y - screen.height / 4
                );
            }
            this.adjustWidth = function () {
                var intuitiveWidthBuffer = 7;
                $(html).css(
                    "width",
                    menuWidth()
                        + $(this.label()).width()
                        + intuitiveWidthBuffer +
                        "px"
                );
            }
            this.hasIdentificationMenu = function () {
                return thisVertex.getIdentificationMenu() != undefined;
            }
            this.hasSuggestionMenu = function () {
                return thisVertex.getSuggestionMenu() != undefined;
            }
            this.setIdentificationMenu = function (identificationMenu) {
                $(html).data("identification_menu", identificationMenu);
            }
            this.getIdentificationMenu = function () {
                return $(html).data("identification_menu");
            }
            this.setSuggestionMenu = function (suggestionMenu) {
                $(html).data("suggestion_menu", suggestionMenu);
            }
            this.getSuggestionMenu = function () {
                return $(html).data("suggestion_menu");
            }
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

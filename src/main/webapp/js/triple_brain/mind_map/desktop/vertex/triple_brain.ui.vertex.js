/**
 * Copyright Mozilla Public License 1.1
 */
if (triple_brain.ui.vertex == undefined) {
    (function ($) {
        var propertiesIndicatorStatic = triple_brain.ui.vertex_hidden_neighbor_properties_indicator;
        var vertexStatic = triple_brain.ui.vertex = {};
        var vertexService = triple_brain.vertex;

        vertexStatic.EMPTY_LABEL = "a concept";

        vertexStatic.withHtml = function (html) {
            return new Vertex(html);
        };
        vertexStatic.withId = function (id) {
            return vertexStatic.withHtml($("#" + id));
        };
        vertexStatic.withUri = function (uri) {
            return vertexStatic.withId(
                triple_brain.id_uri.graphElementIdFromUri(uri)
            );
        };
        vertexStatic.centralVertex = function () {
            return vertexStatic.withHtml(
                $('.center-vertex')
            );
        };
        vertexStatic.allVertices = function () {
            var vertices = new Array();
            $(".vertex").each(function () {
                vertices.push(vertexStatic.withHtml(this));
            });
            return vertices;
        };
        vertexStatic.redrawAllPropertiesIndicator = function () {
            $.each(vertexStatic.allVertices(), function () {
                var vertex = this;
                vertex.buildHiddenNeighborPropertiesIndicator();
            })
        }

        function Vertex(html) {
            var thisVertex = this;
            var segments = triple_brain.ui.vertex_segments.withHTMLVertex(html);
            this._initialize = function () {
            };
            this.position = function () {
                return triple_brain.point.fromCoordinates(
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
                        triple_brain.error.withName(
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
                var centralVertex = triple_brain.ui.vertex.centralVertex();
                centralVertex.setAsNonCentral()
                $(html).addClass('center-vertex');
                this.hideCenterButton();
            }
            this.setNumberOfHiddenConnectedVertices = function (numberOfHiddenConnectedVertices) {
                $(html).data('numberOfHiddenConnectedVertices', numberOfHiddenConnectedVertices);
            }
            this.setNameOfHiddenProperties = function (nameOfHiddenProperties) {
                $(html).data('nameOfHiddenProperties', nameOfHiddenProperties);
            }
            this.buildHiddenNeighborPropertiesIndicator = function () {
                var propertiesIndicator = propertiesIndicatorStatic.withVertex(this);
                propertiesIndicator.build();
            }
            this.numberOfHiddenConnectedVertices = function () {
                return $(html).data('numberOfHiddenConnectedVertices');
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
                return triple_brain.point.fromCoordinates(
                    $(html).offset().left + $(html).width() / 2,
                    $(html).offset().top + $(html).height() / 2
                )
            }

            this.getId = function () {
                return $(html).attr('id');
            }
            this.isMouseOver = function () {
                return $("#" + this.getId() + ":hover").size() > 0;
            }
            this.hideMenu = function () {
                $(menu()).css("visibility", "hidden");
            }
            this.showMenu = function () {
                $(menu()).css("visibility", "visible");
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
                    connectedEdges.push(triple_brain.ui.edge.withHtml(connectedHTMLEdges[i]));
                }
                return connectedEdges;
            }
            this.isLabelInFocus = function () {
                return $(this.label()).is(":focus");
            }
            this.focus = function () {
                $(this.label()).focus();
            }
            this.readjustLabelWidth = function () {
                triple_brain.ui.vertex_and_edge_common.adjustTextFieldWidthToNumberOfChars(
                    this.label()
                );
                thisVertex.adjustWidth();
            }
            this.text = function () {
                return $(this.label()).val();
            }
            this.hasDefaultText = function () {
                return $(this.label()).val() == triple_brain.ui.vertex.EMPTY_LABEL;
            }
            this.applyStyleOfDefaultText = function () {
                $(this.label()).addClass('when-default-graph-element-text');
            }
            this.removeStyleOfDefaultText = function () {
                $(this.label()).removeClass('when-default-graph-element-text');
            }
            this.isMouseOverLabel = function () {
                return $(html).find("input[type='text']:hover").size() > 0;
            }
            this.isMouseOverMoveButton = function () {
                return $(html).find(".move:hover").size() > 0;
            }
            this.isCenterVertex = function () {
                return $(html).hasClass("center-vertex");
            }
            this.removeConnectedEdges = function () {
                var connectedEdges = this.connectedEdges();
                for (var i = 0; i < connectedEdges.length; i++) {
                    connectedEdges[i].remove();
                }
                triple_brain.ui.edge.redrawAllEdges();
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
                eventBus.publish(
                    '/event/ui/graph/vertex/suggestions/updated',
                    [thisVertex, suggestions]
                );
            }
            this.removeType = function (type) {
                var types = thisVertex.removeIdenficationInArray(
                    type,
                    thisVertex.getTypes()
                );
                $(thisVertex).data("types", types);
                vertexService.setSuggestions(
                    thisVertex,
                    []
                );
                eventBus.publish(
                    '/event/ui/graph/vertex/type/removed',
                    [thisVertex, type]
                );
            }

            this.removeIdenficationInArray = function (identificationToRemove, array) {
                var i = 0;
                $.each(array, function(){
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
                eventBus.publish(
                    '/event/ui/graph/vertex/type/added',
                    [thisVertex, type]
                );
            }
            this.addSameAs = function (sameAs) {
                sameAs.setType("same_as");
                var sameAsCollection = thisVertex.getSameAs()
                sameAsCollection.push(sameAs);
                thisVertex.setSameAs(sameAsCollection);
                eventBus.publish(
                    '/event/ui/graph/vertex/same_as/added',
                    [thisVertex, sameAs]
                );
            }
            this.setSameAs = function(sameAsCollection){
                $(html).data('sameAs', sameAsCollection);
            }
            this.removeSameAs = function (sameAsToRemove) {
                var sameAs = thisVertex.removeIdenficationInArray(
                    sameAsToRemove,
                    thisVertex.getTypes()
                );
                $(thisVertex).data("sameAs", sameAs);
                vertexService.setSuggestions(
                    thisVertex,
                    []
                );
                eventBus.publish(
                    '/event/ui/graph/vertex/same_as/removed',
                    [thisVertex, sameAsToRemove]
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
            this.numberOfEdgesFromCentralVertex = function () {
                return $(html).data('numberOfEdgesFromCentralVertex');
            }
            this.setNumberOfEdgesFromCentralVertex = function (numberOfEdgesFromCentralVertex) {
                $(html).data('numberOfEdgesFromCentralVertex', numberOfEdgesFromCentralVertex);
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
                    $(menu()).width()
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

            function centerButton() {
                return $(html).find('.center');
            }
            crow.ConnectedNode.apply(this, [thisVertex.getId()]);
        }

        Vertex.prototype = new crow.ConnectedNode();

        var eventBus = triple_brain.event_bus;

        eventBus.subscribe(
            '/event/ui/graph/vertex/label/updated',
            function (event, vertex) {
                triple_brain.ui.vertex_and_edge_common.highlightLabel(
                    vertex.getId()
                );
            }
        );

        eventBus.subscribe(
            '/event/ui/graph/vertex/deleted/',
            function (event, vertex) {
                vertex.removeConnectedEdges();
                vertex.remove();
            }
        );

        eventBus.subscribe(
            '/event/ui/graph/vertex_and_relation/added/',
            function (event, triple) {
                triple.destinationVertex().focus();
            }
        );
    })(jQuery);
}
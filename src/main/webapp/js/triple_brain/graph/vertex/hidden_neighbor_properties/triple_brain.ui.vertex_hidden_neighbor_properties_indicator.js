define([
    "jquery",
    "triple_brain.ui.edge",
    "triple_brain.ui.vertex_hidden_neighbor_properties_indicator_dashed_segment",
    "triple_brain.point",
    "triple_brain.segment",
    "triple_brain.mind-map_template",
    "triple_brain.graph_element_menu",
    "triple_brain.ui.graph"
],
    function ($, Edge, DashedSegment, Point, Segment, MindMapTemplate, GraphElementMenu, GraphUi) {
        var api = {
            withVertex:function (vertex) {
                return new HiddenNeighborPropertiesIndicator(vertex);
            }
        };
        return api;
        function HiddenNeighborPropertiesIndicator(vertex) {
            var hiddenNeighborPropertiesContainer;
            var dashSegments = [];
            this.build = function () {
                var numberOfHiddenConnectedVertices = vertex.numberOfHiddenConnectedVertices();
                if (numberOfHiddenConnectedVertices == 0) {
                    return;
                }
                var defaultLengthOfHiddenPropertiesContainer = 40;
                var lengthInPixels = numberOfHiddenConnectedVertices == 1 ?
                    1 :
                    defaultLengthOfHiddenPropertiesContainer;
                var startPoint = Point.fromCoordinates(
                    vertex.position().x + vertex.width(),
                    vertex.position().y + (vertex.height() / 2)
                );
                var distanceBetweenEachDashedSegment =
                    numberOfHiddenConnectedVertices == 1 ?
                        0 :
                        lengthInPixels / (vertex.numberOfHiddenConnectedVertices() - 1);
                var plainSegment = Segment.withStartAndEndPointAtOrigin();
                plainSegment.startPoint = startPoint;
                var horizontalDistanceOfDashedSegment = 20;
                plainSegment.endPoint.x = vertex.position().x +
                    vertex.width() +
                    horizontalDistanceOfDashedSegment;
                for (var i = 0; i < numberOfHiddenConnectedVertices; i++) {
                    plainSegment.endPoint.y = startPoint.y - (lengthInPixels / 2) + (i * distanceBetweenEachDashedSegment);
                    var dashedSegment = DashedSegment.withSegment(plainSegment.clone());
                    dashedSegment.draw();
                    dashSegments.push(dashedSegment);
                }
                hiddenNeighborPropertiesContainer = $(
                    MindMapTemplate[
                        'hidden_property_container'
                        ].merge()
                );
                GraphUi.addHTML(
                    hiddenNeighborPropertiesContainer
                );

                hiddenNeighborPropertiesContainer
                    .css('min-width', defaultLengthOfHiddenPropertiesContainer)
                    .css('min-height', defaultLengthOfHiddenPropertiesContainer)
                    .css('left', startPoint.x)
                    .css('top', startPoint.y - (defaultLengthOfHiddenPropertiesContainer / 2))
                    .data("vertex", vertex)
                    .on(
                    "click",
                    showHiddenRelation
                );
            };
            this.remove = function () {
                $(hiddenNeighborPropertiesContainer).remove();
                while (dashSegments.length != 0) {
                    var dashSegment = dashSegments.pop();
                    dashSegment.remove();
                }
            };

            function showHiddenRelation(){
                var vertex = $(this).data("vertex");
                var hiddenPropertyMenu = $(
                    MindMapTemplate[
                        'hidden_property_menu'
                        ].merge()
                );
                GraphUi.addHTML(
                    hiddenPropertyMenu
                )
                hiddenPropertyMenu.append(
                    MindMapTemplate['hidden_properties_title'].merge()
                );
                var propertyList = $(
                    MindMapTemplate['hidden_property_list'].merge()
                );
                hiddenPropertyMenu.append(
                    propertyList
                );
                var nameOfHiddenProperties = vertex.nameOfHiddenProperties();
                $.each(nameOfHiddenProperties, function () {
                    var nameOfHiddenProperty = this;
                    var property = MindMapTemplate[
                        'hidden_property'
                        ].merge({
                            name:nameOfHiddenProperty == "" ?
                                Edge.getWhenEmptyLabel() :
                                nameOfHiddenProperty
                        });
                    propertyList.append(property);
                });
                GraphElementMenu.makeForMenuContentAndGraphElement(
                    hiddenPropertyMenu,
                    vertex
                );
            }
        }
    }
);
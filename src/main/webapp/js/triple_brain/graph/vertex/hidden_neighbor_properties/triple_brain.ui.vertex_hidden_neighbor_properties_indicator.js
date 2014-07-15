define([
        "jquery",
        "triple_brain.mind-map_template",
        "triple_brain.event_bus",
        "triple_brain.graph_displayer"
    ],
    function ($, MindMapTemplate, EventBus, GraphDisplayer) {
        var api = {
            withVertex: function (vertex) {
                return new HiddenNeighborPropertiesIndicator(vertex);
            }
        };
        EventBus.subscribe(
            "/event/ui/vertex/visit_after_graph_drawn",
            function (event, vertex) {
                if (vertex.hasHiddenRelations()) {
                    vertex.buildHiddenNeighborPropertiesIndicator();
                }
            }
        );
        return api;
        function HiddenNeighborPropertiesIndicator(vertex) {
            var hiddenNeighborPropertiesContainer;
            this.build = function () {
                var numberOfHiddenRelationsToFlag = vertex.getTotalNumberOfEdges() - 1;
                if(numberOfHiddenRelationsToFlag > 10){
                    numberOfHiddenRelationsToFlag = 10;
                }
                var isLeftOriented = vertex.getChildrenOrientation() === "left";
                hiddenNeighborPropertiesContainer = $(
                    MindMapTemplate[
                        'hidden_property_container'
                        ].merge()
                ).data("vertex", vertex);
                var imageUrl = "/css/images/icons/vertex/" +
                    numberOfHiddenRelationsToFlag +
                    "_"
                    + (isLeftOriented ? "left_" : "") +
                    "hidden_properties.svg";
                var img = $("<img>").attr(
                    "src",
                    imageUrl
                );
                hiddenNeighborPropertiesContainer.append(
                    img
                );
                vertex.getHtml()[isLeftOriented ? "prepend" : "append"](
                    hiddenNeighborPropertiesContainer
                );
                hiddenNeighborPropertiesContainer.on(
                    "click",
                    handleHiddenPropertiesContainerClick
                );
            };
            this.remove = function () {
                hiddenNeighborPropertiesContainer.remove();
            };
        }

        function handleHiddenPropertiesContainerClick() {
            if (!GraphDisplayer.canAddChildTree()) {
                return;
            }
            var $this = $(this);
            var vertex = $this.data("vertex");
            $this.remove();
            GraphDisplayer.addChildTree(
                vertex,
                function (drawnTree) {
                    GraphDisplayer.integrateEdgesOfServerGraph(
                        drawnTree
                    );
                    vertex.visitChildren(function (child) {
                        if (child.hasHiddenRelations()) {
                            child.buildHiddenNeighborPropertiesIndicator();
                        }
                    });
                }
            );
        }
    }
);
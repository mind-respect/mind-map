define(
    [
        "jquery",
        "triple_brain.user",
        "triple_brain.event_bus",
        "triple_brain.login_handler",
        "triple_brain.drag_scroll",
        "triple_brain.ui.vertex",
        "triple_brain.ui.edge_creator",
        "triple_brain.mind-map_template",
        "triple_brain.server_subscriber",
        "triple_brain.ui.search",
        "triple_brain.ui.depth_slider",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_as_graph",
        "triple_brain.graph_displayer_as_absolute_tree",
        "triple_brain.graph_displayer_as_relative_tree"
    ],
    function ($, UserService, EventBus, LoginHandler, DragScroll, Vertex, EdgeCreator, MindMapTemplate, ServerSubscriber, SearchUi, DepthSlider, GraphDisplayer, GraphDisplayerAsGraph, GraphDisplayerAsAbsoluteTree, GraphDisplayerAsRelativeTree) {
        var api = {
            offset:function () {
                var offset = {};
                var leftMargin = 150;
                var topMargin = 75;
                offset.left = $("#left-panel").width() + leftMargin;
                offset.top = topMargin;
                return offset;
            },
            start:function () {
                $(document).ready(function () {
                    ServerSubscriber.init(function () {
                        console.log("cometd initialized");
                    });
                    UserService.isAuthenticated(
                        callBackWhenIsAuthenticated,
                        showCredentialsFlow
                    );
                });
                function callBackWhenIsAuthenticated() {
                    $("html").addClass("authenticated");
                    handleIfNotAuthenticatedShowCredentialsFlow();
                    handleDisconnectButton();
                    DepthSlider.init();
                    SearchUi.init();
                    GraphDisplayer.setImplementation(
                        GraphDisplayerAsGraph
                    );
                    UserService.authenticatedUser(
                        GraphDisplayer.displayUsingDefaultVertex
                    );
                    $("#redraw-graph-btn").click(function () {
                        GraphDisplayer.displayUsingNewCentralVertex(
                            Vertex.centralVertex()
                        );
                    });
                }

                function handleIfNotAuthenticatedShowCredentialsFlow() {
                    $("html").ajaxError(function (e, jqxhr, settings, exception) {
                        if (jqxhr.status == 403) {
                            showCredentialsFlow();
                        }
                    });
                }

                function showCredentialsFlow() {
                    LoginHandler.startFlow();
                }

                function handleDisconnectButton() {
                    $("#disconnect-btn").click(function () {
                        UserService.logout(function () {
                            window.location = "/";
                        })
                    })
                }
            }
        };
        EventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function (event, drawnGraph, centralVertexId) {
                if ($("body").data(("canvas"))) {
                    $("body").data("canvas").clear();
                }
                $("body").data(
                    "canvas",
                    Raphael(0, 0, $("body").width(), $("body").height())
                );
                EdgeCreator.arrayFromServerFormatArray(
                    drawnGraph.edges
                );
                var centralVertex = Vertex.withId(centralVertexId);
                centralVertex.setAsCentral();
                centralVertex.scrollTo();

                DragScroll.start();
                EventBus.publish('/event/ui/graph/drawn');
            }
        );
        return api;
    }
);



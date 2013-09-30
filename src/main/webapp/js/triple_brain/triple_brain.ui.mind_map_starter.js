define(
    [
        "jquery",
        "triple_brain.user",
        "triple_brain.event_bus",
        "triple_brain.login_handler",
        "triple_brain.drag_scroll",
        "triple_brain.ui.vertex",
        "triple_brain.mind-map_template",
        "triple_brain.server_subscriber",
        "triple_brain.ui.search",
        "triple_brain.ui.depth_slider",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        "triple_brain.menu",
        "triple_brain.ui.graph",
        "triple_brain.language_manager",
        "triple_brain.vertex",
        "triple_brain.top_center_menu",
        "triple_brain.selection_handler"
    ],
    function ($, UserService, EventBus, LoginHandler, DragScroll, Vertex, MindMapTemplate, ServerSubscriber, SearchUi, DepthSlider, GraphDisplayer, GraphDisplayerFactory, Menu, GraphUi, LanguageManager, VertexService, TopCenterMenu, SelectionHandler) {
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
                    handleCreateNewConceptButton();
                    TopCenterMenu.init();
                    DepthSlider.init();
                    SearchUi.init();
                    GraphDisplayer.setImplementation(
                        GraphDisplayerFactory.getByName(
                            "relative_tree"
                        )
                    );
                    UserService.authenticatedUser(function () {
                            LanguageManager.loadLocaleContent(function () {
                                GraphUi.resetDrawingCanvas();
                                GraphDisplayer.displayUsingDefaultVertex();
                                Menu.redrawButton().on(
                                    "click",
                                    function () {
                                        GraphUi.resetDrawingCanvas();
                                        GraphDisplayer.displayUsingNewCentralVertex(
                                            Vertex.centralVertex()
                                        );
                                });
                                switchDisplayerButtons().click(function () {
                                    var displayerName = $(this).attr("data-displayer_name");
                                    GraphDisplayer.setImplementation(
                                        GraphDisplayerFactory.getByName(
                                            displayerName
                                        )
                                    );
                                    GraphDisplayer.displayUsingNewCentralVertex(
                                        Vertex.centralVertex()
                                    );
                                });
                                translateText();
                            });
                        }
                    );
                }
                function translateText() {
                    $("html").i18n();
                }

                function getHeaderMenu() {
                    return $("#top-panel");
                }

                function switchDisplayerButtons() {
                    return getHeaderMenu().find(".switch-displayer");
                }

                function handleIfNotAuthenticatedShowCredentialsFlow() {
                    $("html").ajaxError(function (e, jqxhr, settings, exception) {
                        if (jqxhr.status == 403) {
                            showCredentialsFlow();
                        }
                    });
                }

                function showCredentialsFlow() {
                    LanguageManager.loadLocaleContent(function () {
                        LoginHandler.startFlow();
                    });
                }

                function handleDisconnectButton() {
                    $("#disconnect-btn").click(function () {
                        UserService.logout(function () {
                            window.location = "/";
                        })
                    });
                }

                function handleCreateNewConceptButton() {
                    $("#create-concept").on(
                        "click",
                        function () {
                            VertexService.createVertex(function(newVertex){
                                GraphDisplayer.displayUsingNewCentralVertexUri(
                                    newVertex.uri
                                );
                            });
                        }
                    );
                }
            }
        };
        EventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function (event, drawnGraph, centralVertexUri) {
                SelectionHandler.reset();
                var centralVertex = Vertex.withUri(centralVertexUri)[0];
                centralVertex.setAsCentral();
                GraphDisplayer.integrateEdgesOfServerGraph(
                    drawnGraph
                );
                centralVertex.scrollTo();
                DragScroll.start();
                EventBus.publish('/event/ui/graph/drawn');
            }
        );
        return api;
    }
);



/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(
    [
        "jquery",
        "triple_brain.mind_map_flow",
        "triple_brain.user_service",
        "triple_brain.mind_map_info",
        "triple_brain.landing_page_flow",
        "triple_brain.schema_list_flow",
        "triple_brain.change_password",
        "triple_brain.login_handler",
        "triple_brain.register_handler",
        "triple_brain.header",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        "triple_brain.flow",
        "triple_brain.bubble_cloud_flow",
        "triple_brain.wikidata",
        "triple_brain.ui.search",
        "triple_brain.modules",
        "jquery.lazyload",
        "intro"
    ],
    function ($, MindMapFlow, UserService, MindMapInfo, LandingPageFlow, SchemaListFlow, ChangePassword, LoginHandler, RegisterHandler, Header, GraphDisplayer, GraphDisplayerFactory, Flow, BubbleCloudFlow) {
        "use strict";
        var api = {};
        api.start = function () {
            $("img.lazy").lazyload();
            GraphDisplayer.setImplementation(
                GraphDisplayerFactory.getByName(
                    "relative_tree"
                )
            );
            startLoginFlowWhenForbiddenActionIsPerformed();
            UserService.isAuthenticated(
                callbackWhenUserAuthenticated,
                callBackWhenNotAuthenticated
            );
        };
        api.enterBubbleCloudFlow = function () {
            MindMapFlow.enterBubbleCloud();
        };

        return api;

        function callbackWhenUserAuthenticated() {
            if (MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                MindMapFlow.enterMindMapForAuthenticatedUser();
                return;
            }
            UserService.authenticatedUser(function () {
                Header.commonSetupForAuthenticated();
                if (MindMapInfo.isLandingPageFlow()) {
                    LandingPageFlow.enterForAuthenticated();
                    return;
                }
                if (MindMapInfo.isSchemaListFlow()) {
                    SchemaListFlow.enter();
                    return;
                }
                MindMapFlow.enterBubbleCloud();
            });
        }

        function callBackWhenNotAuthenticated() {
            Header.commonSetupForAnonymous();
            LoginHandler.setupModal();
            RegisterHandler.setupModal();
            if (ChangePassword.isChangePasswordFlow()) {
                ChangePassword.enterFlow();
            }
            if (MindMapInfo.isLandingPageFlow()) {
                LandingPageFlow.enter();
            }
            else if (MindMapInfo.isSchemaListFlow()) {
                SchemaListFlow.enter();
            } else if (Flow.isBubbleCloudFlow()) {
                BubbleCloudFlow.enter();
            }
            else {
                MindMapFlow.enterMindMapForAnonymousUser();
            }
        }

        function startLoginFlowWhenForbiddenActionIsPerformed() {
            $.ajaxSetup({
                error: function (xhr) {
                    $("body").removeClass("hidden");
                    if (403 === xhr.status) {
                        $("#not-allowed-modal").modal();
                    }
                    else if (404 === xhr.status) {
                        $("#non-existent-modal").modal();
                    }
                }
            });
        }
    }
)
;

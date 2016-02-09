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
        "triple_brain.change_password",
        "triple_brain.login_handler",
        "triple_brain.register_handler",
        "triple_brain.external_page_loader",
        "triple_brain.wikidata",
        "triple_brain.ui.search",
        "triple_brain.modules"
    ],
    function ($, MindMapFlow, UserService, MindMapInfo, LandingPageFlow, ChangePassword, LoginHandler, RegisterHandler, ExternalPageLoader) {
        "use strict";
        var api = {};
        api.start = function () {
            startLoginFlowWhenForbiddenActionIsPerformed();
            UserService.isAuthenticated(
                callbackWhenUserAuthenticated,
                callBackWhenNotAuthenticated
            );
            setupLogoClick();
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
                if (usernameForBublGuru === "") {
                    LandingPageFlow.enterForAuthenticated();
                    return;
                }
                MindMapFlow.enterBubbleCloud();
            });
        }

        function callBackWhenNotAuthenticated() {
            LoginHandler.setupModal();
            RegisterHandler.setupModal();
            if (ChangePassword.isChangePasswordFlow()) {
                ChangePassword.enterFlow();
            }
            if (MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                MindMapFlow.enterMindMapForAnonymousUser();
            } else {
                LandingPageFlow.enter();
            }
        }

        function startLoginFlowWhenForbiddenActionIsPerformed() {
            $.ajaxSetup({
                error: function (xhr) {
                    $("body").removeClass("hidden");
                    if (403 === xhr.status) {
                        ExternalPageLoader.showLinearFlowWithOptions({
                            href: "/not-allowed.html",
                            title: $.t("not_allowed.title")
                        });
                    } else if (404 === xhr.status) {
                        ExternalPageLoader.showLinearFlowWithOptions({
                            href: "/non-existent.html",
                            title: $.t("non_existent.title")
                        });
                    }
                }
            });
        }

        function setupLogoClick() {
            $("#logo").click(function (event) {
                event.preventDefault();
                if (MindMapInfo.isAnonymous()) {
                    window.location = "http://about.bubl.guru";
                } else {
                    window.location = "/";
                }
            });
        }
    }
);

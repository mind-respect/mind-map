/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(
    [
        "jquery",
        "triple_brain.mind_map_flow",
        "triple_brain.user_service",
        "triple_brain.mind_map_info",
        "triple_brain.anonymous_flow",
        "triple_brain.change_password",
        "triple_brain.login_handler",
        "triple_brain.wikidata",
        "triple_brain.ui.search",
        "triple_brain.modules"
    ],
    function ($, MindMapFlow, UserService, MindMapInfo, AnonymousFlow, ChangePassword, LoginHandler) {
        "use strict";
        var api = {};
        api.start = function() {
            startLoginFlowWhenForbiddenActionIsPerformed();
            UserService.isAuthenticated(
                setupMindMapForAuthenticatedUser,
                callBackWhenNotAuthenticated
            );
        };
        api.enterBubbleCloudFlow = function(){
            MindMapFlow.enterBubbleCloud();
        };

        return api;

        function setupMindMapForAuthenticatedUser() {
            if (!MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                UserService.authenticatedUser(function () {
                    MindMapFlow.enterBubbleCloud();
                });
                return;
            }
            MindMapFlow.enterMindMapForAuthenticatedUser();
        }

        function callBackWhenNotAuthenticated() {
            LoginHandler.setupModal();
            if (ChangePassword.isChangePasswordFlow()) {
                ChangePassword.enterFlow();
            }
            if (MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                MindMapFlow.enterMindMapForAnonymousUser();
            } else {
                AnonymousFlow.enter();
            }
        }

        function startLoginFlowWhenForbiddenActionIsPerformed() {
            $("html").ajaxError(function (e, jqxhr) {
                if (403 === jqxhr.status) {
                    LoginHandler.showModal();
                }
            });
        }
    }
);

/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.big_search_box",
        "triple_brain.login_handler",
        "triple_brain.register_handler",
        "triple_brain.selection_handler",
        "triple_brain.user_service",
        "triple_brain.graph_displayer",
        "triple_brain.vertex",
        "triple_brain.vertex_service",
        "triple_brain.mind_map_info",
        "triple_brain.event_bus",
        "triple_brain.schema_service"
    ],
    function ($, BigSearchBox, LoginHandler, RegisterHandler, SelectionHandler, UserService, GraphDisplayer, Vertex, VertexService, MindMapInfo, EventBus, SchemaService) {
        "use strict";
        var api = {};
        api.earlyInit = function () {
            handleTopMenuSelectButtons();
            setUpShareLinkButton();
        };
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function (event, isViewOnly) {
            if (isViewOnly) {
                getCreateMenu().addClass("hidden");
                BigSearchBox.setup();
            }
            if (MindMapInfo.isAnonymous()) {
                getLandingPageSearchInput().removeClass("hidden");
                getDisconnectButton().addClass("hidden");
                getUserMenu().addClass("hidden");
                handleLoginRegisterButtons();
            } else {
                getMyBubblesSearchInput().removeClass("hidden");
                handleCreateNewConceptButton();
                handleCreateNewSchemaButton();
                handleDisconnectButton();
                getLoginButton().addClass("hidden");
                getRegisterButton().addClass("hidden");
            }
            if (!MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                getSelectButton().addClass("hidden");
            }
        });
        EventBus.subscribe('/event/ui/graph/drawn /event/ui/graph/vertex/privacy/updated', refreshShareLinkVisibility);
        return api;
        function refreshShareLinkVisibility(){
            getShareLink()[GraphDisplayer.getVertexSelector().centralVertex().isPublic() ? "removeClass" : "addClass"](
                "invisible"
            );
        }
        function handleTopMenuSelectButtons() {
            $("#select-all-bubbles").click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                SelectionHandler.selectAllBubblesOnly();
            });
            $("#select-all-relations").click(function (event) {
                event.preventDefault();
                event.stopPropagation();
                SelectionHandler.selectAllRelationsOnly();
            });
        }

        function getCreateMenu() {
            return $("#create-menu");
        }

        function handleDisconnectButton() {
            getDisconnectButton().off(
                "click",
                disconnect
            ).on(
                "click",
                disconnect
            );
        }

        function disconnect() {
            UserService.logout(function () {
                window.location = "/";
            });
        }

        function handleCreateNewConceptButton() {
            getCreateBubbleButton().off(
                "click",
                createNewConcept
            ).on(
                "click",
                createNewConcept
            );
        }

        function handleCreateNewSchemaButton() {
            getCreateSchemaButton().off(
                "click",
                createNewSchema
            ).on(
                "click",
                createNewSchema
            );
        }


        function handleLoginRegisterButtons() {
            getLoginButton().click(
                LoginHandler.showModal
            );
            getRegisterButton().click(
                RegisterHandler.showModal
            );
        }

        function createNewSchema(event) {
            event.preventDefault();
            SchemaService.create(function(schemaUri){
                if(MindMapInfo.isTagCloudFlow()){
                    window.location = "?bubble=" + schemaUri;
                    return;
                }
                GraphDisplayer.displayForSchemaWithUri(schemaUri);
            });
        }

        function createNewConcept(event) {
            event.preventDefault();
            VertexService.createVertex(function (newVertex) {
                var serverFormatFacade = Vertex.fromServerFormat(
                    newVertex
                );
                if(MindMapInfo.isTagCloudFlow()){
                    window.location = "?bubble=" + serverFormatFacade.getUri();
                    return;
                }
                GraphDisplayer.displayUsingCentralVertexUri(
                    serverFormatFacade.getUri()
                );
            });
        }

        function setUpShareLinkButton(){
            getShareLinkInput().val(
                window.location.href
            );
            getShareLink().click(function(event){
                event.preventDefault();
                var shareLinkInput = getShareLinkInput();
                shareLinkInput.toggleClass("hidden");
                shareLinkInput[0].setSelectionRange(0, shareLinkInput.val().length);
            });
        }

        function getCreateBubbleButton() {
            return $("#create-concept");
        }

        function getCreateSchemaButton() {
            return $("#create-schema");
        }

        function getDisconnectButton() {
            return $("#disconnect-btn");
        }

        function getLoginButton() {
            return $("#login-button");
        }

        function getRegisterButton() {
            return $("#register-button");
        }

        function getSelectButton() {
            return $("#select-button");
        }

        function getUserMenu() {
            return $("#user-menu");
        }

        function getLandingPageSearchInput() {
            return $("#landing-page-search");
        }

        function getMyBubblesSearchInput() {
            return $("#vertex-search-input");
        }
        function getShareLink(){
            return $("#share-link");
        }
        function getShareLinkInput(){
            return $("#share-link-input");
        }
    }
);

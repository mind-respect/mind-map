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
        "triple_brain.schema_service",
        "triple_brain.id_uri"
    ],
    function ($, BigSearchBox, LoginHandler, RegisterHandler, SelectionHandler, UserService, GraphDisplayer, Vertex, VertexService, MindMapInfo, EventBus, SchemaService, IdUri) {
        "use strict";
        var api = {};
        api.earlyInit = function () {
            handleTopMenuSelectButtons();
            setUpShareLinkButton();
        };
        EventBus.subscribe('/event/ui/mind_map_info/is_view_only', function (event, isViewOnly) {
            getSaveAsImageButton().removeClass("hidden");
            if (isViewOnly) {
                getCreateMenu().addClass("hidden");
                BigSearchBox.setup();
            }
            if (MindMapInfo.isAnonymous()) {
                getLandingPageSearchInput().removeClass("hidden");
                getDisconnectButton().addClass("hidden");
                getUserMenu().addClass("hidden");
                getAllYourBubblesButton().addClass("hidden");
                handleLoginRegisterButtons();
            } else {
                getMyBubblesSearchInput().removeClass("hidden");
                handleCreateNewConceptButton();
                handleCreateNewSchemaButton();
                handleDisconnectButton();
                getLoginButton().addClass("hidden");
                getAllYourBubblesButton().removeClass("hidden");
                getAllYourBubblesButton().prop(
                    "href",
                    "/user/" + UserService.authenticatedUserInCache().user_name
                );
                getRegisterButton().addClass("hidden");
            }
            //handleSaveAsImageButton();
            if (!MindMapInfo.isCenterBubbleUriDefinedInUrl()) {
                getSelectButton().addClass("hidden");
            }
        });
        EventBus.subscribe('/event/ui/graph/drawn /event/ui/graph/vertex/privacy/updated', refreshShareLinkVisibility);
        return api;
        function refreshShareLinkVisibility() {
            getShareLink()[GraphDisplayer.getVertexSelector().centralVertex().isPublic() ? "removeClass" : "addClass"](
                "hidden"
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

        //function handleSaveAsImageButton() {
        //    getSaveAsImageButton().off(
        //        "click",
        //        saveAsImageHandle
        //    ).on(
        //        "click",
        //        saveAsImageHandle
        //    );
        //}

        //function saveAsImageHandle(event){
        //    event.preventDefault();
        //    ExportAsImage.download();
        //}

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
            getLoginButton().add(
                getLoginButtonInPage()
            ).click(
                LoginHandler.showModal
            );
            getRegisterButton().add(
                getRegisterButtonInPage()
            ).click(
                RegisterHandler.showModal
            );
        }

        function createNewSchema(event) {
            event.preventDefault();
            SchemaService.create(function (schemaUri) {
                if (MindMapInfo.isTagCloudFlow() || MindMapInfo.isAuthenticatedLandingPageFlow()) {
                    window.location = IdUri.htmlUrlForBubbleUri(schemaUri);
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
                if (MindMapInfo.isTagCloudFlow() || MindMapInfo.isAuthenticatedLandingPageFlow()) {
                    window.location = IdUri.htmlUrlForBubbleUri(serverFormatFacade.getUri());
                    return;
                }
                GraphDisplayer.displayUsingCentralVertexUri(
                    serverFormatFacade.getUri()
                );
            });
        }

        function setUpShareLinkButton() {
            getShareLinkInput().val(
                window.location.href
            );
            getShareLink().click(function (event) {
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

        function getLoginButtonInPage() {
            return $("#login-button-in-page");
        }

        function getRegisterButtonInPage() {
            return $("#register-button-in-page");
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

        function getShareLink() {
            return $("#share-link");
        }

        function getShareLinkInput() {
            return $("#share-link-input");
        }

        function getAllYourBubblesButton() {
            return $("#all-your-bubbles-button");
        }

        function getSaveAsImageButton(){
            return $("#save-as-image-button");
        }
    }
);

/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.external_resource",
    "triple_brain.vertex",
    "triple_brain.mind-map_template",
    "triple_brain.ui.graph",
    "triple_brain.id_uri",
    "triple_brain.peripheral_menu",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.user_map_autocomplete_provider",
    "jquery.triple_brain.search",
    "jquery-ui"
],
    function ($, ExternalResource, VertexService, MindMapTemplate, GraphUi, IdUriUtils, PeripheralMenu, FreebaseAutocompleteProvider, UserMapAutocompleteProvider) {
        var api = {
            ofVertex:function (vertex) {
                return new IdentificationMenu(vertex);
            }
        };

        function IdentificationMenu(vertex) {
            var identificationMenu = this;
            var html;
            var peripheralMenu;
            this.rebuildList = function () {
                $(listHtml()).remove();
                addIdentifications();
            };
            this.create = function () {
                html = MindMapTemplate['identification_menu'].merge();
                html = $(html);
                GraphUi.addHTML(html);
                buildMenu();
                html.data("vertex", vertex);
                peripheralMenu = PeripheralMenu.peripheralMenuForMenuHtmlAndVertex(
                    html,
                    vertex
                ).init();
                html.i18n();
                return identificationMenu;
            };

            this.reEvaluatePosition = function () {
                peripheralMenu.position();
            };

            function listHtml() {
                return $(html).find(".list")
            }

            function listElements() {
                return $(listHtml()).find(".identification");
            }

            function buildMenu() {
                addTitle();
                addIdentifications();
                addIndications();
                var identificationTextField = addIdentificationTextField();
                $(identificationTextField).focus();
                addTypeIdentificationTextField();
            }

            function addTitle() {
                $(html).append(
                    MindMapTemplate['identification_menu_explanation_title'].merge()
                );
            }

            function addIndications() {
                $(html).append(
                    MindMapTemplate['identification_menu_indications'].merge()
                );
            }

            function addIdentifications() {
                var identitiesList = MindMapTemplate['identification_existing_identities'].merge();
                $(html).append(
                    identitiesList
                );
                $.each(vertex.getTypes().concat(vertex.getSameAs()), function () {
                    addIdentificationAsListElement(
                        this
                    );
                });
                makeListElementsCollapsible();
            }

            function makeListElementsCollapsible() {
                $(listHtml()).accordion().accordion("destroy");
                $(listHtml()).accordion({
                    collapsible:true,
                    active:false
                });
            }

            function addIdentificationAsListElement(identification) {
                var identificationListElement = MindMapTemplate['identification_existing_identity'].merge({
                    identification_uri:identification.uri(),
                    type_label:identification.label(),
                    description:identification.description()
                        .replace("\n", "<br/><br/>")
                });
                $(identificationListElement).data("identification", identification);
                $(listHtml()).append(
                    identificationListElement
                );
                $(identificationListElement).find(".remove-identification").click(function () {
                    var identificationListElement = this;
                    var identification = $(identificationListElement).closest(
                        '.identification'
                    ).data("identification");
                    var semanticMenu = $(identificationListElement).closest(
                        '.peripheral-menu'
                    );
                    var vertex = $(semanticMenu).data("vertex");
                    var removeIdentification = identification.getType() == "type" ?
                        VertexService.removeType :
                        VertexService.removeSameAs;
                    removeIdentification.call(
                        this,
                        vertex,
                        identification,
                        function (vertex, identification) {
                            $.each(listElements(), function () {
                                var listElement = this;
                                var listElementIdentification = $(listElement).data("identification");
                                if (identification.uri() == listElementIdentification.uri()) {
                                    $(listElement).next(".description").remove();
                                    $(listElement).remove();
                                    return false;
                                }
                            });
                        }
                    )
                });
                return identificationListElement;
            }

            function setTemporaryDescription(identification) {
                $(
                    descriptionFromIdentification(
                        identification
                    )
                ).text(
                    identification.description()
                );
            }

            function descriptionFromIdentification(identification) {
                return $(
                    titleFromIdentification(identification)
                ).next(".description");
            }

            function titleFromIdentification(identification) {
                return $(html).find(
                    "[identification-uri='" + identification.uri() + "']"
                );
            }

            function addIdentificationTextField() {
                var identificationTextField = MindMapTemplate[
                    'identification_textfield'
                    ].merge();
                $(html).append(identificationTextField);
                setUpAutocomplete();
                function setUpAutocomplete() {
                    identificationTextField.tripleBrainAutocomplete({
                        select:function (event, ui) {
                            var semanticMenu = $(this).closest('.peripheral-menu');
                            var vertex = $(semanticMenu).data("vertex");
                            var searchResult = ui.item;
                            identifyUsingServerIdentificationFctn(
                                vertex,
                                searchResult,
                                VertexService.addSameAs
                            );
                        },
                        resultsProviders : [
                            UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnes(),
                            FreebaseAutocompleteProvider.forFetchingAnything()
                        ]
                    });
                }
                return identificationTextField;
            }

            function addTypeIdentificationTextField(){
                var typeIdentificationTextField = MindMapTemplate[
                    'identification_type_textfield'
                    ].merge();
                $(html).append(typeIdentificationTextField);
                setUpAutocomplete();
                function setUpAutocomplete() {
                    typeIdentificationTextField.tripleBrainAutocomplete({
                        select:function (event, ui) {
                            var semanticMenu = $(this).closest('.peripheral-menu');
                            var vertex = $(semanticMenu).data("vertex");
                            var searchResult = ui.item;
                            identifyUsingServerIdentificationFctn(
                                vertex,
                                searchResult,
                                VertexService.addType
                            );
                        },
                        resultsProviders : [
                            UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnes(),
                            FreebaseAutocompleteProvider.forFetchingTypes()
                        ]
                    });
                }
                return typeIdentificationTextField;
            }

            function identifyUsingServerIdentificationFctn(vertex, searchResult, serverIdentificationFctn){
                var identificationResource = ExternalResource.withUriLabelAndDescription(
                    searchResult.uri,
                    searchResult.label,
                    searchResult.description
                );
                serverIdentificationFctn(
                    vertex,
                    identificationResource
                );
                addIdentificationAsListElement(identificationResource);
                makeListElementsCollapsible();
                setTemporaryDescription(identificationResource);
            }
        }
        return api;
    }
);
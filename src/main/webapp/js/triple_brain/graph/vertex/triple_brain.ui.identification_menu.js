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
    "triple_brain.ui.utils",
    "triple_brain.peripheral_menu",
    "triple_brain.freebase",
    "jquery.freebase_suggest",
    "jquery-ui"
],
    function ($, ExternalResource, VertexService, MindMapTemplate, GraphUi, IdUriUtils, UiUtils, PeripheralMenu, Freebase) {

        var api = {
            ofVertex:function (vertex) {
                return new IdentificationMenu(vertex);
            }
        }

        function IdentificationMenu(vertex) {
            var identificationMenu = this;
            var html;
            this.rebuildList = function () {
                $(listHtml()).remove();
                addIdentifications();
            }
            this.create = function () {
                html = MindMapTemplate['identification_menu'].merge();
                GraphUi.addHTML(html);
                buildMenu();
                $(html).data("vertex", vertex);
                PeripheralMenu.makeHtmlAPeripheralMenu(
                    html
                );
                return identificationMenu;
            }

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
                position();
                var identificationTextField = addIdentificationTextField();
                $(identificationTextField).focus();
                position();
            }

            this.reEvaluatePosition = function () {
                position();
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

            function makeListElementsCollapsible(){
                $(listHtml()).accordion().accordion("destroy");
                $(listHtml()).accordion({
                    collapsible: true,
                    active : false
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
                            $.each(listElements(), function(){
                                var listElement = this;
                                var listElementIdentification = $(listElement).data("identification");
                                if(identification.uri() == listElementIdentification.uri()){
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

            function position() {
                UiUtils.positionRight(
                    html,
                    vertex.getHtml()
                );
            }

            function setTemporaryDescription(identification){
                $(
                    descriptionFromIdentification(
                        identification
                    )
                ).text(
                    $(".fbs-topic-article").text()
                );
            }


            function descriptionFromIdentification(identification){
                return $(
                    titleFromIdentification(identification)
                ).next(".description");
            }

            function titleFromIdentification(identification){
                return $(html).find(
                    "[identification-uri='"+identification.uri()+"']"
                );
            }

            function addIdentificationTextField() {
                var identificationTextField = MindMapTemplate[
                    'identification_textfield'
                    ].merge();
                $(html).append(identificationTextField);
                $(identificationTextField).suggest({
                    key:"AIzaSyBHOqdqbswxnNmNb4k59ARSx-RWokLZhPA",
                    "zIndex":20,
                    scoring:"schema",
                    lang: "en"
                })
                    .bind("fb-select", function (e, freebaseSuggestion) {
                        var semanticMenu = $(this).closest('.peripheral-menu');
                        var vertex = $(semanticMenu).data("vertex");
                        Freebase.handleIdentificationToServer(
                            vertex,
                            freebaseSuggestion,
                            function (vertex, identification) {
                                addIdentificationAsListElement(identification);
                                makeListElementsCollapsible();
                                setTemporaryDescription(identification);
                            }
                        );
                    });
                return identificationTextField;
            }
        }
        return api;
    }
);
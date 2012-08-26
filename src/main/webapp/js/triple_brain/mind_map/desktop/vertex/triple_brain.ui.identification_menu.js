/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain/mind_map/triple_brain.external_resource",
    "triple_brain/mind_map/triple_brain.vertex",
    "triple_brain/mind_map/desktop/triple_brain.mind-map_template",
    "triple_brain/mind_map/desktop/triple_brain.ui.graph",
    "triple_brain/triple_brain.id_uri",
    "triple_brain/mind_map/triple_brain.point",
    "triple_brain/mind_map/triple_brain.freebase",
    "jquery/freebase_suggest.min"
],
    function ($, ExternalResource, VertexService, MindMapTemplate, Graph, IdUriUtils, Point, Freebase) {

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
                Graph.addHTML(html);
                buildMenu();
                $(html).click(function (e) {
                    e.stopPropagation();
                });
                $(html).data("vertex", vertex);
                return identificationMenu;
            }

            function listHtml() {
                return $(html).find(".identification-list")
            }

            function listElements() {
                return $(html).find(".identification-list").find("li");
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
            }

            function addIdentificationAsListElement(identification) {
                var identificationListElement = MindMapTemplate['identification_existing_identity'].merge({
                    identification_uri:IdUriUtils.encodeUri(identification.uri()),
                    type_label:identification.label()
                });
                $(identificationListElement).data("identification", identification);
                $(listHtml()).append(
                    identificationListElement
                );
                $(identificationListElement).find(".remove-identification").click(function () {
                    var identificationListElement = this;
                    var identification = $(identificationListElement).closest(
                        'li.identification'
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
                var menuOffset = Point.fromCoordinates(
                    vertex.width(),
                    vertex.height() / 2 - $(html).height() / 2
                )

                var menuPosition = Point.sumOfPoints(
                    vertex.position(),
                    menuOffset
                );
                if (isMenuPositionOffScreen(menuPosition)) {
                    menuPosition.y = 10;
                }

                $(html).css('left', menuPosition.x);
                $(html).css('top', menuPosition.y);
            }

            function isMenuPositionOffScreen(menuPosition) {
                return menuPosition.y < 10;
            }

            function addIdentificationTextField() {
                var identificationTextField = MindMapTemplate[
                    'identification_textfield'
                    ].merge();
                $(html).append(identificationTextField);
                $(identificationTextField).suggest({
                    "zIndex":20
                })
                    .bind("fb-select", function (e, freebaseSuggestion) {
                        var semanticMenu = $(this).closest('.peripheral-menu');
                        var vertex = $(semanticMenu).data("vertex");
                        Freebase.handleIdentificationToServer(
                            vertex,
                            freebaseSuggestion,
                            function (vertex, identification) {
                                addIdentificationAsListElement(identification);
                            }
                        );
                    });
                return identificationTextField;
            }
        }
        return api;
    }
);
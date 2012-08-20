/**
 * Copyright Mozilla Public License 1.1
 */

if (triple_brain.ui.identification_menu == undefined) {
    (function ($) {
        var externalResourceStatic = triple_brain.external_resource;
        var vertexService = triple_brain.vertex;
        triple_brain.ui.identification_menu = {
            ofVertex:function (vertex) {
                return new IdentificationMenu(vertex);
            }
        }

        function IdentificationMenu(vertex) {
            var identificationMenu = this;
            var html;
            this.rebuildList = function () {
                $(listHtml()).remove();
                addExistingIdentifications();
            }
            this.create = function () {
                html = triple_brain.template['identification_menu'].merge();
                triple_brain.ui.graph.addHTML(html);
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
                addExistingIdentifications();
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
                    triple_brain.template['identification_menu_explanation_title'].merge()
                );
            }

            function addIndications() {
                $(html).append(
                    triple_brain.template['identification_menu_indications'].merge()
                );
            }

            function addExistingIdentifications() {
                var identitiesList = triple_brain.template['identification_existing_identities'].merge();
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
                var identificationListElement = triple_brain.template['identification_existing_identity'].merge({
                    identification_uri:triple_brain.id_uri.encodeUri(identification.uri()),
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
                        vertexService.removeType :
                        vertexService.removeSameAs;
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
                var menuOffset = triple_brain.point.fromCoordinates(
                    vertex.width(),
                    vertex.height() / 2 - $(html).height() / 2
                )

                var menuPosition = triple_brain.point.sumOfPoints(
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
                var identificationTextField = triple_brain.template[
                    'identification_textfield'
                    ].merge();
                $(html).append(identificationTextField);
                $(identificationTextField).suggest({
                    "zIndex":20
                })
                    .bind("fb-select", function (e, freebaseSuggestion) {
                        var semanticMenu = $(this).closest('.peripheral-menu');
                        var vertex = $(semanticMenu).data("vertex");
                        triple_brain.freebase.handleIdentificationToServer(
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
    })(jQuery);
}
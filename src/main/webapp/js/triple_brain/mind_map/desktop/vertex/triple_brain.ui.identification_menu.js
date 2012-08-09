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
            this.redraw = function () {
                $(html).remove();
                identificationMenu.create();
            }
            this.create = function () {
                html = triple_brain.template['identification_menu'].merge();
                triple_brain.ui.graph.addHTML(html);
                vertex.hasTheAdditionalType() ?
                    displayAdditionalTypeScenario() :
                    displayNoAdditionalTypeScenario();
                $(html).click(function (e) {
                    e.stopPropagation();
                });
                $(html).data("vertex", vertex);
                return identificationMenu;
            }

            function displayAdditionalTypeScenario() {
                addTheAdditionalTypeMenu();
                addIdentificationTextField();
                position();
            }

            function displayNoAdditionalTypeScenario() {
                addExplanationTitle();
                addSubTitle();
                position();
                var identificationTextField = addIdentificationTextField();
                $(identificationTextField).focus();
            }

            this.reEvaluatePosition = function () {
                position();
            }

            function addExplanationTitle() {
                $(html).append(
                    triple_brain.template['identification_menu_explanation_title'].merge()
                );
            }

            function addSubTitle() {
                $(html).append(
                    triple_brain.template['identification_menu_sub_title'].merge()
                );
            }

            function addTheAdditionalTypeMenu() {
                var typeMenu = triple_brain.template['identification_additional_type_menu'].merge({
                    type_label:vertex.type().label()
                });
                $(html).append(
                    typeMenu
                );
                $(html).find(".remove-type").click(function () {
                    var vertex = $(this).closest('.peripheral-menu').data("vertex");
                    vertexService.removeType(vertex, function () {
                        identificationMenu.redraw();
                    });
                })
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
                    .bind("fb-select", function (e, data) {
                        var semanticMenu = $(this).closest('.peripheral-menu');
                        var vertex = $(semanticMenu).data("vertex");
                        var typeId = data['n:type'].id;
                        if (triple_brain.freebase.isOfTypeTypeFromTypeId(typeId)) {
                            vertexService.updateType(
                                vertex,
                                externalResourceStatic.fromFreebaseSuggestion(
                                    data
                                ),
                                function () {
                                    identificationMenu.redraw();
                                }
                            );
                        } else {
                            var resourceUri = triple_brain.freebase.freebaseIdToURI(data.id);
                            vertexService.updateSameAs(vertex, resourceUri);
                        }
                    });
                return identificationTextField;
            }
        }
    })(jQuery);
}
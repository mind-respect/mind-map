/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.graph_element_menu",
        "triple_brain.ui.graph",
        "triple_brain.image",
        "triple_brain.ui.edge"
    ],
    function ($, GraphElementMenu, GraphUi, Image, EdgeUi) {
        var api = {};
        api.ofVertex = function (vertex) {
            return new ImageMenu(
                vertex
            );
        };
        return api;
        function ImageMenu(vertex) {
            var self = this;
            var html = $("<div>");
            this.build = function () {
                GraphUi.addHtml(html);
                html.append(form());
                GraphElementMenu.makeForMenuContentAndGraphElement(
                    html,
                    vertex
                );
                return self;
            };

            function form() {
                html.data(
                    "vertex",
                    vertex
                );
                return $(
                    "<form>"
                ).prop(
                    "action",
                        vertex.getUri() + "/image"
                ).prop(
                    "method",
                    "post"
                ).prop(
                    "enctype",
                    "multipart/form-data"
                ).append(
                    uploadLabel()
                ).append(
                    fileInput()
                );
                function uploadLabel() {
                    return $(
                        "<label data-i18n='vertex.menu.image.select'>"
                    );
                }

                function fileInput() {
                    return $(
                        "<input>"
                    ).prop(
                        "type",
                        "file"
                    ).prop(
                        "name",
                        "images"
                    ).prop(
                        "multiple",
                        "multiple"
                    ).data(
                        "vertex",
                        vertex
                    ).data(
                        "formData",
                        new FormData()
                    ).on(
                        "change",
                        function () {
                            var fileInput = $(this),
                                formData = fileInput.data("formData");
                            for (var i = 0; i < this.files.length; i++) {
                                var file = this.files[i];
                                if (!!file.type.match(/image.*/)) {
                                    var reader = new FileReader();
                                    reader.onloadend = function (event) {
                                        showUploadedItem(
                                            event.target.result,
                                            file.fileName
                                        );
                                    };
                                    reader.readAsDataURL(file);
                                    formData.append("images[]", file);
                                }
                            }
                            var vertex = fileInput.data("vertex");
                            $.ajax({
                                url: vertex.getUri() + "/image",
                                type: "POST",
                                data: formData,
                                processData: false,
                                contentType: false,
                                success: function (data) {
                                    vertex.addImages(
                                        Image.arrayFromServerJson(data)
                                    );
                                }
                            });
                        }
                    );
                    function showUploadedItem() {

                    }
                }
            }
        }
    }
);
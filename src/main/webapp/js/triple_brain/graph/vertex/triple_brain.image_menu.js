/*
 * Copyright Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.graph_element_menu",
        "triple_brain.ui.graph",
        "triple_brain.image",
        "triple_brain.mind-map_template"
    ],
    function ($, GraphElementMenu, GraphUi, Image, MindMapTemplate) {
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
                html.append(buildHtml());
                GraphUi.addHtml(html);
                GraphElementMenu.makeForMenuContentAndGraphElement(
                    html,
                    vertex, {
                        width: 400
                    }
                );
                return self;
            };

            function buildHtml() {
                var content = $(MindMapTemplate["image_upload"].merge()).i18n(),
                    $holder = content.find('.holder'),
                    tests = {
                        filereader: typeof FileReader != 'undefined',
                        dnd: 'draggable' in document.createElement('span'),
                        formdata: !!window.FormData,
                        progress: "upload" in new XMLHttpRequest
                    },
                    support = {
                        filereader: content.find(".filereader"),
                        formdata: content.find('.formdata'),
                        progress: content.find('.progress')
                    },
                    acceptedTypes = {
                        'image/png': true,
                        'image/jpeg': true,
                        'image/gif': true
                    },
                    uploadProgress = content.find('.uploadprogress'),
                    fileUploadWithInputContainer = content.find('.upload'),
                    fileUploadInput = fileUploadWithInputContainer.find("input");
                fileUploadInput.data("vertex", vertex);
                $holder.data("vertex", vertex);

                "filereader formdata progress".split(' ').forEach(function (api) {
                    if (tests[api] === false) {
                        support[api].addClass('fail');
                    } else {
                        // FFS. I could have done el.hidden = true, but IE doesn't support
                        // hidden, so I tried to create a polyfill that would extend the
                        // Element.prototype, but then IE10 doesn't even give me access
                        // to the Element object. Brilliant.
                        support[api].addClass('hidden');
                    }
                });
                if (tests.dnd) {
                    var holder = $holder[0];
                    holder.ondragover = function () {
                        $(this).addClass('hover');
                        return false;
                    };
                    holder.ondragend = function () {
                        $(this).removeClass('hover');
                        return false;
                    };
                    holder.ondrop = function (e) {
                        $(this).removeClass('hover');
                        e.preventDefault();
                        readFiles(
                            e.dataTransfer.files,
                            $(this).data("vertex")
                        );
                    };
                    $holder.data("fileUploadInput", fileUploadInput);
                    $holder.click(function(event){
                        event.stopPropagation();
                        $(this).data("fileUploadInput").click();
                    });
                } else {
                    fileUploadWithInputContainer.addClass("hidden");
                }
                fileUploadInput.change(function () {
                    readFiles(
                        this.files,
                        $(this).data("vertex")
                    );
                });
                return content;
                function previewFile(file) {
                    if (tests.filereader === true && acceptedTypes[file.type] === true) {
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            var image = $("<img>");
                            image.attr("src", event.target.result);
                            image.attr("width", 250); // a fake resize
                            $holder.append(image);
                        };

                        reader.readAsDataURL(file);
                    } else {
                        $holder.append(
                                '<p>Uploaded ' + file.name + ' ' + (file.size ? (file.size / 1024 | 0) + 'K' : '')
                        );
                        console.log(file);
                    }
                }

                function readFiles(files, vertex) {
                    var formData = tests.formdata ? new FormData() : null;
                    for (var i = 0; i < files.length; i++) {
                        if (tests.formdata) formData.append('file', files[i]);
                        previewFile(files[i]);
                    }

                    // now post a new XHR request
                    if (tests.formdata) {
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', vertex.getUri() + "/image");
                        xhr.onload = function () {
                            vertex.addImages(
                                Image.arrayFromServerJson(
                                    $.parseJSON(this.response)
                                )
                            );
                            vertex.refreshImages();
                            uploadProgress.val(100);
                            uploadProgress.html(100);
                        };

                        if (tests.progress) {
                            xhr.upload.onprogress = function (event) {
                                if (event.lengthComputable) {
                                    var complete = (event.loaded / event.total * 100 | 0);
                                    uploadProgress.val(complete);
                                    uploadProgress.html(complete);
                                }
                            }
                        }
                        xhr.send(formData);
                    }
                }
            }

        }
    }
);
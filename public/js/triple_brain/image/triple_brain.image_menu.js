/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.graph_element_menu",
        "triple_brain.graph_ui",
        "triple_brain.image",
        "jquery.i18next"
    ],
    function ($, GraphElementMenu, GraphUi, Image) {
        "use strict";
        var api = {};
        api.ofVertex = function (vertex) {
            return new ImageMenu(
                vertex
            );
        };
        api.setup = function(){
            var content = api._getModal(),
                $holder = api._getHolder();
            var tests = {
                    filereader: typeof FileReader !== 'undefined',
                    dnd: 'draggable' in document.createElement('span'),
                    formdata: !!window.FormData,
                    progress: "upload" in new XMLHttpRequest()
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
                uploadProgress = api._getUploadProgress(),
                progressLabel = api._getProgressLabel(),
                fileUploadWithInputContainer = content.find('.upload'),
                fileUploadInput = api._getFileUploadInput();

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
                    if (tests.formdata){
                        formData.append('file', files[i]);
                    }
                    previewFile(files[i]);
                }

                // now post a new XHR request
                if (tests.formdata) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', vertex.getUri() + "/image");
                    xhr.onload = function () {
                        vertex.addImages(
                            Image.arrayFromServerJson(
                                JSON.parse(this.response)
                            )
                        );
                        vertex.refreshImages();
                        uploadProgress.val(100);
                        progressLabel.text(100);
                    };

                    if (tests.progress) {
                        xhr.upload.onprogress = function (event) {
                            if (event.lengthComputable) {
                                var complete = (event.loaded / event.total * 100 | 0);
                                uploadProgress.val(complete);
                                progressLabel.text(complete);
                            }
                        };
                    }
                    xhr.send(formData);
                }
            }
        };
        function ImageMenu(vertex) {
            this.build = function () {
                api._getFileUploadInput().data("vertex", vertex).val("");
                api._getHolder().data("vertex", vertex).empty();
                api._getUploadProgress().val(0);
                api._getProgressLabel().empty();
                api._getModal().modal();
                return this;
            };
        }
        api._getUploadProgress = function(){
            return api._getModal().find('.uploadprogress');
        };
        api._getProgressLabel = function(){
            return api._getModal().find('.progress-label');
        };
        api._getFileUploadInput = function(){
            return api._getModal().find('.upload').find("input");
        };
        api._getHolder = function(){
            return api._getModal().find('.holder');
        };
        api._getModal = function(){
            return $("#image-menu");
        };
        return api;
    }
);
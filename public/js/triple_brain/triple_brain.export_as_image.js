///*
// * Copyright Vincent Blouin under the GPL License version 3
// */
//
//define([
//    "jquery"
//], function ($) {
//    "use strict";
//    var api = {};
//    api.download = function () {
//        getIt();
//    };
//    function getIt() {
//        var head = $("head").clone();
//        head.find("script").remove();
//        head.find("link").each(function(){
//            var link = $(this);
//            link.attr(
//                "href",
//                window.location.protocol + "//" + window.location.host + link.attr("href")
//            );
//        });
//        var mindmapHtml = $("<html>").append(
//            $("<head>").append(head.html()),
//            $("<body class='print'>").append($("#drawn_graph").prop('outerHTML'))
//            //$("body").clone().addClass("print").prop("outerHTML")
//
//        );
//        $.ajax({
//            type: 'POST',
//            url: "/node-service/html-to-image",
//            data: {
//                html: mindmapHtml.prop('outerHTML')
//            }
//        }).success(function (filePath) {
//            console.log(filePath);
//        });
//    }
//
//    return api;
//});
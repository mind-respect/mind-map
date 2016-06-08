/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    'jquery.safer-html'
], function ($) {
    "use strict";
    describe("safer-html", function () {
        it("does not empty html if no threat", function () {
            var $div = $("<div>").saferHtml(
                "<strong>hello</strong>"
            );
            expect(
                $div.html()
            ).toBe(
                "<strong>hello</strong>"
            );
        });
        it("empties html if has script", function () {
            var $div = $("<div>").saferHtml(
                "<script>alert('test')</script>"
            );
            expect(
                $div.html()
            ).toBe(
                ""
            );
        });
        it("empties html if has iframe", function () {
            var $div = $("<div>").saferHtml(
                "<iframe></iframe>"
            );
            expect(
                $div.html()
            ).toBe(
                ""
            );
        });
        it("empties html if has img", function () {
            // var alertSpy = spyOn(window, "alert");
            var $div = $("<div>").saferHtml(
                "<img src='a' onerror=\"alert.log('test')\">"
            );
            expect(
                $div.html()
            ).toBe(
                ""
            );
            // expect(alertSpy).not.toHaveBeenCalled();
        });
    });
});
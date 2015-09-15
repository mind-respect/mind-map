/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    'jquery.max_char'
], function ($) {
    "use strict";
    describe("max_char", function () {
        var editable,
            defaultMaxChar = 30;

        beforeEach(function () {
            editable = $("<div contenteditable='true'>");
        });

        it("wraps after max char", function () {
            expect(
                getNumberOfLines(editable.text())
            ).toBe(0);
            addNumberOfChars(editable, defaultMaxChar + 1);
            editable.maxChar();
            expect(
                getNumberOfLines(editable.text())
            ).toBe(1);
        });

        it("wraps at exact position for next lines", function () {
            addNumberOfChars(editable, defaultMaxChar * 2);
            editable.maxChar();
            expect(
                getNumberOfLines(editable.text())
            ).toBe(1);

            addNumberOfChars(editable, 1);
            editable.maxChar();
            expect(
                getNumberOfLines(editable.text())
            ).toBe(2);
        });

        it("wraps before whole words", function () {
            var word = "music",
                spaceLength = 1;
            addNumberOfChars(editable, defaultMaxChar + 1 - (word.length + spaceLength));
            editable.append(" music");
            editable.maxChar();
            expect(
                contentOfLineNumber(editable.text(), 2)
            ).toBe(word);
        });

        function addNumberOfChars(target, number){
            var string = [];
            for(var i = 0 ; i < number; i++){
                string.push("p");
            }
            target.append(string.join(""));
        }

        function contentOfLineNumber(text, lineNumber){
            return text.split("\n")[lineNumber - 1];
        }

        function getNumberOfLines(string){
            return string.split("\n").length - 1;
        }
    });
});
/*
 * Copyright Mozilla Public License 1.1
 */

define(['dummy'], function(dummy) {
    describe("Dummy", function() {
        it("simple", function() {
            expect(dummy.patate).toBe('agrume');
        });
    });
});

//define("dummy", function(dummy) {
//    describe("dummy.patate", function() {
//        it("should return agrume", function() {
//            expect(dummy.patate()).toBe("agrume");
//        });
//    });
//});
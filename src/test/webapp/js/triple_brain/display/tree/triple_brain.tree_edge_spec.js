/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'test/webapp/js/test-scenarios'
], function (Scenarios) {
    "use strict";
    describe("bubble", function(){
        var edge1,
            child1;
        beforeEach(function () {
            var scenario = new Scenarios.threeBubblesGraph();
            edge1 = scenario.getRelation1InTree();
            child1 = scenario.getBubble1();
        });
        it("can get child vertex in display", function(){
            expect(
                edge1.childVertexInDisplay().getUri()
            ).toBe(child1.getUri())
        });

        it("can get child vertex in display even if inverse", function(){

        });
    });
});
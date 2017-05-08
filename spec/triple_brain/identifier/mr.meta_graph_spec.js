define([
    'jquery',
    'test/test-scenarios',
    'test/test-utils',
    'test/mock',
    'mr.meta_graph'
], function ($, Scenarios, TestUtils, Mock, MetaGraph) {
    "use strict";
    describe("meta-graph", function () {
        beforeEach(function () {
            Mock.applyDefaultMocks();
        });
        it("can get the meta center identifier", function(){
            var scenario = new Scenarios.aroundEventIdentifier();
            var graph = scenario.getGraph();
            var metaGraph = MetaGraph.fromServerFormatAndCenterUri(
                graph,
                scenario.getCenterBubbleUri()
            );
            var metaCenter = metaGraph.getMetaCenter(
                graph
            );
            expect(
                metaCenter.getExternalResourceUri()
            ).toBe("http://rdf.freebase.com/rdf/time/event");
            expect(
                metaCenter.getLabel()
            ).toBe("Event");
        });
    });
});
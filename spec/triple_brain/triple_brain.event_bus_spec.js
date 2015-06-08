/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.event_bus"
], function ($, EventBus) {
    "use strict";
    describe("event_bus", function () {
        beforeEach(function () {
            EventBus.reset();
        });
        it("can subscribe to perform an action before an event occurs", function () {
            EventBus.before("some_event", function (object) {
                var deferred = $.Deferred();
                object.other_test_key = "other_test_value";
                deferred.resolve();
                return deferred.promise();
            });
            var object = {
                    "test_key": "test_value"
                },
                hasExecuted = false;
            EventBus.executeAfterForEvent("some_event",
                function () {
                    hasExecuted = true;
                    expect(object.other_test_key).toBe("other_test_value");
                },
                object
            );
            expect(hasExecuted).toBe(true);
        });
        it("can use an multiple params when subscription perform an action before an event occurs", function () {
            EventBus.before("some_event", function (object1, object2) {
                var deferred = $.Deferred();
                object1.param1_other_test_key = "param1_other_test_value";
                object2.param2_other_test_key = "param2_other_test_value";
                deferred.resolve();
                return deferred.promise();
            });
            var object1 = {
                    object_1_test_key: "object1_test_value"
                },
                object2 = {
                    object_2_test_key: "object2_test_value"
                };
            var hasExecuted = false;
            EventBus.executeAfterForEvent("some_event",
                function () {
                    hasExecuted = true;
                    expect(object1.param1_other_test_key).toBe("param1_other_test_value");
                    expect(object2.param2_other_test_key).toBe("param2_other_test_value");
                },
                [object1, object2]
            );
            expect(hasExecuted).toBe(true);
        });
        it("can have multiple subscriber who perform an action before an event occurs", function () {
            EventBus.before("some_event", function (object) {
                var deferred = $.Deferred();
                object.other_test_key = "other_test_value";
                deferred.resolve();
                return deferred.promise();
            });
            EventBus.before("some_event", function (object) {
                var deferred = $.Deferred();
                object.second_test_key = "second_test_value";
                deferred.resolve();
                return deferred.promise();
            });
            var object = {
                "test_key": "test_value"
            };
            var hasExecuted = false;
            EventBus.executeAfterForEvent("some_event",
                function () {
                    hasExecuted = true;
                    expect(object.other_test_key).toBe("other_test_value");
                    expect(object.second_test_key).toBe("second_test_value");
                },
                object
            );
            expect(hasExecuted).toBe(true);
        });
        it("executes when no promises for event", function () {
            var hasExecuted = false;
            EventBus.executeAfterForEvent("inexisting_event",
                function () {
                    hasExecuted = true;
                },
                {}
            );
            expect(hasExecuted).toBe(true);
        });
    });
});
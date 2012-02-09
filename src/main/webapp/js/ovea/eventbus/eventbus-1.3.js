/*
 * Copyright (C) 2011 Ovea <dev@ovea.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
if (window.EventBus == undefined) {

    EventBus = function(options) {
        this.options = {
            name: "no-name",
            onPublish: function() {
                this.fire.apply(this, arguments);
            },
            onSubscribe: function(callback) {
            },
            onUnsubscribe: function(callback) {
            },
            onTopicEmpty: function() {
            },
            onBatchEnd: function() {
            }
        };
        if (options)
            for (var p in options)
                this.options[p] = options[p];
        this.batches = 0;
        this.logger = new Logger(this.options.name);
        this._topics = {};
    };

    EventBus.Topic = function(bus, topicName) {
        this.bus = bus;
        this.name = topicName;
        this.subscribers = [];
    };

    EventBus.Topic.prototype = {
        subscribe: function(callback) {
            var logger = this.bus.logger;
            if (!this.isRegistered(callback)) {
                logger.debug('Adding subscription to ' + this.name);
                this.subscribers.push(callback);
                this.bus.options.onSubscribe.call(this, callback);
            }
        },
        unsubscribe: function(callback) {
            if (callback) {
                for(var i=0; i<this.subscribers.length;) {
                    if(this.subscribers[i] == callback) {
                        this.bus.logger.debug('Removing subscription to ' + this.name);
                        this.subscribers.splice(i, 1);
                        this.bus.options.onUnsubscribe.call(this, callback);
                        if (!this.subscribers.length) {
                            this.bus.options.onTopicEmpty.call(this);
                        }
                    } else {
                        i++;
                    }
                }
            } else {
                this.subscribers = [];
                this.bus.options.onTopicEmpty.call(this);
            }
        },
        isRegistered: function(callback) {
            for(var i in this.subscribers) {
                if(this.subscribers[i] == callback) {
                    return true;
                }
            }
            return false;
        },
        publish: function() {
            this.bus.logger.debug('Publishing to ' + this.name);
            this.bus.options.onPublish.apply(this, arguments)
        },
        fire: function() {
            for (var i in this.subscribers)
                this.subscribers[i].apply(this, arguments);
        }
    };

    EventBus.prototype = {
        topic: function(name) {
            if (this._topics[name] == undefined)
                this._topics[name] = new EventBus.Topic(this, name);
            return this._topics[name];
        },
        topics: function() {
            if (arguments.length == 0) {
                var result = [];
                for (var topic in this._topics)
                    result.push(this._topics[topic])
                return result;
            } else {
                var bus = this;
                var selection = [];
                for (var i = 0; i < arguments.length; i++)
                    selection.push(this.topic(arguments[i]))
                return {
                    subscribe: function(callback) {
                        try {
                            bus.startBatch();
                            for (var i in selection)
                                selection[i].subscribe(callback);
                            return this;
                        } finally {
                            bus.endBatch();
                        }
                    },
                    unsubscribe: function(callback) {
                        try {
                            bus.startBatch();
                            for (var i in selection)
                                selection[i].unsubscribe(callback);
                            return this;
                        } finally {
                            bus.endBatch();
                        }
                    },
                    publish: function(data) {
                        try {
                            bus.startBatch();
                            for (var i in selection)
                                selection[i].publish(data);
                            return this;
                        } finally {
                            bus.endBatch();
                        }
                    }
                };
            }
        },
        start: function() {
        },
        stop: function() {
        },
        batch: function(func) {
            try {
                this.startBatch();
                func.call(this);
            } finally {
                this.endBatch();
            }
        },
        startBatch: function() {
            this.batches++;
        },
        endBatch: function() {
            this.batches--;
            if (this.batches <= 0) {
                this.batches = 0;
                this.options.onBatchEnd.call(this);
            }
        }
    };

}

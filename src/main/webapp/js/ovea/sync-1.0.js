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
if (!('SyncAsync' in window)) {
    (function() {

        window.SyncAsync = function(opts) {
            this.name = opts && opts.name || 'SyncAsync';
            this.trigger = opts && opts.trigger == 'once' ? 'once' : 'each';
            this.callbacks = [];
            this.resolved = false;
            this.syncs = [];
        };

        window.SyncAsync.prototype = {

            toString: function() {
                return this.name;
            },

            newCallback: function(ret) {
                var self = this;
                var i = this.callbacks.length;
                var cb = function() {
                    self.callbacks[i].ctx = this;
                    self.callbacks[i].arg = arguments;
                    self.callbacks[i].calls++;
                    if (self.resolved && self.trigger == 'each') {
                        for (var j in self.syncs) {
                            self.syncs[j].apply(self, self.callbacks);
                        }
                    } else if (!self.resolved) {
                        var r = true;
                        for (var k in self.callbacks) {
                            if (self.callbacks[k].calls == 0) {
                                r = false;
                                break;
                            }
                        }
                        if (r) {
                            for (var l in self.syncs) {
                                self.syncs[l].apply(self, self.callbacks);
                            }
                            if (self.trigger == 'once') {
                                self.syncs = [];
                            }
                        }
                        self.resolved = r;
                    }
                    if (ret != undefined && typeof ret == 'function') {
                        return ret.apply(this, arguments);
                    } else if (ret != undefined) {
                        return ret;
                    }
                };
                this.callbacks.push({
                    calls: 0
                });
                return cb;
            },

            sync: function(func) {
                if (this.resolved) {
                    func.apply(this, this.callbacks);
                } else {
                    this.syncs.push(func);
                }
                return this;
            }
        };

    })();
}

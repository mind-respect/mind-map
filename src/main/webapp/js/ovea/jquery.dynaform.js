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
(function($) {
    $.fn.dynaForm = function() {
        var set = this;
        return {
            toJSON: function(selector) {
                var json = {};
                var fields = set.find(selector || ':input:enabled');
                $.each(fields.serializeArray(), function() {
                    var val = this.value;
                    if (json[this.name] !== undefined) {
                        if (!json[this.name].push) {
                            json[this.name] = [json[this.name]];
                        }
                        json[this.name].push(val);
                    } else if (this.value !== '') {
                        json[this.name] = val;
                    }
                });
                // force array for multiple selects
                fields.filter('select[multiple]').each(function() {
                    if (json[this.name] !== undefined && !json[this.name].push) {
                        json[this.name] = [json[this.name]];
                    }
                });
                // force array for multiple checkboxes with same name
                var counts = {};
                fields.filter(':checkbox').each(function() {
                    counts[this.name] = (counts[this.name] || 0) + 1
                });
                for (var name in counts) {
                    if (counts[name] > 1 && json[name] !== undefined && !json[name].push) {
                        json[name] = [json[name]];
                    }
                }
                return json;
            },
            fromJSON: function(values) {
                if (values) {
                    for (var key in values) {
                        set.find(':input[name=' + key + ']').each(function() {
                            var self = $(this);
                            switch (this.nodeName.toLowerCase()) {
                                case 'select':
                                {
                                    var vals = values[key];
                                    if (!$.isArray(vals)) {
                                        vals = [vals];
                                    }
                                    self.find('option').filter(
                                        function() {
                                            return $.inArray(this.value, vals) != -1;
                                        }).attr('selected', true).trigger('click');
                                    self.trigger('change');
                                    break;
                                }
                                case 'textarea': {
                                    self.val(values[key]).trigger('change');
                                    break;
                                }
                                case 'input':
                                {
                                    switch (this.type.toLowerCase()) {
                                        case 'text':
                                        {
                                            self.val(values[key]).trigger('change');
                                            break;
                                        }
                                        case 'radio':
                                        {
                                            if(this.value == values[key]) {
                                                if(!$.browser.mozilla) {
                                                    self.prop('checked', true).trigger('change');
                                                } else {
                                                    self.prop('checked', true).trigger('click').trigger('change');
                                                }
                                            }
                                            break;
                                        }
                                        case 'checkbox':
                                        {
                                            var vals = values[key];
                                            if (!$.isArray(vals)) {
                                                vals = [vals];
                                            }
                                            if($.inArray(this.value, vals) != -1) {
                                                if(!$.browser.mozilla) {
                                                    self.prop('checked', true).trigger('change');
                                                } else {
                                                    self.prop('checked', true).trigger('click').trigger('change');
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                return set;
            }
        }
    }
})(jQuery);
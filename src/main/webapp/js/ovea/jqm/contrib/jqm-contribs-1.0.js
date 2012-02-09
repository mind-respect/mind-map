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
require("Logger", "Store", "jQuery.mobile");

if (window.jqmcontrib == undefined) {

    (function($) {

        var logger = new Logger('jqm-contribs');

        var storage = new Store({
            order: ['html5', 'cookie', 'page']
        });

        var target;

        window.jqmcontrib = {

            bridge: function(bus) {
                $('div[id][data-role=page]').live({
                    'pagebeforeshow': function(event, ui) {
                        var page = $(event.target);
                        var name = page.attr('id');
                        logger.debug('pagebeforeshow => ' + name);
                        bus.topic('/event/ui/view/beforeshow').publish(page);
                        bus.topic('/event/ui/view/beforeshow/' + name).publish(page, event, ui);
                    },
                    'pagecreate': function(event, ui) {
                        var page = $(event.target);
                        var name = page.attr('id');
                        logger.debug('pagecreate => ' + name);
                        bus.topic('/event/ui/view/create').publish(page);
                        bus.topic('/event/ui/view/create/' + name).publish(page, event, ui);
                    },
                    'pageshow': function(event, ui) {
                        var page = $(event.target);
                        var name = page.attr('id');
                        logger.debug('pageshow => ' + name);
                        bus.topic('/event/ui/view/show').publish(page);
                        bus.topic('/event/ui/view/show/' + name).publish(page, event, ui);
                    },
                    'pagehide': function(event, ui) {
                        var page = $(event.target);
                        var name = page.attr('id');
                        logger.debug('pagehide => ' + name);
                        bus.topic('/event/ui/view/hide/' + name).publish(page, event, ui);
                    }
                });

                $(function() {
                    bus.topic('/event/dom/loaded').publish();
                });

                var old_pageLoading = $.mobile.pageLoading;
                $.mobile.pageLoading = function(done) {
                    if (done) {
                        old_pageLoading.apply(this, arguments);
                        bus.topic('/event/ui/loading/stopped').publish();
                    } else {
                        bus.topic('/event/ui/loading/starting').publish();
                        old_pageLoading.apply(this, arguments);
                    }
                };
            }

        };

        // Navigation Object
        window.jqmcontrib.Navigation = function(bus) {

            var self = this;
            this.restoring = false;

            function restoreState() {
                var opts = storage.del('bookmark');
                if (opts) {
                    logger.debug('Restoring: {o}', {o: opts});
                    self.restoring = true;
                    try {
                        bus.topic('/event/navigation/restoring').publish(opts);
                        if (opts.to) {
                            self.changePage(opts.to);
                        }
                    } finally {
                        self.restoring = false;
                        logger.debug('Restore finished');
                    }
                }
            }

            bus.topics('/event/ui/view/beforeshow').subscribe(function(page) {
                target = page;
                if (!self.restoring) {
                    restoreState();
                }
            });

            bus.topic('/event/dom/loaded').subscribe(function() {
                restoreState();
            });

        };

        window.jqmcontrib.Navigation.prototype = {

            changePage: function(name, bookmark) {
                logger.debug('Changing page to: ' + name);
                $.mobile.changePage(name + '.html', 'none');
                if (bookmark) {
                    logger.debug('Setting bookmark: ' + bookmark);
                    storage.set('bookmark', {
                        from: this.pageName(),
                        bookmark: bookmark
                    });
                }
            },

            pageName: function() {
                var id;
                if (target) {
                    id = target.attr('id');
                }
                if (!id) {
                    id = $('body div[data-role=page]:visible').attr('id');
                }
                if (!id) {
                    throw new Error('Current page name not found');
                }
                return id;
            },

            page: function() {
                var p = target || $('body div[data-role=page]:visible');
                if (p.length) {
                    return p;
                }
                throw new Error('Current page not found');
            },

            redirect: function(location, opts) {
                logger.debug('Redirecting to: ' + location);
                if (opts) {
                    opts = $.extend({
                        from: this.pageName()
                    }, opts);
                    logger.debug('Setting bookmark ' + opts.bookmark + ' to page ' + opts.to);
                    storage.set('bookmark', opts);
                }
                window.location = location;
            }
        }
    })(jQuery);

}



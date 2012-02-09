require("Logger", "options.ws.resource", "I18N", "Store", "options.locale", "triple_brain.bus.local", "options.bundleName");

if (triple_brain.i18n == undefined) {
    (function($) {

        var logger = new Logger('triple_brain.i18n');
        var store = new Store({
            order: ['cookie'],
            days: 30
        });
        var bundle = new I18N({
            url: options.ws.resource + '/i18n',
            bundle: options.bundleName,
            supportedLocales: ['fr', 'en'],
            defaultLocale: 'en',
            onKeyFound: function(elem, key, value) {
                if (elem.prop('tagName').toUpperCase() == 'INPUT') {
                    if (elem.prop('placeholder') && value)
                        elem.prop('placeholder', value);
                    else
                        elem.val(value);
                }
                else if (elem.prop('tagName').toUpperCase() == 'A' && elem.attr('data-role') == 'button')
                    elem.find('.ui-btn-text').html(value);
                else if (elem.prop('tagName').toUpperCase() == 'BUTTON')
                    elem.parent().find('.ui-btn-text').html(value);
                else
                    elem.text(value);
            }
        });

        triple_brain.i18n = {

            locale: function () {
                return store.get('LOCALE') || options.locale;
            },

            page: function(page, locale) {
                if(options.debug && (!page.attr || !page.attr('id'))) {
                    alert('<< DEBUG MODE MESSAGE >>\n\ntriple_brain.i18n.page(x) => x has no "id" attribute !');
                    console.error('triple_brain.i18n.page(arguments) : arguments = ', arguments);
                }
                bundle.localize('#' + page.attr('id') + ' [rel*=localize]', locale || triple_brain.i18n.locale());
            },

            message: function(key, locale) {
                return locale ?
                        bundle.value(key, locale) :
                        bundle.value(key, triple_brain.i18n.locale());
            },

            bundle: function () {
                return bundle;
            }

        };

        triple_brain.bus.local.topics('/event/ui/view/create').subscribe(function(view) {
            logger.debug('Reloading i18n for page/view: ' + view.attr('id'));
            triple_brain.i18n.page(view);
        });

    })(jQuery);
}

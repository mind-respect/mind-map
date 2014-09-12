/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

(function($)
{
    function bind(org_cometd, cookie, ReloadExtension, cometd)
    {
        // Remap cometd COOKIE functions to jquery cookie functions
        // Avoid to set to undefined if the jquery cookie plugin is not present
        if (cookie)
        {
            org_cometd.COOKIE.set = cookie;
            org_cometd.COOKIE.get = cookie;
        }

        var result = new ReloadExtension();
        cometd.registerExtension('reload', result);
        return result;
    }

    if (typeof define === 'function' && define.amd)
    {
        define(['org/cometd', 'jquery.cookie', 'org/cometd/ReloadExtension', 'jquery.cometd'], bind);
    }
    else
    {
        bind(org.cometd, $.cookie, org.cometd.ReloadExtension, $.cometd);
    }
})(jQuery);

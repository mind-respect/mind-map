(function($) {

    var sessionCookie = window.SESSION_COOKIE_NAME || "jsessionid";

    var urlParseRE = /^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

    function parseUrl(url) {
        if ($.type(url) === "object") {
            return url;
        }
        var u = url || "", matches = urlParseRE.exec(url), results;
        if (matches) {
            results = {
                href:         matches[0] || "",
                hrefNoHash:   matches[1] || "",
                hrefNoSearch: matches[2] || "",
                domain:       matches[3] || "",
                protocol:     matches[4] || "",
                authority:    matches[5] || "",
                username:     matches[7] || "",
                password:     matches[8] || "",
                host:         matches[9] || "",
                hostname:     matches[10] || "",
                port:         matches[11] || "",
                pathname:     matches[12] || "",
                directory:    matches[13] || "",
                filename:     matches[14] || "",
                search:       matches[15] || "",
                hash:         matches[16] || ""
            };
        }
        return results || {};
    }

    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch(e) {
        }
    }

    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch(e) {
        }
    }

    function createXDR() {
        try {
            var xdr = new window.XDomainRequest();
            if (!xdr.setRequestHeader) {
                xdr.setRequestHeader = $.noop;
            }
            if (!xdr.getAllResponseHeaders) {
                xdr.getAllResponseHeaders = $.noop;
            }
            var open = xdr.open;
            xdr.open = function() {
                var cookie = new RegExp('(?:^|; )' + sessionCookie + '=([^;]*)', 'i').exec(document.cookie);
                cookie = cookie && cookie[1];
                if (cookie) {
                    var q = arguments[1].indexOf('?');
                    if (q == -1) {
                        arguments[1] += ';' + sessionCookie + '=' + cookie;
                    } else {
                        arguments[1] = arguments[1].substring(0, q) + ';' + sessionCookie + '=' + cookie + arguments[1].substring(q);
                    }
                }
                return open.apply(this, arguments);
            };
            xdr.onload = function() {
                if (typeof xdr.onreadystatechange === 'function') {
                    xdr.readyState = 4;
                    xdr.status = 200;
                    xdr.onreadystatechange.call(xdr, null, false);
                }
            };
            xdr.onerror = xdr.ontimeout = function() {
                if (typeof xdr.onreadystatechange === 'function') {
                    xdr.readyState = 4;
                    xdr.status = 500;
                    xdr.onreadystatechange.call(xdr, null, false);
                }
            };
            return xdr;
        } catch(e) {
        }
    }

    if ($.browser.msie && window.XDomainRequest) {
        $.support.cors = true;
        $.ajaxSettings.xhr = function() {
            return parseUrl(this.url).domain === parseUrl(document.location.href).domain ?
                window.ActiveXObject && !this.isLocal && createStandardXHR() || createActiveXHR() :
                createXDR();
        };
    } else if (window.ActiveXObject) {
        $.ajaxSettings.xhr = function() {
            return !this.isLocal && createStandardXHR() || createActiveXHR();
        };
    } else {
        $.ajaxSettings.xhr = createStandardXHR;
    }

})(jQuery);

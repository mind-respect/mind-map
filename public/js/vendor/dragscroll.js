/*
 * https://github.com/asvd/dragscroll
 *
 *  modified for bubl.guru added global disable option so that inner components
 *  can still be dragged
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.dragscroll = {}));
    }
}(this, function (exports) {
    var _window = window;
    var _document = document;
    var mousemove = 'mousemove';
    var mouseup = 'mouseup';
    var mousedown = 'mousedown';
    var EventListener = 'EventListener';
    var addEventListener = 'add'+EventListener;
    var removeEventListener = 'remove'+EventListener;
    var _globalDisabled = false;

    var dragged = [];
    var reset = function(i, el) {
        for (i = 0; i < dragged.length;) {
            el = dragged[i++];
            el[removeEventListener](mousedown, el.md, 0);
            _window[removeEventListener](mouseup, el.mu, 0);
            _window[removeEventListener](mousemove, el.mm, 0);
        }
        dragged = _document.getElementsByClassName('dragscroll');
        for (i = 0; i < dragged.length;) {
            (function(el, lastClientX, lastClientY, pushed){
                el[addEventListener](
                    mousedown,
                    el.md = function(e) {
                        if(_globalDisabled){
                            return;
                        }
                        pushed = 1;
                        lastClientX = e.clientX;
                        lastClientY = e.clientY;

                        /*
                        removed e.preventDefault() for bubl.guru because many default behaviors
                        like clicking on inputs became disabled. todo Should put back eventually because
                        I think not calling e.preventDefault(); breaks a little the dragscroll but it's still acceptable
                        */
                        //e.preventDefault();
                        e.stopPropagation();
                    }, 0
                );
                 
                 _window[addEventListener](
                     mouseup, el.mu = function() {pushed = 0;}, 0
                 );
                 
                _window[addEventListener](
                    mousemove,
                    el.mm = function(e, scroller) {
                        scroller = el.scroller||el;
                        if (pushed && !_globalDisabled) {
                             scroller.scrollLeft -=
                                 (- lastClientX + (lastClientX=e.clientX));
                             scroller.scrollTop -=
                                 (- lastClientY + (lastClientY=e.clientY));
                        }
                    }, 0
                );
             })(dragged[i++]);
        }
    };

    /*
      bubl.guru always calls it manually
    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window[addEventListener]('load', reset, 0);
    }
    */
    exports.reset = reset;
    exports.enable = function(){
        _globalDisabled = false;
    };
    exports.disable = function(){
        _globalDisabled =true;
    };
}));


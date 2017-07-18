Array.max = function(arr){
	return Math.max.apply(Math,arr);
};
Array.min = function(arr){
	return Math.min.apply(Math,arr);
};

var oldweb = function(){
	var htmlDom = ["article","aside","details","figcaption","figure","footer","header","hgroup","menu","nav","section"];
	for(var i=0; i<htmlDom.length; i++){
		document.createElement(htmlDom[i]);
	};
};

function loadings(loadobj){
	$(loadobj).css({"width":$(window).width()+"px","height":$(document).height()+"px","backgroundPosition":"50% "+($(window).height()-31)/2+"px"});
	$(window).resize(function(){
		$(loadobj).css({"width":$(window).width()+"px","height":$(document).height()+"px","backgroundPosition":"50% "+($(window).height()-31)/2+"px"});	
	});
};

function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
        Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
};



//事件操作
;(function($){
    var TOUCHSTART,TOUCHEND,TOUCHMOVE;
    if(typeof(window.ontouchstart) != "undefined") {
        TOUCHSTART  = "touchstart";
        TOUCHEND    = "touchend";
        TOUCHMOVE   = "touchmove";
    }else if(typeof(window.onmspointerdown) != "undefined") {
        TOUCHSTART  = "MSPointerDown";
        TOUCHEND    = "MSPointerUp";
        TOUCHMOVE   = "MSPointerMove";
    }else{
        TOUCHSTART  = "mousedown";
        TOUCHEND    = "mouseup";
        TOUCHMOVE   = "mousemove";
    };
    $.fn.extend({
        tapdown : function(callback){
            return this.each(function(){
                $(this).unbind(TOUCHSTART).bind(TOUCHSTART,callback);
            });
        },
        tapmove : function(callback){
            return this.each(function(){
                $(this).unbind(TOUCHMOVE).bind(TOUCHMOVE,callback);
            });
        },
        tapup : function(callback){
            return this.each(function(){
                $(this).unbind(TOUCHEND).bind(TOUCHEND,callback);
            });
        }
    });
})(jQuery);

//dom ready complete
function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != "function") {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        };
    };
};


/*var oMobile = /iphone|ipod|ipad|android|blackberry|opera|mini|smartphone|iemobile/i.test(navigator.userAgent.toLowerCase());

document.addEventListener("DOMContentLoaded",function(){
    if(oMobile){    //移动端
        window.scrollTo(0, 1);
        var oCss = document.getElementById("css_compatible");
        oCss.href = "css/mobile.css";
    }else{
        $(window).scrollTop(0,1);
    };
},false);

function scrolltol() {
    setTimeout(function() {
        window.scrollTo(0, 1)
    },0);
}
addLoadEvent(function() {
    if (document.documentElement.scrollHeight <= document.documentElement.clientHeight) {
        bodyTag = document.getElementsByTagName('body')[0];
        bodyTag.style.height = document.documentElement.clientWidth / screen.width * screen.height + 'px';
    }
    setTimeout(function() {
        window.scrollTo(0, 1)
    },0);
});*/



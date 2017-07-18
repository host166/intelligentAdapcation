// intelligent - v1.4.1
// data : 2015-11-11
// http://www.aitiantai.com/
// Copyright 2013-2016, 2016 intelligent, Inc. and other contributors; Licensed MIT

// cssVsion : 设置版本号 避免重复请求 --- 用于本地缓存 本地缓存 localStorage||cookie 0：版本号； 1：是否开启 2：计算周期设置存储
// showWay :[0]适配模式：showall是按宽度适配 noborder是按高度适配; [1]宽度适配下是否开启全局无限适配模式
// cssurl  :css文件路径地址 后面跟上",html"则是本地获取方式
// design  :设计页面的尺寸 
// oMobile :是否开启手机显示("config"进入调试模式)
// oScreen :是否开启跟随屏幕变化
// fsMin   :[1]设置文字最小值操作,默认不开启。[1]设置最小字体大小 默认11px
// rounding:开启四舍五入模式
// backUrl :设置背景图片链接的属性 默认是true；true => 重组的意思
//          1.default：常规默认的处理方式 第二个添加图片的绝对路径即可；
//          2.relative：当前页面可以相对于背景直接请求；例如：(../images/1.jpg)直接去掉../；
//          3.intelligent；智能添加图片地址(原理是搜索计算机图片路径进行添加)
//          4.如果填写"相关地址",则只替换当前背景图片的链接地址，不执行拆分操作(暂无实现)
// prefix  :设置css3中代码的前缀属性。例如：-webkit、-moz等;默认是true = 开启状态
// proportion : 比例变化的设置 -- 按宽度计算or按高度计算
// designSize : 开启按高度比例进行适配的时候 执行此方法 0为默认 需要填写设计稿 h/w的比值
// allCodeShow : 追加显示没有被处理的代码 基于/*startdom*/ || /*enddom*/之前和之后的部分 默认为false
// callback : 新建完成之后添加的回调事件
// fn : 用于智能响应式布局工具第一次处理完成后的回调方法 不参与设备翻转

//高度适配模式分以下几种情况
//1.高度适配是否开启
//2.css中是否存在指定要高度适配的代码片段 /*noborderstart(number)*/ /*noborderend(number)*/
//3.css中有没有@media ··· (max-width:640)的标签
//4.css中如果两者标签都没有 则直接执行高度适配
//5.css中如果存在标签，并且判断开启是否要在pc、移动端哪端执行

//智能控件辅助工具
var intelligentAuxiliary = {
    oMobile : /iphone|ipod|ipad|android|newsmy|blackberry|opera|mini|smartphone|iemobile/i.test(navigator.userAgent.toLowerCase()), //判断是不是移动端
    orientationJson : {},    //移动端翻转设备时的json队列
    orientationFunc : function(name,fn){   //主要用于移动端翻转设备时的处理
        this.orientationJson[name] = fn;

        var timer = "",
            _this = this;
        if (typeof window.onorientationchange == "undefined") {
            window.onresize = function(){
                clearTimeout(timer);
                timer = setTimeout(function() {
                    for( var x in _this.orientationJson){
                        _this.orientationJson[x]();
                    };
                },50);
            };
        } else {
            window.onorientationchange = function() {
                if (window.orientation == 0 || window.orientation == 180 || window.orientation == 90 || window.orientation == -90) {
                    for( var x in _this.orientationJson){
                        _this.orientationJson[x](window.orientation);
                    };
                };
            };
        };
    },
    loadimg : function(obj,fn){   //用于处理图片是否加载完成
        var appname = navigator.appName.toLowerCase();
        if( appname.indexOf("netscape") == -1 ){  //IE
            obj.onreadystatechange = function () {
                if( obj.readyState == "complete" ){
                    fn();
                };
            };
        }else{
            obj.onload = function () {
                if( obj.complete == true ){
                    fn();
                };
            };
            // obj.onerror = function(){
            //     try{
            //         fn();
            //     }catch(err){
            //         return false;
            //     }
            // };
        };
    }
};

//智能适配工具原型(jQuery)
var intelligentRany = (function(){
    function F(config){
        this.option = { //出厂设置
            cssVsion : ["",false],
            showWay  : ["showall",false],
            isMobile : "config",
            prefix   : true,
            rounding : false,
            fsMin    : [false,11],
            cssurl   : [false,""],
            design   : [640,1136],
            backUrl  : ["default","",true],
            callback : function(){},
            fn : function(){}
        };
        for( var i in config ){
            this.option[i] = config[i];
        };

        //原生indexOf方法 IE兼容
        if(!Array.indexOf) {    //indexOf ie兼容
            Array.prototype.indexOf = function(obj) {
                for (var i = 0; i < this.length; i++) {
                    if (this[i] == obj) {
                        return i;
                    };
                };
                return -1;
            };
        };

        //当前全局的变量
        //this.original_css = ""; //存储css数据用

        this.commenfunc();
    };

    //初始化的方法集合
    F.prototype.commenfunc = function(){
        var _this = this,
            options = this.option,
            _locStorJson = {},
            locStorName = "CHANG_HTMLCSS_LOCALSTORAGE";    //localStorage的参数名
        
        // localStorage[locStorName] = "1";
        // localStorage.removeItem(locStorName);
        // return false;
        //如果是外链css文件
        var operation = function(){
            if(!!localStorage[locStorName])localStorage.removeItem(locStorName);  //如果存在先删除
            if( !!options.cssurl[0] ){                
                function ajaxcssdata(){
                    $.ajax({
                        url : options.cssurl[1],
                        dataType: "html",
                        type: "GET",
                        async : true,
                        data: "",
                        success : function(rst) {
                            //_this.original_css = rst;   //原始的css数据
                            _this.initialization(rst);
                            if(!!options.fn) options.fn();
                            
                            //判断存储至本地localStorage缓存
                            if( !!options.cssVsion[1] ){
                                _locStorJson = {
                                    csstext : rst,
                                    version : options.cssVsion[0]
                                };
                                localStorage[locStorName] = JSON.stringify(_locStorJson);
                            };
                        },
                        error : function(){
                            ajaxcssdata();
                        }
                    });
                };
                ajaxcssdata();
            }else{
                //_this.original_css = options.cssurl[1];
                _this.initialization( options.cssurl[1].text() );
                if(!!options.fn) options.fn();

                //判断存储至本地localStorage缓存
                if( !!options.cssVsion[1] ){
                    _locStorJson = {
                        csstext : options.cssurl[1].text(),
                        version : options.cssVsion[0]
                    };
                    localStorage[locStorName] = JSON.stringify(_locStorJson);
                };
            };
        }; 
        
        //检测是否存在缓存
        //var _locStor = !!JSON.parse(localStorage[locStorName])?JSON.parse(localStorage[locStorName]):"";
        if( !!options.cssVsion[1] && !!localStorage[locStorName] && localStorage[locStorName].length ){
            _locStorJson = JSON.parse(localStorage[locStorName]);
            //检查是否需要更新
            if( _locStorJson.version === options.cssVsion[0] ){
                _this.initialization(_locStorJson.csstext);
            }else{
                operation();
            };
        }else{
            operation();
        };
        
    };
    //css初始化处理开始
    F.prototype.initialization = function(cssdata){
        var _this = this;
        this.cssdatajson = {
            original : "",  //原始的css数据
            usable   : "",  //存储处理过后的css数据
            startTag : "",  //css中开头的css代码
            endTag   : ""   //css中剩余的css代码
        },
        this.mediaDataAttr = [],    //原始的@media数据
        startdom = "/*startdom*/", //css中的标记--开始
        enddom   = "/*enddom*/";   //css中的标记--结束
        //原模原样的css数据
        this.cssdatajson.original = cssdata;
        //获取到要处理的css数据
        this.cssdatajson.usable   = cssdata.substring(cssdata.indexOf(startdom)+startdom.length,cssdata.indexOf(enddom));
        //其它的css数据
        this.cssdatajson.startTag = cssdata.substring(0,cssdata.indexOf(startdom));
        this.cssdatajson.endTag   = cssdata.substring(cssdata.indexOf(enddom)+enddom.length);

        this.prefixEvent();
        this.back_processing();
        this.media_processing();

        this.pixedAllAttribute();

        intelligentAuxiliary.orientationFunc("intelorigen",function(){
            _this.pixedAllAttribute();
        });
    };
    F.prototype.prefixEvent = function(){   //处理css3的前缀属性问题的方法
        var options = this.option.prefix;
        var data = this.cssdatajson.usable;
        //判断是否开启
        if(!options) return false;
        //当前浏览器支持的前缀名称数组
        var prefixName = "";
        //判断当前的浏览器对前缀的支持是哪种
        var vendors = [window.requestAnimationFrame,window.webkitRequestAnimationFrame,window.mozRequestAnimationFrame,window.msRequestAnimationFrame,window.oRequestAnimationFrame];
        $.each(vendors,function(i,val){
            if( !!val ){
                var strPrefix = String(val).toLowerCase();
                prefixName = strPrefix.match(/(webkit|moz|ms|o)+?(?=r)/gi); //正则处理得到浏览器支持的前缀名称
            };
        });
        //判断是否需要添加前缀
        if(!prefixName) return false;
        //google的gradient渐变 暂时不做处理
        //var _repalce = data.replace(/((\{| )+[\w\d\s\-\:\_\;\,\.\%\(\)\/\#]+(?=\})|(@keyframes))/gi,"<=regPrefixName=>"); //.split("<=regPrefixName=>");
        //var _match   = data.match(/((\{| )+[\w\d\s\-\:\_\;\,\.\%\(\)\/\#]+(?=\})|(@keyframes))/gi);
        var _repalce = data.replace(/(\{|\;|\@| )+(keyframes|animation|transform|transition|perspective|linear-gradient|overflow-scrolling)/gi,"<=&*&=>");
        var _match   = data.match(/(\{|\;|\@| )+(keyframes|animation|transform|transition|perspective|linear-gradient|overflow-scrolling)/gi);
        
        if( !!_match ){
            data = "";
            var css3str = _repalce.split("<=&*&=>");
            $.each(css3str,function(i,value){
                if( i == _match.length ){
                    data += value;
                }else{
                    var elem = _match[i];
                    var result = elem.replace(/\{/gi,"{-"+prefixName+"-").replace(/@/gi,"@-"+prefixName+"-").replace(/(\; |\;)/gi,";-"+prefixName+"-");
                    data += value + result;
                };
            });
        };
        this.cssdatajson.usable = data;
    };
    //css中背景图片的处理机制
    F.prototype.back_processing = function(){
        var _this = this;
        var data = this.cssdatajson.usable;
        //拆分background的连写形式
        var _replace = data.replace(/((background)+([\:\s]+(url))|background-image)+([\w\d\s\#\-\_\%\:\,\.\/\(\)])+?(\;|(?=\}))/gi,"&bg&");
        var _match   = data.match(/((background)+([\:\s]+(url))|background-image)+([\w\d\s\#\-\_\%\:\,\.\/\(\)])+?(\;|(?=\}))/gi);    //生产背景的占位符 
        
        if(!!_match){   //background:url方法存在的时候
            data = "";
            var _backsplit = _replace.split("&bg&");
            //拆分连写的背景数据
            $.each(_backsplit,function(i,val){
                if( i == _match.length ){
                    data += val;
                }else{
                    var redraw_back = "";   //重新拼接背景数据的字符串
                    //智能拆分background连写的属性 转化为分开写的
                    var repeat   = _match[i].match(/(no-repeat|repeat|repeat-x|repeat-y)+(\;| )/gi);  //背景图片的repeat
                    var position = _match[i].match(/(\s|\d|px|em|%|left|right)+[\w\d\.\%]+?(\s\/)/gi); //背景定位的东西
                    var size     = _match[i].match(/(\/\s)+([\w\d\s\%\.]+?(\s|\;|\})+[\w\d\s\%\.]+?(\s|\;|\})|(\w)+?(\s))/gi); //背景图片的大小
                    var color    = _match[i].match(/(\s\#|\srgba)+[\(\)\.\,\d\w]+?((?=\s)|(?=\;)|(?=\}))/gi);  //背景颜色
                    var url      = _match[i].match(/[\w\d\_\-\/\.\:]+\.(jpg|png|gif)/gi);  //图片链接的地址
                    //拼接分步骤处理
                    if(!!repeat){   //背景中的 "repeat" 属性
                        var redraw_repeat = "background-repeat:"+repeat.join("").replace(/(\s)/gi,"; ");   //取消掉空格添加上;
                        redraw_back += redraw_repeat;
                    };
                    if(!!position){ //背景中的 "position" 属性
                        var redraw_position = "background-position:"+position.join("").replace(/(\s\/)/gi,"; ");
                        redraw_back += redraw_position;
                    };
                    if(!!size){ //背景中的 "size" 属性
                        var redraw_size = "background-size:"+size.join("").substring(1)+"; ";
                        redraw_back += redraw_size;
                    };
                    if(!!color){ //背景中的 "color" 属性
                        redraw_back += "background-color:"+color+"; ";
                    };
                    if(!!url){
                        //添加背景图片路径的方法
                        var addback = function(url){
                            return "background-image:url("+url+"); "
                        };
                        var opBack = _this.option.backUrl,
                            redraw_bg = "";

                        //intelligent : 智能添加图片地址
                        if( opBack[0] === "intelligent" ){
                            
                            //通过new Image
                            var oImg = new Image();
                            oImg.src = url.join("").replace(/(\.\.\/)/gi,"");  //(\.|\/)+(\/)
                            
                            redraw_back += addback(oImg.src);
                            // intelligentAuxiliary.loadimg(oImg,function(){
                            //     redraw_back += addback(oImg.src);
                            // });
                        }else if( opBack[0] === "default" ){
                            //default : 添加背景图片路径
                            redraw_bg += addback(opBack[1]+url.join("").replace(/(\.|\/)+[\w\d\.\_\-\/]+?(\/|(\.(jpg|png|gif)))/gi,""));
                        }else if( opBack[0] === "relative" ){
                            //relative : 相对页面的图片路径(去掉../)
                            redraw_bg += addback(url.join("").replace(/(\.\.\/|^\/)/gi,""));
                        };
                        redraw_back += redraw_bg;
                    };
                    data += val+redraw_back;
                };
            });
        };
        this.cssdatajson.usable = data;
    };
    //css数据中@media标签的处理机制
    F.prototype.media_processing = function(){
        var arr = this.mediaDataAttr,
            data = this.cssdatajson.usable;
        //获取media数据
        var _replace = data.replace(/(@media)+[\s\d\w\(\)\-\:]+?(?=\{)/gi,"^m^");
        var _match   = data.match(/(@media)+[\s\d\w\(\)\-\:]+?(?=\{)/gi);
        if(!!_match){
            var mediaSplit = _replace.split("^m^");
            $.each(mediaSplit,function(i,value){
                if( i > 0 ){
                    var json = {};  //临时存储原始@media数据
                    json.oMedia    = _match[i-1];
                    json.mediaPx   = _match[i-1].match(/(([\d\.])|\.)+?(?=px)/gi).join("");
                    json.mediaInPX = new Array();

                    //var _replacePX = value.replace(/(([\d\.])|\.)+?(?=px)/gi,"^mp^");
                    var _matchPX = value.match(/(([\d\.])|\.)+?(?=px)/gi);

                    //内部数据获取
                    if( !!_matchPX ){
                        $.each(_matchPX,function(j,elem){
                            json.mediaInPX.push(_matchPX[j]);
                        });
                    };
                    arr.push(json);
                };
            });
        };

        //console.log( this.cssdatajson.usable );
        this.cssdatajson.usable = data;  //赋值处理后的css代码数据
    };
    //开始处理pixed；开始工作！第一步处理全局的px属性
    F.prototype.pixedAllAttribute = function(){
        var win = $(window);
        this.winw = win.width();
        this.winh = win.height();

        var _this = this,
            options = this.option,
            designSize = options.design[0]/options.design[1],    //设计比例
            widthHeight = this.winw/this.winh,    //窗口比例
            view_width = null,
            data = this.cssdatajson.usable;


        //适配模式
        if( options.showWay[0] === "showall" ){ //宽度适配 
            //判断是否开启无限宽度适配(一般用在手机页面移植到ipad端)
            view_width = !!options.showWay[1] ? this.winw : (this.winw>options.design[0]?options.design[0]:this.winw);
        }else if( options.showWay[0] === "noborder" ){  //高度适配
            view_width = (designSize<widthHeight) ? this.winh*designSize : this.winw;
        };

        var _replace = data.replace(/(([\d\.])|\.)+?(?=px)/gi,"<=xman=>").split("<=xman=>");   //生产像素值的占位符;
        var _match   = data.match(/(([\d\.])|\.)+?(?=px)/gi,"<=xman=>");
        if( !!_match ){
            data = "";
            $.each(_replace,function(i,value){
                if( i == _match.length ){
                    data += value;
                }else{
                    var calculation = _match[i] / options.design[0] * view_width;
                    var result = !!options.rounding?Math.round(calculation):calculation;
                    if( result < 1 && result != 0 ){
                        data += (value + 1);
                    }else{
                        data += (value + result);
                    };
                };
            });
        };

        this.cssdatajson.usable = data;

        this.mediaCodeAppend();
        this.fontSizeAttribute(this.cssdatajson.usable);
    };
    //第二步处理并添加@media查询中的数值    
    F.prototype.mediaCodeAppend = function(){
        /*
        *   1.首先获得到有media查询的数组列表 ---- 获得循环i标签
        *   2.侦测每组数组里面有多少<=m=>标签的存在 ---- 获得循环j标签 
        *   3.找到json数组中对应的值在j循环里面操作
        *   4.循环的写法：
        *     4.1 i = 0;
        *     4.2 var result = (j == 0) arr[i].oMedia : arr[i].medInPx[j];
        *   5.在arr[i].medInPx[j]中进行数值的计算得出最后处理好的值
        *   6.计算的时候于arr[i].mediaPx进行比较计算的
        */
        var _this   = this,
            options = this.option,
            data    = this.cssdatajson.usable,
            arr     = this.mediaDataAttr;

        // console.log(arr);
        //准备操作@media标签
        var _replace = data.replace(/(@media)+[\s\d\w\(\)\-\:\.]+?(?=\{)/gi,"<%m%>").split("<%m%>"),
            _match   = data.match(/(@media)+[\s\d\w\(\)\-\:\.]+?(?=\{)/gi),
            mResult = "";

        //@media方法存在时则执行以下方法
        if( !!_match ){
            data = "";
            $.each(_replace,function(i,elem){
                if( i > 0 ){
                    //添加正确的@media标签
                    var newelem = elem;//arr[i-1].oMedia+elem;
                    //分割处理
                    var _mReplacePixed = newelem.replace(/(([\d\.])|\.)+?(?=px)/gi,"<%mpx%>").split("<%mpx%>"),
                        _mMatchPixed   = newelem.match(/(([\d\.])|\.)+?(?=px)/gi),
                        _mResult = "";
                    if( !!_mMatchPixed ){   //存在px值的时候
                        $.each(_mReplacePixed,function(j,value){
                            if( j == _mMatchPixed.length ){
                                _mResult += value;
                            }else{
                                var BeforeCalculation = parseInt(arr[i-1].mediaInPX[j]) / parseInt(arr[i-1].mediaPx) * _this.winw;
                                    _roundingVal = !!options.rounding?Math.round(BeforeCalculation):BeforeCalculation;
                                if( _roundingVal < 1 && _roundingVal != 0 ){
                                    _mResult += (value + 1);
                                }else{
                                    _mResult += (value + _roundingVal);
                                };
                            };
                        });
                    }else{  //存储其他的值
                        _mResult += newelem;
                    };
                    newelem = arr[i-1].oMedia + _mResult;   //重组数据
                    data += newelem;
                }else{
                    data += elem;
                };
            });
        };

        this.cssdatajson.usable = data;
        this.newCSSElement();
    };
    //附加处理--处理文字大小的显示问题
    F.prototype.fontSizeAttribute = function(data){
        var _this = this,
            options = this.option;

        var _replace = data.replace(/(font-size)+[\:\d ]+?(?=px)/gi,"&fs%");
        var _match   = data.match(/(font-size)+[\:\d ]+?(?=px)/gi);

        if( _match ){
            data = "";
            var fsplit = _replace.split("&fs%");
            $.each(fsplit,function(i,value){
                if( i == _match.length ){
                    data += value;
                }else{
                    var result = parseInt(_match[i].match(/[\d\.]+/).join(""));
                    
                    if( !!options.fsMin[0] ){
                        data += value + ("font-size:" + options.fsMin[1]); 
                    }else{
                        data += value + ("font-size:" + result); 
                    };
                };
            });
        };
    };
    //创建新的样式到页面中
    F.prototype.newCSSElement = function(){
        var oNewCss = $("#newcssstyle"),
            headBox = $("head:eq(0)"),
            options = this.option,
            newdatacss = this.cssdatajson.startTag+this.cssdatajson.usable+this.cssdatajson.endTag

        oNewCss.remove();
        var newcss = '<style id="newcssstyle" type="text/css">' + newdatacss + '</style>';

        if( !!options.isMobile && !!intelligentAuxiliary.oMobile ){    //开启只有移动端适配
            headBox.append(newcss);
        }else if( options.isMobile === "config" || !options.isMobile ){
            //调试模式"config"
            headBox.append(newcss);
        };
        //每次翻转之后执行的回调
        if(!!options.callback) options.callback();
    };

    //方法返回操作
    return {
        init : function(options){
            return new F(options);
        }
    };
})();

$(function(){
    intelligentRany.init({
        cssVsion : ["20160531",false],
        isMobile : "config",
        cssurl   : [true,"css/common.css"],
        backUrl  : ["intelligent",""]
    });
});
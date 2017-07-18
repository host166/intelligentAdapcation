
// intelligent - v1.3.2
// data : 2015-02-26
// http://www.aitiantai.com/
// Copyright 2013-2015, 2015 intelligent, Inc. and other contributors; Licensed MIT

// cssUrl  :css文件路径地址 后面跟上",html"则是本地获取方式
// design  :设计尺寸 
// oMobile :是否开启手机显示("config"进入调试模式)
// oScreen :是否开启跟随屏幕变化
// fsMin   :设置文字最小值操作,默认不开启。
// rounding:开启四舍五入模式
// backUrl :设置背景图片的绝对路径

var intelligent = (function(){
    function F(config){
        this.option = { //json数据出厂默认模样
            cssUrl   : "css/common.css",
            design   : 640,
            mobile   : true,
            oScreen  : false,
            fsMin    : false,
            rounding : true,
            backUrl  : undefined
        };
        for( var i in config ){
            this.option[i] = config[i];
        };

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

        this.commonFunc();
    };

    F.prototype.commonFunc = function(){    //方法总汇
        var _this = this;
        //字符串组
        this.cssData = {
            original : "",  //原始的css数据
            usable   : "",  //存储处理过后的css数据
            startTag : "",  //css中开头的css代码
            endTag   : ""   //css中剩余的css代码
        };
        this.mediaArrayAll = []; //存放原始的@media代码用的数组仓库

        //css数据链接对象；
        var cssHref = this.option.cssUrl;    
        //如果是1位即使用ajax数据请求，否则不为ajax方法。
        var cssUrlString = cssHref.split(",").length;
        //获得css数据资源   
        if( cssUrlString > 1 ){
            this.prepareData(cssHref);
        }else{
            $.ajax({
                url : cssHref,  //文件的路径    async false为同步请求
                type : "GET",
                async : true,
                dataType : "html",
                success : function(data){
                    _this.prepareData(data);
                },
                error : function(){
                    this.getData();
                }
            });
        };
    };

    F.prototype.prepareData = function(data){   //开始对css操作前的准备工作
        var _this = this;
        var css_data = this.cssData;   //字符串组 -- 原始数据的存放
        var css_media = this.arrayAll;   //媒体查询的窗口尺寸

        //获取css中需要进行处理的重要资源
        var startDom = "/*startdom*/"; //css中的标记--开始
        var endDom   = "/*enddom*/";   //css中的标记--结束
        //检索起始位置到结束位置之间的css数据
        css_data.original = data.substring(data.indexOf(startDom)+startDom.length,data.indexOf(endDom));
        css_data.startTag = data.substring(0,data.indexOf(startDom));           //开头的css代码部分
        css_data.endTag   = data.substring(data.indexOf(endDom)+endDom.length); //结束的css代码部分
        //用于后面处理的css代码数据
        css_data.usable = css_data.original;
        //存放原始的媒体查询(@media)方法
        this.storageMediaPixed();
    };

    F.prototype.storageMediaPixed = function(){ //存放@media查询中的px值并且处理media方法中的px值
        var _this = this;
        var css_data = this.cssData;   //字符串组 -- 原始数据的存放
        var storageArr = this.mediaArrayAll;    //数组存放 -- 原始的@media数据存放
        var media_placeholder = css_data.usable.match(/(@media)+([a-zA-Z0-9:-\s\(])+\)/gi);  //取得 @media数据
        if( !!media_placeholder ){  //media工厂内如果没有media原料则不在进行操作
            //var obtainPixed = media_placeholder.join("").match(/([\d\.]+)(?:px)/gi);    //取得@media的px代码
            var obtainMediaCode = css_data.usable.replace(/(@media)+([a-zA-Z0-9:-\s\(])+\)/gi,"<=m=>").split("<=m=>");    //分割@media数组
            for( var i=0,len=media_placeholder.length; i<len; i++ ){
                var json = {};
                for( var j in media_placeholder ){
                    json.oMedia  = media_placeholder[j];    //@media的属性代码
                    json.mediaPx = media_placeholder[j].match(/([\d\.]+)(?:px)/gi).join(""); //取得@media的px代码 -- 用于计算
                };
                var px_result = obtainMediaCode[i+1].match(/([\d\.]+)(?:px)/gi); //@media工厂中包含的px值
                if(!px_result){ //为null才执行
                    px_result = ""; //等于一个空字符串
                };
                json.medInPx = px_result;
                storageArr.push(json);  //添加到数组json结构中
            };

            //创建占位符到@media属性中 便于后期添加新的值
            css_data.usable = "";
            $.each(obtainMediaCode,function(k,elem){
                if( k > 0 ){
                    var result = elem.replace(/([\d\.]+)(?:px)/gi,"<=m=>");
                    css_data.usable += "<=m=>"+result;
                }else{
                    css_data.usable += obtainMediaCode[k];
                };
            });
            this.cssData.usable = css_data.usable;  //赋值处理后的css代码数据
        };

        //开始执行工作
        this.pixedAllAttribute();
    };

    //开始工作！第一步处理全局的px属性
    F.prototype.pixedAllAttribute = function(){
        this.windowWidth = $(window).width();   //窗口尺寸获得

        var _this = this;
        var css_data_usable = this.cssData.usable;  //要处理的可用于处理的css代码变量

        var repalce = css_data_usable.replace(/([\d\.]+)(?:px)/gi,"<=xs=>").split("<=xs=>");   //生产像素值的占位符;
        var match   = css_data_usable.match(/([\d\.]+)(?:px)/gi); //得到匹配好的像素值
        if( !!match ){    //存在像素值的时候 才开始加工
            css_data_usable = "";
            $.each(repalce,function(i){
                //像素值
                var elem = parseInt(match[i]);
                //结算的值
                var result_val = (elem / _this.option.design) * _this.windowWidth;
                //最小值处理--最小为1
                var min_value  = (result_val<1&&result_val>0)?result_val=1:result_val;
                //判断是否进行四舍五入模式
                var result = _this.option.rounding?Math.round( result_val )+"px":result_val+"px";
                if(i == match.length){
                    css_data_usable += repalce[i]; //把px值重新组装到占位符
                }else{
                    css_data_usable += repalce[i] + result; //把px值重新组装到占位符
                };
            });

            this.cssData.usable = css_data_usable;
        };

        this.fontSizeAttribute();
    };
    //第二步处理文字大小的显示问题
    F.prototype.fontSizeAttribute = function(){
        var _this = this;
        var css_data_usable = this.cssData.usable;
        var repalce = css_data_usable.replace(/(font-size:+)([\d\.]+)(?:px)/gi,"<=fs=>").split("<=fs=>");   //生产像素值的占位符;
        var match   = css_data_usable.match(/(font-size:+)([\d\.]+)(?:px)/gi); //得到匹配好的像素值
        if( !!match ){  //如果没有font-size属性则不执行此方法
            //文字最小值的处理方法 默认是关闭状态
            if(!!this.option.fsMin){
                css_data_usable = "";   //清空变量--用于可修改的css代码数据

                //执行设置的属性
                $.each(repalce,function(i){
                    if( i == match.length ){
                        css_data_usable += repalce[i];
                    }else{
                        var elem = parseInt(match[i].match(/([\d\.]+)(?:px)/gi).join(""));  //文字当前的大小
                        var result = "font-size:"+_this.option.fsMin+"px";
                        //如果默认处理后的字体大小 小于 设置的字体大小 那么执行设置的字体大小
                        if( elem <= _this.option.fsMin ){
                            css_data_usable += repalce[i]+result;    
                        }else{  //如果设置的字体大小 小于 默认的字体大小 那么用原有的默认字体
                            css_data_usable += repalce[i]+"font-size:"+elem+"px";
                        };
                    };
                });
            }; //执行默认处理的属性

            this.cssData.usable = css_data_usable;
        };

        this.backgroundAttribute();
    };
    //第三步处理背景图片连接代码拆分问题
    F.prototype.backgroundAttribute = function(){
        var _this = this;
        var css_data_usable = this.cssData.usable;

        //先拆分background的连写形式
        //处理backgroun:url开始的css背景图片设置 兼容背景在最后的时候没有写;号的处理 如果不写在后面则取消了后续的方法
        var repalce = css_data_usable.replace(/(background:url)+([a-zA-Z0-9#-_\:\.\/\(\)\s])+?(\;|(?=\}))/gi,"<=bg=>").split("<=bg=>");  
        var match   = css_data_usable.match(/(background:url)+([a-zA-Z0-9#-_\:\.\/\(\)\s])+?(\;|(?=\}))/gi);//生产背景的占位符
        if( !!match ){
            css_data_usable = "";

            //拆分连写的背景数据
            $.each(repalce,function(i,val){
                
                if( i == match.length ){
                    css_data_usable += val;
                }else{
                    var redraw_back = "";   //重新拼接背景数据的字符串
                    //智能拆分background连写的属性 转化为分开写的
                    var url      = match[i].match(/\([a-zA-Z0-9-_\/\:\.]+\.(jpg|png|gif)\)/gi); //图片链接的地址
                    var repeat   = match[i].match(/(no-repeat|repeat|repeat-x|repeat-y)+(\;| )/gi);  //背景图片的repeat
                    var position = match[i].match(/( )+[ \-\d\.px%]+( \/)/gi); //背景定位的东西
                    var size     = match[i].match(/(\/ )+([\d\.px% ])+/gi); //背景图片的大小
                    var color    = match[i].match(/( #)+([\d\w])+\;/gi); //背景的颜色

                    //拆分处理步骤
                    if(!!url){
                        var redraw_url = "background-image:url" + url +"; "; //背景中的 "url" 属性
                        redraw_back += redraw_url;
                    };
                    if(!!repeat){   //背景中的 "repeat" 属性
                        var redraw_repeat = "background-repeat:"+repeat.join("").replace(/( )/,"; ");   //取消掉空格添加上;
                        redraw_back += redraw_repeat;
                    };
                    if(!!position){ //背景中的 "position" 属性
                        var redraw_position = "background-position:"+position.join("").replace(/(\/)/,"; ");
                        redraw_back += redraw_position;
                    };
                    if(!!size){ //背景中的 "size" 属性
                        var redraw_size = "background-size:"+size.join("").substring(1)+"; ";
                        redraw_back += redraw_size;
                    };
                    if(!!color){ //背景中的 "color" 属性
                        redraw_back += "background-color:"+color+" ";
                    };
                    
                    css_data_usable += val + redraw_back;
                };

            });
            
            this.cssData.usable = css_data_usable;

            this.backShowStep();
        };

    };
    //第三步中的小步骤把已经统一风格的background-image代码进行图片链接问题的处理
    F.prototype.backShowStep = function(){
        var _this = this;
        var css_data_usable = this.cssData.usable;

        //获得统一风格之后的background-image的代码
        var repalce = css_data_usable.replace(/\([a-zA-Z0-9-_\/:.]+\.(jpg|png|gif)\)/gi,"<=bg=>").split("<=bg=>");  
        var match   = css_data_usable.match(/\([a-zA-Z0-9-_\/:.]+\.(jpg|png|gif)\)/gi);
        css_data_usable = "";
        
        $.each(repalce,function(i,val){

            // switch(!!_this.option.backUrl){
            //     case true :
            //     console.log(1)
            //     break;
            //     case "clear" :
            //     console.log(2)
            //     break;
            //     default :
            //     console.log(3)
            // };
            if( !!_this.option.backUrl ){   //设置图片的绝对路径之后会执行本操作
                
                if( i == match.length ){
                    css_data_usable += val;
                }else{
                    var result =  "(" + _this.option.backUrl + match[i].replace(/(\.+)(\/)/gi,"").substr(1);
                    css_data_usable += val + result;
                };

            }else{  //没有设置图片的绝对路径

            };
            
        });
        console.log(css_data_usable);
    };

    F.prototype.addResizeEvent = function(func){    //窗口变化时或者设备翻转时执行适配展示的方法
        var _this = this;
        var timer = "";
        if(typeof window.onorientationchange == "undefined"){
            clearTimeout(timer);
            timer = setTimeout(function(){
                window.onresize = func;    
            },50);
        } else {
            window.onorientationchange = function(){
                if(window.orientation == 0 || window.orientation == 180 || window.orientation == 90 || window.orientation == -90){
                    func();
                };
            };
        };
    };
    F.prototype.resetEmptys = function(){   //需要清空的方法
        //this.cssData.usable = "";   //待处理的css数据字符串变量

    };

    return {
        init : function(options){
            return new F(options);
        }
    };
})();

$(function(){
    intelligent.init({
        mobile   : "config",
        rounding : true,
        fsMin    : 11,
        backUrl  : "http://192.168.34.79:8000/intelligent/"
    });
});


/*
*    // this.arrayAll = {
*    //     originalMediaPixed : []    //存放用在媒体标签中原始的像素值
*    // };
*
*    例子
*    var parr = [
*        {
*            mediaSize : "640px",
*            inPixed   : ["1","",""]
*        },
*        {
*            mediaSize : "500px",
*            inPixed   : [""]
*        }
*    ];
*
*    // 0.56338002816901408
*    // 0.56221889055472260
*    // 0.56250000000000000
*
*   背景图片处理：
*
*   1.背景图片的绝对地址的添加
*   2.背景连写属性的拆分写法
*     2.1 分开写属性和绝对地址
*     2.2 分开写属性和取消backgound-image的url地址
*   3.背景图片在不同尺寸下换图
*/
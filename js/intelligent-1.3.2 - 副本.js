/* 
  intelligent - v1.3.2
  data : 2015-02-26
  http://www.aitiantai.com/
  Copyright 2013-2015, 2015 intelligent, Inc. and other contributors; Licensed MIT
*/

/*
*   cssUrl  :css文件路径地址 后面跟上",html"则是本地获取方式
*   design  :设计尺寸 
*   oMobile :是否开启手机显示("config"进入调试模式)
*   oScreen :是否开启跟随屏幕变化
*   rounding:开启四舍五入模式
*   backUrl :背景是否换成绝对路径
*/

var intelligent = (function(){
    function F(config){
        this.option = { //json数据出厂默认模样
            cssUrl   : "css/common.css",
            design   : 640,
            mobile   : true,
            oScreen  : false,
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
            var obtainMediaCode = css_data.usable.replace(/(@media)+([a-zA-Z0-9:-\s\(])+\)/gi,"|mPX|").split("|mPX|");    //分割@media数组
            //创建占位符到@media属性中 便于后期添加新的值
            //css_data.usable = css_data.usable.replace(/(@media)+([a-zA-Z0-9:-\s\(])+\)/gi,"|mPX|");
            
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
            var createPlaceholder = css_data.usable.replace(/(@media)+([a-zA-Z0-9:-\s\(])+\)/gi,"|mPX|").split("|mPX|");
            css_data.usable = "";
            $.each(createPlaceholder,function(k,elem){
                if( k > 0 ){
                    var result = elem.replace(/([\d\.]+)(?:px)/gi,"|mPX|");
                    css_data.usable += "|mPX|"+result;
                }else{
                    css_data.usable += createPlaceholder[k];
                };
            });
            console.log(css_data.usable);
        };

        //开始执行工作
        this.pixedAllAttribute();
    };

    //开始工作！第一步处理全局的px属性
    F.prototype.pixedAllAttribute = function(){
        var _this = this;
        var css_data_usable = this.cssData.usable;  //要处理的可用于处理的css代码变量

        // console.log(css_data_usable);
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
        this.cssData.usable = "";   //待处理的css数据字符串变量

    };

    return {
        init : function(options){
            return new F(options);
        }
    };
})();

$(function(){
    intelligent.init();
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
*/
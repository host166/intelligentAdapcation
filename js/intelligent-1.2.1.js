/* 
  intelligent - v1.2.1
  data : 2014-09-25
  http://www.aitiantai.com/
  Copyright 2014, 2014 intelligent, Inc. and other contributors; Licensed MIT
*/

/*
    cssUrl :css文件路径地址
    design :设计尺寸 
    oMobile:是否开启手机显示("config"进入调试模式)
    oScreen:是否开启跟随屏幕变化
    backUrl:背景是否换成绝对路径
*/

var oMobile = /iphone|ipod|ipad|android|newsmy|blackberry|opera|mini|smartphone|iemobile/i.test(navigator.userAgent.toLowerCase());
var intelligent = {
    obtain_usable_data : "",   //存储可以处理的css数据
    endLabelCode : "",  //获得剩余的css
    mediaSizeArr : [],  //存储media的尺寸值作用到css3的媒介查询标记中
    resultMediaArr : [], //计算完毕的@media中的px值
    init : function(config){  //初始化被执行的方法
        //通用的变量
        this.windowWidth = $(window).width();   //获取窗口的宽度

        /*
            cssUrl :css文件路径地址
            design :设计尺寸 
            oMobile:是否开启手机显示("config"进入调试模式)
            oScreen:是否开启跟随屏幕变化
            backUrl:背景是否换成绝对路径
        */
        
        if(!config){
            config = {};
        };
        this.option = { //json数据出厂默认模样
            cssUrl  : "css/common.css",
            design  : 640,
            mobile  : true,
            oScreen : false,
            backUrl : undefined
        };
        for( var i in config ){
            this.option[i] = config[i];
        };

        this.ajaxData();
    },
    ajaxData : function(){  //请求数据的方法
        var _this = this;
        $.ajax({
            url : _this.option.cssUrl,  //文件的路径    async false为同步请求
            type : "GET",
            async : true,
            dataType : "html",
            success : function(data){
                _this.obtain_usable_css(data); 

                //尺寸变化时触发的智能适配
                /*_this.resize_factory(function(){
                    _this.obtain_usable_data = "";
                    _this.endLabelCode = "";
                    _this.mediaSizeArr = [];
                    _this.resultMediaArr = [];

                    _this.obtain_usable_css(data);
                    console.log(data);
                });*/
            }
        });
    },
    obtain_usable_css : function(data){ //获得到有用的css数据
        var cssData = data;
        var _this = this;
        var startDom = "/*startdom*/"; //css中的标记--开始
        var endDom = "/*enddom*/"; //css中的标记--结束

        //获取css中重要的资源
        cssData = cssData.substr(cssData.indexOf(startDom)+startDom.length);    //检索起始位置 加上自身字符串个数
        cssData = cssData.substring(0,cssData.indexOf(endDom)); //检索第一个字符串到结束位置 不加上自身字符串
        
        //获得剩余的css
        this.endLabelCode = data.substr(data.indexOf(endDom)+endDom.length);

        //将可用的css存储到字符变量中
        this.obtain_usable_data = cssData;
        //this.cssPixedArr.cssEndString.push(this.endLabelCode); //将剩余的css数据存储到 cssEndString 数组中

        this.storage_media_size();  //media标签中的尺寸值
        
        this.pixed_factory(); //像素工厂
        this.back_factory(); //背景工厂
        this.media_factory(); //媒介查询工厂
        this.result_factory();  //添加数据

        this.resize_factory(function(){
            _this.reset_data_factory(cssData); //还原工厂--用于窗口变化改变css处理后的值
        });
    },
    storage_media_size : function(){    //储存media的原始尺寸大小
        var _this = this;
        var cssData = this.obtain_usable_data;  //css数据--等待处理像素关系
        //var storage_media = this.mediaSizeArr;  //储存media数组容器

        var media_placeholder = cssData.match(/(@media)+([a-zA-Z0-9:-\s\(])+\)/gi);  //取得 media中的px数据
        
        if(!!media_placeholder){    //media工厂内如果没有media原料则不在进行
            var media_pixed = media_placeholder.join("").match(/([\d\.]+)(?:px)/gi); //@media标签的像素值设置
            $.each(media_placeholder,function(i){
                _this.mediaSizeArr.push(media_placeholder[i]); //将尺寸存放在数组仓库   
            });
            //取得 media中包含的px值
            var media_in_pixed = cssData.replace(/(@media)+([a-zA-Z0-9:-\s\(])+\)/gi,"|mPX|").split("|mPX|");
            $.each(media_in_pixed,function(i){
                var aI = media_in_pixed[i];

                if(i > 0){
                    var px_result = aI.match(/([\d\.]+)(?:px)/gi); //@media工厂中包含的px值
                    if(!px_result){ //为null才执行
                        px_result = ""; //等于一个空字符串
                    };
                    
                    //_this.mediaSizeArr.push(px_result);
                    $.each(px_result,function(j){
                        var px_I = parseInt( px_result[j] );

                        var result = Math.round( px_I / parseInt(media_pixed[i-1]) * _this.windowWidth );
                        _this.resultMediaArr.push( result );    //存储到数组仓库  
                    });
                };
            });
        };
    },
    pixed_factory : function(){ //像素工厂
        var _this = this;
        var cssData = this.obtain_usable_data;

        var pixed_placeholder = cssData.replace(/([\d\.]+)(?:px)/gi,"|").split("|");   //生产像素值的占位符(会比match多1位)
        var pixed_match = cssData.match(/([\d\.]+)(?:px)/gi); //得到匹配好的像素值
        
        //当工厂内 存在像素值的时候 才开始加工
        if(!!pixed_match){
            cssData = "";   //重置为空

            $.each(pixed_placeholder,function(i,elem){  //i:个数 elem:对象
                var aI = parseInt(pixed_match[i]);    //像素值的原料
                var result = Math.round( (aI / _this.option.design) * _this.windowWidth ) + "px";  //加工处理
                if(i == pixed_match.length){
                    cssData += pixed_placeholder[i]; //把px值重新组装到占位符
                }else{
                    cssData += pixed_placeholder[i] + result; //把px值重新组装到占位符
                };
            });    
        };
        this.obtain_usable_data = cssData;  //重新赋值给变量字符
    },
    /*back_factory : function(){  //背景工厂 ---- background
        var _this = this;
        var backUrl = this.option.backUrl;
        var cssData = this.obtain_usable_data;  //css数据--等待处理背景数据关系

        var back_placeholder = cssData.replace(/\([a-zA-Z0-9-_\/:.]+\.(jpg|png|gif)\)/gi,"||").split("||");  //生产背景的占位符
        var back_match = cssData.match(/\([a-zA-Z0-9-_\/:.]+\.(jpg|png|gif)\)/gi); //生产背景的占位符

        if(!!back_placeholder){
            cssData = "";   //重置为空

            $.each(back_placeholder,function(i){
                var aI = back_match[i];
                
                if(!!backUrl){  //加工背景时如果添加了背景的绝对地址则执行

                    if(i <= back_match.length-1){
                        var result = "(" + _this.option.backUrl + aI.substring(1);   //去掉左边的括号
                    };
                    if(i == back_match.length){
                        cssData += back_placeholder[i];
                    }else{
                        cssData += back_placeholder[i] + result;
                    };

                }else{
                    
                    var result = "";    //处理为空 使用css文件默认图片路径
                    if(i == back_match.length){
                        cssData += back_placeholder[i];
                    }else{
                        cssData += back_placeholder[i] + result;
                    };

                };

            });

            this.obtain_usable_data = cssData;  //重新赋值给变量字符
        };
    },*/
    back_factory : function(){  //背景工厂 ---- background:url()类的进行智能篡改
        var _this = this;
        var cssData = this.obtain_usable_data;  //css数据--等待处理背景数据关系

        //处理backgroun:url开始的css背景图片设置 兼容背景在最后的时候没有写;号的处理 如果不写在后面则取消了后续的方法
        var backUrl_placeholder = cssData.replace(/(background:url)+([a-zA-Z0-9#-_\:\.\/\(\)\s])+?(\;|(?=\}))/gi,"||").split("||");  
        var backUrl_match = cssData.match(/(background:url)+([a-zA-Z0-9#-_\:\.\/\(\)\s])+?(\;|(?=\}))/gi);//生产背景的占位符
        if(!!backUrl_match){
            cssData = "";   //重置为空

            /*var back = {    //背景background的json数组
                imgUrl      : [],
                imgRepeat   : [],
                imgPosition : [],
                imgSize     : [],
                imgColor    : []
            };*/

            //拆分连写的背景数据
            $.each(backUrl_placeholder,function(i,elem){
                var valIndex = backUrl_match[i];
                if( i == backUrl_match.length ){
                    cssData += elem;
                }else{
                    var redraw_back = "";   //重新拼接背景数据的字符串
                    //智能拆分background连写的属性 转化为分开写的
                    var url      = backUrl_match[i].match(/\([a-zA-Z0-9-_\/\:\.]+\.(jpg|png|gif)\)/gi); //图片链接的地址
                    var repeat   = backUrl_match[i].match(/(no-repeat|repeat|repeat-x|repeat-y)+(\;| )/gi);  //背景图片的repeat
                    var position = backUrl_match[i].match(/( )+[ \d\.px%]+( \/)/gi); //背景定位的东西
                    var size     = backUrl_match[i].match(/(\/ )+([\d\.px% ])+/gi); //背景图片的大小
                    var color    = backUrl_match[i].match(/( #)+([\d\w])+\;/gi); //背景的颜色

                    //添加到数据中去
                    //back.imgUrl.push(url);
                    redraw_back += "background-image:"+"|;"; //背景中的 "url" 属性
                    if(!!repeat){   //背景中的 "repeat" 属性
                        var redraw_repeat = "background-repeat:"+repeat.join("").replace(/( )/,";");   //取消掉空格添加上;
                        redraw_back += redraw_repeat;
                    };
                    if(!!position){ //背景中的 "position" 属性
                        var redraw_position = "background-position:"+position.join("").replace(/(\/)/,";");
                        redraw_back += redraw_position;
                    };
                    if(!!size){ //背景中的 "size" 属性
                        var redraw_size = "background-size:"+size.join("").substring(1)+";";
                        redraw_back += redraw_size;
                    };
                    if(!!color){ //背景中的 "color" 属性
                        redraw_back += "background-color:"+color;
                    };

                    cssData += elem + redraw_back;
                };
            });

            this.obtain_usable_data = cssData;
        };

        this.back_other_factory();  //处理其他的背景图片处理方式
    },
    back_other_factory : function(){    //处理其他的背景图片处理方式
        var _this = this;
        var cssData = this.obtain_usable_data;  //css数据--等待处理背景数据关系

        //处理其他的背景图片处理方式
        var back_placeholder = cssData.replace(/\([a-zA-Z0-9-_\/:.]+\.(jpg|png|gif)\)/gi,"||").split("||");  //生产背景的占位符
        var back_match = cssData.match(/\([a-zA-Z0-9-_\/:.]+\.(jpg|png|gif)\)/gi); //生产背景的占位符

        if(!!back_match){
            cssData = "";   //重置为空
            $.each(back_placeholder,function(i){
                var result = "";    //处理为空 使用css文件默认图片路径
                if(i == back_match.length){
                    cssData += back_placeholder[i];
                }else{
                    cssData += back_placeholder[i] + result;
                };
            });

            this.obtain_usable_data = cssData;  //重新赋值给变量字符
        };
    },
    media_factory: function(){ //@media 媒介查询工厂
        var _this = this;
        var cssData = this.obtain_usable_data;

        var media_placeholder = cssData.replace(/(@media)+([a-zA-Z0-9:-\s\(])+\)/gi,"+u").split("+u"); //将@media元素分成数组
        if(!!media_placeholder){
            cssData = "";
            $.each(media_placeholder,function(i){
                if( i > 0 ){    //修改包含的px的属性准备用于替换
                    var aElem = _this.mediaSizeArr[i-1] + media_placeholder[i].replace(/([\d\.]+)(?:px)/gi,"&&");
                    cssData += aElem;
                }else{
                    cssData += media_placeholder[i];
                };
                /*//为@media添加原始数据
                if(i == media_placeholder.length-1){
                    cssData += media_placeholder[i];
                }else{
                    cssData += media_placeholder[i] + _this.mediaSizeArr[i];
                };*/
            });

            this.obtain_usable_data = cssData;  //重新赋值给变量字符
            this.media_factoryIn_pixed();//计算@media中的px值
        };
    },
    media_factoryIn_pixed : function(){ //计算@media中的px值
        var _this = this;
        var cssData = this.obtain_usable_data;

        var mediaInPixed = cssData.split("&&");
        cssData = "";
        //var elem = cssData.match(/(&&)/gi);
        $.each(mediaInPixed,function(i,elem){
            if( i == mediaInPixed.length-1 ){
                cssData += elem;
            }else{
                cssData += elem + _this.resultMediaArr[i] + "px";
            };
        });

        this.obtain_usable_data = cssData;  //重新赋值给变量字符
    },
    result_factory : function(){    //所有的数据处理完毕并添加到页面中  ----  综合工厂
        var _this = this;
        var cssData = this.obtain_usable_data;
        var oNewCss = $("#newcssstyle");
        var headBox = $("head:eq(0)");

        oNewCss.remove();
        var newcss = '<style id="newcssstyle" type="text/css">'+cssData+'</style>';

        //增加条件添加适配处理
        var appendFunc = function(){
            if( _this.option.oScreen == true ){
                headBox.append(newcss);
            }else{
                if( _this.windowWidth <= _this.option.design ){
                    headBox.append(newcss);
                };
            };
        };

        if( this.option.mobile == false || this.option.mobile == "config" ){  //允许页面在pc端实现适配展示 关闭或调试模式开启
            appendFunc();
        }else if(this.option.mobile == true && oMobile){   //只允许页面在移动设备上实现适配展示 开启移动端显示模式
            appendFunc();
        };
    },
    reset_data_factory : function(cssData){    //还原工厂--用于窗口变化改变css处理后的值
        this.windowWidth = $(window).width();  //窗口的宽度
        this.obtain_usable_data = "";
        this.obtain_usable_data = cssData;
        this.resultMediaArr = [];
        
        this.storage_media_size();  //media标签中的尺寸值
        this.pixed_factory(); //像素工厂
        this.back_factory(); //背景工厂
        this.media_factory(); //媒介查询工厂
        this.result_factory();  //添加数据
    },
    resize_factory : function(func){    //窗口变化的尺寸设计展示方法
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
        //判断手机尺寸变化
        /*function addresize(func){
            var oldonresize = window.onresize;
            var timer = "";
            if (typeof window.onorientationchange == "undefined"){
                clearTimeout(timer);
                timer = setTimeout(function(){
                    window.onresize = func;    
                },50);
            } else {
                window.onorientationchange = function(){
                    func();
                };
            };
        };
        addresize(function(){});
        window.onorientationchange = function(){
            alert(window.orientation);
        };*/
    }
    
};

intelligent.init({
    mobile : "config"
});


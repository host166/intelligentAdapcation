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

var oMobile = /iphone|ipod|ipad|android|blackberry|opera|mini|smartphone|iemobile/i.test(navigator.userAgent.toLowerCase());
var intelligent = {
    obtain_usable_data : "",   //存储可以处理的css数据
    endLabelCode : "",  //获得剩余的css
    mediaSizeArr : [],  //存储media的尺寸值作用到css3的媒介查询标记中
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
            oMobile : true,
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
            url : "css/common.css",  //文件的路径
            type : "GET",
            dataType : "html",
            success : function(data){
                _this.obtain_usable_css(data);
            }
        });
    },
    obtain_usable_css : function(data){ //获得到有用的css数据
        var cssData = data;
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
    },
    storage_media_size : function(){    //储存media的原始尺寸大小
        var _this = this;
        var cssData = this.obtain_usable_data;  //css数据--等待处理像素关系
        var storage_media = this.mediaSizeArr;  //储存media数组容器

        var media_placeholder = cssData.match(/\((max-width|min-width|width)+([a-zA-Z0-9:])+\)/gi);  //取得 media中的px数据

        if(!!media_placeholder){    //media工厂内如果没有media原料则不在进行
            $.each(media_placeholder,function(i){
                _this.mediaSizeArr.push(media_placeholder[i]);    
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
    back_factory : function(){  //背景工厂 ---- background
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
    },
    media_factory: function(){ //@media 媒介查询工厂
        var _this = this;
        var cssData = this.obtain_usable_data;

        var media_placeholder = cssData.replace(/(@media)/gi,"+u").split("+u"); //将@media元素分成数组

        if(!!media_placeholder){
            $.each(media_placeholder,function(i){
                var aI = media_placeholder[i];

                //处理media中的px值转换
                if(i == 0){
                    
                }else{
                    //media的 px 值 转换为 初始默认的尺寸
                    var media_pixed = aI.replace(/\((max-width|min-width|width)+([a-zA-Z0-9:])+\)/gi, _this.mediaSizeArr[i-1]);
                    var mediaArr = _this.mediaSizeArr;  //@media的原料(媒介尺寸)
                    var number = parseInt( mediaArr[i-1].replace(/[\(a-z\-\:\)]/gi,"") ); //@media的尺寸 加工为 数值类型

                    //获得到@media方法中包裹的px值
                    var media_in_pixed_match = aI.match(/([\d\.]+)(?:px)/gi);
                    var result = parseInt(media_in_pixed_match[i-1]) / number * _this.windowWidth;
                    console.log(media_pixed);
                };
            });
        };
        
        //media的 px 值 转换为 初始默认的尺寸
        //
    },
    media_factoryBak : function(){ //@media 媒介查询工厂
        var _this = this;
        var cssData = this.obtain_usable_data;
        
        var media_placeholder = cssData.replace(/(@media)/gi,"+u").split("+u"); //将@media元素分成数组

        $.each(media_placeholder,function(i){
            var aI = media_placeholder[i];

            if(i > 0){
                //media中元素的 px 值
                //var media_in_pixed = aI.replace(/([\d\.]+)(?:px)/gi,"^v^").split("^v^");
                /*if(!!media_in_pixed_match){

                    $.each(media_in_pixed,function(i){

                    });
                };*/
                
                var media_in_pixed_match = aI.match(/([\d\.]+)(?:px)/gi);
                if(!!media_in_pixed_match && i > 0){
                    var mediaArr = _this.mediaSizeArr;  //media原始数值的数组
                    //media中存在像素值 需要与原始media值 进行换算
                    $.each(media_in_pixed_match,function(i){
                        var number = parseInt( mediaArr[i].replace(/[\(a-z\-\:\)]/gi,"") ); //@media的尺寸 加工为 数值类型
                        var result = parseInt(media_in_pixed_match) / number * _this.windowWidth;

                        console.log(
                            i+"@media中原始的px值:"+parseInt(media_in_pixed_match)+"\n@media的尺寸:"+number+"\n@当窗口的尺寸:"+_this.windowWidth+"\n计算的结果:"+result
                        );
                    });

                };
                
                //media的 px 值 转换为 初始默认的尺寸
                var media_pixed = aI.replace(/\((max-width|min-width|width)+([a-zA-Z0-9:])+\)/gi, _this.mediaSizeArr[i-1]);

            };

        });
    }

};

intelligent.init();


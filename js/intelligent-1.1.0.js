//console.log(regBackArr);

//cssPropertyArray.push(",",addArr);

/*style=".test{width:3px;height:25px;}.test1{width:3px;height:25px;}"

nstyle = ".test{width:|;height:|;}.test1{width:|;height:|;}"

px = ["3px","25px","3px","25px"]

var stylearr = nstyle.split("|");
var newstyle = "";
for(var i=0;i<=px.length;i++){
	if(i==px.length){
		newstyle += stylearr[i]
	}else{
		newstyle += stylearr[i]+px[i]
	};
}
console.log(newstyle);
var str = "{.widthFont{font--.-ize:12px;}.reize{width:320px;}}";

var pos = {
	start: str.indexOf("{.") || 0,
	last: str.indexOf("}}") + 1 || 0
};

var reg = /\..*;}/gi;

console.log(str.slice(pos.start, pos.last), str.match(reg));
/*
====================
调取用于适配的css文件
读取网站所应用的css获取值和属性
发布标签，以标签开始startdom开始enddom结束
获取中间的所有css样式名称和属性
计算：
	width
	height
	line-height
	min-width
	max-width
	min-height
	max-height
	font-size
	top
	left
	right
	bottom
	padding
	margin
	background-position
	background-size
	border
针对页面需开发者进行设置基于设计稿的宽度

	空格+数字+px   /{[ 0-9px]*}/gi
	冒号+数字+px   /{[:0-9px]*}/gi
	)+数字+px	  /{[)0-9px]*}/gi
	匹配px前面的数字/([\d]+)(?:px)/gi  || /\w+:\s*\d+(px)?/gi
	
	var oMobile = /iphone|ipod|ipad|android|blackberry|opera|mini|smartphone|iemobile/i.test(navigator.userAgent);
	if(!oMobile) {
        window.location='http://feiji.qq.com/pc/';
    };
====================
*/

//浏览器的事件判断
var oMobile = /iphone|ipod|ipad|android|blackberry|opera|mini|smartphone|iemobile/i.test(navigator.userAgent.toLowerCase());

//存储css的属性和对应的值
var cssPropertyArr = {
	width : [],
	height : [],
	lineHeight : [],
	minWidth : [],
	maxWidth : [],
	minHeight : [],
	maxHeight : [],
	fontSize : [],
	top : [],
	left : [],
	right : [],
	bottom : [],
	paddingLeft : [],
	paddingRight : [],
	paddingTop : [],
	paddingBottom : [],
	padding : [],
	marginLeft : [],
	marginRight : [],
	marginTop : [],
	marginBottom : [],
	margin : []
};

//智能响应式布局事件开始
var Intelligent = {
	cssPixedArr : {
		pixed : [],	//存储px的处理后的数值
		back : [],	//存储back的处理后的数值 fasle

		mediaPixed : [],	//存储@media标签中设置的px数值
		mediaCss : [],	//存储@media标签中的css数据
		mediaResult : [],	//@media处理后的数据

		cssEndString : []	//储存剩余的css数据
	},
	regBeforString : {
		pixed : "",	//创建字符串为存储处理过后的px值
		back  : ""	//创建字符串为存储处理过后的background的值 fasle
	},
	init : function(option){	//输出设置 cssUrl:输出css文件地址; width:默认的宽度设置; mobile:是否在移动端显示(config为调试模式)
		_THIS = this;
		this.option = option;
		if( !!option.cssUrl && !!option.width && typeof(option.mobile) != undefined ){
			_THIS.option = option;
			if(option.mobile == true && oMobile){
				_THIS.loadCss(option.cssUrl);
			};
			if(option.mobile == "config"){
				_THIS.loadCss(option.cssUrl);
			};
		};	
	},
	loadCss :function(url){	//请求文件的ajax方法
		$.ajax({
			url : url,	//文件的路径
			type : "GET",
			dataType : "text",
			success : function(data){
				_THIS.cssData = data;
				setTimeout(function(){
					_THIS.startCss(_THIS.option.width);	
				});
			}
		});
	},
	startCss : function(design){	//准备工作开始	design:设置默认的宽度
		var cssData = _THIS.cssData;
		var startDom = "/*startdom*/"; //css中的标记--开始
		var endDom = "/*enddom*/"; //css中的标记--结束
		var endBeforString = ""; //结束标签后的代码；
		var resizeTimer = "";	//页面翻转缩放的时候使用到的变量

		//获取css中重要的资源
		cssData = cssData.substr(cssData.indexOf(startDom)+startDom.length);	//检索起始位置 加上自身字符串个数
		cssData = cssData.substring(0,cssData.indexOf(endDom));	//检索第一个字符串到结束位置 不加上自身字符串
 		
 		//获得剩余的css
		endBeforString = _THIS.cssData.substr(_THIS.cssData.indexOf(endDom)+endDom.length);
		this.cssPixedArr.cssEndString.push(endBeforString);	//将剩余的css数据存储到 cssEndString 数组中

		//计算像素的值
		this.pixel_calculation_css(cssData,design);
		$(window).resize(function(){
   			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function(){
				_THIS.pixel_calculation_css(cssData,design);
			},50);
   		});
	},
	media_calculation_func : function(cssData){	//存储css中的原始数据
		//@media的宽度值
		//var mediaPixed = cssData.replace(/([\d\.]+)(?:px\))/gi,"$");
		//backStr.replace(/\([a-zA-Z0-9-_/:.]+\.(jpg|png|gif)\)/gi,"()");
		//主要设计目的是为了存储css中的原始数据
		var mediaMatch = cssData.match(/([\d\.]+)(?:px\))/gi);	//取得 media中的px的尺寸
		var mediaInReg = cssData.replace(/(@media)/gi,"-.-").split("-.-");	//取得 media中的px数据
		var mediaInRegPixed = cssData.match(/(@media)/gi);	//match到@media标签

		if(!!mediaMatch){
			for(var i=0,len=mediaMatch.length; i<len; i++){	//@media中的尺寸
				this.cssPixedArr.mediaPixed.push( parseInt(mediaMatch[i]) );	//将获取来的值 mediaPixed 存储到数组中去
			};

			//循环检测到的@media标签
			for(var j=0,s=mediaInRegPixed.length; j<s; j++){	//前一位有空白字符 所以直接从1开始
				if(j>0){
					var iPx = mediaInReg[j].replace(/([\d\.]+)(?:px)(?!\))/gi,"=.=");	//找到@media内的像素并创建标记
					var mPx = mediaInReg[j].match(/([\d\.]+)(?:px)(?!\))/gi);	//找到@media内的像素并得到数值
					this.cssPixedArr.mediaCss.push( mPx );	//将原始的像素尺寸 mediaCss 存储到数组中去
				};
			};

			//用于@media内的px值跟screen的px值的算法
			for(var i=0,l=this.cssPixedArr.mediaPixed.length; i<l; i++){
				var pPixed = this.cssPixedArr.mediaPixed[i];	//@media screen的px值的数组
				for(var j=0,s=this.cssPixedArr.mediaCss[i].length; j<s; j++){
					var childPixed = parseInt( this.cssPixedArr.mediaCss[i][j] );	//@media内的px值的数组
					var width = Math.round(childPixed/pPixed*$(window).width());	//值的计算
					this.cssPixedArr.mediaResult.push(width);	//计算结果存储在 mediaResult 数组中
				};
			};
			
			//console.log(this.cssPixedArr.mediaPixed[i]+"\n"+this.cssPixedArr.mediaCss[i][j]);

			/*for(var i=0,len=mediaMatch.length; i<len; i++){	//@media中的尺寸
				this.cssPixedArr.mediaPixed.push( parseInt(mediaMatch[i]) );	//将获取来的值 mediaPixed 存储到数组中去
			};
			for(var i=1,len=mediaInRegPixed.length; i<len; i++){	//前一位有空白字符 所以直接从1开始
				//var iPx = mediaInReg[i].replace(/([\d\.]+)(?:px)(?!\))/gi,"=.=");	//找到@media内的像素并创建标记
				var mPx = mediaInReg[i].match(/([\d\.]+)(?:px)(?!\))/gi);	//找到@media内的像素并得到数值
				this.cssPixedArr.mediaCss.push( mPx );	//将原始的像素尺寸 mediaCss 存储到数组中去
			};*/
			/*for(var i=0,len=mediaInRegPixed.length; i<len; i++){	//@media中内部带有px的值
				var iNum = mediaInRegPixed[i];	//去除@中的media
				this.cssPixedArr.mediaCss.push( iNum );
			};*/

			/*320
			12,320
			push( [i,[j]] )
			var a = [
				[
					320,
					[12,320]
				],
				[

				]
			]
			var a.push([320,[12,320]])*/

			/*for(var i=0,len=mediaInMatch.length; i<len; i++){	//@media中内部带有px的值
				var iNum = mediaInMatch[i].replace(/(@)/g,"");	//去除@中的media
				this.cssPixedArr.mediaCss.push( iNum );
			};*/
		};
	},
	pixel_calculation_css : function(cssData,design){	//计算像素的值
		//清空数组
		this.clearArray();

		this.media_calculation_func(cssData);	//存储css中的原始数据

		//通用的变量
		this.windowWidth = $(window).width();	//获取窗口的宽度
		this.design = design;	//设置宽度
		//让特殊字符站位（新添了处理小数点的px值）和 特殊占位符的个数转换成数组
		var regSpecial = cssData.replace(/([\d\.]+)(?:px)/gi,"|").split("|");
		var addArr = cssData.match(/([\d]+)(?:px)/gi); 	//获得到正则处理后的有px属性值的数据
		//var cssDataArray = regSpecial.split("|");

		if(!!addArr){
			for(var i=0,len=addArr.length; i<=len; i++){
				if(i<len){ //最后一个push到数组中不是数字
					var pototypeArr = parseInt(addArr[i]);
					var regResult = Math.round((pototypeArr/this.design)*this.windowWidth);/*$(window).width())*/
					this.cssPixedArr.pixed.push(regResult+"px"); //把计算好的数字添加到数组；
				};
				if(i==this.cssPixedArr.pixed.length){
					this.regBeforString.pixed += regSpecial[i];
				}else{
					this.regBeforString.pixed += regSpecial[i]+this.cssPixedArr.pixed[i];
				};
			};
			this.back_calculation_css();	//处理背景图片
			this.media_screen_css();	//计算@media设置的尺寸
		};
	},
	back_calculation_css : function(){	//处理背景图片
		var backStr = this.regBeforString.pixed;	//为处理background或background-image所用到的css数据
		var backArr = backStr.match(/\([a-zA-Z0-9-_/:.]+\.(jpg|png|gif)\)/gi);	//得到的背景数组
		if(!!backArr){
			//处理css中背景图片 background 和 background-image
			this.regBeforString.pixed = backStr.replace(/\([a-zA-Z0-9-_/:.]+\.(jpg|png|gif)\)/gi,"")//.split("||");
			//var backArr = backStr.match(/\([a-zA-Z0-9-_/:.]+\.(jpg|png|gif)\)/gi);
			//var backArray = strBackReg.split("||");
			//直接删除掉background的图片链接内容 是页面直接使用css文件中的图片链接地址
		};
		
		/*for(var i=0,backlen=backArr.length; i<=backlen; i++){
			//i小于个数的时候处理事件，因为个数比i多1个
			if(i<backlen){
				var backgroundString = backArr[i].replace(/[\(\)\"]+(..\/)/g,""); //处理括号和引号 url("") or url();
				backgroundString = backgroundString.substring(0,backgroundString.length-1);
				var addBackUrl = "";//"("+backgroundString+")"; //添加图片地址
				this.cssPixedArr.back.push(addBackUrl); //把背景字符串存入背景数组;
			};
			if(i==this.cssPixedArr.back.length){
				backStr += this.cssPixedArr.back[i];
			}else{
				backStr += this.cssPixedArr.back[i]+this.cssPixedArr.back[i];
			};
		};
		console.log(this.cssPixedArr.back)*/
	},
	media_screen_css : function(){	//处理 @media 屏幕标签的尺寸
		var mediaStr = this.regBeforString.pixed;	//为处理media所用到的css数据
		var mediaPixed = mediaStr.replace(/([\d\.]+)(?:px\))/gi,"=-=").split("=-=");	//取得 media中的px的尺寸
		//var mediaMatch = mediaStr.match(/([\d\.]+)(?:px\))/gi);
		//循环media或得到的像素标记一共几个
		for(var i=0,len=this.cssPixedArr.mediaPixed.length; i<len; i++){
			var oArr = this.cssPixedArr.mediaPixed[i]+"px)";	//media中原始的px尺寸
			mediaPixed[i]+=oArr;
		};
		mediaStr = mediaPixed.join("");	//将数组变成字符串 并且赋值给pixed字符串
		//处理@media中的px
		this.media_screen_inPixed(mediaStr);
	},
	media_screen_inPixed : function(mediaStr){	//处理@media中的px
		var mediaString = mediaStr;
		mediaString = mediaStr.split("@media");	//取得 media中的px数据
		
		$.each(mediaString,function(i,elem){
			if(i>0){
				mediaString += "@media"+elem.replace(/([\d\.]+)(?:px)(?!\))/gi,"^_^");
			}else{
				mediaString = elem;
			};
		});
		
		mediaString = mediaString.split("^_^");
		
		/*for(var i=0,len=mediaString.length; i<len; i++){
			if(i == mediaString.length-1){	//最后一个循环是余下的字符串 所以判断一下最后加起来
				
			}else{
				mediaString[i] += _THIS.cssPixedArr.mediaResult[i];
			};
		};
		console.log(mediaString.join("")+"\n");*/
		$.each(mediaString,function(i,elem){

			if(i == mediaString.length-1){	//最后一个循环是余下的字符串 所以判断一下最后加起来
				
			}else{
				mediaString[i] += _THIS.cssPixedArr.mediaResult[i]+"px";
			};	
		});
		this.regBeforString.pixed = mediaString.join("");	//附加好的值转换成带px的数值

		//创建 添加到页面结构中
   		this.addToDocument(_THIS.regBeforString.pixed);

		//mediaString = mediaString.join("");	//附加好的值转换成带px的数值  （所有字符串的处理包括pixed被存储在 mediaString身上）
		
		/*$.each(mediaStr,function(i,elem){
			mediaStr = mediaStr.replace(/(^_^)/gi,_THIS.cssPixedArr.mediaResult[i]);
			console.log(mediaStr)
		});*/
		/*var iPx = "";
		//循环处理@media内的px的值
		for(var i=0,len=mediaInReg.length; i<len; i++){
			if(i>0){
				mediaStr += mediaInReg[i].replace(/([\d\.]+)(?:px)(?!\))/gi,"^_^");
			}else{
				mediaStr += mediaInReg[i];
			};
			if(i==mediaInReg.length-1){
				mediaStr += mediaInReg[i];
			}else{
				mediaStr += mediaInReg[i]+"@media";
			};
		};*/

		//console.log(mediaStr)
		/*var mediaInstr = mediaStr.replace(/([@]+)(\d+)/gi,"-.-")//.split("-.-");	//创建占位符

		//取@media的屏幕宽度设置
		var screenPixed = this.cssPixedArr.mediaPixed;
		for(var i=0,len=this.cssPixedArr.mediaCss.length; i<len; i++){
			var oArr = this.cssPixedArr.mediaCss[i];	//media中原始的px尺寸			
			mediaInstr[i]+=oArr;
		};
		mediaStr = mediaInstr.join("");*/
	},
	clearArray : function(){	//清空数组

		//数组中保存的都是css文件的原始数据
		this.cssPixedArr.pixed = [];	//存储px的数据
		this.cssPixedArr.back = [];	//存储background的数据
		this.cssPixedArr.mediaPixed = [];	//存储@media的px的数据
		this.cssPixedArr.mediaCss = [];	//存储@media中内部的px的数据
		this.cssPixedArr.mediaResult = []; //@media处理后的数据
		this.cssPixedArr.cssEndString = []; //css不被处理的数据

		//字符串中的数据
		//储存的处理过后的css数据
		this.regBeforString.pixed = "";
		this.regBeforString.back = "";
	},
	addToDocument : function(regStringAll){	//创建 添加到页面结构中
		var newCss = regStringAll+this.cssPixedArr.cssEndString.join("");

		$("#resizestyle").remove();	//创建的style标签
		var creatStyle = '<style id="resizestyle" type="text/css">'+newCss+'</style>';
		if(typeof(this.option.oScreen) != undefined){
			if( this.option.oScreen == false ){	//关闭随着屏蔽大小进行伸缩
				if(this.windowWidth <= this.design){	//窗口宽度小于设置的design数值时执行
					$("head:eq(0)").append(creatStyle);
				};
			}else{	//开启随着屏蔽大小进行伸缩
				$("head:eq(0)").append(creatStyle);
			};
		};
	}
};


Intelligent.init({ //参数：1.链接 2.识别的分辨率
	cssUrl:"css/common.css",
	width:640,
	mobile:"config",
	oScreen:false
})


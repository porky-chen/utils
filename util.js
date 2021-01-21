//拓展jquery方法
$.fn.extend({
    /**
     * @description 可搜索下拉框
     * @param {Object} params 参数, 格式如下
     * {
     * 		width: 宽度
     * 		placeholder: 输入框提示文字
     * 		inputClass: 输入框类名
     * 		data: { id: id值, text: 显示的文字}
     * }
     * @event 默认值需要触发 select3.change 事件才会改变默认选中
     */
    select3: function (params) {
        var id = params.id || 'select3-input',
            width = params.width,
            placeholder = params.placeholder,
            inputClass = params.inputClass,
            data = params.data;
        if (this.length) {
            var html = '';
            $.each(data, function (i, t) {
                html += `<li class="select2-results__option" role="treeitem" aria-selected="false" data-id="${t.id}">${t.text}</li>`; //
            });
            $(this).html(`<span class="input-dropdown-box select2-container--default" style="${width ? ('width:' + width) : ''}">
		               	 	<input type="text" class="input-dropdown ${ inputClass}" id="${id}" placeholder="${placeholder}" data-id="">
							<span class="select2-dropdown select2-dropdown--below dn" dir="ltr" style="width:${width}">
								<span class="select2-results">
									<ul class="select2-results__options" role="tree" id="select2-parentMenu-results" aria-expanded="true" aria-hidden="false">
									${ html}
									</ul>
								</span>
							</span>
		                </span>`);

        }
        $(document).on('select3.change', '#' + id, function () {
            var val = $('#' + id).val();
            $.each(data, function (i, t) {
                if (val == t.id) {
                    $('#' + id).val(t.text).attr('data-id', t.id);
                }
            });
            $(`.input-dropdown-box li[data-id="${val}"]`).attr('aria-selected', true).siblings().attr('aria-selected', false);
        }).on('mouseover', '.input-dropdown-box li', function () {
            $(this).addClass('select2-results__option--highlighted').siblings().removeClass('select2-results__option--highlighted');
        }).on('mouseout', '.input-dropdown-box li', function () {
            $(this).removeClass('select2-results__option--highlighted');
        }).on('click', '.input-dropdown-box li', function () {
            var el = $(this);
            el.attr('aria-selected', true).siblings().attr('aria-selected', false);
            $('#' + id).val(el.text()).attr('data-id', el.attr('data-id'));
        }).on('keyup', '#' + id, function () {
            var val = $('#' + id).val(),
                reg = new RegExp(val)
            hasVal = false;
            $('.input-dropdown-box li').attr('aria-selected', false);
            $('.input-dropdown-box li').each(function (i, t) {
                if (val == $(t).text()) {
                    hasVal = true;
                    $(t).show();
                    $(t).attr('aria-selected', true).siblings().attr('aria-selected', false);
                    $('#' + id).attr('data-id', $(t).attr('data-id'));
                } else if (reg.test($(t).text())) {
                    hasVal = true;
                    $('#' + id).attr('data-id', $('#' + id).val());
                    $(t).show();
                } else {
                    $('#' + id).attr('data-id', $('#' + id).val());
                    $(t).hide();
                }
            });
            (!hasVal) && $('.input-dropdown-box li').attr('aria-selected', false);
        }).on('focus', '#' + id, function () {
            $('.input-dropdown-box .select2-dropdown').show().css('top', $('.input-dropdown').outerHeight() + 'px');
        }).on('focusout', '#' + id, function () {
            setTimeout(function () {
                $('.input-dropdown-box .select2-dropdown').hide();
            }, 200);
        })
        return this.find('#' + id);
    },
    autoHeight: function () {
        function autoHeight (elem) {
            elem.style.height = 'auto';
            elem.scrollTop = 0; //防抖动
            elem.style.height = elem.scrollHeight + 'px';
            if (!elem.value) {
                elem.style.height = '40px';
            }
        }

        this.each(function () {
            autoHeight(this);
            $(this).on('change', function () {
                autoHeight(this);
            });
        });
    }
});
module.exports = {
    /**
     * @description 封装ajax
     * @param {String} url 请求地址
     * @param {Object} data 请求数据参数
     * @param {Function} callback 请求成功回调
     * @param {Function} error 请求出错回调
     * @param {String} type 请求类型
     */
    interfaceRun: function (url, data, callback, error, type) {
        var me = this;
        //data.t = new Date().getTime();
        //data.Authorization = sessionStorage.getItem('access_token') || this.getCookie('access_token');
        $.ajax({
            url: url,
            data: data,
            type: type || 'POST',
            dataType: 'json',
            beforeSend: (request) => {
                request.setRequestHeader("Authorization", sessionStorage.getItem('access_token') || this.getCookie('access_token'));
            },
            xhrFields: {
                withCredentials: true
            },
            success: function (ret) {
                // me.removeLoading();
                callback(ret);
            },
            error: function (err) {
                me.removeLoading();
                if (err.responseJSON && (err.responseJSON.retStatus == '001' || err.responseJSON.error == 'invalid_token' || err.responseJSON.error == 'access_denied')) {
                    layer.msg('登录已过期!请重新登录!', {
                        icon: 2,
                        time: 1000,
                        id: 'invalid_token'
                    }, function () {
                        me.clearLocal();
                        window.location.href = '/login/login.html'
                    });
                } else {
                    layer.msg('接口请求失败', {
                        icon: 5,
                        anim: 6
                    });
                }

                typeof (error) == "function" && error(err);
            }
        });
    },
    /**
     * @description 封装文件上传
     * @param {String} url 请求地址
     * @param {Object} data 请求数据参数
     * @param {Function} callback 请求成功回调
     * @param {Function} error 请求出错回调
     * @param {String} type 请求类型
     */
    submitFile: function (url, data, callback, error, type) {
        var formData = new FormData();
        $.each(data, function (k, v) {
            formData.append(k, v);
        });
        //data.t = new Date().getTime();
        //data.Authorization = sessionStorage.getItem('access_token') || this.getCookie('access_token');
        $.ajax({
            url: url,
            data: formData,
            type: type || 'POST',
            dataType: 'json',
            cache: false, // 不缓存
            processData: false, // jQuery不要去处理发送的数据
            contentType: false, // jQuery不要去设置Content-Type请求头
            beforeSend: (request) => {
                request.setRequestHeader("Authorization", sessionStorage.getItem('access_token') || this.getCookie('access_token'));
            },
            xhrFields: {
                withCredentials: true
            },
            success: function (ret) {
                callback(ret);
            },
            error: function (err) {
                if (err.responseJSON && (err.responseJSON.retStatus == '001' || err.responseJSON.error == 'invalid_token' || err.responseJSON.error == 'access_denied')) {
                    layer.msg('登录已过期!请重新登录!', {
                        icon: 2,
                        time: 1000,
                        id: 'invalid_token'
                    }, function () {
                        if (typeof (Storage) !== "undefined") {
                            sessionStorage.clear();
                        } else {
                            wimp.clearCookie();
                        }
                        window.location.href = '/login/login.html'
                    });
                }

                typeof (error) == "function" && error(err);
            }
        });
    },
    /**
     * @desc 设置cookie
     * @param {Object} name cookie名
     * @param {Object} value cookie值
     * @param {Object} time 失效时间 s1为1分钟,h1为1小时,d1为1天
     */
    setCookie: function (name, value, time) {
        var strsec = auxiliary.getsec(time);
        var exp = new Date();
        exp.setTime(exp.getTime() + strsec * 1);
        document.cookie = name + "=" + escape(value) + ';path=/' + (typeof (time) == "undefined" ? '' : ";expires=" + exp.toGMTString());
    },
    /**
     * @desc 获取cookie
     * @param {Object} name cookie名称
     */
    getCookie: function (name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    },
    /**
     * @desc 刪除cookie
     * @param {Object} name cookie名称
     */
    delCookie: function (name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = this.getCookie(name);
        if (cval != null)
            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    },
    /**
     * @desc  清空所有cookie
     */
    clearCookie: function () {
        var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
        if (keys) {
            for (var i = keys.length; i--;)
                document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
        }
    },
    /**
     * @description 保存到本地
     * @param {String} key 字段名
     * @param {String} value 值
     */
    saveToLocal: function (key, value) {
        if (typeof (Storage) !== "undefined") {
            sessionStorage.setItem(key, value);
        } else {
            this.setCookie(key, value);
        }
    },
    /**
     * @description 删除本地数据
     * @param {String} key 字段名
     */
    delteLocal: function (key) {
        if (typeof (Storage) !== "undefined") {
            sessionStorage.removeItem(key);
        } else {
            this.delCookie(key);
        }
    },
    /**
     * @description 清空本地数据
     */
    clearLocal: function () {
        if (typeof (Storage) !== "undefined") {
            sessionStorage.clear();
        } else {
            this.clearCookie();
        }
    },
    /**
     * @description 获取本地数据
     * @param {String} key 字段名
     */
    getLocal: function (key) {
        let value;
        if (typeof (Storage) !== "undefined") {
            value = sessionStorage.getItem(key);
        } else {
            value = this.getCookie(key);
        }
        return value || null;
    },
    /**
     * [loading 添加loading]
     * @param  {[string]} dom [需要加loading的容器]
     */
    loading: function (dom, text) {
        var _dom = dom || '.app-wrapper',
            _tpl = ['<div class="loading-w lds-css ng-scope" > ',
                '    <div class="loading-box" >',
                '        <div class="lds-radio" >',
                '             <div></div>',
                '             <div></div>',
                '             <div></div>',
                '         </div>',
                '         <span>',
                text || '正在加载...',
                '	      </span>',
                '     </div>',
                '</div>'
            ].join("");

        var loading = ['<div class="loading-w lds-css ng-scope">',
            '<div class="loading-box lds-spinner">',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '<div></div>',
            '</div>'
        ].join("");

        var loading1 = `<div class="loading-w lds-css ng-scope">
							<svg viewBox="25 25 50 50" class="loading-box-1">
								<circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
							</svg>
						</div>`;
        if (!$(_dom).find('.loading-w').length) {
            //			$(_dom).append(loading);
            $(_dom).append(loading1);
        }
    },
    /**
     * [removeLoading 删除loading]
     */
    removeLoading: function (dom) {
        dom = dom || '';
        $(dom + ' .loading-w').remove();
    },
    /**
     * @description 添加全屏按钮
     * @param {Object} element 按钮添加到的元素
     * @param {Object} option 按钮的选项:btnClass按钮样式class类
     */
    addFullScreenBtn: function (element, option) {
        $(element || 'body').append('<div class="full-screen ' + (option && option.btnClass) + '" ><i></i></div>');
        $(document).off('click', '.full-screen').on('click', '.full-screen', function (e) {
            e.stopPropagation();
            auxiliary.requestFullScreen();
            $(this).removeClass('full-screen').addClass('exit-full-screen');
        }).off('click', '.exit-full-screen').on('click', '.exit-full-screen', function (e) {
            e.stopPropagation();
            auxiliary.exitFull();
            $(this).removeClass('exit-full-screen').addClass('full-screen');
        });
        window.onresize = function () { //esc退出全屏时
            if (!auxiliary.checkFull() && $('.exit-full-screen').length) {
                $('.exit-full-screen').removeClass('exit-full-screen').addClass('full-screen');
            }
        }

    },
    /**
     * @description 底部滑出屏幕按钮
     * @param {Object} element 需要添加滑出按钮的元素
     */
    slideBottomBtn: function (element) {
        if (!$(element).find('.slide-out-btn,.slide-in-btn').length) {
            $(element).prepend('<div class="slide-out-btn" title="收起"><i class="iconfont icon-moreunfold"></i></div>');
            $(document).off('click', '.slide-out-btn').on('click', '.slide-out-btn', function () {
                $(this).removeClass('slide-out-btn').attr('title', '展开').addClass('slide-in-btn').find('.iconfont').removeClass('icon-moreunfold').addClass('icon-less');
                $(this).parent().animate({
                    bottom: -$(this).parent().outerHeight().toFixed(0)
                }, 800);
            }).off('click', '.slide-in-btn').on('click', '.slide-in-btn', function () {
                $(this).removeClass('slide-in-btn').attr('title', '收起').addClass('slide-out-btn').find('.iconfont').removeClass('icon-less').addClass('icon-moreunfold');
                $(this).parent().animate({
                    bottom: 10
                }, 800);
            })
        }
    },
    /**
     * [preciseAdd 精准加法]
     * @param  {[number]} num1 [数字1]
     * @param  {[number]} num2 [数字2]
     * @return {[number]}      [数字]
     */
    preciseAdd: function (num1, num2) {
        const num1Digits = (num1.toString().split('.')[1] || '').length;
        const num2Digits = (num2.toString().split('.')[1] || '').length;
        const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
        return (num1 * baseNum + num2 * baseNum) / baseNum;
    },
    /**
     * @description 导出列表
     * @param {String} url 接口地址
     * @param {Object} data 接口参数
     * @param {String} title 导出文件名
     * @param {String} type 导出类型, 默认为excel, 可选 "csv"
     */
    exportList: function (url, data, title, type, requestType) {
        var params = '',
            type = type || 'application/vnd.ms-excel',
            requestType = requestType || 'GET';
        $.each(data, function (i, k) {
            params += `${i}=${data[i]}&`;
        });
        wimp.loading('body');
        var xhr = new XMLHttpRequest();
        xhr.open(requestType, url + '?' + params, true);
        xhr.responseType = 'arraybuffer';
        xhr.setRequestHeader("Authorization", sessionStorage.getItem('access_token') || this.getCookie('access_token'));
        xhr.onload = function (e) {
            var blob = new Blob([this.response], {
                type: type
            }),
                //fileName = xhr.getResponseHeader("content-disposition").split('=')[1];
                fileName = `${title}${type.toUpperCase() === 'CSV' ? '.csv' : '.xls'}`;
            if (window.navigator.msSaveOrOpenBlob) {
                navigator.msSaveBlob(blob, fileName);
            } else {
                var link = document.createElement('a');
                link.style = "display:none";
                $('body').append(link);
                link.href = window.URL.createObjectURL(blob);
                link.download = fileName;
                link.click();
                window.URL.revokeObjectURL(link.href);
                $(link).remove();
            }
            wimp.removeLoading('body');
        };
        xhr.send();
    },
    /**
     * @description 转换url参数为json
     * @param {String} url
     */
    getQueryObject: function (url) {
        url = url == null ? window.location.href : url;
        var search = url.substring(url.lastIndexOf("?") + 1);
        var obj = {};
        var reg = /([^?&=]+)=([^?&=]*)/g;
        search.replace(reg, function (rs, $1, $2) {
            var name = decodeURIComponent($1);
            var val = decodeURIComponent($2);
            val = String(val);
            obj[name] = val;
            return rs;
        });
        return obj;
    },
    /**
     * @description 格式化数字为千分位分隔
     * @param {Number} num 数字
     */
    formatNumber: function (num) {
        //	    return num && num.toString().replace(/(?=(?!^)(\d{3})+$)/g, ',')
        var num = num || 0;
        var res = num.toString().replace(/\d+/, function (n) { // 先提取整数部分
            return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
                return $1 + ",";
            });
        })
        return res
    },
    /**
     * bytesToSize 字节单位换算
     * @param bytes 传入以MB为单位的数据
     */
    bytesToSize: function (bytes) {
        var k = 1024;
        if (!bytes || bytes === 0) return '0 MB';
        if (typeof (bytes) == 'string') {
            return bytes
        } else {
            bytes = Math.abs(bytes); //正负数均变正数
            var sizes = ['MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toFixed(2) + sizes[i];
            //toFixed(2) 后面保留2位小数，如1.00GB
        } //return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
    /**
     * 全国省份-地级市数组
     */
    prefectureCity: function (str) {
        var obj = {
            "0": ["北京市", "天津市", "上海市", "重庆市", "河北省", "山西省", "内蒙古自治区", "辽宁省", "吉林省", "黑龙江省", "江苏省", "浙江省", "安徽省", "福建省", "江西省", "山东省", "河南省", "湖北省", "湖南省", "广东省", "广西壮族自治区", "海南省", "四川省", "贵州省", "云南省", "西藏自治区", "陕西省", "甘肃省", "青海省", "宁夏回族自治区", "新疆维吾尔自治区", "香港", "澳门", "台湾省"],
            "北京市": ["东城区", "西城区", "崇文区", "宣武区", "朝阳区", "丰台区", "石景山区", "海淀区", "门头沟区", "房山区", "通州区", "顺义区", "昌平区", "大兴区", "怀柔区", "平谷区", "密云县", "延庆县", "延庆镇"],
            "天津市": ["和平区", "河东区", "河西区", "南开区", "河北区", "红桥区", "塘沽区", "汉沽区", "大港区", "东丽区", "西青区", "津南区", "北辰区", "武清区", "宝坻区", "蓟县", "宁河县", "芦台镇", "静海县", "静海镇"],
            "上海市": ["黄浦区", "卢湾区", "徐汇区", "长宁区", "静安区", "普陀区", "闸北区", "虹口区", "杨浦区", "闵行区", "宝山区", "嘉定区", "浦东新区", "金山区", "松江区", "青浦区", "南汇区", "奉贤区", "崇明县", "城桥镇"],
            "重庆市": ["渝中区", "大渡口区", "江北区", "沙坪坝区", "九龙坡区", "南岸区", "北碚区", "万盛区", "双桥区", "渝北区", "巴南区", "万州区", "涪陵区", "黔江区", "长寿区", "合川市", "永川区市", "江津市", "南川市", "綦江县", "潼南县", "铜梁县", "大足县", "荣昌县", "璧山县", "垫江县", "武隆县", "丰都县", "城口县", "梁平县", "开县", "巫溪县", "巫山县", "奉节县", "云阳县", "忠县", "石柱土家族自治县", "彭水苗族土家族自治县", "酉阳土家族苗族自治县", "秀山土家族苗族自治县"],
            "河北省": ["石家庄市", "张家口市", "承德市", "秦皇岛市", "唐山市", "廊坊市", "保定市", "衡水市", "沧州市", "邢台市", "邯郸市"],
            "山西省": ["太原市", "朔州市", "大同市", "阳泉市", "长治市", "晋城市", "忻州市", "晋中市", "临汾市", "吕梁市", "运城市"],
            "内蒙古": ["呼和浩特市", "包头市", "乌海市", "赤峰市", "通辽市", "呼伦贝尔市", "鄂尔多斯市", "乌兰察布市", "巴彦淖尔市", "兴安盟", "锡林郭勒盟", "阿拉善盟"],
            "辽宁省": ["沈阳市", "朝阳市", "阜新市", "铁岭市", "抚顺市", "本溪市", "辽阳市", "鞍山市", "丹东市", "大连市", "营口市", "盘锦市", "锦州市", "葫芦岛市"],
            "吉林省": ["长春市", "白城市", "松原市", "吉林市", "四平市", "辽源市", "通化市", "白山市", "延边州"],
            "黑龙江省": ["哈尔滨市", "齐齐哈尔市", "七台河市", "黑河市", "大庆市", "鹤岗市", "伊春市", "佳木斯市", "双鸭山市", "鸡西市", "牡丹江市", "绥化市", "大兴安岭地区"],
            "江苏省": ["南京市", "徐州市", "连云港市", "宿迁市", "淮安市", "盐城市", "扬州市", "泰州市", "南通市", "镇江市", "常州市", "无锡市", "苏州市"],
            "浙江省": ["杭州市", "湖州市", "嘉兴市", "舟山市", "宁波市", "绍兴市", "衢州市", "金华市", "台州市", "温州市", "丽水市"],
            "安徽省": ["合肥市", "宿州市", "淮北市", "亳州市", "阜阳市", "蚌埠市", "淮南市", "滁州市", "马鞍山市", "芜湖市", "铜陵市", "安庆市", "黄山市", "六安市", "巢湖市", "池州市", "宣城市"],
            "福建省": ["福州市", "南平市", "莆田市", "三明市", "泉州市", "厦门市", "漳州市", "龙岩市", "宁德市"],
            "江西省": ["南昌市", "九江市", "景德镇市", "鹰潭市", "新余市", "萍乡市", "赣州市", "上饶市", "抚州市", "宜春市", "吉安市"],
            "山东省": ["济南市", "青岛市", "聊城市", "德州市", "东营市", "淄博市", "潍坊市", "烟台市", "威海市", "日照市", "临沂市", "枣庄市", "济宁市", "泰安市", "莱芜市", "滨州市", "菏泽市"],
            "河南省": ["郑州市", "开封市", "三门峡市", "洛阳市", "焦作市", "新乡市", "鹤壁市", "安阳市", "濮阳市", "商丘市", "许昌市", "漯河市", "平顶山市", "南阳市", "信阳市", "周口市", "驻马店市", "济源市"],
            "湖北省": ["武汉市", "十堰市", "襄樊市", "荆门市", "孝感市", "黄冈市", "鄂州市", "黄石市", "咸宁市", "荆州市", "宜昌市", "随州市", "省直辖县级行政单位", "恩施州"],
            "湖南省": ["长沙市", "张家界市", "常德市", "益阳市", "岳阳市", "株洲市", "湘潭市", "衡阳市", "郴州市", "永州市", "邵阳市", "怀化市", "娄底市", "湘西州"],
            "广东省": ["广州市", "深圳市", "清远市", "韶关市", "河源市", "梅州市", "潮州市", "汕头市", "揭阳市", "汕尾市", "惠州市", "东莞市", "珠海市", "中山市", "江门市", "佛山市", "肇庆市", "云浮市", "阳江市", "茂名市", "湛江市"],
            "广西": ["南宁市", "桂林市", "柳州市", "梧州市", "贵港市", "玉林市", "钦州市", "北海市", "防城港市", "崇左市", "百色市", "河池市", "来宾市", "贺州市"],
            "海南省": ["海口市", "三亚市", "省直辖行政单位"],
            "四川省": ["成都市", "广元市", "绵阳市", "德阳市", "南充市", "广安市", "遂宁市", "内江市", "乐山市", "自贡市", "泸州市", "宜宾市", "攀枝花市", "巴中市", "达州市", "资阳市", "眉山市", "雅安市", "阿坝州", "甘孜州", "凉山州"],
            "贵州省": ["贵阳市", "六盘水市", "遵义市", "安顺市", "毕节地区", "铜仁地区", "黔东南州", "黔南州", "黔西南州"],
            "云南省": ["昆明市", "曲靖市", "玉溪市", "保山市", "昭通市", "丽江市", "思茅市", "临沧市", "德宏州", "怒江州", "迪庆州", "大理州", "楚雄州", "红河州", "文山州", "西双版纳州"],
            "西藏": ["拉萨市", "那曲地区", "昌都地区", "林芝地区", "山南地区", "日喀则地区", "阿里地区"],
            "陕西省": ["西安市", "延安市", "铜川市", "渭南市", "咸阳市", "宝鸡市", "汉中市", "榆林市", "安康市", "商洛市"],
            "甘肃省": ["兰州市", "嘉峪关市", "白银市", "天水市", "武威市", "酒泉市", "张掖市", "庆阳市", "平凉市", "定西市", "陇南市", "临夏州", "甘南州"],
            "青海省": ["西宁市", "海东地区", "海北州", "海南州", "黄南州", "果洛州", "玉树州", "海西州"],
            "宁夏": ["银川市", "石嘴山市", "吴忠市", "固原市", "中卫市"],
            "新疆": ["乌鲁木齐市", "克拉玛依市", "自治区直辖县级行政单位", "喀什地区", "阿克苏地区", "和田地区", "吐鲁番地区", "哈密地区", "克孜勒苏柯州", "博尔塔拉州", "昌吉州", "巴音郭楞州", "伊犁州", "塔城地区", "阿勒泰地区"],
            "香港": ["香港特别行政区"],
            "澳门": ["澳门特别行政区"],
            "台湾省": ["台北", "高雄", "台中", "花莲", "基隆", "嘉义", "金门", "连江", "苗栗", "南投", "澎湖", "屏东", "台东", "台南", "桃园", "新竹", "宜兰", "云林", "彰化"]
        };
        return obj[str] || [];
    },
    /**
     * 民族数组
     */
    national: function () {
        var national = [
            "汉族", "壮族", "满族", "回族", "苗族", "维吾尔族", "土家族", "彝族", "蒙古族", "藏族", "布依族", "侗族", "瑶族", "朝鲜族", "白族", "哈尼族",
            "哈萨克族", "黎族", "傣族", "畲族", "傈僳族", "仡佬族", "东乡族", "高山族", "拉祜族", "水族", "佤族", "纳西族", "羌族", "土族", "仫佬族", "锡伯族",
            "柯尔克孜族", "达斡尔族", "景颇族", "毛南族", "撒拉族", "布朗族", "塔吉克族", "阿昌族", "普米族", "鄂温克族", "怒族", "京族", "基诺族", "德昂族", "保安族",
            "俄罗斯族", "裕固族", "乌孜别克族", "门巴族", "鄂伦春族", "独龙族", "塔塔尔族", "赫哲族", "珞巴族", "其他"
        ];
        return national;
    },
    /**
     * @description 转换秒数为天时分秒
     * @param {Number} second_time 秒数
     */
    convertSecond: function (second_time) {
        var time = parseInt(second_time) + "秒";
        if (parseInt(second_time) > 60) {

            var second = parseInt(second_time) % 60;
            var min = parseInt(second_time / 60);
            time = min + "分" + second + "秒";

            if (min > 60) {
                min = parseInt(second_time / 60) % 60;
                var hour = parseInt(parseInt(second_time / 60) / 60);
                time = hour + "小时" + min + "分" + second + "秒";

                if (hour > 24) {
                    hour = parseInt(parseInt(second_time / 60) / 60) % 24;
                    var day = parseInt(parseInt(parseInt(second_time / 60) / 60) / 24);
                    time = day + "天" + hour + "小时" + min + "分" + second + "秒";
                }
            }

        }

        return time;
    },
    /**
     * @description 身份证有效性校验
     * @param {String} code 身份证号
     * @param {Function} callback 校验失败的回调函数
     */
    identityCodeValid: function (code, callback) {
        var city = {
            11: "北京",
            12: "天津",
            13: "河北",
            14: "山西",
            15: "内蒙古",
            21: "辽宁",
            22: "吉林",
            23: "黑龙江 ",
            31: "上海",
            32: "江苏",
            33: "浙江",
            34: "安徽",
            35: "福建",
            36: "江西",
            37: "山东",
            41: "河南",
            42: "湖北 ",
            43: "湖南",
            44: "广东",
            45: "广西",
            46: "海南",
            50: "重庆",
            51: "四川",
            52: "贵州",
            53: "云南",
            54: "西藏 ",
            61: "陕西",
            62: "甘肃",
            63: "青海",
            64: "宁夏",
            65: "新疆",
            71: "台湾",
            81: "香港",
            82: "澳门",
            91: "国外 "
        };
        var tip = "";
        var pass = true;

        if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
            tip = "身份证号格式错误";
            pass = false;
        } else if (!city[code.substr(0, 2)]) {
            tip = "身份证号格式错误"; //"地址编码错误";
            pass = false;
        } else {
            //18位身份证需要验证最后一位校验位
            if (code.length == 18) {
                code = code.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                //校验位
                var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++) {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != code[17]) {
                    tip = "身份证号格式错误"; //"校验位错误";
                    pass = false;
                }
            }
        }
        if (!pass) callback && callback(tip);
        return pass;
    },
    /**
     * @description 给小数点后补0
     * @param {Number} value 需要补全的值
     * @param {Number} num 长度
     */
    addZeroToEnd: function (value, num) {
        var a, b, c, i;
        a = value.toString();
        b = a.indexOf(".");
        c = a.length;
        if (num == 0) {
            if (b != -1) {
                a = a.substring(0, b);
            }
        } else { //如果没有小数点
            if (b == -1) {
                a = a + ".";
                for (i = 1; i <= num; i++) {
                    a = a + "0";
                }
            } else { //有小数点，超出位数自动截取，否则补0
                //a = a.substring(0, b + num + 1);
                for (i = c; i <= b + num; i++) {
                    a = a + "0";
                }
            }
        }
        return a;
    },
    /**
     * @description 节流
     * @param {Object} func 需要执行的方法
     * @param {Object} wait 多久执行一次
     */
    throttle: function (func, wait) {
        this.throttleTime = this.throttleTime || new Date();
        if (new Date() - this.throttleTime >= wait) {
            func();
            this.throttleTime = new Date();
        }
    }
}

var auxiliary = {
    /**
     * @description 转换s1,h1, d1为毫秒数
     * @param {Object} str s1, h1, d1
     * @return {Number} 毫秒数
     */
    getsec: function (str) {
        if (str) {
            var str1 = str.substring(1, str.length) * 1;
            var str2 = str.substring(0, 1);
            if (str2 == "s") {
                return str1 * 1000;
            } else if (str2 == "h") {
                return str1 * 60 * 60 * 1000;
            } else if (str2 == "d") {
                return str1 * 24 * 60 * 60 * 1000;
            }
        }
    },
    /**
     * @description 请求全屏
     * @param {Object} element 全屏元素
     */
    requestFullScreen: function (element) {
        var el = document.querySelector(element) || document.documentElement;
        var fullScreen = el.requestFullscreen || el.mozRequestFullScreen || el.webkitRequestFullScreen || el.msRequestFullScreen;
        fullScreen && fullScreen.call(el);
    },
    /**
     * @description 退出全屏
     */
    exitFull: function () {
        var el = document;
        var exitFull = el.exitFullscreen || el.mozCancelFullScreen || el.webkitCancelFullScreen || el.webkitExitFullscreen;
        exitFull && exitFull.call(el);
    },
    /**
     * @description 判断全屏状态
     */
    checkFull: function () {
        var isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;

        //to fix : false || undefined == undefined
        if (isFull === undefined) isFull = false;
        return isFull;
    }
}

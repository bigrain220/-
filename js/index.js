$(document).ready(function () {

    window.onresize = function () {
        myChart ? myChart.resize() : "";
        myChart1 ? myChart1.resize() : "";
    }

     // 初始化选择时间
     var tem_date_com = getCookie("select_date") || '-6';
     $(".DateSelectBar span").removeClass('cur');
     $(".DateSelectBar span[data-date=" + tem_date_com + "]").addClass('cur');

    //今日流量
    $.ajax({
        type: "post",
        url: "/api/overview/start",
        success: function (res) {
            // console.log(res)
            for (var i = 0; i < res.length; i++) {
                $(".table-list tr").eq(i + 1).each(function (index, domEle) {
                    $(domEle).children('.number').each(function (index2, domEle2) {
                        $(domEle2).text(res[i][index2])
                    });
                });
            }
        }
    });

    // 趋势图
    var x_data = [];
    var y_data = [];
    var tem_date = getCookie("select_date") || '-6';
    var tem_type = 'pv';

    function getTrendEcharts(date, type) {
        x_data = [];
        y_data = [];
        var data = {
            "date": date,
            "type": type
        }
        $.ajax({
            type: "post",
            url: "/api/overview/trend",
            async: false,
            data: data,
            success: function (res) {
                // console.log(res)
                for (var i = 0; i < res.items[0].length; i++) {
                    var tem = res.items[0][i][0];
                    x_data.push(tem);

                    if (res.items[1][i][0] == "--") {
                        res.items[1][i][0] = 0;
                    };
                    var tem1 = res.items[1][i][0];
                    y_data.push(tem1);
                };

            }
        });
    }


    var myChart = echarts.init(document.getElementById('line'));
    var option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255,255,255,0.9)',
            textStyle: {
                color: '#666',
                fontSize: '14px',
            },
            extraCssText: 'width:180px;height:85px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            formatter: function (params) {
                var tem = params[0].name;
                var val = params[0].value;
                if (tem.indexOf('/') < 0) {
                    if (tem > 9) {
                        tem = tem + ':00 - ' + tem + ':59'
                    } else {
                        tem = '0' + tem + ':00 - ' + '0' + tem + ':59'
                    }
                }
                val > 0 ? val = val : val = '--'
                var res =
                    '<div><div style="height:35px;line-height:35px;padding:0 8px;background:rgba(237,233,233,0.4)">' +
                    tem +
                    '</div><div style="height:45px;line-height:45px;overflow:hidden;padding:0 8px;">' +
                    '<span style="float:left">' +
                    '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                    params[0].color + ';"></span>' + params[0].seriesName + '</span>' +
                    '<span style="float:right">' + val + '</span>' + '</div></div>'
                return res;
            },
        },
        textStyle: {
            color: '#999',
        },
        color: 'rgb(79, 168, 249)',
        grid: {
            left: '13%',
            right: '7%',
        },
        legend: {
            left: 'center',
            bottom: 10,
            itemWidth: 4,
            itemHeight: 10,
            textStyle: {
                padding: [0, 0, 0, 12]
            },
            data: []
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: "#eee"
                }
            },
            data: []
        }],
        yAxis: [{
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: "#eee"
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#eee',
                }
            }
        }],
        series: [{
            name: '',
            type: 'line',
            areaStyle: {
                color: 'rgb(79, 168, 249)',
                opacity: '0.2'
            },
            lineStyle: {
                color: 'rgb(79, 168, 249)'
            },
            symbol: 'circle',
            symbolSize: '5',
            data: []
        }, ]
    };
    myChart.setOption(option);

    function setMyCharts(val, lineType) {
        var arr = [];
        arr.push(lineType);
        myChart.setOption({
            xAxis: {
                data: x_data,
                axisLabel: {
                    interval: val
                },
            },
            legend: {
                data: arr
            },
            series: {
                name: lineType,
                data: y_data
            }
        })
        $('.table-item .time-loading').css('display', 'none')
    }

    // 默认
    getTrendEcharts(tem_date, 'pv');
    getIndexTable(tem_date);
    if (tem_date == '-29') {
        setMyCharts(6,'浏览量(PV)');
    } else {
        setMyCharts(1,'浏览量(PV)');
    }


    //选择日期
    $(".DateSelectBar span.trackable").on("click", function (e) {
        $(this).addClass('cur');
        $(this).siblings().removeClass('cur');
        $('.table-item .loading').css('display', 'block');
        var type = $(".first-row .group li.cur").text();
        setTimeout(function () {
            tem_date = e.target.getAttribute("data-date");
            setCookie("select_date",tem_date,5);
            getTrendEcharts(tem_date, tem_type);
            getIndexTable(tem_date);
            getMapData(tem_date);
            setMyCharts1(mapData);

            if (tem_date == '-29') {
                setMyCharts(6,type);
            } else {
                setMyCharts(1,type);
            }
        }, 500)

    });
    //选择类型
    $(".first-row .group li").on("click", function (e) {
        $(this).addClass('cur');
        $(this).siblings().removeClass('cur');
        tem_type = e.target.getAttribute("data-type");
        getTrendEcharts(tem_date, tem_type);
        var type = $(this).text();
        if (tem_date == '-29') {
            setMyCharts(6, type);
        } else {
            setMyCharts(1, type);
        }

    });



    function getIndexTable(param) {
        //搜索词
        $.ajax({
            type: "post",
            url: "/api/overview/keyword",
            data: {
                "date": param
            },
            success: function (res) {
                // console.log(res)
                var searchwordsDom = "";
                if (res.items[0].length == 0) {
                    $('.searchwords-table tbody').html("<tr><td style='font-weight:bolder;font-size:18px;color:#999;'>暂无数据</td></tr>");
                } else {
                    for (var i = 0; i < res.items[0].length; i++) {
                        var search_percent = Math.floor(res.items[1][i][1] * 10000) / 100 + '%';
                        searchwordsDom += "<tr><td class='ellipsis'><a title='" + res.items[0][i] + "' target=_blank href='http://www.baidu.com/s?wd="+  res.items[0][i]+ "'>" + res.items[0][i] + "</a></td><td>" +
                            res.items[1][i][0] + "</td><td>" + search_percent + "</td></tr>";
                    }
                    $('.searchwords-table tbody').html(searchwordsDom);
                    $('.searchwords-table tbody a').css("color",'#323437');
                };
                $('.table-item .searchwords-loading').css('display', 'none');
            }
        });
        //受访页面
        $.ajax({
            type: "post",
            url: "/api/overview/request",
            data: {
                "date": param
            },
            success: function (res) {
                // console.log(res)
                var toppageDom = "";
                if (res.items[0].length == 0) {
                    $('.toppage-table tbody').html("<tr><td style='font-weight:bolder;font-size:18px;color:#999;'>暂无数据</td></tr>");
                } else {
                    for (var i = 0; i < res.items[0].length; i++) {
                        var page_percent = Math.floor(res.items[1][i][1] * 10000) / 100 + '%';
                        toppageDom += "<tr><td class='ellipsis'><a target='_blank' href='" + res.items[0][i] + "' title='" + res.items[0][i] + "'>" +
                            res.items[0][i] + "</a></td><td>" + res.items[1][i][0] + "</td><td>" + page_percent + "</td></tr>";
                    }
                    $('.toppage-table tbody').html(toppageDom);
                };
                $('.table-item .toppage-loading').css('display', 'none');
            }
        });
    }


    //地域分布

    var myChart1 = echarts.init(document.getElementById('map'));
    var mapData = [];
    var percentArr = [];
    var mapMax = 10;

    function getMapData(param) {
        $.ajax({
            type: "post",
            url: "/api/overview/province",
            data: {
                "date": param
            },
            async: false,
            success: function (res) {
                // console.log(res)
                mapData = [];
                percentArr = [];
                for (var i = 0; i < res.items[0].length; i++) {
                    var tem_obj = {};
                    tem_obj.name = res.items[0][i][0];
                    tem_obj.value = res.items[1][i][0];
                    mapData.push(tem_obj);
                    percentArr.push(Math.floor(res.items[1][i][1] * 10000) / 100 + '%');
                    mapMax <= res.items[1][i][0] ? mapMax = res.items[1][i][0] : mapMax = mapMax;
                }
            }
        });
    }


    var optionMap = {
        backgroundColor: '#fff',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255,255,255,0.9)',
            textStyle: {
                color: '#666',
                fontSize: '14px',
            },
            extraCssText: 'width:180px;height:90px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            formatter: function (params) {
                // console.log(params)
                var val = params.value;
                val > 0 ? val = val : val = '--';
                var percent = percentArr[params.dataIndex];
                percent ? percent = percent : percent = '--';
                var res =
                    '<div><div style="height:35px;line-height:35px;padding:0 8px;background:rgba(237,233,233,0.4)">' +
                    '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:rgb(79, 168, 249);"></span>' +
                    params.name +
                    '</div><div style="height:30px;line-height:30px;overflow:hidden;padding:0 8px;">' +
                    '<span style="float:left">' + params.seriesName + '</span>' +
                    '<span style="float:right">' + val + '</span></div>' +
                    '<div style="height:30px;line-height:30px;overflow:hidden;padding:0 8px;"><span style="float:left">' +
                    '占比' + '</span>' +
                    '<span style="float:right">' + percent + '</span></div>'
                '</div>'
                return res;
            },
        },
        //左侧小导航图标
        visualMap: {
            show: true,
            type: 'continuous',
            x: 'left',
            y: 'bottom',
            text: ['高', '低'],
            // min: 0,
            // max: 2000,
            realtime: false,
            calculable: false,
            show: false,
            color: ['#3385e3', '#5b9ce9', '#90bcf0', '#c6ddf7', '#ebf3fc']
        },
        //配置属性
        series: [{
            name: '浏览量',
            type: 'map',
            mapType: 'china',
            roam: false,
            label: {
                normal: {
                    show: false //省份名称
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#e6e6e6',
                    borderColor: '#ffffff'
                },
                emphasis: {
                    borderWidth: 0,
                    borderColor: '#fddd67',
                    areaColor: "#fddd67",
                    shadowColor: 'rgba(0, 0, 0, 0)'
                }
            },
            left: '10%',
            top: '15%',
            bottom: '10%',
            right: '10%',
            data: [] //数据
        }]
    };
    myChart1.setOption(optionMap);

    function setMyCharts1(mapData) {
        mapMax > 500 ? mapMax = 500 : mapMax = mapMax;
        myChart1.setOption({
            visualMap: {
                min: 0,
                max: mapMax,
            },
            series: [{
                data: mapData //数据
            }]
        });
        $('.table-item .district-loading').css('display', 'none');
    }

    //默认
    getMapData(tem_date);
    setMyCharts1(mapData);

});
$(document).ready(function () {

    var words = location.href.split("/source/")[1];
    var URL = "";
    switch (words) {
        case 'all':
            URL = "/api/source/source";
            break;
        case 'engine':
            URL = "/api/source/engine";
            break;
        default:
            console.log('default')
            URL = "/api/source/source";
    }


    var tem_date = getCookie("select_date") || '-6';
    var tem_type = 'pv';
    var tem_method = 'f';
    var mapData = [];
    var lineData = [];
    var x_data = [];
    var line_legend = [];
    var num_data = [];

    var tShowMethod = 'a';
    var tShowPage = '1';
    var tShowRows = '20';
    var tShowOrder = 'pv,desc';
    var amount = "";


    function getSourceCharts(date, type, method) {
        $.ajax({
            type: "post",
            url: URL,
            async: false,
            cache: false,
            data: {
                "date": date,
                "type": type,
                "method": method
            },
            success: function (res) {
                // console.log(res);
                mapData = [];
                x_data = [];
                num_data = [];
                line_legend = [];
                lineData = [];
                line_legend = res.line.fields;
                for (var i = 0; i < res.pie.items[0].length; i++) {
                    var tem_obj = {};
                    if (res.pie.items[1][i][0] > 0) {
                        tem_obj.name = res.pie.items[0][i][0];
                        tem_obj.value = res.pie.items[1][i][0];
                        mapData.push(tem_obj);
                    }
                    if(i<4){
                        mapData[i].label = {show:true};
                        mapData[i].labelLine = {show:true};
                    }
                };
                for (var i = 0; i < res.line.fields.length; i++) {
                    var tem_obj1 = {};
                    tem_obj1.name = res.line.fields[i];
                    tem_obj1.data = [];
                    if (tem_obj1.name.indexOf('总计') > 0) {
                        tem_obj1.type = 'bar';
                        tem_obj1.barWidth = '60%';
                    } else {
                        tem_obj1.type = 'line';
                        tem_obj1.symbol = 'circle';
                        tem_obj1.symbolSize = '5';
                    }
                    lineData.push(tem_obj1);
                    for (var j = 0; j < res.line.items[0].length; j++) {
                        x_data.push(res.line.items[0][j][0]);
                        num_data.push(j);
                        res.line.items[1][j][i] == '--' ? lineData[i].data.push(0) : lineData[i].data.push(res.line.items[1][j][i])
                    }
                };
                var sum = lineData.splice(0, 1);
                lineData.push(sum[0]);
                var sum1 = line_legend.splice(0, 1);
                line_legend.push(sum1[0]);
            }

        });

    }

    function getTableShow(method, page, rows, date, order) {
        $.ajax({
            type: "post",
            url: URL,
            data: {
                "method": method,
                "page": page,
                "rows": rows,
                "date": date,
                "order": order
            },
            async: false,
            success: function (res) {
                // console.log(res);
                $(".header-container .header-data").text('(' + res.timeSpan[0] + ')');
                $('#summary table.summary tbody td').not('.last-space').each(function (index, domEle) {
                    $(domEle).children('div.value').html(res.sum[index]);
                    $(domEle).children('div.value').attr('title', res.sum[index]);
                });
                //tbody
                $('#table-show tbody').html('');
                if (res.items[0]) {
                    var items_one = res.items[0];
                    for (var i = 0; i < items_one.length; i++) {
                        function getLink() {
                            if (items_one[i][0] === "搜索引擎") {
                                return "<div class='td-content'>" + "<a href='/user/source/engine' title='" + items_one[i][0] + "'>" + items_one[i][0] + "</a></div>"
                            } else if (items_one[i][0] === "外部链接") {
                                return "<div class='td-content'>" + "<a href='/user/source/link' title='" + items_one[i][0] + "'>" + items_one[i][0] + "</a></div>"
                            } else if (items_one[i][0] === "直接访问") {
                                return "<div class='td-content'  title='" + items_one[i][0] + "'>" + items_one[i][0] + "</div>"
                            } else {
                                return "<div class='td-content'  title='" + items_one[i][0] + "'>" + items_one[i][0] + "</div>"
                            }
                        }
                        var tableList =
                            "<tr class='line' id='" + "table-tr_" + i + "'>" +
                            "<td class='number-col'>" +
                            "<div class='expand' data-link='" + items_one[i][0] + "'></div>" +
                            "<div class='td-content' title='" + ((Number(tShowPage) - 1) * Number(tShowRows) + Number(i + 1)) + "'>" + ((Number(tShowPage) - 1) * Number(tShowRows) + Number(i + 1)) + "</div>" +
                            "</td>" +
                            "<td class='table-index  first ellipsis'>" +
                            getLink() +
                            "</td>" +
                            "</tr>"
                        $("#table-show tbody").append(tableList);
                        if (items_one[i][0] === "直接访问") {
                            $("#table-show tbody tr").eq(i).children("td.number-col").children().first().removeClass('expand')
                        }
                        for (var j = 0; j < res.items[1][i].length; j++) {
                            var tableItem = "<td class='number'>" +
                                "<div class='td-content'>" + res.items[1][i][j] + "</div>" +
                                "</td>"
                            $("#table-show tbody .line").eq(i).append(tableItem);
                        }
                    }
                };
                //tfoot
                $('#table-show  tfoot td.number').replaceWith('');
                for (var k = 0; k < res.pageSum.length; k++) {
                    var pageSumDom = "<td class='number'><div class='td-content'>" + res.pageSum[k] + "</div></td>";
                    $("#table-show tfoot tr").append(pageSumDom);
                }
                //total
                amount = res.total
            }
        });
        //expand事件
        $(".table-expand .expand").on('click', function (e) {
            e.preventDefault();
            if ($(this).attr('data-link') === '搜索引擎') {
                var expandUrl = "/api/source/engine";
            } else if ($(this).attr('data-link') === '外部链接') {
                var expandUrl = "/api/source/domain";
            }
            var expand_index = $(this).parent().parent().attr("id");
            $(this).toggleClass("opened");
            var _this = $(this);
            if (_this.hasClass("opened")) {
                $.ajax({
                    type: "post",
                    url: expandUrl,
                    data: {
                        "method": tShowMethod,
                        "page": "1",
                        "rows": "10",
                        "date": tem_date,
                        "order": tShowOrder,
                    },
                    async: false,
                    success: function (res) {
                        // console.log(res, 'expand');
                        if (res.items[0].length > 0) {
                            var items_name = res.items[0];
                            for (var i = items_name.length - 1; i >= 0; i--) {
                                function getLink() {
                                    if (expandUrl === "/api/source/engine") {
                                        return "<div class='td-content'  title='" + items_name[i][0] + "'>" + items_name[i][0] + "</div>"
                                    } else if (expandUrl === "/api/source/domain") {
                                        return "<div class='td-content'>" + "<a href='http://" + items_name[i][0] + "' title='" + items_name[i][0] + "' target=_blank>" + items_name[i][0] + "</a></div>"
                                    }
                                }
                                var tableList =
                                    "<tr class='sub-line " + _this.parent().parent().attr("id") + "'>" +
                                    "<td class='number-col'>" +
                                    "</td>" +
                                    "<td class='table-index  first'>" +
                                    // "<div class='td-content'>" + items_name[i][0]+ "</div>" +
                                    getLink() +
                                    "</td>" +
                                    "</tr>"
                                _this.parent().parent().after(tableList);
                                var tableItem = "";
                                for (var j = 0; j < res.items[1][i].length; j++) {
                                    tableItem += "<td class='number'>" +
                                        "<div class='td-content'>" + res.items[1][i][j] + "</div>" +
                                        "</td>"
                                }
                                $("." + expand_index).eq(0).append(tableItem);
                            }
                            $("." + expand_index).first().addClass("sub-line-first");
                            $("." + expand_index).last().addClass("sub-line-last");
                        }
                    }
                });
            } else {
                $("." + expand_index).remove();
            }
        });
    }




    //选择时间
    $('#date-select-bar .trackable').on('click', function () {
        tShowPage = '1';
        tShowRows = '20';
        $(this).addClass('cur');
        $(this).siblings().removeClass('cur');
        tem_date = $(this).attr('data-date');
        $('.echarts-box .loading').css('display', 'block');
        setTimeout(function () {
            getSourceCharts(tem_date, tem_type, tem_method);
            setMyCharts();
            getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
            getPaging();
        }, 500);
    });

    //选择type
    $('.table-echarts ul.group li').on('click', function () {
        $(this).addClass('cur');
        $(this).siblings().removeClass('cur');
        tem_type = $(this).attr('data-type');
        getSourceCharts(tem_date, tem_type, tem_method);
        setMyCharts()
    });


    //排序
    $("#table-show .group-item div.td-content").on("click", function (e) {
        if ($(this).parent().hasClass('desc')) {
            $("#table-show .group-item td.number").removeClass('desc');
            $(this).parent().addClass('asc');
        } else if ($(this).parent().hasClass('asc')) {
            $("#table-show .group-item td.number").removeClass('asc');
            $(this).parent().addClass('desc');
        } else {
            $("#table-show .group-item td.number").removeClass('desc');
            $("#table-show .group-item td.number").removeClass('asc');
            $(this).parent().addClass('desc');
        };

        var str = $(this).parent().attr('data-type') + $(this).parent().attr('class');
        tShowOrder = str.replace(/number /, ",");
        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
        // getPaging();
    });



    //全局饼图配置
    var myChart = echarts.init(document.getElementById('all_circle'));
    var option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255,255,255,0.9)',
            textStyle: {
                color: '#666',
                fontSize: '14px',
            },
            confine: true,
            extraCssText: 'width:220px;height:110px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            formatter: function (params) {
                var val = params.value;
                val > 0 ? val = val : val = '--'
                var res =
                    '<div><div style="height:35px;line-height:35px;padding:0 8px;background:rgba(237,233,233,0.4);">' +
                    '<span style="margin-right:5px;margin-bottom:13px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                    params.color + ';"></span>' +
                    '<span style="display:inline-block;width:100px;height:100%;line-height:35px;overflow: hidden;white-space: nowrap; text-overflow: ellipsis;">' +
                    params.name + '</span>' +
                    '</div><div style="height:30px;line-height:30px;overflow:hidden;padding:0 8px;">' +
                    '<span style="float:left">' + params.seriesName + '</span>' +
                    '<span style="float:right">' + val + '</span></div>' +
                    '<div style="height:30px;line-height:30px;overflow:hidden;padding:0 8px;"><span style="float:left">' +
                    '占比' + '</span>' +
                    '<span style="float:right">' + params.percent + '%' + '</span></div>'
                '</div>'
                return res;
            },
        },
        textStyle: {
            color: 'rgb(50, 52, 55)',
        },
        color: [],
        series: [{
            name: '',
            type: 'pie',
            data: []
        }, ]
    };
    myChart.setOption(option);


    function setMyCharts() {
        $('.echarts-box .loading').css('display', 'none');
        var Arr = ['#4fa8f9', '#6ec71e', '#f56e6a', '#fc8b40', '#818af8', '#31c9d7', '#f35e7a', '#ab7aee', '#14d68b', '#cde5ff'];
        var colorArr = Arr.slice(0, line_legend.length - 1);
        colorArr.push('#cde5ff');
        var  toolTipsH ="width:180px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);height:"+(40+line_legend.length*28)+"px";
        var name_type = $('.table-echarts ul.group li.cur').text();
        var inter_val = 2;
        var xData = [];
        if (tem_date > -6) {
            inter_val = 2;
            xData = num_data.splice(0, 24);
        } else if (tem_date == -6) {
            inter_val = 1;
            xData = x_data.splice(0, 7);
        } else {
            inter_val = 4;
            xData = x_data.splice(0, 30);
        }

        //饼图
        if (URL === "/api/source/source") {
            myChart.setOption({
                color: colorArr,
                series: {
                    labelLine: {
                        length: 10,
                        length2: 6,
                    },
                    radius: ['50%', '70%'],
                    name: name_type,
                    data: mapData
                }
            })
        } else if (URL === "/api/source/engine") {
            myChart.setOption({
                color: colorArr,
                series: {
                    radius: ['50%', '70%'],
                    label: {
                        formatter: '{d}%',
                        show:false
                    },
                    labelLine: {
                        length: 10,
                        length2: 6,
                        show:false,
                    },
                    name: name_type,
                    data: mapData
                }
            });
        }
        //折线图和柱状图
        // console.log(lineData, 'lineData')
        var myChart1 = echarts.init(document.getElementById('all_line'));
        myChart1 ? myChart1.clear() : "";
        var option1 = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255,255,255,0.8)',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                    shadowStyle: {
                        color: 'rgba(150,150,150,0.2)'
                    }
                },
                textStyle: {
                    color: '#666',
                    fontSize: '14px',
                },
                // extraCssText: 'width:180px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
                extraCssText:toolTipsH,
                formatter: function (params) {
                    var htmlStr = "";
                    for (var i = 0; i < params.length - 1; i++) {
                        var tem = params[i].name;
                        var val = params[i].value;
                        if (tem.indexOf('/') < 0) {
                            tem > 9 ? tem = tem + ":00 - " + tem + ":59" : tem = "0" + tem + ":00 - " + "0" + tem + ":59";
                        }
                        val > 0 ? val = val : val = '--'
                        htmlStr +=
                            '<div style="height:26px;line-height:26px;overflow:hidden;padding:6px 8px;">' +
                            '<span style="float:left">' +
                            '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                            params[i].color + ';"></span>' + params[i].seriesName + '</span>' +
                            '<span style="float:right">' + val + '</span>' + '</div>'
                    }
                    var last = params[params.length - 1].value;
                    last > 0 ? last = last : last = '--'
                    var res =
                        '<div><div style="height:40px;line-height:40px;padding:0 8px;background:rgba(237,233,233,0.4)">' +
                        tem + '<span style="float:right;">' + $('.table-echarts ul.group li.cur').text() + '</span>' + htmlStr +
                        '<div style="height:26px;line-height:26px;overflow:hidden;padding:6px 8px;">' +
                        '<span style="float:left">' +
                        '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:2px;background-color:' +
                        params[params.length - 1].color + ';"></span>' + params[params.length - 1].seriesName + '</span>' +
                        '<span style="float:right">' + last + '</span>' + '</div>' +
                        '</div></div>'
                    return res;
                },
            },
            textStyle: {
                color: 'rgb(120, 122, 125)',
            },
            color: colorArr,
            grid: {
                top: 30, //越大越靠下，默认60
                left: '35%',
                bottom: 60
            },
            legend: {
                bottom: 4,
                itemGap: 45,
                itemWidth: 9,
                itemHeight: 10,
                textStyle: {
                    padding: [0, 0, 0, 12]
                },
                data: line_legend
            },
            xAxis: [{
                type: 'category',
                // boundaryGap: false,//坐标轴两边留白策略
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    interval: inter_val
                },
                axisLine: {
                    lineStyle: {
                        color: "#ddd"
                    }
                },
                data: xData,
            }],
            yAxis: [{
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: "transparent"
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#eee',
                    }
                }
            }],
            series: lineData
        };
        myChart1.setOption(option1);
        window.onresize = function () {
            myChart ? myChart.resize() : "";
            myChart1 ? myChart1.resize() : "";
        };
         //echarts点击事件
         myChart1.on('legendselectchanged', function (params) {
            var legend_option = this.getOption();
            //切换tooltips的高度   
            var selectArr = Object.values(params.selected);
            var selectTotal = 0;
            for (var j = 0; j < selectArr.length; j++) {
                if (selectArr[j] === true) {
                    selectTotal += 1;
                }
            }
            legend_option.tooltip[0].extraCssText = "width:180px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);height:" + (40 + selectTotal * 28) + "px";
            this.setOption(legend_option)
        });

    }




    //初始化
     getSourceCharts(tem_date, tem_type, tem_method);
    setMyCharts();
    getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
    getPaging();


    function getPaging() {
        $('#pageToolbar').html('');
        //分页
        if (amount <= 20) {
            $('#pageToolbar').css('display', 'none');
        } else {
            $('#pageToolbar').css('display', 'block');
            $('#pageToolbar').Paging({
                pagesize: 20,
                count: amount,
                toolbar: true,
                hash: true,
                pageSizeList: [20, 50, 100],
                changePagesize: function (ps) {
                    // console.log("pagerows",ps);
                    tShowRows = ps;
                    tShowPage = '1';
                    getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
                },
                callback: function (a) {
                    // console.log("page",a)
                    tShowPage = a;
                    getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
                }
            });
        }
    }

});
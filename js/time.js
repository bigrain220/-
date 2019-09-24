$(document).ready(function () {

    window.onresize = function () {
        myChart ? myChart.resize() : "";
    }


    var tem_date = getCookie("select_date") || '-6';
    var tem_type = 'pv';
    var tem_method = 'f';
    var tem_format = '0';
    var x_data = [];
    var y_data = [];
    var num_data = [];

    var tShowMethod = 'a';
    var tShowPage = '1';
    var tShowRows = '20';
    var tShowOrder = 'tm,desc';
    var amount = "";

    function getTrendTime(date, type, format, tem_method) {
        x_data = [];
        y_data = [];
        num_data = [];
        $.ajax({
            type: "post",
            url: "/api/trend/time",
            async: false,
            data: {
                "date": date,
                "type": type,
                "format": format,
                "method": tem_method,
            },
            success: function (res) {
                // console.log(res);
                $(".header-container .header-data").text('(' + res.timeSpan[0] + ')');
                for (var i = 0; i < res.items[0].length; i++) {
                    x_data.push(res.items[0][i][0]);
                    if (res.items[1][i][0] == "--") {
                        res.items[1][i][0] = 0;
                    };
                    y_data.push(res.items[1][i][0]);
                    num_data.push(i);
                }

            }
        });
    };

    function getTableShow(method, page, rows, date, order, format) {
        $.ajax({
            type: "post",
            url: "/api/trend/time",
            data: {
                "method": method,
                "page": page,
                "rows": rows,
                "date": date,
                "order": order,
                "format": format
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
                        var tableList =
                            "<tr class='line'>" +
                            "<td class='number-col'>" +
                            // "<div class='td-content' title='" + (i + 1) + "'>" + (i + 1) + "</div>" +
                            "<div class='td-content' title='" + ((Number(tShowPage)-1)*Number(tShowRows)+Number(i + 1)) + "'>" + ((Number(tShowPage)-1)*Number(tShowRows)+Number(i + 1)) + "</div>" +
                            "</td>" +
                            "<td class='table-index  first'>" +
                            "<div class='td-content'>" + items_one[i][0] + "</div>" +
                            "</td>" +
                            "</tr>"
                        $("#table-show tbody").append(tableList);
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
    }



    //选择时间
    $('#date-select-bar .trackable').on('click', function () {
        tShowPage = '1';
        tShowRows = '20';
        $(this).addClass('cur');
        $(this).siblings().removeClass('cur');
        tem_date = $(this).attr('data-date');
        getTrendTime(tem_date, tem_type, tem_format, tem_method);
        setLine();
        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder, tem_format);
        getPaging();
    });

    //选择type
    $('.table-echarts ul.group li').on('click', function () {
        $(this).addClass('cur');
        $(this).siblings().removeClass('cur');
        tem_type = $(this).attr('data-type');
        getTrendTime(tem_date, tem_type, tem_format, tem_method);
        setLine();
    });

    //选择format
    $('#time-span>a').not('.disabled ').on('click', function () {
        tShowPage = '1';
        tShowRows = '20';
        $(this).not(".disabled").addClass('selected');
        $(this).not(".disabled").siblings().removeClass('selected');
        tem_format = $(this).attr('data-format');
        getTrendTime(tem_date, tem_type, tem_format, tem_method);
        setLine();
        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder, tem_format);
        getPaging();
    })

    //排序
    $("#table-show .group-item div.td-content").on("click", function (e) {
        $("#table-show  thead .group-title .table-index").removeClass('desc');
        $("#table-show  thead .group-title .table-index").removeClass('asc');
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
        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder, tem_format);
        // getPaging();
    });
    $("#table-show .group-title .table-index div.td-content").on("click", function (e) {
        $("#table-show  thead .group-item td.number").removeClass('desc');
        $("#table-show  thead .group-item td.number").removeClass('asc');
        if ($(this).parent().hasClass('desc')) {
            $(this).parent().removeClass('desc');
            $(this).parent().addClass('asc');
            tShowOrder = 'tm,asc';
        } else if ($(this).parent().hasClass('asc')) {
            $(this).parent().removeClass('asc');
            $(this).parent().addClass('desc');
            tShowOrder = 'tm,desc';
        } else {
            $(this).parent().addClass('desc');
            tShowOrder = 'tm,desc';
        };

        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder, tem_format);
        // getPaging();
    });


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
        },
        textStyle: {
            color: '#999',
        },
        color: 'rgb(79, 168, 249)',
        legend: {
            left: 'center',
            bottom: 5,
            itemWidth: 4,
            itemHeight: 10,
            textStyle: {
                padding: [0, 0, 0, 12]
            },
            data: []
        },
        grid: {
            left: '5%',
            right: '5%',

        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: "#eee"
                }
            },
            // axisLabel: {
            //     interval: 1
            // },
            data: []
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

    function setLine() {
        var xData = [];
        var inter_val = 1;
        if ($('#time-span a.selected').text() == '按时') {
            xData = num_data;
        } else {
            if (tem_date == '-29') {
                inter_val = 4;
            }
            xData = x_data;
        }
        var name_type = $('.table-echarts ul.group li.cur').text();
        var arr = [];
        arr.push(name_type);
        myChart.setOption({
            xAxis: [{
                axisLabel: {
                    interval: inter_val
                },
                data: xData,
            }],
            tooltip: {
                formatter: function (params) {
                    // console.log(params[0])
                    var tem = params[0].name;
                    if (tem.indexOf('/') < 0) {
                        tem > 9 ? tem = tem + ":00 - " + tem + ":59" : tem = "0" + tem + ":00 - " + "0" + tem + ":59";
                    }
                    var val = params[0].value;
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
            legend: {
                data: arr
            },
            series: {
                name: name_type,
                data: y_data
            }
        })
    }

    // 初始化
    getTrendTime(tem_date, tem_type, tem_format, tem_method);
    setLine();
    getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder, tem_format);
    getPaging();

    function getPaging() {
        $('#pageToolbar').html('');
        //分页
        if (amount <= 20 || tem_format == '0') {
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
                    getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder, tem_format);
                },
                callback: function (a) {
                    // console.log("page",a)
                    tShowPage = a;
                    getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder, tem_format);
                }
            });
        }
    }


});
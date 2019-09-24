$(document).ready(function () {
    window.onresize = function () {
        myChart ? myChart.resize() : "";
    };


    var x_data = [];
    var y_data = [];
    var tem_date = getCookie("select_date") || '-6';
    var tem_type = 'pv';
    var tem_method = 'f';


    var tShowMethod = 'a';
    var tShowPage = '1';
    var tShowRows = '20';
    var tShowOrder = 'pv,desc';
    var amount = "";


    function getClientLine(date, type, method) {
        var query = $(".rpt-filter .tabs li.selected").attr("data-query");
        x_data = [];
        y_data = [];
        $.ajax({
            type: "post",
            url: "/api/visitor/" + query,
            async: false,
            data: {
                "date": date,
                "type": type,
                "method": method
            },
            success: function (res) {
                // console.log(res);
                $(".header-container .header-data").text('(' + res.timeSpan[0] + ')');
                for (var i = 0; i < res.items[0].length; i++) {
                    var tem_obj = {};
                    tem_obj.name = res.items[0][i][0];
                    tem_obj.value = res.items[1][i][0];
                    y_data.push(tem_obj)
                    x_data.push(res.items[0][i][0]);
                }
            }
        });
    }


    function getTableShow(method, page, rows, date, order) {
        var query = $(".rpt-filter .tabs li.selected").attr("data-query");
        $.ajax({
            type: "post",
            url: "/api/visitor/" + query,
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
                            "<div class='td-content'>" + items_one[i][0].name + "</div>" +
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
        getClientLine(tem_date, tem_type, tem_method);
        setClientLine();
        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
        getPaging();
    });

    //选择type
    $('.table-echarts ul.group li').on('click', function () {

        $(this).addClass('cur');
        $(this).siblings().removeClass('cur');
        tem_type = $(this).attr('data-type');
        getClientLine(tem_date, tem_type, tem_method);
        setClientLine();
    });

    //切换tab
    $(".rpt-filter .tabs ul li").on("click", function (e) {
        tShowPage = '1';
        tShowRows = '20';
        $(this).siblings().removeClass('selected');
        $(this).addClass('selected');
        var TableTitle = $(this).children("a").text();
        $("#table-show  thead .simple_date_title div.td-content").text(TableTitle);
        getClientLine(tem_date, tem_type, tem_method);
        setClientLine();
        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
        getPaging();
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

    var myChart = echarts.init(document.getElementById('line'));
    var option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                shadowStyle: {
                    color: 'rgba(150,150,150,0.1)'
                }
            },
            backgroundColor: 'rgba(255,255,255,0.9)',
            textStyle: {
                color: '#666',
                fontSize: '14px',
            },
            confine: true,
            extraCssText: 'width:220px;height:80px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
        },
        textStyle: {
            color: '#666',
        },
        color: '#4da7fd',
        legend: {
            left: 'center',
            bottom: 5,
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                padding: [0, 0, 0, 8],
                color: '#666',
            },
            data: []
        },
        xAxis: [{
            type: 'category',
            data: [],
            axisLine: {
                lineStyle: {
                    color: "#ddd"
                }
            },
            axisTick: {
                alignWithLabel: true
            }
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
            type: 'bar',
            barWidth: '4%',
            data: []
        }, ]
    };
    myChart.setOption(option);

    function setClientLine() {
        var name_type = $('.table-echarts ul.group li.cur').text();
        var arr = [];
        arr.push(name_type);
        myChart.setOption({
            xAxis: {
                data: x_data,
            },
            legend: {
                data: arr
            },
            tooltip: {
                formatter: function (params) {
                    var val = params[0].value;
                    val > 0 ? val = val : val = '--';
                    var res =
                        '<div><div style="height:35px;line-height:35px;padding:0 8px;background:rgba(237,233,233,0.4)">' +
                        params[0].name +
                        '</div><div style="height:30px;line-height:30px;overflow:hidden;padding:0 8px;">' +
                        '<span style="float:left">' +
                        '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;background-color:' +
                        params[0].color + ';"></span>' + params[0].seriesName + '</span>' +
                        '<span style="float:right">' + val + '</span></div>' +
                        '</div>'
                    return res;
                },
            },
            series: [{
                name: name_type,
                data: y_data //数据
            }],
        })
    }




    // 初始化
    getClientLine(tem_date, tem_type, tem_method);
    setClientLine();
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
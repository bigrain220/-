$(document).ready(function () {
    window.onresize = function () {
        myChart ? myChart.resize() : "";
    };


    var tem_date = getCookie("select_date") || '-6';
    var tem_type = 'pv';
    var tem_method = 'f';
    var mapData = [];
    var percentArr = [];
    var mapMax = 10;

    var tShowMethod = 'a';
    var tShowPage = '1';
    var tShowRows = '20';
    var tShowOrder = 'pv,desc';
    var amount = "";

    function getDistrictMap(date, type, method) {
        $.ajax({
            type: "post",
            url: "/api/visitor/district",
            async: false,
            data: {
                "date": date,
                "type": type,
                "method": method
            },
            success: function (res) {
                // console.log(res);
                mapData = [];
                percentArr = [];
                for (var i = 0; i < res.items[0].length; i++) {
                    var tem_obj = {};
                    tem_obj.name = res.items[0][i][0];
                    mapData.push(tem_obj);
                    mapData[i].value = res.items[1][i][0];
                    percentArr.push(Math.floor(res.items[1][i][1] * 10000) / 100 + '%');
                    mapMax <= res.items[1][i][0] ? mapMax = res.items[1][i][0] : mapMax = mapMax;
                };
            }
        });
    }

    function getTableShow(method, page, rows, date, order) {
        $.ajax({
            type: "post",
            url: "/api/visitor/district",
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
                        var tableList =
                            "<tr class='line' id='" + "table-tr_" + i + "'>" +
                            "<td class='number-col'>" +
                            "<div class='expand'" + "data-area=" + items_one[i][0].area + "></div>" +
                            "<div class='td-content' title='" + ((Number(tShowPage) - 1) * Number(tShowRows) + Number(i + 1)) + "'>" + ((Number(tShowPage) - 1) * Number(tShowRows) + Number(i + 1)) + "</div>" +
                            "</td>" +
                            "<td class='table-index  first'>" +
                            "<div class='td-content'>" + items_one[i][0].name + "</div>" +
                            "</td>" +
                            "</tr>"
                        $("#table-show tbody").append(tableList);
                        if(items_one[i][0].area === "province,0"){ $("#table-show tbody tr").eq(i).children("td.number-col").children().first().removeClass('expand')}
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
            var areaId = $(this).attr("data-area").split(',')[1];
            var expand_index = $(this).parent().parent().attr("id");
            $(this).toggleClass("opened");
            var _this = $(this);
            if (_this.hasClass("opened")) {
                $.ajax({
                    type: "post",
                    url: "/api/visitor/district",
                    data: {
                        "method": method,
                        "date": date,
                        "order": order,
                        "area": areaId,
                    },
                    async: false,
                    success: function (res) {
                        // console.log(res, 'area');
                        if (res.items[0].length > 0) {
                            var items_area = res.items[0];
                            for (var i = items_area.length - 1; i >= 0; i--) {
                                var tableList =
                                    "<tr class='sub-line " + _this.parent().parent().attr("id") + "'>" +
                                    "<td class='number-col'>" +
                                    "</td>" +
                                    "<td class='table-index  first'>" +
                                    "<div class='td-content'>" + items_area[i][0].name + "</div>" +
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
                            var area_title = "<tr class='sub-line " + _this.parent().parent().attr("id") + " sub-line-first'>" +
                                "<td class='number-col'></td><td class='table-index  first'><div class='td-content'>按地级市</div></td>" +
                                "<td></td><td></td><td></td><td></td></tr>"
                            _this.parent().parent().after(area_title);
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
        getDistrictMap(tem_date, tem_type, tem_method);
        setMapTable(mapData);
        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
        getPaging();
    });

    //选择type
    $('.table-echarts ul.group li').on('click', function () {
        $(this).addClass('cur');
        $(this).siblings().removeClass('cur');
        tem_type = $(this).attr('data-type');
        getDistrictMap(tem_date, tem_type, tem_method);
        setMapTable(mapData);
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

    //地图
    var myChart = echarts.init(document.getElementById('china-map'));
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
            itemWidth: 14,
            itemHeight: 100,
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
            top: '5%',
            bottom: '5%',
            right: '10%',
            data: [] //数据
        }]
    };
    myChart.setOption(optionMap);

    //使用制定的配置项和数据显示图表
    function setMapTable(mapData) {
        mapMax > 500 ? mapMax = 500 : mapMax = mapMax;
        var name_type = $('.table-echarts ul.group li.cur').text();
        $('#china-map-table thead div.type').text(name_type);
        myChart.setOption({
            visualMap: {
                min: 0,
                max: mapMax,
            },
            series: [{
                name: name_type,
                data: mapData //数据
            }],
            tooltip: {
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
            }
        });
        //设置map——table
        $('.table-content.hm-scroll tbody').html('');
        for (var i = 0; i < mapData.length; i++) {
            var content = "<tr class='line'>" +
                "<td class='number-col' style='width: 25px'>" +
                "<div class='td-content'>" + (i + 1) + "</div>" +
                "</td>" +
                "<td class='text-left'>" +
                "<div class='td-content' title='" + mapData[i].name + "'>" + mapData[i].name + "</div>" +
                "</td>" +
                "<td class='text-right url' style='width: 260px'>" +
                "<div class='td-content' title='" + mapData[i].value + "'>" + mapData[i].value + "</div>" +
                "</td>" +
                "<td class='text-right ratio'>" +
                "<div class='td-content' title='" + percentArr[i] + "'>" + percentArr[i] + "</div>" +
                "</td>" +
                "</tr>"
            $('.table-content.hm-scroll tbody').append(content);
        }

    }




    //初始化
    getDistrictMap(tem_date, tem_type, tem_method);
    setMapTable(mapData);
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
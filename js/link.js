$(document).ready(function () {

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
        mapData = [];
        x_data = [];
        num_data = [];
        line_legend = [];
        lineData = [];
        var query = $(".rpt-filter .tabs li.selected").attr("data-query");
        $.ajax({
            type: "post",
            url: "/api/source/" + query,
            async: false,
            cache: false,
            data: {
                "date": date,
                "type": type,
                "method": method
            },
            success: function (res) {
                console.log(res);
                line_legend = res.line.fields;
                for (var i = 0; i < res.pie.items[0].length; i++) {
                    var tem_obj = {};
                    if (res.pie.items[1][i][0] > 0) {
                        tem_obj.name = res.pie.items[0][i][0];
                        tem_obj.value = res.pie.items[1][i][0];
                        mapData.push(tem_obj);
                    }
                    if (i < 4) {
                        mapData[i].label = {
                            show: true
                        };
                        mapData[i].labelLine = {
                            show: true
                        };
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
                if (line_legend.length > 10) {
                    line_legend.splice(9)
                }
            }
        });
    }

    function getTableShow(method, page, rows, date, order) {
        var query = $(".rpt-filter .tabs li.selected").attr("data-query");
        $.ajax({
            type: "post",
            url: "/api/source/" + query,
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
                            "<tr class='line'>" +
                            "<td class='number-col'>" +
                            "<div class='td-content' title='" + ((Number(tShowPage) - 1) * Number(tShowRows) + Number(i + 1)) + "'>" + ((Number(tShowPage) - 1) * Number(tShowRows) + Number(i + 1)) + "</div>" +
                            "</td>" +
                            "<td class='table-index  first ellipsis'>" +
                            "<div class='td-content'>" + "<a href='" + items_one[i][0] + "' title='" + items_one[i][0] + "' target='_blank'>" + items_one[i][0] + "</a></div>" +
                            "</td>" +
                            "</tr>"
                        $("#table-show tbody").append(tableList);
                        if ($('#table-show td.first a').eq(i).attr('href').indexOf('http') < 0) {
                            $('#table-show td.first a').eq(i).attr('href', 'http://' + items_one[i][0]);
                        };
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

    function setMyCharts() {
        $('.echarts-box .loading').css('display', 'none');
        var Arr = ['#4fa8f9', '#6ec71e', '#f56e6a', '#fc8b40', '#818af8', '#31c9d7', '#f35e7a', '#ab7aee', '#14d68b', '#cde5ff'];
        var colorArr = Arr.slice(0, line_legend.length - 1);
        colorArr.push('#cde5ff');
        //饼图
        var myChart = echarts.init(document.getElementById('all_circle'));
        var name_type = $('.table-echarts ul.group li.cur').text();
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
            color: colorArr,
            series: [{
                name: name_type,
                type: 'pie',
                radius: ['55%', '75%'],
                label: {
                    formatter: '{d}%',
                    show: false
                },
                labelLine: {
                    length: 6,
                    length2: 4,
                    show: false
                },
                data: mapData
            }, ]
        };
        myChart.setOption(option);
        //折线图和柱状图
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
        // console.log(lineData,'lineData')
        //echarts刷新动态数据
        var obj = {};
        var selectTotal = 0;
        for (var i = 0; i < line_legend.length; i++) {
            if (i > 2 && (i < line_legend.length - 1)) {
                obj[line_legend[i]] = false;
            } else {
                obj[line_legend[i]] = true;
            }
            obj[line_legend[line_legend.length - 1]] = true;
        }
        for (var j = 0; j < Object.values(obj).length; j++) {
            if (Object.values(obj)[j] === true) {
                selectTotal += 1;
            }
        }
        var toolTipsH = "width:220px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);height:" + (40 + selectTotal * 28) + "px";
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
                // extraCssText: 'width:220px;height:60%;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);"',
                extraCssText: toolTipsH,
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
                            '<span style="float:left;max-width:160px;overflow:hidden;text-overflow: ellipsis;white-space: nowrap;">' +
                            '<span class="border_span" style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
                            params[i].color + ';"></span>' + params[i].seriesName + '</span>' +
                            '<span style="float:right">' + val + '</span>' + '</div>'
                    }
                    var last = params[params.length - 1].value;
                    last > 0 ? last = last : last = '--';
                    var res =
                        '<div><div style="height:40px;line-height:40px;padding:0 8px;background:rgba(237,233,233,0.4)">' +
                        tem + '<span style="float:right;">' + $('.table-echarts ul.group li.cur').text() + '</span>' + htmlStr +
                        '<div style="height:26px;line-height:26px;overflow:hidden;padding:6px 8px;">' +
                        '<span style="float:left;max-width:160px;overflow:hidden;text-overflow: ellipsis;white-space: nowrap;">' +
                        '<span class="border_span" style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:2px;background-color:' +
                        params[params.length - 1].color + ';"></span>' + params[params.length - 1].seriesName + '</span>' +
                        '<span style="float:right">' + last + '</span>' + '</div>' +
                        '</div></div>';
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
                bottom: 70
            },
            legend: {
                // left: 0,
                bottom: 1,
                itemGap: 15,
                itemWidth: 9,
                itemHeight: 10,
                textStyle: {
                    padding: [0, 0, 0, 8],
                },
                formatter: function (name) {
                    return (name.length > 14 ? (name.slice(0, 14) + "...") : name);
                },
                selected: obj,
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
        var baseArr = line_legend.slice(0, 4);
        myChart1.on('legendselectchanged', function (params) {
            // console.log(params);
            // if (line_legend.length > 4) {
            var legend_option = this.getOption();
            var selectArr = Object.values(params.selected);
            var num = 0;
            for (var i = 0; i < selectArr.length; i++) {
                selectArr[i] === true ? num++ : "";
            }
            if (num > 4) {
                baseArr.push(params.name);
            }
            if (num > 6) {
                var hah = baseArr.slice(baseArr.length - 7, baseArr.length - 6)[0] + '';
                legend_option.legend[0].selected[hah] = false;
            }
            //切换tooltips的高度   
            selectTotal = 0;
            var tem = Object.values(legend_option.legend[0].selected);
            for (var j = 0; j < tem.length; j++) {
                if (tem[j] === true) {
                    selectTotal += 1;
                }
            }
            legend_option.tooltip[0].extraCssText = "width:220px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);height:" + (40 + selectTotal * 28) + "px";
            this.setOption(legend_option)
            // }
        });



        // 固定数据
        //     var obj = {};
        //     var text_data = ['http://www.g3user.com', 'http://www.g3user1.com', 'http://www.g3user2.com', 'http://www.g3user3.com', 'http://www.g3user4.com', 'http://www.g3user5.com', 'http://www.g3user6.com', 'http://www.g3user7.com', 'http://www.g3user8.com', '外部链接总计'];
        //     for (var i = 0; i < text_data.length; i++) {
        //         if (i > 2 && (i < text_data.length - 1)) {
        //             obj[text_data[i]] = false;
        //         } else {
        //             obj[text_data[i]] = true;
        //         }
        //         obj[text_data[text_data.length - 1]] = true;
        //     }
        //     console.log(obj)
        //     if (tem_date == '0') {
        //         var myChart1 = echarts.init(document.getElementById('all_line'));
        //         myChart1 ? myChart1.clear() : "";
        //         myChart1.setOption({
        //             tooltip: {
        //                 trigger: 'axis',
        //                 backgroundColor: 'rgba(255,255,255,0.8)',
        //                 axisPointer: { // 坐标轴指示器，坐标轴触发有效
        //                     type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        //                     shadowStyle: {
        //                         color: 'rgba(150,150,150,0.2)'
        //                     }
        //                 },
        //                 textStyle: {
        //                     color: '#666',
        //                     fontSize: '14px',
        //                 },
        //                 extraCssText: 'width:220px;height:160px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);"',
        //                 formatter: function (params) {
        //                     var htmlStr = "";
        //                     for (var i = 0; i < params.length; i++) {
        //                         var tem = params[i].name;
        //                         var val = params[i].value;
        //                         if (tem.indexOf('/') < 0) {
        //                             tem > 9 ? tem = tem + ":00 - " + tem + ":59" : tem = "0" + tem + ":00 - " + "0" + tem + ":59";
        //                         }
        //                         val > 0 ? val = val : val = '--'
        //                         htmlStr +=
        //                             '<div style="height:26px;line-height:26px;overflow:hidden;padding:6px 8px;">' +
        //                             '<span style="float:left;max-width:160px;overflow:hidden;text-overflow: ellipsis;white-space: nowrap;">' +
        //                             '<span style="margin-right:5px;display:inline-block;width:10px;height:10px;border-radius:5px;background-color:' +
        //                             params[i].color + ';"></span>' + params[i].seriesName + '</span>' +
        //                             '<span style="float:right">' + val + '</span>' + '</div>'
        //                     }
        //                     var res =
        //                         '<div><div style="height:40px;line-height:40px;padding:0 8px;background:rgba(237,233,233,0.4)">' +
        //                         tem + '<span style="float:right;">' + $('.table-echarts ul.group li.cur').text() + '</span>' + htmlStr + '</div></div>'
        //                     return res;
        //                 },
        //             },
        //             textStyle: {
        //                 color: 'rgb(120, 122, 125)',
        //             },
        //             color: ['#4fa8f9', '#6ec71e', '#f56e6a', '#fc8b40', '#818af8', '#31c9d7', '#f35e7a', '#ab7aee', '#14d68b', '#cde5ff'],
        //             grid: {
        //                 top: 30, //越大越靠下，默认60
        //                 left: '35%',
        //                 bottom: 70
        //             },
        //             legend: {
        //                 bottom: 1,
        //                 itemGap: 15,
        //                 itemWidth: 9,
        //                 itemHeight: 10,
        //                 textStyle: {
        //                     padding: [0, 0, 0, 8],
        //                 },
        //                 formatter: function (name) {
        //                     return (name.length > 14 ? (name.slice(0, 14) + "...") : name);
        //                 },
        //                 selected: obj,
        //                 data: text_data
        //             },
        //             xAxis: [{
        //                 type: 'category',
        //                 // boundaryGap: false,//坐标轴两边留白策略
        //                 axisTick: {
        //                     alignWithLabel: true
        //                 },
        //                 axisLabel: {
        //                     interval: 2
        //                 },
        //                 axisLine: {
        //                     lineStyle: {
        //                         color: "#ddd"
        //                     }
        //                 },
        //                 data: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
        //             }],
        //             yAxis: [{
        //                 type: 'value',
        //                 axisLine: {
        //                     lineStyle: {
        //                         color: "transparent"
        //                     }
        //                 },
        //                 splitLine: {
        //                     lineStyle: {
        //                         color: '#eee',
        //                     }
        //                 }
        //             }],
        //             series: [{
        //                     name: 'http://www.g3user.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [2, 0, 0, 0, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        //                 },
        //                 {
        //                     name: 'http://www.g3user1.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [2, 0, 0, 10, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0]
        //                 },
        //                 {
        //                     name: 'http://www.g3user2.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [2, 0, 0, 10, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0]
        //                 },
        //                 {
        //                     name: 'http://www.g3user3.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [2, 0, 0, 10, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0]
        //                 },
        //                 {
        //                     name: 'http://www.g3user4.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [2, 0, 0, 10, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0]
        //                 },
        //                 {
        //                     name: 'http://www.g3user5.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [2, 0, 0, 10, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0]
        //                 },
        //                 {
        //                     name: 'http://www.g3user6.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [2, 0, 0, 10, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0]
        //                 },
        //                 {
        //                     name: 'http://www.g3user7.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [2, 0, 0, 10, 0, 0, 0, 0, 6, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0]
        //                 },
        //                 {
        //                     name: 'http://www.g3user8.com',
        //                     type: 'line',
        //                     symbol: 'circle',
        //                     symbolSize: '5',
        //                     data: [0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        //                 },
        //                 {
        //                     name: '外部链接总计',
        //                     type: 'bar',
        //                     barWidth: '60%',
        //                     data: [2, 0, 0, 0, 0, 5, 1, 1, 7, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        //                 }
        //             ]
        //         })
        //         //echarts点击事件
        //         var oop = text_data.slice(0, 4);
        //         myChart1.on('legendselectchanged', function (params) {
        //             // console.log(params);
        //             if (text_data.length > 4) {
        //                 var legend_option = this.getOption();
        //                 var selectArr = Object.values(params.selected);
        //                 var num = 0;
        //                 for (var i = 0; i < selectArr.length; i++) {
        //                     selectArr[i] === true ? num++ : "";
        //                 }
        //                 if (num > 4) {
        //                     oop.push(params.name);
        //                 }
        //                 if (num > 6) {
        //                     var hah = oop.slice(oop.length - 7, oop.length - 6)[0] + '';
        //                     legend_option.legend[0].selected[hah] = false;
        //                 }
        //                  //切换tooltips的高度   
        //                  var selectTotal = 0;
        //                  var tem= Object.values(legend_option.legend[0].selected);
        //                  for (var j = 0; j < tem.length; j++) {
        //                      if (tem[j] === true) {
        //                          selectTotal += 1;
        //                      }
        //                  }
        //                  legend_option.tooltip[0].extraCssText = "width:220px;padding:0;box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);height:" + (40 + selectTotal * 28) + "px";
        //             }
        //             this.setOption(legend_option)
        //         });
        //         window.onresize = function () {
        //             myChart ? myChart.resize() : "";
        //             myChart1 ? myChart1.resize() : "";
        //         };

        //     } else if (tem_date == '-1') {

        //     } else if (tem_date == '-6') {

        //     } else if (tem_date == '-29') {}
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

    //切换tab
    $(".rpt-filter .tabs ul li").on("click", function (e) {
        tShowPage = '1';
        tShowRows = '20';
        $(this).siblings().removeClass('selected');
        $(this).addClass('selected');
        getSourceCharts(tem_date, tem_type, tem_method);
        setMyCharts();
        getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
        getPaging();
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
    //初始化
    getSourceCharts(tem_date, tem_type, tem_method);
    setMyCharts();
    getTableShow(tShowMethod, tShowPage, tShowRows, tem_date, tShowOrder);
    getPaging();


});
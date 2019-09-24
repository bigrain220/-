$(document).ready(function () {
    var tem_date = getCookie("select_date") || '-6';
    var tShowPage = '1';
    var tShowRows = '20';
    var tShowOrder = 'pv,desc';
    var amount = "";

    function getTableShow(page, rows, date, order) {
        var query = $(".rpt-filter .tabs li.selected").attr("data-query");
        $.ajax({
            type: "post",
            url: "/api/source/" + query,
            data: {
                "page": page,
                "rows": rows,
                "date": date,
                "order": order
            },
            async: false,
            success: function (res) {
                console.log(res);
                $(".header-container .header-data").text('(' + res.timeSpan[0] + ')');
                $("#summary table.summary tbody tr:not('.isShow') td").not('.last-space').each(function (index, domEle) {
                    if($(domEle).children('span.text').hasClass('percent')){
                        $(domEle).children('div.value').html(res.sum[index]+'%');
                        $(domEle).children('div.value').attr('title', res.sum[index]+'%');
                    }else{
                        $(domEle).children('div.value').html(res.sum[index]);
                        $(domEle).children('div.value').attr('title', res.sum[index]);
                    }
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
                        $('#table-show td.first a').eq(i).attr('href', encodeURI('http://www.baidu.com/s?wd=' + items_one[i][0]))
                        for (var j = 0; j < res.items[1][i].length; j++) {
                            if (query === "searchengine" && j > 0) {
                                var tableItem = "<td class='number'>" +
                                    "<div class='td-content'>" + res.items[1][i][j] + "%" + "</div>" + "</td>"
                            } else {
                                var tableItem = "<td class='number'>" +
                                    "<div class='td-content'>" + res.items[1][i][j] + "</div>" + "</td>"
                            }
                            $("#table-show tbody .line").eq(i).append(tableItem);
                        }
                    }
                };
                //tfoot
                $('#table-show  tfoot td.number').replaceWith('');
                for (var k = 0; k < res.pageSum.length; k++) {
                    if (query === "searchengine" && k > 0) {
                        var pageSumDom = "<td class='number'><div class='td-content'>" + res.pageSum[k] + "%" + "</div></td>";
                    } else {
                        var pageSumDom = "<td class='number'><div class='td-content'>" + res.pageSum[k] + "</div></td>";
                    }
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
        getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);
        getPaging();

    });

    //切换tab
    $(".rpt-filter .tabs ul li").on("click", function (e) {
        tShowPage = '1';
        tShowRows = '20';
        $(this).siblings().removeClass('selected');
        $(this).addClass('selected');
        if ($(".rpt-filter .tabs li.selected").attr("data-query") === "searchengine") {
            tShowOrder = "count,desc";
            $("#table-show thead .group-name").attr("colspan", "6");
            $("#table-show thead .group-item.engine").removeClass("isShow");
            $("#table-show thead .group-item.searchwords").addClass("isShow");
            $("#table-show thead .group-item.engine>.number").removeClass("desc");
            $("#table-show thead .group-item.engine>.number").removeClass("asc");
            $("#table-show thead .group-item.engine>.number").first().addClass("desc");
            $("#summary .summary tbody tr").removeClass("isShow")
            $("#summary .summary tbody tr.tab_words").addClass("isShow");
        } else {
            tShowOrder = 'pv,desc'
            $("#table-show thead .group-name").attr("colspan", "4");
            $("#table-show thead .group-item.engine").addClass("isShow");
            $("#table-show thead .group-item.searchwords").removeClass("isShow");
            $("#table-show thead .group-item.searchwords>.number").removeClass("desc");
            $("#table-show thead .group-item.searchwords>.number").removeClass("asc");
            $("#table-show thead .group-item.searchwords>.number").first().addClass("desc");
            $("#summary .summary tbody tr").removeClass("isShow")
            $("#summary .summary tbody tr.tab_engine").addClass("isShow");
        };
        getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);
        getPaging();
    });

    //排序

    $("#table-show .group-item div.td-content").not(".other").on("click", function (e) {
        if ($(this).parent().hasClass('desc')) {
            $(this).parent().removeClass('desc');
            $(this).parent().siblings().removeClass('desc');
            $(this).parent().addClass('asc');
        } else if ($(this).parent().hasClass('asc')) {
            $(this).parent().removeClass('asc');
            $(this).parent().siblings().removeClass('asc');
            $(this).parent().addClass('desc');
        } else {
            $(this).parent().siblings().removeClass('desc');
            $(this).parent().siblings().removeClass('asc');
            $(this).parent().addClass('desc');
        };

        var str = $(this).parent().attr('data-type') + $(this).parent().attr('class');
        tShowOrder = str.replace(/number /, ",");
        getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);
    });




    //初始化
    getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);

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
                    getTableShow(tShowPage, tShowRows, tem_date, tShowOrder)
                },
                callback: function (a) {
                    // console.log("page",a)
                    tShowPage = a;
                    getTableShow(tShowPage, tShowRows, tem_date, tShowOrder)
                }
            });
        }
    }
});
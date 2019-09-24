$(document).ready(function () {

    var tem_date = getCookie("select_date") || '-6';
    var tShowPage = '1';
    var tShowRows = '20';
    var tShowOrder = 'pv,desc';
    var amount = "";

    var words = location.href.split("/visit/")[1];
    var URL = "";
    switch (words) {
        case 'toppage':
            URL = "/api/visit/request";
            break;
        case 'topdomain':
            URL = "/api/visit/domain";
            break;
        default:
            URL = "/api/visit/request";
    }


    function getTableShow(page, rows, date, order) {
        $.ajax({
            type: "post",
            url: URL,
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
                $('#summary table.summary tbody td').not('.last-space').each(function (index, domEle) {
                    $(domEle).children('div.value').html(res.sum[index]);
                    $(domEle).children('div.value').attr('title', res.sum[index]);
                });
                //tbody
                $('#table-show tbody').html('');
                if (res.items[0]) {
                    var items_one = res.items[0];
                    for (var i = 0; i < items_one.length; i++) {
                        if(items_one[i][0].indexOf('http')<0){items_one[i][0]='http://'+items_one[i][0]}
                        var tableList =
                            "<tr class='line'>" +
                            "<td class='number-col'>" +
                            // "<div class='td-content' title='" + (i + 1) + "'>" + (i + 1) + "</div>" +
                            "<div class='td-content' title='" + ((Number(tShowPage)-1)*Number(tShowRows)+Number(i + 1)) + "'>" + ((Number(tShowPage)-1)*Number(tShowRows)+Number(i + 1)) + "</div>" +
                            "</td>" +
                            "<td class='table-index  first'>" +
                            "<div class='td-content'>" + "<a href='" + items_one[i][0] + "' title='" + items_one[i][0] + "' target='_blank'>" + items_one[i][0] + "</a></div>" +
                            "</td>" +
                            "</tr>"
                        $("#table-show tbody").append(tableList) ;
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
        getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);
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
        getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);
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
                    getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);
                },
                callback: function (a) {
                    // console.log("page",a)
                    tShowPage = a;
                    getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);
                }
            });
        }
    }




    //初始化
    getTableShow(tShowPage, tShowRows, tem_date, tShowOrder);
    getPaging();
});
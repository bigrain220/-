$(document).ready(function () {

    // 左侧导航栏折叠
    $(".nav-wrapper li.nav1").on("click", function (event) {
        $(this).children('ul').toggle();
    });
    $(".nav-wrapper li.nav1 ul li").on("click", function (event) {
        event.stopPropagation();
        $("li.nav1 ul li a").removeClass('cur');
        $(this).children('a').addClass('cur');
    })


    //左侧导航栏收缩
    if (localStorage.getItem("type") == 'fold') {
        $(".nav-wrapper").addClass('hide');
        $(".simple-nav-wrapper").removeClass("hide");
        $("#main").css("marginLeft", "51px");
    } else if (localStorage.getItem("type") == 'unfold') {
        $("#main").css("marginLeft", "181px");
        $(".nav-wrapper").removeClass('hide');
        $(".simple-nav-wrapper").addClass("hide");
    };
    $(".aside .title .iconfont").on("click", myHandler);

    function myHandler(e) {
        var navDom = $(this).parent().parent();
        navDom.addClass('hide');
        navDom.siblings().removeClass("hide");
        if (navDom.hasClass("nav-wrapper")) {
            $("#main").css("marginLeft", "51px");
            localStorage.setItem("type", "fold");
        } else {
            $("#main").css("marginLeft", "181px");
            localStorage.setItem("type", "unfold");
        }
    }

    $(".simple-nav li.nav1").hover(function () {
        // over
        $(this).children('ul.item-content').removeClass('hide');
        $(this).addClass('cur');
    }, function () {
        // out
        $(this).removeClass('cur');
        $(this).children('ul.item-content').addClass('hide');
    });




    // header固定定位
    if ($(".content-header-wrapper").html()) {
        // console.log('有定位需求')
        var $headerHeight = $('.content-header-wrapper').height();
        $(window).scroll(function () {
            $('.content-header').css({
                "position": "fixed",
                "top": "0",
                "z-index": "999"
            })
            $('.content-header-wrapper').css('height', $headerHeight);
        });
    }
    /* 趋势图展开与合并 */
    if ($(".fold .toggleable").html()) {
        // console.log('有展开需求')
        $(".fold .toggleable").on("click", function (event) {
            event.stopPropagation();
            $('.table-echarts').toggle();
            if ($(this).hasClass('iconshang')) {
                $('.flash-text-container').css('display', 'block');
                $(this).removeClass('iconshang');
                $(this).addClass('iconshuangjiantou-copy-copy');
            } else {
                $('.flash-text-container').css('display', 'none');
                $(this).removeClass('iconshuangjiantou');
                $(this).addClass('iconshang');
            }

        })
    }

    // 初始化选择时间
    var tem_date_com = getCookie("select_date") || '-6';
    $("#date-select-bar span").removeClass('cur');
    $("#date-select-bar span[data-date=" + tem_date_com + "]").addClass('cur');
    $('#date-select-bar .trackable').on('click', function () {
        var tep_tem_date = $(this).attr('data-date');
        setCookie("select_date", tep_tem_date,5);
    })


});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


// <!--百度流量统计代码-->
var _hmt = _hmt || [];
(function () {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?382f81c966395258f239157654081890";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
})();
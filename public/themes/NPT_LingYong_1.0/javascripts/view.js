/**
 * Created with JetBrains WebStorm.
 * User: 灵勇
 * Date: 13-8-12
 * Time: 上午10:19
 * To change this template use File | Settings | File Templates.
 */
$(".blogs").gridalicious({
    animate: true,
    width:200,
    gutter:0,
    selector:'.blog',
    animationOptions: {
        queue: true,
        speed: 200,
        duration: 300,
        effect: 'fadeInOnAppear'



    }
});



if($(window).width()>768){

    $('.blog a').hover(function(){
            $(this).children(".comment-box").removeClass('hidden');
        },
        function(){
            $(this).children(".comment-box").addClass("hidden");
        }
    );
}



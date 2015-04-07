/**
 * Created by John on 4/3/2015.
 */
$(function(){

    var tempScript=$("#navbar").html();
    function detectmob() {
        if( navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        ){
            return true;
        }
        else {
            return false;
        }
    }
    var mobile = detectmob();
    console.log(mobile, "mobile");

    var links=[
        {name:"home", address:"/index.html", mobileFriendly:false},
        {name:"Tic-tac-4", address:"/tictac4.html", mobileFriendly:false},
        {name:"SVG star", address:"/customStar.html", mobileFriendly:true},
        {name:"Block Hunter", address:"/firstPersonShooter.html", mobileFriendly: true}
    ];
    var template = Handlebars.compile(tempScript);
    $("#nav").append(template(links));
})
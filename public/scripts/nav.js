/**
 * Created by John on 4/3/2015.
 */
$(function(){
    var tempScript=$("#navbar").html();
    var links=[
        {name:"home", address:"/index.html"},
        {name:"Tic-tac-4", address:"/tictac4.html"},
        {name:"SVG star", address:"/customStar.html"}
    ];
    var template = Handlebars.compile(tempScript)
    $("#nav").append(template(links));
})
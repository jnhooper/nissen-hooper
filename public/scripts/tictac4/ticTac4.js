if(detectmob()){
    $('.mobile_instructions').css({display:""});
}else{
    $('body').addClass("noScroll");
    $('.mobile_instructions').css({display:"none"});
}

var list = [{
    body:"This was a test of three.js controls. The code generates a cube a spheres (4x4) which are then placed on the " +
    "canvas. Next we generate two cubes, red and blue, which are 'teams'. The camera is changed by clicking and dragging" +
    " around. When the camera is adjusted so that the mouse intersects a ball it changes the color of that ball to yellow." +
    "  On the click event we change the color of the ball to the team color that clicked the ball. After every click we " +
    "check if someone has won the game, by going through an array of winning combinations. If we won we generate a randomly" +
    " placed cube of the team's color on their side. <br>" +
    "Please click and drag to start the game!",
    header:"<h5>Tic Tac 4<small> -Three.js (click and drag to start)</small></h5>"
}];


React.render(
    <CollapsibleList list={list} />,
    document.getElementById('CollapsibleList'),
    function(){
        $('.collapsible').collapsible({
            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    }
);

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


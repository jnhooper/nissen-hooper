/**
 * Created by jhooper on 1/9/14.
 */

var step= 1;
var selectedElement=0;
var currentX = 0;
var currentY = 0;
var currentMatrix = 0;
var time=1;


function createStar(r, R, points, lineType, centerx, centery){
    var innerPointx;
    var innerPointy;
    var outerPointx;
    var outerPointy;
    if(centerx==undefined) centerx = 150;
    if(centery==undefined) centery= 150;
    var topPoint = R+centerx;
    //the circles are centered at 200,200
    //console.log(innerPointx, innerPointy, topPoint);
    var start = "M"+topPoint+","+centery;
    var line = document.createElementNS('http://www.w3.org/2000/svg', "path");
    line.setAttribute("class","draggable");
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", 2);
    line.setAttribute("transform", "matrix(1 0 0 1 0 0)");
    line.setAttribute("id","star");
    var angle = 360/(2*points);
    var sumAngle=angle;
//    var outerAngle = (360/i)* Math.PI /180;
    var D = start; //this will be the "d" attribute
    if(lineType=="straight"){
        for (var i = 1; i<=points*2; i++){
            if (i%2!==0){
                innerPointx = centerx+r*Math.cos(sumAngle * Math.PI / 180);
                innerPointy = centery+r*Math.sin(sumAngle * Math.PI / 180);
                D = D +" L"+innerPointx+","+innerPointy;
            }
            else{
                outerPointx = centerx+R*Math.cos(sumAngle* Math.PI / 180);
                outerPointy = centery+R*Math.sin(sumAngle* Math.PI / 180);
                D = D +" L"+outerPointx+","+outerPointy;
            }
            sumAngle+=angle;
            line.setAttribute("d",D);
            $("#starCanvas").append(line);
        }
    }
    else if (lineType == "curve"){
        sumAngle=360/(points*2);
        D="M"+ (r+centerx)+","+centery;
        for (var i =1; i<=(points*2+1); i++){
            for (var j=1; j<=2; j++)
            {
                if (j%2!==0){
                    innerPointx = centerx+r*Math.cos(sumAngle * Math.PI / 180);
                    innerPointy = centery+r*Math.sin(sumAngle * Math.PI / 180);
                    //                D = D +" L"+innerPointx+","+innerPointy;
                }
                else{
                    outerPointx = centerx+R*Math.cos(sumAngle* Math.PI / 180);
                    outerPointy = centery+R*Math.sin(sumAngle* Math.PI / 180);
                    //                D = D +" L"+outerPointx+","+outerPointy;
                }
            }

            sumAngle+=angle;
            if(i%2===0){
                D = D+" Q"+outerPointx+","+outerPointy+" "+innerPointx+","+innerPointy;
                line.setAttribute("d",D);
                $("#starCanvas").append(line);
            }

        }

    }
    var path= $('#starCanvas path');
    var timeout;
    var origTime=time;
    simulatePathDrawing(path[0], points);
    $('#starCanvas path').on('mouseover', function(e) {
        simulatePathDrawing(this, points);
    });
//    console.debug( path[0].getPointAtLength(20));
//    console.debug( path[0].getPointAtLength(19));


//    var pointArray=[];
//    console.debug(path[0].getTotalLength());
//    console.debug(path[0].getPointAtLength(0));
//    console.debug(path[0].getPointAtLength(path[0].getTotalLength()));
//    for (var i =0; i<path[0].getTotalLength();i+=2){
//        pointArray.push({index:i, x:path[0].getPointAtLength(i).x, y:path[0].getPointAtLength(i).y});
//    }
//    console.debug(pointArray);





    $('.draggable').on("mousedown",(function(e){
        selectElement(e);
        time/=3;
        timeout = setInterval(function(){
            simulatePathDrawing(path[0], points);
        },time*1000);
    })).on("mouseup",(function(){
        time=origTime;
        clearInterval(timeout);
    }));

}







//pickup
function selectElement(evt){
    console.debug("clicked");
    selectedElement = evt.target;
    currentX = evt.clientX;
    currentY = evt.clientY;
    currentMatrix = selectedElement.getAttributeNS(null, "transform").slice(7, -1).split(' ');

    for (var i=0; i<currentMatrix.length; i++){
        currentMatrix[i] = parseFloat(currentMatrix[i]);
    }

    selectedElement.setAttributeNS(null, "onmousemove", "moveElement(evt)");
    selectedElement.setAttributeNS(null, "onmouseup", "deselectElement(evt)");
}
//move
var movMatrix;
function moveElement(evt){
    var dx= evt.clientX - currentX;
    var dy= evt.clientY - currentY;
    currentMatrix[4] +=dx;
    currentMatrix[5] += dy;
    var newMatrix= "matrix("+ currentMatrix.join(' ') +")";

    selectedElement.setAttributeNS(null, "transform", newMatrix);
    currentX=evt.clientX;
    currentY = evt.clientY;
    movMatrix = newMatrix;

}
//set down
function deselectElement(evt){
    if(selectedElement != 0){
        selectedElement.removeAttributeNS(null, "onmouseout");
        selectedElement.removeAttributeNS(null,"onmousemove");
        selectedElement.removeAttributeNS(null, "onmouseup");
        selectedElement = 0;
    }
}


function simulatePathDrawing(path, points) {
    step *=(-1);
    var firstOffset;
    var secondOffset;
    var length = path.getTotalLength();
    // Clear any previous transition
    path.style.transition = path.style.WebkitTransition =
        'none';
    // Set up the starting positions
    path.style.strokeDasharray = length/(2*points) + ' ' + length/(2*points)  ;
    if (step<0){
        firstOffset=2*length/(2*points);
        secondOffset=length/(2*points);
    }
    else{
        secondOffset='0';
        firstOffset=length/(2*points);
    }
    path.style.strokeDashoffset =firstOffset;
    // Trigger a layout so styles are calculated & the browser
    // picks up the starting position before animating
    path.getBoundingClientRect();
    // Define our transition
    path.style.transition = path.style.WebkitTransition =
        'stroke-dashoffset '+time+'s ease-in-out';
    // Go!

    path.style.strokeDashoffset = secondOffset;
    path.style.strokeWidth = '3px';
    path.style.fill = 'rgba(255,255,0,.12)';
}


var redraw = function(outer, inner, points, type){
    $("#star").remove();

    createStar(outer, inner, points, type);
    if(movMatrix!==undefined){
        $("#star")[0].setAttributeNS(null, "transform", movMatrix);
    }
}

//for cool things set the first number bigger than the second and set it to curve
$(function() {
    //createStar(70, 50, 5, "curve");
    createStar(50, 25, 5, "straight");
    $(".redraw").on("input", function(e){
        var points = parseInt($(".points")[0].value);
        var outer = parseInt($(".outer")[0].value);
        var inner = parseInt($(".inner")[0].value);
        var line="straight";
        if($("#curveLine")[0].checked) line="curve";
        redraw(outer,inner, points, line);
    });
    $("form .redraw").on("change", function(e){
        var points = parseInt($(".points")[0].value);
        var outer = parseInt($(".outer")[0].value);
        var inner = parseInt($(".inner")[0].value);
        var line = "straight"

        if($("#curveLine")[0].checked) line="curve";
        redraw(outer,inner, points, line);
    })


    $('svg').attr("height", $(window).height());
});

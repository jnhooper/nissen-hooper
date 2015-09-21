
var list = [{
    body:"This angular app was made alongside a class project where the goal was to simulate a shopping center." +
    " There are a number of 'batches' of test data, each containing 5 tests. selecting a test auto populates the " +
    "table thanks to Angular's two way binding, and when you select a table element it is graphed out in a bar and" +
    " donut chart using d3. The bar and donut chart are standalone angular directives I made and are able to be " +
    "dropped into any angular project. Angular has quickly become one of my favorite frameworks to work with, and I can't" +
    " wait to see what is coming in Angular 2.0! ",
    header:"<h3>Ng-Sim<small> -Angular & d3</small></h3>"
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

$(document).ready(function() {
    $('select').material_select();
});
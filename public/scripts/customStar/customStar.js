
var body="This started out as a learning exercise for SVG paths. The only library being used to generate the star is jquery," +
    " which is just being used to find dom elements. Everything is simply math and generating the path attribute from " +
    " the user inputs. The way we animate the star is by drawing the path as a dashed line with lengths that are a " +
    "precise fraction of the total path length, then moving that stroke down the length of the path over and over again." +
    "<br> " +
    "Points is the number of points your star will have. Inner radius is the radius of the imaginary circle that touches" +
    "the inner points of the star. Outer radius is the same but for the outer portions of the star. Play around with different" +
    "values to get more intersting shapes. And dont forget to try dragging the star! ...(as long as you're not on mobile";
var header="<h5>Custom Star <small> -SVG</small></h5>";

React.render(
    <CollapsibleList body={body} header={header} />,
    document.getElementById('CollapsibleList'),
    function(){
        $('.collapsible').collapsible({
            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    }
);
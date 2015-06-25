
var body="This in Browser first person shooter is Utilizing three.js The User can walk around the auto-generated, random" +
    "environment using the WASD keys. if the blocks are stationary the user can even jump on top of them. moving the mouse" +
    " will allow the player to look around their environment. clicking the mouse will shoot a ball out and remain in place " +
    "once it hits a block. This will cause the block to change color.<br> " +
    "Selecting the duck hunter mode will cause the blocks to bounce and rotate. If you shoot a block once in this mode it" +
    " will stop rotating, and if it is hit a second time it will fall to the ground dead";
var header="<h5>First Person sHooper <small> -three.js</small></h5>";

React.render(
    <CollapsibleList body={body} header={header} />,
    document.getElementById('CollapsibleList'),
    function(){
        $('.collapsible').collapsible({
            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    }
);
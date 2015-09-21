
var list=[{
    body:
    "This in browser first person shooter is utilizing only Three.js. The User can walk around the auto-generated, random " +
    "environment using the WASD keys. If the blocks are stationary the user can even jump on top of them. Moving the mouse" +
    " will allow the player to look around their environment. Clicking the mouse will shoot a ball out and remain in place " +
    "once it hits a block. This will cause the block to change color. The ball follows a ray whose matrix is determined by the camera" +
    " element. At every Frame of the animation it checkes if it is going to pass the boundry of a box the next frame signaling" +
    " that it has hit a target.<br>" +
    "Selecting the duck hunter mode will cause the blocks to bounce and rotate. If you shoot a block once in this mode it" +
    " will stop rotating, and if it is hit a second time it will fall to the ground dead",
    header:"<h5>First Person sHooper <small> -three.js</small></h5>"}];

React.render(
    <CollapsibleList list={list}/>,
    document.getElementById('CollapsibleList'),
    function(){
        $('.collapsible').collapsible({
            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    }
);
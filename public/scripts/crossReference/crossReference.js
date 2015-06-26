//$(document).ready(function(){
var list=[
    {body:"This came out of a desire to help my girlfriend with a problem she had at work. She was spending insane amounts"+
    "of time going back and forth between these two enormous spreadsheets, looking for isbn numbers in one then, seeing"+
    "if it was in the other spreadsheet, and doing a couple dozen times. Then rechecking it!" +
    "<br>"+
    "I was learning the basics of backbone at the time and I thought this would be a fun little project to test my"+
    "new knowledge of this library I'm learning. So I got to work."+
    "<br>"+
    "It's far from the most complex of backbone apps but It served as a good tutorial. Essentially once the user"+
    "inputs all the fields and hits the button, we create two collections, one for each spreadsheet. and go through"+
    "creating book models for each line in the spreadsheet. Then we simply go through the two collections looking for"+
    "books that have the same desired key value pair and add them to our 'finalCollection' which is rendered by the"+
    "finalCollectionView below. She also had to know which items were missing so there is also a missingCollection,"+
    "which contains all the books/items that are not in both lists.",
    header:"<h5>Cross-Reference <small> -Backbone</small></h5>"}];


//console.log("hello");
//debugger;

React.render(
    <CollapsibleList list={list} />,
    document.getElementById('CollapsibleList'),
    function(){
        $('.collapsible').collapsible({
            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    }
    );
//});
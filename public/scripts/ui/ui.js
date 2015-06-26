/**
 * Created by John on 5/13/2015.
 */

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

var NavBar = React.createClass({
    render: function() {
        return (
            <nav style={{position:"fixed", zIndex:998}} className="napp-color z-depth-3">
                <ul  id="slide-out" className="side-nav fixed scroll-with">
                    <li><a className="waves-effect waves-napp" href="test.html">About Me</a></li>
                    <li><a className="waves-effect waves-napp" href="resume.html">Resume</a></li>
                    <li className="no-padding">
                        <ul className="collapsible collapsible-accordion">
                            <li>
                                <a className="waves-effect waves-napp collapsible-header">Examples<i className="mdi-navigation-arrow-drop-down"></i></a>
                                <div className="collapsible-body">
                                    <ul>
                                        <li><a className="waves-effect waves-napp"  href="customStar.html">SVG Animation</a></li>
                                        <li><a className="waves-effect waves-napp"  href="firstPersonShooter.html">Block Hunter</a></li>
                                        <li><a className="waves-effect waves-napp"  href="tictac4.html">Tic Tac 4</a></li>
                                        <li><a className="waves-effect waves-napp"  href="crossReference.html">Cross Reference</a></li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li className="no-padding">
                        <ul className="collapsible collapsible-accordion">
                            <li>
                                <a className="waves-effect waves-napp collapsible-header">Contact<i className="mdi-navigation-arrow-drop-down"></i></a>
                                <div className="collapsible-body">
                                    <ul>
                                        <li><a href="tel:+6127411838"><i class="small mdi-communication-phone"></i>(612) 741-1838 </a></li>
                                        <li><a href="mailto:john.nissenhooper@gmail.com"><i class="small mdi-content-mail"></i>john.nissenhooper@gmail</a></li>
                                        <li><a href="http://www.linkedin.com/in/nissenhooper"><i class="small mdi-action-account-child"></i>LinkedIn</a></li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
                <a href="#" id="hamburger" data-activates="slide-out" className="button-collapse"><i className="mdi-navigation-menu"></i></a>
                <div className="container" style={{width:"90%"}}>
                <div className="nav-wrapper" style={{textAlign:"center", position:'relative', zIndex:100}}>
                <a className="page-title"  style={{fontSize:'20pt'}}>Nissen-Hooper</a>
                    </div>
                    </div>
            </nav>

        );
    }
});

var paddit=function(){
    if(!mobile && $("#nav nav ul").position().left>=0){
        $('body').css("padding-left",'240px');
        $('a.page-title').css("margin-left","-200px");
        //console.log("NOT MOBILE");
        //console.log($("#nav nav ul").position().left);
    }
    else{
        $('body').css("padding-left",'0px');
        $('a.page-title').css("margin-left","0px");
    }
    //console.log($("#nav nav ul").position().left);
    //console.log($(window).width());
    //if($(window).width()<=800){
    //    $('body').css("padding-left",'0px');
    //}
};

React.render(
<NavBar/>,
    document.getElementById('nav'),
    function(){
        $("nav .button-collapse").sideNav({
            backgroundColor:"indigo darken-3"
        });
        $('nav .collapsible').collapsible();

        var fuckinShadow=function(){
            if($('nav #sidenav-overlay').length==0) {
                $('#sidenav-overlay').remove();
                $('nav.napp-color').append('<div id="sidenav-overlay" style="opacity: 0;"></div>');
            }
        };

        $('.drag-target').on('click',function(){
          fuckinShadow();
        });
        $('.drag-target').on('pan',function(){
            fuckinShadow();
        });
        $('nav #hamburger').on("click",function(){
            $('#sidenav-overlay').remove();
            $('nav.napp-color').append('<div id="sidenav-overlay"></div>');
        });





        paddit();
    }
);

$(window).resize(function(){
    console.log("resized");
    paddit();
});


//var body="This came out of a desire to help my girlfriend with a problem she had at work. She was spending insane amounts"+
//    "of time going back and forth between these two enormous spreadsheets, looking for isbn numbers in one then, seeing"+
//    "if it was in the other spreadsheet, and doing a couple dozen times. Then rechecking it!" +
//    "<br>"+
//    "I was learning the basics of backbone at the time and I thought this would be a fun little project to test my"+
//    "new knowledge of this library I'm learning. So I got to work."+
//    "<br>"+
//    "It's far from the most complex of backbone apps but It served as a good tutorial. Essentially once the user"+
//    "inputs all the fields and hits the button, we create two collections, one for each spreadsheet. and go through"+
//    "creating book models for each line in the spreadsheet. Then we simply go through the two collections looking for"+
//    "books that have the same desired key value pair and add them to our 'finalCollection' which is rendered by the"+
//    "finalCollectionView below. She also had to know which items were missing so there is also a missingCollection,"+
//    "which contains all the books/items that are not in both lists.";
//var header="<h5>Cross-Reference <small> -Backbone</small></h5>";
//
//
//console.log("hello");
////debugger;
//
//React.render(
//    <CollapsibleList body={body} header={header} />,
//    document.getElementById('CollapsibleList'),
//    function(){
//        $('.collapsible').collapsible({
//            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
//        });
//    }
//);

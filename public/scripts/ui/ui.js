/**
 * Created by John on 5/13/2015.
 */


var NavBar = React.createClass({
    render: function() {
        return (

            <nav style={{backgroundColor:"#c62828"}}>

                <ul id="slide-out" className="side-nav fixed">
                    <li><a href="#!">First Sidebar Link</a></li>
                    <li><a href="#!">Second Sidebar Link</a></li>
                    <li className="no-padding">
                        <ul className="collapsible collapsible-accordion">
                            <li>
                                <a className="collapsible-header">Examples<i className="mdi-navigation-arrow-drop-down"></i></a>
                                <div className="collapsible-body">
                                    <ul>
                                    <li><a target="_blank" href="customStar.html">SVG Animation</a></li>
                                    <li><a target="_blank" href="firstPersonShooter.html">Block Hunter</a></li>
                                    <li><a target="_blank" href="tictac4.html">Tic Tac 4</a></li>
                                    <li><a target="_blank" href="crossReference.html">Cross Reference</a></li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
                <ul className="right hide-on-med-and-down">
                    <li><a href="#!">First Sidebar Link</a></li>
                    <li><a href="#!">Second Sidebar Link</a></li>
                    <li><a className="dropdown-button" href="#!" data-activates="dropdown1">Dropdown<i className="mdi-navigation-arrow-drop-down right"></i></a></li>
                    <ul id='dropdown1' className='dropdown-content'>
                        <li><a href="#!">First</a></li>
                        <li><a href="#!">Second</a></li>
                        <li><a href="#!">Third</a></li>
                        <li><a href="#!">Fourth</a></li>
                    </ul>
                </ul>
                <a href="#" data-activates="slide-out" className="button-collapse"><i className="mdi-navigation-menu"></i></a>
                <div className="container" style={{width:"90%"}}>
                <div className="nav-wrapper" style={{textAlign:"center", position:'relative'}}>
                <a className="page-title" style={{fontSize:'20pt'}}>Nissen-Hooper</a>
                    </div>
                    </div>
            </nav>

        );
    }
});


React.render(
<NavBar/>,
    document.getElementById('nav'),
    function(){
        $(".button-collapse").sideNav({
            backgroundColor:"indigo darken-3"
        });
        $('.collapsible').collapsible();
    }
);


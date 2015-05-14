/**
 * Created by John on 5/13/2015.
 */
var Paralax = React.createClass({
    render: function() {
        return(
            <div>
            <div className="parallax-container"style={{height:'400px'}}>
                <div className="parallax"><img src="http://www.los-pollos.com/wp-content/uploads/2015/02/funny-dog-face-1.jpg"/></div>
             </div>
            <div className="section white">
                <div className="row container">
                    <h2 className="header">Parallax</h2>
                    <p className="grey-text text-darken-3 lighten-3">
                        Its whats hot bitches!
                    </p>
                </div>
            </div>
            <div className="parallax-container">
                <div className="parallax"><img src="https://tippinthescales.files.wordpress.com/2012/01/funny-dog-pictures-goggie-gif-click-type-click-type.gif?w=500"/></div>
            </div>
            </div>
        );
    }
});


React.render(
    <Paralax/>,
    document.getElementById('paralax'),
    function(){
        console.log("testing");
        $('.parallax').parallax();
    }

);


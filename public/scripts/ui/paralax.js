var parallaxData=[
    {
        title:"Work Experience",
        key:"Work_exp",
        imageSrc:"http://s3.amazonaws.com/edcanvas-uploads/199453/dropbox/1388699059/coding.jpg",
        html:[
            {
                key:"Imagine",
                firstLine:"Imagine! Printing",
                secondLine:"Front End Engineer",
                dates:"2013-2014",
                points:[
                    "Developed highly interactive store engine for franchise Owners to explore and edit" +
                    "online allowing them to visualize what their store would look like before odering POP",
                    "Salvaged a failing project whose purpose was to create dynamic menus for Auntie Anne's Pretzels" +
                    "utilizing SVG technologies and Backbone.js",
                    "Worked with a team of two to create a Javascript framework for styling SVG content," +
                    "which would be used for the second iteration of the Auntie Anne's project as well as" +
                    "creating content for Famous Dave's Franchises",
                    "Designed and built an intranet employee database for Imagine, complete with internal" +
                    "HR tools and authentication for CRUD operations with employee data"
                ]

            },
            {
                key:"harbor_master",
                firstLine:"Benicia Harbor Corporation",
                secondLine:"Harbor Master",
                description:"I mastered the harbor",
                dates:"2012-2013"
            }
        ]
    },
    {
        title:"Education",
        key:"Education",
        imageSrc:"http://www.chem.umn.edu/groups/gagliardi/pics/Gop1.jpg",
        html:[{
            key:"uniersity_of_mn",
            firstLine:"University of Minnesota",
            secondLine:"Suma Cum Laude - CLA",
            description:"I gone to schol",
            dates:"2012-2013"
        }]
    }
];

var Psection = React.createClass({
    render:function(){
        var listItems=[];
        _.each(this.props.html, function(li){
            listItems.push(<HeadedList {...li}/>);
        });
        return(
            <div>
                <div className="parallax-container"style={{height:'400px'}}>
                    <div className="parallax"><img src={this.props.imageSrc}/></div>
                </div>
                <div className="section white z-depth-5">
                    <div className="row container">
                        <h2 className="header">{this.props.title}</h2>
                        <span>{listItems}</span>
                    </div>
                </div>
            </div>
        )
    }
});

var Parallax = React.createClass({

    render: function() {
        var sections = [];
        for(var i = 0; i<parallaxData.length; i++){
            sections.push(<Psection {...parallaxData[i]} key={parallaxData[i].key}/>);
        }
        return(
            <div>
            {sections}
            </div>
        );
    }
});



//<div>
//    <div className="parallax-container"style={{height:'400px'}}>
//        <div className="parallax"><img src="http://www.los-pollos.com/wp-content/uploads/2015/02/funny-dog-face-1.jpg"/></div>
//    </div>
//    <div className="section white">
//        <div className="row container">
//            <h2 className="header">Parallax</h2>
//            <p className="grey-text text-darken-3 lighten-3">
//                Its whats hot bitches!
//            </p>
//        </div>
//    </div>
//</div>
//<div className="parallax-container">
//<div className="parallax"><img src="https://tippinthescales.files.wordpress.com/2012/01/funny-dog-pictures-goggie-gif-click-type-click-type.gif?w=500"/></div>
//</div>

React.render(
    <Parallax/>,
    document.getElementById('paralax'),
    function(){
        console.log("testing");
        $('.parallax').parallax();
    }

);


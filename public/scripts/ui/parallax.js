var parallaxData=[
    {
        title:"Work Experience",
        key:"Work_exp",
        imageSrc:"http://s3.amazonaws.com/edcanvas-uploads/199453/dropbox/1388699059/coding.jpg",
        html:[
            {
                key:"Umn_work",
                firstLine:"University of Minnesota",
                secondLine:"Front End Engineer for Open Kim Project",
                dates:"2014-Current",
                points:[
                    "Main Front End Engineer for OpenKIM, an online suite of open source tools for molecular simulation" +
                    " of materials. These tools help to make molecular simulation more accessible and more reliable.",
                    "Worked with large existing codebase to improve usability and flexability",
                    "Created a web app for visualizing tests",
                    "Created basic backbone framework to streamline the creation of visualizers",
                    "Participated in a workshop teaching students how to create their own visualizers using my framework"
                ]

            },
            {
                key:"Imagine",
                firstLine:"Imagine! Print Solutions",
                secondLine:"Front End Engineer",
                dates:"2013-2014",
                points:[
                    "Developed highly interactive store engine for franchise Owners to explore and edit " +
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
                dates:"2012-2013",
                points:["Successfully oversaw the completion of an $800K dredging project without prior training",
                    "Updated software and hardware for marina office",
                    "Acted as Benicia Harbor Corporation President when needed",
                    "Converted paper filing system to digital",
                    "Solved IT related Problems",
                    "Solved Disputes between boat owners and the marina"
                ]
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
            dates:"2012-2013",
            points:[
                "Created and managed websites for local artist and charity",
                "Writer and Photographer for Wake Magazine",
                "Participated emersive, language intensive study abroad program",
                "Prepared an hour long lecture and workshop on Photography in Italian",
                "Italian Tutor"
            ]
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
            <div className="Psection">
                <div className="parallax-container" style={{height:'400px'}}>
                    <div className="parallax"><img src={this.props.imageSrc}/></div>
                </div>
                <div className="section white z-depth-5">
                    <div className="row container">
                        <h2 className="header">{this.props.title}</h2>

                        <ul className="collapsible popout" data-collapsible="accordion">{listItems}</ul>
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


React.render(
    <Parallax/>,
    document.getElementById('parallax'),
    function(){
        $('.parallax').parallax();
        $('#parallax .collapsible').collapsible({
            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    }
);


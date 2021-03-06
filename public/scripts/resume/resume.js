
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
                    'Front End Engineer for <a href="https://openkim.org/visualizer-wrapped/cohesive-energy-graph/?viz-height=760px&species=Cu&model=EAM_Dynamo_Onat_Durukanoglu_CuNi__MO_592013496703_001">OpenKIM</a>, an online suite of open source tools for molecular simulation' +
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
                    "Salvaged a failing project whose purpose was to create dynamic menus for Auntie Anne's Pretzels " +
                    "utilizing SVG technologies and Backbone.js",
                    "Worked with a team of two to create a Javascript framework for styling SVG content," +
                    " which would be used for the second iteration of the Auntie Anne's project as well as" +
                    " creating content for Famous Dave's Franchises",
                    "Designed and built an intranet employee database for Imagine, complete with internal" +
                    " HR tools and authentication for CRUD operations with employee data"
                ]

            },
            {
                key:"harbor_master",
                firstLine:"Benicia Harbor Corporation",
                secondLine:"Harbor Master",
                dates:"2012-2013",
                points:[
                    "Successfully oversaw the completion of an $800K dredging project without prior training",
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
        title:"Skills & Strengths",
        key:"skills",
        imageSrc:"http://th04.deviantart.net/fs70/PRE/f/2010/251/1/a/doggin_it_by_nisse038-d2ya8d9.jpg",
        html:[
            {
                key: "programming languages",
                firstLine:"Programming Languages",
                points:[
                    "Javascript",
                    // "Backbone.js",
                    // "Angular.js",
                    // "React.js",
                    // "Jquery.js",
                    // "underscore.js / lodash.js",
                    // "D3.js",
                    // "Ruby on Rails",
                    "Ruby",
                    // "Yeoman, Bower & Grunt",
                    "Java",
                    "Python",
                    "C",
                    "C++",
                    "Ocaml",
                    "PHP"
                    "SQL",
                    "SVG",
                    "JSON",
                    "XML",
                    "HTML5",
                    "CSS3",
                    "I even know some assembly, but please dont ask me to write any!"
                ]
            },
            {
                key: "programming libraries",
                firstLine:"Libraries",
                points:[
                    "Backbone.js",
                    "Angular.js",
                    "React.js",
                    "Jquery.js",
                    "underscore.js / lodash.js",
                    "D3.js",
                    "C3.js",
                    "Three.js",
                    // "Ruby on Rails",
                    "Rails",
                    "Vagrant",
                    "Yeoman, Bower & Grunt",
                    // "Ocaml",
                    // "Java",
                    // "Python",
                    // "C and C++",
                    // "SVG",
                    // "HTML5",
                    // "CSS3",
                    // "I even know some assembly, but please dont ask me to write any!"
                ]
            },
            {
                key:"software",
                firstLine:"Software",
                points:[
                    "Windows 8",
                    "Mac OsX",
                    "Ubuntu",
                    "Virtual Box",
                    "Source Tree",
                    "Photoshop",
                    "Illustrator",
                    "Gimp",
                    "InkScape",
                    "Final Cut",
                    "Garage Band",
                    "DreamWeaver",
                    "Google Apps",
                    "Google Sketchup",
                    "Microsoft Office Suite",
                    "Quick study for anything and everything else"
                ]
            },
            {
                key:"driven",
                firstLine:"Driven",
                points:[
                    "Self-taught in Multiple programming languages",
                    "Lived on worked on three different continents with diverse cultures, customs and languages"
                ]
            },
            {
                key:"creative",
                firstLine:"Creative",
                points:[
                    "Created  <a href='https://www.youtube.com/watch?v=pbk1OAukFig'>promotional video</a> for study abroad program which helped to dramatically increase enrollment",
                    "Freelance photographer for University magazine",
                    "Avid Photographer and Web Designer"
                ]
            },
            {
                key:"passionate",
                firstLine:"Passionate",
                points:[
                    "Hosted and taught a youth Soccer Camp in South Dakota",
                    "Used Technology to help local senior citizens stay connected",
                    "Taught English in Costa Rica and Shanghai"
                ]
            }
        ]
    },
    {
        title:"Education",
        key:"Education",
        imageSrc:"http://www.chem.umn.edu/groups/gagliardi/pics/Gop1.jpg",
        html:[{
            key:"university_of_mn",
            firstLine:"University of Minnesota",
            secondLine:"Suma Cum Laude - CLA",
            dates:"2012-2013",
            points:[
                "Created and managed websites for local artist and charity",
                "Writer and Photographer for Wake Magazine",
                "Participated in immersive, language intensive study abroad program",
                "Prepared an hour long lecture and workshop on Photography in Italian while living abroad",
                "Interviewed Grammy Nominated band for local television station",
                "Italian Tutor"
            ]
        }]
    }
];



React.render(
    <Parallax type="CardList" data={parallaxData}/>,
    document.getElementById('parallax'),
    function(){
        $('.parallax').parallax();
        $('#parallax .collapsible').collapsible({
            accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });
    }
);

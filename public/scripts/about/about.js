

var aboutMe=[
    {
        title:"About Me",
        key:"About_me",
        paragraph:"I am a front end developer living in Minneapolis. I graduated in 2012 with Summa Cum Laude honors from " +
        "The University of Minnesota. I started off as a self taught computer programmer, but went back to school after " +
        "working for a year in the field. I finished my second degree in two years, while working as a developer part time " +
        " and maintaining a high GPA. Javascript is my first love, however I am always playing around in several other languages. " +
        "<br>" +
        "Besides programming languages I am also fluent in Italian, and have lived and worked on three different continents." +
        " ",
        //imageSrc:"http://pre05.deviantart.net/1bdf/th/pre/f/2010/321/b/4/fall_hike_by_nisse038-d331xop.jpg",
        //imageSrc:"http://i.imgur.com/nrNlJAz.jpg",
        imageSrc:"http://pre05.deviantart.net/1bdf/th/pre/f/2010/321/b/4/fall_hike_by_nisse038-d331xop.jpg",
        imageAlt:"About me, john, hooper, John Hooper, Italian, frontend, hire, programmer, javascript, developer, " +
        "nissenhooper, nissen-hooper,nissen hooper",
        html:[
            {
                //key:"Umn_work",
                //firstLine:"University of Minnesota",
                //secondLine:"Front End Engineer for Open Kim Project",
                //dates:"2014-Current",

            }
        ]
    },
    {
        title:"Contact",
        key:"Contact",
        //imageSrc:"http://i.imgur.com/6DLzjIP.jpg",
        //imageSrc:"http://i.imgur.com/f4PGHBj.jpg?1",
        //imageSrc:"http://i.imgur.com/I1EQfUg.jpg?1",
        imageSrc:"http://i.imgur.com/kislrGs.jpg?1",
        imageAlt:"contact, John, mobile, hire, programmer, javascript, developer, nissenhooper, nissen-hooper," +
        "nissen hooper",
        paragraph:'<h5><a href="tel:+6127411838"><i class="small mdi-communication-phone"></i>(612) 741-1838 </a></h5>' +
            //'<h5><a href="sms:+6127411838"><i class="small mdi-communication-textsms"></i>Text me</a></h5>'+
        '<h5><a href="mailto:john.nissenhooper@gmail.com"><i class="small mdi-content-mail"></i>john.nissenhooper@gmail</a></h5>' +
        '<h5><a href="http://www.linkedin.com/in/nissenhooper"><i class="small mdi-action-account-child"></i>LinkedIn</a></h5>',

    }
];



React.render(
    <Parallax type="ParagraphSection" data={aboutMe}/>,
    document.getElementById('parallax'),
    function(){
        $('.parallax').parallax();
        //$('#parallax .collapsible').collapsible({
        //    accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        //});
    }
);

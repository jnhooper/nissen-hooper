

var aboutMe=[
    {
        title:"About Me",
        key:"About_me",
        paragraph:"I am a front end developer living in Minneapolis. I graduated in 2012 with Summa Cum Laude honors from " +
        "The University of Minnesota. I am largely self-taught in computer programming and have been working as an independent" +
        " contractor for two years. Javascript is my first love, however I can also program in several other languages. " +
        "<br>" +
        "Besides programming languages I am also fluent in Italian, and have lived and worked on three different continents." +
        " ",
        //imageSrc:"http://pre05.deviantart.net/1bdf/th/pre/f/2010/321/b/4/fall_hike_by_nisse038-d331xop.jpg",
        //imageSrc:"http://i.imgur.com/nrNlJAz.jpg",
        imageSrc:"http://pre05.deviantart.net/1bdf/th/pre/f/2010/321/b/4/fall_hike_by_nisse038-d331xop.jpg",
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


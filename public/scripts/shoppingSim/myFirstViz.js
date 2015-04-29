///////////////////////////////////////////////////////////////////
//set up the tests we are expecting.
//dont change the structure of this.
//type is what type of test it is. this is also used for parsing
//data
//latticeCOnstand2Volume is the function that converts the results
//we got from the query. the default is shown in the sc.
//you shouldnt have to change this, it is shown here just so you see
//what is gong on.
///////////////////////////////////////////////////////////////////

var t = new Test(batch1);

var tv = new TestView({model:t});
tv.render();



//var test = new LatticeConstant({
//    type:'sc',
//    y:[],
//    x:[],
//    symbol:'triangle-down',
//    power:3,
//    divisor:1,
//    latticeConstant2Volume:function(amnt){
//        return Math.pow(amnt, this.get('power')) / this.get('divisor');
//    }
//});
//
//var bcc = new LatticeConstant({
//    type:'bcc',
//    symbol:'cross',
//    power:3,
//    divisor:2
//});
//
//var diamond = new LatticeConstant({
//    type:'diamond',
//    symbol:'diamond',
//    power:3,
//    divisor:8
//});
//
////This is the default so we don't have to set anything explicity
////you can but you dont have to
//var fcc = new LatticeConstant();
//
/////////////////////////////////////////////////////////////////////
////Set up the plot options
//var myPlot = new Plot();
//
/////////////////////////////////////////////////////////////////////
////add the tests to our plot
//myPlot.addData([diamond, bcc, sc, fcc]);
//
////get the model and species from the URL
//var model = getURLParams("model");//"EAM_Dynamo_Ercolessi_Adams_Al__MO_123629422045_001";
//var species = getURLParams("species");

///////////////////////////////////////////////////////////////////
//build your query here
//make sure that you set plot to myPlot
///////////////////////////////////////////////////////////////////
//var test = new QueryModel({
//    query: '{"meta.type":"tr", "meta.subject._id":"' + model + '","meta.runner.kimcode":{"$regex":"^CohesiveEnergyVsLatticeConstant_"}}',
//    fields: '{"a.si-value":1,"short-name.source-value":1, "meta.runner.version":1, "species.source-value":1, "cohesive-potential-energy.si-value":1,"_id":0}',
//    database: 'data',
//    plot:myPlot
//});

//test.fetch();




//////////////////////////////////////////////////////////
//append the model name and species name.
//////////////////////////////////////////////////////////
//$('.modelName').append(model);
//$('.speciesName').append(species);

//////////////////////////////////////////////////////////
//window resize
//////////////////////////////////////////////////////////
$( window ).resize(function() {
        resized()
    }
);



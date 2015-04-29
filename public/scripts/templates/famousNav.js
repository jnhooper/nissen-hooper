var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var StateModifier = famous.modifiers.StateModifier;
var Transform = famous.core.Transform;
var ImageSurface = famous.surfaces.ImageSurface;
var Surface = famous.core.Surface;
var Container = famous.surfaces.ContainerSurface;
//
//


var mainContext = Engine.createContext();
container = new Container({
    size:[,true],
    properties: {
        backgroundColor: '#C94471'
}})
//mainContext.add(Container);


var shift=1/navLinks.length;
var alignx = 0;
for(var i =0; i<navLinks.length; i++){
    var linkSurface = new Surface({
        content:navLinks[i].name,
        size:[true,30],
        properties:{
            color:'white',
            backgroundColor:'#C94471',
            textAlign:'center'
        }
    });

    console.log(shift);
    var link_shift = new StateModifier({
        align: [alignx,0]
    });
    container.add(link_shift).add(linkSurface);
    alignx+=shift;
}

var firstSurface = new Surface({
    content: "",
    size: [, 200],
    properties: {
        backgroundColor: 'rgb(240, 238, 233)',
        textAlign: 'center',
        padding: '5px',
        border: '2px solid rgb(210, 208, 203)',
        marginTop: '50px',
        marginLeft: '50px'
    }
});

mainContext.add(container);
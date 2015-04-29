/**
 * Created by John on 4/10/2015.
 */
var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var StateModifier = famous.modifiers.StateModifier;
var Transform = famous.core.Transform;
var ImageSurface = famous.surfaces.ImageSurface;
var Surface = famous.core.Surface;
var Container = famous.surfaces.ContainerSurface;
var gridLayout = famous.views.GridLayout;
var mainContext = Engine.createContext();

//var container = new Container({
//    size:[,]
//});
//
//var leftSurface = new Surface({
//    size:[,],
//    properties:{
//        backgroundColor:'green'
//    }
//});
//
//var rightSurface = new Surface({
//    size:[,],
//    properties:{
//        backgroundColor:'dodgerBlue'
//    }
//});
//
//var leftShift = new StateModifier({
//    origin: [0.5, 0],
//});
//var rightShift = new StateModifier({
//    align: [.5, 0]
//});
//
//var content= new Surface({
//    size:[,100],
//    properties:{
//        backgroundColor:'red'
//    }
//});
//var leftSide = mainContext.add(leftShift).add(container);
////var rightSide = mainContext.add(rightShift).add(container);
////var leftSide = mainContext.add(leftShift);
//    leftSide.add(leftSurface);
//
////var rightSide = mainContext.add(rightShift);
////    rightSide.add(rightSurface);
////need to be container surfaces instead?
////leftSide = leftSide.add(rightShift);
////leftSide.add(content);
////rightSide.add(content);
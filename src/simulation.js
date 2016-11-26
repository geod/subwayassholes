//x - total number of people
//y - % assholes
//z - total time
var draw3 = draw;

var params = [];
var sims = 1;
// for(var i=1;i<=MAX_PEOPLE;i++){
//   for(var j=0; j<=i;j++){
//     var p = {exiting: i, assholes: j, polite:i-j};
//     params.push(p);
//   }
// }
for(i=0;i<=MAX_PEOPLE;i++){
  var p = {exiting: MAX_PEOPLE, assholes: i, polite:MAX_PEOPLE-i};
  for(r=0;r<50;r++){
      params.push(p);
  }
}

var ap = null;
var dne = false;
var pCounter = 0;
RENDER = false;
FR = 10000;
var startTime = undefined;

function draw2() {
  //if not done pluck requirement
  if(ap == null){
    ap = params[pCounter % params.length];
    pCounter++;

    noExiting = ap.exiting;
    noPolite = ap.polite;
    noAsshole = ap.assholes;

    console.log("Finished P5:" + p5.instance);
    createNewP5();
    startTime = new Date();

    return;
  }
  //call through to draw3 (returns true if running)
  var res = draw3();
  if(!res){
    var elapsed = new Date() - startTime;
    console.log("Done:" + JSON.stringify(ap) + ", ic:" + ic + ", elapsed:" + elapsed);
    ap = null;
  }else if(ic > 2000){
    var elapsed = new Date() - startTime;
    console.log("Done:" + JSON.stringify(ap) + ", ic:" + 'NA' + ", elapsed:" + elapsed);
    ap = null;
  }
}

function createNewP5(){
  if(p5.instance != undefined){
    for (var member in p5.instance._registeredMethods) delete p5.instance._registeredMethods[member];
    p5.instance._registeredMethods = { pre: [], post: [], remove: [] };
    p5.instance.remove();
  }
  p5.instance = new p5();
}

draw = draw2;

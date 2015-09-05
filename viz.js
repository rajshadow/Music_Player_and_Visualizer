var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioElement = document.getElementById('sound');
var audioSrc = audioCtx.createMediaElementSource(audioElement);
var analyser = audioCtx.createAnalyser();

// Bind our analyser to the media element source.
audioSrc.connect(analyser);
audioSrc.connect(audioCtx.destination);

var songs,currSongIndex;
var sound = document.getElementById('sound');
var reader = new FileReader();

function init(){
	songs = document.getElementById('audio');
	console.log(songs.files);
	currSongIndex=0;
	console.log(songs.files.length);
	reader.onload = function(e){
		console.log("load "+currSongIndex);
		sound.src = e.target.result;
		while(sound.paused)
			sound.play();
	};
	playFile();
}

function prevSong(){
	console.log("prev song");
	if(currSongIndex!=0){
		currSongIndex--;
		playFile();
	}
}
function nextSong(){
	console.log("next song");
	if(currSongIndex!=songs.length){
		currSongIndex++;
		playFile();
	}
}

function pause(){
	sound.pause();
}

function stop(){
	sound.pause();
	sound.currentTime = 0;
}

function setup(){
	if(vizType==0)
		setupRect();
	else
		setupCircle();
	resize=0;
	console.log(resize);
	play();
}

function play(){
	sound.play();
}

function playFile() { 
	console.log("read "+currSongIndex);
	d3.select("#songName").text(songs.files[currSongIndex].name);
    reader.readAsDataURL(songs.files[currSongIndex]);
    play();
}

var frequencyData = new Uint8Array(200);
var width=window.innerWidth,
	height=window.innerHeight*0.84,
	barPadding = '1',
	vizType=0,resize=0;

var barScale = d3.scale.linear().domain([0,255]).range([0,height]);
var svg = d3.select("#canvas").append("svg").attr("height",height).attr("width",width);
var colorScale = d3.scale.linear().domain([0,255]).range(["black","blue"]);
var circleScale = d3.scale.linear().domain([0,200]).range(["blue","red"]);
var mixScale = d3.scale.category20();
setupRect();

function resizeSvg(){
	resize=1;
	width=window.innerWidth;
	height=window.innerHeight*0.84;	
	svg.selectAll("*").remove();
	svg.attr("height",height).attr("width",width);
	barScale.range([0,height]);
	setup();
}

function changeViz(){
	svg.selectAll("*").remove();
	if(vizType==0){
		vizType=1;
		setupCircle();
	}
	else{
		vizType=0;
		setupRect();
	}
}

function setupRect(){
	svg.selectAll('rect')
   		.data(frequencyData)
    	.enter()
    	.append('rect')
    	.attr('x', function (d, i) {
      		return i * (width / frequencyData.length);
   		})
   		.attr('width', width / frequencyData.length)
   		.style("fill","white");
   	startRectViz();
}

function startRectViz(){
	if(resize==1)
		console.log("stopped");
	if(vizType==0 && resize==0)
		requestAnimationFrame(startRectViz);
	analyser.getByteFrequencyData(frequencyData);
	svg.selectAll('rect')
      .data(frequencyData)
      .attr('y', function(d) {
         return height - barScale(d);
      })
      .attr('height', function(d) {
         return barScale(d);
      })
      .style('fill', function(d) {
      		return colorScale(d);
        	return 'rgb('+0+','+0+','+d+')';
      });
}

function setupCircle(){
	svg.selectAll('rect')
	   .data(frequencyData)
	   .enter()
	   .append('circle')
	   .attr('cy', height/2)
	   .attr('cx', width/2)
	   .attr('r',0)
	   .style("fill","white")
	startCircleViz();
}

function startCircleViz(){
	if(vizType==1 && resize==0)
		requestAnimationFrame(startCircleViz);
	analyser.getByteFrequencyData(frequencyData);
	svg.selectAll('circle')
      .data(frequencyData)
      .attr('r',function(d){return barScale(d)/2.3;})
      .style('fill', function(d,i) {
         return mixScale(i);
      });
}

var currColor=0;
function changeColor(){
	var newColor = mixScale(currColor++);
	console.log(newColor);
	colorScale.range(["black",newColor]);
}

var night=0;
nightMode();
function nightMode(){
	if(night==0){
		d3.select("body").style("background-color","black");
		d3.selectAll("button")
			.style("background-color","grey")
			.style("border-color","grey");
		night=1;
	}
	else{
		d3.select("body").style("background-color","white");
		d3.selectAll("button")
			.style("background-color","white")
			.style("border-color","black");
		night=0;	
	}
}


var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioElement = document.getElementById('sound');
var audioSrc = audioCtx.createMediaElementSource(audioElement);
var analyser = audioCtx.createAnalyser();

// Bind our analyser to the media element source.
audioSrc.connect(analyser);
audioSrc.connect(audioCtx.destination);

var songs=[],currSongIndex=-1;
var sound = document.getElementById('sound');
var reader = new FileReader();

function updatePlaylist(){
	var rows=d3.select("table").select("tbody").selectAll("tr").data(songs);

	rows.exit().remove();

	var columns=rows.enter()
		.append("tr");

	d3.select("table")
		.selectAll("tr")
		.on("click" , function(d){
			var deleteIndex = $(this).index();
			console.log(deleteIndex);
			songs.splice(deleteIndex,1);
			updatePlaylist();
        })
		.html(function(d){return "<td>"+d.name+"</td>";});
}

function init(){
	var newSongs = document.getElementById('audio');
	for(var i=0;i<newSongs.files.length;++i){
		console.log(newSongs.files[i]);
		songs.push(newSongs.files[i]);
	}
	updatePlaylist();
	console.log(songs);
	currSongIndex++;
	console.log(songs.length);
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
	if(currSongIndex!=songs.length-1){
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

var repeat = false;
d3.select("#repeatButton").style("opacity",0.5);
function toggleRepeat(){
	if(repeat){
		repeat = false;
		sound.loop = false;
		d3.select("#repeatButton").style("opacity",0.5);
		resizeSvg();
	}
	else{
		repeat = true;
		sound.loop = true;
		d3.select("#repeatButton").style("opacity",1);
		resizeSvg();
	}

}

function setup(){
	switch(vizType){
		case 0:
			setupRect();
			break;
		case 1:
			setupCircle();
			break;
		case 2:
			setupMountain();
			break;
		case 3:
			setupWave();
			break;
	}
	resize=0;
}

function play(){
	sound.play();
}

function playFile() { 
	console.log("read "+currSongIndex);
	d3.select("#songName").text(songs[currSongIndex].name);
    reader.readAsDataURL(songs[currSongIndex]);
    play();
}

var frequencyData = new Uint8Array(180);
var Twidth = document.getElementById('tab').offsetWidth;
var width=window.innerWidth-Twidth-40,
	height=window.innerHeight*0.80,
	barPadding = '0',
	vizType=0,resize=0;

var barScale = d3.scale.linear().domain([0,255]).range([0,height]);
var pieScale = d3.scale.linear().domain([0,150,255]).range([0,height/4,height]);
var svg = d3.select("svg").attr("height",height).attr("width",width);
var colorScale = d3.scale.linear().domain([0,255]).range(["black","blue"]);
var circleScale = d3.scale.linear().domain([0,200]).range(["blue","red"]);
var mixScale = d3.scale.category20();
var mixScaleOdd = d3.scale.category20b();
setupRect();
var hidden=false;
var tableWidth=document.getElementById("tab").offsetWidth;
function resizeSvg(){
	resize=1;
	Twidth=hidden?0:tableWidth+40;
	//40+(hidden?0:200);
	width=window.innerWidth-Twidth;
	console.log("hidden: "+hidden);
	console.log(Twidth);
	height=window.innerHeight*0.80;	
	svg.selectAll("*").remove();
	svg.attr("height",height).attr("width",width);
	barScale.range([0,height]);
	setup();
}

$(document).on("click", "#playlist", function() {
	hidden=!hidden;
  	resizeSvg();
});

var numOfViz = 4;
function changeViz(){
	svg.selectAll("*").remove();
	vizType=(vizType+1)%numOfViz;
	switch(vizType){
		case 0:
			setupRect();
			break;
		case 1:
			setupCircle();
			break;
		case 2:
			setupMountain();
			break;
		case 3:
			setupWave();
			break;
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
	svg.selectAll('circle')
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
      .attr('r',function(d){return pieScale(d)/2.3;})
      .style('fill', function(d,i) {
      	return mixScale(i);
        //return (i%2 == 0) ? mixScale(i) : mixScaleOdd(i);
      });
}

var tempData = new Uint8Array(frequencyData.byteLength-10);
var mountainData = new Uint8Array(2*tempData.byteLength);
var waveData = new Uint8Array(4*tempData.byteLength);

function setupMountain(){
	svg.selectAll('rect')
   		.data(mountainData)
    	.enter()
    	.append('rect')
    	.attr('x', function (d, i) {
      		return i * (width / mountainData.length);
   		})
   		.attr('width', width / mountainData.length)
   		.style("fill","white");
   	startMountainViz();
}

function startMountainViz(){
	if(vizType==2 && resize==0)
		requestAnimationFrame(startMountainViz);
	analyser.getByteFrequencyData(frequencyData);
	tempData = frequencyData.slice(10,180);
	mountainData.set(tempData,tempData.byteLength);
	tempData.reverse();
	mountainData.set(tempData,0);
	svg.selectAll('rect')
      .data(mountainData)
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

function setupWave(){
	svg.selectAll('rect')
   		.data(waveData)
    	.enter()
    	.append('rect')
    	.attr('x', function (d, i) {
      		return i * (width / waveData.length);
   		})
   		.attr('width', width / waveData.length)
   		.style("fill","white");
   	startWaveViz();
}

function startWaveViz(){
	if(vizType==3 && resize==0)
		requestAnimationFrame(startWaveViz);
	analyser.getByteFrequencyData(frequencyData);
	tempData = frequencyData.slice(10,180);
	waveData.set(tempData,tempData.byteLength);
	waveData.set(tempData,tempData.byteLength*3);
	tempData.reverse();
	waveData.set(tempData,0);
	waveData.set(tempData,tempData.byteLength*2);
	svg.selectAll('rect')
      .data(waveData)
      .attr('y', function(d) {
         return height - barScale(d);
      })
      .attr('height', function(d) {
         return barScale(d);
      })
      .style('fill', function(d) {
      		return colorScale(255);
        	return 'rgb('+0+','+0+','+d+')';
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

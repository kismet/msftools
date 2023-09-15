function injectLibraries(sources){
	for( i = 0; i<sources.length; i++ ){
		scriptNode = document.createElement('script');
		scriptNode.src = sources[i];
		document.getElementsByTagName('head')[0].appendChild(scriptNode);
	}
}

class ISOInfo {
  color;
  class;
  level;
}

class CharacterInfo {
  level;
  star;
  gear;
  iso;
  skills;
  power;
  slots;
  name;
  power;
}

function setPower(c,x){
  parts = $(x).find('#toon-stats div');
  power = parts[1].innerText.replace(',','')*1;
  c.power = power;
}

function setLevel(c,x){
  parts = $(x).find('#toon-stats div');
  level = parts[0].innerText.replace('LVL','')*1;
  c.level = level;
}

function setStars(c,x){
  parts = $(x).find('#toon-stats div');
  star = parts[2].innerText;
  if ( star == "MAX" ){
    star = 7;
  }else{
    qta = star.split('/')[1]*1;
    switch( qta ) {
      case 300: star = 6; break;
      case 200: star = 5; break;
      case 130: star = 4; break;
      case  80: star = 3; break;
      case  55: star = 2; break;
      case  30: star = 1; break;
      case  15: star = 0; break;
    }
  }
  c.star = star;
}

function setSkills(c,x){
  parts = $(x).find('#toon-stats div.ability-level');
  skill = [];
  for(i=0;i<parts.length;i++){
    skill[i] = 0;
    for(j=1; j<=8; j++){
      if ( parts[i].className.includes('-level-0'+j) ) {
        skill[i] = j
        break;
      }
    }
  }
  c.skills = skill;
}

function setISO(c,x){
  parts = $(x).find('#toon-stats div.iso-wrapper div');
  iso = { class : null, color: null, level: 0 }
  if ( parts.length != 3 ){
    c.iso = null
    return;
  }

  if( parts[1].className.includes('-blue') ) {
    iso.color = 'blue'
  }else if( parts[1].className.includes('-green') ) {
    iso.color = 'green'
  }
  iso.level = parts[2].className.substring(parts[2].className.length-1);

  classMap = new Map([["restoration" ,"healer"], ["gambler", "raider"],
    ["fortify","fortifier"], ["assassin","striker"], ["skirmish" , "skirmisher"]]
  );
  classMap.forEach( (k,v) => {
    console.log([k,v,parts[1].className]);
    if (iso.class != null )
      return;
    if ( parts[1].className.includes("-"+v+"-") ) {
      iso.class = k;
    }
  });
  if( iso.class == null ){
    //TODO log error
  }
  c.iso = new ISOInfo();
  c.iso.color = iso.color;
  c.iso.level = iso.level;
  c.iso.class = iso.class;
}

function setEquip(c, x){
  parts = $(x).find('div.no-border-behind div div');
  slots = [ 0, 0, 0, 0, 0, 0 ];
  for(i = 0; i < slots.length; i++){
    if(parts[i].children[1].className.includes('fa-check-square')){
      slots[i] = 1;
    }
  }
  c.slots = slots;
}

function setGear(c,x){
  gear = $(x).find('svg')[0].classList[0].substring(1)*1;
  c.gear = gear;
}

function setName(c,x){
  name = $(x).find('h4')[0].innerText;
  c.name = name;
}

function extractCharacterInfo(i, x){
  if(x.className!="character"){
    console.log("Skipping..."+x);
    return;
  }
  c = new CharacterInfo();
  setName(c,x);
  setISO(c,x);
  setGear(c,x);
  setPower(c,x);
  setSkills(c,x);
  setEquip(c,x);
  setStars(c,x);
  setLevel(c,x);
  console.log(c);
	toons.push(c);
  return c;
}


var toons = [];
function exportRoster() {
	toons = [];
  $('div.hero-list li.character').each(extractCharacterInfo);
	exportRosterAsCSV();

}

function exportRosterAsCSV() {
	csv = "name,power,level,gear,basic,special,ultimate,passive,";
	csv += "iso_class,iso_level,gear_tl,gear_cl,gear_bl,gear_br,gear_cr,gear_tr\n";
	toons.map( function(c) {
		var str = '';
		str += c.name+","+c.power+","+c.level+","+c.gear+","+c.skills.join(",")+",";
		if(c.iso == null) str+="none,0,";
		else if(c.iso.color == "green") str+= c.iso.class+",1."+c.iso.level+",";
		else if(c.iso.color == "blue") str+= c.iso.class+",2."+c.iso.level+",";
		str += c.slots.join(",");
		console.log(str);

		csv += str + "\n";
	});
	var myFile = new File([csv], "roster.csv", {type: "text/plain;charset=utf-8"});
	saveAs(myFile);
}
function addRosterButton(){
	console.log("Creating Roster Export Button");
	x = document.createElement('div');
	var html = '<button id="x-msftools-roster" style="margin: 3px 5px;" class="blue-primary button">';
	html +='<div class="button-wrapper"><i class="fas fa-file-csv" style="margin-right: 4px;" aria-hidden="true"></i>Export to CSV</div>';
	html +='</button>';
	x.innerHTML = html;
	x.addEventListener('click',exportRoster);

	if( document.getElementsByClassName('roster-filters').length == 0 || document.getElementsByClassName('roster-filters')[0] == null){
		numberOfCheck = 0
		return
	}
	console.log("Adding button to UI");
	root = document.getElementsByClassName('roster-filters')[0];
	root.childNodes[0].appendChild(x);
}


var rebuildUIInterval = null;
var numberOfCheck = 0;

function rebuildUI(){
  console.log("Check UI");
	if ( jQuery('#x-msftools-roster').length == 0 ){
			addRosterButton();
			console.log("We are rebuilding UI");
      numberOfCheck = 0;
	}else{
		numberOfCheck++;
		console.log("UI is okay "+numberOfCheck+"/10");
		if( numberOfCheck == 10 ) {
			console.log("UI is built stopping the timer");
		  clearInterval(rebuildUIInterval);
		}
	}
}


jQuery(document).ready(function (){
	/*
	var scripts = [
		"//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js",
		"https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
	]
	*/
	var scripts = [
		"https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
	];

	injectLibraries(scripts);
	rebuildUIInterval = setInterval( rebuildUI, 1000);
});

function injectLibraries(sources){
	for( i = 0; i<sources.length; i++ ){
		scriptNode = document.createElement('script');
		scriptNode.src = sources[i];
		document.getElementsByTagName('head')[0].appendChild(scriptNode);
	}
}

var scripts = [
	"//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
]

injectLibraries(scripts);




function exportRoster() {
  $('li.character').each(
    parts = $(x).find('#toon-stats div');
    level = parts[0].innerText.replace('LVL')*1;
    star = parts[2].innerText
    if ( star == "MAX" ){
      star = 7;
    }else{
      qta = star.split('/')[1];
      switch( qta ) {
        300: star = 6; break;
        200: star = 5; break;
        130: star = 4; break;
         80: star = 3; break;
         55: star = 2; break;
         30: star = 1; break;
         15: star = 0; break;
      }
    }
    power = parts[1].innerText.replace(',','');

    parts = $(x).find('#toon-stats div.ability-level');
    skill = [];
    for(int i=0;i<parts.length;i++){
      skill[i] = 0;
      for(int j=1; j<=8; j++){
        if ( parts[i].className.includes('-level-0'+j) ) {
          skill[i] = j
          break;
        }
      }
    }
    parts = $(x).find('#toon-stats div.iso-wrapper div');
    iso = { class : null, color: null, level: 0 }
    if ( parts.length == 3 ){
      if( parts[1].className.includes('-blue') ) {
        iso.color = 'blue'
      }else if( parts[1].className.includes('-green') ) {
        iso.color = 'green'
      }
      iso.level = parts[2].className.substring(parts[2].className.length-1);

      classMap = { "restoration" : "healer", "gambler" : "raider",
        "fortify":"fortifier", "assassin","striker", "skirmish" : "skirmisher"
      }
      classMap.forEach( (k,v) => {
        if (iso.class != null )
          return;
        if ( parts[1].className.includes("-"+k+"-") ) {
          iso.class = v;
        }
      });
      if( iso.class == null ){
        //TODO log error
      }

      parts = $(x).find('div.no-border-behind div div')
      slots = [ 0, 0, 0, 0, 0, 0 ];
      for(int i = 0; i < slots.length; i++){
        if(parts[i].children[1].className.includes('fa-check-square')){
          slots[i] = 1;
        }
      }

      name = $(x).find('h4')[0].innerText;
      gear = $(x).find('svg')[0].classList[0].substring(1)*1;
    }
  );
}


x = document.createElement('div');
x.innerHTML = '<button style="margin: 3px 5px;" class="blue-primary button"><div class="button-wrapper"><i class="fas fa-file-csv" style="margin-right: 4px;" aria-hidden="true"></i>Export to CSV</div></button>'
x.addEventListener('click',exportRoster);

root = document.getElementsByClassName('roster-filters')[0];
root.childNodes[0].appendChild(x);

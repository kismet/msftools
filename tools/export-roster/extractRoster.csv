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

)

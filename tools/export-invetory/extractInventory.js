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

function exportInvetoryAsCSV(){
	URL = "https://marvelstrikeforce.com/en/inventory/";
	ref = window.location+"";
	if (ref.startsWith(URL) == false || ref == URL ){
		console.log("You can download the invetory from INVETORY page after that you LOG-IN");
		return;
	}
	csv = "item,qta\n";
	$('div.item').each( function (idx) {
	  str = $(this).find('h4').text();
	  str += ",";
	  str += $(this).find('b').text().replace(',','');
	  csv += str + "\n";
	})
	var myFile = new File([csv], "invetory.csv", {type: "text/plain;charset=utf-8"});
	saveAs(myFile);
}

function exportNamesAsCSV(){
	URL = "https://marvelstrikeforce.com/en/hero-total-stats";
	ref = window.location + ""
	if (ref != URL ){
		console.log("You can download the original names only from the page "+URL);
		return;
	}
	list = "CommonName,InternalName"; 
	$('tr td a').each( function(i) { 
		list+=$(this).text().trim()+","; 
		list += this.href.split("/").pop()+"\n"
	});

	var myFile = new File([list], "names.csv", {type: "text/plain;charset=utf-8"});
	saveAs(myFile);
}
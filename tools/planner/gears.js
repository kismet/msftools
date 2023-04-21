'use strict';

//const fs = require('fs');
//const neatCsv = require('neat-csv');
import neatCsv from 'neat-csv';
import fs from 'fs';

class GearInfo {
	tier;
	name;
	id;
	requires;
	gold;
}

var dbGear = new Map();
var requiredItems = new Map();

function updatedGearDatabase(item){
	if(dbGear.get(item.name))
		return;
	var x = new GearInfo();
	x.id = item.id;
	x.name = item.name;
	x.tier = item.tier;
	if( item.hasOwnProperty('directCost') ){
		x.requires = new Map();
		var i = 0;
		for (i = 0; i < item.directCost.length; i++){
			var cur = item.directCost[i];
			if( cur.item.name == "Gold" ) {
				x.gold = cur.quantity;
				continue;
			}
			x.requires.set(cur.item.name, cur.quantity);
			updatedGearDatabase(cur.item);
		}			
	}else{
		x.requires = null;
	}
	dbGear.set(item.name, x);
}

function getRequiredGears(name, end, start, slots){
	/*
	console.log(name);
	console.log(end);
	console.log(start);
	console.log(slots);
	*/
	var gears = new Map();
	var pg;
	pg = JSON.parse(fs.readFileSync('../data/'+name+'.js'));
	var builtItems = pg.data.gearTiers[start].slots;
	var rank = start;
	while(rank<end){
		var i = 0;
		for(i = 0;i < builtItems.length; i++){
			if( rank == start && slots[i] != 0 )
				continue;
			
			var k = builtItems[i].piece.name;
			//console.log(k);
			var qta = gears.get(k);
			if (qta == null){
				gears.set(k,1);
			}else{
				qta++;
				gears.set(k,qta);
			}	
			updatedGearDatabase(builtItems[i].piece);
		}
		rank++;
	}
	return gears;
}

function loadRequireItems(teams){
	var i = 0;
	for(i = 0; i<teams.length; i++){
		if ( teams[i].Id == "" ) 
				continue;
		var equipedSlots = [];
		var j = 1;
		for(j = 1; j <= 6; j++){
			equipedSlots[j-1] = teams[i][j];
		};
		var x = getRequiredGears(teams[i].Id, teams[i].GearGoal, teams[i].StartGear, equipedSlots);
		x.forEach((v,k,m) => {
			var c = requiredItems.get(k);
			if( c == null ) {
				requiredItems.set(k,v);
			}else{
				requiredItems.set(k, c + v );
			}
		});
	}
}

//console.log( await neatCsv(fs.readFileSync('teams.csv')));
var teams;
var invetory = new Map(); 
var data;
data =  await neatCsv(fs.readFileSync('invetory.csv'));
var i = 0;
for(i = 0; i < data.length; i++){
	if (data[i].qta.endsWith("K")){
		data[i].qta = data[i].qta.substring(0, data[i].qta.length - 1);
		data[i].qta = data[i].qta * 1000;
	}else{
		data[i].qta = data[i].qta * 1;
	}
	invetory.set(data[i].item, data[i].qta);
}

function subtractInvetory(items, invetory){
	var computed = new Map(items);
	items.forEach( (v,k,m) => {
		var qta = invetory.get(k)
		if ( qta != null ){
			if ( v - qta > 0 ) {
				computed.set(k, v - qta );
			}else{
				computed.set(k, 0);
			}
		}
	});
	items.clear();
	computed.forEach( (v,k,m) => {
		items.set(k,v);
	});	
}

function buildMissingItems(items,db){
	var flag = false;
	var computed = new Map();
	items.forEach( (v,k,m) => {
		var gear = db.get(k);
		if ( v == 0 ) return;
		if ( gear.requires == null ){
			computed.set(k,v);
			return;
		}
		flag = true;
		gear.requires.forEach( (qta,name) => {
			var cur = computed.get(name);
			if ( cur == null ) cur = 0;
			computed.set(name,qta*v + cur*1);
		});
	});	
	items.clear();
	computed.forEach( (v,k,m) => {
		items.set(k,v);
	});
	return flag;
}

//console.log(invetory);

teams =  await neatCsv(fs.readFileSync('teams.csv'));

loadRequireItems(teams);
console.log("Current requirements...");
console.log(requiredItems);
var rootReached = false;
do{
	console.log("Removing items from Inventory");
	subtractInvetory(requiredItems, invetory);
	console.log("Updated requirements...");
	console.log(requiredItems);
	console.log("Calculating items to build...");
	rootReached = !buildMissingItems(requiredItems,dbGear);
	console.log("Updated requirements...");
	console.log(requiredItems);
}while(rootReached == false);

var output = fs.createWriteStream("farming.csv");
output.write("item,qta\n");
requiredItems.forEach( (v,k,m) => {
	if (v<=0) return;
	output.write(k+','+v+"\n");
});
output.end();

//console.log(dbGear);
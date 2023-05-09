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

class EquipInfo {

	name;
	quantity;
	needed;
	requiredBy;
	qtaUsedFromInvetory;
	qtaBuilt;

	constructor(name, qta){
		if ( qta == null ){
			qta = 1;
		}
		this.name = name;
		this.quantity = qta;
		this.needed = this.quantity;
		this.requiredBy = [];
		this.qtaUsedFromInvetory = 0;
		this.qtaBuilt = 0;
	}

	actualNeededQuantity(){
		return this.quantity;
	}

	originalNeededQuantity(){
		return this.needed;
	}

	addNeededQuantity(n){
		this.quantity += n;
		this.needed += n;
	}

	useFromInvetory(n){
		console.log("Using "+this.name+" from inventory for "+n+" QTA");
		this.quantity-=n;
		if(this.quantity<=0) this.quantity = 0;
		this.qtaUsedFromInvetory += n;
	}

	buildEquip(n){
		this.quantity-=n;
		if(this.quantity<=0) this.quantity = 0;
		this.qtaBuilt+=n;
	}


	/*
	toString(){
		return JSON.stringify(this, null, 2);
	}
	*/
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
	console.log([name,end,start,slots]);
	*/
	var gears = new Map();
	var pg;
	pg = JSON.parse(fs.readFileSync('../../data/'+name+'.js'));
	var builtItems = pg.data.gearTiers[start].slots;
	var rank = start;
	while(rank<end){
		var i = 0;
		for(i = 0;i < builtItems.length; i++){
			if( rank == start && slots[i] != 0 )
				continue;

			var k = builtItems[i].piece.name;
			var equip = gears.get(k);
			if ( equip == null ){
				equip = new EquipInfo(k);
				gears.set(k, equip);
				equip.requiredBy.push(name);
			}else{
				equip.addNeededQuantity(1);
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
				//console.log("Inspecting..."+JSON.stringify(v,null,2));
				//console.log("Inspecting..."+JSON.stringify(c,null,2));
				c.addNeededQuantity(v.actualNeededQuantity());
				c.requiredBy.push(teams[i].Id);
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
	items.forEach( (v,k,m) => {
		var needed = v.actualNeededQuantity();
		if( needed <= 0) 
			return;

		//console.log( "Subcratring at ... \n" + JSON.stringify(v,null,2) );
		var qta = invetory.get(k)
		if ( qta != null ){
			v.useFromInvetory(Math.min(qta,needed));
		}
	});
}

function buildMissingItems(items,db){
	var flag = false;
	var addMe = new Map();
	items.forEach( (v,k,m) => {
		var gear = db.get(k);
		//Check if there are any gear that is not built or part of my invetory
		if ( v.actualNeededQuantity() <= 0 ) {
			return;
		}
		//Check if the gear can be built
		if ( gear.requires == null ){
			return;
		}
		flag = true;
		//If i reach this part means that the gear can be built so I have to
		//calcualte the total item required for building it
		gear.requires.forEach( (qta,name) => {
			var equip = items.get(name);
			if(equip == null){
				equip = addMe.get(name);
				if ( equip == null ) {
					equip = new EquipInfo(name, 0);
					addMe.set(name, equip);
				}
			}
			equip.addNeededQuantity(qta * v.actualNeededQuantity() );
			equip.requiredBy.push(v.actualNeededQuantity()+"x "+v.name );
		});

		v.buildEquip(v.actualNeededQuantity());
	});
	addMe.forEach((item, k) => {
		items.set(k, item);
	});

	return flag;
}

//console.log(invetory);

teams =  await neatCsv(fs.readFileSync('teams.csv'));

loadRequireItems(teams);
console.log("Current requirements...");
console.log(requiredItems);
var rootReached = false;
var maxRun = 10;
do{
	console.log("Removing items from Inventory");
	subtractInvetory(requiredItems, invetory);
	console.log("Updated requirements after checking invetory...");
	console.log(requiredItems);
	console.log("Calculating items to build...");
	rootReached = !buildMissingItems(requiredItems,dbGear);
	console.log("Updated requirements after building non root gear...");
	console.log(requiredItems);
	maxRun--;
}while(rootReached == false && maxRun > 0);

var output = fs.createWriteStream("farming.csv");
output.write("item,qtaToFarm,qtaInInvetory,qtaBuilt,qtaOriginalyNeeded,UsedBy\n");
requiredItems.forEach( (v,k,m) => {
	output.write(k+','+v.actualNeededQuantity()+','+v.qtaUsedFromInvetory+','+v.qtaBuilt+','+v.needed+','+v.requiredBy+"\n");
});
output.end();

//console.log(dbGear);

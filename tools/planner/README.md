# HOW-TO use the scripts
## Why this tool? Comparison with Dark Dimension planner
The tool has been created for two main reason:
1. There is no Apo planner which requrie Gear 17 on the marvelstrikeforce website
1. The Dark Dimension planner algorithm does not take into account the built item, 
which means that if you obtained a "Augmented Axial Stimulant" as rewards of some
event the Dark Dimension planner will not consider

### Disclamer
This tools is at very early stage of developement, it has been proven to be working 
but it may fails, if so please notify the author.
The tool at the moment has hardcoded path and names so read carefully the instructions

## Requirements
- The tool uses NodeJS, you can download it from https://nodejs.org/
- After download you must run npm install from the current directory
- The tool look for invetory.csv and team.csv file within the current directory

## Configuration
### Teams
You tool comes with an example of team.csv file which is used for building the list of gears 
that you need, so please modify according to your needs. The file is easy to understand, but
here is a description of the columns:
- Name: at the moment is ignored
- Id: identifies the name of character that you want to gear up
- StartLevel: at the moment is ignored
- StartGear: is the current Gear level of the character	(i.e. 15 means Gear 15)
- LevelGoal: at the moment is ignored
- GearGoal: is the Gear level that you want to reach (i.e. 17 means Gear 17)	
- "1 2 3 4 5 6": each column reppresent one of the slot of the character if you have already equiped 
some items set them value to "1" otherwise leave it to "0"
### Invetory
The invetory.csv reppresent the items that you own, you can extract it from the game by going on the
https://marvelstrikeforce.com and use the webexport-gear tools from this suite

## Guide
1. Adapt the teams.csv file according to your plan. At the moment the provided file is configured 
for 7 yellow star Apocalypse
2. Update the invetory.csv to match the the items that you own
3. Run the tool with `nodejs gear.js` it will create a file farming.csv which items that you have farm,
collect or buy  

## Troubleshooting


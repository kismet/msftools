#
# Copyright (c) 2023 Stefano "Jarvis" Lenzi <stefano@lenzi.pro>
#

#/bin/bash
#URL="https://api-prod.msf.gg/services/api/getCharacterbyId?characterId=$id"
URL="https://api-prod.marvelstrikeforce.com/services/api/getGearTierInfo?characterId=$id"
which wget 2>&1 1>/dev/null || ( 
		echo "This tool requires wget, please download it" && 
		exit 1 
	) || exit 1


test -f names.csv || (
		echo "
Could not find names.csv in $(pwd), please generate it and put in the current 
folder" &&
		exit 1
	) || exit 1

cat names.csv | sed 1d |
	cut -d , -f 2 | 
	while read id; do 
		echo "Extracing gears info for $id;" 
		wget -O ${id}.js https://api-prod.marvelstrikeforce.com/services/api/getGearTierInfo?characterId=$id ; 
		#The following line will wait from 0 to 4 seconds
		sleep $(($RANDOM/2048*10/32))
	done

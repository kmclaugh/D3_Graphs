#!/usr/bin/env python
import csv
import json
import pandas

dataframe = pandas.read_csv('Candidates.csv')

candidate_dictionary = {}
for row in dataframe.iterrows():
    president = row[1][0]
    if president not in candidate_dictionary:
        position_list = [{'Position': row[1][1], 'Start_Date':row[1][2], 'End_Date':row[1][3], 'Years_of_Experience':row[1][4]}]
        candidate_dictionary[president] = {'experience': position_list}
        
    ##Candidate Position	Start Date	End Date	Years of Experience	Points
    candidate_dictionary[president]['experience'].append({'Position': row[1][1], 'Start_Date':row[1][2], 'End_Date':row[1][3], 'Years_of_Experience':row[1][4]})

candidate_list = []
for candidate, value in candidate_dictionary.iteritems():
    new_object = {'name': candidate, 'experience': value['experience']}
    candidate_list.append(new_object)

with open('Candidates.json', 'w') as fp:
    json.dump(candidate_list, fp)
#print(dataframe.dtypes)
#dataframe.to_json('data.json', orient="records")
#csvfile = open('worst_atrocities.csv', 'r')
#jsonfile = open('worst_atrocities.json', 'w')
#
#fieldnames = ("Cause","Year","Death_Total","Relative","Century_String")
#reader = csv.DictReader(csvfile, fieldnames, quoting=csv.QUOTE_NONNUMERIC)
#for row in reader:
#    json.dump(row, jsonfile)
#    jsonfile.write('\n')

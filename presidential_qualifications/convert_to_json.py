#!/usr/bin/env python
import csv
import json
import pandas

dataframe = pandas.read_csv('Candidates.csv')

candidate_dictionary = {}
for row in dataframe.iterrows():
    president = row[1][0]
    if president not in candidate_dictionary:
        candidate_dictionary[president] = {'experience': [], 'administration_start': row[1][2], 'administration_end':row[1][3], 'administration_length': row[1][4]}
        
    else:
        candidate_dictionary[president]['experience'].append({'Position': row[1][1], 'Start_Date':row[1][2], 'End_Date':row[1][3], 'Years_of_Experience':row[1][4]})

candidate_list = []
for candidate, value in candidate_dictionary.iteritems():
    new_object = {
                    'name': candidate, 'experience': value['experience'],
                    'administration_start': value['administration_start'], 'administration_end':value['administration_end'],
                    'administration_length': value['administration_length']
                  }
    candidate_list.append(new_object)

with open('Candidates.json', 'w') as fp:
    json.dump(candidate_list, fp)
    
dataframe = pandas.read_csv('Points_per_Position.csv')

Points_per_Position = {}
for row in dataframe.iterrows():
    Points_per_Position[row[1][0]] = row[1][1]
print(Points_per_Position)
with open('Points_per_Position.json', 'w') as fp:
    json.dump(Points_per_Position, fp)

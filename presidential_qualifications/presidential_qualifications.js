


function candidate_class(name, id, group, experience, administration_start, administration_end, administration_length, executive_score, domestic_score, combined_overall, foriegn_policy_score){
    /*Class for carrying around candidate info*/
    
    var self = this;
    self.Name = name;
    self.Group = group;
    self.id = id;
    self['Source Link'] = '';
    self.experience = experience;
    self.administration_start = moment(administration_start, "MM/DD/YYYY");
    self.administration_end = moment(administration_end, "MM/DD/YYYY");;
    self.administration_length = administration_length;
    self.experience_points = 0;
    self.executive_score = executive_score;
    self.domestic_score = domestic_score;
    self.foriegn_policy_score = foriegn_policy_score
    self.combined_overall = combined_overall;
    
    self.init_data = function(){
        self.experience.forEach(function(position){
            if (position['Start_Date'] != null){
                position['Start_Date'] = moment(position['Start_Date'], "MM/DD/YYYY");
            }
            if (position['End_Date'] != null){
                position['End_Date'] = moment(position['End_Date'], "MM/DD/YYYY");
            }
            position['experience_percentage'] = experience_curve(position['Years_of_Experience'], true);
        });
    }
    
    self.calculate_experience_points = function(points_per_position_dictionary){
        /*Calculates the total experience and stores it as the attribute 'experience_points'*/
        self.experience_points = 0;
        self.best_qualification = {'position':'None', 'experience_points':0, 'start_date': null, 'end_date': null}
        self.experience.forEach(function(position){
            var position_points = points_per_position_dictionary[position['Position']] * position['experience_percentage'];
            self.experience_points += position_points;
            if (position_points > self.best_qualification.experience_points){
                self.best_qualification = {'position':position['Position'], 'experience_points':position_points, 'start_date': position['Start_Date'], 'end_date': position['End_Date']}
            }

        });
    }
}
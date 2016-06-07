$(window).load(function () {
    
    $(document).ready(function () {
        
        //Create the points table
        var points_table = new points_table_class(the_data=Points_per_Position, graph_container_id='points_table', title_text='Points per Position', slug='Points_per_Position');
        points_table.create();
        
        //Create candidate list from data
        candidate_list = [];
        for (i=0; i<candidates_data.length; i++){
            candidate_data = candidates_data[i];
            candidate = new candidate_class(name=candidate_data.name, id=i, group='group0', experience=candidate_data.experience, administration_start=candidate_data.administration_start, administration_end=candidate_data.administration_end, administration_length=candidate_data.administration_length)
            candidate.init_data();
            candidate.calculate_experience_points(Points_per_Position);
            candidate_list.push(candidate)
        }
        
        candidate_list.sort(function(x, y){
            return d3.ascending(x.administration_start, y.administration_start);
        })
        //HACKy to do this here
        
        candidate_list.forEach(function(candidate, i){
            candidate.id = i+1;
            candidate.Group = 'group'+Math.round(i / 10) * 10;
        });
        
        console.log(candidate_list)
        
        experience_graph = new experience_graph_class(the_data=candidate_list, graph_container_id='experience_graph', title_text='Presidential Experience', graph_slug='Presidential_Experience');
       experience_graph.draw();
            
    });
});


function candidate_class(name, id, group, experience, administration_start, administration_end, administration_length ){
    /*Class for carrying around candidate info*/
    
    var self = this;
    self.Name = name;
    self.Group = 'group1';
    self.id = id;
    self['Source Link'] = '';
    self.experience = experience;
    self.administration_start = moment(administration_start, "MM/DD/YYYY");
    self.administration_end = moment(administration_end, "MM/DD/YYYY");;
    self.administration_length = administration_length;
    self.experience_points = 0;
    self.best_qualification = {'position':'None', 'experience_points':0, 'start_date': null, 'end_date': null}
    
    self.init_data = function(){
        self.experience.forEach(function(position){
            if (position['Start_Date'] != null){
                position['Start_Date'] = moment(position['Start_Date'], "MM/DD/YYYY");
            }
            if (position['End_Date'] != null){
                position['End_Date'] = moment(position['End_Date'], "MM/DD/YYYY");
            }
            position['experience_percentage'] = experience_curve(position['Years_of_Experience']);
        });
    }
    
    self.calculate_experience_points = function(points_per_position_dictionary){
        /*Calculates the total experience and stores it as the attribute 'experience_points'*/
        self.experience_points = 0;
        self.experience.forEach(function(position){
            var position_points = points_per_position_dictionary[position['Position']] * position['experience_percentage'];
            self.experience_points += position_points;
            if (position_points > self.best_qualification.experience_points){
                self.best_qualification = {'position':position['Position'], 'experience_points':position_points, 'start_date': position['Start_Date'], 'end_date': position['End_Date']}
            }

        });
    }
}

experience_curve = function(t){
    /*Returns the the percent of total experience using the function Generalized Logistic Function used to calulcate
     *given a time t spent in the position
     *link: https://en.wikipedia.org/wiki/Generalised_logistic_function
     *https://docs.google.com/spreadsheets/d/1BaL6V2jQZvppoQoKpLySdvj2q8v0Kq7J_ccpoejdvyE/edit#gid=1026319676
     * Y = A+(K-A)/POW(C+Q*EXP(-B*(t-M)), 1/v)
     */
    var A = 0.034,
        K = 1,
        B = 0.7,
        Q = 0.5,
        M = 3.7,
        C = 1,
        v = 0.5;
    if (t > 0){
        var experience_percent = A+(K-A)/Math.pow(C+Q*Math.exp(-B*(t-M)), 1/v);
        experience_percent = Math.round(experience_percent*100)/100; // Round to two decimal points
    }
    else{
        var experience_percent = 0;
    }
    
    return experience_percent;
    
}
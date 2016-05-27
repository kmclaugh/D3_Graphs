$(window).load(function () {
    
    $(document).ready(function () {
        
        candidate_list = [];
        for (i=0; i<candidates_data.length; i++){
            candidate_data = candidates_data[i];
            candidate = new candidate_class(name=candidate_data.name, experience=candidate_data.experience, administration_start=candidate_data.administration_start, administration_end=candidate_data.administration_end, administration_length=candidate_data.administration_length)
            candidate.init_data();
            candidate_list.push(candidate)
        }
        console.log(Points_per_Position);
        console.log(candidate_list);
    });
});


function candidate_class(name, experience, administration_start, administration_end, administration_length ){
    /*Class for carrying around candidate info*/
    
    var self = this;
    self.name = name;
    self.experience = experience;
    self.administration_start = moment(administration_start, "MM/DD/YYYY");
    self.administration_end = moment(administration_end, "MM/DD/YYYY");;
    self.administration_length = administration_length;
    
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
    
    self.calculate_experience_points = function(){
        /*Calculates the total experience and stores it as the attribute 'experience_points'*/
        var experience_points = 0;
        self.experience.forEach(function(position){
            experience_points += Points_per_Position[position['Position']] * position['experience_percentage'];
        });
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
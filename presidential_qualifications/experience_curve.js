var exeperience_curve
$(window).load(function () {
    $(document).ready(function () {
        var auto_create_graph = true;
        if (auto_create_graph == true){
            var experience_curve_data = [];
            for (var i = 0; i < 3650; i++){
                experience_curve_data.push({x: i/365, y: experience_curve(i/365, false)});
            }
            experience_curve_data = [{name:'Experience Curve', values:experience_curve_data}];
            exeperience_curve = new exeperience_curve_class(experience_curve_data, 'experience_curve', 'Exeperience Curve', 'experience_curve');
            exeperience_curve.draw();
        }
    });
});

function exeperience_curve_class(the_data, graph_container_id, title_text, slug){
    /*Class for the experience line graph*/
    
    var self = this;
    var min_height = 255,
        fixed_height = 255,
        margin = {top: 10, right: 10, bottom: 40, left: 50};
        
    graph_class.call(this, the_data, graph_container_id, title_text, slug, min_height, fixed_height, margin);
    
    self.resize = function(){
        /*Resizes the graph due to a window size change*/
        self.start_resize();
        
        //Rescale the range and axis functions to account for the new dimensions
        self.xRange
            .range([0, self.width]);
        self.xAxis
            .scale(self.xRange);
        self.yRange
            .range([self.height, 0]);
        self.yAxis
            .scale(self.yRange);
        
        //resize the x-axis
        self.x_axis
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.xAxis);
        
        //resize the y-axis
        self.y_axis
            .call(self.yAxis);
        
        //resize the x-axis
        self.x_axis_label
            .attr("y", self.height + self.margin.bottom/2)
            .attr("x",(self.width / 2))
        
        //Update the position of the y axis label
        self.y_axis_label
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (self.height / 2))
        
        //Update the actual lines
        i = 0;
        self.lines.forEach(function(line) {
            line.attr("d", self.line_function(self.data[i].values));
            i++;
        });
    
    }//end resize
    
    self.draw = function(){
        /*Draws the graph according to the size of the graph element*/
        
        self.start_draw();
        
        self.xRange = d3.scale.linear()
            .range([0, self.width])
            .domain([0, 10]);
        
        self.yRange = d3.scale.linear()
            .range([self.height, 0])
            .domain([0, 1]);
        
        self.xAxis = d3.svg.axis()
            .scale(self.xRange)
            .tickFormat(d3.format("d"))
            .orient("bottom");
        
        var formatPercent = d3.format(".0%");
        self.yAxis = d3.svg.axis()
            .scale(self.yRange)
            .tickFormat(formatPercent)
            .orient('left');
        
        /*Add axis elements*/
        //add the x-axis
        self.x_axis = self.svg_g.append('svg:g')
            .attr("class", "x axis")
            .attr("transform", "translate(0," + self.height + ")");
        self.x_axis.call(self.xAxis);
        
        //Add the demand y-axis
        self.y_axis = self.svg_g.append('g')
            .attr("class", "y axis")
        self.y_axis.call(self.yAxis);
    
        /*Create the line function.*/
        self.line_function = d3.svg.line()
            .x(function(d) { return self.xRange(d.x); })
            .y(function(d) { return self.yRange(d.y); });
            
        /*Create the path and points*/
        //path
        self.lines = [];
        self.points_lists = [];
        self.data.forEach(function(datum) {
            var new_line = self.svg_g.append('svg:path')
                .attr('class', 'line '+datum.name)
                .attr("d", self.line_function(datum.values));
            self.lines.push(new_line);
        });
        
         //Add the y axis label
        self.y_axis_label = self.svg_g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (self.height / 2))
            .attr("dy", ".75em")
            .style("text-anchor", "middle")
            .text("Percent of Maximum Points");
        
        
         //Add the x axis label
        self.x_axis_label = self.svg_g.append("text")
            .attr("y", self.height + self.margin.bottom/2)
            .attr("x",(self.width / 2))
            .attr("dy", ".75em")
            .style("text-anchor", "middle")
            .text("Years of Experience");
        
        //Create Graph Title
        self.graph_element.prepend('<div class="row title_row" id=title_row_'+self.graph_container_id+'>');
        self.title_row = $('#title_row_'+self.graph_container_id);
        self.title_row.prepend('<div class="graph_title" id="title_'+self.graph_container_id+'">'+self.title_text+'</div>');
        self.title = $('#title_'+self.graph_container_id);
        
    }//End draw graph
    
    /* Reusable functions********************/
};
exeperience_curve_class.prototype = Object.create(graph_class.prototype);
exeperience_curve_class.prototype.constructor = exeperience_curve_class;

experience_curve = function(t, round){
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
        experience_percent = experience_percent
        if (round == true) {
            experience_percent = Math.round(experience_percent*100)/100; // Round to two decimal points
        }
    }
    else{
        var experience_percent = 0;
    }
    
    return experience_percent;
    
}

function candidate_scores_graph_class(the_data, graph_container_id, title_text, slug, controls_enabled, fixed_height){
    /*Class for the candidate's resume and interview scroes graph*/
    
    var self = this;
    var min_height = 530,
        margin = {top: 0, right: 20, bottom: 40, left: 80};
    self.controls_enabled = controls_enabled;
    self.showResume = true;
    self.showInterview = true;
    
    graph_class.call(this, the_data, graph_container_id, title_text, slug, min_height, fixed_height, margin);
    
    //All controls go in here
    if (self.controls_enabled) {
        //Legend clicks
        $(document).on("click", '.legend_button.'+self.graph_container_id, function() {
            var dataName = $(this).attr('data_name');
            if (dataName == 'resume'){
                toggle_class($('circle.resumeScore'), 'visible_false');
                self.showResume = !self.showResume;
                self.updateData();
            }
            else if (dataName == 'interview'){
                toggle_class($('circle.interviewScore'), 'visible_false');
                self.showInterview = !self.showInterview;
                self.updateData();
            }
        });
    }

    self.updateData = function(){
        /*Updates the data based on show resume and show interview*/
        
        self.calculateMaxX();
        
        //Update the range and axis
        self.xRange
            .domain([0,self.max_x]);
        self.yRange
            .domain(self.data.map(function(d) {
                return d.Name;
            })
        );
        self.y_axis.transition().call(self.yAxis);
        self.x_axis.transition().call(self.xAxis);
        
        //Update the data bars
        self.svg.selectAll("rect.resumeScore")
            .transition()
            .attr("y", function(d) {return self.yRange(d.Name); })
            .attr("width", function(d){
                if (self.showResume){
                    return self.xRange(d['Normalized Resume']);
                }
                else{
                    return 0;
                }
            });
        
        self.svg.selectAll("rect.interviewScore")
            .transition()
            .attr("x", function(d) {
                if (self.showResume){
                    return self.xRange(d['Normalized Resume']);
                }
                else{
                    return 0;
                }
            })
            .attr('width', function(d){
                if (self.showInterview){
                    return self.xRange(d['Normalized Interview Score']);
                }
                else{
                    return 0;
                }
            });
        
    };
    
    self.resize = function(){
        /*Resizes the graph due to a window size change*/
        
        self.start_resize();
        
        //Rescale the range and axis functions to account for the new dimensions
        self.yRange.rangeBands([0, self.height], 0.15);
        self.xRange.range([0, self.width]);
        self.xAxis.scale(self.xRange).ticks(Math.max(self.width/85, 2));
        self.yAxis.scale(self.yRange);
        
        //resize the y and x axis
        self.x_axis
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.xAxis);
        self.y_axis.call(self.yAxis);
        
        //Update the position of the y axis label
        self.y_axis_label
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (self.height / 2));
        
        //Update the position of the x axis label
        self.x_axis_label
            .attr("y", self.height + self.margin.bottom/2)
            .attr("x",(self.width / 2));
        
        //Update the data bars
        self.svg.selectAll("rect.resumeScore")
            .attr("y", function(d) {return self.yRange(d.Name); })
            .attr("width", function(d){
                if (self.showResume){
                    return self.xRange(d['Normalized Resume']);
                }
                else{
                    return 0;
                }
            })
            .attr("height", self.yRange.rangeBand());
        
        self.svg.selectAll("rect.interviewScore")
            .attr("y", function(d) {return self.yRange(d.Name); })
            .attr('width', function(d){
                if (self.showInterview){
                    return self.xRange(d['Normalized Interview Score']);
                }
                else{
                    return 0;
                }
            })
            .attr("x", function(d) {
                if (self.showResume){
                    return self.xRange(d['Normalized Resume']);
                }
                else{
                    return 0;
                }
            })
            .attr("height", self.yRange.rangeBand());
        
        //Update the numbers
        self.svg.selectAll(".ranking_text")
            .attr("y", function(d) {
                if (self.return_group_visibility(d.Group) == 'visible'){
                    return self.yRange([d.id, d.Name, d['Source Link']]) + self.yRange.rangeBand();
                }
                else{
                    return self.yRange([d.id, d.Name, d['Source Link']])
                }
            })
            .attr("x", function(d) {return self.xRange(d.experience_points)+15})
        
    
    }//end resize

    self.draw = function(){
        /*Draws the graph according to the size of the graph element*/
        
        self.calculateMaxX();
        
        self.data = self.data.sort(compareTotalScores);
        self.data.reverse();
        
        //Standard start
        self.start_draw();
        
        //Create y and x ranges
        self.yRange = d3.scale.ordinal()
            .rangeBands([0, self.height], 0.15)
            .domain(self.data.map(function(d) {
                return d.Name;
            })
        );
        
        self.xRange = d3.scale.linear()
            .range([0, self.width])
            .domain([0,self.max_x]);
        
        //Create the axis functions
        self.xAxis = d3.svg.axis()
            .scale(self.xRange)
            .ticks(Math.max(self.width/85, 2))
            .orient("bottom");
            
        self.yAxis = d3.svg.axis()
            .scale(self.yRange)
            .tickFormat(self.y_label_format)
            .orient('left');
      
        //add the x-axis
        self.x_axis = self.svg_g.append('svg:g')
            .attr("class", "x axis")
            .attr("transform", "translate(0," + self.height + ")");
        self.x_axis.call(self.xAxis);
        
        //Add the y-axis
        self.y_axis = self.svg_g.append('svg:g')
            .attr('class', 'y axis');
        self.y_axis.call(self.yAxis);
        
        //Add the y axis label
        self.y_axis_label = self.svg_g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (self.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Candidate");
        
        //Add the x axis label
        self.x_axis_label = self.svg_g.append("text")
            .attr("y", self.height + self.margin.bottom/2)
            .attr("x",(self.width / 2))
            .attr("dy", ".75em")
            .style("text-anchor", "middle")
            .text("Experience Points");
        
        //Add the actual data bars
        self.resume_bars = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", 'bar data resumeScore')
                .attr("y", function(d) { return self.yRange(d.Name); })
                .attr("width", function(d) {return self.xRange(d['Normalized Resume']);})
                .attr("x", 0)
                .attr("height", self.yRange.rangeBand());
        
        self.interview_bars = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", 'bar data interviewScore')
                .attr("y", function(d) { return self.yRange(d.Name); })
                .attr("width", function(d) {
                    if (d['Normalized Interview Score'] !== null){
                        return self.xRange(d['Normalized Interview Score']);
                    }
                    else{
                        return 0;
                    }
                })
                .attr("x",  function(d) {return self.xRange(d['Normalized Resume']);})
                .attr("height", self.yRange.rangeBand());

        //Create Graph legend
        self.graph_element.prepend('<div class="row legend_row" id=legend_row_'+self.graph_container_id+'>');
        self.legend_row = $('#legend_row_'+self.graph_container_id);
        self.legend_row.append('<div class="col-xs-12 col-sm-2 scale_col" id=scale_col_'+self.graph_container_id+'></div>');
        self.scale_col = $('#scale_col_'+self.graph_container_id);
        self.legend_row.append('<div class="col-xs-12 col-sm-10" id=legend_col_'+self.graph_container_id+'></div>');
        self.legend_col = $('#legend_col_'+self.graph_container_id);
        
        //Interview score
        var legend_element = '<button ga-event="true" ga-category="Visualizations" ga-action="Interaction" ga-label="Candidate Scores Graph" class="legend_button '+self.graph_container_id+'" data_name="interview"><svg width="15" height="14" style="vertical-align: middle"><circle class="legend series visible_true interviewScore" data_name="interview" r="5" cx="6" cy="7"></circle></svg>Interview Score</button>';
        self.legend_col.append('<div class="legend_button_wrapper">'+legend_element+'</div>');
        
        //Resume score
        legend_element = '<button ga-event="true" ga-category="Visualizations" ga-action="Interaction" ga-label="Candidate Scores Graph" class="legend_button '+self.graph_container_id+'" data_name="resume"><svg width="15" height="14" style="vertical-align: middle"><circle class="legend series visible_true resumeScore" data_name="resume" r="5" cx="6" cy="7"></circle></svg>Resume Score</button>';
        self.legend_col.append('<div class="legend_button_wrapper">'+legend_element+'</div>');
        
        //Create Graph Title
        self.graph_element.prepend('<div class="row title_row" id=title_row_'+self.graph_container_id+'>');
        self.title_row = $('#title_row_'+self.graph_container_id);
        self.title_row.prepend('<div class="graph_title" id="title_'+self.graph_container_id+'">'+self.title_text+'</div>');
        self.title = $('#title_'+self.graph_container_id);
        
    };//End draw graph
    
    /********Reusable functions**************/
    self.calculateMaxX = function(){
        self.max_x = 0;
        if (self.showResume){
            self.max_x += d3.max(self.data, function(d) { return + d['Normalized Resume'];});
        }
        if (self.showInterview){
            self.max_x += d3.max(self.data, function(d) { return + d['Normalized Interview Score'];});
        }
    };
    
    function compareTotalScores(a, b) {
        return (a['Normalized Resume'] + a['Normalized Interview Score']) - (b['Normalized Resume'] + b['Normalized Interview Score']);
    }
}
candidate_scores_graph_class.prototype = Object.create(graph_class.prototype); // See note below
candidate_scores_graph_class.prototype.constructor = candidate_scores_graph_class;
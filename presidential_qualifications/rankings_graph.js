
function rankings_per_experience_graph_class(the_data, graph_container_id, title_text, slug, controls_enabled, fixed_height){
    /*Class for the ranking per experience of presidents graph*/
    
    var self = this;
    var min_height = 200,
        margin = {top: 5, right: 20, bottom: 40, left: 50};
    self.controls_enabled = controls_enabled;
    self.current_order = "chronological"
    
    graph_class.call(this, the_data, graph_container_id, title_text, slug, min_height, fixed_height, margin);
    self.visible_data = the_data;
    
    self.x_max_value;
    
    //Create the groups display dictionary
    var groups = d3.map(self.data, function(d){ return d.Group}).keys();
    self.display_dictionary = {};
    groups.forEach(function(group){
        self.display_dictionary[group.replace(/ /g , "_")] = {'visible':true, 'display_name':group};
    });
    
    //Create the rankings checkbox dictionary
    self.rankings_checkbox = {'executive_score': true, "foreign_policy_score": true, "domestic_score": true, "combined_overall":false}
    
    //All controls go in here
    if (self.controls_enabled) {
        //Legend clicks
        $(document).on("click", '.legend_button.'+self.graph_container_id, function() {
            if (self.check_number_visible() > 1){
                self.update_graph_groups($(this).attr('data_name'));
            }
            else{
                for (group in self.display_dictionary){
                    var display_prop = self.display_dictionary[group];
                    if (display_prop.visible == false){
                        self.update_graph_groups(group);
                    }
                }
            }
        });
        
        $(document).on("click", 'input[name="'+self.slug+'_rankings_box"]', function(){
            var score = $(this).val();
            var value = $(this).is(':checked');
            if (score != 'exclude_lincoln') {
                self.update_rankings_score(score, value)
            }
            else{
                self.toggle_lincoln(exclude=value)
            }
        });
    }
    
    self.toggle_lincoln = function(exclude){
        /*Excludes or includes Lincoln based on the given exclude value*/
        if (exclude == true) {
            self.visible_data = self.visible_data.filter(function(d) { return d.Name != "Abraham Lincoln"; });
            add_class(d3.select(self.lincoln_point), 'excluded');
        }
        else{
            //Recreate the visible data
            self.visible_data = [];
            self.data.forEach(function(datum){
                if (self.display_dictionary[datum.Group.replace(/ /g , "_")].visible == true){
                    self.visible_data.push(datum);
                }
            });
            remove_class(d3.select(self.lincoln_point), 'excluded');
        }
        self.update_graph()
    }
    
    self.update_rankings_score = function(score, value){
        /*Updates which attributes are accounted for in the rankings score*/
        self.rankings_checkbox[score] = value;
        self.update_graph();
    }

    self.update_graph_groups = function(group){
        /*Hide or shows the group*/
        
        //Toggle the display visibility for the group and legend button
        var circle = $('circle[data_name="'+group+'"]');
        var display_values = self.display_dictionary[group];
        if (display_values.visible == true){
            self.display_dictionary[group].visible = false;
            remove_class(circle, "visible_true")
            add_class(circle, "visible_false")
        }
        else if(display_values.visible == false){
            self.display_dictionary[group].visible = true;
            remove_class(circle, "visible_false")
            add_class(circle, "visible_true")
        }
        
        //Update the visible data
        self.visible_data = [];
        self.data.forEach(function(datum){
            if (self.display_dictionary[datum.Group.replace(/ /g , "_")].visible == true){
                self.visible_data.push(datum);
            }
        });
        self.update_graph();
    }
    
    self.update_graph = function(){
        /*Updates the graph for when the experience points change or the visible groups changes*/
        self.x_max_value = d3.max(self.visible_data, function(d) { return + d.experience_points;} );
        
        //Update the range and axis
        self.xRange
            .domain([0,self.x_max_value]).nice();

        self.y_axis.transition().call(self.yAxis);
        self.x_axis.transition().call(self.xAxis);
        
        //Update the data points
        self.svg.selectAll(".point")
             .transition()
            .attr('visibility', function(d){ return self.return_group_visibility(d.Group)})
            .attr("cx", function(d) { return self.xRange(d.experience_points); })
            .attr("cy", function(d) { return self.yRange(self.calculate_rankings_value(d)); });
        
        //Update the regression line
        self.caluclate_linear_regression_values();
        //line
        self.regression_line
            .transition()
            .attr("y1", self.yRange(self.lr_intercept))
            .attr("y2", self.yRange(self.lr_max_y))
            .attr("x1", self.xRange(0))
            .attr("x2", self.xRange(self.lr_max_x));
        //label
        var equation = 'y = ' + self.lr_slope.toPrecision(2) + 'x + ' + self.lr_intercept.toPrecision(2);
        var r_string = 'r2 = ' + self.lr_r2.toPrecision(2);
        var regression_info = equation + ', ' + r_string;
        self.regression_label
            .transition()
            .attr('x', function() { return self.xRange( self.lr_max_x) })
            .attr('y', function() { return self.yRange(self.lr_max_y); })
            .text(regression_info);
        self.regression_info.text(regression_info)
    }
    
    self.resize = function(){
        /*Resizes the graph due to a window size change*/
        
        self.start_resize();
        
        //Rescale the range and axis functions to account for the new dimensions
        self.yRange.range([self.height, 0])
        self.xRange.range([0, self.width]);
        self.xAxis.scale(self.xRange).ticks(Math.max(self.width/85, 2));
        self.yAxis.scale(self.yRange);
        
        //resize the y and x axis
        self.x_axis
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.xAxis)
        self.y_axis.call(self.yAxis);
        
        //Update the position of the y axis label
        self.y_axis_label
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (self.height / 2));
        
        //Update the position of the x axis label
        self.x_axis_label
            .attr("y", self.height + self.margin.bottom/2)
            .attr("x",(self.width / 2));
        
        self.svg.selectAll("circle")
            .attr("cx", function(d) {
                return self.xRange(d.experience_points);
            })
            .attr("cy", function(d) {
                 return self.yRange(self.calculate_rankings_value(d)); 
            });
        
        self.regression_line
            .attr("y1", self.yRange(self.lr_intercept))
            .attr("y2", self.yRange(self.lr_max_y))
            .attr("x1", self.xRange(0))
            .attr("x2", self.xRange(self.lr_max_x));
        
        //Add the linear regression line info
        self.regression_label
            .attr('x', function() { return self.xRange( self.lr_max_x) })
            .attr('y', function() { return self.yRange(self.lr_max_y); })
    
    }//end resize

    self.draw = function(){
        /*Draws the graph according to the size of the graph element*/
        
        //Standard start
        self.start_draw();
        
        self.x_max_value = d3.max(self.data, function(d) { return + d.experience_points;} );
        
        //Create y and x ranges
        self.xRange = d3.scale.linear()
            .range([0, self.width])
            .domain([0,self.x_max_value])
            .nice();
            
        self.yRange = d3.scale.linear()
            .range([self.height, 0])
            .domain([0,100])
            .nice();
        
        //Create the axis functions
        self.xAxis = d3.svg.axis()
            .scale(self.xRange)
            .ticks(Math.max(self.width/85, 2))
            .orient("bottom");
            
        self.yAxis = d3.svg.axis()
            .scale(self.yRange)
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
            .text("Success Score");
        
        //Add the x axis label
        self.x_axis_label = self.svg_g.append("text")
            .attr("y", self.height + self.margin.bottom/2)
            .attr("x",(self.width / 2))
            .attr("dy", ".75em")
            .style("text-anchor", "middle")
            .text("Experience Points");
        
        //Add actual points
        self.points_lists = self.svg_g.selectAll(".point")
            .data(self.data)
            .enter().append("circle")
                .attr("class", function(d) {return "point " + d.Group.replace(/ /g , "_");})
                .attr('r', '5')
                .on('mouseover', function(d){self.show_tip(d, this);})
                .on("mouseout", function(d){self.hide_tip(d, this);})
                .attr("cx", function(d, i) {
                    //Complete HACK doing this here
                    if (d.Name == 'Abraham Lincoln') {
                        self.lincoln_point = i;
                    }
                    return self.xRange(d.experience_points);
                })
                .attr("cy", function(d) { return self.yRange(self.calculate_rankings_value(d)); });
        
        //Store lincoln's point for later
        self.lincoln_point = self.points_lists[0][self.lincoln_point];
        
        //Add the linear regression line
        self.caluclate_linear_regression_values();
        self.regression_line = self.svg_g.append("line")
            .attr('id', 'regression_line_'+self.slug)
            .attr('class', 'regression_line')
            .attr("y1", self.yRange(self.lr_intercept))
            .attr("y2", self.yRange(self.lr_max_y))
            .attr("x1", self.xRange(0))
            .attr("x2", self.xRange(self.lr_max_x));
        
        //Add the linear regression line info
        var equation = 'y = ' + self.lr_slope.toPrecision(2) + 'x + ' + self.lr_intercept.toPrecision(2);
        var r_string = 'r2 = ' + self.lr_r2.toPrecision(2);
        var regression_info = equation + ', ' + r_string;
        self.regression_label = self.svg_g.append('text')
            .attr('class', 'regression_label hidden-xs')
            .attr('x', function() { return self.xRange( self.lr_max_x) })
            .attr('y', function() { return self.yRange(self.lr_max_y); })
            .attr('dy', -5)//just a guestimate buffer
            .attr('text-anchor', 'end')
            .text(regression_info);
        self.graph_element.prepend('<div class="row regression_row visible-xs"><div class="col-xs-12 text-center regression_label">Regression Info<br/><span id="regression_info_'+self.graph_container_id+'"> '+regression_info+'</span></div></div>')
        self.regression_info = $('#regression_info_'+self.graph_container_id)
        //Create Graph legend
        self.graph_element.prepend('<div class="row legend_row" id=legend_row_'+self.graph_container_id+'>')
        self.legend_row = $('#legend_row_'+self.graph_container_id);
        self.legend_row.append('<div class="col-xs-12 col-sm-2 scale_col" id=scale_col_'+self.graph_container_id+'></div>')
        self.scale_col = $('#scale_col_'+self.graph_container_id);
        self.legend_row.append('<div class="col-xs-12 col-sm-10" id=legend_col_'+self.graph_container_id+'></div>')
        self.legend_col = $('#legend_col_'+self.graph_container_id);
        var i = 0;
        for (var group in self.display_dictionary){
            var value = self.display_dictionary[group];
            var legend_element = '<button class="legend_button '+self.graph_container_id+'" data_name="'+group+'"><svg width="15" height="14" style="vertical-align: middle"><circle class="legend series visible_'+value.visible+' '+group+'" data_name="'+group+'" r="5" cx="6" cy="7"></circle></svg>'+value.display_name+'</button>';
            self.legend_col.append('<div class="legend_button_wrapper">'+legend_element+'</div>');       
            i++;
        };
        
        //Create rankings and exclude Lincoln controls
        self.toggle_lincoln(exclude=true)
        var executive_score_string = '<label><input checked name="'+self.slug+'_rankings_box" type="checkbox" value="executive_score">Exectuive Score</label>  ';
        var domestic_score_string = '<label><input checked name="'+self.slug+'_rankings_box" type="checkbox" value="domestic_score">Domestic Score</label>  ';
        var foreign_policy_score_string = '<label><input checked name="'+self.slug+'_rankings_box" type="checkbox" value="foreign_policy_score">Foreign Policy Score</label>  ';
        var overall_score_string = '<label><input name="'+self.slug+'_rankings_box" type="checkbox" value="combined_overall">Overall Score</label>  ';
        var exclude_lincoln_string = '<label><input checked id="'+self.slug+'_exclude_lincoln" name="'+self.slug+'_rankings_box" type="checkbox" value="exclude_lincoln">Exclude Lincoln</label>  ';
        $('#'+self.graph_container_id).prepend('<div class="row"><div class="col-xs-12 text-center">'+exclude_lincoln_string+'</div></div>');
        $('#'+self.graph_container_id).prepend('<div class="row"><div class="col-xs-12 text-center"><label>Rank by</label><br class="visible-xs"/>  '+executive_score_string+domestic_score_string+foreign_policy_score_string+overall_score_string+'</div></div>');
        self.exclude_lincoln = $('#'+self.slug+'_exclude_lincoln');
        
        //Create Graph Title
        self.graph_element.prepend('<div class="row title_row" id=title_row_'+self.graph_container_id+'>');
        self.title_row = $('#title_row_'+self.graph_container_id);
        self.title_row.prepend('<div class="graph_title" id="title_'+self.graph_container_id+'">'+self.title_text+'</div>');
        self.title = $('#title_'+self.graph_container_id);
        
        self.init_tooltip();
    }//End draw graph
    
    self.init_tooltip = function(){
        /*Initializes the tootltip for the graph*/
        self.tool_tip = d3.tip()
            .attr('class', 'd3-tip')
            .attr('id', 'd3_tip_'+self.slug)
            .html(function(d) {
                html_string = '<div>';
                //Name
                html_string += '<span class="tip_title">'+d.Name+'</span></br>';
                //Date
                html_string += d.administration_start.format("MMM Do, YYYY")  + ' - ' + d.administration_end.format("MMM Do, YYYY")  + '<p></p>';
                //Points
                html_string += '<table>';
                html_string += '<tr><td class="text-left">Experience Points: </td><td style="padding-left:5px">'+Math.round(d.experience_points)+'</td></tr>';
                html_string += '<tr><td class="text-left">Total Score: </td><td style="padding-left:5px">'+Math.round(self.calculate_rankings_value(d))+'</td></tr>';
                html_string += '<tr><td class="text-left">Executive Score: </td><td style="padding-left:5px">'+Math.round(d.executive_score)+'</td></tr>';
                html_string += '<tr><td class="text-left">Domestic Score: </td><td style="padding-left:5px">'+Math.round(d.domestic_score)+'</td></tr>';
                html_string += '<tr><td class="text-left">Foreign Policy Score: </td><td style="padding-left:5px">'+Math.round(d.foreign_policy_score)+'</td></tr>';
                html_string += "</table></div>";
                return html_string;
            });
        
        self.svg_g.call(self.tool_tip);
    }
    
    self.show_tip = function(target_data, target){
        /*Shows the tooltip and highlights the point*/
        //var hover_point = self.points_lists[0][hover_target.id-1];
        add_class(d3.select(target), 'highlight');
        d3.select(target).attr('r', 10)
        self.tool_tip.show(target_data, target);
        self.tool_tip.offset([-9, 0]);
    }
    
    self.hide_tip = function(target_data, target){
        /*Hides the tooltip and de-highlights the bar*/
        d3.select(target).attr('r', 5)
        remove_class(d3.select(target), 'highlight');
        self.tool_tip.hide();
    }
    
    /********Reusable functions**************/
    self.caluclate_linear_regression_values = function(){
        /*Calculates the values necessary to create the linear regression line*/
        
        //Create the x y pairs
        var x_y = self.visible_data.map(function (d) { return [d.experience_points,self.calculate_rankings_value(d)]; });
        //Calculate regression value
        var regression = ss.linearRegression(x_y);
        var regressionLine = ss.linearRegressionLine(regression);
        var r2_value = ss.rSquared(x_y, regressionLine);
        
        self.lr_slope = regression.m;
        self.lr_intercept = regression.b;
        self.lr_max_x = self.xAxis.scale().domain()[1];
        self.lr_max_y = self.lr_slope * self.lr_max_x + self.lr_intercept;//y=mx+b, assumes self.x_max_value is correct
        self.lr_r2 = r2_value;
        
        
    }
    self.calculate_rankings_value = function(d){
        /*Calculates a rankings value based on which rankings values are selected*/
        var rankings_score = 0;
        var rankings_count = 0;
        for (key in self.rankings_checkbox){
            var value = self.rankings_checkbox[key];
            if (value == true) {
                rankings_score += d[key];
                rankings_count += 1;
            }
        }
        return rankings_score/rankings_count;
    }
    self.check_number_visible = function(){
        /*Returns the number of visible groups*/
        var number_visible = 0
        for (group in self.display_dictionary){
            var display_prop = self.display_dictionary[group];
            if (display_prop.visible == true){
                number_visible += 1;
            }
        }
        return number_visible;
    }
    
    self.return_group_visibility = function(group){
        /*Returns visible or hidden based on the group visibility*/
        if (self.display_dictionary[group.replace(/ /g , "_")].visible == true){
            return 'visible';
        }
        else{
            return 'hidden';
        }
    }
    
    self.y_label_format = function(d, tooltip){
        /*Returns the y label. Used for both y-axis tick labels and the tooltip title. Little HACKy*/
        var label_string = d[1];
        
        return label_string;
    }

}
rankings_per_experience_graph_class.prototype = Object.create(graph_class.prototype); // See note below
rankings_per_experience_graph_class.prototype.constructor = rankings_per_experience_graph_class;
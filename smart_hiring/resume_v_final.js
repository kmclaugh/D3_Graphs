
function resume_v_final_graph_class(the_data, graph_container_id, title_text, slug, controls_enabled, fixed_height, use_ga){
    /*Class for the resume v final score graph*/
    
    var self = this;
    var min_height = 200,
        margin = {top: 30, right: 20, bottom: 40, left: 50};
    self.controls_enabled = controls_enabled;
    
    graph_class.call(this, the_data, graph_container_id, title_text, slug, min_height, fixed_height, margin);
    self.data = self.data.filter(function (d) { return d['Final Score'] !== null; });
    self.use_ga = use_ga;//Google Analytics
    
    self.resize = function(){
        /*Resizes the graph due to a window size change*/
        
        self.start_resize();
        
        //Rescale the range and axis functions to account for the new dimensions
        self.yRange.range([self.height, 0]);
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
        
        //Update points
        self.svg.selectAll("circle")
            .attr("cx", function(d) {
                return self.xRange(d['Normalized Resume']);
            })
            .attr("cy", function(d) {
                 return self.yRange(d['Final Score']); 
            });
        
        //Regression stuff
        self.regression_line
            .attr("y1", self.yRange(self.lr_intercept_minx))
            .attr("y2", self.yRange(self.lr_max_y))
            .attr("x1", self.xRange.range()[0])
            .attr("x2", self.xRange(self.lr_max_x));
        
        //Add the linear regression line info
        self.regression_label
            .attr('x', function() { return self.xRange( self.lr_max_x); })
            .attr('y', function() { return self.yRange(self.lr_max_y); });
            
        //cutoff line
        self.cutoff_line
            .attr("y1", self.yRange.range()[0])
            .attr("y2", self.yRange.range()[1])
            .attr("x1", self.xRange(self.cutoff_value))
            .attr("x2", self.xRange(self.cutoff_value));
    
    };//end resize

    self.draw = function(){
        /*Draws the graph according to the size of the graph element*/
        
        //Standard start
        self.start_draw();
        
        self.calculateMaxX();
        self.calculateMinX();
        self.calculateMaxY();
        
        //Create y and x ranges
        self.xRange = d3.scale.linear()
            .range([0, self.width])
            .domain([self.min_x,self.max_x])
            .nice();
            
        self.yRange = d3.scale.linear()
            .range([self.height, 0])
            .domain([0,self.max_y])
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
            .text("Final Score");
        
        //Add the x axis label
        self.x_axis_label = self.svg_g.append("text")
            .attr("y", self.height + self.margin.bottom/2)
            .attr("x",(self.width / 2))
            .attr("dy", ".75em")
            .style("text-anchor", "middle")
            .text("Resume Score");
        
        //Add actual points
        self.points_lists = self.svg_g.selectAll(".point")
            .data(self.data)
            .enter().append("circle")
                .attr("class", 'points candidateScore')
                .attr('r', '5')
                .on('mouseover', function(d){self.show_tip(d, this);})
                .on("mouseout", function(d){self.hide_tip(d, this);})
                .attr("cx", function(d) {return self.xRange(d['Normalized Resume']);})
                .attr("cy", function(d) { return self.yRange(d['Final Score']); });
        
        //Add the linear regression line
        self.caluclate_linear_regression_values();
        self.regression_line = self.svg_g.append("line")
            .attr('id', 'regression_line_'+self.slug)
            .attr('class', 'regression_line')
            .attr("y1", self.yRange(self.lr_intercept_minx))
            .attr("y2", self.yRange(self.lr_max_y))
            .attr("x1", self.xRange.range()[0])
            .attr("x2", self.xRange(self.lr_max_x));
        
        //Add the linear regression line info
        var equation = 'y = ' + self.lr_slope.toPrecision(2) + 'x + ' + self.lr_intercept.toPrecision(2);
        var r_string = 'r2 = ' + self.lr_r2.toPrecision(2);
        var regression_info = equation + ', ' + r_string;
        self.regression_label = self.svg_g.append('text')
            .attr('class', 'regression_label hidden-xs')
            .attr('x', function() { return self.xRange( self.lr_max_x); })
            .attr('y', function() { return self.yRange(self.lr_max_y); })
            .attr('dy', -5)//just a guestimate buffer
            .attr('text-anchor', 'end')
            .text(regression_info);
        self.graph_element.prepend('<div class="row regression_row visible-xs"><div class="col-xs-12 text-center regression_label">Regression Info<br/><span id="regression_info_'+self.graph_container_id+'"> '+regression_info+'</span></div></div>');
        self.regression_info = $('#regression_info_'+self.graph_container_id);
        
        //Add the cutoff line
        self.calculate_cutoff_value();
        self.cutoff_line = self.svg_g.append("line")
            .attr('id', 'cutoff_line_'+self.slug)
            .attr('class', 'cutoff_line')
            .attr("y1", self.yRange.range()[0])
            .attr("y2", self.yRange.range()[1])
            .attr("x1", self.xRange(self.cutoff_value))
            .attr("x2", self.xRange(self.cutoff_value));
        
        //Create Graph legend
        self.graph_element.prepend('<div class="row legend_row" id=legend_row_'+self.graph_container_id+'>');
        self.legend_row = $('#legend_row_'+self.graph_container_id);
        self.legend_row.append('<div class="col-xs-12 col-sm-2 scale_col" id=scale_col_'+self.graph_container_id+'></div>');
        self.scale_col = $('#scale_col_'+self.graph_container_id);
        self.legend_row.append('<div class="col-xs-12 col-sm-10" id=legend_col_'+self.graph_container_id+'></div>');
        self.legend_col = $('#legend_col_'+self.graph_container_id);
        
        //Candidate Score
        var legend_element = '<button class="legend_button '+self.graph_container_id+'" ><svg width="15" height="14" style="vertical-align: middle"><circle class="legend series visible_true candidateScore" r="5" cx="6" cy="7"></circle></svg>Candidate Score</button>';
        self.legend_col.append('<div class="legend_button_wrapper">'+legend_element+'</div>');
        
        //Regression line
        legend_element = '<button class="legend_button '+self.graph_container_id+'" ><svg width="15" height="14" style="vertical-align: middle"><rect class="legend series visible_true regression_line" height="5" width="10" x="3" y="4"></rect></svg>Regression Line</button>';
        self.legend_col.append('<div class="legend_button_wrapper">'+legend_element+'</div>');
        
        //Cutoff line
        legend_element = '<button class="legend_button '+self.graph_container_id+'" ><svg width="15" height="14" style="vertical-align: middle"><rect class="legend series visible_true cutoff_line" height="5" width="10" x="3" y="4"></rect></svg>Cutoff Line</button>';
        self.legend_col.append('<div class="legend_button_wrapper">'+legend_element+'</div>');
        
        
        //Create Graph Title
        self.graph_element.prepend('<div class="row title_row" id=title_row_'+self.graph_container_id+'>');
        self.title_row = $('#title_row_'+self.graph_container_id);
        self.title_row.prepend('<div class="graph_title" id="title_'+self.graph_container_id+'">'+self.title_text+'</div>');
        self.title = $('#title_'+self.graph_container_id);
        
        self.init_tooltip();
    };//End draw graph
    
    self.init_tooltip = function(){
        /*Initializes the tootltip for the graph*/
        self.tool_tip = d3.tip()
            .attr('class', 'd3-tip')
            .attr('id', 'd3_tip_'+self.slug)
            .html(function(d) {
                html_string = '<div>';
                //Name
                html_string += '<span class="tip_title">'+d.Name+'</span></br>';
                //Points
                html_string += '<table>';
                html_string += '<tr><td class="text-left">Resume Score: </td><td style="padding-left:5px">'+Math.round(d['Normalized Resume'])+'</td></tr>';
                html_string += '<tr><td class="text-left">Interview Score: </td><td style="padding-left:5px">'+Math.round(d['Normalized Interview Score'])+'</td></tr>';
                html_string += '<tr><td class="text-left">Final Score: </td><td style="padding-left:5px">'+Math.round(d['Final Score'])+'</td></tr>';
                html_string += "</table></div>";
                return html_string;
            });
        
        self.svg_g.call(self.tool_tip);
    };
    
    self.show_tip = function(target_data, target){
        /*Shows the tooltip and highlights the point*/
        //var hover_point = self.points_lists[0][hover_target.id-1];
        add_class(d3.select(target), 'highlight');
        d3.select(target).attr('r', 10);
        self.tool_tip.show(target_data, target);
        self.tool_tip.offset([-9, 0]);
        //Fire GA event
        if (self.use_ga){
            ga('send', 'event', "Visualizations", "Interaction", 'Resume v Final Score');
        }
    };
    
    self.hide_tip = function(target_data, target){
        /*Hides the tooltip and de-highlights the bar*/
        d3.select(target).attr('r', 5);
        remove_class(d3.select(target), 'highlight');
        self.tool_tip.hide();
    };
    
    /********Reusable functions**************/
    self.calculate_cutoff_value = function(){
        /*Calculates the cutoff value assuming we're hiring 3 candidates and the data array is sorted highest to lowest*/
        if (self.data.length > 2){
            self.cutoff_value = self.data[2]['Normalized Resume'];
            self.cutoff_value = 0.95*self.cutoff_value;
        }
        else{
            self.cutoff_value = 0;
        }
        
    };
    
    self.caluclate_linear_regression_values = function(){
        /*Calculates the values necessary to create the linear regression line*/
        
        //Create the x y pairs
        var x_y = self.data.map(function (d) { return [d['Normalized Resume'],d['Final Score']]; });
        //Calculate regression value
        var regression = ss.linearRegression(x_y);
        var regressionLine = ss.linearRegressionLine(regression);
        var r2_value = ss.rSquared(x_y, regressionLine);
        
        self.lr_slope = regression.m;
        self.lr_intercept = regression.b;
        self.lr_intercept_minx = self.lr_slope * self.xRange.domain()[0] + self.lr_intercept;
        self.lr_max_x = self.xAxis.scale().domain()[1];
        self.lr_max_y = self.lr_slope * self.lr_max_x + self.lr_intercept;//y=mx+b, assumes self.x_max_value is correct
        self.lr_r2 = r2_value;
    };
    
    self.calculateMaxX = function(){
        /*Calculates the maximum x value based on the real final and predicted final scores*/
        self.max_x = d3.max(self.data, function(d) { return + d['Normalized Resume'];});
    };
    
    self.calculateMinX = function(){
        /*Calculates the minimum x value based on the real final and predicted final scores*/
        self.min_x = d3.min(self.data, function(d) { return + d['Normalized Resume'];});
    };
    
    self.calculateMaxY = function(){
        /*Calculates the maximum y value based on the real final and predicted final scores*/
        self.max_y = d3.max(self.data, function(d) { return + d['Final Score'];});
    };
    
    self.y_label_format = function(d, tooltip){
        /*Returns the y label. Used for both y-axis tick labels and the tooltip title. Little HACKy*/
        var label_string = d[1];
        
        return label_string;
    }

}
candidate_scores_graph_class.prototype = Object.create(graph_class.prototype); // See note below
candidate_scores_graph_class.prototype.constructor = candidate_scores_graph_class;
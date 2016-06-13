
function rankings_per_experience_graph_class(the_data, graph_container_id, title_text, slug, controls_enabled, fixed_height){
    /*Class for the ranking per experience of presidents graph*/
    
    var self = this;
    var min_height = 530,
        margin = {top: 5, right: 20, bottom: 40, left: 50};
    self.controls_enabled = controls_enabled;
    self.current_order = "chronological"
    
    graph_class.call(this, the_data, graph_container_id, title_text, slug, min_height, fixed_height, margin);
    self.visible_data = the_data;
    
    self.y_max_value = d3.max(self.data, function(d) { return + d.executive_score;} );
    self.x_max_value = d3.max(self.data, function(d) { return + d.experience_points;} );
    console.log(self.y_max_value, self.x_max_value)
    
    //Create the groups display dictionary
    var groups = d3.map(self.data, function(d){ return d.Group}).keys();
    self.display_dictionary = {};
    groups.forEach(function(group){
        self.display_dictionary[group.replace(/ /g , "_")] = {'visible':true, 'display_name':group};
    });
    
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
        
        $('#toggle_order').click(function(){
            self.toggle_order();
        });
    }
    
    self.toggle_order = function(){
        /*Toggles ordering the data by most to least and chronological*/
        if (self.current_order == "chronological"){
            self.current_order = "qualifications";
            self.visible_data.sort(function(x, y){
                return d3.descending(x.experience_points, y.experience_points);
            });
            self.update_graph();
            $('#toggle_order').text('Sort Chronologically');
        }
        else if (self.current_order == "qualifications"){
            self.current_order = "chronological";
            self.visible_data.sort(function(x, y){
                return d3.ascending(x.administration_start, y.administration_start);
            });
            self.update_graph();
            $('#toggle_order').text('Sort by Total Points');
        }
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
        console.log(self.visible_data)
        self.update_graph();
    }
    
    self.update_graph = function(){
        /*Updates the graph for when the experience points change or the visible groups changes*/
        self.y_max_value = d3.max(self.visible_data, function(d) { return + d.executive_score;} );
        self.x_max_value = d3.max(self.visible_data, function(d) { return + d.experience_points;} );
        
        //Update the range and axis
        self.xRange
            .domain([0,self.x_max_value]).nice();
        self.yRange
            .domain([0,self.y_max_value]).nice();

        self.y_axis.transition().call(self.yAxis);
        self.x_axis.transition().call(self.xAxis);
        
        //Update the data bars
        self.svg.selectAll(".point")
            .transition()
            .attr('visibility', function(d){ console.log(d.Group, self.return_group_visibility(d.Group)); return self.return_group_visibility(d.Group)})
            .attr("cx", function(d) { return self.xRange(d.experience_points); })
            .attr("cy", function(d) { return self.yRange(d.executive_score); });
    }
    
    self.resize = function(){
        /*Resizes the graph due to a window size change*/
        
        self.start_resize();
        
        //Rescale the range and axis functions to account for the new dimensions
        self.yRange.rangeBands([0, self.height], .15)
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
        
        //Update the data bars
        self.svg.selectAll("rect.data")
            .attr("y", function(d) {return self.yRange([d.id, d.Name, d['Source Link']]); })
            .attr("width", function(d) {return self.xRange(d.experience_points)})
            .attr("height", self.yRange.rangeBand());
        
        //Update the hover bars
        self.svg.selectAll("rect.hover_bar")
                .attr("y", function(d) { return self.yRange([d.id, d.Name, d['Source Link']]); })
                .attr("width", function(d) {return self.xRange(self.x_max_value)})
                .attr("height", self.yRange.rangeBand())
        
        //Update the tooltip lines
        self.tooltip_lines
            .attr("x1", self.xRange(0))
            .attr("y1", function(d) {
                var y = self.yRange([d.id, d.Name, d['Source Link']]) + self.yRange.rangeBand()/2;
                if (isNaN(y)){y = 0;}//Need to check for NaN
                return y;
            })
            .attr("x2", self.xRange(self.x_max_value)/2+self.xRange(self.x_max_value)/3)
            .attr("y2", function(d) {
                var y = self.yRange([d.id, d.Name, d['Source Link']]) + self.yRange.rangeBand()/2;
                if (isNaN(y)){y = 0;}//Need to check for NaN
                return y;
            });
    
    }//end resize

    self.draw = function(){
        /*Draws the graph according to the size of the graph element*/
        
        //Standard start
        self.start_draw();
        
        //Create y and x ranges
        self.xRange = d3.scale.linear()
            .range([0, self.width])
            .domain([0,self.x_max_value])
            .nice();
            
        self.yRange = d3.scale.linear()
            .range([self.height, 0])
            .domain([0,self.y_max_value])
            .nice();
        
        //Create the axis functions
        self.xAxis = d3.svg.axis()
            .scale(self.xRange)
            .ticks(Math.max(self.width/85, 2))
            .orient("bottom");
            
        self.yAxis = d3.svg.axis()
            .scale(self.yRange)
            .ticks(Math.max(self.width/85, 2))
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
            .text("Executive Score");
        
        //Add the x axis label
        self.x_axis_label = self.svg_g.append("text")
            .attr("y", self.height + self.margin.bottom/2)
            .attr("x",(self.width / 2))
            .attr("dy", ".75em")
            .style("text-anchor", "middle")
            .attr('font-weight', 'bold')
            .text("Experience Points");
        
        //Add actual points
        //points
        self.points_lists = self.svg_g.selectAll(".point")
            .data(self.data)
            .enter().append("circle")
                .attr("class", function(d) {return "point " + d.Group.replace(/ /g , "_");})
                .attr('r', '5')
                .on('mouseover', function(d){self.show_tip(d, this);})
                .on("mouseout", function(d){self.hide_tip(d, this);})
                .attr("cx", function(d) { return self.xRange(d.experience_points); })
                .attr("cy", function(d) { return self.yRange(d.executive_score); });
        
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
        
        //Create Graph Title
        self.graph_element.prepend('<div class="row title_row" id=title_row_'+self.graph_container_id+'>');
        self.title_row = $('#title_row_'+self.graph_container_id);
        self.title_row.prepend('<div class="graph_title" id="title_'+self.graph_container_id+'">'+self.title_text+'</div>');
        self.title = $('#title_'+self.graph_container_id);
        
        //Create controls
        $('#'+self.graph_container_id+'_controls').prepend('');
        
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
                html_string += '<tr><td class="text-left">Executive Score: </td><td style="padding-left:5px">'+Math.round(d.executive_score)+'</td></tr>';
                html_string += '<tr><td class="text-left">Domestic Score: </td><td style="padding-left:5px">'+Math.round(d.domestic_score)+'</td></tr>';
                html_string += '<tr><td class="text-left">Foreign Policy Score: </td><td style="padding-left:5px">'+Math.round(d.foriegn_policy_score)+'</td></tr>';
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
    
    self.tick_label_links = function(){
        /*Turns y-axis ticks into clickable links and styles appropriately*/
        d3.selectAll(".tick")
            .on("click", function(d) {
                if (d[3] != null) {
                    window.open(d[3], '_blank');//Open the source link
                }
            });
        
        //Style
        self.y_axis.selectAll('text').each(function(){
            if (this.textContent.substring(0,7) == 'Average'){//HACK from data
                this.classList.add("Average_tick");
            }
            else{
                this.classList.add("source_tick");
            }
        });
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
experience_graph_class.prototype = Object.create(graph_class.prototype); // See note below
experience_graph_class.prototype.constructor = experience_graph_class;
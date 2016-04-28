simulation_time = 0//milliseconds;
simulation_end_time = 5000//milliseconds;
var real_time_per_step = 1//milliseconds;
var Force = 10//Newton;
var mass = 5//kg;
var x_max = 5//meters;
var x_current = 0//meters;
var v_current = 0//meters/second;
var timer = null;
var demo;
var line_current = 0;

$(window).load(function () {
    
    $(document).ready(function () {
        
        //Create the mass slider for the ball
        $("#mass").slider({
            ticks : [0, 1, 5, 10],
            scale: 'linear',
            step: .5,
            value: 5,
            orientation: "vertical",
            reversed : true,
        });
        
        //Anytime the mass slider moves, update the mass of the ball
         $("#mass").on("slide", function(slideEvt) {
            mass = Number($('#mass').slider('getValue'));
            demo.ball.attr('fill-opacity', mass/10);
        });
        
        //When the window resizes, resize the graph
        $( window ).resize(function() {
            //graph.resize();
            demo.resize();
        });
        
        $('#start').click(function(){
            //Set up and start the timer for the time step
            if (timer !== null) return;
            timer = window.setInterval(function(){
                if (simulation_time < simulation_end_time && x_current < x_max){
                    time_step();
                }
                else{
                    clearInterval(timer);
                    timer = null;
                }
            }, real_time_per_step);
        })
        
        demo = new demo_class('demo');
        demo.draw();

    });
});

function time_step(){
    /*Runs all functions for every time step*/
    simulation_time += 1;
    if ((simulation_time*0.001) <= 2){
        if (mass > 0){
            var acceleration = Force/mass;
        }
        else{
            var acceleration = 100000000000000000000//infinite
        }
        v_current = acceleration * (simulation_time*0.001);
        x_current = 1/2*acceleration * Math.pow((simulation_time*0.001), 2);
    }
    else{
        x_current = x_current + v_current*0.001;
    }
    if (x_current > x_max){
        x_current = x_max;
    }
    demo.update_data();
}

function demo_class(graph_container_id){
    /*Class for the compare graph*/
    
    var self = this;
    self.margin = {};
    self.current_data = 'accounting';
    self.graph_container_id = graph_container_id;
    self.max_width = 10000;

    self.update_data = function(){
        /*move ball based on timestep data*/
        self.ball.attr('cx', function() {return self.xRange(x_current)});
        if ((simulation_time*0.001) <= 2 && mass>0 ){
            self.push_line
                .attr("x1", function() {return self.xRange(x_current)-self.margin['right']})
                .attr("x2", function() {return self.xRange(x_current)-self.margin['right']})
            line_current = x_current;
        }
        
    }
    
    self.resize = function(){
        /*Resizes the graph due to a window size change*/
        
        //Get the new graph dimensions
        self.set_graph_dimensions();
        
        //Update the svg dimensions
        self.svg
            .attr("width", self.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom);
        self.svg_g
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
        
        //Rescale the range function to account for the new dimensions
         self.xRange
            .range([0, self.width])
        
        //Update ball
        self.ball.attr("cx", self.xRange(x_current));
        
        //Update the lines
        self.push_line
            .attr("x1", self.xRange(line_current)-self.margin['right'])
            .attr("x2", self.xRange(line_current)-self.margin['right']);
        self.end_line
            .attr("x1", self.xRange(x_max)+self.margin['right'])
            .attr("x2", self.xRange(x_max)+self.margin['right']);
    
    }//end resize
    
    self.draw = function(){
        /*Draws the graph according to the size of the graph element*/
        //Get the graph dimensions
        self.set_graph_dimensions();
        
        //Create Graph SVG
        self.svg = d3.select('#'+self.graph_container_id)
            .append("svg")
                .attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom);
        
        //Add a layer to the svg
        self.svg_g = self.svg.append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

                    
        self.xRange = d3.scale.linear()
            .range([0, self.width])
            .domain(function(){
                    return [0, x_max];
            }());
    
        //add the ball
        self.ball = self.svg_g.append('circle')
            .attr("r", function() {return self.height/4})
            .attr("cx", self.xRange(x_current))
            .attr("cy", function() {return self.height/2})
            .attr('stroke', 'black')
            .attr("fill-opacity", function() {return mass/10});
        
        //add the push line
        self.push_line = self.svg_g.append("line")
            .attr("x1", self.xRange(x_current)-self.margin['right'])
            .attr("y1", 0)
            .attr("x2", self.xRange(x_current)-self.margin['right'])
            .attr("y2", self.height)
            .style("stroke-width", 2)
            .style("stroke", "green");
            
        //add the end line
        self.end_line = self.svg_g.append("line")
            .attr("x1", self.xRange(x_max)+self.margin['right'])
            .attr("y1", 0)
            .attr("x2", self.xRange(x_max)+self.margin['right'])
            .attr("y2", self.height)
            .style("stroke-width", 4)
            .style("stroke", "red");
            
    }//End draw graph
    
    self.set_graph_dimensions = function(){
        /*Resets the higheth width and margins based on the column width*/
        var graph_container_width = $('#'+self.graph_container_id).width();
        self.margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };
        self.height = 100- self.margin.top - self.margin.bottom;
        self.margin['left'] = self.height/4;
        self.margin['right'] = self.height/4;
        
        self.width = graph_container_width - self.margin.right - self.margin.left;
        if (self.width > self.max_width){
            self.width = self.max_width;
        }
    }
    
}

function profits_graph_class(the_data, graph_container_id){
    /*Class for the compare graph*/
    
    var self = this;
    self.margin = {};
    self.current_data = 'accounting';
    self.data = the_data;
    self.graph_container_id = graph_container_id;
    

    self.update_data = function(){
        /*Switches the data from accounting to economic dataset or visa-versa*/
            
            //change to accounting profit
            if (self.current_data == 'economic') {
                self.current_data = 'accounting';
                
                //Make oppertunity cost zero
                self.bar_oppertunity_cost
                    .transition()
                    .attr("height", 0);
                
                //Sum Line
                self.calculate_sum();
                self.sum_line
                    .transition()
                    .attr("d", self.sum_line_function(self.calculate_sum_line_data()))
                    .each('end',function(){
                        $('.oppertunity_cost').attr('visibility', 'hidden');    
                    });
                
                self.sum_line_text0
                    .transition()
                    .attr("y", self.yRange(self.sum)-5)
                    .text("$"+self.sum);
                
                self.sum_line_text1
                    .transition()
                    .attr("x", self.width )      
                    .attr("y", self.yRange(self.sum)+20)
                
                self.sum_line_text2
                    .transition()
                    .attr("x", self.width )             
                    .attr("y", self.yRange(self.sum)-5)
                    .text("Accounting");
                
            }
            
            //change to economic profit
            else if (self.current_data == 'accounting') {
                self.current_data = 'economic';
                $('.oppertunity_cost').attr('visibility', 'visible');
                //Make oppertunity cost zero
                self.bar_oppertunity_cost
                    .transition()
                    .attr("height", function(d) {
                        return Math.abs(self.yRange(d.Opportunity_Cost) - self.yRange(0));
                    });
                
                //Sum Line
                self.calculate_sum();
                self.sum_line
                    .transition()
                    .attr("d", self.sum_line_function(self.calculate_sum_line_data()))
                
                self.sum_line_text0
                    .transition()
                    .attr("y", self.yRange(self.sum)-5)
                    .text(self.currency_format(self.sum));
                
                self.sum_line_text1
                    .transition()
                    .attr("x", self.width )      
                    .attr("y", self.yRange(self.sum)+20)
                
                self.sum_line_text2
                    .transition()
                    .attr("x", self.width )             
                    .attr("y", self.yRange(self.sum)-5)
                    .text("Economic");
            }
    }
    
    self.resize = function(){
        /*Resizes the graph due to a window size change*/
        
        //Get the new graph dimensions
        self.set_graph_dimensions();
        
        //Update the svg dimensions
        self.svg
            .attr("width", self.width + self.margin.left + self.margin.right)
            .attr("height", self.height + self.margin.top + self.margin.bottom);
        self.svg_g
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
        
        //Rescale the range and axis functions to account for the new dimensions
         self.xRange
            .rangeRoundBands([0, self.width], .3)
        self.xAxis
            .scale(self.xRange);
        self.yRange
            .range([self.height, 0])
        
        //resize the x-axis
        self.x_axis
            .attr("transform", "translate(0," + self.yRange(0) + ")");
        self.x_axis.call(self.xAxis);
                
        
        //Add zero a_label
        self.zero_a_label      
            .attr("y", self.yRange(0)+20);
    
        //Revenue
        self.revenue_bar
            .attr("x", function(d) { return self.xRange(d.x); })
            .attr("width", self.xRange.rangeBand())
            .attr("y", function(d) { return self.yRange( Math.max(0, d.Revenue)); })
            .attr("height", function(d) {
                return Math.abs(self.yRange(d.Revenue) - self.yRange(0));
                });
        
        self.revenue_text
            .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
            .attr("y", function(d) {
                return self.yRange(Math.max(0, d.Revenue)) + Math.abs(self.yRange(d.Revenue) - self.yRange(0))/2 + 5;
            });
        
        //cost to produce
        self.production_cost_bar
            .attr("x", function(d) { return self.xRange(d.x); })
            .attr("width", self.xRange.rangeBand())
            .attr("y", function(d) { return self.yRange( Math.max(0, d.Cost_to_Produce)); })
            .attr("height", function(d) {
                return Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0));
                });
                
        self.production_cost_text
            .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
            .attr("y", function(d) {
                return self.yRange(Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0))/2 + 5;
            })
            
        //oppertunity cost
        self.bar_oppertunity_cost
            .attr("x", function(d) { return self.xRange(d.x); })
            .attr("width", self.xRange.rangeBand())
            .attr("y", function(d) {
                return self.yRange( Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce)  - self.yRange(0));
            })
            .attr("height", function(d) {
                return Math.abs(self.yRange(d.Opportunity_Cost) - self.yRange(0));
                });
                
         self.oppertunity_cost_text 
            .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
            .attr("y", function(d) {
                return self.yRange(Math.max(0, d.Opportunity_Cost)) + Math.abs(self.yRange(d.Opportunity_Cost) - self.yRange(0))/2 + 5;
            });
        
        //Sum Line
        self.sum_line
            .attr("d", self.sum_line_function(self.calculate_sum_line_data()))
        
        self.sum_line_text0          
            .attr("y", self.yRange(self.sum)-5)
        
        self.sum_line_text1
            .attr("x", self.width )      
            .attr("y", self.yRange(self.sum)+20)
        
        self.sum_line_text2
            .attr("x", self.width )             
            .attr("y", self.yRange(self.sum)-5)
    
    }//end resize
    
    self.draw = function(){
        /*Draws the graph according to the size of the graph element*/
        
        //Get the graph dimensions
        self.set_graph_dimensions();
        
        //Get the sum
        self.calculate_sum();
        
        //Create Graph SVG
        self.svg = d3.select('#'+self.graph_container_id)
            .append("svg")
                .attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom);
        
        //Add a layer to the svg
        self.svg_g = self.svg.append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

                    
        self.xRange = d3.scale.ordinal()
            .rangeRoundBands([0, self.width], .3)
            .domain(self.data.map(function(d) {
                    return d.x;
                })
            );
          
        self.yRange = d3.scale.linear()
            .range([self.height, 0])
            .domain(function(){
                    return [-200, 200];
            }());
        
         self.xAxis = d3.svg.axis()
            .scale(self.xRange)
            .orient("bottom")
            .tickFormat('');
        
        //add the x-axis
        self.x_axis = self.svg_g.append('svg:g')
            .attr("class", "x axis")
            .attr("transform", "translate(0," + self.yRange(0) + ")");
        self.x_axis.call(self.xAxis);
        
        //Add zero a_label
        self.zero_a_label = self.svg_g.append("text")
            .attr("x", 0 )             
            .attr("y", self.yRange(0)+20)
            .attr("text-anchor", "middle")
            .attr('class', 'zero a_label')
            .text("$0");
    
        //Revenue
        self.revenue_bar = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar revenue")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) { return self.yRange( Math.max(0, d.Revenue)); })
                .attr("height", function(d) {
                    return Math.abs(self.yRange(d.Revenue) - self.yRange(0));
                    });
        
        self.revenue_text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Revenue)) + Math.abs(self.yRange(d.Revenue) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "a_bar a_label")
                .text(function(d) {
                      return "Revenue " + self.currency_format(d.Revenue);
                });
        
        //cost to produce
        self.production_cost_bar = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar cost_to_produce")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) { return self.yRange( Math.max(0, d.Cost_to_Produce)); })
                .attr("height", function(d) {
                    return Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0));
                    });
                
        self.production_cost_text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "a_bar a_label")
                .text(function(d) {
                      return "Production Cost " + self.currency_format(d.Cost_to_Produce);
                });
                
            
        //oppertunity cost
        self.bar_oppertunity_cost = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar oppertunity_cost")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) {
                    return self.yRange( Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce)  - self.yRange(0));
                })
                .attr("height", 0);
                
         self.oppertunity_cost_text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Opportunity_Cost)) + Math.abs(self.yRange(d.Opportunity_Cost) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "a_bar a_label")
                .text(function(d) {
                      return "Opportunity Cost " + self.currency_format(d.Opportunity_Cost);
                });
        $('.oppertunity_cost').attr('visibility', 'hidden');
        
        //Sum Line
        self.sum_line_function = d3.svg.line()
            .x(function(d, i) {
                return d.x
              })
            .y(function(d) { return self.yRange(d.y); });
        
        self.sum_line = self.svg_g.append("path")
            .attr("class", "sum_line")
            .attr("d", self.sum_line_function(self.calculate_sum_line_data()))
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");
        
        self.sum_line_text0 = self.svg_g.append("text")
            .attr("x", 20 )          
            .attr("y", self.yRange(self.sum)-5)
            .attr("text-anchor", "start")
            .attr('class', 'sum_line ')
            .text(self.currency_format(self.sum));
        
        self.sum_line_text1 = self.svg_g.append("text")
            .attr("x", self.width )      
            .attr("y", self.yRange(self.sum)+20)
            .attr("text-anchor", "end")
            .attr('class', 'sum_line ')
            .text("Profit");
        
        self.sum_line_text2 = self.svg_g.append("text")
            .attr("x", self.width )             
            .attr("y", self.yRange(self.sum)-5)
            .attr("text-anchor", "end")
            .attr('class', 'sum_line ')
            .text("Accounting");
            
    
    }//End draw graph
    
    /* Reusable functions********************/
    self.currency_format = function(value){
        /*Returns a currency formatted value for positive and negative values*/
        if (value >= 0){
            var formatted_value = "$" + value;
        }
        else{
            var formatted_value = "-$" + Math.abs(value);
        }
        return(formatted_value)
    }
        
    self.calculate_sum_line_data = function(){
        return [{"x":20, "y":self.sum}, {"x":self.width, "y":self.sum}];
    };
    
    self.calculate_sum = function(){
        /*Calculates the sum for the sum line*/
        if (self.current_data == "economic"){
            self.sum = self.data[0].Revenue + self.data[0].Cost_to_Produce + self.data[0].Opportunity_Cost;
        }
        else if (self.current_data == 'accounting'){
            self.sum = self.data[0].Revenue + self.data[0].Cost_to_Produce;
        }
    };
    
    self.set_graph_dimensions = function(){
        /*Resets the higheth width and margins based on the column width*/
        var graph_container_width = $('#'+self.graph_container_id).width();
        self.margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 10
        };
        self.width = graph_container_width - self.margin.right - self.margin.left;
        if (self.width > self.max_width){
            self.width = self.max_width;
        }
        self.height = 300- self.margin.top - self.margin.bottom;
    }
    
}
var simulation_time = 0;//seconds;
var simulation_end_time = 5;//seconds;
var sim_time_per_step = .005;//seconds;
var Force = 9;//Newton;
var mass = 5;//kg;
var x_max = 30;//meters;
var x_current = 0;//meters;
var v_current = 0;//meters/second;
var timer = null;
var demo;
var line_current = 0;
var time_step_count = 0;
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
            ticks_labels: ['Massless', ' ', ' ', '10kg'],
            formatter: function(value) {
                if (value == '5'){
                    return 'Bowlingball: 5kg';
                }
                else if (value == '1'){
                    return 'Basketball: 1kg';
                }
                else if (value == '0'){
                    return 'Light: 0kg';
                }
                return value + 'kg';
            }
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
            demo_graph.resize();
        });
        $("#reset").click(function(){
            simulation_time = 0;
            simulation_end_time = 5;
            sim_time_per_step = .005;
            Force = 9;
            mass = Number($('#mass').slider('getValue'));
            x_max = 30//meters;
            x_current = 0//meters;
            v_current = 0//meters/second;
            clearInterval(timer);
            timer = null;
            line_current = 0;
            time_step_count = 0;
            demo.update_data();
            demo_graph.data = [{x:0, y:0}];
            demo_graph.update_data();
            $("#mass").slider('enable');
            
        });
        
        $('#start').click(function(){
            //Set up and start the timer for the time step
            $("#mass").slider('disable');
            if (timer !== null) return;
            timer = window.setInterval(function(){
                if (simulation_time < simulation_end_time && x_current < x_max){
                    time_step();
                }
                else{
                    clearInterval(timer);
                    timer = null;
                }
            }, sim_time_per_step);
        })
        
        demo = new demo_class('demo');
        demo.draw();
        
        demo_graph = new demo_graph([{x:0, y:0}], 'graph');
        demo_graph.draw()

    });
});

function time_step(){
    /*Runs all functions for every time step*/
    time_step_count += 1;
    simulation_time = time_step_count * sim_time_per_step
    if (simulation_time <= 2){
        if (mass > 0){
            var acceleration = Force/mass;
        }
        else{
            var acceleration = 100000000000000000000//infinite
        }
        v_current = acceleration * simulation_time;
        x_current = 1/2*acceleration * Math.pow(simulation_time, 2);
    }
    else{
        x_current = x_current + v_current*sim_time_per_step;
    }
    if (x_current > x_max){
        x_current = x_max;
    }
    demo.update_data();
    demo_graph.update_data();
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
        if (simulation_time <= 2 && mass>0 ){
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
        self.height = 150- self.margin.top - self.margin.bottom;
        self.margin['left'] = self.height/4;
        self.margin['right'] = self.height/4;
        
        self.width = graph_container_width - self.margin.right - self.margin.left;
        if (self.width > self.max_width){
            self.width = self.max_width;
        }
    }
    
}

function demo_graph(the_data, graph_container_id){
    /*Class for the line graph*/
    
    var self = this;
    self.margin = {};
    self.data = the_data;
    self.graph_container_id = graph_container_id;

    self.update_data = function(){
        /*Switches the data from accounting to economic dataset or visa-versa*/
        
        //Get current sim time in seconds
        var current_sim_time = simulation_time;
        
        //Update the uber passenger, driver, and surge data
        if (v_current > 1000){
            var new_demand_data = {x:current_sim_time, y:20};
        }
        else{
            var new_demand_data = {x:current_sim_time, y:v_current};
        }
        self.data.push(new_demand_data);
        
        //Update the lines
        self.data_path.attr("d", self.data_line_function(self.data));
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
        self.xRange.range([0, self.width]);
        self.yRange.range([self.height, 0]);
        
        //resize axes
        self.x_axis.attr("transform", "translate(0," + self.yRange(0) + ")");
        self.x_axis.call(self.xAxis);
        self.y_axis.call(self.yAxis);
        
        //Update the position of the labels
        self.y_axis_label
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (self.height / 2));
        self.x_axis_label
            .attr("x", self.width / 2 )
            .attr("y",  self.height+self.margin.bottom-5);
        
        self.data_path.attr("d", self.data_line_function(self.data));
    
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
                    return [0, 5];
            }());
          
        self.yRange = d3.scale.linear()
            .range([self.height, 0])
            .domain(function(){
                    return [0, 20];
            }());
        
         self.xAxis = d3.svg.axis()
            .scale(self.xRange)
            .orient("bottom");
          
        self.yAxis = d3.svg.axis()
            .scale(self.yRange)
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
        self.data_line_function = d3.svg.line()
            .x(function(d) { return self.xRange(d.x); })
            .y(function(d) { return self.yRange(d.y); });
        
        self.data_path = self.svg_g.append('svg:path')
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr("stroke-width", 4)
            .attr("d", self.data_line_function(self.data));
        
        //Add the left y axis label
        self.y_axis_label = self.svg_g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (self.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Speed of the Ball");
        
        //Add the x axis label
        self.x_axis_label = self.svg_g.append("text")
            .attr("x", self.width / 2 )
            .attr("y",  self.height+self.margin.bottom-5)
            .style("text-anchor", "middle")
            .text("Time (seconds)");
            
    
    }//End draw graph
    
    self.set_graph_dimensions = function(){
        /*Resets the higheth width and margins based on the column width*/
        var graph_container_width = $('#'+self.graph_container_id).width();
        self.margin = {
            top: 10,
            right: 40,
            bottom: 40,
            left: 50
        };
        self.width = graph_container_width - self.margin.right - self.margin.left;
        if (self.width > self.max_width){
            self.width = self.max_width;
        }
        self.height = 200- self.margin.top - self.margin.bottom;
    }
    
}
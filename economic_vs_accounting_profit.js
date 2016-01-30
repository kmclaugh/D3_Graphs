$(window).load(function () {
    
    $(document).ready(function () {
        
        var the_data = [
            {'x': 1, 'Revenue':150, 'Cost_to_Produce':-30, "Oppertunity_Cost": -170}
        ];
        
        //When the window resizes, resize the graph
        $( window ).resize(function() {
            compare_graph.resize();
        });
        
        $('#change_graph').click(function(){
            compare_graph.update_data();
        })
        
        //Init the graph
        var compare_graph = new compare_graph_class(the_data, 'graph');
        compare_graph.draw();

    });
});

function compare_graph_class(the_data, graph_container_id){
    /*Class for the compare graph*/
    
    var self = this;
    self.margin = {};
    self.current_data = 'accounting';
    self.data = the_data;
    self.graph_container_id = graph_container_id

    self.update_data = function(){
        /*Switches the data from accounting to economic dataset or visa-versa*/
            
            //change to relative
            if (self.current_data == 'accounting') {
                self.current_data = 'economic';
                
                //Update the y axis
                self.yRange.domain([0, 450]);
                self.yAxis.scale(self.yRange);
                self.y_axis
                    .transition()
                    .call(self.yAxis);
                
                //Update the bars with the new data
                self.svg.selectAll("rect")
                    .data(self.data)
                    .transition()
                    .attr("y", function(d) { return self.y_data_function(d); })
                    .attr("height", function(d) { return self.height - self.y_data_function(d)});
                
                //Update the graph title
                self.graph_title.text('Death Toll - 1950 Equivalent');
            }
            
            //change to absolute
            else if (self.current_data == 'relative') {
                self.current_data = 'death_total';
                
                //Update the y axis
                self.yRange.domain([0, 55]);
                self.yAxis.scale(self.yRange);
                self.y_axis
                    .transition()
                    .call(self.yAxis);
                
                //Update the bars with the new data
                self.svg.selectAll("rect")
                    .data(self.data)
                    .transition()
                    .attr("y", function(d) { return self.y_data_function(d); })
                    .attr("height", function(d) { return self.height - self.y_data_function(d)});
                
                //Update the graph title
                self.graph_title.text('Absolute Death Toll');
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
        
        //Update the graph title position
        self.graph_title
            .attr("x", (self.width / 2))
            .attr("y", (0 - self.margin.top/2));
        
        //Rescale the range and axis functions to account for the new dimensions
        self.xRange
            .rangeRoundBands([0, self.width], .1);
        self.xAxis
            .scale(self.xRange);
        self.yRange
            .range([self.height, 0]);
        self.yAxis
            .scale(self.yRange);
        
        //resize the x-axis
        self.x_axis
            .attr("transform", "translate(0," + self.height + ")")
            .call(self.xAxis)
                .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", "-.55em")
                    .attr('class', 'tick_labels')
                    .text(self.x_labels_data_function)
                    .attr("transform", self.x_labels_transform_function());
        
        //resize the y-axis
        self.y_axis
            .call(self.yAxis);
        
        //Update the position of the y axis label
        self.y_axis_label
            .attr("y", 0 - self.margin.left)
            .attr("x",0 - (self.height / 2))
        
        //Update the actual bar rectangles
        self.svg.selectAll("rect")
            .attr("x", function(d) { return self.xRange([d.Cause, d.Century_String]); })
            .attr("width", self.xRange.rangeBand())
            .attr("y", function(d) { return self.y_data_function(d); })
            .attr("height", function(d) { return self.height - self.y_data_function(d)});
    
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
        
        //Add the graph title
        self.graph_title = self.svg_g.append("text")
            .attr("x", (self.width / 2))             
            .attr("y", (0 - self.margin.top/2))
            .attr("text-anchor", "middle")
            .attr('id', 'graph_title')
            .text("Accounting Profit");
                    
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
        self.x_axis.call(self.xAxis)
    
        //Revenue
        var bars = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar revenue")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) { return self.yRange( Math.max(0, d.Revenue)); })
                .attr("height", function(d) {
                    return Math.abs(self.yRange(d.Revenue) - self.yRange(0));
                    });
        
        var text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Revenue)) + Math.abs(self.yRange(d.Revenue) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "bar_label")
                .text(function(d) {
                      return "Revenue = $"+d.Revenue;
                });
        
        //cost to produce
        var bars = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar cost_to_produce")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) { return self.yRange( Math.max(0, d.Cost_to_Produce)); })
                .attr("height", function(d) {
                    return Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0));
                    });
                
        var text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "bar_label")
                .text(function(d) {
                      return "Cost to Produce = $"+d.Cost_to_Produce;
                });
                
            
        //oppertunity cost
        var bars = self.svg_g.selectAll("bar")
            .data(self.data)
            .enter().append("rect")
                .attr("class", "bar oppertunity_cost")
                .attr("x", function(d) { return self.xRange(d.x); })
                .attr("width", self.xRange.rangeBand())
                .attr("y", function(d) {
                    return self.yRange( Math.max(0, d.Cost_to_Produce)) + Math.abs(self.yRange(d.Cost_to_Produce)  - self.yRange(0));
                })
                .attr("height", function(d) {
                    return Math.abs(self.yRange(d.Oppertunity_Cost) - self.yRange(0));
                    });
                
         var text = self.svg_g
            .data(self.data)
            .append("text")
                .attr("x", function(d) { return self.xRange(d.x) + self.xRange.rangeBand()/2; })
                .attr("y", function(d) {
                    return self.yRange(Math.max(0, d.Oppertunity_Cost)) + Math.abs(self.yRange(d.Oppertunity_Cost) - self.yRange(0))/2 + 5;
                })
                .attr("text-anchor", "middle")
                .attr("class", "bar_label")
                .text(function(d) {
                      return "Oppertunity Cost = $"+d.Oppertunity_Cost;
                });
        
        //Sum Line
        var line = d3.svg.line()
            .x(function(d, i) {
                return d.x
              })
            .y(function(d) { return self.yRange(d.y); });
        
        var sum = self.data[0].Revenue + self.data[0].Cost_to_Produce + self.data[0].Oppertunity_Cost;
        console.log(sum)
        
        var line_data = [
            {"x":self.width*.20, "y":sum},
            {"x":self.width, "y":sum}
        ];
        
        self.svg_g.append("path")
            .attr("class", "sum_line")
            .attr("d", line(line_data))
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");
        
        self.graph_title = self.svg_g.append("text")
            .attr("x", self.width )             
            .attr("y", self.yRange(sum)-5)
            .attr("text-anchor", "end")
            .attr('id', 'sum_line_text')
            .text("Econmic Profit = $"+sum);
            
    
    }//End draw graph
    
    /* Reusable functions********************/
    self.set_graph_dimensions = function(){
        /*Resets the higheth width and margins based on the column width*/
        var graph_container_width = $('#'+self.graph_container_id).width();
        var left_margin = function(){
            if (graph_container_width < 400){
                return 45;
            }
            else{
                return 50;
            }
        }
        self.margin = {
            top: 30,
            right: 0,
            bottom: 300,
            left: left_margin()
        };
        self.width = graph_container_width - self.margin.right - self.margin.left;
        self.height = 600- self.margin.top - self.margin.bottom;
    }
    
}
function points_table_class(default_points, your_points, experience_graph, graph_container_id, title_text, slug){
    /*Class for the points per positions table*/
    
    var self = this;
    self.default_points = default_points;
    self.your_points = your_points
    self.experience_graph = experience_graph;
    self.current_data = 'user_points'
    self.data = $.map(self.default_points, function(value, key) {
                    return {'Position': key, 'Default Points': value,
                        'Your Points': function(){
                            return self.your_points[key];
                        }
                    }
                });
    self.graph_container_id = graph_container_id;
    self.columns = ["Position", "Default Points", "Your Points"];
    
    $('#toggle_default').click(function(){
        if (self.current_data == "user_points") {
            self.current_data = "default_points";
            self.table.select('col.Your').attr('class', 'Your Points');
            self.sort_column("Default Points");
            
            self.table.select('col.Default').attr('class', 'Default Points active_data');
            self.experience_graph.data.forEach(function(candidate){
                candidate.calculate_experience_points(self.default_points);
            });
            self.experience_graph.update_graph();
            $(this).text("Switch to Your Points");
        }
        else if (self.current_data == "default_points") {
            
            self.current_data = "user_points";
            self.table.select('col.Default').attr('class', 'Default Points');
            self.sort_column("Your Points");
            
            self.table.select('col.Your').attr('class', 'Your Points active_data');
            self.experience_graph.data.forEach(function(candidate){
                candidate.calculate_experience_points(self.your_points);
            });
            self.experience_graph.update_graph();
            $(this).text("Switch to Default Points");
        }
    })
    
    $(document).on("focus", 'input[name="Your Points"]', function(){
        var row = $(this).parent().parent();
        row.animate({backgroundColor:'#00ccff'}, 1000)
    })
    $(document).on("blur", 'input[name="Your Points"]', function(){
        var row = $(this).parent().parent();
        if (row.hasClass('different_points')) {
            row.animate({backgroundColor:'#ffcc99'}, 1000, function(){
                row.css("background-color", "")
            });
        }
        else{
            row.animate({backgroundColor:'white'}, 1000, function(){
                row.css("background-color", "")
            });
        }
        
    })
    
    $(document).on("change", 'input[name="Your Points"]', function(){
        self.update_data(this)
    })
    
    self.update_data = function(input){
        var new_value = Number($(input).val());
        var position = $(input).attr('position');
        self.your_points[position] = new_value;
        console.log(new_value, self.default_points[position])
        if (new_value != self.default_points[position]) {
            var row = $(input).parent().parent();
            $(row).addClass('different_points')
        }
        else{
            var row = $(input).parent().parent();
            $(row).removeClass('different_points')
        }
        
        if (self.current_data == 'user_points') {
            self.sort_column("Your Points");
            self.experience_graph.data.forEach(function(candidate){
                candidate.calculate_experience_points(self.your_points);
                
            });
            
            self.experience_graph.update_graph();
        }
        
    }
    
    self.resize = function(){
    
    }//end resize

    self.create = function(){
        /*creates the table*/
        self.table = d3.select('#'+self.graph_container_id)
            .append("table")
                .attr('class', 'points_table')
        self.colgroup = self.table.append("colgroup");
        self.thead = self.table.append("thead");
        self.tbody = self.table.append("tbody");

        self.colgroup
            .selectAll("th")
            .data(self.columns)
            .enter()
            .append("col")
                .attr('class', function(column){
                    if (column == 'Your Points') {
                        return column + ' active_data'
                    }
                    else{
                        return column
                    }
                });
        
        self.thead.append("tr")
            .selectAll("th")
            .data(self.columns)
            .enter()
            .append("th")
                .text(function(column) { return column; });
        
        // create a row for each object in the data
        self.rows = self.tbody.selectAll("tr")
            .data(self.data)
            .enter()
            .append("tr")
                .attr('class', 'data');
                
        // create a cell in each row for each column
        self.cells = self.rows.selectAll("td")
            .data(function(row) {
                return self.columns.map(function(column) {
                    return {column: column, value: row[column], position: row['Position']};
                });
            })
            .enter()
            .append("td")
            .attr("style", "font-family: Courier") // sets the font style
                .html(function(d) {
                    if (d.column != 'Your Points') {
                        return d.value;
                    }
                    else{
                        return '<input class="your_points" name="Your Points" position="'+d.position+'" value="'+d.value()+'"></input>';
                    }
                });
        
        self.sort_column("Your Points")
    }//End draw graph
    
    self.sort_column = function(column) {
        if (column == "Your Points") {
            d3.selectAll("tr.data")
                .sort(function(a, b) { return b["Your Points"]() - a["Your Points"](); });
        }
        else{
            d3.selectAll("tr.data")
                .sort(function(a, b) { return b[column] - a[column]; });
        }
    }
}

function stringCompare(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a > b ? 1 : a == b ? 0 : -1;
}
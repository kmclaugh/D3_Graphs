
function points_table_class(the_data, graph_container_id, title_text, slug){
    /*Class for the points per positions table*/
    
    var self = this;
    self.data = the_data
    self.graph_container_id = graph_container_id;
    self.columns = ["Position", "Deafult Points", "Your Points"]
    console.log(self.data)
    self.update_data = function(group){
        
    }
    
    self.resize = function(){
    
    }//end resize

    self.create = function(){
        /*creates the table*/
        self.table = d3.select('#'+self.graph_container_id)
            .append("table")
        
        self.thead = self.table.append("thead");
        self.tbody = self.table.append("tbody");

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
            .append("tr");
        
        // create a cell in each row for each column
        self.cells = self.rows.selectAll("td")
            .data(function(row) {
                console.log(row)
                return self.columns.map(function(column) {
                    if (column != "Your Points"){
                        return {column: column, value: row[column]};
                    }
                    else{
                        return {column: column, value: '<input name="position_points" position="'+row.Position+' " value="'+row["Default Points"]+'>1</input>'};
                    }
                });
            })
            .enter()
            .append("td")
            .attr("style", "font-family: Courier") // sets the font style
                .html(function(d) { return d.value; });
        
    }//End draw graph
    
}
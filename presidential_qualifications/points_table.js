
function points_table_class(the_data, graph_container_id, title_text, slug){
    /*Class for the points per positions table*/
    
    var self = this;
    self.data = the_data;
    self.graph_container_id = graph_container_id;
    self.columns = ["Position", "Points"]
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
        
    }//End draw graph
    
}
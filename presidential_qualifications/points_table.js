
function points_table_class(the_data, graph_container_id, title_text, slug){
    /*Class for the points per positions table*/
    
    var self = this;
    self.data = the_data
    self.columns = ["Position", "Deafult Points", "Your Points"];
    self.graph_container_id = graph_container_id;
    self.graph_element = $('#'+self.graph_container_id);
    console.log(self.data)
    self.update_data = function(group){
        
    }
    
    self.resize = function(){
    
    }//end resize

    self.create = function(){
        /*creates the table*/
       
        self.graph_element.append('<table id="table_'+self.graph_container_id+'" ></table>');
        self.table = $('#table_'+self.graph_container_id);
        
        self.table.append('<thead></thead>');
        self.thead = $('#table_'+self.graph_container_id+'> thead');
        self.columns.forEach(function(column){
            self.thead.append('<th>'+column+'</th>')
        });
        
        self.table.append('<tbody></thead>');
        self.tbody = $('#table_'+self.graph_container_id+'> tbody');
       
        for (key in self.data){
            var default_points = self.data[key];
            var position_cell = '<td name="Position" data="'+key+'" >'+key+'</td>';
            var deafult_points_cell = '<td name="Default Points" data="'+default_points+'" >'+default_points+'</td>';
            var your_points_cell = '<td name="Your Points" data="'+default_points+'" >'+default_points+'</td>';
             console.log(key, self.data[key])
        }
        
    }//End draw graph
    
}
$(window).load(function () {
    
    $(document).ready(function () {
        data = jQuery.parseJSON( data )
        for (president in data){
            //console.log(data[president])
            for (position in data[president]){
                //console.log(president, position)
                for (experience in data[president][position]){
                    var value = data[president][position][experience];
                    if (typeof value == "string" && value.indexOf('/') > -1){
                        data[president][position][experience] = moment(value, "MM/DD/YYYY")
                    }
                }
            }
        }
        console.log(data)
    });
});
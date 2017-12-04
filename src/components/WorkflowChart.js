import React, { Component } from 'react';
import $ from 'jquery';
import * as d3 from 'd3';

var json = require('./../data.json');
var streams = [];
var items = [];
var svg_height = 860;
var rect_height=130;
var rect_width="100%";
var element_loc=[],
    grids = [];
var height_stream_text_div=48; 
var pad_stream_div=51;

var decision_rect = "M0.9256479947110743,50.647917796943716 L50.925648235036306,0.6479198530888087 L100.9256484753644,50.647917796943716 L50.925648235036306,100.64791574079848 L0.9256479947110743,50.647917796943716 z";
var round_rect = "M17.326723591161084,0.9076131555916045 L145.19435658402077,0.9076131555916045 L145.19435658402077,0.9076131555916045 C163.8378728694335,-0.2403311134060704 162.42291142631814,19.962512350924012 162.42291142631814,42.05183005300881 C162.42291142631814,64.14116187477569 161.94537808807442,80.90015841243076 145.19435658402077,80.90015841243076 L17.326723591161084,80.90015841243076 L17.326723591161084,80.90015841243076 C0.10260312417589507,79.17824906877533 0.6154892577233662,62.993217605778014 0.6154892577233662,40.90388578401118 C0.6154892577233662,18.814553962244336 0.10260312417589507,0.9076131555916045 17.326723591161084,0.9076131555916045 z";
var full_rect = "M112.95002368402834,1.0483293136913585 L163.91444279600137,1.1128325324635222 L163.1294408199625,80.53449050726832 L115.89453034057249,80.69667446630366 L51.23845950139693,80.69668641355668 L0.4458192737179168,80.69668641355668 C0.6912008646546905,54.47100858477497 0.9365824555914625,27.27400714247304 1.1819640465282362,1.0483293136913585 L118.96195867818221,0.8861095128970404";
var connector_circle = "M1.4878047704696655,47.27235916607321 C1.4878047704696655,21.963550944457587 23.708866902807138,1.4634162849489434 51.14227694272995,1.4634162849489434 C78.57568698265275,1.4634162849489434 100.79674911499023,21.963550944457587 100.79674911499023,47.27235916607321 C100.79674911499023,72.58116738768881 78.57568698265275,93.08130204719747 51.14227694272995,93.08130204719747 C23.708866902807138,93.08130204719747 1.4878047704696655,72.58116738768881 1.4878047704696655,47.27235916607321 z";
var delay_shape = "M0.44196757153116567,0.5869455806497799 L58.97855051856567,0.5869455806497799 L58.97855051856567,0.5869455806497799 C91.30741740989293,0.5869455806497799 117.51513346559983,18.422756443067637 117.51513346559983,40.42434549943574 C117.51513346559983,62.42593722945463 91.30741740989293,80.26174541822121 58.97855051856567,80.26174541822121 L0.44196757153116567,80.26174541822121 L0.44196757153116567,0.5869455806497799 z";

var items_connected_to={};

class App extends Component {
  constructor (props) {
    super(props);
    this.createFlowChart = this.createFlowChart.bind(this);
  }

  componentDidMount() {
    var data = this.props.data;
    // var data = json;
    const context = this.setContext();

    try {
        this.createFlowChart(context,data)
    }
    catch(err) {
        this.props.errorCallBack(err);
    }     
  }

  componentDidUpdate(prevProps, prevState) {
          //only update chart if the data has changed
          console.log('Received new data!');
          if ([prevProps.data][0].items !== [this.props.data][0].items) {
              var data = this.props.data;
              const context = this.setContext();
              try {
                this.createFlowChart(context,data)
              }
              catch(err) {
                this.props.errorCallBack(err);
              }                    
          };
  }

  setContext() {
      items=[];
      streams=[];
      element_loc=[];
      grids=[];

      return d3.select("#flowChart_div")
        .append("svg")
        .attr("height", svg_height)
        .attr("width", '100%')
        .attr('viewBox', '0 0 1200 570')
        .attr('preserveAspectRatio', 'xMinYMin')
  }

  // main render function for component 

  createFlowChart(context, data) {
    for (var e in data.items) {
      if (data.items.hasOwnProperty(e)) {
        items.push(data.items[e]);
      }
    }
    // svg_height = $('#flowChart_div').height();
    this.span_into_grid(data);
    this.elements_locations(grids);
    this.draw_streams(context, data);
    this.draw_objects(context, data);
    this.link_objects(data);
  }

  arrange_full_grid(id,linked_ids,grids) {
    var id_loc_x="";
    var linked_loc_x="";
    var id_loc_y="";
    var linked_loc_y="";
    
    for(var k=0;k<linked_ids.length;k++){
        
      for(var i=0;i<grids.length;i++){
        
        for(var j=0;j<grids[i].length;j++){
          
          if(grids[i][j]==id){
            id_loc_x=i;
            id_loc_y=j;
          }
          
          else if(grids[i][j]==linked_ids[k]){
            linked_loc_x=i;
            linked_loc_y=j;
          }
        } 
      }
      
      if(id_loc_x<linked_loc_x){ //if linked is not in same stream or row
        
        if(id_loc_y!=linked_loc_y){
          
          var swap1=null;
          var swap2=null;
          
          var loops=Number(id_loc_y-linked_loc_y);
          
          for(var lp=0;lp<loops;lp++){
                    
            for(var i2=linked_loc_y;i2<grids[linked_loc_x].length;i2++){

              swap1=grids[linked_loc_x][i2];
              
              if(swap2!=null){
                grids[linked_loc_x][i2]=swap2;
                
              }
              
              else{
                grids[linked_loc_x][i2]=null;
              }
              
              swap2=swap1;
              
            }
            
          }
        }
      }
    }
  }

  span_into_grid(data) {
    var max_streams = 0;
    max_streams=0;
  
    var items_stream_wise={};
    
    $.map(items,function(element,index){
      
      if(element.stream>max_streams){
        max_streams=element.stream;
      }
      
      
      if(!items_stream_wise[element.stream]){
        items_stream_wise[element.stream]=[];
      }
      
      items_stream_wise[element.stream].push({"id":element.id});
      
      
      //--------items_connected_to-----
        
        if(!items_connected_to[element.id]){
          items_connected_to[element.id]=[];
        }
        
        $.map(element.connectors,function(d,i){
          
          items_connected_to[element.id].push(d.linkTo);
        });
        
      //------------
      
    });

    grids=new Array(max_streams);
  
    for(var i=0;i<max_streams;i++){
      
      grids[i]=new Array(30);
      
      for(var j=0;j<30;j++){
        
        if(items_stream_wise[i+1][j]){
          grids[i][j]=items_stream_wise[i+1][j]['id'];
        }
        else{
          grids[i][j]=null;
        }
      }
    }

    for(var i=0;i<max_streams;i++){
    
    
      for(var j=0;j<30;j++){
        
        if(grids[i][j]!=null){
          
          var check_links=grids[i][j];
          
          var process_arr=items_connected_to[check_links];
          
          //console.log(process_arr);
          
          this.arrange_full_grid(check_links,process_arr,grids); //(element id, element linkTo, grid to be sorted)
        }
      }
      
    }
    for ( var i = 0 ; i < grids.length; i ++ ) {
      this.rearr_grids(grids, items_connected_to, data);
    }
  }

  // draws streams 
  draw_streams(context, t) {
    for (var e in t.streams) 
      t.streams.hasOwnProperty(e) && streams.push(t.streams[e].title);

    if (streams.length > 4)
      rect_height = svg_height / (streams.length);

    var r = context
              .selectAll("rect")
              .data(streams);

    r.enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", function(t, e) {
          return e * rect_height
      })
      .attr("width", rect_width)
      .attr("height", rect_height)
      .attr("fill", "#fff")
      .style("stroke-width", "1px")
      .style("stroke", "#ccc");

    r.exit().remove();

    r.enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", function(t, e) {
          return e * rect_height
      })
      .attr("width", "7%")
      .attr("height", rect_height)
      .attr("fill", "#f9f9f9")
      .style("stroke-width", "1px")
      .style("stroke", "#ccc");

    r.enter()
      .data(streams)
      .append("text")
      .attr("x", 0)
      .attr("y", function (t, e) {
        return e * rect_height
      })
      .attr("font-size", "16px")
      .attr("transform", function(t, e) {
        return 'translate(' + (e * rect_height + 35) + ',' + (e * rect_height + 40) + ') rotate(90)';
      })
      .text(function (d) {
        return d;
      })

    if (streams.length > 4)
      $("#flowChart_div svg").attr("height", rect_height * streams.length);
  }

  rearr_grids(grids, items_connected_to, data) {
    var tmp_position = [];
    tmp_position[0] = {"x": 0, "y": 0};
    var i = 0;
    for (var key in data['items']) {
      i ++;
      tmp_position[i] = {"x": -1, "y": -1};
    }

    for ( var i = 0 ; i < grids.length ; i ++ ) {
      for ( var j = 0 ; j < grids[i].length ; j ++ ) {
        if (grids[i][j] != null) {
          tmp_position[grids[i][j]]["x"] = i;
          tmp_position[grids[i][j]]["y"] = j;
        }
      }
    }

    for ( var i = 0 ; i < grids.length ; i ++ ) {
      for ( var j = 0 ; j < grids[i].length ; j ++ ) {
        if (grids[i][j] != null) {
          var target_point_arr = items_connected_to[grids[i][j]];
          for ( var k = 0; k < target_point_arr.length; k ++) {
            var target_point = target_point_arr[k];
            // if ( tmp_position[grids[i][j]]["x"] < tmp_position[target_point]["x"]) {
            if ( tmp_position[grids[i][j]]["y"] <= tmp_position[target_point]["y"]) {
              var row = tmp_position[target_point]["x"];
              var col = tmp_position[target_point]["y"];
              if (this.detect_conflict(i, row, col , grids)) {
                console.log("x:" + row + "      y" + col);
                while (this.detect_conflict(i, row, col, grids)) {
                  col += 1;
                  
                }
                var mid = grids[row][tmp_position[target_point]["y"]];
                grids[row][tmp_position[target_point]["y"]] = grids[row][col];
                grids[row][col] = mid;
              }
            }
          }
          // }
        }
      }
    }
  }

  detect_conflict(source, row, col, grids) {
    for (var i = source + 1 ; i < row ; i ++ ) {
      if (grids[i][col] != null)
        return true;
    }
    return false;
  }

  elements_locations(grids) {
    for(var i=0;i<grids.length;i++){
      
      for(var j=0;j<grids[i].length;j++){
        
        if(grids[i][j]!=null){
          element_loc[grids[i][j]]=j;
        }
      }
        
    }
  }

  //draws nodes

  draw_objects(context, data) {
    var stream_level="";
    var item_x_axis_position_streamWise=[];
    var object_items = d3.select("#flowChart_div")
              .select("svg").selectAll("g").data(items);

    var max = 0;
    for ( var i = 0 ; i < element_loc.length ; i ++ ) {
      if (element_loc[i] != undefined && element_loc[i] > max) {
        max = element_loc[i];
      }
    }
    console.log(max);
    var step = $("#flowChart_div").width() / (max + 1);
    console.log(step);

    object_items=object_items
      .enter()
      .append("g")
      .attr("transform",function(d,i){
        
        stream_level=d.stream-1;
        if(item_x_axis_position_streamWise[stream_level]){
          item_x_axis_position_streamWise[stream_level]=(step*element_loc[d.id]);
        }
        else{
          item_x_axis_position_streamWise[stream_level]=(step*element_loc[d.id]);
        }
        
        var tx=item_x_axis_position_streamWise[stream_level];
        
        if(d.type.toLowerCase()=="start"||d.type.toLowerCase()=="finish"||d.type.toLowerCase()=="process-simple"){
          return "translate("+(98+tx)+","+((stream_level*rect_height)+25)+")";
        }
        
        else if(d.type.toLowerCase()=="connector-end"||d.type.toLowerCase()=="connector-start"){
          return "translate("+(129+tx)+","+((stream_level*rect_height)+18)+")";
        }
        
        else if(d.type.toLowerCase()=="delay"){
          return "translate("+(100+tx)+","+((stream_level*rect_height)+25)+")";
        }
        
        else if(d.type.toLowerCase()=="decision"){
          return "translate("+(129+tx)+","+((stream_level*rect_height)+15)+")";
        }
        
        else{
          return 0; 
        }
      });

    object_items.append("path")
  
     .attr("class","objects")
     
     .attr("id",function(d,i){ return "shape_"+d.id;})
       
    .attr("d", function(d,i){

      if(d.type.toLowerCase()=="start"||d.type.toLowerCase()=="finish"){
        return round_rect;  
      }
      
      else if(d.type.toLowerCase()=="process-simple"){
        return full_rect;
      }
      
      else if(d.type.toLowerCase()=="decision"){
        return decision_rect;
      }
      
      else if(d.type.toLowerCase()=="connector-start"||d.type.toLowerCase()=="connector-end"){
        
        return connector_circle;
      }
      
      else if(d.type.toLowerCase()=="delay"){
        return delay_shape;
      }
      
      else{
        return 0; 
      }
      
    })
    .on('click',function(d){
        this.props.nodeCallBack(d)
      }.bind(this))
    .attr("fill", "#fff")
    .style("stroke-width","2px")
    .style("stroke",function(d,i){

      if(d.type.toLowerCase()=="start"||d.type.toLowerCase()=="process-simple"||d.type.toLowerCase()=="connector-start"||d.type.toLowerCase()=="delay"){
        return "#0088ce";   
      }
      
      else if(d.type.toLowerCase()=="finish"||d.type.toLowerCase()=="decision"){
        return "#f36d00";   
      }
      
      else if(d.type.toLowerCase()=="connector-end"){
        return "#ea0000";
      }
      
      else{
        return "#000";  
      }
    });

    object_items.append("foreignObject")
    .append("xhtml:div")
    .html(function(d){
      
      if(d.type=="decision"){
        return '<div style="width:100px;padding:10px;margin-top:25px;text-align:center;    max-height: 50px;overflow: hidden;">'+d.title+'</div>';
      }
      
      else if(d.type=="connector-start"||d.type=="connector-end"){
        return '<div style="width:98px;padding:5px;margin-top:15px;text-align:center;    max-height: 50px;overflow: hidden;">'+d.title+'</div>';
      }
      
      else{
        return '<div style="width:170px;padding:10px;">'+d.title+'</div>';
      }
    });
  }

  //draws connectors

  link_objects(data) {
    d3.select("svg").append("svg:defs")
    .append("svg:marker")
    .attr("markerUnits","strokeWidth")
    .attr("id", "arrow_shape")
    .attr("strokeWidth", 12)
    .attr("markerHeight", 12)
    .attr("viewBox", "0 0 12 12")
    .attr("refX", 10)
    .attr("refY", 6)
    .attr("markerWidth", 12)
    .attr("markerHeight", 12)
    .attr("orient", "auto")
    .append("path")
    .attr("d","M2,1 L2,11 L9,6 L2,1")
    .style("fill","#fff")
    .style("stroke","#afafaf")
    .style("stroke-width","0.5");
    
    
    var object_info={};
    
    d3.selectAll('.objects')
      .each(function(d) { 
      
      var obj_id=$(this).attr("id");
      
      var transform_x_y=$(this).closest("g").attr("transform").replace("translate(","").replace(")","").split(",");
      
      object_info[obj_id]={"height":Number(this.parentNode.getBBox().height),"width":Number(this.parentNode.getBBox().width),"x":Number(transform_x_y[0]),"y":Number(transform_x_y[1])};
      //object_info.push(fetched_data);
    
    });
    
    
    for(var i=0;i<items.length;i++){
      
      var id="shape_"+items[i].id;
      
      
      
      var linkToArr=[];
      for (var key in items[i]['connectors']) {
        if (items[i]['connectors'].hasOwnProperty(key)) {
          linkToArr.push(items[i]['connectors'][key]);
        }
      }
      
      //----------------Links are inserting from here------------------
      var object_items=d3.select("svg")
      .selectAll("g.link_from_"+items[i].id)
      .data(linkToArr);
      
      object_items
      .enter()
      .append("g")
      .attr("id",function(d){return "g_link_"+items[i].id+"_"+d.linkTo;})
      .attr("class","link_from_"+items[i].id)
      .append("path")
      .attr("id",function(d){return "link_"+items[i].id+"_"+d.linkTo;})
      .attr("d",function(d,i){
        
        var id2="shape_"+d.linkTo;
        
        //console.log(object_info[id2]["x"]+" {{}} " + object_info[id]["x"]+object_info[id]["width"]);
          
        if(object_info[id2]["x"]>object_info[id]["x"]+object_info[id]["width"] &&object_info[id2]["y"]>object_info[id]["y"] + object_info[id]["height"]){

          var M_line="M"+(Number(object_info[id]["x"])+Number(object_info[id]["width"]))+","+(Number(object_info[id]["y"])+(Number(object_info[id]["height"])/2));
          
          var horizontal = "H" + (Number(object_info[id2]["x"]) + Number(object_info[id2]["width"])/2) ;

          var vertical = "V" + Number(object_info[id2]["y"]);

          return  M_line +" " +  horizontal + " " + vertical;

        }
        else if (object_info[id2]["x"]>object_info[id]["x"]+object_info[id]["width"] && object_info[id2]["y"] > object_info[id]["y"] - object_info[id]["height"]) {
          var M_line="M"+(Number(object_info[id]["x"])+Number(object_info[id]["width"]))+","+(Number(object_info[id]["y"])+(Number(object_info[id]["height"])/2));
          
          
          var L_line="H"+Number(object_info[id2]["x"]);
          return  M_line+L_line;
        }
        else if (object_info[id2]["x"] < object_info[id]["x"] - object_info[id]["width"] && object_info[id2]["y"] < object_info[id]["y"] - object_info[id]["height"]) {

          var M_line="M"+(Number(object_info[id]["x"]))+","+(Number(object_info[id]["y"])+(Number(object_info[id]["height"])/2));
          
          var horizontal = "H" + (Number(object_info[id2]["x"]) + Number(object_info[id2]["width"])/2) ;

          var vertical = "V" + (Number(object_info[id2]["y"]) + Number(object_info[id2]["height"]));

          return  M_line +" " +  horizontal + " " + vertical;
        }
        else if (object_info[id2]["x"] < object_info[id]["x"] - object_info[id]["width"]) {
          var M_line="M"+(Number(object_info[id]["x"]))+","+(Number(object_info[id]["y"])+(Number(object_info[id]["height"])/2));
          
          
          var L_line="H"+(Number(object_info[id2]["x"]) + +Number(object_info[id2]["width"]));
          return  M_line+L_line;
        }
        if(object_info[id2]["x"]>object_info[id]["x"]+object_info[id]["width"] &&object_info[id2]["y"] < object_info[id]["y"] - object_info[id]["height"]){

          var M_line="M"+(Number(object_info[id]["x"])+Number(object_info[id]["width"]))+","+(Number(object_info[id]["y"])+(Number(object_info[id]["height"])/2));
          
          var horizontal = "H" + (Number(object_info[id2]["x"]) + Number(object_info[id2]["width"])/2) ;

          var vertical = "V" + (Number(object_info[id2]["y"]) + Number(object_info[id2]["height"]));

          return  M_line +" " +  horizontal + " " + vertical;

        }
        else {
          
          var M_line="M"+(Number(object_info[id]["x"])+Number(object_info[id]["width"])/2)+","+(Number(object_info[id]["y"])+(Number(object_info[id]["height"])));
          
          
          var L_line="L"+Number(Number(object_info[id2]["x"])+(Number(object_info[id2]["width"])/2))+","+Number(object_info[id2]["y"]);
          return  M_line+L_line;

        }
      }) 
      .attr("marker-end","url(#arrow_shape)")
      .attr("fill", "none")
      .style("stroke-width","2px")
      .style("stroke","#afafaf")
      .each(function(d,i){
        
      });
      
      
      var text = object_items
      .enter().append("text")
      .attr("x", 6)
      .attr("dy", -5)
    .attr('text-anchor', 'middle');

    text.append("textPath")
    .attr('startOffset', '45%')
        .attr("xlink:href",function(d){ return "#link_"+items[i].id+"_"+d.linkTo;})
        .text(function(d){ return d.title;});
    }
  }

  render() {
    return (
        <div id="flowChart_div" className="flowChart_div"></div>
    );
  }
}

export default App;
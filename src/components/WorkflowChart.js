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
var pad_stream_div=31;

var decision_rect = "M0.9256479947110743,50.647917796943716 L50.925648235036306,0.6479198530888087 L100.9256484753644,50.647917796943716 L50.925648235036306,100.64791574079848 L0.9256479947110743,50.647917796943716 z";
var round_rect = "M17.326723591161084,0.9076131555916045 L145.19435658402077,0.9076131555916045 L145.19435658402077,0.9076131555916045 C163.8378728694335,-0.2403311134060704 162.42291142631814,19.962512350924012 162.42291142631814,42.05183005300881 C162.42291142631814,64.14116187477569 161.94537808807442,80.90015841243076 145.19435658402077,80.90015841243076 L17.326723591161084,80.90015841243076 L17.326723591161084,80.90015841243076 C0.10260312417589507,79.17824906877533 0.6154892577233662,62.993217605778014 0.6154892577233662,40.90388578401118 C0.6154892577233662,18.814553962244336 0.10260312417589507,0.9076131555916045 17.326723591161084,0.9076131555916045 z";
var full_rect = "M112.95002368402834,1.0483293136913585 L163.91444279600137,1.1128325324635222 L163.1294408199625,80.53449050726832 L115.89453034057249,80.69667446630366 L51.23845950139693,80.69668641355668 L0.4458192737179168,80.69668641355668 C0.6912008646546905,54.47100858477497 0.9365824555914625,27.27400714247304 1.1819640465282362,1.0483293136913585 L118.96195867818221,0.8861095128970404";
var connector_circle = "M1.4878047704696655,47.27235916607321 C1.4878047704696655,21.963550944457587 23.708866902807138,1.4634162849489434 51.14227694272995,1.4634162849489434 C78.57568698265275,1.4634162849489434 100.79674911499023,21.963550944457587 100.79674911499023,47.27235916607321 C100.79674911499023,72.58116738768881 78.57568698265275,93.08130204719747 51.14227694272995,93.08130204719747 C23.708866902807138,93.08130204719747 1.4878047704696655,72.58116738768881 1.4878047704696655,47.27235916607321 z";
var delay_shape = "M0.44196757153116567,0.5869455806497799 L58.97855051856567,0.5869455806497799 L58.97855051856567,0.5869455806497799 C91.30741740989293,0.5869455806497799 117.51513346559983,18.422756443067637 117.51513346559983,40.42434549943574 C117.51513346559983,62.42593722945463 91.30741740989293,80.26174541822121 58.97855051856567,80.26174541822121 L0.44196757153116567,80.26174541822121 L0.44196757153116567,0.5869455806497799 z";

class App extends Component {
  constructor (props) {
    super(props);
    this.createFlowChart = this.createFlowChart.bind(this);
  }

  componentDidMount() {        
    var data = this.props.data;
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
    this.span_into_grid(data);
    this.elements_locations(grids);
    this.draw_streams(context, data);
    this.draw_objects(context, data);
    this.link_objects(data);
  }

  arrange_full_grid(t, e, r) {
    for (var a = "", s = "", n = "", i = "", o = 0; o < e.length; o++) {
      for (var d = 0; d < r.length; d++)
          for (var l = 0; l < r[d].length; l++) {
            if (r[d][l] === t) {
              a = d;
              n = l;
            }
            else if (r[d][l] === e[o]) {
              s = d;
              i = l;
            }
          }
      if (a !== s && n > i)
        for (var c = null, p = null, m = Number(n - i), h = 0; m > h; h++) {
          for (var _ = i; _ < r[s].length; _++) c = r[s][_], null != p ? r[s][_] = p : r[s][_] = null, p = c;
        }
    }
  }

  span_into_grid(t) {
    var max_streams = 0;
    var e = {},
        r = {};
    $.map(items, function(t, a) {
        if (t.stream > max_streams) {
          max_streams = t.stream;
        }
        if (!e[t.stream]) {
          e[t.stream] = [];
        }
        e[t.stream].push({
          id: t.id
        });
        if (!r[t.id]) {
          r[t.id] = [];
        }
        $.map(t.connectors, function(e, a) {
            r[t.id].push(e.linkTo);
        })
    });

    grids = new Array(max_streams);
    for (let a = 0; a < max_streams; a++) {
      grids[a] = new Array(4);
      for (let s = 0; 4 > s; s++) 
        e[a + 1][s] ? grids[a][s] = e[a + 1][s].id : grids[a][s] = null
    }
    for (let a = 0; a < max_streams; a++) {
      for (let s = 0; 4 > s; s++) {
        if (null != grids[a][s]) {
          var n = grids[a][s],
              i = r[n];
          this.arrange_full_grid(n, i, grids);
        }
      }
    }
  }

  // draws streams 
  draw_streams(context, t) {
    for (var e in t.streams) 
      t.streams.hasOwnProperty(e) && streams.push(t.streams[e].title);

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

    var a = d3.select("#flowChart_div")
              .append("div")
              .attr("class", "streams_text_main_div")
              .selectAll("div")
              .data(streams);

    a.enter()
      .append("div")
      .style("width", rect_height - 2 + "px")
      .style("padding-top", height_stream_text_div / 2 + "px")
      .style("padding-bottom", height_stream_text_div / 2 + "px")
      .style("text-align", "center")
      .attr("class", "rotate_270")
      .style("-ms-transform", function(t, e) {
          return "translate(-" + (pad_stream_div - 2) + "px," + (pad_stream_div + 2 * pad_stream_div * e) + "px) rotate(269.9deg)"
      })
      .style("-webkit-transform", function(t, e) {
          return "translate(-" + (pad_stream_div - 2) + "px," + (pad_stream_div + 2 * pad_stream_div * e) + "px) rotate(269.9deg)"
      })
      .style("transform", function(t, e) {
          return "translate(-" + (pad_stream_div - 2) + "px," + (pad_stream_div + 2 * pad_stream_div * e) + "px) rotate(269.9deg)"
      })
      .text(function(t, e) {
          return t
      });

    a.exit().remove();

    $(".streams_text_main_div").css("height", rect_height * streams.length + "px");
    $("#flowChart_div svg").attr("height", rect_height * streams.length);
  }

  elements_locations(t) {
    for (var e = 0; e < t.length; e++)
        for (var r = 0; r < t[e].length; r++) null != t[e][r] && (element_loc[t[e][r]] = r);
  }

  //draws nodes

  draw_objects(context, t) {
    var e = "",
        r = [],
        a = context.selectAll("g").data(items);
    a = a.enter().append("g").attr("transform", function(t, a) {
        e = t.stream - 1, r[e] ? r[e] = 300 * element_loc[t.id] : r[e] = 300 * element_loc[t.id];
        var s = r[e];
        return "start" === t.type.toLowerCase() || "finish" === t.type.toLowerCase() || "process-simple" === t.type.toLowerCase() ? "translate(" + (100 + s) + "," + (e * rect_height + 25) + ")" : "connector-end" === t.type.toLowerCase() || "connector-start" === t.type.toLowerCase() ? "translate(" + (132 + s) + "," + (e * rect_height + 18) + ")" : "delay" === t.type.toLowerCase() ? "translate(" + (100 + s) + "," + (e * rect_height + 25) + ")" : "decision" === t.type.toLowerCase() ? "translate(" + (131 + s) + "," + (e * rect_height + 15) + ")" : 0
    }), a.append("path").attr("class", "objects").attr("id", function(t, e) {
        return "shape_" + t.id
    }).attr("d", function(t, e) {
        return "start" === t.type.toLowerCase() || "finish" === t.type.toLowerCase() ? round_rect : "process-simple" === t.type.toLowerCase() ? full_rect : "decision" === t.type.toLowerCase() ? decision_rect : "connector-start" === t.type.toLowerCase() || "connector-end" === t.type.toLowerCase() ? connector_circle : "delay" === t.type.toLowerCase() ? delay_shape : 0
    }).attr("fill", "#fff").style("stroke-width", "2px").style("stroke", function(t, e) {
        return "start" === t.type.toLowerCase() || "process-simple" === t.type.toLowerCase() || "connector-start" === t.type.toLowerCase() || "delay" === t.type.toLowerCase() ? "#0088ce" : "finish" === t.type.toLowerCase() || "decision" === t.type.toLowerCase() ? "#f36d00" : "connector-end" === t.type.toLowerCase() ? "#ea0000" : "#000"
    }).on('click',function(d){
      this.props.nodeCallBack(d)
    }.bind(this));
    a.append("foreignObject").append("xhtml:body").html(function(t) {
        return "decision" === t.type ? '<div style="width:100px;padding:10px;margin-top:25px;text-align:center;    max-height: 50px;overflow: hidden;">' + t.title + "</div>" : "connector-start" === t.type || "connector-end" === t.type ? '<div style="width:98px;padding:5px;margin-top:15px;text-align:center;    max-height: 50px;overflow: hidden;">' + t.title + "</div>" : '<div style="width:170px;padding:10px;">' + t.title + "</div>"
    }).on('click',function(d){
      this.props.nodeCallBack(d)
    }.bind(this))
  }

  //draws connectors

  link_objects(data) {
    d3.select("svg").append("svg:defs").append("svg:marker").attr("markerUnits", "strokeWidth").attr("id", "arrow_shape").attr("strokeWidth", 12).attr("markerHeight", 12).attr("viewBox", "0 0 12 12").attr("refX", 10).attr("refY", 6).attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2").style("fill", "#fff").style("stroke", "#afafaf").style("stroke-width", "0.5");
    var e = {};
    d3.selectAll(".objects").each(function(t) {
      var obj_id = $(this).attr("id"), transform_x_y = $(this).closest("g").attr("transform").replace("translate(", "").replace(")", "").split(","); 
      e[obj_id] = {
        height: Number(this.parentNode.getBBox().height),
        width: Number(this.parentNode.getBBox().width),
        x: Number(transform_x_y[0]),
        y: Number(transform_x_y[1])
      }
    });
    for (var r = 0; r < items.length; r++) {
        var a = "shape_" + items[r].id,
            s = [];
        for (var n in items[r].connectors) items[r].connectors.hasOwnProperty(n) && s.push(items[r].connectors[n]);
        var i = d3.select("svg").selectAll("g.link_from_" + items[r].id).data(s);
          i.enter()
            .append("g")
            .attr("id", function(t) {
                return "g_link_" + items[r].id + "_" + t.linkTo
            })
            .attr("class", "link_from_" + items[r].id)
            .append("path")
            .attr("id", function(t) {
                return "link_" + items[r].id + "_" + t.linkTo
            })
            .attr("d", function(t, r) {
                var s = "shape_" + t.linkTo;
                if (e[s].x > e[a].x + e[a].width) {
                    var n = "M" + (Number(e[a].x) + Number(e[a].width)) + "," + (Number(e[a].y) + Number(e[a].height) / 2),
                        i = "L" + Number(e[s].x) + "," + (Number(e[s].y) + Number(e[s].height) / 2);
                    return n + i
                }
                n = "M" + (Number(e[a].x) + Number(e[a].width) / 2) + "," + (Number(e[a].y) + Number(e[a].height)),
                    i = "L" + Number(Number(e[s].x) + Number(e[s].width) / 2) + "," + Number(e[s].y);
                return n + i
            })
            .attr("marker-end", "url(#arrow_shape)")
            .attr("fill", "#000")
            .style("stroke-width", "2px")
            .style("stroke", "#afafaf").each(function(t, e) {});

        var o = i.enter()
                  .append("text")
                  .attr("x", 6)
                  .attr("dy", -5)
                  .attr("text-anchor", "middle");

        o.append("textPath")
          .attr("startOffset", "45%")
          .attr("xlink:href", function(t) {
              return "#link_" + items[r].id + "_" + t.linkTo
          })
          .text(function(t) {
              return t.title
          })
    }
  }

  render() {
    return (
        <div id="flowChart_div" className="flowChart_div"></div>
    );
  }
}

export default App;

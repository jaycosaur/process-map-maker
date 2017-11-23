import React, {
    Component
} from 'react';
import * as d3 from "d3";

import "./WorkflowChart.css";

class WorkflowChart extends Component {
    displayName: 'WorkflowChart';

    propTypes: {
        id: PropTypes.string,
        height: PropTypes.number,
        width: PropTypes.number,
        innerRadius: PropTypes.number,
        outerRadius: PropTypes.number,
        backgroundColor: PropTypes.string,
        foregroundColor: PropTypes.string,
        percentComplete: PropTypes.number
    }

    constructor(props) {
        super(props);
        this.state = {
            svg: '',
            width: 940,
            height: 560,
            defColor: '#337ab7',
            priColor: '#f0ad4e',
            totalItemsCnt: 0,
            depth: 0,
            defElWidth: 100,
            defElHeight: 60,
            linkWidth: 50,
            padding: 5,
            nextX: 0,
            nextY: 40,
            itemsData: [],
            drawedItemsArray: [],
            defStreamHeight: [],
            paddingY: 40,
            junctionOperatorRadius: 30,
            rhombusRadius: 40
        }
    }

    componentDidMount() {        
        var data = this.props.data;        
        const context = this.setContext();
        try {
            this.drawStreamLayout(context, data[0]);
            this.state.itemsData.push(data[0].items);
            this.parseJson(this.state.itemsData);
            this.drawElement(context, 10, this.state.paddingY, this.state.itemsData[0][1], 1);
            this.drawLinks(context, this.state.itemsData[0]);
        }
        catch(err) {
            alert('Whoops!' + err.message);
        }     
        
    }

    componentDidUpdate(prevProps, prevState) {
            // only update chart if the data has changed
            console.log('Received new data!');
            if ([prevProps.data][0].items !== [this.props.data][0].items) {
                var data = this.props.data;
                const context = this.setContext();   
                try {
                    this.state.itemsData.push(data[0].items);
                    this.drawStreamLayout(context, data[0]);            
                    this.parseJson(this.state.itemsData);
                    this.drawElement(context, 10, this.state.paddingY, this.state.itemsData[0][1], 1);
                    this.drawLinks(context, this.state.itemsData[0]);
                }
                catch(err) {
                    alert('Whoops!' + err.message);
                }                    
            };
    }

    setContext() {
        return d3.select('#workflow').append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 970 570')
            .attr('preserveAspectRatio', 'xMinYMin')
            .append("g")
            .attr("transform", "translate(30,10)");
    }


    drawRect(context, id, x, y, width, height, color, text) {
        var g = context.append('g').attr('id', 'item' + id).attr('class', 'g_wrapper').attr('transform', function() {
            return "translate(" + x + "," + y + ")";
        }).attr('startX', x).attr('startY', y).attr('endX', x + width).attr('endY', y + height).on('click',function(d){
                console.log(id);
            });
        var res = g.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr('stroke', color);

        res += g.append("text").text(text).attr('x', width / 2).attr('y', height / 2).attr('text-anchor', 'middle').attr('dy', '.1em').call(this.wrap, width);
    }

    //draw rounded rectangle
    drawRoundRect(context, id, x, y, width, height, text, color, rx) {
        if (rx === '' || rx === undefined) {
            rx = 3;
        }
        var g = context.append('g').attr('id', 'item' + id).attr('class', 'g_wrapper').attr('transform', function() {
            return "translate(" + x + "," + y + ")";
        }).attr('startX', x).attr('startY', y).attr('endX', x + width).attr('endY', y + height).on('click',function(d){
                console.log(id);
            });
        var res = g.append("rect")
            .attr('ry', rx)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr('stroke', color);
        res += g.append("text").text(text).attr('x', width / 2).attr('y', height / 2).attr('text-anchor', 'middle').attr('dy', '.3em').call(this.wrap, width);

    }

    //draw round square and rotate
    drawRhombus(context, id, x, y, width, color, rx, text) {
        let _this = this;
        var g = context.append('g').attr('id', 'item' + id).attr('class', 'g_wrapper').attr('transform', function() {
            return "translate(" + x + "," + y + ")";
        }).attr('startX', x).attr('startY', y).attr('endX', x + 2 * width).attr('endY', y + width).on('click',function(d){
                console.log(id);
            });
        var res = g.append("polygon")
            .attr('points', function() {
                return 0 + ',' + _this.state.defElHeight / 2 + ' ' + width + ',' + (-width + _this.state.defElHeight / 2) + ' ' + (2 * width) + ',' + _this.state.defElHeight / 2 + ' ' + width + ',' + (width + _this.state.defElHeight / 2)
            })
            .attr('stroke', color)
            .attr('fill', 'white');

        res += g.append("text").text(text).attr('x', width).attr('y', this.state.defElHeight / 2).attr('text-anchor', 'middle').attr('dy', '.3em').call(this.wrap, width);
        return res;
    }

    drawOrSplitOperator(context, id, x, y, color, rx) {
        var g_w = context.append('g').attr('id', 'item' + id).attr('class', 'g_wrapper').attr('transform', function() {
            return "translate(" + x + "," + y + ")";
        }).attr('startX', x).attr('startY', y).attr('endX', x + rx).attr('endY', y + rx).on('click',function(d){
                console.log(id);
            });
        g_w.append("circle")
            .attr('r', rx)
            .attr("cx", rx)
            .attr("cy", rx)
            .attr('stroke', color);
        g_w.append('line')
            .attr('x1', 0)
            .attr('y1', rx)
            .attr('x2', (2 * rx))
            .attr('y2', (rx))
            .attr('stroke', this.state.defColor)
            .attr('stroke-width', '3px');

        g_w.append('line')
            .attr('x1', rx)
            .attr('y1', 0)
            .attr('x2', rx)
            .attr('y2', 2 * rx)
            .attr('stroke', this.state.defColor)
            .attr('stroke-width', '3px');
    }

    drawJunctionOperator(context, id, x, y, color, rx) {
        var g = context.append('g').attr('id', 'item' + id).attr('class', 'g_wrapper').attr('transform', function() {
            return "translate(" + x + "," + y + ")";
        }).attr('startX', x).attr('startY', y).attr('endX', x + 2 * rx).attr('endY', y + rx).on('click',function(d){
                console.log(id);
            });
        g.append("circle")
            .attr('r', rx)
            .attr("cx", rx)
            .attr("cy", rx)
            .attr('stroke', color);
        g.append('line')
            .attr('x1', 5)
            .attr('y1', 5)
            .attr('x2', (2 * rx - 5))
            .attr('y2', (2 * rx - 5))
            .attr('stroke', this.state.defColor)
            .attr('stroke-width', '3px');
        g.append('line')
            .attr('x1', 5)
            .attr('y1', (2 * rx - 5))
            .attr('x2', (2 * rx - 5))
            .attr('y2', 5)
            .attr('stroke', this.state.defColor)
            .attr('stroke-width', '3px');
    }

    drawConnectorOperator(context, id, x, y, color, rx, text) {
        var g = context.append('g').attr('id', 'item' + id).attr('class', 'g_wrapper').attr('transform', function() {
            return "translate(" + x + "," + y + ")";
        }).attr('startX', x).attr('startY', y).attr('endX', x + 2 * rx).attr('endY', y + rx).on('click',function(d){
                console.log(id);
            });
        g.append("circle")
            .attr('r', rx)
            .attr("cx", rx)
            .attr("cy", rx / 2)
            .attr('stroke', color);
        g.append("text").text(text).attr('x', rx).attr('y', rx / 2).attr('text-anchor', 'middle').attr('dy', '.1em').call(this.wrap, 2 * rx);
    }

    //Default left-right arrow
    drawArrow(x, y, nX, nY, nodeType) {
        var qVH = 3;
        var ahwidth = 5;
        switch (nodeType) {
            case 'start':
                x += this.state.defElWidth;
                y += this.state.defElHeight / 2;
                break;
            case 'finish':
                x += this.state.defElWidth;
                y += this.state.defElHeight / 2;
                break;
            case 'decision':
                x += 2 * this.state.rhombusRadius;
                y += this.state.defElHeight / 2;
                break;
            case 'process-simple':
                x += this.state.defElWidth;
                y += this.state.defElHeight / 2;
                break;
            case 'junction':
                x += 2 * this.state.junctionOperatorRadius;
                y += this.state.defElHeight / 2;
                break;
            case 'or-split':
                x += 2 * this.state.junctionOperatorRadius;
                y += this.state.defElHeight / 2;
                break;
        }

        return "M" + x + "," + y +
            "h" + (nX - x - ahwidth) +
            "v" + (-qVH) +
            "L" + (nX) + ',' + y +
            "L" + (nX - ahwidth) + ',' + (parseInt(y) + qVH) +
            "v" + (-qVH);
    }

    /*
    |-------|
    |       |
    V       |
    */
    drawArrow4(startX, startY, endX, endY) {
        startX += this.state.defElWidth / 2;
        return "M" + startX + "," + startY +
            "v" + (-35) +
            "h" + -(startX - endX - 20) +
            "v" + 25 +
            "h" + 5 +
            "L" + (endX + 20) + ',' + (endY) +
            "L" + (endX + 15) + ',' + (endY - 10) +
            "h" + (5);
    }
    //Arrow - Decision to Vertical Element
    drawArrow2(startX, startY, endX, endY, type) {

        var qVH = 3;
        startX += 50;
        if (type === 'decision') {
            startY += 75;
            return "M" + startX + "," + startY +
                "v" + (endY - startY - this.state.defElHeight / 2) +
                "h" + 5 +
                "L" + (startX) + ',' + (endY - this.state.defElHeight / 2 + 5) +
                "L" + (startX - 5) + ',' + (endY - this.state.defElHeight / 2) +
                "h" + (5);
        } else {
            startY += 50;
            return "M" + startX + "," + startY +
                "v" + (endY - startY - this.state.defElHeight / 2 - 20) +
                "h" + 5 +
                "L" + (startX) + ',' + (endY - this.state.defElHeight / 2 + 5 - 20) +
                "L" + (startX - 5) + ',' + (endY - this.state.defElHeight / 2 - 20) +
                "h" + (5);
        }

    }

    //Arrow - bottom to top left
    drawArrow3(startX, startY, endX, endY) {
        var qVH = 3;
        endX += this.state.junctionOperatorRadius;
        startY += this.state.defElHeight / 2;
        endY += 2 * this.state.junctionOperatorRadius + 8;
        return "M" + startX + "," + startY +
            "h" + (endX - startX) +
            "v" + (endY - startY) +
            "h" + (-5) +
            "L" + (endX) + ',' + (endY - 5) +
            "L" + (endX + 5) + ',' + (endY) +
            "h" + (-5);
    }

    wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                x = text.attr('x'),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    parseJson(jsondata) {
        this.setState({
            totalItemsCnt: Object.keys(jsondata[0]).length
        });
        var connectorsArray = [];
        for (var index in jsondata[0]) {
            connectorsArray.push(Object.keys(jsondata[0][index].connectors).length);
        }
        this.setState({
            'depth': d3.max(connectorsArray)
        });
        this.setState({
            'defElWidth': this.state.width / (this.state.totalItemsCnt - this.state.depth + 1) - this.state.linkWidth
        });
    }

    selectArrow(startX, startY, endX, endY, nodeType) {
        if (startY === endY) {
            if (endX < startX) {
                return this.drawArrow4(startX, startY, endX, endY);
            } else {
                return this.drawArrow(startX, startY, endX, endY, nodeType);
            }
        }

        if (startX === endX) {
            return this.drawArrow2(startX, startY, endX, endY, nodeType);
        }

        if ((endX < startX) && (endY < startY)) {
            return this.drawArrow3(startX, startY, endX, endY);
        }
    }
    drawElement(context, startX, startY, data, step) {
        var nextX, nextY;
        this.state.drawedItemsArray.push(step);
        // step++;        
        switch (data.type) {
            case 'start':
                this.drawRoundRect(context, data.id, startX, startY, this.state.defElWidth, 40, data.title, this.state.defColor);
                break;
            case 'finish':
                this.drawRoundRect(context, data.id, startX, startY, this.state.defElWidth, 40, data.title, this.state.priColor);
                break;
            case 'process-simple':
                this.drawRect(context, data.id, startX, startY, this.state.defElWidth, 40, this.state.defColor, data.title);
                break;
            case 'decision':
                this.drawRhombus(context, data.id, startX, startY, this.state.rhombusRadius, this.state.defColor, 5, data.title);
                break;
            case 'connector-start':
                this.drawConnectorOperator(context, data.id, startX, startY, this.state.defColor, 40, data.title)
                break;
            case 'connector-end':
                this.drawConnectorOperator(context, data.id, startX, startY, this.state.priColor, 40, data.title)
                break;
            case 'or-split':
                this.drawOrSplitOperator(context, data.id, startX, startY, this.state.defColor, 20);
                break;
            case 'junction':
                this.drawJunctionOperator(context, data.id, startX, startY, this.state.defColor, 20);
                break;
            default:
                break;
        }
        
        if (Object.keys(data.connectors).length === 1) {
            var tmpConnector = data.connectors[1];
            var nextStep = tmpConnector.linkTo;
            var nextItemData = this.state.itemsData[0][nextStep];
            if (data.stream === nextItemData.stream) {
                nextX = startX + this.state.defElWidth + this.state.linkWidth + this.state.padding;
                nextY = startY;
            } else {
                nextX = startX;
                nextY = this.state.defStreamHeight * (nextItemData.stream - 1) + this.state.paddingY;
            }

            if (this.state.drawedItemsArray.indexOf(nextStep) === -1) {
                this.drawElement(context, nextX, nextY, nextItemData, nextStep);
            }
        }

        if (Object.keys(data.connectors).length === 2) {
            //1st node
            var tmpConnector = data.connectors[1];
            var nextStep = tmpConnector.linkTo;
            var nextItemData = this.state.itemsData[0][nextStep];
            if (data.stream === nextItemData.stream) {
                nextX = startX + this.state.defElWidth + this.state.linkWidth + this.state.padding;
                nextY = startY;
            } else {
                nextX = startX;
                nextY = this.state.defStreamHeight * (nextItemData.stream - 1) + this.state.paddingY;
            }

            if (this.state.drawedItemsArray.indexOf(nextStep) === -1) {
                this.drawElement(context, nextX, nextY, nextItemData, nextStep);
            }

            //2nd node
            tmpConnector = data.connectors[2];
            nextStep = tmpConnector.linkTo;
            nextItemData = this.state.itemsData[0][nextStep];
            if (data.stream === nextItemData.stream) {
                nextX = startX;
                nextY = startY + 120;
            } else {
                nextX = startX;
                nextY = this.state.defStreamHeight * (nextItemData.stream - 1) + this.state.paddingY;
            }

            if (this.state.drawedItemsArray.indexOf(nextStep) === -1) {
                this.drawElement(context, nextX, nextY, nextItemData, nextStep);
            }
        }
    }

    drawLinks(context, itemsData) {
        for (var index in this.state.itemsData[0]) {
            for (var connector in this.state.itemsData[0][index].connectors) {
                var fromId = this.state.itemsData[0][index].id;
                if (this.state.drawedItemsArray.indexOf(fromId) !== -1) {
                    var startX = d3.select('#item' + fromId).attr('startX');
                    var startY = d3.select('#item' + fromId).attr('startY');
                    var toId = this.state.itemsData[0][index].connectors[connector].linkTo;
                    var endX = d3.select('#item' + toId).attr('startX');
                    var endY = d3.select('#item' + toId).attr('startY');
                    var nodeType = this.state.itemsData[0][index].type;
                    context.append('path').attr("d", this.selectArrow(parseInt(startX), parseInt(startY), parseInt(endX), parseInt(endY), nodeType)).attr("fill", "none");
                }
            }
        }
    }

    drawStreamLayout(context, data) {
        var _this = this;
        var streamsData = data.streams;
        var streamsCnt = Object.keys(streamsData).length;
        this.state.defStreamHeight = this.state.height / streamsCnt;
        var streamsArr = [];
        for (var stream in streamsData) {
            streamsArr.push({
                'id': streamsData[stream].id,
                'order': streamsData[stream].order,
                'title': streamsData[stream].title
            })
        };

        var g_stream_wrapper = context.selectAll(".stream")
            .data(streamsArr)
            .enter().append('g').attr('class', 'stream_wrapper');

        g_stream_wrapper
            .append("rect")
            .attr("class", "stream")
            .attr("x", 0)
            .attr("y", function(d, i) {
                return _this.state.height / streamsCnt * i
            }).attr('rx', 0).attr('width', this.state.width).attr('height', function(d, i) {
                return _this.state.height / streamsCnt;
            }).attr('fill', 'none').attr('stroke', '#ddd').attr('stroke-width', '2px');

        g_stream_wrapper.append('text')
            .attr('x', function(d, i) {
                return -(_this.state.height / streamsCnt * i)
            })
            .attr('y', 0)
            .attr("text-anchor", "middle")
            .attr("dx", "-9.5em")
            .attr("dy", "-1.55em")
            .attr("transform", "rotate(-90)").text(function(d) {
                return d.title
            });
    }
    render() {
        return (<div id="workflow"></div>);
        }
    }

export default WorkflowChart;

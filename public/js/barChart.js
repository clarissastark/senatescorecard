var drawBarChart = function(){

  var results = [
    {party:'Conservative', seats:331 },
    {party:'Labour', seats:232},
    {party:'SNP', seats:56},
    {party:'Liberal Democats', seats:8},
    {party:'DUP', seats:8},
    {party:'Other', seats:15}
  ];

  var gridWidth = 80;
  var gridHeight = 5;
  var layout = d3_iconarray.layout()
  .width(gridWidth)
  .height(gridHeight);
  var width = 600;
  var height = 40;
  var radius = 2.5;
  var margin = { top:radius*2, left:radius*2, bottom:radius*2, right:radius*2 }
  var scale = d3.scaleLinear()
  .range([0, (width-(margin.left + margin.right))])
  .domain([0, gridWidth]);


  console.log(scale.range())

  d3.select('#width-first')
  .selectAll('div.result')
  .data(results)
  .enter()
  .append('div').attr('class','result')
  .call(arrayBars, true);

  d3.select('#height-first')
  .selectAll('div.result')
  .data(results)
  .enter()
  .append('div').attr('class','result')
  .call(arrayBars, false);

  function arrayBars(parent, widthFirst){
    layout.widthFirst(widthFirst);

    parent.append('p')
    .attr('class','bar-label')
    .html(function(d){
      return d.party;
    });

    parent.append('svg')
    .attr('width', width).attr('height', height)
    .append('g')
    .attr('transform','translate('+margin.left+','+margin.top+')')
    .attr('class',function(d){return d.party})
    .selectAll('circle')
    .data(function(d){ return layout( d3.range(0, d.seats, 1) ); })
    .enter()
    .append('circle')
    .attr('cx',function(d){ return scale(d.position.x); })
    .attr('cy',function(d){ return scale(d.position.y); })
    .attr('r', radius)
  }
}

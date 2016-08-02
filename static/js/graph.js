// Queue function makes us await the data

queue()
    .defer(d3.json, "/wages")
    .await(introGraph);

// Variables to store data labels, as the data comes in encoded.

var genders = ["Male", "Female"]
var races = ["non", "Other", "Hispanic", "White"]
var occupations = ["non", "Management", "Sales", "Clerical", "Service", "Professional", "Other"]
var sectors = ["Other", "Manufacturing", "Construction"]
var unions = ["Non union", "Union"]

function introGraph(error, wagesJson) {
    var wages = wagesJson;
    // create wage bands to give us workable bands for graphs.
    wages.forEach(function (d){
        if (d["WAGE"] <= 5) d["wageband"] = 1;
        else if (d["WAGE"] <= 10) d["wageband"] = 2;
        else if (d["WAGE"] <= 15) d["wageband"] = 3;
        else if (d["WAGE"] <= 20) d["wageband"] = 4;
        else if (d["WAGE"] <= 25) d["wageband"] = 5;
        else d["wageband"] = 6;

        // recode numbers to text, again for presentation reasons.
        d["SEX 1=Female 0=Male"] = genders[d["SEX 1=Female 0=Male"]];
        d["RACE 1=Other 2=Hispanic 3=White"] = races[d["RACE 1=Other 2=Hispanic 3=White"]];
        d['OCCUPATION 1=Management 2=Sales 3=Clerical 4=Service 5=Professional 6=Other'] = occupations[d['OCCUPATION 1=Management 2=Sales 3=Clerical 4=Service 5=Professional 6=Other']]
        d['SECTOR 0=Other 1=Manufacturing 2=Construction'] = sectors[d['SECTOR 0=Other 1=Manufacturing 2=Construction']]
        d['UNION 1=Union member 0=Not union member'] = unions[d['UNION 1=Union member 0=Not union member']]

    })

    var ndx = crossfilter(wagesJson);


    // A basic display of the wages (grouped). This allows us to see quickly
    // the effect of any part of the data when filtering for gender or whatever.
    var avgWages = ndx.dimension(function (d) {
        return d["wageband"];
    })
    var avgWagesGroup = avgWages.group();
    var avgWagesChart = dc.barChart("#overview");
    avgWagesChart
        .width(600)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(avgWages)
        .group(avgWagesGroup)
        .transitionDuration(500)
        .elasticY(false)
        .xAxisLabel("Wage")
        .x(d3.scale.linear().domain([1,7]))
        //.x(d3.scale.ordinal().domain(["<=5", "<=10", "<=15", "<=20", "<=25", ">25"]))
        //.xUnits(dc.units.ordinal("5", "10", "15", "20", "25", "30"))
        .yAxis().ticks(6);


    // Pie charts displaying the various basic break downs of the sample group. Gender, Race, occupation etc.
    var gender = ndx.dimension(function (d) {
        return d["SEX 1=Female 0=Male"]
    })
    var groupGender = gender.group();
    var genderChart = dc.pieChart("#gender");
    genderChart
        .height(220)
        .radius(90)
        .transitionDuration(750)
        .dimension(gender)
        .group(groupGender);



    var race = ndx.dimension(function (d) {
        return d["RACE 1=Other 2=Hispanic 3=White"]
    })
    
    var groupRace = race.group();
    var raceChart = dc.pieChart("#race");
    raceChart
        .height(220)
        .radius(90)
        .transitionDuration(1000)
        .dimension(race)
        .group(groupRace);

// This chart gave little useful information.

    // var married = ndx.dimension(function (d) {
    //     return d['MARR 0=Unmarried 1=Married']
    // })
    // var groupMarried = married.group();
    // var marriedChart = dc.pieChart("#married");
    // marriedChart
    //     .height(440)
    //     .width(440)
    //     .radius(180)
    //     .innerRadius(95)
    //     .transitionDuration(1000)
    //     .dimension(married)
    //     .group(groupMarried);


    var occupation = ndx.dimension(function (d) {
        return d['OCCUPATION 1=Management 2=Sales 3=Clerical 4=Service 5=Professional 6=Other']
    })
    var groupOccupation = occupation.group();
    var occupationChart = dc.pieChart("#occupation");
    occupationChart
        .height(220)
        .radius(90)
        .transitionDuration(750)
        .dimension(occupation)
        .group(groupOccupation);


    var sector = ndx.dimension(function (d) {
        return d['SECTOR 0=Other 1=Manufacturing 2=Construction']
    })
    var groupSector = sector.group();
    var sectorChart = dc.pieChart("#sector");
    sectorChart
        .height(220)
        .radius(90)
        .transitionDuration(750)
        .dimension(sector)
        .group(groupSector);


    var occupationBar = dc.barChart("#occupationBar");
    occupationBar
        .width(600)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(occupation)
        .group(groupOccupation)
        .transitionDuration(500)
        .elasticY(false)
        .xAxisLabel("Employment type")
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .yAxis().ticks(6);


    var union = ndx.dimension(function (d) {
        return d['UNION 1=Union member 0=Not union member']
    })
    var groupUnion = union.group();
    var unionChart = dc.pieChart("#union");
    unionChart
        .height(220)
        .radius(90)
        .transitionDuration(750)
        .dimension(union)
        .group(groupUnion);

    // An average of wages by employment type. To be applied to the employment type bar chart.

    var occwage = occupation.group()
        .reduce(
            function reduceAdd(p, d) {
                ++p.count;
                p.total += d["WAGE"]
                return p;
            },
            function reduceRemove(p, d) {
                --p.count;
                p.total -= d["WAGE"]
                return p;
            },
            function reduceInit() {
                return {count:0, total:0};
            });

    var occwageChart = dc.barChart("#avgoccwage");
    occwageChart
        .width(600)
        .height(300)
        .dimension(occupation)
        .group(occwage)
        .elasticY(true)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Average wage")
        .valueAccessor(function (p) {
            // console.log(p)
            return p.value.total / p.value.count;
        });

    var occwageLineChart = dc.lineChart("#avgoccwageline")
    occwageLineChart
        .width(600)
        .height(300)
        .dimension(occupation)
        .group(occwage)
        .elasticY(true)
        .colors('red')
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Average wage")
        .valueAccessor(function (p) {
            // console.log(p)
            return p.value.total / p.value.count;
        });


    var lastChart = dc.compositeChart("#lastChart")

    lastChart
        .width(600)
        .height(300)
        .shareTitle(false)
        .elasticY(false)
        .group(groupOccupation)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Average wage")
        // .compose([occupationBar,
        //     occwageLineChart.useRightYAxis()
        // ])
        .compose([
            occupationBar
            ,
            occwageLineChart.useRightYAxis(true)
                ])
        .yAxisLabel("Number of employees")
        .rightYAxisLabel("Average Wage");


  //      .valueAccessor(function (p) {
  //          // console.log(p)
  //          return p.value.total / p.value.count;
  //      });


    dc.renderAll();
}

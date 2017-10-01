var ctx = document.getElementById("myChart").getContext('2d');
var ctxWicket = document.getElementById("myChartWicket").getContext('2d');
var myChart;
var myChartWicket;
var chartData;
function loadCharts(data){
    chartData = getChartDataByOver(data)
    console.log("total- "+chartData.totalScore)
    console.log("score-"+chartData.score)
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
            {
                label: 'Score',
                data: chartData.totalScore,
                borderColor: 'green',
                borderWidth: 2,
                type: 'line',
                fill: false,
                yAxisID: 'left'
            },
            
            {
                label: 'Score By Over',
                data: chartData.score,
                backgroundColor: '#58bbcf',
                borderWidth: 1,
                yAxisID: 'right'
            }

            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                yAxes: [{
                    id: 'left',
                    position: 'left',
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    },
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    } 
                },
                {
                    id: 'right',
                    position: 'right',
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    },

                }]
            }
        }
    });

    myChartWicket = new Chart(ctxWicket, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [
            /*{
                label: 'Wickets',
                data: chartData.totalWickets,
                backgroundColor: 'red',
                borderWidth: 2,
                type: 'line',
                fill: false,
                yAxisID: 'right'
            },*/
            {
                label: 'Wickets By Over',
                data: chartData.wickets,
                backgroundColor: 'brown',
                borderWidth: 1,
                yAxisID: 'left'
            }

            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            scales: {
                yAxes: [{
                    id: 'left',
                    position: 'left',
                    ticks: {
                        beginAtZero:true,
                        steps: 1,
                        max:10,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    }
                }/*,
                {
                    id: 'right',
                    position: 'right',
                    ticks: {
                        beginAtZero:true
                    }
                }*/]
            }
            /*animation: {
                onComplete: function () {
                    var ctx = this.chart.ctx;
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
                    ctx.fillStyle = "black";
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset)
                    {
                        for (var i = 0; i < dataset.data.length; i++) {
                            for(var key in dataset._meta)
                            {
                                var model = dataset._meta[key].data[i]._model;
                                ctx.fillText(dataset.data[i], model.x, model.y - 5);
                            }
                        }
                    });
                }
            }*/
        }
    });
}

function getChartDataByBall(data){
    var chartData={}
    var labels=[];
    var score=[];
    for(var i=0; i<20;i++) {
        $.each(data.overs[i], function( index, ball ) {
            labels.push(ball.ball)
            score.push(ball.score)
        });    
    }
    chartData["labels"]=labels
    chartData["score"]=score

    return chartData
}

function getChartDataByOver(data){
    var chartData={}
    var labels=[];
    var score=[];
    var runRates=[]
    var wickets=[]
    var totScoreArr=[]
    var totWicketsArr=[]
    var totScore=0
    var totWickets=0

    for(var i=0; i<20;i++) {
        var runRate=0
        if(totWickets<10){
            labels.push(i+1)
            var bscore=0
            var bwicket=0
            var over = i
            //console.log("over="+ over)
            $.each(data.overs[over], function( index, ball ) {
                if(ball.score>0){
                    bscore=bscore+parseInt(ball.score)
                    //console.log("bscore="+ bscore)
                }
                if(ball.wicket){
                    bwicket =bwicket+1
                    //console.log("bwicket="+ bwicket)
                }
            }); 
            var oversComplete = (data.oversComplete).toString()
            if(oversComplete.indexOf(".") !== -1){
                oversComplete = oversComplete.split('.')[0]
                oversComplete = parseInt(oversComplete)+1
            }else{
                oversComplete = parseInt(oversComplete)
            }
            var currentOver = i+1;
            if(currentOver <= oversComplete){
                totScore=totScore+bscore
                totScoreArr.push(totScore)
                runRate = (totScore/(i+1)).toFixed(2)
                console.log(totScore+"/"+(i+1)+"="+runRate)
                score.push(bscore)   
                wickets.push(bwicket)
                totWickets = totWickets + bwicket
                totWicketsArr.push(totWickets)
                runRates.push(runRate)
            }
        }
    }
    chartData["labels"]=labels
    if(score.length==1){
        score.push(0)
    }
    chartData["score"]=score
    if(wickets.length==1){
        wickets.push(0)
    }
    chartData["wickets"]=wickets
    chartData["runRates"]=runRates
    chartData["totalScore"]=totScoreArr
    chartData["totalWickets"]=totWicketsArr
    return chartData
}

function refreshCharts(data){
    myChart.destroy()
    myChartWicket.destroy();
    loadCharts(data)
}
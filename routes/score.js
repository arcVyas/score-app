var express = require('express');
var http = require('http');
var db = require('./dbo.js')

module.exports = function(router, io){

  router.get('/matches/:matchId/scorecard', function(req, res, next) {
    db.getScoreCard(req.params.matchId, function(scoreCard){
        if(scoreCard==null){
          res.send('Match not found. Matches are typically created on the day of the match!')
        }else{
          res.render('./scorecard-display', { title: req.params.matchId, data: splitToOvers(scoreCard) });
        }
    });
  });

  router.get('/matches/:matchId/scorecard/record', function(req, res, next) {
    if(req.query.key == process.env.RECORDER_KEY){
      db.getScoreCardOrCreate(req.params.matchId, function(scoreCard){
          res.render('./scorecard', { title: req.params.matchId, data: splitToOvers(scoreCard) });
      });
    }else{
      res.status(401)
      res.send("Invalid Key")
    }
  });

  router.get('/matches/:matchId/scorecard/json', function(req, res, next) {
    db.getScoreCard(req.params.matchId, function(scoreCard){
        res.send(splitToOvers(scoreCard));
    });
    
  });

  router.get('/matches/:matchId/scorecard/balls/:id', function(req, res, next) {
    db.getBallScore(req.params.matchId, req.params.id, function(ballScore){
        if(!ballScore){
          res.send(404)
        }else{
          res.send(ballScore)
        }
    });
  });

  router.post('/matches/:matchId/scorecard/balls/:id', function(req, res, next) {
    var ballId = req.params.id;
    var score = req.body.score;
    var scoreLog = req.body.scoreLog;
    var wicket = req.body.wicket;
    if(!wicket || wicket=="false"){
      wicket=false
    }else if(wicket=="true"){
      wicket=true
    }
    //console.log("POST score: "+ ballId +"-"+ score +"-"+ scoreLog+"-"+wicket)
    db.updateBallScore(req.params.matchId, ballId, score, scoreLog, wicket,function(updatedBall){
      if(!updatedBall){
        res.send(500)
      }else{
        res.send(200)
        db.getScoreCard(req.params.matchId, function(scoreCard){
          //console.log("emiting updates...")
          //console.log(scoreCard.totalScore)
          io.sockets.emit('update score',splitToOvers(scoreCard));
          //console.log("emited...")
        });
      }
    })
  });

  function splitToOvers(scoreCard){
    var response={}
    response["matchId"]= scoreCard.matchId
    if(!scoreCard.totalScore){
      response["totalScore"]=0
    }else{
      response["totalScore"]=scoreCard.totalScore
    }
    if(!scoreCard.wickets){
      response["wickets"]=0
    }else{
      response["wickets"]=scoreCard.wickets
    }
    var oversComplete=0
    var overByOver={}
    scoreCard.ballByBall.forEach(function(ballObj){
      var ball= ballObj.ball
      var over = ball.split(".")[0]
      var ballsInOver = []
      ballsInOver = overByOver[over]
      if(!ballsInOver){
        ballsInOver=[]
      }
      if(ballObj.score>=0){
        if(ballObj.ball.split(".")[1]>=6)
          oversComplete=parseInt(ballObj.ball.split(".")[0])+1
        else
          oversComplete=parseInt(ballObj.ball.split(".")[0])+"."+ballObj.ball.split(".")[1]
      }
      ballsInOver.push(ballObj)
      overByOver[over]=ballsInOver
    })
    response["overs"]=overByOver
    response["oversComplete"]=oversComplete
    var rrate=0.00
    var oversCompleteTemp=oversComplete.toString()
    if(oversCompleteTemp.indexOf(".") !== -1){
      //console.log("vyas"+oversCompleteTemp)
      oversCompleteTemp= parseInt(oversCompleteTemp.split('.')[0])
    }
    if(oversCompleteTemp>0){
      rrate = (parseInt(scoreCard.totalScore)/parseInt(oversCompleteTemp)).toFixed(1)
    }
    response["runRate"]=rrate
    return response
  }
}


var mongoose = require('mongoose');
console.log(process.env.MONGO_USER)
mongoose.connect('mongodb://'+process.env.MONGO_USER+':'+process.env.MONGO_PWD+'@gmc-shard-00-00-izun8.mongodb.net:27017,gmc-shard-00-01-izun8.mongodb.net:27017,gmc-shard-00-02-izun8.mongodb.net:27017/eleven?ssl=true&replicaSet=gmc-shard-0&authSource=admin');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('DB Connected')
});

var scoreSchema = mongoose.Schema({
    matchId: String,
    totalScore: Number,
    wickets: Number,
    ballByBall: [
      {
        ball: String,
        score: Number,
        scoreLog: String,
        wicket: Boolean
      }
    ]
});

var Score = mongoose.model('Score', scoreSchema);

module.exports = {
  getScoreCardOrCreate: function (matchId, _callback){
    Score.findOne({ matchId: matchId }, function (err, doc){
      if (!doc) {
        var ballByBall=[]
        for(var i=1;i<=20;i++){
          for(var j=1;j<=6;j++){
            var ball = {}
            ball["ball"]=i+"."+j
            ball["wicket"]=false
            ballByBall.push(ball)
          }
        }
        var score = new Score({matchId:matchId, ballByBall:ballByBall})
        score.save(function (err, scoreCard) {
          _callback(scoreCard)
        });
      }
      else{
        _callback(doc)
      }
    });
  },

  getScoreCard: function (matchId, _callback){
    Score.findOne({ matchId: matchId }, function (err, doc){
      if (!doc) {
       _callback(null)
      }else{
        _callback(doc)
        console.log("Found...")
      }
    });
  },

  getBallScore : function(matchId, ballId, _callback){
    console.log("Searching for matchId="+matchId+"; and ballId="+ballId)
    Score.findOne({ matchId: matchId, 'ballByBall.ball': ballId}, {'ballByBall.$': 1} , function (err, doc){
      if (!doc) {
        _callback(null)
      }else{
        _callback(doc)
      }
    });
  },

  updateBallScore : function(matchId, ballId, score, scoreLog,wicket, _callback){
    console.log("Updating for matchId="+matchId+"; and ballId="+ballId+ ";score="+score+";scoreLog="+scoreLog+";wicket="+wicket)
    var ballScore ={}
    ballScore["ball"]=ballId
    ballScore["score"]=parseInt(score)
    ballScore["scoreLog"]=scoreLog
    Score.update({ matchId: matchId, 'ballByBall.ball': ballId}, { 
        "$set": {
            "ballByBall.$.score": parseInt(score),
            "ballByBall.$.scoreLog": scoreLog,
            "ballByBall.$.wicket": wicket
        }
    }, function (err, doc){
      if (!err) {
        Score.findOne({ matchId: matchId }, function (err, doc2){
          if (!doc2) {
            _callback(true)
          }
          var totalScore=0
          var wickets=0
          doc2.ballByBall.forEach(function(ball){
            if(!(!ball.score)){
              totalScore=totalScore+ball.score
            }
            if(!(!ball.wicket) && ball.wicket){
              wickets=wickets+1
            }
          })
          doc2.totalScore=totalScore
          doc2.wickets=wickets
          doc2.save(function(err, doc3){
            _callback(true)
          })
          
        });
      }else{
        console.log(err)
        _callback(false)
      }
    });
  },

  createScoreCard: function (matchId,_callback){
    var score = new Score({matchId:matchId, score:[]})
    score.save(function (err, scoreCard) {
      _callback(scoreCard)
    });
  },

  updateScoreCard: function (matchId,ball,_callback){
    Score.findOne({matchId:matchId, ballByBall:ball}, function (err, doc){
      if (!doc) {
          doc.ballByBall.push(ball)
      }else{
        //doc.update ball
      }
    });
  }
}

function calculateScore(matchId, _callback){
  
}


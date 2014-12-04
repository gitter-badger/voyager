module.exports = function(engine){
  engine.filter('AnswerProblem', function(track, callback){
    var _ = engine._;
    var a = engine.filterAttribute(track, [
      'ProblemId',
      'ChapterId' ,
      'LessonId',
      'timestamp',
      'Correct',
      'ThinkTime',
      'Answer',
      'CheckExplanationOrNot',
      'isReview'
    ]);
    if(a){
      engine.cache.hget('chapter:' + track.ChapterId, 'lesson:' + track.LessonId, function(err, str){
        var lesson = JSON.parse(str);
        if(!lesson) return callback('lesson is null');
        var problems = _.flatten(_.map(lesson.activities, function(activitiy){
          return activitiy.problems;
        }));
        var problem = _.findWhere(problems, { _id: a.ProblemId });
        if(problem){
          switch(problem.type){
            case 'singlechoice':
              var choice = _.findWhere(problem.choices, { body: a.Answer });
              if(choice){
                a.Answer = [ choice._id ];
              }
              break;
            case 'multichoice':
              a.Answer = _.map(_.compact(_.map(a.Answer, function(choice){
                return _.findWhere(problem.choices, { body: choice });
              })), function(choice){
                return choice._id;
              });
              break;
            case 'singlefilling':
              //nothing.
              break;
          }
          callback(err, a);
        }else{
          callback('AnswerProblem: can not found problem.');
        }
        //console.log(a.Answer);
      });
    }else{
      callback(null);
    }
  });
};

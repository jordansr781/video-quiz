
console.log(document.getElementById('vid').currentTime);

// ADD JS for source. don't have it in html

// BOILERPLATE ------------------------------------------

// I assume the questions are in order by timestamp when given to this program.

var JSON_string = getJSON(); //replace with afunction that actually retrives a JSON string from database
var quiz_data = JSON.parse(JSON_string);
var url = quiz_data.url;
var questions = quiz_data.questions;

var vid = document.getElementById('vid');
vid.src = url;

$('#vid').addClass('opaque');
createPlayButton();
$(document).on('click', 'input[name=choices]', function() {
	if ($('#quiz').find('#noSelection').length) {
		$('#noSelection').fadeOut();
		setTimeout(function() {$('#noSelection').remove();}, 1000)
	}
})

function getJSON() {
	class Question {
		constructor(number, question_text, choices, answer, timestamp) { // later add time for when you want it to play in the video
			this.number = number;
			this.question_text = question_text;
			this.choices = choices;
			this.answer = answer; // array position of the correct answer
			this.timestamp = timestamp;
		}
	}
	var number = 1;
	var question_text = "Fill in the blank: Let's get down to business to defeat the ______?'";
	var choice0 = 'enemy';
	var choice1 = 'sports team';
	var choice2 = 'monsters';
	var choice3 = 'Huns';
	var choices = [choice0, choice1, choice2, choice3];
	var answer = 3;
	var timestamp = 8;
	var first_question = new Question(number, question_text, choices, answer, timestamp);

	var number = 2;
	question_text = 'Who is the voice of Mushu?'
	choice0 = 'Mike Meyers';
	choice1 = 'Eddie Murphy';
	choice2 = 'David Spade';
	choice3 = 'David Hasselhoff'
	choices = [choice0, choice1, choice2, choice3];
	answer = 1;
	timestamp = 16;

	var second_question = new Question(number, question_text, choices, answer, timestamp);

	var number = 3;
	question_text = 'Is he hot or not?'
	choice0 = 'Yes.';
	choice1 = 'Nah.';
	choices = [choice0, choice1];
	answer = 0;
	timestamp = 26;
	


	var third_question = new Question(number, question_text, choices, answer, timestamp);

	var number = 4;
	question_text = 'Who is the singing voice for Li Shang?'
	choice0 = 'Donny Osmond';
	choice1 = 'Justin Bieber';
	choice2 = 'Ozzy Osbourne';
	choice3 = 'David Hasselhoff'
	choices = [choice0, choice1, choice2, choice3];
	answer = 0;
	timestamp = 30;

	var fourth_question = new Question(number, question_text, choices, answer, timestamp);

	var questions = [first_question, second_question, third_question, fourth_question];


	var url = 'mulan.mp4'; // This will change when adding JSON
	var quiz_data = {
		url: url,
		questions: questions
	};

	return JSON.stringify(quiz_data);
}

function createPlayButton() {
	$('#quiz').append('<button id="playvid" class="button" onclick="play()">Start <i class="fas fa-play" id="play"></i></button>')
}
function populateQuestionsDiv(question) {
	var question_header = '<div class="questionHeader"><div class="questionTitle">Question #<span id="question_number">' + question.number + '</span></div>'
	 	+ '<div id="questionText">' + question.question_text + '</div></div>';
	 $(question_header).hide().appendTo('#quiz').fadeIn();

	var choices = '';
	for (var i = 0; i < question.choices.length; i++) {
		choices += '<input type="radio" class="choice" name="choices" id="choice' + i + '">' +  question.choices[i] + '<br>';
	}
	var submitButton = ('<input id="submitButton" type="submit" onclick="submitAnswer()"></div>');
	$('<div id="choices">' + choices + submitButton + '</div>').hide().appendTo('#quiz').fadeIn();
}

function clearQuiz() {
	$('#quiz').empty();
	$('#quiz').toggle();
}
function play(question) {

	if (question === undefined) {
		// This is the FIRST QUESTION. This is only true because play button is disabled during play.
		question = questions[0];
	}

	var time_segment = (question.timestamp - vid.currentTime) * 1000; // this converts to miliseconds used in timeout functions

	$('#vid').removeClass('opaque');
	$('#playvid').fadeOut();
	setTimeout(function() {
		vid.pause();
		$('#vid').addClass('opaque');
		$('#quiz').fadeIn();

		// display the question
		populateQuestionsDiv(question);

	}, time_segment) 
	vid.play();
}

function submitAnswer() {

	if ($('#choices input[name=choices]:checked')[0] === undefined) { // no choice selected
		if (!$('#choices').find('#noSelection').length) {
			$('#quiz').append('<div id="noSelection" class="warning">No answer selected. Please select one of the options above and press submit.</div>');
		}
		return;
	}
	var question_number = parseInt($('#question_number').text()) - 1; // -1 because question array starts at 0
	var correct_choice = 'choice' + questions[question_number].answer.toString();
	var answer_chosen = $('#choices input[name=choices]:checked')[0].id; // only one element returned, radio button only one can be selected


	if (correct_choice === answer_chosen) { // Answer is correct. Display and resume or end quiz
		questions[question_number].correct = true;
		$('#choices').hide();
		$('<div id="questionResult"><span>Correct! </span></div>').hide().appendTo('#quiz').fadeIn();

		$('#' + answer_chosen).addClass('correct');

		if (questions.length > question_number + 1) { // resume video
			$('#questionResult').append('<br><span> Resuming Quiz</span> <i class="fas fa-spinner fa-spin spin"></i>')
			$('#quiz').fadeOut(2500);
			setTimeout(function() {
				clearQuiz();
				vid.currentTime = questions[question_number].timestamp;
				$('#vid').removeClass('opaque');
				play(questions[question_number + 1]);
			}, 2600)
			
		}
		else { // End Quiz
			endQuiz();
			console.log('the end');
		}

	}
	else { // choice was incorrect. display incorrect and give choice to rewatch segment or continue
		var incorrectText = '<div id="questionResult"><div class="incorrect">Incorrect response</div>';
		var showCorrectButton = '<button class="button" onclick="showCorrect(' + question_number + ')">View correct answer and continue</button>'
		var tryAgainButton = '<button class="button" onclick="rewatchSegment('+ question_number + ')">Watch segment and try again?</button></div>'
		$('#choices').hide();
		$(incorrectText + ' ' + showCorrectButton + ' ' + tryAgainButton).hide().appendTo('#quiz').fadeIn();
	}

}

function showCorrect(question_number) {
	var question = questions[question_number];
	var correctChoice = question.choices[question.answer];
	$('#questionResult').empty();
	$('<div class="correctAnswer">The correct answer was: <br> "' + correctChoice + '"</div>').hide().appendTo('#questionResult').fadeIn();
	$('<div><span> Resuming Quiz</span> <i class="fas fa-spinner fa-spin"></i></div>').hide().appendTo('#questionResult').fadeIn();
	questions[question_number].correct = false;
	$('#quiz').fadeOut(3000);
	setTimeout(function() {
		$('#quiz').fadeOut;
		clearQuiz();
		if (question_number + 1 < questions.length) {
			$('#vid').removeClass('opaque');
			play(questions[question_number + 1]);
		}
		else {
			// end of quiz
			endQuiz();
			console.log ('the end ')
		}
	}, 3100)
}

function rewatchSegment(question_number) {
	$('#quiz').fadeOut();
	setTimeout(function() {
	clearQuiz();
	if (question_number > 0) {
		vid.currentTime = questions[question_number-1].timestamp;
	}
	else {
		vid.currentTime = 0;
	}
	$('#vid').removeClass('opaque');
	play(questions[question_number]);
	},700)
	
}

function endQuiz() {
	var score;
	var correct_responses = 0;
	for (var i = 0; i < questions.length; i++) {
		if(questions[i].correct) {
			correct_responses++;
		}
	}
	score = Math.round((correct_responses / questions.length) * 100); // rounded to the nearest integer
	$('#quiz').empty();
	$('#quiz').show();
	var quiz_results = '<div id="quizResults"><span class="questionTitle endTitle">End of Quiz!</span>' 
		+ '<div id="score">Score: ' + score + '%</div>' 
		+ '<button class="button retake" onclick="restart()">Retake Quiz</button></div>';
	$(quiz_results).hide().appendTo('#quiz').fadeIn();
}

function restart() {
	vid.currentTime = 0;
	$('#quiz').fadeOut();
	setTimeout(function() { 
		clearQuiz();
		$('#quiz').fadeIn();
		createPlayButton();
		$('#playvid').fadeIn();
	}, 800);
}
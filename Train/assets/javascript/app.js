$(document).ready(function(){

	//The train database is assigned to a variable
	var trainDatabase = firebase.database();

	//Gets the train data from the database on first load
	getTrainData();
	
	//Adds the Train to the database when the user clicks submit
	$("#submitData").click(function(){

		writeTrainData($("#tName").val(), $("#tDestination").val(), $("#tFTT").val(), $("#tFrequency").val());

		getTrainData();

	});	


	//Clears the visible schedule and then pulls the schedule from the database
	$("#getAllData").click(function() {

		getTrainData();

	});




	//When called, it writes the train data to the database
	function writeTrainData(trainName, trainDestination, trainFirstTime, trainFrequency) 
	{
		trainDatabase.ref("train/" + trainName).set({

			destination: trainDestination,
			firstTrainTime: trainFirstTime,
			frequency: trainFrequency,

		});
	}



	//Maybe use this to display the data in the database
	function getTrainData()
	{
		//Clears out the table so that data isn't piled up every time this function is called
		$("#sTable").empty();
		//Attatches a header to the table outside of the loop so that it isn't put above every table item
		$("#sTable").append('<tr id="sTableConsistent"><th>Train Name</th><th>Destination</th><th>Frequency (min)</th><th>Next Arrival</th><th>Minutes Away</th></tr>');
		//Sorts the trains in alphabetical order
		var query = trainDatabase.ref("train").orderByKey();
		//Runs for each train
		query.once("value").then(function(snapshot) {
			//Gets the data for each child in the database
			snapshot.forEach(function(childSnapshot) {

				//The time of the train's first arrival
				var trainTime = childSnapshot.val().firstTrainTime;

				//The current time
				var currentTime = moment();

				//Attaches date to time
				var trainTimeConverted = moment(trainTime, "hh:mm").subtract(1, "years");

				//The difference between the current time and the train's first arrival
				var timeDiff = currentTime.diff(trainTimeConverted, "minutes");

				//The time remaining before the next frequency interval is hit
				var timeRemainder = timeDiff % childSnapshot.val().frequency;
				var timeFreqSubtracted = childSnapshot.val().frequency - timeRemainder;
				//The time the next train is arriving
				var finalTime = currentTime.add(timeFreqSubtracted, "m");
				var finalTimeConverted = moment(finalTime, "HH:mm").format("h:mm a");

				//Attatches the train and time data to the HTML table
				$("#sTable").append('<tr><td>'+childSnapshot.key+'</td><td>'+childSnapshot.val().destination+'</td><td>'+childSnapshot.val().frequency+'</td><td>'+finalTimeConverted+'</td><td>'+timeFreqSubtracted+'</td></tr>');
			});

		});


	}


});


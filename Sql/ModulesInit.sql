 insert into
 	public."Modules" ("Name", "Description", "MqttTopic", "CreatedAt")
 values
 	(
 		'firesecurity',
 		'module registering fire security sensor readings',
 		'/firesecuritymodule/values',
 		current_date
 	);

 insert into
 	public."Modules" ("Name", "Description", "MqttTopic", "CreatedAt")
 values
 	(
 		'climatecontrol',
 		'module registering air condition sensor readings',
 		'/climatecontrolmodule/values',
 		current_timestamp
 	);
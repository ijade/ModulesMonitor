 insert into
 	public."modules" ("name", "description", "mqtttopic", "createdat")
 values
 	(
 		'firesecurity',
 		'module registering fire security sensor readings',
 		'/firesecuritymodule/values',
 		current_date
 	)

 insert into
 	public."modules" ("name", "description", "mqtttopic", "createdat")
 values
 	(
 		'climatecontrol',
 		'module registering air condition sensor readings',
 		'/climatecontrolmodule/values',
 		current_timestamp
 	)
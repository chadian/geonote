App = Ember.Application.create();

App.Router.map(function() {
	this.route('add', { path: '/note' });
	this.route('note', { path: '/note/:note_id' });
});

App.Note = Ember.Object.extend({
	note_id: '',
	title: '',
	note: '',
	geoLong: '',
	geoLat: '',
 });

// Persisting data through localStorage layer
App.localStorage = Ember.Object.create({
	init: function() {
		var storage = (typeof localStorage.notes !== undefined && Array.isArray(JSON.parse(localStorage.notes))) ? JSON.parse(localStorage.notes) : [];
		this.set('storage', storage);
  	},
  	saveStorage: function() {
  		localStorage.notes = JSON.stringify(this.get('storage'));
  	},
	saveNote: function(note) {
		var storage = this.get('storage');
		
		if (typeof note.get('noteId') !== 'number') {
			noteId = storage.length;
			note.set('noteId', noteId);
		}

		storage[note.get('noteId')] = note;
		this.saveStorage();
	},
	getNote: function(id) {
		var	storage = this.get('storage');
		var data = storage[id];

		if (typeof data != 'undefined' && Object.keys(data).length) {
			return App.Note.create(data);
		}
		
		return App.Note.create();
	},
	getNotes: function() {

		var storage = this.get('storage');

		var emberStorage = storage.map(function(item, index){
			return App.Note.create(item);
		});

		return emberStorage;
	},
});

/*

	ROUTES 

*/

App.IndexRoute = Ember.Route.extend({
  model: function() {
 	return App.localStorage.getNotes();
  }
});

App.NoteRoute = Ember.Route.extend({
	controllerName: 'edit',
	renderTemplate: function() {
	    this.render('editNote', {
	      into: 'application',
	    });
  	},
  	model: function(params) {
  		return App.localStorage.getNote(params.note_id);
  	}
});

App.AddRoute = Ember.Route.extend({
	controllerName: 'edit',
	renderTemplate: function() {
	    this.render('editNote', {
	      into: 'application',
	    });
  	},
  	model: function() {
  		return App.Note.create();
  	}
});

/*

	CONTROLLERS

*/

App.IndexController = Ember.ArrayController.extend({

});

App.EditController = Ember.ObjectController.extend({

	// note is specified by the 'model' property, set by router
	title: '',
	gpsPolling: false,
	actions: {
		pollGPS: function() {

			if ("geolocation" in navigator) {
				this.set('gpsPolling', true);
				navigator.geolocation.getCurrentPosition(function(position) {
					this.set('model.geoLat', position.coords.latitude);
					this.set('model.geoLong', position.coords.longitude);
					this.set('gpsPolling', false);
				}.bind(this));
			} else {
			  /* geolocation IS NOT available */
			  alert('GeoLocation is not enabled for your browser');
			}
			
		},
		save: function() {
			if (this.model.get('noteId')) {
				App.localStorage.saveNote(this.model);
			} else {
				App.localStorage.saveNote(this.model);
			}
		}
	}

});


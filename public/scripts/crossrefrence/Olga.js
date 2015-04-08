$(function(){
	console.log("got it");

	var Book = Backbone.Model.extend({
	});


	var BookCollection = Backbone.Collection.extend({
		model:Book
	});


	var BookView = Backbone.View.extend({
		 el: 'tbody' ,
		template:function(){
			var model=this.model.toJSON();
			var ids = this.keys;
			return _.template($('#BookTemp').html(), {ids:ids, model:model})
		},
		initialize:function(options){
			this.classy = options.classy;
			this.keys = options.keys;
			// this.render();
		},
		render:function(){
			var self = this;
			this.$el.append(self.template(self.keys));
		}
	});



	var BookCollectionView = Backbone.View.extend({
		template:function(ids){
			var self=this;
			return _.template($('#masterCollection').html(), {ids:ids, classy:self.classy});
		},
		el:'.data',
		initialize:function(options){
			console.log(this);
			this.keys = options.keys;
			this.classy=options.classy;
			console.log(this.collection.length);
			var self = this;
			this.listenTo(self.collection, "add", self.renderBooks)
		},

		render:function(){
			var self = this;
			this.$el.append(self.template(self.keys));

			_.each(this.collection.models, function(model){
				var bookView = new BookView({model:model, classy:self.classy, keys:self.keys})				
				$('.'+self.classy +' tbody').append(bookView.template());
			})
		},

		renderBooks:function(model){
			console.log(model);
		}
	})


	var bookACollection = new BookCollection();







	$('button').on("click", function(e){
		$('.data').html("");
		var textA = $('textarea#textA').val().split("\n");
		var idsA = textA[0].split("\t");

		var keyA = $('input#keyA').val();

		var textB = $('textarea#textB').val().split("\n");
		var idsB = textB[0].split("\t");


		var keyB = $('input#keyB').val();


		//get rid of the id's
		textA.shift();
		//TODO catch the stupid newline in the column title
		var bookACollection= new BookCollection();
		var bookBCollection = new BookCollection();

		_.each(textA, function(x){
			var array = x.split("\t");
			var book = new Book();
			_.each(idsA,function(id, index){
				book.set(id, array[index]);				
			});
			bookACollection.add(book);
		});


		_.each(textB, function(x){
			var array = x.split("\t");	
			var book = new Book();
			_.each(idsB,function(id, index){
				book.set(id, array[index]);
			});
			bookBCollection.add(book)
		});

		console.log(bookACollection);
		console.log(bookBCollection);

		var AValues = bookACollection.pluck(keyB);
		console.log(AValues);
		console.log(keyB);
		var finalCollection = new BookCollection(bookBCollection.filter(function(model){
				return (_.contains(AValues, model.get(keyB))===true && model.get(keyB)!=="");
				}));
			
		var final_Isbn = finalCollection.pluck(keyB);
		var notShown = _.filter(bookACollection.pluck(keyA), function(x){
			return !_.contains(final_Isbn, x);
		});





		console.log(finalCollection, bookBCollection);
		
		var finalCollectionView = new BookCollectionView({
			collection:finalCollection,
			keys:idsB,
			classy:"final"
		});
		finalCollectionView.render();

		if(notShown.length>0){
			var missingArray =[];
			
			_.each(notShown, function(x){
				if (!isNaN(x)){
					var obj = {};			
					obj[keyA] = x;
					missingArray.push(bookACollection.findWhere(obj));
				}
			});
			console.log(missingArray);
			var missingCollection = new BookCollection(missingArray);
			var notShownView = new BookCollectionView({
			 	collection:missingCollection,
			 	keys:idsA,
			 	classy:"missing"
			});
			$('.data').append("<br><h1>BOOKS MISSING <small>from the smaller list</small></h1>");
			notShownView.render();	
		}

	})







})
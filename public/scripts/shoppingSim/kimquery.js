/* # `Query(address, container, data, callback)`
 * 
 * A JavaScript 'class' which wraps the jQuery $.post() 
 * function and adds the ability to output information about 
 * the query to an HTML element and check whether the query 
 * has completed yet.
 *
 * ## Requires
 *  - jQuery >= v2.0.3, _Note_: Older versions of jQuery should work too, but v2.0.3
 *  was used when writing the library.
 *
 * ## Arguments
 *  - `address`   : Web address of the database to interact with
 *  - `container` : Optional jQuery selector to an HTML element for
 *                  displaying query information. Leave a blank string
 *                  if unwanted.
 *  - `data`      : Query data that will be passed, as is, to `$.post()`
 *  - `callback`  : Function to be called when query completes, will be 
 *                  passed the data returned as an argument.
 *
 */
function Query(address,container,data,callback){
    this.address = address;
    this.data = data; // data.query should be a JSON string representing an object, not an actual objet
    this.container = container;
    this.callback = (callback) ? callback : function(res){};
    this.inProgress = false;
}
/* # `Query.send()`
 *
 * Send the query, outputting information about the query 
 * to Query.container and calling the Query.callback when
 * completed.
 *
 */ 
Query.prototype.send = function(){
    this.inProgress = true;
    this.tag = this.showQuery(this.container);
    this.t1 = new Date();
    $.post(this.address,this.data,this.makeCallback());
}
/* # `Query.makeCallback()`
 *
 * __INTERNAL FUNCTION__
 *
 * Wrap the passed in callback function with a function used
 * to tag the output information with the time taken to
 * complete the query once its completed.
 *
 * ## Return
 *
 *  Returns a JavaScript function.
 *
 */
Query.prototype.makeCallback = function(){
    var _this = this;
    return function(res){
        var t2 = new Date();
        var dt = t2.getTime() - _this.t1.getTime();
        _this.tagQueryTime(_this.tag,dt);

        if (res != null){
            if (res.err) {
                console.warn(res.err);
                try {
                    _this.inProgress = false;
                    _this.callback(res);
                } catch(e){
                    console.warn(e);
                }
            } else {
                _this.inProgress = false;
                _this.callback(res);
            }
        } else {
            _this.inProgress = false;
            _this.callback(res);
        }
    }
}
/* # `Query.isInProgress()`
 *
 * Checks whether the query is in progress.
 *
 * ## Return
 *
 *  Boolean.
 */
Query.prototype.isInProgress = function(){
    return this.inProgress;
}
/* # `Query.setCallback(callback)`
 *
 * Change the callback function.
 *
 * ## Arguments
 *  - `callback` : A javascript function.
 *
 * ## Return
 *
 *  No return.
 */
Query.prototype.setCallback = function(callback){
    this.callback = callback;
}
/* # `Query.getCallback()`
 *
 * Retrieve the current callback function.
 *
 * ## Return
 *
 *  A Javascript function.
 */
Query.prototype.getCallback = function(){
    return this.callback;
}
/* # `Query.showQuery(container)`
 *
 * Output query information to the HTML container
 * container. Called automatically by Query.send()
 *
 * ## Arguments
 *  - `container` : A jQuery selector.
 *
 * ## Return
 *
 *  Returns a unique number used as the HTML id
 *  for the <p> element containing the information about 
 *  the query.
 */ 
Query.prototype.showQuery = function(container){
    // Parse time value
    var time = new Date();
    var sec = time.getSeconds().toString();
    if (sec.length < 2) sec = "0" + sec;
    var min = time.getMinutes().toString();
    if (min.length < 2) min = "0" + min;
    var hour = time.getHours().toString(); 
    if (hour.length < 2) hour = "0" + hour;
    time = hour + ":" + min + ":" + sec;

    // Create empty space for lining everything up
    var prefix = '';
    for (var i = 0; i<time.length; i++){
        prefix += '&nbsp;';
    }
    prefix += ' | ';

    // Create a unique tag for marking the completion of the query, to be returned
    var tag = parseInt(Math.random()*10000000);

    // Construct the output
    var output = '<p id="'+tag+'" style="font-family:monospace;">' + time + ' | URI: ' + this.address + '<br>';
    output += prefix + 'Query: ' + this.data.query + '<br>';
    output += prefix + 'Database: ' + this.data.database + '<br>';
    if (this.data.fields){
        output += prefix + 'Fields: ' + this.data.fields + '<br>';
    }
    if (this.data.limit){
        output += prefix + 'Limit: ' + this.data.limit + '<br>';
    }
    if (this.data.distinct){
        output += prefix + 'Distinct: ' + this.data.distinct + '<br>';
    }
    if (this.data.project){
        output += prefix + 'Project: ' + this.data.project + '<br>';
    }
    if (this.data.map){
        output += prefix + 'Map: ' + this.data.map + '<br>';
    }
    if (this.data.reduce){
        output += prefix + 'Reduce: ' + this.data.reduce + '<br>';
    }


    if (typeof QUERY_ADDRESS != 'undefined'){
        var pdata =  QUERY_ADDRESS + '?database=' + this.data.database;
        if (this.data.query){
            pdata += '&query=' + escape(this.data.query); 
        }
        if (this.data.fields){
            pdata += '&fields=' +escape(this.data.fields); 
        }
        if (this.data.limit){
            pdata += '&limit=' + escape(this.data.limit);
        }
        if (this.data.distinct){
            pdata += '&distinct=' + escape(this.data.distinct);
        }
        if (this.data.project){
            pdata += '&project=' + escape(this.data.project);
        }
        if (this.data.map){
            pdata += '&map=' + escape(this.data.map);
        }
        if (this.data.reduce){
            pdata += '&reduce=' + escape(this.data.reduce);
        }

        output += prefix + 'Link: <a href="'+pdata+'" target="_blank">See query at https:\/\/query.openkim.org</a><br>';
    }
    output += 'Loading...<br>';

    // Show the output
    $(container).prepend(output + '</p>');
    if ($(container + ' p').length >=6){
        // Remove the oldest thing from the list
        $($(container + ' p')[$(container + ' p').length - 1])
            .hide('slow', function(){
                $(this).remove()
            }); 
    }

    // Return the tag so the log can be updated upon completion
    return tag;
}
/* # `Query.tagQueryTime(tag, time)`
 *
 * Change 'Loading...' to `time` for the query output <p>
 * with id `tag`.
 *
 * ## Arguments
 *  - `tag`  : The number used to id the <p> element output.
 *  - `time` : The time to show for the query length.
 *
 */
Query.prototype.tagQueryTime = function(tag, time){
    if (this.container){
        try {
            var update = $('#'+tag).html().replace('Loading...','Query took ' + time + ' ms');
            $('#'+tag).html(update);
        } catch(e){
        }
    }
}

/* # `SyncQuery(address, container, data)`
 *
 * A Javascript 'class' that inherits from Query, but
 * performs synchronous, or blocking, queries. Wraps `$.ajax()` 
 * with 'async' set to false.
 *
 * ## Requires
 *  - jQuery >= v2.0.3, _Note_: Older versions of jQuery should work too, but v2.0.3
 *  was used when writing the library.
 *
 * ## Arguments
 *  - `address`   : Web address of the database to interact with
 *  - `container` : Optional jQuery selector to an HTML element for
 *                  displaying query information. Leave a blank string
 *                  if unwanted.
 *  - `data`      : Query data that will be passed, as is, to `$.post()`
 */
function SyncQuery(address, container, data){
    Query.call(this,address,container,data, function(){});
}
SyncQuery.prototype = Object.create(Query.prototype);
SyncQuery.prototype.constructor = SyncQuery;

/* # `SyncQuery.send()`
 *
 * Send the query, outputting information about the query 
 * to Query.container and blocking execution until it is
 * completed.
 *
 */ 
SyncQuery.prototype.send = function(){
    var result;
    this.inProgress = true;
    this.tag = this.showQuery(this.container);
    this.t1 = new Date();
    var _this = this;
    $.ajax({
        url: this.address,
        async: false,
        data: this.data,
        success: function(r){ 
            result = r; 
            _this.makeCallback();
        },
        error: function(e){ 
            result = e; 
            _this.makeCallback();
        }
    });
    var t2 = new Date();
    var dt = t2.getTime() - _this.t1.getTime();
    this.tagQueryTime(this.tag, dt);

    return result;
}

/* # `MultiQuery(queryies, callback)`
 *
 * A JavaScript 'class' which builds on the Query class to provide
 * an interface for sending and managing multiple queries at onces.
 *
 * ## Requires
 *  - jQuery >= v2.0.3, _Note_: Older versions of jQuery should work too, but v2.0.3
 *  was used when writing the library.
 *
 * ## Arguments
 *
 *  - `queries`  : A dictionary whose values are Query objects.
 *  - `callback` : A function to be called when all queries complete.
 *                 Will be passed a dictionary whose keys match those
 *                 of `queries` and whose values are each query's 
 *                 result.
 */
function MultiQuery(queries,callback){
    this.final_callback = (callback) ? callback : function(){};

    this.queries = queries;// {id:query}, a results object is created using the ids, which can then be referred to in the callback function
    this.results = {};
    
    //console.warn(queries);
    for (var key in this.queries){
        this.queries[key].key = key;
        this.queries[key].setCallback(this.makeCallback(queries[key].getCallback()),key); 
    }
}
/* # `MultiQuery.makeCallback()`
 *
 * __INTERNAL FUNCTION__
 *
 * Wrap each query's callback function with a function used
 * to call `MultiQuery.callback()` once all queryies are
 * completed.
 *
 * ## Return
 *
 *  Returns a JavaScript function.
 *
 */
MultiQuery.prototype.makeCallback = function(old_callback,k){
    var multi = this;
    var key = k;
    return function(res){
        old_callback(res);
        multi.results[this.key] = res; // multi refers to the MultiQuery
        for (var qq in multi.queries){
            if (multi.queries[qq].isInProgress()){
                return;
            } else {
            }
        }
        multi.final_callback(multi.results);
    }
}
/* # `MultiQuery.send()`
 *
 * Send the queries, outputting information about each query 
 * to MultiQuery.container and calling `MultiQuery.callback()`
 * when all queries have completed.
 *
 */ 
MultiQuery.prototype.send = function(){
    for (var key in this.queries){
        this.queries[key].send();
    }
}

// Blocking MultiQuery but individual queries are asynchronous
function SyncMultiQuery(queries){
    this.queries = queries; // {id:query}, a results object is created using the ids, which can then be referred to in the callback function
    this.results = {};

    for (var key in this.queries){
        this.queries[key].key = key;
        this.queries[key].setCallback(this.makeCallback(queries[key].getCallback()),key); 
    }
}
SyncMultiQuery.prototype.makeCallback = function(old_callback,k){
    var multi = this; // Using javascript closures to retain access to desired information
    var key = k;
    return function(res){
        old_callback(res);
        multi.results[this.key] = res; // multi refers to the MultiQuery
    }
}
SyncMultiQuery.prototype.isInProgress = function(){
    for (var key in this.queries){
        if (this.queries[key].isInProgress()){
            return true;
        }
    }
    return false;
}
SyncMultiQuery.prototype.send = function(){
    for (var key in this.queries){
        this.queries[key].send();
    }
    while(this.isInProgress()){}; // Blocking
    return this.results;
}


/* # `KimData(address, base_filters, base_fields, html_output_container)`
 *
 * A JavaScript 'class' for providing an interface for simplifying 
 * repeated database calls that vary only slightly from each other
 * and obtaining reference data related to the test result data 
 * being retrieved.
 *
 * Designed for queries requesting both test result data
 * and related reference data. See 
 * `KimData.getReferenceDataFilters()` for more info.
 *
 * Designed with HTML interfaces in mind.
 *
 * Filter keys should valid keys in the database being accessed.
 *
 * ## Requires
 *  - jQuery >= v2.0.3, _Note_: Older versions of jQuery should work too, but v2.0.3
 *  was used when writing the library.
 *
 * ## Arguments
 *  - `address`               : Web address of the database to interact with
 *  - `base_filters`          : Filters that should always be applied to any database call
 *  - `base_fields`           : Fields that should always be retrieved
 *  - `html_output_container` : Optional jQuery selector to an HTML element for
 *                              displaying query information.
 *
 */
function KimData(address, base_filters, base_fields, html_output_container){
    this.address = address;
    
    this.base_fields = {};
    this.base_filters = {};
    this.setBase(base_filters,base_fields);

    this.tr_fields = {};
    this.tr_filters = {};
    
    this.container = (html_output_container) ? html_output_container : "";
    this.fields = {};
    this.filters = {};
    this.limit = null;
    this.database = 'data';
}

/* # `KimData.getData(callback)`
 * 
 * Retrieve data asynchronously from the database
 * and call callback when finished. Will return 
 * the data as an object with two elements, 
 * "tr" and "rd" corresponding to test results
 * and reference data. The value of each will be
 * a the JS object of the data as returned by the 
 * database. 
 *
 * NOTE: To identify relevant reference data, all possible 
 * values for any empty non-base, non-test-result filters
 * are obtained from the database for which the value belongs
 * to one of the test result data which passes all other filters.
 * In other words, for each empty filter, the 'set' of all values 
 * which belong to at least one of the test result data is used.
 *
 * ## Arguments
 *
 *  - `callback`: The function to be called when 
 *            querying is finished. The resulting 
 *            dictionary will be passed in as an 
 *            argument.
 *
 *
 */
KimData.prototype.getData = function(callback){
    // Needs to get reference data too
    this.buildQueries(function(tr_query,rd_query){
//        console.log(tr_query,rd_query);
        var data_query = new MultiQuery({"tr":tr_query,"rd":rd_query},callback); 
        data_query.send();
    });

}

/* # `KimData.getAllFilterOpts(key, callback)`
 * 
 * Retrieve all options for the filter 
 * passed which satisfy only the base filter
 * and call the function passed when 
 * finished, passing in the JS object returned 
 * from the database as an argument.
 *
 * ## Arguments
 *
 *  - `key`         : The database key for which 
 *                unique options should be found.
 *  - `callback`    : The JS function to be called on 
 *                completion.
 *
 *  
 */
KimData.prototype.getAllFilterOpts = function(key,callback){
    var query = new Query(this.address,this.container,{
        query: this.getBaseFilters(),
        distinct: '"'+key+'"',
        database: this.database
    }, callback);

    query.send();
}
// Get filter opts should return all valid options for that key.
// It should be able to modify the values to make them 'work' for
// an HTML filter they're being passed to.
KimData.prototype.getFilterOpts = function(key,callback){
    var query = new Query(this.address,this.container,{
        query: this.getBaseFilters(),
        fields: "{\""+key+"\":1}",
        project: "[\""+key+"\"]",
        database: this.database
    }, callback);

    query.send();
}

/* # `KimData.buildQueries(callback)`
 *
 * __INTERNAL FUNCTION__
 *
 * A helper function to retrieve valid database 
 * queries for test results and reference data. 
 * Passes the resulting queries as JSON strings 
 * to the callback function passed in.
 *
 *
 */
KimData.prototype.buildQueries =  function(callback){
    var tr_query = this.buildTestResultQuery();
    //console.log(tr_query);
    this.buildReferenceDataQuery(tr_query,callback);
}

/* # `KimData.buildTestResultQuery()`
 *
 * __INTERNAL FUNCTION__
 *
 * Get a valid database query as a JSON string
 * for retrieving test result data given all
 * active filters.
 *
 * ## Return
 *
 *  A JSON string.
 *
 */
KimData.prototype.buildTestResultQuery = function(){
    return new Query(this.address,this.container,{
        query: this.getFilters(),
        fields: this.getFields(),
        limit: this.getLimit(),
        database: this.getDatabase()
    },function(){});
}

/* # `KimData.buildTestResultQuery()`
 *
 * __INTERNAL FUNCTION__
 *
 * Get a valid database query as a JSON string
 * for retrieving test result data given all
 * active filters.
 *
 * ## Return
 *
 *  A JSON string.
 *
 */
KimData.prototype.buildSimpleReferenceDataQuery = function(){
    return new Query(this.address,this.container,{
        query: this.getFilters('rd'),
        fields: this.getFields(),
        limit: this.getLimit(),
        database: this.getDatabase()
    },function(){});
}

/* # `KimData.buildReferenceDataQuery(test_result_query, callback)`
 *
 * __INTERNAL FUNCTION__
 *
 * A helper function for constructing a valid
 * database query as a JSON string for retrieving
 * reference data given all active filters and
 * by identifying relevant reference data as 
 * previously described.  
 *
 * ## Arguments
 *  - `test_result_query` : The test result query for which to 
 *             find relevant reference data.
 *  - `callback` : JS function to be called on retrieval of 
 *             actual data from the database. This should
 *             have just been passed along from KimData.getData()
 *
 */
KimData.prototype.buildReferenceDataQuery = function(tr_query,callback){
    var tr_filters = this.getFilters();
    //console.log(tr_query);
    this.getReferenceDataFilters(tr_filters,tr_query,callback);
}

/* # `KimData.processReferenceDataResult(query_result, reference_data_filter_ids)`
 *
 * __INTERNAL FUNCTION__
 *
 * A helper function to process the result from the database
 * from getting all items to filter reference data on.
 *
 * ## Arguments
 *  - `query_result`              : Data received from the database to be 
 *                              processed into a database query object.
 *  - `reference_data_filter_ids` : All valid reference data filter ids.
 *
 */
KimData.prototype.processReferenceDataResult = function(res,rd_filter_ids){
    var rd_filters = {}
    for (var key in res){
        if (res[key] != null){
            rd_filters[key] = new Filter(res[key],rd_filter_ids[key]);
            rd_filters[key] = rd_filters[key].getVal();
        }
    }

    rd_filters["meta.type"]= "rd";
    return rd_filters;
}

/* # `KimData.getReferenceDataIdentifiers()`
 *
 * __INTERNAL FUNCTION__
 *
 * Get all empty non-base and non-test-result 
 * filters and their filter types
 *
 * ## Return
 *  A JS object with the filter names as keys 
 *  and their filter types as values.
 *
 */
KimData.prototype.getReferenceDataIdentifiers = function(){
    // {"key":"type"}
    var rd_ids = {};
    for (var key in this.filters){
        if (this.filters[key].isEmpty()){
            rd_ids[key] = this.filters[key].getType();
        }
    }
    return rd_ids;
}

/* # `KimData.getFilters()`
 *
 * Get a valid database query as a JSON string
 * for filtering data based on all active filters
 * that have at least one item in them.
 *
 * ## Return
 *  
 *  A JSON string.
 *
 */
KimData.prototype.getFilters = function(type){
    if (typeof type == "undefined" || type == "tr"){
        var f = {};
        for (var key in this.base_filters){
            if (!this.base_filters[key].isEmpty()){
                f[key] = this.base_filters[key].getVal();
            }
        }
        for (var key in this.filters){
            if (!this.filters[key].isEmpty()){
                f[key] = this.filters[key].getVal();
            }
        }
        for (var key in this.tr_filters){
            if (!this.tr_filters[key].isEmpty()){
                f[key] = this.tr_filters[key].getVal();
            }
        }
        f["meta.type"] = "tr";

        return JSON.stringify(f);
    } else {
        var f = {};
        for (var key in this.base_filters){
            if (!this.base_filters[key].isEmpty()){
                f[key] = this.base_filters[key].getVal();
            }
        }
        for (var key in this.filters){
            if (!this.filters[key].isEmpty()){
                f[key] = this.filters[key].getVal();
            }
        }
        f["meta.type"] = "rd";

        return JSON.stringify(f);

    }
}

/* # `KimData.getBaseFilters()`
 *
 * Get a valid database query as a JSON string
 * for filtering data based on all base filters
 * that have at least one item in them.
 *
 * ## Return
 *  
 *  A JSON string.
 *
 */
KimData.prototype.getBaseFilters = function(){
    var f = {};
    for (var key in this.base_filters){
        if (!this.base_filters[key].isEmpty()){
            f[key] = this.base_filters[key].getVal();
        }
    }

    f["meta.type"] = "tr";

    return JSON.stringify(f);
}

/* # `KimData.getTestResultFilters()`
 *
 * Get a valid database query as a JSON string 
 * for filtering on all current test result filters
 * with at least one item in them.
 *
 * ## Return
 *  
 *  A JSON string.
 *
 */
KimData.prototype.getTestResultFilters = function(){
    var f = {};
    for (var key in this.tr_filters){
        if (!this.tr_filters[key].isEmpty()){
            f[key] = this.tr_filters[key].getVal();
        }
    }
    return JSON.stringify(f);
}

/* # `KimData.getReferenceDataFilters(test_result_filters, test_result_query, callback)`
 *
 * Construct a valid database query for retrieving reference 
 * data as a JSON string using the method described below. 
 * The resulting reference data query and `test_result_query`
 * are passed to callback, which should be the function passed
 * to `KimData.buildQueries()`
 *
 * _Note_: To identify relevant reference data, all possible 
 * values for any empty non-base, non-test-result filters
 * are obtained from the database for which the value belongs
 * to one of the test result data which passes all other filters.
 * In other words, for each empty filter, the 'set' of all values 
 * which belong to at least one of the test result data is used.
 *
 * ## Arguments
 *  - `test_result_filters`     : Filters which have been and should
 *                            only be applied to test result data.
 *  - `test_result_query`       : The query used to grab test result 
 *                            data, for which we want to find 
 *                            matching reference data.
 *  - `callback`                : A JS function to be called once the 
 *                            the query is constructed. The constructed
 *                            query along with `test_result_query`
 *                            will be passed in as arguments.
 *
 *
 */
KimData.prototype.getReferenceDataFilters = function(tr_filters,tr_query,callback){
    // Get the ids for all filters that have not been manually set,
    // so that they can be used to filter reference data based on 
    // the test result data.
    var rd_filter_ids = this.getReferenceDataIdentifiers();
    var _this=this;

    if (!jQuery.isEmptyObject(rd_filter_ids)){ 
    // If all filters for reference data have been manually set, 
    // this will return an empty object, in which case we don't 
    // need a different query for reference data.
        var queries = {};

        // Construct queries for the ids, these will give 
        // arrays of the possible values that the reference 
        // data can take, given some set of test results.
        for (var key in rd_filter_ids){

            queries[key] = new Query(this.address,"",{
                query: tr_filters,
                distinct: '"'+key+'"',
                database: this.getDatabase()
            },function(){});
        }

        // Javascript closures for retaining 
        // information in callback.
        var trq = tr_query; 
        var cb = callback;

        // Use a MultiQuery to send off all the queries for the different
        // reference data filters. Once they're returned, construct the
        // actual reference data query to be used to get the relevant reference
        // data. Then call the callback passed to getData giving it the test_result
        // query and the reference data query.
        var rd_filters_query = new MultiQuery(queries,function(res){ 
            var rd_filters = _this.processReferenceDataResult(res,rd_filter_ids);
            for (var key in _this.base_filters){
                rd_filters[key] = _this.base_filters[key].getVal();
            }
            for (var key in _this.filters){
                if (!(key in rd_filters)){
                    rd_filters[key] = _this.filters[key].getVal();
                }
            }
            rd_filters = JSON.stringify(rd_filters);
            rd_query = new Query(_this.address,_this.container,{
                    query: rd_filters,
                    fields: _this.getFields(),
                    limit: _this.getLimit(),
                    database: _this.getDatabase()
                }, function(){});
            cb(trq, rd_query);
        });

        rd_filters_query.send();
    } else {
        var rd_query = _this.buildSimpleReferenceDataQuery();
        callback(tr_query,rd_query);
    }
}

/* # `KimData.getFields()`
 *
 * Get a valid database 'fields' object
 * as a JSON string.
 *
 * ## Return
 *  
 *  A JSON string.
 *
 */
KimData.prototype.getFields = function(){
    var fields = {};
    for (var f in this.base_fields){
        fields[f] = this.base_fields[f];
    }
    for (var f in this.fields){
        fields[f] = this.fields[f];
    }
    return JSON.stringify(fields);
}

/* # `KimData.getLimit()`
 *
 * Get the current limit for results returned
 * by the database.
 *
 * ## Return
 *
 *  A number.
 *
 */
KimData.prototype.getLimit = function(){
    return this.limit;
}

/* # `KimData.getDatabase()`
 *
 * Get the name of the database currently in
 * use. 
 *
 * ## Return
 *
 *  A string.
 *
 */
KimData.prototype.getDatabase = function(){
    return this.database;
}

/* # `KimData.setFilters(filters)`
 *
 * Set the values of multiple filters at once,
 * overwriting previous values if the filters
 * exist and creating new filters if they don't.
 *
 * ## Arguments
 *  - `filters` : A JS object where the key is the filter
 *            id to be set and the value can be either
 *            a string for a single value, an array for
 *            multiple values, or an object with two keys,
 *            'type' whose value should be a filter type 
 *            and 'values' whose value should be either a
 *            string or array as described above. Ex:
 *             
 *            {
 *              "meta.type":"tr", 
 *              "meta.subject.type":["tr","rd"],
 *              "meta.species":{"type":"OR","values":["Si","Fe"]}
 *            }
 *
 *
 *
 */
KimData.prototype.setFilters = function(filters){
    for (var key in filters){
        this.filters[key] = new Filter(filters[key]);
    }
}

/* # `KimData.setTestResultFilters(filters)`
 *
 * Same as above, except only for test result filters.
 *
 * ## Arguments
 *  - `filters` : A JS object where the key is the filter
 *            id to be set and the value can be either
 *            a string for a single value, an array for
 *            multiple values, or an object with two keys,
 *            'type' whose value should be a filter type 
 *            and 'values' whose value should be either a
 *            string or array as described above. Ex:
 *             
 *            {
 *              "meta.runner.kimcode":"MyKimTest", 
 *              "meta.subject.kimcode":["YourKimModel","MyKimModel"],
 *              "meta.subject.driver.kimcode":{"type":"OR","values":["YourKimModel","MyKimModel"]}
 *            }
 *
 *
 */
KimData.prototype.setTestResultFilters = function(filters){
    for (var key in filters){
        this.tr_filters[key] = new Filter(filters[key]);
    }
}

// Backwards Compatibility 
KimData.prototype.setFilter = function(filter){
    this.setFilters(filter);
}

// Backwards Compatibility
KimData.prototype.setTestResultFilter = function(filter){
    this.setTestResultFilters(filter);
}

/* # `KimData.addFilter(key, value, type)`
 *
 * Create a new filter with the key, value and type specified.
 *
 * ## Arguments
 *  - `key`   : Filter key to use. 
 *  - `value` : Values to have initially in the filter.
 *  - `type`  : Type of filter. OR and AND have been implemented.
 *
 *
 */
KimData.prototype.addFilter = function(key, value, type){
    this.filters[key] = new Filter(value,type);
}

/* # `KimData.addTestResultFilter(key, value, type)`
 *
 * Same as KimData.addFilter() except for test result filters.
 *
 */
KimData.prototype.addTestResultFilter = function(key, value, type){
    this.tr_filters[key] = new Filter(value,type);
}

/* # `KimData.removeFilter(key)`
 *
 * Remove all active values from the filter
 * and delete the filter and its key.
 *
 * ## Arguments
 *  - `key` : The key of the filter to be removed.
 *        Can be a test result or regular filter.
 *
 * ## Return
 *  
 *  Returns whether the filter was removed. If 
 *  the key does not exist, returns false.
 *
 */
KimData.prototype.removeFilter = function(key){
    if (key in this.filters){
        return delete this.filters[key];
    } else if (key in this.tr_filters){
        return delete this.tr_filters[key];
    } else {
        return false;
    }
}

/* # `KimData.addFilterVal(key, value)`
 *
 * Adds a value to the filter specified by the key.
 * Can be either a regular filter or a test result
 * filter.
 *
 * ## Arguments
 *  - `key`   : The key of the filter to add the value to.
 *  - `value` : The filter value to be added.
 *
 * ## Return
 *
 *  Returns true if the value was added to the filter
 *  and false if the filter does not exist.
 *
 */
KimData.prototype.addFilterVal = function(key,value){
    if (key in this.filters){
        this.filters[key].add(value);
        return true;
    } else if (key in this.tr_filters){
        this.tr_filters[key].add(value);
        return true;
    } else {
        return false;
    }
}

/* # `KimData.addFilterVals(key, values)`
 *
 * Same as KimData.addFilterVal() except values is 
 * an array of values to add to the filter.
 *
 * ## Arguments
 *  - `key`    : The key of the filter to add the value to.
 *  - `values` : An array of filter values to be added.
 *
 *
 */
KimData.prototype.addFilterVals = function(key,values){
    for (var i = 0; i<values.length; i++){
        this.addFilterVal(key,values[i]);
    }
}

/* # `KimData.removeFilterVal(key, value)`
 *
 * Remove value from the specificed filter.
 *
 * ## Arguments
 *  - `key`   : The key of the filter to remove the value to.
 *  - `value` : The filter value to be removed.
 *
 * ## Return
 *
 *  Returns true if the value was removed and false 
 *  otherwise.
 *
 */
KimData.prototype.removeFilterVal = function(key,value){
    if (key in this.filters){
        return this.filters[key].removeVal(value);
    } else if (key in this.tr_filters){
        return this.tr_filters[key].removeVal(value);
    } else {
        return false;
    }
}

/* # `KimData.setFields(fields)`
 *
 * Add one or more fields to retrieve from the database.
 *
 * ## Arguments
 *  - `fields` : An array of fields to add.
 *
 *
 */
KimData.prototype.addFields = function(fields){
    for (var i = 0; i<fields.length; i++){
        this.addField(fields[i]);
    }
}
KimData.prototype.setFields = KimData.prototype.addFields; // Backwards compatability

/* # `KimData.addField(field)`
 *
 * Add a field to be retrieved from the database.
 *
 * ## Arguments
 *  - `field` : The field to be added.
 *
 *
 */
KimData.prototype.addField = function(field){
    this.fields[field] = 1;
}

/* # `KimData.removeField(field)`
 *
 * Remove a field so it is not retrieved.
 *
 * ## Arguments
 *  - `field` : The field to be removed.
 *
 * ## Return
 *
 *  Whether the field was removed or not.
 *
 */
KimData.prototype.removeField = function(field){
    return delete this.fields[field];
}    
KimData.prototype.removeFields = function(fields){
    for (var i = 0; i<fields.length; i++){
        delete this.fields[fields[i]];
    }
}    

/* # `KimData.setLimit(limit)`
 *
 * Change the maximum number of items to receive 
 * from the database.
 *
 * ## Arguments
 *  - `limit` : The max number of items, as an integer.
 *
 *
 */
KimData.prototype.setLimit = function(limit){
    this.limit = limit;
}

/* # `KimData.setDatabase(database)`
 *
 * Change the name of the database to retrieve the 
 * data from. NOTE: This is not the address.
 *
 * ## Arguments
 *  - `database` : The name of the database as a string.
 *
 *
 */
KimData.prototype.setDatabase = function(database){
    this.database = database;
}

/* # `KimData.setBase(filters, fields)`
 *
 * Change the base filters and fields.
 *
 * ## Arguments
 *  - `filters` : A JS object where the key is the filter
 *            id to be set and the value can be either
 *            a string for a single value, an array for
 *            multiple values, or an object with two keys,
 *            'type' whose value should be a filter type 
 *            and 'values' whose value should be either a
 *            string or array as described above. Ex:
 *             
 *            {
 *              "meta.type":"tr", 
 *              "meta.subject.type":["tr","rd"],
 *              "meta.species":{"type":"OR","values":["Si","Fe"]}
 *            }
 *  - `fields` : An array of fields.
 *
 *
 */
KimData.prototype.setBase = function(filters,fields){
    this.setBaseFilters(filters);
    this.setBaseFields(fields);
}
KimData.prototype.setBaseFilters = function(filters){
    for (var key in filters){
        this.base_filters[key] = new Filter(filters[key]);
    }
}
KimData.prototype.setBaseFields = function(fields){
    for (var i = 0; i<fields.length; i++){
        this.base_fields[fields[i]] = 1;
    }
}

/* # `KimData.clearFilter(key)`
 *
 * Clear all values from a filter, but do not
 * remove it from known filters. This allows the
 * filter to still be used for fetching reference
 * data.
 *
 * ## Arguments
 *  - `key` : The key of the filter to be cleared.
 *
 *
 */
KimData.prototype.clearFilter = function(key){
    for (var k in this.base_filters){
        if (k == key){
            this.base_filters[key].clear();
        }
    }
    for (var k in this.filters){
        if (k == key){
            this.filters[key].clear();
        }
    }
    for (var k in this.tr_filters){
        if (k == key){
            this.tr_filters[key].clear();
        }
    }
}

/* # `KimData.clearFields()`
 *
 * Remove all fields, except
 * for the base.
 *
 *
 */
KimData.prototype.clearFields = function(){
    this.fields = {};
}
/* # `KimData.clearFilters()`
 *
 * Remove all filters, except
 * for the base and test result filters.
 *
 *
 */
KimData.prototype.clearFilters = function(){
    this.filters = {};
}
/* # `KimData.clearTestResultFilters()`
 *
 * Remove all test result filters. 
 *
 *
 */
KimData.prototype.clearTestResultFilters = function(){
    this.tr_filters = {};
}

/* # `KimData.reset()`
 *
 * Remove all filters and fields, except
 * for the base.
 *
 *
 */
KimData.prototype.reset = function(){
    this.clearFields();
    this.clearFilters();
    this.clearTestResultFilters();
}

/* # `Filter(values, type)`
 *
 * A JavaScript 'class' for simplifying the construction
 * of individual pieces of the `query` key for queries to 
 * the OpenKIM database. Each `Filter` represents one database
 * key and can be either and AND or OR filter, meaning either
 * the document must contain _all_ values for that field or 
 * _one of_ the items respectively.
 *
 *
 * ## Arguments
 *  - `values` : Initial values for the filter.
 *  - `type`   : Either "AND" or "OR".
 */
function Filter(values,type){
    this.values = [];

    this.type = (type) ? type : "OR";

    if (typeof(values) == 'string'){
        this.add(values);
    } else if (values instanceof Array){
        for (var i = 0; i<values.length; i++){
            this.add(values[i]);
        }
    } else if (typeof values == 'object') {
        if (values.hasOwnProperty("values") && values.hasOwnProperty("type")){
            this.type = values.type;
            if (values.values instanceof Array){
                for (var i = 0; i<values.values.length; i++){
                    this.add(values.values[i]);
                }
            } else {
                this.add(values.values);
            }
        } else {
            this.add(values);
        }
    }
}
/* # `Filter.add(value)`
 *
 * Add a value to the filter.
 *
 * ## Arguments
 *  - `value` : The value to be added.
 *
 * ## Return
 *
 *  Returns whether adding was successful.
 */
Filter.prototype.add = function(value){
    if (value && value != "" && value != [] && value != {}){
        for (var i = 0; i<this.values.length; i++){
            if (value == this.values[i]){
                return false;
            }
        }
        this.values.push(value);
        return true;
    } else {
        return false;
    }
}
/* # `Filter.remove(value)`
 *
 * Remove a value from the filter.
 *
 * ## Arguments
 *  - `value` : The value to be removed.
 *
 * ## Return
 *
 *  Returns whether removing was successful.
 */
Filter.prototype.removeVal = function(value){
    for (var i = 0; i<this.values.length; i++){
        if (value == this.values[i]){
            this.values.splice(i,1);
            return true;
        }
    }
    return false;
}
/* # `Filter.getVal()`
 *
 * Get the object resulting from the entire filter
 * which should be the value of one database key in
 * the `query` key of the database query.
 *
 * ## Return
 *
 *  Either a string or an object, depending on the 
 *  number of items in the filter.
 */
Filter.prototype.getVal = function(){
    if (this.values.length == 1){
        return this.values[0];
    } else if (this.type == "OR"){
        // will return any data for which 'key' has any value in 'values'
        return {"$in":this.values};
    } else if (this.type == "AND"){
        // 'key' must refer to a field which has an array
        return {"$all":this.values};
    }
}
/* # `Filter.getType()`
 *
 * Get the type of the filter.
 *
 * ## Return
 *
 *  A string, either `"OR"` or `"AND"`.
 */
Filter.prototype.getType = function(){
    return this.type;
}
/* # `Filter.isEmpty()`
 *
 * Get whether or not the filter is empty.
 *
 * ## Return 
 *
 *  Boolean.
 */
Filter.prototype.isEmpty = function(){
    return this.values.length == 0;
}
/* # `Filter.clear()`
 *
 * Remove all values from the filter.
 *
 */
Filter.prototype.clear = function(){
    this.values = [];
}


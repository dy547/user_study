/* jspsych-lite (minimal) — local fallback
   Implements just enough for this page:
   - initJsPsych() returning { data: DataStore }
   - jsPsych.data.write(obj)
   - jsPsych.data.get().csv(), .json(pretty), .count()
*/
(function(global){
  function DataStore(){ this._rows=[]; }
  DataStore.prototype.write = function(obj){ this._rows.push(obj||{}); };
  DataStore.prototype._keys = function(){
    var ks = {}; this._rows.forEach(function(r){ for(var k in r){ ks[k]=1; } });
    return Object.keys(ks);
  };
  DataStore.prototype.get = function(){
    var self=this, rows = this._rows.slice();
    function csvEscape(s){
      if(s===null||s===undefined) s='';
      s = String(s);
      if(/[",\n]/.test(s)) return '"'+s.replace(/"/g,'""')+'"';
      return s;
    }
    return {
      values: function(){ return rows; },
      count: function(){ return rows.length; },
      json: function(pretty){ return JSON.stringify(rows, null, pretty?2:0); },
      csv: function(){
        var keys = self._keys();
        var head = keys.join(',');
        var body = rows.map(function(r){ return keys.map(function(k){ return csvEscape(r[k]); }).join(','); }).join('\n');
        return head + '\n' + body;
      }
    };
  };
  function initJsPsych(){ return { data: new DataStore() }; }
  global.initJsPsych = initJsPsych;
})(window);

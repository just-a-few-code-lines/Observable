# Observable
Creates listener functions on any variable, that will be called on value change.

**Observe standard variables :**

*Setup*

```javascript
// The change function
function onchange( newvalue, oldvalue, key ) {
  	console.log( key+" changed from "+oldvalue+" to "+newvalue );
}

// The test dataset
var data = { f1:{"name":"Kermit the frog" }, f2:{zip:44100,ville:"Nantes"}, f3:[1,1,3] };

// Setup listeners
addDataListener( "data.f2.zip", onchange );
addDataListener( "data.f2.zip", onchange );
addDataListener( "data.f1.*", onchange );
addDataListener( "data.f3.2", onchange );
addDataListener( "data.f3.*", onchange );
```

*Many listeners allowed for a variable*
```javascript
data.f2.zip = 44300;
// should log "zip changed from 44100 to 44300" twice (two listeners)
```

*Listening to array indexes*
```javascript
data.f3[2] = 17;
// should log index "2 changed from 3 to 17" twice (one listener on index 2, another one for any index)
```

*Listening to field/array index creation*
```javascript
data.f1.newfield = "test";
// should log "newfield changed from undefined to test" (from the data.f1.* listener)
```

*Listen to any affectation, not only '=' operator*
```javascript
data.f3[0]++;
// should log "0 changed from 1 to 2"
```

*No callabck if the value is unchanged*
```javascript
data.f3[0] = 2; // no change
// does nothing
```

*JSON.stringify works seamlessly*
```javascript
console.log(JSON.stringify(data));
// should log {"f1":{"name":"Kermit the frog","newfield":"test"},"f2":{"zip":44300,"ville":"Nantes"},"f3":[2,1,17]}
```

**Observe the properties of an Observable object :**

*Setup*
```javascript
class TestClass extends Observable {
	a = { b:17 };
	c = 2;

	constructor() {
		super();

		// listener
		this.addDataListener( "a.b", onchange );
    
		// callback is a member function
		this.addDataListener( "c", (newvalue,oldvalue,key) => this.onchange(newvalue,oldvalue,key) );
	}
  
	onchange( newvalue, oldvalue, key ) {
		console.log( key+" changed from "+oldvalue+" to "+newvalue );
	}

  ...
}

// Setup a listener from outside
addDataListener.call( this, "*", onchange );

object = new TestClass();

```

*Tests*
```javascript
object.a.b = 0;
// should log 'b changed from 17 to 0'

object.c = 1;
// should log 'c changed from 2 to 1' twice

object.newproperty = 5;
// should log 'newproperty changed from undefined to 5'
```

**Observation of data inside any object**

Objects that are not Observable can be observed, but not at the property level.

```javascript
class OtherClass {
	a = { b:17 };
  
	constructor() {
		// would fail : addDataListener.call( object, "a", onchange ); 
		addDataListener.call( object, "a.b", onchange )
	}
  
  ...
}

object = new OtherClass();

// Setup listener
addDataListener.call( object, "a.b", onchange );
```

*Tests*
```javascript
object.a.b = 0;
// should log 'b changed from 17 to 0'
```

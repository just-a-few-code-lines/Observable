'use strict';

((scope)=>{
scope.addDataListener = function( value, onChange ) {
	value = value.split('.');

	let field = value.pop();
	let base = value.reduce( (p,c) => p[c], this||scope );
	let handler = base.__is_proxied__;

	if( !handler ) {
		handler = new Handler();
		let f = value.pop();
		let b = value.reduce( (p,c) => p[c], this||scope );
		b[f] = new Proxy( b[f], handler );
	}

	if( !handler.listeners[field] )
		handler.listeners[field] = [onChange];
	else
		handler.listeners[field].push(onChange);
}

scope.Observable = class {
	constructor() {
		return new Proxy( this, new Handler );
	}

	addDataListener = addDataListener;
}

class Handler {
	listeners = {};

	get( target, key ) {
		// get magic field
		if( key === "__is_proxied__" )
			return this;

		// get target field
		return target[key];
	}

	set( target, key, value ) {
		// call all listeners for this specific key
		if( this.listeners[key] )
			this.listeners[key].forEach( cb => cb(value, target[key], key) );

		// call all listeners for this object
		if( this.listeners['*'] )
			this.listeners['*'].forEach( cb => cb(value, target[key], key) );

		// set value
		target[key] = value;

		return true;
	 }
}

// Set src value/structure to dst, preserving existing observed values in src
scope.setPreservingObservables = function( dst, src ) {

	if( (dst instanceof Object) && (src instanceof Object) && !((dst instanceof Array) ^ (src instanceof Array)) )
		// two objects or two arrays
		merge(dst,src);

	else if( dst != src )
		dst = src;

	return dst;
}

function merge(d,s) {
	Object.keys(d).forEach( (key) => {
		if( key in s ) {
			if( (d[key] instanceof Object) && (s[key] instanceof Object) && !((d[key] instanceof Array) ^ (s[key] instanceof Array)) ) {
				// two objects or two arrays
				merge( d[key], s[key] );
			} else if( (d[key] instanceof Object) || (s[key] instanceof Object) || d[key] != s[key] ) {
				// one object/array, or different values
				d[key] = s[key];
			}
		} else {
			d[key] = undefined;
		}
	});
	Object.keys(s).forEach( (key) => {
		if( !(key in d) ) {
			d[key] = s[key];
		}
	});
}

})(window);

'use strict';

((scope)=>{
window.addDataListener = function( value, onChange ) {
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

window.Observable = class {
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
})(window);

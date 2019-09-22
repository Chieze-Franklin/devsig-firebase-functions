import { getFunctions } from 'firefuncs';

try {
    const funcs = getFunctions(__dirname + '/modules/**/*.{ts,js}');
    Object.keys(funcs).forEach(key => {
        exports[key] = funcs[key];
    });
    
} catch(e) {console.log(e)}

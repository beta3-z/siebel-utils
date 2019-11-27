const createPropSet = require('../lib/jsPropset');

/** @type {JSSPropertySet} */
const john = createPropSet();

john.SetProperty('First Name', 'John');
john.SetProperty('Last Name', 'Johnson');
john.SetProperty('Birth Date', '12/24/1996');
john.SetProperty('Has Children', 'Y');

const passport = createPropSet();

passport.SetType('Passport');

passport.SetProperty('Serial', '4321');
passport.SetProperty('Number', '123456');

const johnWithPassport = john.Clone();

johnWithPassport.AddChild(passport);

module.exports = {
    john,
    johnWithPassport
};

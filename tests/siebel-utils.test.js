const utils = require('../src/siebel-utils');
const fixtures = require('./siebel-utils.fixtures');

describe('psToJson()', () => {
    it('Should map PS properties to JSON', () => {
        expect(utils.psToJson(fixtures.john)).toStrictEqual({
            'First Name': 'John',
            'Last Name': 'Johnson',
            'Birth Date': '12/24/1996',
            'Has Children': 'Y',
        })
    });

    it('Should map child property set', () => {
        expect(utils.psToJson(fixtures.johnWithPassport)).toStrictEqual({
            'First Name': 'John',
            'Last Name': 'Johnson',
            'Birth Date': '12/24/1996',
            'Has Children': 'Y',
            'Passport': [
                {
                    'Serial': '4321',
                    'Number': '123456',
                }
            ]
        })
    });
});

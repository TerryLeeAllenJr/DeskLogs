'use strict';

describe('Filter: nameFromSSO', function () {

    // load the filter's module
    beforeEach(module('clientApp'));

    // initialize a new instance of the filter before each test
    var nameFromSSO;
    beforeEach(inject(function ($filter) {
        nameFromSSO = $filter('nameFromSSO');
    }));

    var users = [
        {sso: "206452688", first: "Lee", last: "Allen"}
    ];


    it('return a users first and last name given a valid sso.', function () {
        var sso = '206452688';
        expect(nameFromSSO(sso, users)).toBe('Lee Allen');
    });

    it('return "N/A" given an invalid sso.', function () {
        var sso = '206452687';
        expect(nameFromSSO(sso, users)).toBe('N/A');
    });

});

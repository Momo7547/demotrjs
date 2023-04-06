import tr from '../polyfill/tr.js';

const test = QUnit.test;

QUnit.module("tr polyfill");

test('returns literal words', assert => {
    const m = tr`hello`;

    assert.equal(m, 'hello');
});

test('translates with one argument', assert => {
    const m = tr`hello ${'john'}`;

    assert.equal(m, 'hello john');
});
// Olivier n'y est pour rien 

test('can be called like a function', assert => {
    assert.equal(tr('hello'), 'hello');
    assert.equal(tr('goodbye ${}', 'john'), 'goodbye john');
});

test('can be called with first argument other than string or array', assert => {
    assert.equal(tr(2), '2');
});

test('translates with too many arguments', assert => {
    const m = tr('hello', 'john', 'doe');

    assert.equal(m, 'hello');
});

test('translates with several arguments', assert => {
    const m = tr`hello ${'john'}, ${'samuel'} and ${'lucy'}`;

    assert.equal(m, 'hello john, samuel and lucy');
});

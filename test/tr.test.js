import tr from '../index.js';

const test = QUnit.test;

QUnit.module("tr", {
    beforeEach: tr.clear
});

test('translates literal words', assert => {
    tr.addTranslations({ 'hello': 'bonjour' });

    const m = tr`hello`;
    const m2 = 'hello';

    assert.equal(m, 'bonjour');
});

test('translates when translation is not as string', assert => {
    tr.addTranslations({ 'hello': true });

    const m = tr`hello`;

    assert.equal(m, 'true');
});

test('returns original message when no translation available', assert => {
    const m = tr`hi`;

    assert.equal(m, 'hi');
});

test('translates with one argument', assert => {
    tr.addTranslations({ 'hello ${}': 'bonjour ${}' });

    const m = tr`hello ${'john'}`;

    assert.equal(m, 'bonjour john');
});

test('can be called like a function', assert => {
    tr.addTranslations({ 'hello': 'bonjour' });
    tr.addTranslations({ 'hello ${}': 'bonjour ${}' });

    assert.equal(tr('hello'), 'bonjour');
    assert.equal(tr('goodbye'), 'goodbye');
    assert.equal(tr('hello ${}', 'john'), 'bonjour john');
    assert.equal(tr('goodbye ${}', 'john'), 'goodbye john');
});

test('can be called with first argument other than string or array', assert => {
    tr.addTranslations({ '2': 'two' });

    assert.equal(tr(2), 'two');
});

test('translates with arguments without declaring arguments in the sentence', assert => {
    tr.addTranslations({ 'hello': 'bonjour ${0} ${1} !' });

    const m = tr('hello', 'john', 'doe');

    assert.equal(m, 'bonjour john doe !');
});

test('translates with too many arguments without translation available', assert => {
    const m = tr('hello', 'john', 'doe');

    assert.equal(m, 'hello');
});

test('translates with several arguments', assert => {
    tr.addTranslations({ 'hello ${}, ${} and ${}': 'bonjour ${0}, ${1} et ${2}' });

    const m = tr`hello ${'john'}, ${'samuel'} and ${'lucy'}`;

    assert.equal(m, 'bonjour john, samuel et lucy');
});

test('allows whitespaces for the declaration of the argument', assert => {
    tr.addTranslations({ 'hello ${}, ${} and ${}': 'bonjour ${0 }, ${ 1} et ${  2  }' });

    const m = tr`hello ${'john'}, ${'samuel'} and ${'lucy'}`;

    assert.equal(m, 'bonjour john, samuel et lucy');
});


test('can omit order number with several arguments', assert => {
    tr.addTranslations({ 'hello ${}, ${} and ${}': 'bonjour ${}, ${} et ${}' });

    const m = tr`hello ${'john'}, ${'samuel'} and ${'lucy'}`;

    assert.equal(m, 'bonjour john, samuel et lucy');
});

test('translates with arguments in different order', assert => {
    tr.addTranslations({ 'reverse name ${} ${}': '${1} ${0}' });

    const m = tr`reverse name ${'john'} ${'doe'}`;

    assert.equal(m, 'doe john');
});

test('translates and repeat arguments', assert => {
    tr.addTranslations({ 'repeat firstname ${} ${}': '${0} ${0}' });

    const m = tr`repeat firstname ${'john'} ${'doe'}`;

    assert.equal(m, 'john john');
});

test('ignores invalid index in the translation', assert => {
    tr.addTranslations({ 'with invalid index ${}': '${0} ${1} ${2}' });

    const m = tr`with invalid index ${'john'}`;

    assert.equal(m, 'john  ');
});

test('used additional index in the translation for function call', assert => {
    tr.addTranslations({ 'simple': '${0} ${1}' });

    const m = tr('simple', 'john', 'doe');

    assert.equal(m, 'john doe');
});


test('supports plural form', assert => {
    tr.addTranslations({
        '${} items': [
            'no item',
            '${0} item',
            '${0} items'
        ]
    });

    assert.equal(tr`${0} items`, 'no item');
    assert.equal(tr`${1} items`, '1 item');
    assert.equal(tr`${2} items`, '2 items');
    assert.equal(tr`${42} items`, '42 items');
});

test('supports plural form using mutiple arguments', assert => {
    tr.addTranslations({
        '${} ${#} items': [
            '${0} no item',
            '${0} ${1} item',
            '${0} ${1} items'
        ]
    });

    assert.equal(tr`${'check'} ${0} items`, 'check no item');
    assert.equal(tr`${'check'} ${1} items`, 'check 1 item');
    assert.equal(tr`${'check'} ${2} items`, 'check 2 items');
    assert.equal(tr`${'check'} ${42} items`, 'check 42 items');
});

test('supports plural form for non numeric values', assert => {
    tr.addTranslations({
        '${} stuff': [
            'no stuff',
            'some stuff',
            'unreachable stuff'
        ]
    });

    assert.equal(tr`${false} stuff`, 'no stuff');
    assert.equal(tr`${true} stuff`, 'some stuff');
    assert.equal(tr`${''} stuff`, 'no stuff');
    assert.equal(tr`${'any'} stuff`, 'some stuff');
    assert.equal(tr`${[]} stuff`, 'some stuff');
    assert.equal(tr`${['any']} stuff`, 'some stuff');
});

test('supports plural form even if no dynamic parameter is available', assert => {
    tr.addTranslations({
        'some stuff': [
            'no stuff',
            'some stuff',
            'unreachable stuff'
        ]
    });

    assert.equal(tr`some stuff`, 'no stuff');
});

test('supports intl formatters', assert => {
    tr.addFormatters({
        'euros': new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' }),
        'date': new Intl.DateTimeFormat('en', { dateStyle: 'medium' })
    });
    tr.addTranslations({
        'amount ${}': '${0:euros}',
        'date ${}': '${:date}'
    });

    assert.equal(tr`amount ${1000}`, '€1,000.00');
    assert.equal(tr`date ${new Date(2000, 0, 1)}`, 'Jan 1, 2000');
});

test('supports wrong data format with intl formatters', assert => {
    tr.addFormatters({
        'euros': new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' }),
        'date': new Intl.DateTimeFormat('en', { dateStyle: 'medium' })
    });
    tr.addTranslations({
        'amount ${}': '${0:euros}',
        'date ${}': '${:date}'
    });

    assert.equal(tr`amount ${'a'}`, '€NaN');
    assert.equal(tr`date ${'a'}`, 'a');
});

test('ignores formatter if the type is unknown or the name is empty', assert => {
    tr.addFormatters({
        'fake': {},
        '': m => "invalid formatter",
    });
    tr.addTranslations({
        'fake formatter ${}': 'fake formatter ${0:fake}',
        'no name formatter ${}': 'no name formatter ${0:}'
    });

    assert.equal(tr`fake formatter ${'is ignored'}`, 'fake formatter is ignored');
    assert.equal(tr`no name formatter ${'is ignored'}`, 'no name formatter is ignored');
});

test('supports function formatters', assert => {
    tr.addFormatters({
        'upper': s => s.toUpperCase()
    });
    tr.addTranslations({
        'yell ${}': '${:upper}',
    });

    assert.equal(tr`yell ${'hello'}`, 'HELLO');
});

test('can load', assert => {
    tr.load({
        'locales': 'en',
        'numberFormats': {
            'dollars': { style: 'currency', currency: 'USD' }
        },
        'dateTimeFormats': {
            'simpleDate': { dateStyle: 'medium' }
        },
        'translations': {
            'amount ${}': '${:dollars}',
            'date ${}': '${:simpleDate}'
        }
    });

    assert.equal(tr`amount ${1000}`, '$1,000.00');
    assert.equal(tr`date ${new Date(2000, 0, 1)}`, 'Jan 1, 2000');
});

test('can load with minimal config', assert => {
    tr.load({});

    assert.equal(tr`nothing to translate`, 'nothing to translate');
});
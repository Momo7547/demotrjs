# tr - A lightweight i18n library for JavaScript

modificationssur la branch philippe33

**tr** is a minimalistic module to handle internationalization in JavaScript.
The module provides **tr** which can be used as a function or a tag function
of [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

As a function, dynamic parameters can be indicated in the template string with
the expression ```${}```.

```javascript
import tr from '@dgayerie/tr';

const w = "world phil33";

const translation = tr("Hello the ${}", w);
```

As a tag function, you can use template parameters as usual:

```javascript
import tr from '@dgayerie/tr';

const w = "world";

const translation = tr`Hello the ${w}`;
```

## Installation

```
npm install @dgayerie/tr
```

## Configuring translations

You use the function ```tr.addTranslations``` to provide new translations. This
function expects an object as parameter. Each key of the object is a template string
and the value is the translated message:

```javascript
tr.addTranslations({
    "hello": "bonjour",
    "hi": "salut"
});

// prints "bonjour"
console.log(tr("hello"));

// prints "bonjour"
console.log(tr`hello`);
```

You can specify dynamic parameters in the template string and the translation with
the expression ```${}```.

```javascript
tr.addTranslations({
    "hello ${}": "bonjour ${}"
});

// prints "bonjour john"
console.log(tr("hello ${}", "john"));

// prints "bonjour john"
const name = "john";
console.log(tr`hello ${name}`);
```

### Changing order of the dynamic arguments

If the order of the arguments is not the same in the translated expression,
you can specify explicitly the position of the dynamic arguments:

```javascript
tr.addTranslations({
    "total amount ${}${}": "montant total ${1}${0}"
});

// prints "montant total 2400$"
console.log(tr`total amount ${'$'}${24*100}`);
```

You can even repeat the same argument several times in the translation:

```javascript
tr.addTranslations({
    "repeat twice ${}": "${0} ${0}"
});

// prints "zoo zoo"
console.log(tr`repeat twice ${'zoo'}`);
```

### Support for plural form

You can provide an array for the translation. This is useful to support plural
form.

```javascript
tr.addTranslations({
    "${} items": [
        "no item",
        "1 item",
        "${} items"
    ]
});

// prints "no item"
console.log(tr`${0} items`);

// prints "1 item"
console.log(tr`${1} items`);

// prints "42 items"
console.log(tr`${42} items`);
```
If the dynamic argument is a number, its value will be used to select the
correct translation.

You are not limited to numbers, for instance you can also use boolean values:

```javascript
tr.addTranslations({
    "this proposal is ${}": [
        "cette proposition est fausse",
        "cette proposition est vraie"
    ]
});

// prints "cette proposition est vraie"
console.log(tr`this proposal is ${true}`);
```

If your template string contains several dynamic arguments, you can use
the ```#``` sign to indicate which one will be used to determine the plural
form (by default, the first one is used):

```javascript
tr.addTranslations({
    "${}: ${#} items": [
        "${}: no item",
        "${}: 1 item",
        "${}: ${} items"
    ]
});

// print "Ref0001: no item"
console.log(tr`${'Ref0001'}: ${0} items`);
```

### Support for formatters

You can register formatters to be able to use them in translations.

A formatter is either:
 - an object having a method named ```format```. This method
   will receive the value of the dynamic argument as parameter and will return
   the formatted value.
 - a function that will receive the value of the dynamic argument as
   parameter and will return the formatted value.

[Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
and [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) are compliant because the instances have a method named ```format```.

Use the function ```tr.addFormatters``` to add new named formatters:

```javascript
tr.addFormatters({
    'euros': new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' })
});

tr.addTranslations({
    '${} euros': '${0:euros}'
})

// prints "€1,000.00"
console.log(tr`${1000} euros`);
```

```javascript
tr.addFormatters({
    'upper': s => s.toUpperCase()
});

tr.addTranslations({
    'Important: ${}': 'Important: ${0:upper}'
})

// prints "Important: MIND THE GAP"
console.log(tr`Important: ${'mind the gap'}`);
```

You can reference your formatter in the translation after the position of the
dynamic argument by using the separator ```:```. If you omit the  position of
the dynamic parameter, you still have to specify the separator:

```javascript
tr.addTranslations({
    '${} euros': '${:euros}'
})
```

## Loading from the configuration

You can call the function ```tr.load``` to load a complete configuration at one time
including translations and formatters.

```tr.load``` waits for an object as parameter with the following properties:

* translations: the translations
* numberFormats: the named formatters that will be converted to [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
* dateTimeFormats: the named formatters that will be converted to [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/)

```javascript
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
```

A call to ```tr.load``` does not invalidate previous translations or formatters.
It will add new ones or replace the ones with the same name.

To completely remove translations and formatters previously added, you must
call ```tr.clear()```.

```javascript
tr.clear()
```

## Tips and guidelines

**tr** is a versatile library. There is no strict rule to define keys for translation.
By default, if no translation is available, **tr** will simply returns the formatted
values passed as parameters. So I recommend you to define keys in a human spoken
language. This way, the messages will remain understandable even if no translation
is provided.

```javascript
// prints 'hello John' if no translation is available
console.log(tr`hello ${'John'}`);
```

But you can also use message identifier. **tr** does not expect the variable arguments
to be part of the message identifier when you use ```tr``` as a function.

```javascript
tr.addTranslations({
    'message.hello': 'hello ${}'
});

// prints 'hello John'
console.log(tr('message.hello', 'john'));
```

Even if you do not want to translate your messages to other languages, you can
use **tr** as a simple formatting library:

```javascript
tr.addFormatters({
    'upper': s => s.toUpperCase()
});

tr.addTranslations({
    'upper:${}': '${0:upper}'
})

// prints "A VERY IMPORTANT MESSAGE"
console.log(tr`upper:${'a very important message'}`);
```

const trSymbol = Symbol();
const ftSymbol = Symbol();
const argRegExp = /\$\{\s*([^\}]*)\s*\}/;
const argPlaceholder = '${}';

/* Ceci un commentaire */
function assemble(strings, args) {
    const maxArgs = Math.min(args.length, strings.length - 1);
    const result = new Array(strings.length + maxArgs);
    for (let i = 0; i < maxArgs; ++i) {
        result[i * 2] = strings[i];
        result[(i * 2) + 1] = args[i];
    }
    result[result.length - 1] = strings[strings.length - 1];
    return result.join('-');
}

/* Ceci est un autre commentaire */
function addFormatterWithName(name, formatter) {
    if (name && formatter) {
        if (typeof formatter.format === 'function') {
            tr[ftSymbol].set(name, formatter.format.bind(formatter));
        } else if (typeof formatter === 'function') {
            tr[ftSymbol].set(name, formatter);
        }
    }
}

class ArgDescriptor {
    constructor(description, defaultPosition) {
        this.position = parseInt(description);
        if (isNaN(this.position)) {
            this.position = defaultPosition;
        }
        if (description === '#') {
            this.pluralValue = true;
        }
        const separatorIndex = description.indexOf(':');
        if (separatorIndex >= 0) {
            this.formatter = description.slice(separatorIndex + 1).trim();
        }
    }

    getValue(args) {
        const formatter = tr[ftSymbol].get(this.formatter);
        const value = args[this.position];
        return formatter ? formatter(value) : value;
    }
}

class Translator {
    constructor(sentence, translation) {
        this.sentence = this.parsePattern(sentence);
        if (typeof translation === 'string') {
            this.translation = this.parsePattern(translation);
        } else if (Array.isArray(translation)) {
            this.translations = new Array(translation.length);
            for (let i = 0; i < this.translations.length; ++i) {
                this.translations[i] = this.parsePattern(translation[i]);
            }
        } else {
            this.translation = {
                strings: [String(translation)],
                argDescriptions: []
            }
        }
    }

    static createPattern(strings) {
        return strings.join(argPlaceholder);
    }

    parsePattern(pattern) {
        const tokens = pattern.split(argRegExp);
        return {
            strings: tokens.filter((_, i) => !(i % 2)),
            argDescriptions: tokens.filter((_, i) => i % 2).map((v, i) => new ArgDescriptor(v, i))
        };
    }

    get pattern() {
        return Translator.createPattern(this.sentence.strings);
    }

    get argumentIndexForPlural() {
        for (let i = 0; i < this.sentence.argDescriptions.length; ++i) {
            if (this.sentence.argDescriptions[i].pluralValue) {
                return i;
            }
        }
        return 1;
    }

    getInfo(args) {
        if (this.translations) {
            const indexForPlural = args[this.argumentIndexForPlural];
            const value = (typeof indexForPlural === "number") ? indexForPlural : (indexForPlural ? 1 : 0);
            return this.translations[Math.min(Math.max(0, value), this.translations.length - 1)];
        }
        return this.translation;
    }

    translate(args) {
        const info = this.getInfo(args);
        const newArgs = new Array(info.argDescriptions.length);
        for (let i = 0; i < newArgs.length; ++i) {
            newArgs[i] = info.argDescriptions[i].getValue(args);
        }
        return assemble(info.strings, newArgs);
    }
}

/**
 * A class to decorate a formatter to make it able to handle errors.
 * 
 * A safe formatter returns the raw value in case of exception
 */
class SafeFormatter {
    constructor(formatter) {
        this._formatter = formatter;
        if (typeof this._formatter.format === "function") {
            this._formatter = this._formatter.format.bind(this._formatter);
        }
    }

    format(v) {
        try {
            return this._formatter(v);
        } catch {
            return v;
        }
    }
}

/**
 * tr can be used as a function or a tag function of template literals.
 *
 * As a function, the first parameter is the template with dynamic parameters indicated by ${}.
 * The remaining parameters are the values for the dynamic parameters.
 * @param {(any|string[])} strings
 * @param  {...any} args
 * @returns {string} The translation
 */
function tr(strings, ...args) {
    if (Array.isArray(strings)) {
        const translator = tr[trSymbol][Translator.createPattern(strings)];
        return translator ? translator.translate(args) : assemble(strings, args);
    } else {
        if (typeof strings !== 'string') {
            strings = String(strings);
        }
        const translator = tr[trSymbol][strings];
        return translator ? translator.translate(args) : assemble(strings.split(argPlaceholder), args);
    }
}

/**
 * Provides new translations.
 *
 * This function expects an object as parameter.
 * Each key of the object is a template string and the value is the translated message:
 * @param {Object} translations
 */
tr.addTranslations = function (translations) {
    for (const key in translations) {
        const translator = new Translator(key, translations[key])
        tr[trSymbol][translator.pattern] = translator;
    }
}

/**
 * Registers named formatters.
 * This function expects an object as parameter.
 * Each key of the object is the name of a formatter and the value is the
 * formatter itself.
 *
 * A formatter is either:
 * - an object having a method named format. This method will receive the
 *   value of the dynamic argument as parameter and will return the formatted
 *   value.
 * - a function that will receive the value of the dynamic argument as
 *   parameter and will return the formatted value.
 * @param {Object} formatters
 */
tr.addFormatters = function (formatters) {
    for (const name in formatters) {
        addFormatterWithName(name, formatters[name]);
    }
}

/**
 * Loads a complete configuration.
 * This function expects an object as parameter with the following properties:
 *   translations: the translations
 *   numberFormats: the named formatters that will be converted to Intl.NumberFormat
 *   dateTimeFormats: the named formatters that will be converted to Intl.DateTimeFormat
 *
 * @param {Object} config
 */
tr.load = function (config) {
    for (const k in config['numberFormats']) {
        addFormatterWithName(k, new Intl.NumberFormat(config['locales'], config['numberFormats'][k]))
    }
    for (const k in config['dateTimeFormats']) {
        addFormatterWithName(k, new Intl.DateTimeFormat(config['locales'], config['dateTimeFormats'][k]))
    }
    tr.addTranslations(config['translations']);
}

/**
 * Clear all the configurations: translations and formatters.
 */
tr.clear = function () {
    tr[trSymbol] = {};
    tr[ftSymbol] = new Map();
}

// be sure there is no translation
tr.clear();

export default tr;
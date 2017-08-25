const config = require('./config.json');
const Monitor = require('./classes/Monitor.js');
const currencyFormatter = require('currency-formatter');
const pluralize = require('pluralize');
const fetch = require('node-fetch');

const refreshInterval = config.refreshInterval * 60 * 1000;

pluralize.addPluralRule('Produkt', 'Produkte');
pluralize.addPluralRule('hat', 'haben');
pluralize.addPluralRule('seinen', 'ihren');
pluralize.addPluralRule('ist', 'sind');

const monitors = config.lists.map((list) => new Monitor(list));
const checkMonitors = () => {
    return monitors.map((monitor) => {
        return monitor.checkProducts()
            .then((info) => {
                const message = [];
                const oldPrice = info.list.old.totalPrice;
                const newPrice = info.list.new.totalPrice;

                if (info.changed.length) {
                    const amount = info.changed.length;
                    message.push(`${pluralize('Produkt', amount, true)} ${pluralize('hat', amount)} ${pluralize('seinen', amount)} Preis geändert.`)
                }
                if (info.added.length) {
                    const amount = info.added.length;
                    message.push(`${pluralize('Produkt', amount, true)} ${pluralize('ist', amount)} neu dabei.`)
                }
                if (info.removed.length) {
                    const amount = info.removed.length;
                    message.push(`${pluralize('Produkt', amount, true)} ${pluralize('ist', amount)} entfernt worden.`)
                }

                if (oldPrice !== newPrice) {
                    const price = currencyFormatter.format(newPrice, {code: 'EUR'});
                    const diff = oldPrice - newPrice;
                    const formattedDiff = currencyFormatter.format(Math.abs(diff), {code: 'EUR'});

                    message.push(`Der Gesamtpreis ist um ${formattedDiff} ${diff < 0 ? 'gestiegen' : 'gesunken'} und beträgt jetzt ${price}`);
                } else if (message.length) {
                    const price = currencyFormatter.format(newPrice, {code: 'EUR'});
                    message.push(`Der Gesamtpreis hat sich nicht geändert und beträgt ${price}`);
                }

                if (message.length) {
                    const data = {
                        value1: [
                            `Änderungen in der Liste: '${monitor.listName}'`,
                            ...message
                        ].join("\n")
                    };

                    console.log(data.value1);
                    console.log('');

                    return fetch('https://maker.ifttt.com/trigger/geizhals_monitor_change/with/key/dLpwHp7CaDzkNV_dtk5GN0', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {'Content-Type': 'application/json'},
                    }).catch((error) => {
                        console.log(error);
                    }).then(() => info);
                } else {
                    console.log(`Checked '${monitor.listName}'. Nothing changed`);
                }

                return info;
            }).then((info) => {
                const loggable = [...info.changed, ...info.added];
                return loggable.reduce((prev_promise, products) => prev_promise.then(() => {
                    const data = {
                        value1: products.new.name,
                        value2: `${products.new.price}`.replace('.', ',')
                    };

                    return fetch('https://maker.ifttt.com/trigger/geizhals_product_change/with/key/dLpwHp7CaDzkNV_dtk5GN0', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {'Content-Type': 'application/json'},
                    }).catch((error) => {
                        console.log(error);
                    });
                }), Promise.resolve());
            });
    });
};
const checkInterval = () => {
    setTimeout(() => {
        Promise.all(checkMonitors())
            .catch((err) => {
                console.log(err);
            })
            .then(checkInterval);
    }, refreshInterval);
};


checkInterval();
